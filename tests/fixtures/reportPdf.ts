import { runEngineV1Seed } from "../../convex/recommendations/seedEngine";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";
const reportPdfSource = {
  session: {
    _id: "session_abc",
    createdAt: Date.UTC(2026, 2, 20, 10, 0, 0),
    completedAt: Date.UTC(2026, 2, 21, 14, 30, 0),
    bikeType: "road",
    ridingStyle: "sportive",
    primaryGoal: "performance",
    engineVersion: "v2",
  },
  recommendation: {
    engineVersion: "v2",
    algorithmVersion: "2.0.0",
    confidenceScore: 90,
    calculatedFit: {
      recommendedStackMm: 626,
      recommendedReachMm: 402,
      effectiveTopTubeMm: 588,
      saddleHeightMm: 754,
      saddleSetbackMm: 49,
      saddleHeightRange: { min: 731, max: 774 },
      handlebarDropMm: 98,
      handlebarReachMm: 538,
      stemLengthMm: 100,
      stemAngleRecommendation: "-6°",
      crankLengthMm: 172.5,
      handlebarWidthMm: 420,
    },
    frameSizeRecommendations: [{ size: "56", fitScore: 92 }],
    fitNotes: ["Saddle height of 754mm is optimized for your 840mm inseam."],
    recommendationItems: [],
    pressureInsights: {
      comfortBias: "balanced",
      stabilityScore: 0.8,
      warnings: [],
      version: 1,
    },
  },
  bike: {
    name: "Canyon Endurace",
    bikeType: "road",
    brand: "Canyon",
    model: "CF 7",
    ridingStyle: "sportive",
    primaryGoal: "performance",
    description: "An endurance road bike tuned for long fast rides.",
    bikeWeightKg: 8.2,
    currentSetup: { saddleHeightMm: 750 },
  },
  bikeProfile: null,
  profile: {
    heightCm: 180,
    weightKg: 72,
    inseamCm: 84,
    armLengthCm: 62,
    torsoLengthCm: 60.4,
    shoulderWidthCm: 40,
    flexibilityScore: "good",
    coreStabilityScore: 4,
    hasPain: "yes",
    painSeverity: 2,
  },
  user: {
    displayName: "Ortwin",
  },
  riderImageUrl: "https://example.com/rider.jpg",
  latestPressureCalculation: {
    recommendedFrontPsi: 67,
    recommendedRearPsi: 71,
    recommendedFrontBar: 4.6,
    recommendedRearBar: 4.9,
    comfortScore: 0.7,
    gripScore: 0.75,
    efficiencyScore: 0.72,
    inputSnapshot: {
      bodyWeightKg: 72,
      surface: "average_asphalt",
      ridingGoal: "balance",
    },
  },
};

/** Existing sparse fixture remains stable for missing-data and regression coverage. */
export const reportPdfFixture = mapReportV2Payload(reportPdfSource as never);

/** Supported ranges come from the same seed engine used to persist real recommendations. */
export const reportPdfFullEngine = runEngineV1Seed({
  heightCm: 180,
  inseamCm: 84,
  torsoLengthCm: 60.4,
  armLengthCm: 62,
  shoulderWidthCm: 40,
  flexibilityScore: "good",
  coreStabilityScore: 4,
  bikeCategory: "road",
  ambition: "performance",
  experienceLevel: "intermediate",
});

export const reportPdfFullSource = {
  ...reportPdfSource,
  recommendation: {
    ...reportPdfSource.recommendation,
    calculatedFit: reportPdfFullEngine.calculatedFit,
    recommendationItems: reportPdfFullEngine.recommendationItems,
    confidenceScore: reportPdfFullEngine.confidenceScore,
    algorithmVersion: reportPdfFullEngine.algorithmVersion,
    // Exact generated-note templates from recommendations/actions.ts generateFitNotes.
    fitNotes: [
      `Saddle height of ${reportPdfFullEngine.fitOutputs.saddleHeightMm}mm is optimized for ` +
        `your ${reportPdfFullEngine.fitInputs.inseamMm}mm inseam.`,
      ...(reportPdfFullEngine.fitOutputs.barDropMm > 100
        ? ["Your position is quite aggressive. Consider building up to this gradually."]
        : reportPdfFullEngine.fitOutputs.barDropMm < 50
          ? ["Your position prioritizes comfort with minimal bar drop."]
          : []),
      "Reach calculations are refined using your torso and arm measurements.",
    ],
  },
  bike: {
    ...reportPdfSource.bike,
    currentGeometry: { frameSize: "56" },
  },
  profile: {
    ...reportPdfSource.profile,
    hasPain: "yes",
    painAreas: ["knee_front"],
    experienceLevel: "intermediate",
    weeklyHours: "6-10",
    typicalRideLength: "long",
    positionPriority: "performance",
  },
  questionnaireResponses: [
    { questionId: "experience_level", response: "intermediate" },
    { questionId: "weekly_hours", response: "6-10" },
    { questionId: "typical_ride_length", response: "long" },
    { questionId: "position_priority", response: "performance" },
    { questionId: "road_riding_type", response: "group" },
    { questionId: "has_pain", response: "yes" },
    { questionId: "pain_areas", response: ["knee_front"] },
  ],
};

export const reportPdfFullFixture = mapReportV2Payload(reportPdfFullSource as never);
