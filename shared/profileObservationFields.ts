import { PROFILE_RANGES } from "./profileBounds";
import { RIDER_SEX_VALUES, validateBirthDate } from "./riderDemographics";

export type ProfileObservationValue = number | string | string[];
export type ProfileObservationKind = "measured" | "estimated" | "derived" | "declared";
type FieldDefinition = {
  unit: string;
  kind: ProfileObservationKind;
  range?: readonly [number, number];
  options?: readonly string[];
};

export const PROFILE_OBSERVATION_FIELDS: Record<string, FieldDefinition> = {
  ...Object.fromEntries(Object.entries(PROFILE_RANGES).map(([field, range]) => [field, {
    range,
    unit: field.endsWith("Cm") ? "cm" : field.endsWith("Mm") ? "mm"
      : field === "weightKg" ? "kg" : field === "ftpWatts" ? "W" : field === "coreTestSeconds" ? "s"
        : ["coreStabilityScore", "painSeverity"].includes(field) ? "score" : "none",
    kind: ["coreStabilityScore", "painSeverity"].includes(field) ? "estimated"
      : ["age", "shoeSizeEu"].includes(field) ? "declared" : "measured",
  } satisfies FieldDefinition])),
  flexibilityScore: { unit: "score", kind: "estimated",
    options: ["very_limited", "limited", "average", "good", "excellent"] },
  experienceLevel: { unit: "none", kind: "declared", options: ["beginner", "intermediate", "advanced"] },
  weeklyHours: { unit: "none", kind: "declared", options: ["0-3", "3-6", "6-10", "10-15", "15+"] },
  typicalRideLength: { unit: "none", kind: "declared", options: ["short", "medium", "long", "ultra"] },
  positionPriority: { unit: "none", kind: "declared", options: ["comfort", "balanced", "performance"] },
  hasPain: { unit: "none", kind: "declared", options: ["yes", "no"] },
  painAreas: { unit: "none", kind: "declared" },
  kneePainTiming: { unit: "none", kind: "declared" },
  ftpMethod: { unit: "none", kind: "declared" },
  cleatSystem: { unit: "none", kind: "declared" },
  sweatProfile: { unit: "none", kind: "declared" },
  sex: { unit: "none", kind: "declared", options: RIDER_SEX_VALUES },
  birthDate: { unit: "date", kind: "declared" },
};

export function equalProfileObservationValues(first: unknown, second: unknown): boolean {
  return Array.isArray(first) && Array.isArray(second)
    ? first.length === second.length && first.every((value, index) => value === second[index])
    : first === second;
}

export function validateProfileObservationValue(field: string, value: unknown): ProfileObservationValue {
  const definition = Object.hasOwn(PROFILE_OBSERVATION_FIELDS, field) ? PROFILE_OBSERVATION_FIELDS[field] : undefined;
  if (!definition) throw new Error("Invalid profile field");
  if (field === "birthDate") return validateBirthDate(value);
  if (definition.range) {
    if (typeof value !== "number" || !Number.isFinite(value)
      || value < definition.range[0] || value > definition.range[1]
      || (["coreStabilityScore", "painSeverity", "age"].includes(field) && !Number.isInteger(value))) {
      throw new Error("Invalid profile value");
    }
    return value;
  }
  if (field === "painAreas") {
    if (!Array.isArray(value) || value.length > 20 || value.some(item =>
      typeof item !== "string" || !item.trim() || item.length > 100)) throw new Error("Invalid profile value");
    return value;
  }
  if (typeof value !== "string" || !value.trim() || value.length > 100
    || (definition.options && !definition.options.includes(value))) throw new Error("Invalid profile value");
  return value;
}
