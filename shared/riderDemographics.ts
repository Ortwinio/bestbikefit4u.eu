import { PROFILE_RANGES } from "./profileBounds";

export const RIDER_SEX_VALUES = ["female", "male", "prefer_not_to_say"] as const;
export type RiderSex = typeof RIDER_SEX_VALUES[number];

export function ageFromBirthDate(birthDate: string, now: number): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !Number.isFinite(now)) return null;
  const date = new Date(`${birthDate}T00:00:00.000Z`);
  const today = new Date(now);
  if (!Number.isFinite(date.getTime()) || !Number.isFinite(today.getTime())
    || date.toISOString().slice(0, 10) !== birthDate || date.getTime() > now) return null;
  const birthdayPending = today.getUTCMonth() < date.getUTCMonth()
    || (today.getUTCMonth() === date.getUTCMonth() && today.getUTCDate() < date.getUTCDate());
  return today.getUTCFullYear() - date.getUTCFullYear() - Number(birthdayPending);
}

export function validateBirthDate(value: unknown, now = Date.now()): string {
  const age = typeof value === "string" ? ageFromBirthDate(value, now) : null;
  if (typeof value !== "string" || age === null || age < PROFILE_RANGES.age[0] || age > PROFILE_RANGES.age[1]) {
    throw new Error("Invalid birth date");
  }
  return value;
}
