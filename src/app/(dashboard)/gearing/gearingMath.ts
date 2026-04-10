export type GearingDrivetrainType = "1x" | "2x";

export type GearingCompleteness = "missing" | "partial" | "complete" | "validated";

export type GearingData = {
  drivetrainType?: GearingDrivetrainType;
  chainrings?: number[];
  cassetteTeeth?: number[];
  wheelCircumferenceMm?: number;
  crankLengthMm?: number;
  groupsetName?: string;
  derailleurMaxCog?: number;
  completeness?: GearingCompleteness;
};

export type GearingMetrics = {
  lowestGearRatio: number | null;
  highestGearRatio: number | null;
  lowestGearDevelopmentM: number | null;
  highestGearDevelopmentM: number | null;
  lowestGearSpeedAtCadenceKmh: number | null;
  highestGearSpeedAtCadenceKmh: number | null;
  cadenceAtSpeedRpm: number | null;
};

export type GearingSuitability = {
  label: "good_match" | "borderline" | "too_hard" | "race_biased" | "needs_bailout";
  confidence: "high" | "medium" | "low";
  requiredPowerW: number | null;
  sustainablePowerW: number | null;
  cadenceNeededRpm: number | null;
  recommendation: string;
  warnings: string[];
};

const DEFAULT_WHEEL_CIRCUMFERENCE_MM = 2105;
const DEFAULT_CDA = 0.32;
const DEFAULT_CRR = 0.0045;
const RHO = 1.226;
const G = 9.80665;

function normalizeNumbers(values?: number[]) {
  return (values ?? []).filter((value) => Number.isFinite(value) && value > 0);
}

export function parseCommaSeparatedNumbers(value: string) {
  return value
    .split(/[,\s]+/g)
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part) && part > 0);
}

export function summarizeCompleteness(data: GearingData): GearingCompleteness {
  const chainrings = normalizeNumbers(data.chainrings);
  const cassetteTeeth = normalizeNumbers(data.cassetteTeeth);
  const wheelCircumferenceMm = data.wheelCircumferenceMm ?? null;
  const drivetrainType = data.drivetrainType ?? null;

  if (chainrings.length === 0 && cassetteTeeth.length === 0 && !wheelCircumferenceMm && !drivetrainType) {
    return "missing";
  }

  const hasEnoughForMath =
    chainrings.length > 0 && cassetteTeeth.length > 0 && typeof wheelCircumferenceMm === "number";

  if (!hasEnoughForMath) {
    return "partial";
  }

  const matchesDrivetrain =
    drivetrainType === "1x"
      ? chainrings.length === 1
      : drivetrainType === "2x"
        ? chainrings.length === 2
        : false;

  const sortedCassette = [...cassetteTeeth].sort((a, b) => a - b);
  const isValidated =
    matchesDrivetrain &&
    sortedCassette.length >= 2 &&
    sortedCassette[0] < sortedCassette[sortedCassette.length - 1] &&
    wheelCircumferenceMm >= 1500 &&
    wheelCircumferenceMm <= 2800;

  return isValidated ? "validated" : "complete";
}

function getWheelCircumferenceMeters(data: GearingData) {
  return (data.wheelCircumferenceMm ?? DEFAULT_WHEEL_CIRCUMFERENCE_MM) / 1000;
}

function getChainrings(data: GearingData) {
  return normalizeNumbers(data.chainrings);
}

function getCassetteTeeth(data: GearingData) {
  return normalizeNumbers(data.cassetteTeeth);
}

export function computeGearingMetrics(
  data: GearingData,
  cadenceRpm = 90,
  speedKmh = 0
): GearingMetrics {
  const chainrings = getChainrings(data);
  const cassetteTeeth = getCassetteTeeth(data);
  const wheelCircumferenceM = getWheelCircumferenceMeters(data);

  if (!chainrings.length || !cassetteTeeth.length) {
    return {
      lowestGearRatio: null,
      highestGearRatio: null,
      lowestGearDevelopmentM: null,
      highestGearDevelopmentM: null,
      lowestGearSpeedAtCadenceKmh: null,
      highestGearSpeedAtCadenceKmh: null,
      cadenceAtSpeedRpm: null,
    };
  }

  const lowestGearRatio = Math.min(...chainrings) / Math.max(...cassetteTeeth);
  const highestGearRatio = Math.max(...chainrings) / Math.min(...cassetteTeeth);
  const lowestGearDevelopmentM = lowestGearRatio * wheelCircumferenceM;
  const highestGearDevelopmentM = highestGearRatio * wheelCircumferenceM;
  const lowestGearSpeedAtCadenceKmh = (lowestGearDevelopmentM * cadenceRpm * 60) / 1000;
  const highestGearSpeedAtCadenceKmh = (highestGearDevelopmentM * cadenceRpm * 60) / 1000;

  return {
    lowestGearRatio,
    highestGearRatio,
    lowestGearDevelopmentM,
    highestGearDevelopmentM,
    lowestGearSpeedAtCadenceKmh,
    highestGearSpeedAtCadenceKmh,
    cadenceAtSpeedRpm: speedKmh > 0 ? (speedKmh * 1000) / (highestGearDevelopmentM * 60) : null,
  };
}

export function estimateSustainablePower(ftpW: number | null, climbMinutes: number | null) {
  if (!ftpW || ftpW <= 0) {
    return null;
  }

  if (!climbMinutes) {
    return ftpW * 0.9;
  }
  if (climbMinutes < 8) {
    return ftpW * 1.05;
  }
  if (climbMinutes < 20) {
    return ftpW * 0.98;
  }
  if (climbMinutes < 60) {
    return ftpW * 0.88;
  }
  return ftpW * 0.8;
}

export function estimateClimbPower({
  massKg,
  speedKmh,
  gradientPercent,
  bikeType,
}: {
  massKg: number | null;
  speedKmh: number | null;
  gradientPercent: number | null;
  bikeType?: string | null;
}) {
  if (!massKg || !speedKmh || !gradientPercent) {
    return null;
  }

  const speedMps = speedKmh / 3.6;
  const gradient = Math.max(0, gradientPercent) / 100;
  const bikeTypeCda =
    bikeType === "mountain" ? 0.38 : bikeType === "gravel" ? 0.36 : bikeType === "tt_triathlon" ? 0.26 : DEFAULT_CDA;
  const bikeTypeCrr =
    bikeType === "mountain" ? 0.007 : bikeType === "gravel" ? 0.0055 : bikeType === "city" ? 0.0065 : DEFAULT_CRR;
  const gravityPower = massKg * G * speedMps * gradient;
  const rollingPower = massKg * G * speedMps * bikeTypeCrr;
  const aeroPower = 0.5 * RHO * bikeTypeCda * Math.pow(speedMps, 3);

  return gravityPower + rollingPower + aeroPower;
}

export function classifyGearingSuitability({
  metrics,
  ftpW,
  climbMinutes,
  totalMassKg,
  gradientPercent,
  bikeType,
  preferredCadenceRpm,
}: {
  metrics: GearingMetrics;
  ftpW: number | null;
  climbMinutes: number | null;
  totalMassKg: number | null;
  gradientPercent: number | null;
  bikeType?: string | null;
  preferredCadenceRpm: number | null;
}): GearingSuitability {
  const confidence =
    ftpW && climbMinutes && totalMassKg && gradientPercent ? "high" : ftpW || gradientPercent ? "medium" : "low";

  if (
    metrics.lowestGearSpeedAtCadenceKmh === null ||
    preferredCadenceRpm === null ||
    metrics.lowestGearRatio === null
  ) {
    return {
      label: "needs_bailout",
      confidence,
      requiredPowerW: null,
      sustainablePowerW: null,
      cadenceNeededRpm: null,
      recommendation: "Enter gearing details to calculate climb suitability.",
      warnings: ["Missing drivetrain inputs."],
    };
  }

  const requiredPowerW = estimateClimbPower({
    massKg: totalMassKg,
    speedKmh: metrics.lowestGearSpeedAtCadenceKmh,
    gradientPercent,
    bikeType,
  });
  const sustainablePowerW = estimateSustainablePower(ftpW, climbMinutes);

  if (!requiredPowerW || !sustainablePowerW) {
    return {
      label: "borderline",
      confidence,
      requiredPowerW,
      sustainablePowerW,
      cadenceNeededRpm: null,
      recommendation: "Enter FTP to personalize the climb recommendation.",
      warnings: [],
    };
  }

  const cadenceNeededRpm = preferredCadenceRpm * (sustainablePowerW / requiredPowerW);
  const powerGap = sustainablePowerW - requiredPowerW;
  const lowGearSpeed = metrics.lowestGearSpeedAtCadenceKmh;

  if (powerGap >= sustainablePowerW * 0.1) {
    return {
      label: "good_match",
      confidence,
      requiredPowerW,
      sustainablePowerW,
      cadenceNeededRpm,
      recommendation: "Your current gearing is a good match for this climb.",
      warnings: [],
    };
  }

  if (powerGap >= 0) {
    return {
      label: "borderline",
      confidence,
      requiredPowerW,
      sustainablePowerW,
      cadenceNeededRpm,
      recommendation: "Your gearing is workable, but a slightly easier low gear would improve margin.",
      warnings: [],
    };
  }

  const warnings = [
    `At ${preferredCadenceRpm} rpm, the low gear yields about ${lowGearSpeed.toFixed(1)} km/h.`,
    cadenceNeededRpm < 70 ? "You will likely need a lower cadence or easier gearing." : "A larger cassette would help preserve cadence.",
  ];

  return {
    label: cadenceNeededRpm < 65 ? "needs_bailout" : cadenceNeededRpm < 75 ? "too_hard" : "race_biased",
    confidence,
    requiredPowerW,
    sustainablePowerW,
    cadenceNeededRpm,
    recommendation:
      cadenceNeededRpm < 65
        ? "This gearing is too hard for the target climb and needs a bailout gear."
        : "This setup is race-biased for the target climb.",
    warnings,
  };
}

export function formatGearingLabel(value: GearingCompleteness, isNl: boolean) {
  if (isNl) {
    switch (value) {
      case "missing":
        return "Ontbrekend";
      case "partial":
        return "Deels ingevuld";
      case "complete":
        return "Compleet";
      case "validated":
        return "Gevalideerd";
    }
  }

  switch (value) {
    case "missing":
      return "Missing";
    case "partial":
      return "Partial";
    case "complete":
      return "Complete";
    case "validated":
      return "Validated";
  }
}
