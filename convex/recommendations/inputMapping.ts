import type { Ambition, BikeCategory, FitInputs, FlexibilityScore } from "../lib/fitAlgorithm";
import { mapCoreScore, mapFlexibilityScore } from "../lib/fitAlgorithm";

export const EFFECTIVE_TOP_TUBE_REACH_OFFSET_MM = 50;

const BIKE_TYPE_MAP: Record<string, BikeCategory> = {
  road: "road",
  gravel: "gravel",
  mountain: "mtb",
  hybrid: "city",
  city: "city",
  tt_triathlon: "road",
  cyclocross: "gravel",
  touring: "gravel",
};

const RIDING_STYLE_MAP: Record<string, BikeCategory> = {
  recreational: "city",
  fitness: "road",
  sportive: "road",
  racing: "road",
  commuting: "city",
  touring: "gravel",
};

const FLEXIBILITY_SCORE_MAP: Record<FlexibilityScore, 1 | 2 | 3 | 4 | 5> = {
  very_limited: 1,
  limited: 2,
  average: 3,
  good: 4,
  excellent: 5,
};

const GOAL_TO_AMBITION_MAP: Record<string, Ambition> = {
  comfort: "comfort",
  balanced: "balanced",
  performance: "performance",
  aerodynamics: "aero",
};

export interface ProfileForRecommendation {
  flexibilityScore: FlexibilityScore;
  coreStabilityScore?: number;
  heightCm: number;
  inseamCm: number;
  torsoLengthCm?: number;
  armLengthCm?: number;
  shoulderWidthCm?: number;
  footLengthCm?: number;
  femurLengthCm?: number;
}

export interface SessionForRecommendation {
  primaryGoal: string;
  ridingStyle: string;
}

export function mapBikeCategory(
  session: SessionForRecommendation,
  bikeType?: string
): BikeCategory {
  if (bikeType) {
    return BIKE_TYPE_MAP[bikeType] || "road";
  }
  return RIDING_STYLE_MAP[session.ridingStyle] || "road";
}

export function mapAmbition(primaryGoal: string): Ambition {
  return GOAL_TO_AMBITION_MAP[primaryGoal] || "balanced";
}

export function normalizeCoreScore(score: number | undefined): 1 | 2 | 3 | 4 | 5 {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return 3;
  }
  return Math.max(1, Math.min(5, Math.round(score))) as 1 | 2 | 3 | 4 | 5;
}

export function buildFitInputs(params: {
  profile: ProfileForRecommendation;
  session: SessionForRecommendation;
  bikeType?: string;
}): FitInputs {
  const { profile, session, bikeType } = params;
  const bikeCategory = mapBikeCategory(session, bikeType);
  const flexNum = FLEXIBILITY_SCORE_MAP[profile.flexibilityScore] || 3;
  const coreNum = normalizeCoreScore(profile.coreStabilityScore);

  return {
    category: bikeCategory,
    ambition: mapAmbition(session.primaryGoal),
    heightMm: profile.heightCm * 10,
    inseamMm: profile.inseamCm * 10,
    flexibilityScore: mapFlexibilityScore(flexNum),
    coreScore: mapCoreScore(coreNum),
    torsoMm: profile.torsoLengthCm ? profile.torsoLengthCm * 10 : undefined,
    armMm: profile.armLengthCm ? profile.armLengthCm * 10 : undefined,
    shoulderWidthMm: profile.shoulderWidthCm
      ? profile.shoulderWidthCm * 10
      : undefined,
    footLengthMm: profile.footLengthCm ? profile.footLengthCm * 10 : undefined,
    femurMm: profile.femurLengthCm ? profile.femurLengthCm * 10 : undefined,
  };
}

/**
 * Effective Top Tube v1 approximation.
 *
 * We currently estimate ETT from saddle-to-bar reach with a fixed 50mm bridge
 * offset to keep recommendation output stable while no frame-geometry database
 * is available. Replace this with geometry-based ETT once bike/frame metadata
 * is integrated.
 */
export function estimateEffectiveTopTubeMm(saddleToBarReachMm: number): number {
  return saddleToBarReachMm + EFFECTIVE_TOP_TUBE_REACH_OFFSET_MM;
}
