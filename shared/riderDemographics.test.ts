import { afterEach, describe, expect, it, vi } from "vitest";
import { ageFromBirthDate, RIDER_SEX_VALUES, validateBirthDate } from "./riderDemographics";

const now = Date.UTC(2026, 9, 3, 12);
afterEach(() => vi.restoreAllMocks());

describe("rider demographics validation", () => {
  it("exposes only the three explicit sex choices, including non-disclosure", () => {
    expect(RIDER_SEX_VALUES).toEqual(["female", "male", "prefer_not_to_say"]);
  });

  it.each([
    ["1990-10-02", 36], ["1990-10-03", 36], ["1990-10-04", 35],
    ["2000-02-29", 26], ["2026-10-03", 0],
  ] as const)("calculates age from the actual birthday %s", (date, age) => {
    expect(ageFromBirthDate(date, now)).toBe(age);
  });

  it("uses UTC calendar boundaries rather than local offsets or elapsed 365-day years", () => {
    expect(ageFromBirthDate("1990-10-03", Date.parse("2026-10-03T00:30:00+02:00"))).toBe(35);
    expect(ageFromBirthDate("2000-02-29", Date.UTC(2025, 1, 28, 23, 59))).toBe(24);
    expect(ageFromBirthDate("2000-02-29", Date.UTC(2025, 2, 1))).toBe(25);
  });

  it.each([
    "1991-02-29", "1900-02-29", "1990-04-31", "2000-02-30", "1990-00-10", "1990-13-01", "1990-01-00",
    "1990-1-01", "90-01-01", "01-01-1990", "1990-01-01T00:00:00Z", " 1990-01-01", "1990-01-01 ", "", "not-a-date",
    "2026-10-04", "2027-01-01",
  ])("rejects malformed, impossible, or future date %s", (date) => {
    expect(ageFromBirthDate(date, now)).toBeNull();
    expect(() => validateBirthDate(date, now)).toThrow("Invalid birth date");
  });

  it.each([NaN, Infinity, -Infinity, 9e15])("rejects an invalid clock %s", (clock) => {
    expect(ageFromBirthDate("1990-01-01", clock)).toBeNull();
    expect(() => validateBirthDate("1990-01-01", clock)).toThrow("Invalid birth date");
  });

  it.each(["2016-10-03", "1926-10-03", "1925-10-04", "2000-02-29"])("accepts calendar ages within 10–100 inclusive: %s", (date) => {
    expect(validateBirthDate(date, now)).toBe(date);
  });

  it.each(["2016-10-04", "1925-10-03", "2026-10-03"])("enforces age bounds independently of date parsing: %s", (date) => {
    expect(ageFromBirthDate(date, now)).not.toBeNull();
    expect(() => validateBirthDate(date, now)).toThrow("Invalid birth date");
  });

  it.each([undefined, null, 19900101, true, {}, ["1990-01-01"]])("rejects non-string birth date %j", (value) => {
    expect(() => validateBirthDate(value, now)).toThrow("Invalid birth date");
  });

  it("uses the current clock when no explicit clock is supplied", () => {
    vi.spyOn(Date, "now").mockReturnValue(now);
    expect(validateBirthDate("2016-10-03")).toBe("2016-10-03");
    expect(() => validateBirthDate("2016-10-04")).toThrow("Invalid birth date");
  });
});
