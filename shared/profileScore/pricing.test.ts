import { describe, expect, it } from "vitest";
import { BASE_BIKE_RULES, BASE_RIDER_RULES, BIKE_REFINEMENT_RULES, REFINEMENT_RULES, RIDER_RULES, scoreBike, scoreRiderProfile } from "./index";
import type { RiderValues, ScoreRule } from "./types";

const now = Date.UTC(2026, 9, 3);
const free = { enforced: true, fullProfile: false };
const paid = { enforced: true, fullProfile: true };
const valuesFor = (rules: readonly ScoreRule[]) => Object.fromEntries(
  rules.flatMap(rule => rule.fields.map(field => [field, field === "hasPain" ? "no" : 10])),
) as RiderValues;

function bikeValues(rules: readonly ScoreRule[]) {
  const values: Record<string, unknown> = {};
  for (const rule of rules) for (const field of rule.fields) {
    const [group, key] = field.split(".");
    const value = field === "gearing.chainrings"
      || field === "gearing.cassetteTeeth" ? [30] : 10;
    if (key) values[group] = { ...(values[group] as object), [key]: value };
    else values[group] = value;
  }
  return values;
}

describe("selected-bike pricing score", () => {
  it("is 80 free and 100 paid for a fully filled bike", () => {
    const bike = bikeValues([...BASE_BIKE_RULES, ...BIKE_REFINEMENT_RULES]);
    expect(scoreBike({ bike }, now, { enforced: true, fullReport: false }).completeness).toBe(80);
    expect(scoreBike({ bike }, now, { enforced: true, fullReport: true }).completeness).toBe(100);
    expect(scoreBike({ bike }, now, { enforced: false, fullReport: false })).toEqual(scoreBike({ bike }, now));
  });
  it.each(BIKE_REFINEMENT_RULES)("uses exact $weight for $key", rule => {
    const bike = bikeValues([rule]);
    expect(scoreBike({ bike }, now, { enforced: true, fullReport: true }).completeness).toBe(rule.weight);
    expect(scoreBike({ bike }, now, { enforced: true, fullReport: false }).completeness).toBe(0);
  });
  it("has five refinement rules totaling 20, with no retired activity-import rule", () => {
    expect(BIKE_REFINEMENT_RULES).toHaveLength(5);
    expect(BIKE_REFINEMENT_RULES.reduce((total, rule) => total + rule.weight, 0)).toBe(20);
    expect(BIKE_REFINEMENT_RULES.some(rule => String(rule.key) === "strava")).toBe(false);
    expect(BIKE_REFINEMENT_RULES.flatMap(rule => [...rule.fields])
      .some(field => field.startsWith("activitySummary."))).toBe(false);
  });

  it.each([
    undefined,
    { enforced: false, fullReport: false },
    { enforced: true, fullReport: false },
    { enforced: true, fullReport: true },
  ])("ignores historical activity summaries with access %j", access => {
    const bike = bikeValues([BASE_BIKE_RULES[0], BIKE_REFINEMENT_RULES[0]]);
    const withoutActivity = scoreBike({ bike }, now, access);
    for (const source of ["strava_v1_1", "other"]) {
      for (const rideCount of [0, 10]) {
        expect(scoreBike({ bike: { ...bike, activitySummary: { source, rideCount } } }, now, access))
          .toEqual(withoutActivity);
      }
    }
  });
});

describe("pricing v3 rider scoring", () => {
  it("preserves legacy scoring when access is omitted or enforcement is off", () => {
    const profile = valuesFor(RIDER_RULES);
    expect(scoreRiderProfile({ profile }, now, { enforced: false, fullProfile: false }))
      .toEqual(scoreRiderProfile({ profile }, now));
  });

  it("awards exactly 80 for a full free base, including expired refinement values", () => {
    const profile = valuesFor([...BASE_RIDER_RULES, ...REFINEMENT_RULES]);
    const score = scoreRiderProfile({ profile }, now, free);
    expect(score.completeness).toBe(80);
    expect(score.reliability).toBeLessThanOrEqual(80);
    expect(score.items.some(item => REFINEMENT_RULES.some(rule => rule.key === item.key))).toBe(false);
    expect(score.nextStep && REFINEMENT_RULES.some(rule => rule.key === score.nextStep?.key)).toBe(false);
  });

  it("awards exactly 100 for a full paid profile", () => {
    const profile = valuesFor([...BASE_RIDER_RULES, ...REFINEMENT_RULES]);
    expect(scoreRiderProfile({ profile }, now, paid).completeness).toBe(100);
    expect(scoreRiderProfile({ profile: valuesFor(BASE_RIDER_RULES) }, now, paid).completeness).toBe(80);
  });

  it.each(REFINEMENT_RULES)("awards the board's $weight for $key only with paid access", rule => {
    const profile = valuesFor([rule]);
    expect(scoreRiderProfile({ profile }, now, paid).completeness).toBe(rule.weight);
    expect(scoreRiderProfile({ profile }, now, free).completeness).toBe(0);
  });

  it("counts zero and negative guided-test results without replacing free self-assessment", () => {
    expect(scoreRiderProfile({ profile: { flexibilityTestCm: -10, coreTestSeconds: 0 } }, now, paid).completeness).toBe(5);
    expect(scoreRiderProfile({ profile: { flexibilityTestCm: 0 } }, now, paid).completeness).toBe(3);
    expect(scoreRiderProfile({ profile: { flexibilityScore: "average", coreStabilityScore: 3 } }, now, free).completeness).toBeGreaterThan(0);
  });
});
