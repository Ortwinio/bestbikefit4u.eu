import {
  DEFAULT_DRIVETRAIN_EFFICIENCY,
  DEFAULT_GRAVITY_MPS2,
} from "./config";
import type {
  GearingDrivetrainType,
  GearingGearPair,
  GearingMathInput,
  GearingMathResult,
} from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalizeTeeth(values: number[], fieldName: string, expectedLength?: number) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`${fieldName} must contain at least one tooth count.`);
  }

  const normalized = [...new Set(values.map((value) => Math.round(value)))].sort(
    (left, right) => left - right
  );

  if (expectedLength !== undefined && normalized.length !== expectedLength) {
    throw new Error(`${fieldName} must contain exactly ${expectedLength} tooth counts.`);
  }

  for (const value of normalized) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${fieldName} must contain positive tooth counts.`);
    }
  }

  return normalized;
}

function validateDrivetrainType(drivetrainType: GearingDrivetrainType, chainringsLength: number) {
  if (drivetrainType === "1x" && chainringsLength !== 1) {
    throw new Error("1x drivetrains must have exactly one chainring.");
  }
  if (drivetrainType === "2x" && chainringsLength !== 2) {
    throw new Error("2x drivetrains must have exactly two chainrings.");
  }
}

function validateWheelCircumference(wheelCircumferenceMm: number) {
  if (!Number.isFinite(wheelCircumferenceMm) || wheelCircumferenceMm < 1200 || wheelCircumferenceMm > 2800) {
    throw new Error("Wheel circumference must be between 1200 mm and 2800 mm.");
  }
}

function validateOptionalPositiveValue(value: number | undefined, fieldName: string, min: number, max: number) {
  if (value === undefined) {
    return;
  }
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${fieldName} is out of range.`);
  }
}

function buildGearPair(
  frontChainringTeeth: number,
  rearCogTeeth: number,
  wheelCircumferenceMm: number,
  crankLengthMm?: number,
  cadenceRpm?: number,
  targetSpeedKmh?: number
): GearingGearPair {
  const ratio = frontChainringTeeth / rearCogTeeth;
  const developmentM = (ratio * wheelCircumferenceMm) / 1000;
  const wheelDiameterInches = wheelCircumferenceMm / Math.PI / 25.4;
  const gearInches = wheelDiameterInches * ratio;
  const wheelRadiusMm = wheelCircumferenceMm / (2 * Math.PI);

  const pair: GearingGearPair = {
    frontChainringTeeth,
    rearCogTeeth,
    ratio: roundTo(ratio, 4),
    developmentM: roundTo(developmentM, 3),
    gearInches: roundTo(gearInches, 2),
  };

  if (crankLengthMm !== undefined) {
    pair.gainRatio = roundTo((wheelRadiusMm / crankLengthMm) * ratio, 3);
  }

  if (cadenceRpm !== undefined) {
    pair.speedKmhAtCadence = roundTo((developmentM * cadenceRpm * 60) / 1000, 2);
  }

  if (targetSpeedKmh !== undefined) {
    pair.cadenceRpmAtSpeed = roundTo(
      ((targetSpeedKmh * 1000) / 60) / developmentM,
      1
    );
  }

  return pair;
}

export function calculateGearMath(input: GearingMathInput): GearingMathResult {
  const expectedChainringCount = input.drivetrainType === "1x" ? 1 : 2;
  validateDrivetrainType(input.drivetrainType, input.chainrings.length);

  const normalizedChainrings = normalizeTeeth(
    input.chainrings,
    "chainrings",
    expectedChainringCount
  );
  const normalizedCassetteTeeth = normalizeTeeth(input.cassetteTeeth, "cassetteTeeth");
  validateWheelCircumference(input.wheelCircumferenceMm);
  validateOptionalPositiveValue(input.crankLengthMm, "crankLengthMm", 120, 190);
  validateOptionalPositiveValue(input.cadenceRpm, "cadenceRpm", 20, 180);
  validateOptionalPositiveValue(input.targetSpeedKmh, "targetSpeedKmh", 1, 90);

  const gearPairs = normalizedChainrings.flatMap((frontChainringTeeth) =>
    normalizedCassetteTeeth.map((rearCogTeeth) =>
      buildGearPair(
        frontChainringTeeth,
        rearCogTeeth,
        input.wheelCircumferenceMm,
        input.crankLengthMm,
        input.cadenceRpm,
        input.targetSpeedKmh
      )
    )
  );

  gearPairs.sort((left, right) => left.ratio - right.ratio);

  const easiestGear = gearPairs[0];
  const hardestGear = gearPairs[gearPairs.length - 1];
  const rangeRatio = roundTo(hardestGear.ratio / easiestGear.ratio, 3);
  const rangePercent = roundTo((rangeRatio - 1) * 100, 1);

  return {
    drivetrainType: input.drivetrainType,
    normalizedChainrings,
    normalizedCassetteTeeth,
    wheelCircumferenceMm: input.wheelCircumferenceMm,
    wheelDiameterInches: roundTo(input.wheelCircumferenceMm / Math.PI / 25.4, 2),
    wheelRadiusMm: roundTo(input.wheelCircumferenceMm / (2 * Math.PI), 1),
    gearPairs,
    easiestGear,
    hardestGear,
    rangeRatio,
    rangePercent,
  };
}

export function calculateGearSpeedAtCadence(
  developmentM: number,
  cadenceRpm: number
) {
  return (developmentM * cadenceRpm * 60) / 1000;
}

export function calculateCadenceAtSpeed(
  developmentM: number,
  speedKmh: number
) {
  if (developmentM <= 0) {
    throw new Error("Development must be positive.");
  }

  return ((speedKmh * 1000) / 60) / developmentM;
}

export function calculateClimbPowerWatts(input: {
  totalMassKg: number;
  velocityMps: number;
  gradientPct: number;
  crr: number;
  cda: number;
  airDensityKgPerM3?: number;
  drivetrainEfficiency?: number;
}) {
  const airDensityKgPerM3 = input.airDensityKgPerM3 ?? 1.225;
  const drivetrainEfficiency = input.drivetrainEfficiency ?? DEFAULT_DRIVETRAIN_EFFICIENCY;
  const gradient = clamp(input.gradientPct / 100, 0, 0.4);
  const gradeAngle = Math.atan(gradient);
  const gravityPower =
    input.totalMassKg * DEFAULT_GRAVITY_MPS2 * input.velocityMps * Math.sin(gradeAngle);
  const rollingPower =
    input.totalMassKg * DEFAULT_GRAVITY_MPS2 * input.velocityMps * input.crr * Math.cos(gradeAngle);
  const aeroPower = 0.5 * airDensityKgPerM3 * input.cda * Math.pow(input.velocityMps, 3);
  const wheelPower = gravityPower + rollingPower + aeroPower;
  return wheelPower / drivetrainEfficiency;
}

export function solveSpeedForPowerWatts(input: {
  totalMassKg: number;
  gradientPct: number;
  crr: number;
  cda: number;
  targetPowerWatts: number;
  airDensityKgPerM3?: number;
  drivetrainEfficiency?: number;
}) {
  const lowerBound = 0.1;
  const upperBound = 15;
  const maxIterations = 50;

  const powerForSpeed = (velocityMps: number) =>
    calculateClimbPowerWatts({
      totalMassKg: input.totalMassKg,
      velocityMps,
      gradientPct: input.gradientPct,
      crr: input.crr,
      cda: input.cda,
      airDensityKgPerM3: input.airDensityKgPerM3,
      drivetrainEfficiency: input.drivetrainEfficiency,
    });

  if (powerForSpeed(upperBound) < input.targetPowerWatts) {
    return upperBound;
  }

  let low = lowerBound;
  let high = upperBound;

  for (let index = 0; index < maxIterations; index += 1) {
    const mid = (low + high) / 2;
    const power = powerForSpeed(mid);
    if (Math.abs(power - input.targetPowerWatts) < 0.5) {
      return mid;
    }
    if (power > input.targetPowerWatts) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return (low + high) / 2;
}
