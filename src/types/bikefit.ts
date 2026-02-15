// Bike fit types based on documentation

export type BikeCategory = "road" | "gravel" | "mtb" | "city";

export type RidingStyle =
  | "recreational"
  | "fitness"
  | "sportive"
  | "racing"
  | "commuting"
  | "touring";

export type Ambition = "comfort" | "balanced" | "performance" | "aero";

export type FlexibilityScore =
  | "very_limited"
  | "limited"
  | "average"
  | "good"
  | "excellent";

// Numeric flexibility score (1-5) mapping
export const flexibilityScoreMap: Record<FlexibilityScore, number> = {
  very_limited: 1,
  limited: 2,
  average: 3,
  good: 4,
  excellent: 5,
};

// Core stability score (1-5)
export type CoreStabilityScore = 1 | 2 | 3 | 4 | 5;

export interface BodyMeasurements {
  // Required
  heightCm: number;
  inseamCm: number;
  flexibilityScore: FlexibilityScore;
  coreStabilityScore: CoreStabilityScore;

  // Optional (advanced)
  torsoLengthCm?: number;
  armLengthCm?: number;
  femurLengthCm?: number;
  shoulderWidthCm?: number;
  footLengthMm?: number;
}

export interface CurrentBikeSetup {
  saddleHeightMm?: number;
  saddleSetbackMm?: number;
  barDropMm?: number;
  stemLengthMm?: number;
  crankLengthMm?: number;
}

export interface FitInputs {
  category: BikeCategory;
  ambition: Ambition;
  measurements: BodyMeasurements;
  currentSetup?: CurrentBikeSetup;
}

export interface FitRecommendation {
  // Core outputs (all in mm unless noted)
  saddleHeightMm: number;
  saddleSetbackMm: number;
  saddleTiltDeg: number;
  barDropMm: number;
  saddleToBarReachMm: number;
  crankLengthMm: number;
  handlebarWidthMm: number;
  cleatOffsetMm: number;

  // Frame targets
  frameStackTargetMm: number;
  frameReachTargetMm: number;

  // Stem solution
  stemLengthMm: number;
  stemAngleDeg: number;
  spacerStackMm: number;

  // Metadata
  confidenceScore: number;
  algorithmVersion: string;

  // Warnings
  warnings: FitWarning[];

  // Comparison to current (if provided)
  deltas?: FitDeltas;
}

export interface FitWarning {
  type: "saddle_high" | "saddle_low" | "drop_risk" | "reach_risk" | "general";
  severity: "info" | "warning" | "critical";
  message: string;
  recommendation: string;
}

export interface FitDeltas {
  saddleHeightDelta: number;
  saddleSetbackDelta: number;
  barDropDelta: number;
  reachDelta: number;
}
