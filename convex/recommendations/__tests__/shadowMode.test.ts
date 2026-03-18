import { describe, expect, it } from "vitest";
import { buildShadowDeltas, hasMaterialShadowDelta } from "../shadowMode";

describe("recommendation shadow mode helpers", () => {
  it("builds numeric deltas between baseline and shadow snapshots", () => {
    const deltas = buildShadowDeltas({
      baseline: {
        saddleHeightMm: 720,
        saddleSetbackMm: 60,
        barDropMm: 80,
        saddleToBarReachMm: 500,
        stemLengthMm: 100,
        crankLengthMm: 172.5,
        handlebarWidthMm: 420,
        confidenceScore: 88,
      },
      shadow: {
        saddleHeightMm: 722,
        saddleSetbackMm: 59,
        barDropMm: 75,
        saddleToBarReachMm: 505,
        stemLengthMm: 110,
        crankLengthMm: 170,
        handlebarWidthMm: 400,
        confidenceScore: 90,
      },
    });

    expect(deltas).toEqual({
      saddleHeightMm: 2,
      saddleSetbackMm: -1,
      barDropMm: -5,
      saddleToBarReachMm: 5,
      stemLengthMm: 10,
      crankLengthMm: -2.5,
      handlebarWidthMm: -20,
      confidenceScore: 2,
    });
    expect(hasMaterialShadowDelta(deltas)).toBe(true);
  });

  it("detects zero-delta shadow comparisons as non-material", () => {
    const deltas = {
      saddleHeightMm: 0,
      saddleSetbackMm: 0,
      barDropMm: 0,
      saddleToBarReachMm: 0,
      stemLengthMm: 0,
      crankLengthMm: 0,
      handlebarWidthMm: 0,
      confidenceScore: 0,
    };

    expect(hasMaterialShadowDelta(deltas)).toBe(false);
  });
});
