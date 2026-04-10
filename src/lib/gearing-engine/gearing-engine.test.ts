import { describe, expect, it } from "vitest";
import {
  buildBikeGearingRecord,
  calculateGearMath,
  calculateGearingAnalysis,
} from "./index";

describe("gearing engine", () => {
  it("normalizes bike gearing records and infers completeness", () => {
    const record = buildBikeGearingRecord({
      drivetrainType: "2x",
      chainrings: [50, 34],
      cassetteTeeth: [11, 34, 28, 24],
      wheelCircumferenceMm: 2105,
      crankLengthMm: 172.5,
      groupsetName: "Shimano 105",
    });

    expect(record?.completeness).toBe("validated");
    expect(record?.drivetrainType).toBe("2x");
    expect(record?.chainrings).toEqual([34, 50]);
    expect(record?.cassetteTeeth).toEqual([11, 24, 28, 34]);
    expect(record?.groupsetName).toBe("Shimano 105");
  });

  it("calculates deterministic drivetrain math", () => {
    const math = calculateGearMath({
      drivetrainType: "2x",
      chainrings: [50, 34],
      cassetteTeeth: [11, 34],
      wheelCircumferenceMm: 2105,
      cadenceRpm: 90,
    });

    expect(math.easiestGear.frontChainringTeeth).toBe(34);
    expect(math.easiestGear.rearCogTeeth).toBe(34);
    expect(math.easiestGear.ratio).toBeCloseTo(1, 3);
    expect(math.hardestGear.frontChainringTeeth).toBe(50);
    expect(math.hardestGear.rearCogTeeth).toBe(11);
    expect(math.gearPairs).toHaveLength(4);
  });

  it("produces a climb-suitability summary with confidence", () => {
    const result = calculateGearingAnalysis(
      {
        drivetrainType: "2x",
        chainrings: [50, 34],
        cassetteTeeth: [11, 34],
        wheelCircumferenceMm: 2105,
        crankLengthMm: 172.5,
        bikeType: "road",
        riderWeightKg: 75,
        bikeWeightKg: 8.5,
        ftpWatts: 260,
        preferredCadenceRpm: 85,
        comfortableCadenceMinRpm: 75,
        comfortableCadenceMaxRpm: 95,
        climbGradientPct: 8,
        climbLengthBand: "long",
        surfaceType: "road",
        rearDerailleurMaxCog: 34,
      },
    );

    expect(result.suitability.publicVerdict).toMatch(/suitable|challenging|likely_overgeared/);
    expect(result.suitability.confidence.score).toBeGreaterThan(0);
    expect(result.suitability.recommendationText.length).toBeGreaterThan(0);
  });
});
