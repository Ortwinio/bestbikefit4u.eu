import { TOOL_RANGES } from "@/lib/public-calculators/performance";
import type { PerformanceValues } from "../../../convex/calculatorStates/validators";
import type { CalculatorId, CalculatorValues, CalculatorState } from "../../../convex/calculatorStates/validators";

export const performanceDefaults: PerformanceValues = {
  values: Object.fromEntries(
    Object.entries(TOOL_RANGES).map(([key, range]) => [key, range.initial]),
  ) as PerformanceValues["values"],
  bike: "road", surface: "road", mode: "power", comparison: "both", method: "known",
  intensity: "endurance", sweat: "medium",
};
export const calculatorDefaults = {
  "power-speed": performanceDefaults, "climb-planner": performanceDefaults,
  "ftp-wkg": performanceDefaults, "fuel-hydration": performanceDefaults,
  "saddle-height": {
    inseamCm: 84, source: "missing", category: "road", ambition: "balanced", flexibility: 3,
    core: 3, compare: false, current: 750, currentConfirmed: false,
  },
  "frame-size": { heightCm: 180, inseamCm: 84, heightConfirmed: false, inseamConfirmed: false, category: "road" },
  "crank-length": { inseamCm: 84, category: "road", confirmed: false },
  "bike-fit": {
    heightCm: 180, inseamCm: 84, source: "missing", category: "road", ambition: "balanced", flexibility: 3, core: 3,
  },
} satisfies { [K in CalculatorId]: CalculatorValues<K> };

export type CalculatorProfile = {
  weightKg?: number; ftpWatts?: number;
  heightCm?: number; inseamCm?: number; flexibilityScore?: string; coreStabilityScore?: number;
  ridingGoal?: string; positionPriority?: string; ftpMethod?: string; sweatProfile?: string;
};
export interface CalculatorBike {
  bikeType?: string; bikeWeightKg?: number; primaryGoal?: string;
  currentSetup?: { saddleHeightMm?: number; crankLengthMm?: number };
}
const inRange = (value: number | undefined, min: number, max: number): value is number =>
  value !== undefined && Number.isFinite(value) && value >= min && value <= max;

export function validCalculatorState(state: CalculatorState): boolean {
  if ("values" in state.values) {
    const inputs = state.values.values;
    return Object.entries(TOOL_RANGES).every(([key, range]) =>
      inRange(inputs[key as keyof typeof TOOL_RANGES], range.min, range.max));
  }
  const value = state.values;
  if (!inRange(value.inseamCm, 55, 105)) return false;
  if (state.calculator === "frame-size") return inRange(state.values.heightCm, 130, 210);
  if (state.calculator === "bike-fit") {
    return inRange(state.values.heightCm, 130, 210)
      && inRange(state.values.flexibility, 1, 5) && Number.isInteger(state.values.flexibility)
      && inRange(state.values.core, 1, 5) && Number.isInteger(state.values.core);
  }
  if (state.calculator === "saddle-height") {
    return inRange(state.values.current, 400, 1100)
      && inRange(state.values.flexibility, 1, 5) && Number.isInteger(state.values.flexibility)
      && inRange(state.values.core, 1, 5) && Number.isInteger(state.values.core);
  }
  return true;
}

export function resolveCalculatorValues<K extends CalculatorId>(
  calculator: K, saved: CalculatorValues<K> | null | undefined, profile?: CalculatorProfile | null,
  bike?: CalculatorBike | null,
): { values: CalculatorValues<K>; fromProfile: boolean } {
  const defaults = calculatorDefaults[calculator];
  const values: Record<string, unknown> = { ...defaults, ...saved };
  // Saved states retain preferences only. Body/bike observations always come from the live account.
  const authoritative = ["inseamCm", "heightCm", "source", "inseamConfirmed", "heightConfirmed", "confirmed",
    "flexibility", "core", "category", "ambition", "current", "currentConfirmed"];
  for (const key of authoritative) {
    if (!bike && ["category", "current", "currentConfirmed"].includes(key)) continue;
    if (key in defaults) values[key] = (defaults as Record<string, unknown>)[key];
  }
  let fromProfile = false;
  if ("values" in values) {
    const inputs = { ...performanceDefaults.values, ...((saved as PerformanceValues | undefined)?.values ?? {}) };
    inputs.riderMass = performanceDefaults.values.riderMass;
    inputs.ftp = performanceDefaults.values.ftp;
    if (bike) {
      inputs.bikeMass = performanceDefaults.values.bikeMass;
      values.bike = performanceDefaults.bike;
    }
    values.sweat = performanceDefaults.sweat;
    values.method = performanceDefaults.method;
    if (inRange(profile?.weightKg, 40, 150)) {
      inputs.riderMass = profile.weightKg;
      fromProfile = true;
    }
    if (inRange(profile?.ftpWatts, 80, 500)) {
      inputs.ftp = profile.ftpWatts;
      if (calculator === "power-speed" && !saved) inputs.power = profile.ftpWatts;
      fromProfile = true;
    }
    if (inRange(bike?.bikeWeightKg, TOOL_RANGES.bikeMass.min, TOOL_RANGES.bikeMass.max)) {
      inputs.bikeMass = bike.bikeWeightKg;
    }
    if (["road", "gravel", "mountain", "city", "tt_triathlon"].includes(bike?.bikeType ?? "")) {
      values.bike = bike!.bikeType;
    }
    // An already stored FTP is a known wattage; its protocol does not supply raw ramp/20-minute power.
    values.method = "known";
    if (["low", "medium", "high"].includes(profile?.sweatProfile ?? "")) values.sweat = profile!.sweatProfile;
    // Comparison starts at both tables; no inference from a rider's sex/gender.
    return { values: { ...values, values: inputs } as CalculatorValues<K>, fromProfile };
  }
  if (inRange(profile?.inseamCm, 55, 105)) {
    values.inseamCm = profile.inseamCm;
    if (calculator === "saddle-height") values.source = "estimated";
    if (calculator === "frame-size") values.inseamConfirmed = true;
    if (calculator === "crank-length") values.confirmed = true;
    fromProfile = true;
  }
  if ((calculator === "frame-size" || calculator === "bike-fit") && inRange(profile?.heightCm, 130, 210)) {
    values.heightCm = profile.heightCm;
    if (calculator === "frame-size") values.heightConfirmed = true;
    fromProfile = true;
  }
  if (calculator === "bike-fit" && inRange(profile?.heightCm, 130, 210) && inRange(profile?.inseamCm, 55, 105)) {
    values.source = "estimated";
  }
  if ((calculator === "saddle-height" || calculator === "bike-fit") && profile) {
    const score = ["very_limited", "limited", "average", "good", "excellent"].indexOf(profile.flexibilityScore ?? "");
    if (score >= 0) { values.flexibility = score + 1; fromProfile = true; }
    if (inRange(profile.coreStabilityScore, 1, 5) && Number.isInteger(profile.coreStabilityScore)) {
      values.core = profile.coreStabilityScore;
      fromProfile = true;
    }
    const goal = bike?.primaryGoal === "aerodynamics" ? "aero"
      : bike?.primaryGoal ?? profile.positionPriority ?? profile.ridingGoal;
    if (["comfort", "balanced", "performance", "aero"].includes(goal ?? "")) {
      values.ambition = goal;
      fromProfile = true;
    }
  }
  if (bike?.bikeType) {
    const category = bike.bikeType === "mountain" ? "mtb" : bike.bikeType;
    if (["road", "gravel", "mtb", "city"].includes(category)) values.category = category;
  }
  if (calculator === "saddle-height" && inRange(bike?.currentSetup?.saddleHeightMm, 400, 1100)) {
    values.current = bike.currentSetup.saddleHeightMm;
    values.currentConfirmed = true;
    values.compare = true;
  }
  return { values: values as CalculatorValues<K>, fromProfile };
}
