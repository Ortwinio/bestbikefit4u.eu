import { describe, expect, it } from "vitest";
import { calculateSaddleWidth, classifySaddleSuitability, classifySymptoms } from ".";

describe("saddle-width engine", () => {
  it("calculates measured balanced endurance-road recommendation", () => {
    const result = calculateSaddleWidth({
      inputMethod: "measured",
      sitBoneWidthMm: 130,
      postureCategory: "balanced",
      ridingType: "endurance_road",
    });

    expect(result.finalRecommendedWidthMm).toBe(152);
    expect(result.primaryWidthClass).toBe("M");
    expect(result.confidenceLevel).toBe("high");
  });

  it("calculates a lower aggressive tt recommendation", () => {
    const result = calculateSaddleWidth({
      inputMethod: "measured",
      sitBoneWidthMm: 130,
      postureCategory: "aggressive",
      ridingType: "tt_triathlon",
    });

    expect(result.finalRecommendedWidthMm).toBe(137);
    expect(result.primaryWidthClass).toBe("S");
  });

  it("calculates estimated mid-range input with lower confidence", () => {
    const result = calculateSaddleWidth({
      inputMethod: "estimated",
      heightCm: 172,
      weightKg: 72,
      hipCircumferenceCm: 105,
      postureCategory: "balanced",
      ridingType: "endurance_road",
    });

    expect(result.resolvedSitBoneWidthMm).toBe(130);
    expect(result.estimatedSitBoneRange).toEqual({ min: 120, max: 140 });
    expect(result.confidenceLevel).toBe("lower");
  });

  it("calculates upright commuter width", () => {
    const result = calculateSaddleWidth({
      inputMethod: "measured",
      sitBoneWidthMm: 120,
      postureCategory: "upright",
      ridingType: "commuter_leisure",
    });

    expect(result.finalRecommendedWidthMm).toBe(156);
    expect(result.primaryWidthClass).toBe("L");
  });

  it("widens for numbness", () => {
    const result = calculateSaddleWidth({
      inputMethod: "measured",
      sitBoneWidthMm: 130,
      postureCategory: "balanced",
      ridingType: "road_race",
      symptoms: {
        sisBonePain: false,
        numbness: true,
        chafing: false,
        slidingForward: false,
        instability: false,
        lowerBackPressure: false,
        handPressure: false,
        asymmetry: false,
      },
    });

    expect(result.finalRecommendedWidthMm).toBe(156);
  });

  it("narrows for chafing", () => {
    const result = calculateSaddleWidth({
      inputMethod: "measured",
      sitBoneWidthMm: 130,
      postureCategory: "balanced",
      ridingType: "road_race",
      symptoms: {
        sisBonePain: false,
        numbness: false,
        chafing: true,
        slidingForward: false,
        instability: false,
        lowerBackPressure: false,
        handPressure: false,
        asymmetry: false,
      },
    });

    expect(result.finalRecommendedWidthMm).toBe(144);
  });

  it("detects conflicting symptoms and emits warning", () => {
    const symptoms = {
      sisBonePain: false,
      numbness: true,
      chafing: true,
      slidingForward: false,
      instability: false,
      lowerBackPressure: false,
      handPressure: false,
      asymmetry: false,
    };

    expect(classifySymptoms(symptoms).dominant).toBe("conflicting");

    const width = calculateSaddleWidth({
      inputMethod: "measured",
      sitBoneWidthMm: 130,
      postureCategory: "balanced",
      ridingType: "endurance_road",
      symptoms,
    });
    const suitability = classifySaddleSuitability(
      {
        inputMethod: "measured",
        sitBoneWidthMm: 130,
        postureCategory: "balanced",
        ridingType: "endurance_road",
        symptoms,
      },
      width
    );

    expect(width.finalRecommendedWidthMm).toBe(152);
    expect(
      suitability.fitInteractionWarnings.some(
        (warning) => warning.code === "conflicting_symptoms"
      )
    ).toBe(true);
  });

  it("flags too narrow current saddle", () => {
    const result = calculateSaddleWidth({
      inputMethod: "measured",
      sitBoneWidthMm: 130,
      postureCategory: "balanced",
      ridingType: "endurance_road",
      currentSaddleWidthMm: 138,
    });

    expect(result.widthMatchAssessment).toBe("too_narrow");
  });

  it("flags good saddle match near recommendation", () => {
    const result = calculateSaddleWidth({
      inputMethod: "measured",
      sitBoneWidthMm: 130,
      postureCategory: "balanced",
      ridingType: "endurance_road",
      currentSaddleWidthMm: 150,
    });

    expect(result.widthMatchAssessment).toBe("good_match");
    expect(result.widthMatchScore).toBe(90);
  });

  it("throws when estimated path is incomplete", () => {
    expect(() =>
      calculateSaddleWidth({
        inputMethod: "estimated",
        heightCm: 172,
        weightKg: 72,
        postureCategory: "balanced",
        ridingType: "endurance_road",
      })
    ).toThrow();
  });
});
