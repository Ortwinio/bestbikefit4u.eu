import { describe, expect, it } from "vitest";
import { computePressureInsights } from "../pressureFitInteraction";

describe("computePressureInsights", () => {
  it("returns defaults when no pressure calculation is available", () => {
    expect(
      computePressureInsights(
        { calculatedFit: { handlebarDropMm: 60 } },
        null,
        null
      )
    ).toEqual({
      comfortBias: "balanced",
      stabilityScore: 0.5,
      warnings: [],
      version: 1,
    });
  });

  it("flags gravel pressure and aggressive rough-terrain combinations", () => {
    const result = computePressureInsights(
      { calculatedFit: { handlebarDropMm: 95 } },
      {
        recommendedFrontBar: 4.8,
        inputSnapshot: {
          surface: "hardpack_gravel",
          ridingGoal: "speed",
          bodyWeightKg: 70,
        },
        gripScore: 0.6,
        efficiencyScore: 0.8,
      },
      { bikeType: "road" },
      88
    );

    expect(result.comfortBias).toBe("performance");
    expect(result.warnings).toContain("pressure_high_for_gravel");
    expect(result.warnings).toContain("gravel_road_conflict");
    expect(result.warnings).toContain("weight_mismatch");
  });
});
