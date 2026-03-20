import { describe, expect, it } from "vitest";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";

const baseSource = {
  session: {
    _id: "session_1",
    bikeType: "road",
    ridingStyle: "sportive",
    primaryGoal: "balanced",
    engineVersion: "v2",
  },
  recommendation: {
    engineVersion: "v2",
    algorithmVersion: "2.0.0",
    confidenceScore: 88,
    calculatedFit: {
      recommendedStackMm: 605,
      recommendedReachMm: 395,
      effectiveTopTubeMm: 560,
      saddleHeightMm: 748,
      saddleSetbackMm: 53,
      saddleHeightRange: { min: 742, max: 754 },
      handlebarDropMm: 75,
      handlebarReachMm: 515,
      stemLengthMm: 100,
      stemAngleRecommendation: "-6°",
      crankLengthMm: 172.5,
      handlebarWidthMm: 420,
    },
    frameSizeRecommendations: [{ size: "56", fitScore: 91, brand: "Example" }],
    fitNotes: ["Validate saddle height first."],
    recommendationItems: [
      {
        parameter: "saddleHeightMm",
        target: 748,
        rangeLow: 742,
        rangeHigh: 754,
        confidence: 0.88,
        feasibility: "direct",
      },
    ],
    pressureInsights: {
      comfortBias: "balanced",
      stabilityScore: 0.72,
      warnings: ["weight_mismatch"],
      version: 1,
    },
  },
  bike: {
    bikeType: "road",
    bikeWeightKg: 8.4,
    currentSetup: {
      saddleHeightMm: 740,
      saddleSetbackMm: 50,
      stemLengthMm: 110,
      handlebarWidthMm: 400,
      crankLengthMm: 172.5,
    },
  },
  bikeProfile: null,
  profile: {
    weightKg: 74,
  },
  latestPressureCalculation: {
    recommendedFrontPsi: 69,
    recommendedRearPsi: 73,
    recommendedFrontBar: 4.8,
    recommendedRearBar: 5.0,
    comfortScore: 0.7,
    gripScore: 0.72,
    efficiencyScore: 0.75,
    inputSnapshot: {
      bodyWeightKg: 74,
      surface: "average_asphalt",
      ridingGoal: "balance",
    },
  },
} as const;

describe("reportV2Mapper", () => {
  it("maps a full source payload into report sections", () => {
    const payload = mapReportV2Payload(baseSource as never);

    expect(payload.profile.sessionId).toBe("session_1");
    expect(payload.profile.bikeImageUrl).toBeNull();
    expect(payload.prioritySummary.length).toBeGreaterThan(0);
    expect(payload.tirePressure.status).toBe("ready");
    expect(payload.frameTargets.recommendedFrameLabel).toContain("56");
  });

  it("returns pending tire pressure when no calculation exists", () => {
    const payload = mapReportV2Payload({
      ...baseSource,
      latestPressureCalculation: null,
    } as never);

    expect(payload.tirePressure.status).toBe("pending_required_inputs");
    if (payload.tirePressure.status === "pending_required_inputs") {
      expect(payload.tirePressure.required).toContain("tireWidth");
    }
  });

  it("omits delta values when current bike setup is missing", () => {
    const payload = mapReportV2Payload({
      ...baseSource,
      bike: { bikeType: "road", bikeWeightKg: 8.4 },
    } as never);

    expect(payload.detailedFit.every((row) => row.delta === null)).toBe(true);
  });
});
