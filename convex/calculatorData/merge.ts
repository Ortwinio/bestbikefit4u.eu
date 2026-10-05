import { HANDOFF_FIELD_UNITS } from "../../src/lib/handoff/store";
import { PROFILE_OBSERVATION_FIELDS, validateProfileObservationValue } from "../../shared/profileObservationFields";
import type { CalculatorInput } from "./validators";
import { calculatorProfileField } from "../../shared/calculatorDataScope";

const quality = { measured: 4, declared: 3, estimated: 2, derived: 1 };
const ranges: Record<string, readonly [number, number]> = {
  powerWatts: [0, 2500], speedKph: [0, 150], bikeWeightKg: [1, 100], gradientPercent: [-40, 40],
  distanceKm: [0, 2000], durationMinutes: [0, 10080], temperatureC: [-50, 60], bottleSizeMl: [50, 5000],
  twentyMinuteWatts: [1, 2500], rampWatts: [1, 2500], currentSaddleHeightMm: [300, 1200],
  currentCrankLengthMm: [100, 220], currentSaddleWidthMm: [80, 250], tireWidthFrontMm: [18, 120],
  tireWidthRearMm: [18, 120], outerChainringTeeth: [20, 70], innerChainringTeeth: [20, 70],
  cassetteSmallestCogTeeth: [9, 60], cassetteLargestCogTeeth: [9, 60],
};
export const profileField = calculatorProfileField;
export const inputKind = (entry: CalculatorInput) => entry.kind
  ?? (entry.method === "bike" ? "declared" : entry.method === "measured" ? "measured"
    : entry.method === "estimated" ? "estimated" : "declared");

export function shouldReplace(current: CalculatorInput | undefined, incoming: CalculatorInput) {
  if (!current) return true;
  const currentQuality = quality[inputKind(current)];
  const incomingQuality = quality[inputKind(incoming)];
  return incomingQuality > currentQuality || (incomingQuality === currentQuality && incoming.touchedAt > current.touchedAt);
}

export function validateInput(entry: CalculatorInput, now: number): CalculatorInput {
  const units: Record<string, string> = HANDOFF_FIELD_UNITS;
  if (!Object.hasOwn(units, entry.field) || units[entry.field] !== entry.unit
    || !Number.isSafeInteger(entry.touchedAt) || entry.touchedAt <= 0 || entry.touchedAt > now + 60_000
    || !entry.method.trim() || entry.method.length > 100 || !entry.calculator.trim() || entry.calculator.length > 100
    || (entry.measurementMethod !== undefined && (!entry.measurementMethod.trim() || entry.measurementMethod.length > 100))
    || (entry.repeatCount !== undefined && (!Number.isInteger(entry.repeatCount) || entry.repeatCount < 1 || entry.repeatCount > 100))) {
    throw new Error("INVALID_CALCULATOR_INPUT");
  }
  const target = profileField(entry.field);
  let value = entry.value;
  if (target === "flexibilityScore" && typeof value === "number") {
    value = ["very_limited", "limited", "average", "good", "excellent"][value - 1];
  }
  if (Object.hasOwn(PROFILE_OBSERVATION_FIELDS, target)) validateProfileObservationValue(target, value);
  else if (entry.unit === "none") {
    if (typeof value !== "string" || !value.trim() || value.length > 120) throw new Error("INVALID_CALCULATOR_INPUT");
  } else if (typeof value !== "number" || !Number.isFinite(value)
    || value < (ranges[entry.field]?.[0] ?? 0) || value > (ranges[entry.field]?.[1] ?? 10000)
    || (entry.unit === "teeth" && !Number.isInteger(value))) {
    throw new Error("INVALID_CALCULATOR_INPUT");
  }
  return { ...entry, kind: inputKind(entry) };
}
