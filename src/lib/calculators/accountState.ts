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

type Profile = {
  weightKg?: number; ftpWatts?: number;
  heightCm?: number; inseamCm?: number; flexibilityScore?: string; coreStabilityScore?: number;
  ridingGoal?: string; positionPriority?: string;
};
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
  calculator: K, saved: CalculatorValues<K> | null | undefined, profile?: Profile | null,
): { values: CalculatorValues<K>; fromProfile: boolean } {
  if (saved) return { values: saved, fromProfile: false };
  const values: Record<string, unknown> = { ...calculatorDefaults[calculator] };
  let fromProfile = false;
  if ("values" in values) {
    const inputs = { ...performanceDefaults.values };
    if (calculator !== "fuel-hydration" && inRange(profile?.weightKg, 40, 150)) {
      inputs.riderMass = profile.weightKg;
      fromProfile = true;
    }
    if (calculator !== "fuel-hydration" && inRange(profile?.ftpWatts, 80, 500)) {
      inputs.ftp = profile.ftpWatts;
      if (calculator === "power-speed") inputs.power = profile.ftpWatts;
      fromProfile = true;
    }
    // Comparison starts at both tables; no inference from a rider's sex/gender.
    return { values: { ...values, values: inputs } as CalculatorValues<K>, fromProfile };
  }
  if (inRange(profile?.inseamCm, 55, 105)) {
    values.inseamCm = profile.inseamCm;
    if (calculator === "saddle-height") values.source = "measured";
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
    const goal = calculator === "bike-fit" ? profile.positionPriority ?? profile.ridingGoal : profile.ridingGoal;
    if (["comfort", "balanced", "performance", "aero"].includes(goal ?? "")) {
      values.ambition = goal;
      fromProfile = true;
    }
  }
  return { values: values as CalculatorValues<K>, fromProfile };
}
