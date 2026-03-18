import { describe, expect, it } from "vitest";
import {
  buildEngineComparisonSnapshot,
  buildRecommendationItems,
  buildEngineV1FitInputs,
  mapStoredCalculatedFit,
  normalizeCoreScore,
  runEngineV1Seed,
} from "../seedEngine";
import { EFFECTIVE_TOP_TUBE_REACH_OFFSET_MM } from "../inputMapping";

describe("engine v1 seed contract", () => {
  it("builds fit inputs with independent flexibility/core and optional femur support", () => {
    const inputs = buildEngineV1FitInputs({
      heightCm: 175,
      inseamCm: 81,
      torsoLengthCm: 58,
      armLengthCm: 62,
      shoulderWidthCm: 41,
      footLengthCm: 27,
      femurLengthCm: 46,
      flexibilityScore: "excellent",
      coreStabilityScore: 1,
      bikeCategory: "gravel",
      ambition: "balanced",
      frameStackMm: 560,
      frameReachMm: 390,
    });

    expect(inputs.category).toBe("gravel");
    expect(inputs.ambition).toBe("balanced");
    expect(inputs.heightMm).toBe(1750);
    expect(inputs.inseamMm).toBe(810);
    expect(inputs.flexibilityScore).toBe(9);
    expect(inputs.coreScore).toBe(2);
    expect(inputs.torsoMm).toBe(580);
    expect(inputs.armMm).toBe(620);
    expect(inputs.shoulderWidthMm).toBe(410);
    expect(inputs.footLengthMm).toBe(270);
    expect(inputs.femurMm).toBe(460);
    expect(inputs.frameStackMm).toBe(560);
    expect(inputs.frameReachMm).toBe(390);
  });

  it("normalizes undefined and out-of-range core scores into the supported 1-5 band", () => {
    expect(normalizeCoreScore(undefined)).toBe(3);
    expect(normalizeCoreScore(0)).toBe(1);
    expect(normalizeCoreScore(6)).toBe(5);
    expect(normalizeCoreScore(3.6)).toBe(4);
  });

  it("maps fit outputs into the stored calculatedFit shape with deterministic ETT", () => {
    const seed = runEngineV1Seed({
      heightCm: 178,
      inseamCm: 82,
      torsoLengthCm: 59,
      armLengthCm: 63,
      shoulderWidthCm: 41,
      footLengthCm: 27,
      femurLengthCm: 47,
      flexibilityScore: "good",
      coreStabilityScore: 4,
      bikeCategory: "road",
      ambition: "performance",
      frameStackMm: 565,
      frameReachMm: 395,
    });

    const stored = mapStoredCalculatedFit(seed.fitOutputs);
    const comparison = buildEngineComparisonSnapshot(seed.fitOutputs);

    expect(stored.effectiveTopTubeMm).toBe(
      seed.fitOutputs.saddleToBarReachMm + EFFECTIVE_TOP_TUBE_REACH_OFFSET_MM
    );
    expect(stored.saddleHeightMm).toBe(seed.fitOutputs.saddleHeightMm);
    expect(stored.handlebarDropMm).toBe(seed.fitOutputs.barDropMm);
    expect(stored.handlebarReachMm).toBe(seed.fitOutputs.saddleToBarReachMm);
    expect(stored.stemAngleRecommendation).toBe(
      `${seed.fitOutputs.stemAngleDeg}°`
    );

    expect(comparison).toEqual({
      saddleHeightMm: seed.fitOutputs.saddleHeightMm,
      saddleSetbackMm: seed.fitOutputs.saddleSetbackMm,
      barDropMm: seed.fitOutputs.barDropMm,
      saddleToBarReachMm: seed.fitOutputs.saddleToBarReachMm,
      stemLengthMm: seed.fitOutputs.stemLengthMm,
      crankLengthMm: seed.fitOutputs.crankLengthMm,
      handlebarWidthMm: seed.fitOutputs.handlebarWidthMm,
      confidenceScore: seed.fitOutputs.confidenceScore,
    });
  });

  it("builds stable recommendation envelope items from the seed result", () => {
    const seed = runEngineV1Seed({
      heightCm: 182,
      inseamCm: 85,
      torsoLengthCm: 60,
      armLengthCm: 64,
      shoulderWidthCm: 43,
      footLengthCm: 28,
      femurLengthCm: 48,
      flexibilityScore: "average",
      coreStabilityScore: 3,
      bikeCategory: "road",
      ambition: "balanced",
      frameStackMm: 570,
      frameReachMm: 398,
    });

    const items = buildRecommendationItems(seed.fitOutputs);

    expect(items.map((item) => item.parameter)).toEqual([
      "saddleHeightMm",
      "saddleSetbackMm",
      "barDropMm",
      "saddleToBarReachMm",
      "crankLengthMm",
      "handlebarWidthMm",
    ]);
    expect(items[0]).toEqual(
      expect.objectContaining({
        parameter: "saddleHeightMm",
        target: seed.fitOutputs.saddleHeightMm,
        rangeLow: seed.fitOutputs.saddleHeightRange.min,
        rangeHigh: seed.fitOutputs.saddleHeightRange.max,
        confidence: seed.fitOutputs.confidenceScore / 100,
        changeOrder: 2,
      })
    );
    expect(seed.recommendationItems).toEqual(items);
  });
});
