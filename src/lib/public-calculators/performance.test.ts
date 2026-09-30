import { describe, expect, it } from "vitest";
import { calculateClimbPowerWatts } from "@/lib/gearing-engine/math";
import {
  bikeDefaults,
  carbohydrateGuidance,
  fuelHydration,
  ftpRating,
  FTP_RATING_THRESHOLDS,
  climbPlan,
  ftpEstimate,
  fuelTimeline,
  powerAtSpeed,
  powerSplit,
  TOOL_RANGES,
  speedAtPower,
  type RidingConditions,
} from "./performance";

const road: RidingConditions = {
  riderMassKg: 75,
  bikeMassKg: 8.5,
  bike: "road",
  surface: "road",
  gradientPct: 0,
};
describe("public performance calculators", () => {
  it("uses shared physics and conserves the full crank power in the breakdown", () => {
    const conditions = { ...road, gradientPct: 7 };
    const total = powerAtSpeed(conditions, 15);
    expect(total).toBe(
      calculateClimbPowerWatts({
        totalMassKg: 83.5,
        velocityMps: 15 / 3.6,
        gradientPct: 7,
        crr: 0.0045,
        cda: 0.32,
      }),
    );
    const split = powerSplit(conditions, 15);
    expect(split.climbing + split.rolling + split.air).toBeCloseTo(total, 10);
    expect(powerSplit(road, 30).climbing).toBe(0);
  });
  it("round-trips power and speed within the existing solver tolerance", () => {
    for (const gradientPct of [0, 7, 15]) {
      const conditions = { ...road, gradientPct };
      const result = speedAtPower(conditions, 200);
      expect(result.limit).toBeNull();
      expect(Math.abs(result.split.total - 200)).toBeLessThan(0.5);
    }
    expect(speedAtPower(road, 200).speedKmh).toBeCloseTo(33.6, 0);
  });
  it("reports saturation instead of presenting a capped speed as an exact result", () => {
    const result = speedAtPower({ ...road, bike: "tt_triathlon" }, 1000);
    expect(result.speedKmh).toBe(54);
    expect(result.limit).toBe("above");
    expect(speedAtPower({ ...road, gradientPct: 15 }, 1).limit).toBe("below");
  });
  it("uses the engine duration multipliers at exact climb-length boundaries", () => {
    for (const [distanceKm, band, multiplier] of [
      [2.5, "short", 1.1],
      [3, "medium", 1],
      [8, "long", 0.9],
      [20, "alpine", 0.82],
    ] as const) {
      const result = climbPlan({ distanceKm, gradientPct: 7, ftpWatts: 200, riderMassKg: 75, bike: "road" });
      expect(result.band).toBe(band);
      expect(result.targetPowerWatts).toBe(200 * multiplier);
      expect(result.minutes).toBeCloseTo((distanceKm / result.speedKmh) * 60);
    }
    expect(
      climbPlan({ distanceKm: 5, gradientPct: 7, ftpWatts: 200, riderMassKg: 75, bike: "road" }).minutes,
    ).toBeCloseTo(26.9, 0);
  });
  it("uses the documented FTP test conventions", () => {
    expect(ftpEstimate("known", 250, 75).wattsPerKg).toBeCloseTo(3.333333);
    expect(ftpEstimate("twentyMinute", 250, 75).ftpWatts).toBe(237.5);
    expect(ftpEstimate("ramp", 320, 75).ftpWatts).toBe(240);
    expect(ftpEstimate("ramp", 700, 40).flat.limit).toBeNull();
  });
  it("keeps ride-progress markers separate from nutrition quantities", () => {
    expect(fuelTimeline(2.5, 30)).toEqual({ markersMinutes: [0, 75, 150] });
    expect(fuelTimeline(8, 40).markersMinutes.at(-1)).toBe(480);
  });
  it("rejects non-finite and unsupported inputs rather than silently clamping them", () => {
    for (const riderMassKg of [0, NaN, Infinity, 151]) {
      expect(() => speedAtPower({ ...road, riderMassKg }, 200)).toThrow(RangeError);
    }
    expect(() => powerAtSpeed(road, 55)).toThrow(RangeError);
    expect(() =>
      climbPlan({ distanceKm: 0, gradientPct: 7, ftpWatts: 200, riderMassKg: 75, bike: "road" }),
    ).toThrow(RangeError);
    expect(() => ftpEstimate("known", 501, 75)).toThrow(RangeError);
    expect(() => fuelTimeline(0.25, 20)).toThrow(RangeError);
    expect(() => fuelTimeline(2, 41)).toThrow(RangeError);
    expect(bikeDefaults("mountain")).toEqual({ bikeMassKg: 12.5, cda: 0.5, surface: "mtb" });
    expect(TOOL_RANGES.power).toEqual({ min: 50, max: 600, step: 5, initial: 200 });
  });
});


describe("sourced carbohydrate guidance", () => {
  it.each([
    [0, "none", 0],
    [0.49, "none", 0],
    [0.5, "small", null],
    [0.99, "small", null],
    [1, "upTo30", 30],
    [1.25, "upTo30", 30],
    [1.99, "upTo30", 30],
    [2, "upTo60", 60],
    [2.5, "upTo60", 60],
    [2.5001, "upTo90", 90],
    [3, "upTo90", 90],
    [8, "upTo90", 90],
  ])("maps %s hours to %s", (duration, band, gramsPerHour) => {
    const result = carbohydrateGuidance(duration as number);
    expect(result.band).toBe(band);
    expect(result.gramsPerHour).toBe(gramsPerHour);
    expect(result.totalGrams).toBe(gramsPerHour === null ? null : Number(duration) * Number(gramsPerHour));
    expect(result.requiresMultipleCarbohydrates).toBe(band === "upTo90");
  });
  it("rejects values outside the supported duration domain", () => {
    for (const duration of [-1, 8.01, NaN, Infinity, -Infinity]) {
      expect(() => carbohydrateGuidance(duration)).toThrow(RangeError);
    }
  });
});

const nutrition = { durationHours: 2, temperatureC: 20, sweat: "medium", bottleSizeMl: 500 } as const;
describe("approved hydration bands", () => {
  it.each([
    [0, "low", 0, 0.4],
    [20, "medium", 0.5, 0.6],
    [40, "high", 1, 0.8],
    [40, "low", 0.5, 0.6],
    [0, "high", 0.5, 0.6],
  ] as const)("uses a bounded heuristic for %s C / %s sweat", (temperatureC, sweat, position, fluid) => {
    const result = fuelHydration({ ...nutrition, temperatureC, sweat });
    expect(result.position).toBe(position);
    expect(result.positionBasis).toBe("heuristic-not-measurement");
    expect(result.selectedFluidLitresPerHour).toBeCloseTo(fluid);
    expect(result.fluidLitresPerHour).toEqual({ min: 0.4, max: 0.8 });
    expect(result.sodiumMgPerLitre).toEqual({ min: 460, max: 690 });
  });
  it("converts litres to bottles without rounding up into additional intake advice", () => {
    const small = fuelHydration(nutrition);
    const large = fuelHydration({ ...nutrition, bottleSizeMl: 750 });
    expect(small.totalFluidLitres).toEqual({ min: 0.8, max: 1.6 });
    expect(small.bottles).toEqual({ min: 1.6, max: 3.2 });
    expect(small.selectedBottles).toBeCloseTo(2.4);
    expect(large.bottles.min).toBeCloseTo(0.8 / 0.75);
    expect(large.bottles.max).toBeCloseTo(1.6 / 0.75);
    expect(large.selectedBottles).toBeCloseTo(1.6);
  });
  it("keeps fluid bounded and sodium concentration unaffected by temperature or sweat", () => {
    for (let durationHours = 0.5; durationHours <= 8; durationHours += 0.25) {
      for (let temperatureC = 0; temperatureC <= 40; temperatureC++) {
        for (const sweat of ["low", "medium", "high"] as const) {
          const result = fuelHydration({ ...nutrition, durationHours, temperatureC, sweat });
          expect(result.selectedFluidLitresPerHour).toBeGreaterThanOrEqual(0.4);
          expect(result.selectedFluidLitresPerHour).toBeLessThanOrEqual(0.8);
          expect(result.sodiumMgPerLitre).toEqual(durationHours > 1 ? { min: 460, max: 690 } : null);
          expect(result).not.toHaveProperty("sodiumMgPerHour");
          expect(result).not.toHaveProperty("selectedSodiumMgPerHour");
          const carbs = result.carbohydrate.gramsPerHour;
          if (carbs !== null) expect([0, 30, 60, 90]).toContain(carbs);
        }
      }
    }
  });
  it.each([0.5, 0.99, 1, 1.0001, 1.25, 8])("gates sodium drink concentration at 1 h (%s)", (durationHours) => {
    const result = fuelHydration({ ...nutrition, durationHours });
    expect(result.sodiumMgPerLitre).toEqual(durationHours > 1 ? { min: 460, max: 690 } : null);
    expect(result.sodiumMgPerBottle).toEqual(durationHours > 1 ? { min: 230, max: 345 } : null);
  });
  it("converts sodium concentration to the actual bottle volume, never a per-hour target", () => {
    expect(fuelHydration(nutrition).sodiumMgPerBottle).toEqual({ min: 230, max: 345 });
    expect(fuelHydration({ ...nutrition, bottleSizeMl: 750 }).sodiumMgPerBottle).toEqual({ min: 345, max: 517.5 });
    for (let bottleSizeMl = 500; bottleSizeMl <= 750; bottleSizeMl += 50) {
      const result = fuelHydration({ ...nutrition, bottleSizeMl });
      expect(result.sodiumMgPerBottle?.min).toBeCloseTo(460 * bottleSizeMl / 1000);
      expect(result.sodiumMgPerBottle?.max).toBeCloseTo(690 * bottleSizeMl / 1000);
      expect(result.sodiumMgPerLitre).toEqual({ min: 460, max: 690 });
    }
  });
  it("rejects invalid inputs rather than allowing a position outside the cited bands", () => {
    for (const value of [NaN, Infinity, -Infinity, -1, 1000]) {
      for (const field of ["durationHours", "temperatureC", "bottleSizeMl"] as const) {
        expect(() => fuelHydration({ ...nutrition, [field]: value })).toThrow(RangeError);
      }
    }
    for (const durationHours of [0.49, 8.01]) {
      expect(() => fuelHydration({ ...nutrition, durationHours })).toThrow(RangeError);
    }
    for (const bottleSizeMl of [499, 751]) {
      expect(() => fuelHydration({ ...nutrition, bottleSizeMl })).toThrow(RangeError);
    }
    expect(() => fuelHydration({ ...nutrition, sweat: "other" as "low" })).toThrow(RangeError);
  });
});

describe("Allen & Coggan W/kg rating thresholds", () => {
  it.each([
    ["men", 5.05, "superior"], ["men", 5.04, "excellent"],
    ["men", 3.93, "excellent"], ["men", 3.92, "good"],
    ["men", 2.79, "good"], ["men", 2.78, "fair"],
    ["men", 2.23, "fair"], ["men", 2.22, "untrained"],
    ["women", 4.3, "superior"], ["women", 4.29, "excellent"],
    ["women", 3.33, "excellent"], ["women", 3.32, "good"],
    ["women", 2.36, "good"], ["women", 2.35, "fair"],
    ["women", 1.9, "fair"], ["women", 1.89, "untrained"],
  ] as const)("pins the published %s value %s to %s", (comparison, value, rating) => {
    expect(ftpRating(value, comparison)).toBe(rating);
  });
  for (const comparison of ["men", "women"] as const) {
    it(`covers both sides of every ${comparison} boundary without decimal gaps`, () => {
      const thresholds = FTP_RATING_THRESHOLDS[comparison];
      for (const [index, threshold] of thresholds.entries()) {
        expect(ftpRating(threshold.min, comparison)).toBe(threshold.rating);
        expect(ftpRating(threshold.min + 0.0001, comparison)).toBe(threshold.rating);
        if (threshold.min > 0) {
          expect(ftpRating(threshold.min - 0.0001, comparison)).toBe(thresholds[index + 1].rating);
        }
      }
      expect(ftpRating(20, comparison)).toBe("superior");
    });
  }
  it("requires an explicit table and a finite nonnegative W/kg value", () => {
    for (const value of [-0.01, NaN, Infinity, -Infinity]) {
      expect(() => ftpRating(value, "men")).toThrow(RangeError);
    }
    expect(() => ftpRating(3, "other" as "men")).toThrow(RangeError);
    expect(() => ftpRating(3, undefined as unknown as "men")).toThrow(RangeError);
    expect(ftpRating(3, "men")).toBe("good");
    expect(ftpRating(3, "women")).toBe("good");
  });
});
