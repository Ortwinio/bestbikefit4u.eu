import { describe, expect, it } from "vitest";
import {
  EFFECTIVE_TOP_TUBE_REACH_OFFSET_MM,
  buildFitInputs,
  estimateEffectiveTopTubeMm,
  mapAmbition,
  mapBikeCategory,
} from "../inputMapping";

describe("recommendation input mapping", () => {
  it("maps profile + session into fit inputs with independent core/flex scores", () => {
    const fitInputs = buildFitInputs({
      profile: {
        heightCm: 175,
        inseamCm: 81,
        flexibilityScore: "excellent",
        coreStabilityScore: 1,
        torsoLengthCm: 58,
        armLengthCm: 62,
        shoulderWidthCm: 41,
        footLengthCm: 27,
        femurLengthCm: 46,
      },
      session: {
        primaryGoal: "balanced",
        ridingStyle: "touring",
      },
    });

    expect(fitInputs.category).toBe("gravel");
    expect(fitInputs.ambition).toBe("balanced");
    expect(fitInputs.heightMm).toBe(1750);
    expect(fitInputs.inseamMm).toBe(810);
    expect(fitInputs.flexibilityScore).toBe(9);
    expect(fitInputs.coreScore).toBe(2);
    expect(fitInputs.femurMm).toBe(460);
    expect(fitInputs.torsoMm).toBe(580);
    expect(fitInputs.armMm).toBe(620);
    expect(fitInputs.shoulderWidthMm).toBe(410);
    expect(fitInputs.footLengthMm).toBe(270);
  });

  it("prefers explicit bike type when session has linked bike", () => {
    const category = mapBikeCategory(
      { primaryGoal: "comfort", ridingStyle: "commuting" },
      "mountain"
    );

    expect(category).toBe("mtb");
  });

  it("maps primary goals to algorithm ambitions", () => {
    expect(mapAmbition("comfort")).toBe("comfort");
    expect(mapAmbition("balanced")).toBe("balanced");
    expect(mapAmbition("performance")).toBe("performance");
    expect(mapAmbition("aerodynamics")).toBe("aero");
    expect(mapAmbition("unknown")).toBe("balanced");
  });

  it("keeps effective top tube estimate explicit and deterministic", () => {
    expect(estimateEffectiveTopTubeMm(500)).toBe(
      500 + EFFECTIVE_TOP_TUBE_REACH_OFFSET_MM
    );
  });
});
