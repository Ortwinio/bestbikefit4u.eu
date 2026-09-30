import { describe, expect, it } from "vitest";
import { calculateClimbPowerWatts } from "@/lib/gearing-engine/math";
import {
  bikeDefaults,
  climbPlan,
  ftpEstimate,
  fuelTimeline,
  powerAtSpeed,
  powerSplit,
  PROPOSED_RANGES,
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
  it("uses the documented proposed FTP factors, not category rankings", () => {
    expect(ftpEstimate("known", 250, 75).wattsPerKg).toBeCloseTo(3.333333);
    expect(ftpEstimate("twentyMinute", 250, 75).ftpWatts).toBe(237.5);
    expect(ftpEstimate("ramp", 320, 75).ftpWatts).toBe(240);
    expect(ftpEstimate("ramp", 700, 40).flat.limit).toBeNull();
  });
  it("returns only ride-progress markers and never invented nutrition quantities", () => {
    expect(fuelTimeline(2.5, 30)).toEqual({ adviceAvailable: false, markersMinutes: [0, 75, 150] });
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
    expect(PROPOSED_RANGES.power).toEqual({ min: 50, max: 600, step: 5, initial: 200 });
  });
});
