import { PROFILE_OBSERVATION_FIELDS } from "./profileObservationFields";

export const calculatorProfileField = (field: string) => field === "ridingGoal" ? "positionPriority" : field;

export function isProfileCalculatorField(field: string): boolean {
  return Object.hasOwn(PROFILE_OBSERVATION_FIELDS, calculatorProfileField(field));
}

export function calculatorDataKey(entry: { field: string; calculator: string }): string {
  return isProfileCalculatorField(entry.field) ? entry.field : `${entry.calculator}:${entry.field}`;
}
