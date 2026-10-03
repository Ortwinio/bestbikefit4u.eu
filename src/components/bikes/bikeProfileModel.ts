import { BIKE_RULES } from "../../../shared/profileScore/rules";
import { BIKE_PROFILE_FIELDS } from "../../../shared/bikeProfileFields";
import type { Locale } from "@/i18n/config";
import type { BikeProfileCopy } from "@/i18n/account/bikeProfile";

export function bikeProfileValue(object: unknown, field: string): unknown {
  return field.split(".").reduce<unknown>((value, key) => value && typeof value === "object"
    ? (value as Record<string, unknown>)[key] : undefined, object);
}
export const bikeProfileRows = BIKE_RULES.filter((rule) => rule.key !== "bikeGoal").map((rule) => ({
  key: rule.key, group: rule.group, fields: [...rule.fields],
  editable: rule.fields.filter((field) => Object.hasOwn(BIKE_PROFILE_FIELDS, field)),
}));
export function displayBikeProfileValue(value: unknown, unit: string | undefined, locale: Locale, copy: BikeProfileCopy) {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.join(" / ");
  if (typeof value === "string") return copy.values[value as keyof typeof copy.values] ?? value;
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const suffix = unit === "degrees" ? "°" : unit && unit !== "none" ? ` ${unit}` : "";
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}${suffix}`;
}
export function bikeFieldUnit(field: string) {
  return BIKE_PROFILE_FIELDS[field]?.unit ?? (field.endsWith("Mm") ? "mm" : field.endsWith("Cm") ? "cm"
    : field.endsWith("Kg") ? "kg" : "none");
}
const adviceFields: Record<string, string> = {
  "currentSetup.saddleHeightMm": "saddleHeightMm", "currentSetup.saddleSetbackMm": "saddleSetbackMm",
  "currentSetup.handlebarReachMm": "handlebarReachMm", "currentSetup.handlebarDropMm": "handlebarDropMm",
  "currentSetup.stemLengthMm": "stemLengthMm", "currentSetup.crankLengthMm": "crankLengthMm",
  "currentSetup.handlebarWidthMm": "handlebarWidthMm", "currentGeometry.stackMm": "recommendedStackMm",
  "currentGeometry.reachMm": "recommendedReachMm",
};
export function actualBikeAdvice(fit: unknown, field: string): number | undefined {
  const value = adviceFields[field] ? bikeProfileValue(fit, adviceFields[field]) : undefined;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
export function parseBikeProfileDraft(field: string, draft: string): number | string | null {
  const definition = BIKE_PROFILE_FIELDS[field];
  if (!definition || !draft.trim()) return null;
  if (!definition.range) return draft.trim().length <= 100 ? draft.trim() : null;
  const value = Number(draft.replace(",", "."));
  return Number.isFinite(value) && value >= definition.range[0] && value <= definition.range[1] ? value : null;
}
