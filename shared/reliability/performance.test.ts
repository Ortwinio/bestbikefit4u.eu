import { describe, expect, it } from "vitest";
import { calculateClimbingCadence, calculateFluidLoss } from "./performance";
import { getReliabilityRange } from "./calculators";

describe("new board performance centres", () => {
  it("matches the executed gearing board for its initial and entered-weight states", () => {
    const input = { chainringTeeth: 34, rearCogTeeth: 32 };
    const baseline = calculateClimbingCadence(input);
    expect(baseline.cadenceRpm).toBeCloseTo(58.06261915903508, 10);
    expect(baseline.ftpEstimated).toBe(true);
    expect(baseline.weightAssumed).toBe(true);
    expect(baseline.gradientAssumed).toBe(true);
    expect(calculateClimbingCadence({ ...input, riderWeightKg: 94, gradientPct: 10 }).cadenceRpm)
      .toBeCloseTo(59.456102668475665, 10);
  });
  it("accepts real FTP and wheel evidence, without manufacturing uncertainty evidence", () => {
    const result = calculateClimbingCadence({
      chainringTeeth: 34, rearCogTeeth: 32, ftpWatts: 260, riderWeightKg: 94, wheelCircumferenceM: 2.15,
    });
    expect(result.climbingPowerWatts).toBe(221);
    expect(result.ftpEstimated).toBe(false);
    expect(result.wheelCircumferenceAssumed).toBe(false);
    expect(result.developmentM).toBeCloseTo(2.15 * 34 / 32);
    expect(getReliabilityRange({ metric: "cadence", value: result.cadenceRpm })?.halfWidth).toBe(8);
  });
  it.each([0, -1, NaN, 34.5])("rejects invalid chainring %s", (chainringTeeth) => {
    expect(() => calculateClimbingCadence({ chainringTeeth, rearCogTeeth: 32 })).toThrow(RangeError);
  });
  it("matches the executed fluid-loss board, retaining a separate carbohydrate guideline", () => {
    const baseline = calculateFluidLoss({ durationHours: 3, effort: "endurance" });
    expect(baseline.fluidLossMlPerHour).toBe(500);
    expect(baseline.temperatureAssumed).toBe(true);
    const entered = calculateFluidLoss({ durationHours: 3, effort: "endurance", temperatureC: 22 });
    expect(entered.fluidLossMlPerHour).toBe(530);
    expect(entered.carbohydrateGuideline).toEqual({ minGramsPerHour: 60, maxGramsPerHour: 90 });
    expect(entered.temperatureAssumed).toBe(false);
  });
  it.each([[1, 30, 30], [1.25, 30, 60], [2.49, 30, 60], [2.5, 60, 90]])(
    "keeps carb boundary %s a guideline", (durationHours, minGramsPerHour, maxGramsPerHour) => {
      expect(calculateFluidLoss({ durationHours, effort: "easy" }).carbohydrateGuideline)
        .toEqual({ minGramsPerHour, maxGramsPerHour });
    },
  );
  it.each([["easy", 350], ["endurance", 500], ["tempo", 700], ["race", 900]] as const)(
    "preserves board effort %s", (effort, expected) => {
      expect(calculateFluidLoss({ durationHours: 2, effort }).fluidLossMlPerHour).toBe(expected);
    },
  );
  it("keeps the board cold-temperature floor and rejects non-finite inputs", () => {
    expect(calculateFluidLoss({ durationHours: 2, effort: "endurance", temperatureC: -10 }).fluidLossMlPerHour).toBe(300);
    expect(() => calculateFluidLoss({ durationHours: NaN, effort: "endurance" })).toThrow(RangeError);
  });
  it("provides FTP watts spread using the same protocol fractions as W/kg", () => {
    const input = { metric: "ftpPower" as const, value: 250 };
    expect(getReliabilityRange({ ...input, evidence: { ftpMethod: "twenty-minute" } })?.halfWidth).toBe(15);
    expect(getReliabilityRange({ ...input, evidence: { ftpMethod: "ramp" } })?.halfWidth).toBe(25);
    expect(getReliabilityRange({ ...input, evidence: { weightMeasuredRecently: true } })?.halfWidth).toBe(10);
    expect(getReliabilityRange({ ...input, evidence: { guidedTest: true } })?.halfWidth).toBe(7.5);
  });
});

describe("discrete uncertainty scales", () => {
  it.each([150, 151, 155, 172.5, 180])("keeps all selected crank candidates in scale at %s", (value) => {
    const options = [150, 152.5, 155, 157.5, 160, 162.5, 165, 167.5, 170, 172.5, 175, 177.5, 180];
    const publicRange = getReliabilityRange({ metric: "crankLength", value, options })!;
    const refined = getReliabilityRange({
      metric: "crankLength", value, options, evidence: { femurAndRidingStyleKnown: true },
    })!;
    expect(publicRange.scaleMin).toBeLessThanOrEqual(publicRange.lower);
    expect(publicRange.scaleMax).toBeGreaterThanOrEqual(publicRange.upper);
    expect(refined.scaleMin).toBe(publicRange.scaleMin);
    expect(refined.scaleMax).toBe(publicRange.scaleMax);
    expect(publicRange.scaleMax - value).toBe(1.25 * publicRange.widestHalfWidth);
  });
  it("does not invent crank options and exposes only real geometry margin", () => {
    expect(getReliabilityRange({ metric: "crankLength", value: 172.5 })).toBeNull();
    const range = getReliabilityRange({ metric: "frameSize", value: 56, options: [50, 54, 56, 60],
      evidence: { bikeGeometryKnown: true, bikesCompared: true, frameMarginMm: 8 },
    });
    expect(range?.kind === "size" && range.marginMm).toBe(8);
  });
});
