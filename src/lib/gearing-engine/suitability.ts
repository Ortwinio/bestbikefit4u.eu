import type { BikeType } from "../bikes";
import {
  getDefaultBikeMassKg,
  getDefaultCdA,
  getDefaultCrr,
  getDefaultGradientPctForBand,
  getDurationBandFromMinutes,
  getDurationMinutesForBand,
  getDurationMultiplierForBand,
  getDefaultRangeTarget,
} from "./config";
import {
  calculateCadenceAtSpeed,
  calculateClimbPowerWatts,
  calculateGearMath,
  calculateGearSpeedAtCadence,
  solveSpeedForPowerWatts,
} from "./math";
import type {
  GearingAnalysisInput,
  GearingAnalysisResult,
  GearingConfidence,
  GearingLengthBand,
  GearingMathResult,
  GearingReadinessLabel,
  GearingSetupLabel,
  GearingSuitabilityResult,
} from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function deriveLengthBand(input: GearingAnalysisInput) {
  if (input.climbLengthBand) {
    return input.climbLengthBand;
  }
  if (input.climbLengthKm !== undefined) {
    if (input.climbLengthKm < 3) return "short";
    if (input.climbLengthKm < 8) return "medium";
    if (input.climbLengthKm < 20) return "long";
    return "alpine";
  }
  return "medium";
}

function deriveEstimatedClimbDurationMinutes(input: GearingAnalysisInput) {
  const band = deriveLengthBand(input);
  if (input.climbLengthKm !== undefined && input.climbGradientPct !== undefined) {
    const gradientFactor = clamp(input.climbGradientPct / 8, 0.6, 1.8);
    const baseSpeedKmh = clamp(14 / gradientFactor, 5, 20);
    return roundTo((input.climbLengthKm / baseSpeedKmh) * 60, 1);
  }
  return getDurationMinutesForBand(band);
}

function deriveTotalMassKg(input: GearingAnalysisInput) {
  return (input.riderWeightKg ?? 75) + (input.bikeWeightKg ?? getDefaultBikeMassKg(input.bikeType));
}

function deriveGradientPct(input: GearingAnalysisInput) {
  if (input.climbGradientPct !== undefined) {
    return input.climbGradientPct;
  }
  return getDefaultGradientPctForBand(deriveLengthBand(input));
}

function derivePowerDurationMultiplier(input: GearingAnalysisInput) {
  if (input.climbLengthBand) {
    return getDurationMultiplierForBand(input.climbLengthBand);
  }
  return getDurationMultiplierForBand(
    getDurationBandFromMinutes(deriveEstimatedClimbDurationMinutes(input))
  );
}

function deriveSustainablePowerWatts(input: GearingAnalysisInput) {
  if (input.ftpWatts === undefined) {
    return undefined;
  }
  return roundTo(input.ftpWatts * derivePowerDurationMultiplier(input), 0);
}

function derivePublicVerdictScore({
  easiestSpeedKmh,
  easiestRatio,
  gradientPct,
  band,
  bikeType,
}: {
  easiestSpeedKmh: number;
  easiestRatio: number;
  gradientPct: number;
  band: GearingLengthBand;
  bikeType?: BikeType;
}) {
  let score = 72;
  score -= clamp((gradientPct - 6) * 7, -8, 42);
  score -= clamp((easiestSpeedKmh - 7.5) * 8, -15, 35);
  score -= clamp((easiestRatio - 1.0) * 45, -20, 30);

  if (band === "long") score -= 8;
  if (band === "alpine") score -= 16;
  if (bikeType === "mountain") score += 12;
  if (bikeType === "gravel" || bikeType === "touring") score += 6;
  if (bikeType === "tt_triathlon") score -= 10;

  return clamp(Math.round(score), 0, 100);
}

function derivePublicVerdict(score: number): GearingReadinessLabel {
  if (score >= 60) return "suitable";
  if (score >= 38) return "challenging";
  return "likely_overgeared";
}

function deriveSetupLabel(input: {
  climbSuitabilityScore: number;
  eventReadinessScore: number;
  gearRangeScore: number;
  publicVerdict: GearingReadinessLabel;
  preference?: string;
  bikeType?: BikeType;
}): GearingSetupLabel {
  if (input.climbSuitabilityScore < 35) {
    return "needs bailout gear";
  }
  if (input.eventReadinessScore < 40) {
    return "overgeared for Alpine use";
  }
  if (input.preference === "want_racing_gearing" && input.publicVerdict !== "suitable") {
    return "race gearing";
  }
  if (input.climbSuitabilityScore >= 80) {
    return "comfort-oriented climbing setup";
  }
  if (input.climbSuitabilityScore >= 65 && input.gearRangeScore >= 55) {
    return "balanced sportive setup";
  }
  if (input.bikeType === "road" && input.gearRangeScore < 35 && input.eventReadinessScore >= 55) {
    return "performance climbing setup";
  }
  if (input.gearRangeScore >= 70 && input.bikeType !== "tt_triathlon") {
    return "undergeared on the flat but mountain-ready";
  }
  return "performance climbing setup";
}

function deriveConfidence(input: GearingAnalysisInput): GearingConfidence {
  const mathScore = 100;
  let suitabilityScore = 35;
  const reasons: string[] = [];

  if (input.ftpWatts !== undefined) {
    suitabilityScore += 20;
  } else {
    reasons.push("FTP missing, so sustainable climbing power is estimated directionally.");
  }
  if (input.riderWeightKg !== undefined) {
    suitabilityScore += 15;
  } else {
    reasons.push("Rider weight missing, so total climbing mass uses defaults.");
  }
  if (input.bikeWeightKg !== undefined) {
    suitabilityScore += 10;
  } else {
    reasons.push("Bike weight missing, so default bike-type mass is used.");
  }
  if (input.preferredCadenceRpm !== undefined) {
    suitabilityScore += 10;
  } else {
    reasons.push("Preferred cadence missing, so a standard climbing cadence is assumed.");
  }
  if (input.climbGradientPct !== undefined) {
    suitabilityScore += 15;
  } else {
    reasons.push("Gradient missing, so climb band defaults are used.");
  }
  if (input.climbLengthKm !== undefined || input.climbLengthBand !== undefined) {
    suitabilityScore += 15;
  } else {
    reasons.push("Climb duration missing, so medium-climb assumptions are used.");
  }

  const score = roundTo((mathScore * 0.45 + suitabilityScore * 0.55) / 100, 2);
  const level = score >= 0.8 ? "high" : score >= 0.6 ? "medium" : "low";

  if (reasons.length === 0) {
    reasons.push("Core drivetrain, rider, and climb inputs are present.");
  }

  return {
    score,
    level,
    mathScore,
    suitabilityScore,
    reasons,
  };
}

function buildRecommendationText(input: {
  publicVerdict: GearingReadinessLabel;
  setupLabel: GearingSetupLabel;
  math: GearingMathResult;
  easiestSpeedKmh: number;
  gradientPct: number;
  preferredCadenceRpm: number;
}) {
  const easiest = input.math.easiestGear;
  if (input.setupLabel === "needs bailout gear") {
    return `Your current ${easiest.frontChainringTeeth} x ${easiest.rearCogTeeth} low gear is too hard for long climbing comfort. A larger cassette, smaller inner ring, or both would give you a safer cadence margin.`;
  }
  if (input.setupLabel === "overgeared for Alpine use") {
    return `At ${input.preferredCadenceRpm} rpm your easiest gear already forces about ${input.easiestSpeedKmh} km/h. For sustained ${input.gradientPct}% climbing that is likely too demanding for long mountain days.`;
  }
  if (input.setupLabel === "comfort-oriented climbing setup") {
    return `Your low gear already supports relaxed mountain pacing. Keep this setup if staying above your natural climbing cadence matters more than top-end speed.`;
  }
  if (input.setupLabel === "undergeared on the flat but mountain-ready") {
    return "This setup gives strong uphill insurance, but you may run out of high gear sooner on fast bunch or downhill sections.";
  }
  if (input.publicVerdict === "challenging") {
    return `Current gearing is workable but biased toward stronger riders or shorter climbs. A slightly easier low gear would improve fatigue margin without changing the whole bike character.`;
  }
  return "Current gearing is broadly matched to your intended use. Change it only if your target events are steeper or longer than your normal riding.";
}

export function calculateGearingSuitability(
  input: GearingAnalysisInput,
  math = calculateGearMath(input)
): GearingSuitabilityResult {
  const preferredCadenceRpm = input.preferredCadenceRpm ?? 82;
  const easiestSpeedKmh = roundTo(
    calculateGearSpeedAtCadence(math.easiestGear.developmentM, preferredCadenceRpm),
    2
  );
  const gradientPct = deriveGradientPct(input);
  const lengthBand = deriveLengthBand(input);
  const totalMassKg = deriveTotalMassKg(input);
  const crr = getDefaultCrr(input.surfaceType);
  const cda = getDefaultCdA(input.bikeType);
  const requiredPowerWatts = roundTo(
    calculateClimbPowerWatts({
      totalMassKg,
      velocityMps: easiestSpeedKmh / 3.6,
      gradientPct,
      crr,
      cda,
    }),
    0
  );
  const sustainablePowerWatts = deriveSustainablePowerWatts(input);
  const powerGapWatts =
    sustainablePowerWatts !== undefined
      ? roundTo(sustainablePowerWatts - requiredPowerWatts, 0)
      : undefined;

  const publicScore = derivePublicVerdictScore({
    easiestSpeedKmh,
    easiestRatio: math.easiestGear.ratio,
    gradientPct,
    band: lengthBand,
    bikeType: input.bikeType,
  });
  const publicVerdict = derivePublicVerdict(publicScore);

  const gearRangeTarget = getDefaultRangeTarget(input.bikeType);
  const gearRangeScore = clamp(
    Math.round((math.rangeRatio / gearRangeTarget) * 100),
    0,
    100
  );
  const climbSuitabilityScore = clamp(
    Math.round(
      publicScore +
        (powerGapWatts !== undefined ? clamp(powerGapWatts / 3, -30, 18) : 0)
    ),
    0,
    100
  );
  const eventReadinessScore = clamp(
    Math.round(
      climbSuitabilityScore * 0.6 +
        gearRangeScore * 0.25 +
        (input.alpineFlag ? climbSuitabilityScore - 10 : 70) * 0.15
    ),
    0,
    100
  );
  const setupLabel = deriveSetupLabel({
    climbSuitabilityScore,
    eventReadinessScore,
    gearRangeScore,
    publicVerdict,
    preference: input.preference,
    bikeType: input.bikeType,
  });

  const assumptions = [
    "Exact gear math uses chainring teeth, cassette teeth, wheel circumference, and cadence only.",
    "Climb suitability uses a steady-state climbing model with gravity, rolling resistance, aero drag, and drivetrain efficiency.",
  ];

  const warnings: string[] = [];
  if (
    input.rearDerailleurMaxCog !== undefined &&
    math.easiestGear.rearCogTeeth > input.rearDerailleurMaxCog
  ) {
    warnings.push(
      `Current or recommended cassette may exceed the derailleur's stated ${input.rearDerailleurMaxCog}T maximum.`
    );
  }
  if (
    input.drivetrainType === "1x" &&
    math.normalizedCassetteTeeth[math.normalizedCassetteTeeth.length - 1] >= 42 &&
    (input.bikeType === "road" || input.bikeType === "tt_triathlon")
  ) {
    warnings.push("Wide-range 1x gearing may create larger cadence jumps for road-event pacing.");
  }

  let preferredCadenceFeasible: boolean | undefined;
  let cadenceNeededAtSustainablePowerRpm: number | undefined;
  if (sustainablePowerWatts !== undefined) {
    preferredCadenceFeasible = sustainablePowerWatts >= requiredPowerWatts;
    if (!preferredCadenceFeasible) {
      const sustainableVelocityMps = solveSpeedForPowerWatts({
        totalMassKg,
        gradientPct,
        crr,
        cda,
        targetPowerWatts: sustainablePowerWatts,
      });
      cadenceNeededAtSustainablePowerRpm = roundTo(
        calculateCadenceAtSpeed(
          math.easiestGear.developmentM,
          sustainableVelocityMps * 3.6
        ),
        0
      );
      warnings.push(
        `At sustainable climbing power, you may need to ride closer to ${cadenceNeededAtSustainablePowerRpm} rpm in your easiest gear.`
      );
    }
  }

  const confidence = deriveConfidence(input);

  return {
    publicVerdict,
    setupLabel,
    gearRangeScore,
    climbSuitabilityScore,
    eventReadinessScore,
    requiredPowerWatts,
    sustainablePowerWatts,
    powerGapWatts,
    estimatedClimbDurationMinutes: deriveEstimatedClimbDurationMinutes(input),
    preferredCadenceFeasible,
    cadenceNeededAtSustainablePowerRpm,
    assumptions,
    warnings,
    recommendationText: buildRecommendationText({
      publicVerdict,
      setupLabel,
      math,
      easiestSpeedKmh,
      gradientPct,
      preferredCadenceRpm,
    }),
    confidence,
  };
}

export function calculateGearingAnalysis(
  input: GearingAnalysisInput
): GearingAnalysisResult {
  const math = calculateGearMath(input);
  const suitability = calculateGearingSuitability(input, math);
  return { math, suitability };
}

export function deriveBikeGearingCompleteness(
  input?:
    | Partial<{
        drivetrainType: string;
        chainrings: number[];
        cassetteTeeth: number[];
        wheelCircumferenceMm: number;
      }>
    | null
) {
  if (!input) {
    return "missing" as const;
  }

  const hasAnyValue = Boolean(
    input.drivetrainType ||
      input.chainrings?.length ||
      input.cassetteTeeth?.length ||
      input.wheelCircumferenceMm
  );

  if (!hasAnyValue) {
    return "missing" as const;
  }

  if (
    !input.drivetrainType ||
    !input.chainrings?.length ||
    !input.cassetteTeeth?.length ||
    !input.wheelCircumferenceMm
  ) {
    return "partial" as const;
  }

  try {
    calculateGearMath({
      drivetrainType: input.drivetrainType as "1x" | "2x",
      chainrings: input.chainrings,
      cassetteTeeth: input.cassetteTeeth,
      wheelCircumferenceMm: input.wheelCircumferenceMm,
    });
    return "validated" as const;
  } catch {
    return "partial" as const;
  }
}

export function derivePublicExplanation(input: {
  math: GearingMathResult;
  cadenceRpm: number;
  easiestSpeedKmh: number;
  gradientPct: number;
  publicVerdict: GearingReadinessLabel;
}) {
  const easiest = input.math.easiestGear;
  return `Your easiest gear is ${easiest.frontChainringTeeth} x ${easiest.rearCogTeeth}, ratio ${easiest.ratio.toFixed(
    2
  )}. At ${input.cadenceRpm} rpm that means about ${input.easiestSpeedKmh.toFixed(
    1
  )} km/h, which is ${
    input.publicVerdict === "suitable"
      ? "workable"
      : input.publicVerdict === "challenging"
        ? "demanding"
        : "likely too hard"
  } for a sustained ${input.gradientPct}% climb.`;
}

export function deriveAlternativeScenario(
  input: GearingAnalysisInput,
  overrides: Partial<Pick<GearingAnalysisInput, "chainrings" | "cassetteTeeth" | "drivetrainType">>
) {
  const scenarioInput: GearingAnalysisInput = {
    ...input,
    drivetrainType: overrides.drivetrainType ?? input.drivetrainType,
    chainrings: overrides.chainrings ?? input.chainrings,
    cassetteTeeth: overrides.cassetteTeeth ?? input.cassetteTeeth,
  };
  return calculateGearingAnalysis(scenarioInput);
}
