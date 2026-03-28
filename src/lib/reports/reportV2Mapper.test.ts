import { describe, expect, it } from "vitest";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";

const baseSource = {
  session: {
    _id: "session_1",
    createdAt: Date.UTC(2026, 2, 25, 9, 30, 0),
    completedAt: Date.UTC(2026, 2, 26, 12, 0, 0),
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
    name: "Race Machine",
    bikeType: "road",
    brand: "Example",
    model: "Aero 56",
    ridingStyle: "racing",
    primaryGoal: "performance",
    description: "A sharp road bike built for fast group rides.",
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
    heightCm: 182,
    weightKg: 74,
    inseamCm: 86,
    armLengthCm: 63,
    torsoLengthCm: 61,
    shoulderWidthCm: 41,
    flexibilityScore: "good",
    coreStabilityScore: 4,
    hasPain: "yes",
    painSeverity: 2,
    experienceLevel: "intermediate",
    weeklyHours: "6-10",
    typicalRideLength: "long",
    positionPriority: "balanced",
  },
  user: {
    displayName: "Ortwin",
    name: "Ortwin Verreck",
    email: "ortwin@example.com",
  },
  questionnaireResponses: [
    {
      questionId: "experience_level",
      questionOrder: 1,
      response: "advanced",
    },
    {
      questionId: "weekly_hours",
      questionOrder: 2,
      response: "10-15",
    },
    {
      questionId: "typical_ride_length",
      questionOrder: 3,
      response: "ultra",
    },
    {
      questionId: "position_priority",
      questionOrder: 4,
      response: "performance",
    },
    {
      questionId: "road_riding_type",
      questionOrder: 5,
      response: "training",
    },
  ],
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
  bikeImageUrl: "https://cdn.example.com/bike.png",
} as const;

describe("reportV2Mapper", () => {
  it("maps the additive rider, bike, and report metadata contract", () => {
    const payload = mapReportV2Payload(baseSource as never);

    expect(payload.reportDate).toBe("2026-03-26T12:00:00.000Z");
    expect(payload.rider).toMatchObject({
      name: "Ortwin",
      heightCm: 182,
      weightKg: 74,
      bmi: 22.3,
      bmiCategory: "normal",
      flexibilityScore: 4,
      flexibilityLabel: "Good",
      coreStabilityScore: 4,
      comfortScore: 3,
    });
    expect(payload.bike).toMatchObject({
      name: "Race Machine",
      bikeType: "road",
      brand: "Example",
      model: "Aero 56",
      ridingStyle: "racing",
      goal: "performance",
      description: "A sharp road bike built for fast group rides.",
      imageUrl: "https://cdn.example.com/bike.png",
    });
    expect(payload.bike.questionnaire).toEqual({
      experienceLevel: "advanced",
      weeklyHours: "10-15",
      rideLength: "ultra",
      positionPriority: "performance",
      typeOfRiding: "training",
    });
    expect(payload.profile.sessionId).toBe("session_1");
    expect(payload.profile.bikeImageUrl).toBe("https://cdn.example.com/bike.png");
    expect(payload.prioritySummary.length).toBeGreaterThan(0);
    expect(payload.tirePressure.status).toBe("ready");
    expect(payload.frameTargets.recommendedFrameLabel).toContain("56");
  });

  it("falls back cleanly when optional rider, bike, and questionnaire data are missing", () => {
    const payload = mapReportV2Payload({
      ...baseSource,
      session: {
        ...baseSource.session,
        completedAt: undefined,
      },
      bike: {
        bikeType: "road",
        bikeWeightKg: 8.4,
      },
      profile: null,
      user: {
        email: "fallback-name@example.com",
      },
      questionnaireResponses: [],
      latestPressureCalculation: null,
      bikeImageUrl: null,
    } as never);

    expect(payload.reportDate).toBe("2026-03-25T09:30:00.000Z");
    expect(payload.rider).toEqual({
      name: "fallback-name",
      heightCm: null,
      weightKg: null,
      inseamCm: null,
      armLengthCm: null,
      torsoLengthCm: null,
      shoulderWidthCm: null,
      bmi: null,
      bmiCategory: null,
      flexibilityScore: null,
      flexibilityLabel: null,
      coreStabilityScore: null,
      comfortScore: null,
    });
    expect(payload.bike).toEqual({
      name: "Unnamed bike",
      bikeType: "road",
      brand: null,
      model: null,
      ridingStyle: "sportive",
      goal: "balanced",
      description: null,
      imageUrl: null,
      questionnaire: {
        experienceLevel: null,
        weeklyHours: null,
        rideLength: null,
        positionPriority: null,
        typeOfRiding: null,
      },
    });
    expect(payload.profile.dataQualityStatus).toBe("partial");
    expect(payload.tirePressure.status).toBe("pending_required_inputs");
    if (payload.tirePressure.status === "pending_required_inputs") {
      expect(payload.tirePressure.required).toContain("tireWidth");
    }
  });

  it("uses profile questionnaire fields when session responses are absent", () => {
    const payload = mapReportV2Payload({
      ...baseSource,
      questionnaireResponses: null,
      profile: {
        ...baseSource.profile,
        experienceLevel: "beginner",
        weeklyHours: "3-6",
        typicalRideLength: "medium",
        positionPriority: "comfort",
      },
      bike: {
        ...baseSource.bike,
        bikeType: "mountain",
        ridingStyle: undefined,
        primaryGoal: undefined,
      },
    } as never);

    expect(payload.bike.questionnaire).toEqual({
      experienceLevel: "beginner",
      weeklyHours: "3-6",
      rideLength: "medium",
      positionPriority: "comfort",
      typeOfRiding: null,
    });
    expect(payload.bike.ridingStyle).toBe("sportive");
    expect(payload.bike.goal).toBe("balanced");
    expect(payload.bike.bikeType).toBe("mountain");
  });

  it("omits delta values when current bike setup is missing", () => {
    const payload = mapReportV2Payload({
      ...baseSource,
      bike: {
        ...baseSource.bike,
        currentSetup: undefined,
      },
    } as never);

    expect(payload.detailedFit.every((row) => row.delta === null)).toBe(true);
  });
});
