export type Discipline = "road" | "gravel" | "mtb" | "tt";

export type Surface =
  | "smooth_asphalt"
  | "average_asphalt"
  | "rough_asphalt"
  | "hardpack_gravel"
  | "loose_gravel"
  | "trail";

export type TubeType = "inner_tube" | "latex_tube" | "tubeless";
export type CasingType = "race_light" | "allround" | "reinforced";
export type RimType = "hooked" | "hookless";
export type RidingGoal = "speed" | "balance" | "comfort";

export type WarningKey =
  | "max_rim_pressure_exceeded"
  | "hookless_limit_exceeded"
  | "pressure_too_low_for_setup"
  | "front_rear_pressure_mismatch"
  | "inner_tube_pinch_flat_risk"
  | "road_tire_width_unusual"
  | "gravel_tire_width_unusual"
  | "mtb_tire_width_unusual"
  | "hookless_max_pressure_unknown";

export interface BasicPressureInput {
  discipline: Discipline;
  bodyWeightKg: number;
  widthFrontMm: number;
  widthRearMm: number;
  tubeType: TubeType;
  surface: Surface;
  bikeWeightKg?: number;
  ridingGoal?: RidingGoal;
}

export interface AdvancedPressureInput extends BasicPressureInput {
  casingType?: CasingType;
  rimType?: RimType;
  internalRimWidthFrontMm?: number;
  internalRimWidthRearMm?: number;
  maxPressureBar?: number;
  isWet?: boolean;
  extraLuggageKg?: number;
  routeDistanceKm?: number;
  routeElevationM?: number;
  offRoadPercent?: number;
  currentFrontBar?: number;
  currentRearBar?: number;
}

export interface PressureOutput {
  frontBar: number;
  rearBar: number;
  frontPsi: number;
  rearPsi: number;
  warnings: WarningKey[];
  comfortScore?: number;
  gripScore?: number;
  efficiencyScore?: number;
  explanation: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

const DISCIPLINE_MULTIPLIERS: Record<Discipline, number> = {
  road: 1,
  gravel: 0.72,
  mtb: 0.5,
  tt: 1.05,
};

const SURFACE_ADJUSTMENTS: Record<Surface, number> = {
  smooth_asphalt: 0.2,
  average_asphalt: 0,
  rough_asphalt: -0.2,
  hardpack_gravel: -0.3,
  loose_gravel: -0.5,
  trail: -0.7,
};

const GOAL_ADJUSTMENTS: Record<RidingGoal, number> = {
  speed: 0.2,
  balance: 0,
  comfort: -0.2,
};

const CASING_ADJUSTMENTS: Record<CasingType, number> = {
  race_light: 0.1,
  allround: 0,
  reinforced: -0.1,
};

const TUBE_ADJUSTMENTS: Record<TubeType, { front: number; rear: number }> = {
  tubeless: { front: -0.2, rear: -0.3 },
  latex_tube: { front: -0.1, rear: -0.1 },
  inner_tube: { front: 0, rear: 0 },
};

const PRESSURE_LIMITS: Record<Discipline, { min: number; max: number }> = {
  road: { min: 4, max: 9 },
  gravel: { min: 1.5, max: 5 },
  mtb: { min: 0.8, max: 3.5 },
  tt: { min: 5, max: 9.5 },
};

const LOAD_COEFFICIENTS = {
  front: 4.55,
  rear: 3.32,
} as const;

const GOAL_VALUES = ["speed", "balance", "comfort"] as const;

function roundBar(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundPsi(value: number): number {
  return Math.round(value * 14.5038);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isProvidedNumber(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function calculateRawPressure(input: BasicPressureInput | AdvancedPressureInput) {
  const totalSystemMassKg = input.bodyWeightKg + (input.bikeWeightKg ?? 8);
  const rearLoadKg = totalSystemMassKg * 0.6;
  const frontLoadKg = totalSystemMassKg * 0.4;
  const multiplier = DISCIPLINE_MULTIPLIERS[input.discipline];
  const tubeAdjustment = TUBE_ADJUSTMENTS[input.tubeType];
  const goalAdjustment = input.ridingGoal
    ? GOAL_ADJUSTMENTS[input.ridingGoal]
    : 0;
  const surfaceAdjustment = SURFACE_ADJUSTMENTS[input.surface];

  let frontBar =
    ((frontLoadKg / input.widthFrontMm) * LOAD_COEFFICIENTS.front) * multiplier +
    surfaceAdjustment +
    tubeAdjustment.front +
    goalAdjustment;

  let rearBar =
    ((rearLoadKg / input.widthRearMm) * LOAD_COEFFICIENTS.rear) * multiplier +
    surfaceAdjustment +
    tubeAdjustment.rear +
    goalAdjustment;

  if ("isWet" in input && input.isWet) {
    frontBar -= 0.2;
    rearBar -= 0.2;
  }

  if ("casingType" in input && input.casingType) {
    const casingAdjustment = CASING_ADJUSTMENTS[input.casingType];
    frontBar += casingAdjustment;
    rearBar += casingAdjustment;
  }

  if ("extraLuggageKg" in input && isProvidedNumber(input.extraLuggageKg)) {
    rearBar += input.extraLuggageKg * 0.005;
  }

  if (
    ("routeElevationM" in input &&
      isProvidedNumber(input.routeElevationM) &&
      input.routeElevationM > 1500) ||
    ("routeDistanceKm" in input &&
      isProvidedNumber(input.routeDistanceKm) &&
      input.routeDistanceKm > 150)
  ) {
    frontBar -= 0.1;
    rearBar -= 0.1;
  }

  if (
    "internalRimWidthFrontMm" in input &&
    isProvidedNumber(input.internalRimWidthFrontMm)
  ) {
    frontBar += (input.internalRimWidthFrontMm - 19) * 0.01;
  }

  if (
    "internalRimWidthRearMm" in input &&
    isProvidedNumber(input.internalRimWidthRearMm)
  ) {
    rearBar += (input.internalRimWidthRearMm - 19) * 0.01;
  }

  const limits = PRESSURE_LIMITS[input.discipline];
  frontBar = clamp(frontBar, limits.min, limits.max);
  rearBar = clamp(rearBar, limits.min, limits.max);

  if (rearBar < frontBar) {
    rearBar = frontBar;
  }

  return {
    totalSystemMassKg,
    frontBar: roundBar(frontBar),
    rearBar: roundBar(rearBar),
    limits,
  };
}

function buildWarnings(
  input: BasicPressureInput | AdvancedPressureInput,
  frontBar: number,
  rearBar: number
): WarningKey[] {
  const warnings = new Set<WarningKey>();
  const highestRecommendedBar = Math.max(frontBar, rearBar);

  if ("maxPressureBar" in input && isProvidedNumber(input.maxPressureBar)) {
    if (highestRecommendedBar > input.maxPressureBar) {
      warnings.add("max_rim_pressure_exceeded");
      if (input.rimType === "hookless") {
        warnings.add("hookless_limit_exceeded");
      }
    }
  }

  if (
    "rimType" in input &&
    input.rimType === "hookless" &&
    !isProvidedNumber(input.maxPressureBar) &&
    highestRecommendedBar > 3.5
  ) {
    warnings.add("hookless_max_pressure_unknown");
  }

  if (input.tubeType === "inner_tube" && Math.min(frontBar, rearBar) < 1.5) {
    warnings.add("inner_tube_pinch_flat_risk");
    warnings.add("pressure_too_low_for_setup");
  }

  if (rearBar > frontBar * 1.4) {
    warnings.add("front_rear_pressure_mismatch");
  }

  if (input.discipline === "road" && (input.widthFrontMm < 20 || input.widthFrontMm > 40)) {
    warnings.add("road_tire_width_unusual");
  }

  if (
    input.discipline === "gravel" &&
    (input.widthFrontMm < 30 || input.widthFrontMm > 65)
  ) {
    warnings.add("gravel_tire_width_unusual");
  }

  if (input.discipline === "mtb" && input.widthFrontMm < 45) {
    warnings.add("mtb_tire_width_unusual");
  }

  return [...warnings];
}

function buildExplanation(
  input: BasicPressureInput | AdvancedPressureInput,
  totalSystemMassKg: number,
  frontBar: number,
  rearBar: number,
  advanced: boolean
): string {
  const tubeLabel = input.tubeType.replace("_", " ");
  if (advanced) {
    return `Based on ${Math.round(totalSystemMassKg)} kg total load and ${input.surface}, ${input.widthRearMm}mm ${tubeLabel} tyres work best near ${rearBar} bar rear / ${frontBar} bar front.`;
  }

  return `Recommended pressure for a ${input.widthFrontMm}mm ${tubeLabel} setup on ${input.surface}.`;
}

function buildScores(
  discipline: Discipline,
  rearBar: number
): Pick<PressureOutput, "comfortScore" | "gripScore" | "efficiencyScore"> {
  const limits = PRESSURE_LIMITS[discipline];
  const ratio = clamp(
    (rearBar - limits.min) / (limits.max - limits.min),
    0,
    1
  );

  return {
    comfortScore: Math.round((1 - ratio) * 100),
    gripScore: Math.round((1 - ratio) * 100),
    efficiencyScore: Math.round(ratio * 100),
  };
}

export function calculateBasicPressure(input: BasicPressureInput): PressureOutput {
  const { totalSystemMassKg, frontBar, rearBar } = calculateRawPressure(input);

  return {
    frontBar,
    rearBar,
    frontPsi: roundPsi(frontBar),
    rearPsi: roundPsi(rearBar),
    warnings: buildWarnings(input, frontBar, rearBar),
    explanation: buildExplanation(input, totalSystemMassKg, frontBar, rearBar, false),
  };
}

export function calculateAdvancedPressure(
  input: AdvancedPressureInput
): PressureOutput {
  const { totalSystemMassKg, frontBar, rearBar } = calculateRawPressure(input);

  return {
    frontBar,
    rearBar,
    frontPsi: roundPsi(frontBar),
    rearPsi: roundPsi(rearBar),
    warnings: buildWarnings(input, frontBar, rearBar),
    explanation: buildExplanation(input, totalSystemMassKg, frontBar, rearBar, true),
    ...buildScores(input.discipline, rearBar),
  };
}

export function validatePressureInput(
  input: Partial<BasicPressureInput & Pick<AdvancedPressureInput, "currentFrontBar" | "currentRearBar">>
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isProvidedNumber(input.bodyWeightKg)) {
    errors.push({ field: "bodyWeightKg", message: "Body weight is required." });
  } else if (input.bodyWeightKg < 35 || input.bodyWeightKg > 160) {
    errors.push({
      field: "bodyWeightKg",
      message: "Body weight must be between 35 and 160 kg.",
    });
  }

  if (!isProvidedNumber(input.widthFrontMm)) {
    errors.push({
      field: "widthFrontMm",
      message: "Front tyre width is required.",
    });
  } else if (input.widthFrontMm < 18 || input.widthFrontMm > 80) {
    errors.push({
      field: "widthFrontMm",
      message: "Front tyre width must be between 18 and 80 mm.",
    });
  }

  if (!isProvidedNumber(input.widthRearMm)) {
    errors.push({
      field: "widthRearMm",
      message: "Rear tyre width is required.",
    });
  } else if (input.widthRearMm < 18 || input.widthRearMm > 80) {
    errors.push({
      field: "widthRearMm",
      message: "Rear tyre width must be between 18 and 80 mm.",
    });
  }

  if (
    isProvidedNumber(input.bikeWeightKg) &&
    (input.bikeWeightKg < 3 || input.bikeWeightKg > 20)
  ) {
    errors.push({
      field: "bikeWeightKg",
      message: "Bike weight must be between 3 and 20 kg.",
    });
  }

  if (input.ridingGoal && !GOAL_VALUES.includes(input.ridingGoal)) {
    errors.push({
      field: "ridingGoal",
      message: "Riding goal must be speed, balance, or comfort.",
    });
  }

  if (
    isProvidedNumber(input.currentFrontBar) &&
    (input.currentFrontBar < 0.8 || input.currentFrontBar > 9)
  ) {
    errors.push({
      field: "currentFrontBar",
      message: "Current front pressure must be between 0.8 and 9.0 bar.",
    });
  }

  if (
    isProvidedNumber(input.currentRearBar) &&
    (input.currentRearBar < 0.8 || input.currentRearBar > 9)
  ) {
    errors.push({
      field: "currentRearBar",
      message: "Current rear pressure must be between 0.8 and 9.0 bar.",
    });
  }

  return errors;
}
