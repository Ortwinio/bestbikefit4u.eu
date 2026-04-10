import { describe, expect, it } from "vitest";
import {
  calculateGearing,
  formatGearRatio,
  formatGearSpan,
  validateGearingInputs,
} from "./gearing-engine";

describe("gearing engine", () => {
  it("calculates the gear math for a practical road setup", () => {
    const result = calculateGearing({
      drivetrainType: "2x",
      outerChainringTeeth: 50,
      innerChainringTeeth: 34,
      cassetteSmallestCogTeeth: 11,
      cassetteLargestCogTeeth: 34,
      wheelCircumferenceMm: 2105,
      cadenceRpm: 80,
      gradientPct: 8,
      bikeType: "road",
      climbBand: "medium",
    });

    expect(result.easiest.chainringTeeth).toBe(34);
    expect(result.easiest.cogTeeth).toBe(34);
    expect(result.easiest.ratio).toBeCloseTo(1, 2);
    expect(result.easiest.speedKmh).toBeCloseTo(10.1, 1);
    expect(result.hardest.chainringTeeth).toBe(50);
    expect(result.hardest.cogTeeth).toBe(11);
    expect(result.recommendation.label).toBe("challenging");
    expect(formatGearRatio(result.easiest.ratio)).toBe("1.00x");
    expect(formatGearSpan(result.gearSpan)).toBe("4.55x");
  });

  it("flags a steep road 1x setup as likely overgeared when the bailout gear is too tall", () => {
    const issues = validateGearingInputs(
      {
        drivetrainType: "1x",
        outerChainringTeeth: 42,
        cassetteSmallestCogTeeth: 10,
        cassetteLargestCogTeeth: 32,
        wheelCircumferenceMm: 2105,
        cadenceRpm: 80,
        gradientPct: 12,
        bikeType: "road",
        climbBand: "alpine",
      },
      false
    );

    const result = calculateGearing({
      drivetrainType: "1x",
      outerChainringTeeth: 42,
      cassetteSmallestCogTeeth: 10,
      cassetteLargestCogTeeth: 32,
      wheelCircumferenceMm: 2105,
      cadenceRpm: 80,
      gradientPct: 12,
      bikeType: "road",
      climbBand: "alpine",
    });

    expect(issues.some((issue) => issue.severity === "error")).toBe(false);
    expect(result.recommendation.label).toBe("likely overgeared");
    expect(result.recommendation.text).toContain("larger cassette");
  });
});
