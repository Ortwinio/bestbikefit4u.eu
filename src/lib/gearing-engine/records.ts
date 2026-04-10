import type { BikeGearingInput, BikeGearingRecord, GearingDrivetrainType } from "./types";

function normalizePositiveIntegers(values?: number[] | null) {
  if (!values || values.length === 0) {
    return undefined;
  }

  const normalized = [...new Set(values.map((value) => Math.round(value)))].filter(
    (value) => Number.isFinite(value) && value > 0
  );

  if (normalized.length === 0) {
    return undefined;
  }

  return normalized.sort((left, right) => left - right);
}

function normalizePositiveNumber(value?: number | null, min = 1, max = Number.POSITIVE_INFINITY) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    return undefined;
  }
  return value;
}

function resolveDrivetrainType(
  drivetrainType: GearingDrivetrainType | undefined,
  chainrings: number[] | undefined
) {
  if (drivetrainType) {
    return drivetrainType;
  }
  if (chainrings?.length === 1) {
    return "1x";
  }
  if (chainrings?.length === 2) {
    return "2x";
  }
  return undefined;
}

function resolveCompleteness(input: {
  drivetrainType?: GearingDrivetrainType;
  chainrings?: number[];
  cassetteTeeth?: number[];
  wheelCircumferenceMm?: number;
}) {
  const hasAnyData =
    input.drivetrainType !== undefined ||
    input.chainrings !== undefined ||
    input.cassetteTeeth !== undefined ||
    input.wheelCircumferenceMm !== undefined;

  if (!hasAnyData) {
    return "missing" as const;
  }

  const hasRequiredData =
    input.drivetrainType !== undefined &&
    input.chainrings !== undefined &&
    input.cassetteTeeth !== undefined &&
    input.wheelCircumferenceMm !== undefined;

  if (!hasRequiredData) {
    return "partial" as const;
  }

  const drivetrainType = input.drivetrainType!;
  const chainrings = input.chainrings!;

  const drivetrainMatchesChainrings =
    (drivetrainType === "1x" && chainrings.length === 1) ||
    (drivetrainType === "2x" && chainrings.length === 2);

  if (!drivetrainMatchesChainrings) {
    return "partial" as const;
  }

  return "validated" as const;
}

export function buildBikeGearingRecord(
  input?: BikeGearingInput | null
): BikeGearingRecord | undefined {
  if (!input) {
    return undefined;
  }

  const chainrings = normalizePositiveIntegers(input.chainrings);
  const cassetteTeeth = normalizePositiveIntegers(input.cassetteTeeth);
  const drivetrainType = resolveDrivetrainType(input.drivetrainType, chainrings);
  const wheelCircumferenceMm = normalizePositiveNumber(input.wheelCircumferenceMm, 1200, 2800);
  const crankLengthMm = normalizePositiveNumber(input.crankLengthMm, 120, 190);
  const derailleurMaxCog = normalizePositiveNumber(input.derailleurMaxCog, 1, 60);
  const groupsetName =
    typeof input.groupsetName === "string" && input.groupsetName.trim().length > 0
      ? input.groupsetName.trim()
      : undefined;
  const completeness =
    input.completeness ??
    resolveCompleteness({
      drivetrainType,
      chainrings,
      cassetteTeeth,
      wheelCircumferenceMm,
    });
  const source = input.source ?? "user_entered";
  const updatedAt = normalizePositiveNumber(input.updatedAt, 1) ?? Date.now();

  if (
    drivetrainType === undefined &&
    chainrings === undefined &&
    cassetteTeeth === undefined &&
    wheelCircumferenceMm === undefined &&
    crankLengthMm === undefined &&
    groupsetName === undefined &&
    derailleurMaxCog === undefined
  ) {
    return undefined;
  }

  return {
    drivetrainType,
    chainrings,
    cassetteTeeth,
    wheelCircumferenceMm,
    crankLengthMm,
    groupsetName,
    derailleurMaxCog,
    completeness,
    source,
    updatedAt,
  };
}
