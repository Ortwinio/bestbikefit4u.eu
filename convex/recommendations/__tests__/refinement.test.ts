import { describe, expect, it } from "vitest";
import { buildConservativeRefinementSuggestion } from "../refinement";

describe("conservative refinement suggestion", () => {
  it("does not suggest changes when the setup was not implemented", () => {
    const suggestion = buildConservativeRefinementSuggestion({
      implementationStatus: "not_implemented",
      comfortScore: 4,
      handPressureScore: 9,
    });

    expect(suggestion).toBeUndefined();
  });

  it("suggests a small saddle-height decrease for posterior knee pain", () => {
    const suggestion = buildConservativeRefinementSuggestion({
      implementationStatus: "confirmed",
      comfortScore: 4,
      kneePainArea: "back",
      kneePainSeverity: 7,
    });

    expect(suggestion).toEqual({
      parameter: "saddleHeightMm",
      direction: "decrease",
      delta: 2,
      rationale:
        "Posterior knee discomfort after an implemented setup suggests a small saddle-height reduction.",
    });
  });

  it("suggests reducing bar drop for high hand pressure", () => {
    const suggestion = buildConservativeRefinementSuggestion({
      implementationStatus: "confirmed",
      comfortScore: 5,
      handPressureScore: 8,
    });

    expect(suggestion).toEqual({
      parameter: "barDropMm",
      direction: "decrease",
      delta: 5,
      rationale:
        "High hand or lower-back load suggests reducing front-end aggression first.",
    });
  });
});
