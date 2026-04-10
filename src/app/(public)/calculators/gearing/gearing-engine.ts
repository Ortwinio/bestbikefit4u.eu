import {
  createPublicCalculatorResultEnvelope,
  type PublicFitConfidence,
  type PublicResultEnvelope,
  type PublicValidationIssue,
} from "@/lib/publicCalculatorLogic";

export type GearingDrivetrainType = "1x" | "2x";
export type GearingBikeType = "road" | "gravel" | "mtb" | "commuter";
export type GearingClimbBand = "short" | "medium" | "long" | "alpine";
export type GearingVerdict = "suitable" | "challenging" | "likely overgeared";

export type GearingCalculatorInput = {
  drivetrainType: GearingDrivetrainType;
  outerChainringTeeth?: number;
  innerChainringTeeth?: number;
  cassetteSmallestCogTeeth?: number;
  cassetteLargestCogTeeth?: number;
  wheelCircumferenceMm?: number;
  cadenceRpm?: number;
  gradientPct?: number;
  bikeType: GearingBikeType;
  climbBand: GearingClimbBand;
};

export type GearingGearMetric = {
  chainringTeeth: number;
  cogTeeth: number;
  ratio: number;
  developmentMeters: number;
  speedKmh: number;
  gearInches: number;
};

export type GearingRecommendation = {
  label: GearingVerdict;
  score: number;
  targetRatio: number;
  text: string;
};

export type GearingCalculationResult = {
  easiest: GearingGearMetric;
  hardest: GearingGearMetric;
  gearSpan: number;
  confidence: PublicFitConfidence;
  validationIssues: PublicValidationIssue[];
  recommendation: GearingRecommendation;
  resultEnvelope: PublicResultEnvelope<{
    easiestGearRatio: number;
    hardestGearRatio: number;
    easiestSpeedKmh: number;
    hardestSpeedKmh: number;
    gearSpan: number;
    verdict: GearingVerdict;
  }>;
};

export const DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE: Record<
  GearingBikeType,
  number
> = {
  road: 2105,
  gravel: 2148,
  mtb: 2282,
  commuter: 2120,
};

const MIN_CHAINRING_TEETH = 20;
const MAX_CHAINRING_TEETH = 70;
const MIN_COG_TEETH = 9;
const MAX_COG_TEETH = 54;
const MIN_WHEEL_CIRCUMFERENCE_MM = 1800;
const MAX_WHEEL_CIRCUMFERENCE_MM = 2600;
const MIN_CADENCE_RPM = 40;
const MAX_CADENCE_RPM = 130;
const MIN_GRADIENT_PCT = 0;
const MAX_GRADIENT_PCT = 25;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatRatio(value: number) {
  return value >= 10 ? value.toFixed(1) : value.toFixed(2);
}

function buildGearMetric({
  chainringTeeth,
  cogTeeth,
  wheelCircumferenceMm,
  cadenceRpm,
}: {
  chainringTeeth: number;
  cogTeeth: number;
  wheelCircumferenceMm: number;
  cadenceRpm: number;
}): GearingGearMetric {
  const ratio = chainringTeeth / cogTeeth;
  const developmentMeters = (ratio * wheelCircumferenceMm) / 1000;
  const speedKmh = (developmentMeters * cadenceRpm * 60) / 1000;
  const wheelDiameterInches = wheelCircumferenceMm / Math.PI / 25.4;
  const gearInches = wheelDiameterInches * ratio;

  return {
    chainringTeeth,
    cogTeeth,
    ratio: round(ratio, 3),
    developmentMeters: round(developmentMeters, 3),
    speedKmh: round(speedKmh, 1),
    gearInches: round(gearInches, 1),
  };
}

function targetRatioForClimb({
  gradientPct,
  climbBand,
  bikeType,
}: {
  gradientPct: number;
  climbBand: GearingClimbBand;
  bikeType: GearingBikeType;
}) {
  const gradientTarget =
    gradientPct >= 13 ? 0.8 : gradientPct >= 10 ? 0.9 : gradientPct >= 7 ? 1.0 : 1.1;
  const bandAdjustment =
    climbBand === "short" ? 0.08 : climbBand === "medium" ? 0 : climbBand === "long" ? -0.06 : -0.12;
  const bikeAdjustment =
    bikeType === "mtb" ? 0.12 : bikeType === "gravel" ? 0.08 : bikeType === "commuter" ? -0.04 : 0;

  return clamp(round(gradientTarget + bandAdjustment + bikeAdjustment, 2), 0.65, 1.35);
}

function classifyVerdict(easiestRatio: number, targetRatio: number): GearingVerdict {
  if (easiestRatio <= targetRatio - 0.08) {
    return "suitable";
  }
  if (easiestRatio <= targetRatio + 0.12) {
    return "challenging";
  }
  return "likely overgeared";
}

function buildRecommendationText({
  verdict,
  drivetrainType,
  easiestRatio,
  outerChainringTeeth,
  innerChainringTeeth,
  bikeType,
  cadenceRpm,
  gradientPct,
  isNl,
}: {
  verdict: GearingVerdict;
  drivetrainType: GearingDrivetrainType;
  easiestRatio: number;
  outerChainringTeeth: number;
  innerChainringTeeth?: number;
  bikeType: GearingBikeType;
  cadenceRpm: number;
  gradientPct: number;
  isNl: boolean;
}) {
  const ratioText = formatRatio(easiestRatio);
  const cadenceText = cadenceRpm.toFixed(0);

  if (verdict === "suitable") {
    return isNl
      ? `Je lichtste versnelling (${ratioText}x) past goed bij een klim rond ${gradientPct.toFixed(1)}%. Aan ${cadenceText} rpm krijg je een bruikbaar tempo zonder meteen te overdrijven.`
      : `Your easiest gear (${ratioText}x) matches a climb around ${gradientPct.toFixed(1)}%. At ${cadenceText} rpm, the speed stays in a practical zone without forcing the effort too hard.`;
  }

  if (verdict === "challenging") {
    const followUp =
      drivetrainType === "1x"
        ? isNl
          ? "Een cassette met een grotere grootste krans helpt hier het meest."
          : "A cassette with a bigger largest cog will help most here."
        : innerChainringTeeth !== undefined && innerChainringTeeth < outerChainringTeeth
          ? isNl
            ? "Een kleinere binnenste kettingring maakt dit merkbaar rustiger."
            : "A smaller inner chainring would make this noticeably easier."
          : isNl
            ? "Een grotere cassette is de snelste verbetering."
            : "A larger cassette is the quickest improvement.";

    return isNl
      ? `Je laagste versnelling zit dicht bij de grens voor een ${gradientPct.toFixed(1)}% klim. ${followUp}`
      : `Your easiest gear is close to the edge for a ${gradientPct.toFixed(1)}% climb. ${followUp}`;
  }

  const rangeHint =
    bikeType === "road"
      ? isNl
        ? "Voor weggebruik is een grotere cassette de meest logische eerste stap."
        : "For road use, a larger cassette is the most logical first move."
      : bikeType === "gravel"
        ? isNl
          ? "Voor gravel of mixed terrein helpt een ruimer bereik meestal direct."
          : "For gravel or mixed terrain, a wider range usually helps immediately."
        : isNl
          ? "Voor steile ritten is een ruimer bereik of kleinere kettingring meestal nodig."
          : "For steep rides, you usually need a wider range or a smaller chainring.";

  return isNl
    ? `Je laagste versnelling (${ratioText}x) oogt te zwaar voor een ${gradientPct.toFixed(1)}% klim. ${rangeHint}`
    : `Your easiest gear (${ratioText}x) looks too hard for a ${gradientPct.toFixed(1)}% climb. ${rangeHint}`;
}

export function validateGearingInputs(input: GearingCalculatorInput, isNl = false) {
  const issues: PublicValidationIssue[] = [];

  if (input.drivetrainType === "1x") {
    if (
      !Number.isInteger(input.outerChainringTeeth ?? NaN) ||
      (input.outerChainringTeeth ?? 0) < MIN_CHAINRING_TEETH ||
      (input.outerChainringTeeth ?? 0) > MAX_CHAINRING_TEETH
    ) {
      issues.push({
        code: "missing_required_field",
        field: "baseline",
        severity: "error",
        message: isNl ? "Vul je kettingring in voor een 1x setup." : "Enter a chainring for the 1x setup.",
      });
    }
  } else {
    if (
      !Number.isInteger(input.outerChainringTeeth ?? NaN) ||
      (input.outerChainringTeeth ?? 0) < MIN_CHAINRING_TEETH ||
      (input.outerChainringTeeth ?? 0) > MAX_CHAINRING_TEETH
    ) {
      issues.push({
        code: "missing_required_field",
        field: "baseline",
        severity: "error",
        message: isNl
          ? "Vul de buitenste kettingring in voor een 2x setup."
          : "Enter the outer chainring for the 2x setup.",
      });
    }
    if (
      !Number.isInteger(input.innerChainringTeeth ?? NaN) ||
      (input.innerChainringTeeth ?? 0) < MIN_CHAINRING_TEETH ||
      (input.innerChainringTeeth ?? 0) > MAX_CHAINRING_TEETH
    ) {
      issues.push({
        code: "missing_required_field",
        field: "baseline",
        severity: "error",
        message: isNl
          ? "Vul de binnenste kettingring in voor een 2x setup."
          : "Enter the inner chainring for the 2x setup.",
      });
    } else if (
      input.outerChainringTeeth !== undefined &&
      input.innerChainringTeeth !== undefined &&
      input.innerChainringTeeth >= input.outerChainringTeeth
    ) {
      issues.push({
        code: "missing_required_field",
        field: "baseline",
        severity: "error",
        message: isNl
          ? "De binnenste kettingring moet kleiner zijn dan de buitenste kettingring."
          : "The inner chainring must be smaller than the outer chainring.",
      });
    }
  }

  if (
    !input.cassetteSmallestCogTeeth ||
    !Number.isInteger(input.cassetteSmallestCogTeeth) ||
    input.cassetteSmallestCogTeeth < MIN_COG_TEETH ||
    input.cassetteSmallestCogTeeth > MAX_COG_TEETH
  ) {
    issues.push({
      code: "missing_required_field",
      field: "baseline",
      severity: "error",
      message: isNl
        ? "Vul een realistische kleinste krans in."
        : "Enter a realistic smallest cassette cog.",
    });
  }

  if (
    !input.cassetteLargestCogTeeth ||
    !Number.isInteger(input.cassetteLargestCogTeeth) ||
    input.cassetteLargestCogTeeth < MIN_COG_TEETH ||
    input.cassetteLargestCogTeeth > MAX_COG_TEETH
  ) {
    issues.push({
      code: "missing_required_field",
      field: "baseline",
      severity: "error",
      message: isNl
        ? "Vul een realistische grootste krans in."
        : "Enter a realistic largest cassette cog.",
    });
  }

  if (
    input.cassetteSmallestCogTeeth !== undefined &&
    input.cassetteLargestCogTeeth !== undefined &&
    input.cassetteLargestCogTeeth < input.cassetteSmallestCogTeeth
  ) {
    issues.push({
      code: "missing_required_field",
      field: "baseline",
      severity: "error",
      message: isNl
        ? "De grootste krans moet groter zijn dan de kleinste krans."
        : "The largest cassette cog must be bigger than the smallest cog.",
    });
  }

  if (
    input.wheelCircumferenceMm === undefined ||
    !Number.isFinite(input.wheelCircumferenceMm) ||
    input.wheelCircumferenceMm < MIN_WHEEL_CIRCUMFERENCE_MM ||
    input.wheelCircumferenceMm > MAX_WHEEL_CIRCUMFERENCE_MM
  ) {
    issues.push({
      code: "missing_required_field",
      field: "baseline",
      severity: "error",
      message: isNl
        ? "Vul een realistische wielomtrek in."
        : "Enter a realistic wheel circumference.",
    });
  }

  if (
    input.cadenceRpm === undefined ||
    !Number.isFinite(input.cadenceRpm) ||
    input.cadenceRpm < MIN_CADENCE_RPM ||
    input.cadenceRpm > MAX_CADENCE_RPM
  ) {
    issues.push({
      code: "missing_required_field",
      field: "baseline",
      severity: "error",
      message: isNl
        ? "Vul een trapfrequentie tussen 40 en 130 rpm in."
        : "Enter a cadence between 40 and 130 rpm.",
    });
  }

  if (
    input.gradientPct === undefined ||
    !Number.isFinite(input.gradientPct) ||
    input.gradientPct < MIN_GRADIENT_PCT ||
    input.gradientPct > MAX_GRADIENT_PCT
  ) {
    issues.push({
      code: "missing_required_field",
      field: "baseline",
      severity: "error",
      message: isNl
        ? "Vul een klimhelling tussen 0 en 25 procent in."
        : "Enter a climb gradient between 0 and 25 percent.",
    });
  }

  if (
    input.cassetteLargestCogTeeth !== undefined &&
    input.cassetteSmallestCogTeeth !== undefined &&
    input.cassetteLargestCogTeeth - input.cassetteSmallestCogTeeth >= 25
  ) {
    issues.push({
      code: "crank_length_category_warning",
      field: "output",
      severity: "warning",
      message: isNl
        ? "Deze cassette is ruim genoeg voor berggebruik, maar de stapjes tussen kransen worden groter."
        : "This cassette is wide enough for climbing, but the jumps between cogs will feel larger.",
    });
  }

  if (
    input.drivetrainType === "1x" &&
    input.bikeType === "road" &&
    input.cassetteLargestCogTeeth !== undefined &&
    input.cassetteLargestCogTeeth < 34
  ) {
    issues.push({
      code: "aggressive_output_with_low_support",
      field: "output",
      severity: "warning",
      message: isNl
        ? "Een 1x wegsetup met een relatief kleine grootste krans kan op lange klimmen krap aanvoelen."
        : "A road 1x setup with a relatively small largest cog can feel tight on long climbs.",
    });
  }

  return issues;
}

export function calculateGearing(
  input: GearingCalculatorInput,
  isNl = false
): GearingCalculationResult {
  const validationIssues = validateGearingInputs(input, isNl);
  const confidenceScore = clamp(
    68 +
      (input.drivetrainType ? 10 : 0) +
      (input.bikeType ? 6 : 0) +
      (input.climbBand ? 6 : 0) +
      (input.cadenceRpm !== undefined ? 5 : 0) +
      (input.gradientPct !== undefined ? 5 : 0) +
      (input.wheelCircumferenceMm !== undefined ? 8 : 0) -
      validationIssues.filter((issue) => issue.severity === "warning").length * 6 -
      validationIssues.filter((issue) => issue.severity === "error").length * 20,
    0,
    100
  );
  const confidence: PublicFitConfidence = {
    score: confidenceScore,
    level: confidenceScore >= 75 ? "high" : confidenceScore >= 50 ? "medium" : "lower",
    reasons: [
      isNl ? "exacte kettingring- en kransmaten" : "exact chainring and cassette sizes",
      isNl ? "wielomtrek ingevuld" : "wheel circumference entered",
      isNl ? "trapfrequentie en klimprofiel ingevuld" : "cadence and climb profile entered",
    ],
  };

  const wheelCircumferenceMm = input.wheelCircumferenceMm ?? DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE[input.bikeType];
  const cadenceRpm = input.cadenceRpm ?? 80;
  const gradientPct = input.gradientPct ?? 8;
  const outerChainringTeeth = input.outerChainringTeeth ?? 34;
  const innerChainringTeeth = input.innerChainringTeeth;
  const smallestCogTeeth = input.cassetteSmallestCogTeeth ?? 11;
  const largestCogTeeth = input.cassetteLargestCogTeeth ?? 34;

  const easiestChainring =
    input.drivetrainType === "2x" && innerChainringTeeth !== undefined
      ? Math.min(outerChainringTeeth, innerChainringTeeth)
      : outerChainringTeeth;
  const hardestChainring =
    input.drivetrainType === "2x" && innerChainringTeeth !== undefined
      ? Math.max(outerChainringTeeth, innerChainringTeeth)
      : outerChainringTeeth;

  const easiest = buildGearMetric({
    chainringTeeth: easiestChainring,
    cogTeeth: largestCogTeeth,
    wheelCircumferenceMm,
    cadenceRpm,
  });
  const hardest = buildGearMetric({
    chainringTeeth: hardestChainring,
    cogTeeth: smallestCogTeeth,
    wheelCircumferenceMm,
    cadenceRpm,
  });
  const gearSpan = round(hardest.ratio / easiest.ratio, 2);
  const targetRatio = targetRatioForClimb({
    gradientPct,
    climbBand: input.climbBand,
    bikeType: input.bikeType,
  });
  const verdict = classifyVerdict(easiest.ratio, targetRatio);
  const recommendationText = buildRecommendationText({
    verdict,
    drivetrainType: input.drivetrainType,
    easiestRatio: easiest.ratio,
    outerChainringTeeth,
    innerChainringTeeth,
    bikeType: input.bikeType,
    cadenceRpm,
    gradientPct,
    isNl,
  });
  const score =
    verdict === "suitable"
      ? 88
      : verdict === "challenging"
        ? 66
        : 41;

  const resultEnvelope = createPublicCalculatorResultEnvelope({
    calculatorKey: "gearing",
    recommended: {
      easiestGearRatio: easiest.ratio,
      hardestGearRatio: hardest.ratio,
      easiestSpeedKmh: easiest.speedKmh,
      hardestSpeedKmh: hardest.speedKmh,
      gearSpan,
      verdict,
    },
    confidence,
    validationIssues,
    primaryDrivers: [
      isNl ? "Kettingring- en kranscombinatie" : "Chainring and cassette combination",
      isNl ? "Wielomtrek" : "Wheel circumference",
      isNl ? "Trapfrequentie" : "Cadence",
    ],
    secondaryModifiers: [
      isNl ? "Klimhelling" : "Climb gradient",
      isNl ? "Klimlengteband" : "Climb length band",
      isNl ? "Fietstype" : "Bike type",
    ],
    notCovered: [
      isNl
        ? "Rijdergewicht, FTP en exacte klimduur"
        : "Rider weight, FTP, and exact climb duration",
      isNl ? "Vermoeidheid, wind en hoogte" : "Fatigue, wind, and altitude",
    ],
    nextAction:
      verdict === "suitable"
        ? isNl
          ? "Gebruik dit als startpunt en controleer de combinatie daarna op je eigen routes."
          : "Use this as a starting point, then check the combination on your own routes."
        : isNl
          ? "Open het dashboard om deze combinatie te vergelijken met je echte bike setup."
          : "Open the dashboard to compare this setup against your real bike setup.",
  });

  return {
    easiest,
    hardest,
    gearSpan,
    confidence,
    validationIssues,
    recommendation: {
      label: verdict,
      score,
      targetRatio,
      text: recommendationText,
    },
    resultEnvelope,
  };
}

export function formatGearRatio(value: number) {
  return `${formatRatio(value)}x`;
}

export function formatSpeedKmh(value: number) {
  return `${value.toFixed(1)} km/h`;
}

export function formatGearSpan(value: number) {
  return `${value.toFixed(2)}x`;
}
