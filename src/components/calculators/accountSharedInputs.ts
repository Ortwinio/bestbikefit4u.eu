import type { CalculatorId, CalculatorValues, PerformanceValues } from "../../../convex/calculatorStates/validators";
import { HANDOFF_FIELD_UNITS, type HandoffEntry, type HandoffField } from "@/lib/handoff/store";
import { TOOL_RANGES } from "@/lib/public-calculators/performance";

interface SharedInput {
  field: HandoffField;
  key: keyof PerformanceValues["values"];
  factor?: number;
}
const inputs: Partial<Record<CalculatorId, SharedInput[]>> = {
  "power-speed": [
    { field: "powerWatts", key: "power" }, { field: "speedKph", key: "speed" },
    { field: "gradientPercent", key: "gradient" },
  ],
  "climb-planner": [
    { field: "powerWatts", key: "power" }, { field: "gradientPercent", key: "climbGradient" },
    { field: "distanceKm", key: "distance" },
  ],
  "ftp-wkg": [{ field: "twentyMinuteWatts", key: "twentyMinute" }, { field: "rampWatts", key: "ramp" }],
  "fuel-hydration": [
    { field: "durationMinutes", key: "duration", factor: 60 },
    { field: "temperatureC", key: "temperature" }, { field: "bottleSizeMl", key: "bottleSize" },
  ],
};
const choices = {
  "power-speed": { field: "surface", key: "surface", values: ["road", "gravel", "mtb", "commuter"] },
  "fuel-hydration": { field: "intensity", key: "intensity", values: ["easy", "endurance", "tempo", "race"] },
} as const;

export function prefillAccountSharedInputs<K extends CalculatorId>(
  calculator: K, values: CalculatorValues<K>, entries: HandoffEntry[], savedAt = 0,
): { values: CalculatorValues<K>; used: HandoffEntry[] } {
  if (!("values" in values)) return { values, used: [] };
  const next = { ...values, values: { ...values.values } };
  const used: HandoffEntry[] = [];
  for (const input of inputs[calculator] ?? []) {
    const entry = entries.find(item => item.field === input.field && item.calculator === calculator && item.touchedAt > savedAt);
    if (!entry || typeof entry.value !== "number") continue;
    const value = entry.value / (input.factor ?? 1);
    const range = TOOL_RANGES[input.key];
    if (!Number.isFinite(value) || value < range.min || value > range.max) continue;
    next.values[input.key] = value;
    used.push(entry);
  }
  const choice = calculator === "power-speed" ? choices["power-speed"]
    : calculator === "fuel-hydration" ? choices["fuel-hydration"] : null;
  if (choice) {
    const entry = entries.find(item => item.field === choice.field && item.calculator === calculator && item.touchedAt > savedAt);
    if (entry && typeof entry.value === "string" && (choice.values as readonly string[]).includes(entry.value)) {
      Object.assign(next, { [choice.key]: entry.value });
      used.push(entry);
    }
  }
  return { values: next as CalculatorValues<K>, used };
}

export function changedAccountSharedInputs<K extends CalculatorId>(
  calculator: K, previous: CalculatorValues<K>, next: CalculatorValues<K>,
): HandoffEntry[] {
  if (!("values" in previous) || !("values" in next)) return [];
  const changes: HandoffEntry[] = (inputs[calculator] ?? []).flatMap(input => {
    const value = next.values[input.key];
    const range = TOOL_RANGES[input.key];
    if (value === previous.values[input.key] || !Number.isFinite(value)
      || value < range.min || value > range.max) return [];
    return [{ field: input.field, value: value * (input.factor ?? 1),
      unit: HANDOFF_FIELD_UNITS[input.field], calculator, method: "declared" as const,
      kind: "declared" as const, touchedAt: Date.now() }];
  });
  const choice = calculator === "power-speed" ? choices["power-speed"]
    : calculator === "fuel-hydration" ? choices["fuel-hydration"] : null;
  if (choice && next[choice.key] !== previous[choice.key]
    && (choice.values as readonly string[]).includes(next[choice.key])) {
    changes.push({ field: choice.field, value: next[choice.key], unit: "none", calculator,
      method: "declared", kind: "declared", touchedAt: Date.now() });
  }
  return changes;
}
