import { describe, expect, it } from "vitest";
import { BIKE_RULES, RIDER_RULES, profileScoreLevel, scoreBike, scoreRiderProfile } from "./index";
import type { BikeValues, RiderValues, ScoreObservation, ScoreRule } from "./types";

const now = Date.UTC(2026, 9, 3);

function valuesFor(rules: readonly ScoreRule[]) {
  const values: Record<string, unknown> = {};
  for (const rule of rules) {
    for (const field of rule.fields) {
      const path = field.split(".");
      let target = values;
      for (const key of path.slice(0, -1)) {
        target[key] ??= {};
        target = target[key] as Record<string, unknown>;
      }
      target[path.at(-1)!] = field === "hasPain" ? "no" : field === "painAreas" ? [] : 10;
    }
  }
  return values;
}

describe("rider weights", () => {
  it.each(RIDER_RULES)("awards exactly $weight completeness for $key", rule => {
    const score = scoreRiderProfile({ profile: valuesFor([rule]) as RiderValues }, now);
    expect(score.completeness).toBe(rule.weight);
    expect(score.items.find(item => item.key === rule.key)?.complete).toBe(true);
  });

  it("has exactly 100 points and a group breakdown that sums to the total", () => {
    const score = scoreRiderProfile({ profile: valuesFor(RIDER_RULES) as RiderValues }, now);
    expect(score.completeness).toBe(100);
    expect(RIDER_RULES.reduce((sum, rule) => sum + rule.weight, 0)).toBe(100);
    expect(score.groups.reduce((sum, group) => sum + group.completeness, 0)).toBe(100);
    expect(score.groups.reduce((sum, group) => sum + group.reliability, 0)).toBeCloseTo(score.reliability, 1);
  });

  it("requires all compound fields, but no pain is a complete answer", () => {
    expect(scoreRiderProfile({ profile: { experienceLevel: "beginner" } }, now).completeness).toBe(0);
    expect(scoreRiderProfile({ profile: { shoeSizeEu: 42 } }, now).completeness).toBe(0);
    expect(scoreRiderProfile({ profile: { hasPain: "yes", painAreas: [] } }, now).completeness).toBe(0);
    expect(scoreRiderProfile({ profile: { hasPain: "yes", painAreas: ["knee"] } }, now).completeness).toBe(6);
    expect(scoreRiderProfile({ profile: { hasPain: "no", painAreas: [] } }, now).completeness).toBe(6);
  });
});

describe("quality and provenance", () => {
  it.each([
    [{ kind: "measured", repeatCount: 3, withinTolerance: true }, 1],
    [{ kind: "measured", repeatCount: 2, withinTolerance: true }, 0.85],
    [{ kind: "measured", repeatCount: 3, withinTolerance: false }, 0.85],
    [{ kind: "measured", repeatCount: Infinity, withinTolerance: true }, 0.85],
    [{ kind: "measured", repeatCount: 3.5, withinTolerance: true }, 0.85],
    [{ kind: "measured", method: "fitter" }, 0.95],
    [{ kind: "measured", method: "video" }, 0.95],
    [{ kind: "measured" }, 0.85],
    [{ kind: "estimated" }, 0.6],
    [{ kind: "declared" }, 0.6],
    [{ kind: "derived", method: "fitter", repeatCount: 3, withinTolerance: true }, 0.3],
  ] as const)("uses %j at factor %s", (metadata, factor) => {
    const score = scoreRiderProfile({ profile: { inseamCm: 81 }, observations: [
      { field: "inseamCm", value: 81, ...metadata },
    ] }, now);
    expect(score.reliability).toBe(20 * factor);
  });

  it("halves quality for unresolved warnings, without reducing completeness", () => {
    const score = scoreRiderProfile({ profile: { inseamCm: 81 }, observations: [
      { field: "inseamCm", kind: "measured", unresolvedWarning: true },
    ] }, now);
    expect(score.completeness).toBe(20);
    expect(score.reliability).toBe(8.5);
  });

  it("uses documented legacy defaults without inventing dates", () => {
    const score = scoreRiderProfile({ profile: { inseamCm: 81, flexibilityScore: "average", positionPriority: "comfort" } }, now);
    expect(score.reliability).toBe(23.6);
    expect(score.items.find(item => item.key === "flexibility")?.missingDate).toBe(true);
  });

  it("ignores superseded, wrong-value and bike observations", () => {
    const observations: ScoreObservation[] = [
      { field: "inseamCm", value: 81, kind: "derived", status: "superseded" },
      { field: "inseamCm", value: 85, kind: "derived", status: "current" },
      { field: "inseamCm", value: 81, kind: "derived", bikeId: "another-bike" },
    ];
    expect(scoreRiderProfile({ profile: { inseamCm: 81 }, observations }, now).reliability).toBe(17);
  });

  it("uses the latest matching current observation and never counts rows as repeated measurement", () => {
    const observations: ScoreObservation[] = [1, 2, 3].map(recordedAt => ({
      field: "inseamCm", kind: "measured", recordedAt, status: "current", value: 81,
    }));
    expect(scoreRiderProfile({ profile: { inseamCm: 81 }, observations }, now).reliability).toBe(17);
    observations.push({ field: "inseamCm", value: 81, kind: "derived", recordedAt: 4 });
    expect(scoreRiderProfile({ profile: { inseamCm: 81 }, observations }, now).reliability).toBe(6);
  });
});

describe("freshness", () => {
  it("clamps month-end freshness boundaries instead of overflowing into the next month", () => {
    const monthEnd = Date.UTC(2026, 7, 31);
    const boundary = Date.UTC(2026, 1, 28);
    const score = (recordedAt: number) => scoreRiderProfile({ profile: { weightKg: 75 },
      observations: [{ field: "weightKg", kind: "measured", recordedAt }] }, monthEnd);
    expect(score(boundary).reliability).toBe(5.1);
    expect(score(boundary - 1).reliability).toBe(4.1);
  });

  it.each([
    ["weightKg", 6, 6], ["ftpWatts", 6, 5], ["flexibilityScore", 12, 8],
  ] as const)("only ages %s after %s calendar months", (field, months, weight) => {
    const boundary = Date.UTC(2026, 9 - months, 3);
    const scoreAt = (recordedAt: number) => scoreRiderProfile({
      profile: { [field]: field === "flexibilityScore" ? "average" : 75 },
      observations: [{ field, kind: "measured", recordedAt }],
    }, now);
    expect(scoreAt(boundary).items.find(item => item.weight === weight && item.complete)?.freshness).toBe(1);
    const old = scoreAt(boundary - 1);
    expect(old.completeness).toBe(weight);
    expect(old.reliability).toBe(Math.round(weight * 0.85 * 0.8 * 10) / 10);
  });

  it("does not age adult body dimensions", () => {
    expect(scoreRiderProfile({ profile: { heightCm: 174, age: 18 }, observations: [
      { field: "heightCm", kind: "measured", recordedAt: 0 },
    ] }, now).reliability).toBe(8.5);
  });

  it("ages height for under-18 riders after twelve months", () => {
    expect(scoreRiderProfile({ profile: { heightCm: 174, age: 17 }, observations: [
      { field: "heightCm", kind: "measured", recordedAt: Date.UTC(2025, 9, 2) },
    ] }, now).reliability).toBe(6.8);
  });

  it("uses existing weight and FTP timestamps when observations have no date", () => {
    const score = scoreRiderProfile({ profile: { weightKg: 75, weightUpdatedAt: 0, ftpWatts: 220, ftpMeasuredAt: 0 } }, now);
    expect(score.items.filter(item => item.complete).map(item => item.freshness)).toEqual([0.8, 0.8]);
  });

  it("flags future or absent dates without pretending they establish freshness", () => {
    const score = scoreRiderProfile({ profile: { weightKg: 75 }, observations: [
      { field: "weightKg", recordedAt: now + 1, kind: "measured" },
    ] }, now);
    expect(score.items.find(item => item.key === "weight")?.missingDate).toBe(true);
  });
});

describe("bike rules", () => {
  it.each([["measured", 10], ["declared", 6], ["derived", 3]] as const)(
    "keeps %s authoritative when B supplies a saddle measurement point", (kind, reliability) => {
      const bike: BikeValues = { _id: "bike-one", currentSetup: {
        saddleHeightMm: 728,
        saddleHeightMeasurement: { measurePoint: "bb_center_to_saddle_top", measuredAt: now, source: "public_handoff" },
      } };
      expect(scoreBike({ bike, observations: [{ field: "currentSetup.saddleHeightMm", value: 728,
        kind, bikeId: "bike-one", recordedAt: now }] }, now).reliability).toBe(reliability);
      expect(scoreBike({ bike, observations: [{ field: "currentSetup.saddleHeightMm", value: 728,
        kind: "measured", bikeId: "another-bike", recordedAt: now }] }, now).reliability).toBe(6);
    });

  it.each(BIKE_RULES)("awards exactly $weight for $key", rule => {
    expect(scoreBike({ bike: valuesFor([rule]) as BikeValues }, now).completeness).toBe(rule.weight);
  });

  it("sums to 100 with the specified seven group weights", () => {
    const score = scoreBike({ bike: valuesFor(BIKE_RULES) as BikeValues }, now);
    expect(score.completeness).toBe(100);
    expect(score.groups.map(group => group.weight)).toEqual([38, 22, 15, 10, 6, 5, 4]);
  });

  it.each([
    [{ kind: "measured", measurePoint: "bb_center_to_saddle_top" }, 1],
    [{ source: "geometry_database" }, 0.95],
    [{ method: "component_label" }, 0.9],
    [{ source: "strava_import" }, 0.7],
    [{ source: "listing_import" }, 0.7],
    [{ kind: "estimated" }, 0.6],
    [{ kind: "measured" }, 0.6],
    [{ kind: "derived", measurePoint: "bb_center_to_saddle_top" }, 0.3],
  ] as const)("uses bike evidence %j at factor %s", (metadata, factor) => {
    const score = scoreBike({ bike: { currentSetup: { saddleHeightMm: 728 } }, observations: [
      { field: "currentSetup.saddleHeightMm", value: 728, ...metadata },
    ] }, now);
    expect(score.reliability).toBe(10 * factor);
  });

  it("counts zero spacers, zero/negative setback/drop and a zero stem angle", () => {
    const score = scoreBike({ bike: { currentSetup: {
      spacersMm: 0, saddleSetbackMm: -10, handlebarDropMm: 0, stemLengthMm: 100, stemAngle: 0,
    } } }, now);
    expect(score.completeness).toBe(19);
    expect(scoreBike({ bike: { currentSetup: { stemLengthMm: 0, stemAngle: 0 } } }, now).completeness).toBe(0);
  });
});

describe("results and next steps", () => {
  it.each([[0, "basic"], [39, "basic"], [40, "building"], [69, "building"], [70, "strong"],
    [89, "strong"], [90, "complete"], [100, "complete"]] as const)("maps %s to %s", (value, level) => {
    expect(profileScoreLevel(value)).toBe(level);
  });

  it("selects the largest remaining reliability gain with deterministic ties", () => {
    expect(scoreRiderProfile({ profile: null }, now).nextStep).toMatchObject({ key: "inseam", gain: 20 });
    expect(scoreRiderProfile({ profile: { inseamCm: 81, heightCm: 174 } }, now).nextStep)
      .toMatchObject({ key: "torso", gain: 8 });
  });

  it("never proposes complaints, and does not mutate input", () => {
    const profile = Object.freeze({ inseamCm: 81 });
    expect(scoreRiderProfile({ profile }, now).nextStep?.key).not.toBe("complaints");
    expect(profile).toEqual({ inseamCm: 81 });
  });

  it("does not count invalid numbers or blank values", () => {
    expect(scoreRiderProfile({ profile: { inseamCm: NaN, heightCm: 0, weightKg: Infinity, positionPriority: " " } }, now)
      .completeness).toBe(0);
    expect(scoreBike({ bike: null }, now).reliability).toBe(0);
    expect(() => scoreRiderProfile({ profile: null }, NaN)).toThrow(RangeError);
  });
});
