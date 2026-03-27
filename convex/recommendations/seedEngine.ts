import {
  calculateBikeFit,
  mapCoreScore,
  mapFlexibilityScore,
  type Ambition,
  type BikeCategory,
  type ClimbingLevel,
  type FitInputs,
  type FitOutputs,
  type FlexibilityScore,
} from "../lib/fitAlgorithm";
import { estimateEffectiveTopTubeMm } from "./inputMapping";

export interface EngineV1SeedSource {
  heightCm: number;
  inseamCm: number;
  torsoLengthCm?: number;
  armLengthCm?: number;
  shoulderWidthCm?: number;
  footLengthCm?: number;
  femurLengthCm?: number;
  flexibilityScore: FlexibilityScore;
  coreStabilityScore: number;
  bikeCategory: BikeCategory;
  ambition: Ambition;
  frameStackMm?: number;
  frameReachMm?: number;
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  climbingLevel?: ClimbingLevel;
}

export interface EngineComparisonSnapshot {
  saddleHeightMm: number;
  saddleSetbackMm: number;
  barDropMm: number;
  saddleToBarReachMm: number;
  stemLengthMm: number;
  crankLengthMm: number;
  handlebarWidthMm: number;
  confidenceScore: number;
}

export interface StoredCalculatedFit {
  recommendedStackMm: number;
  recommendedReachMm: number;
  effectiveTopTubeMm: number;
  saddleHeightMm: number;
  saddleSetbackMm: number;
  saddleHeightRange: {
    min: number;
    max: number;
  };
  handlebarDropMm: number;
  handlebarReachMm: number;
  stemLengthMm: number;
  stemAngleRecommendation: string;
  crankLengthMm: number;
  handlebarWidthMm: number;
}

export interface RecommendationItemEnvelope {
  parameter: string;
  target: number;
  rangeLow?: number;
  rangeHigh?: number;
  confidence?: number;
  method?: string;
  why?: string;
  feasibility?: "direct" | "component_change_required" | "not_yet_evaluated";
  riskFlags?: string[];
  changeOrder?: number;
}

export interface EngineV1SeedResult {
  fitInputs: FitInputs;
  fitOutputs: FitOutputs;
  calculatedFit: StoredCalculatedFit;
  comparisonSnapshot: EngineComparisonSnapshot;
  recommendationItems: RecommendationItemEnvelope[];
  confidenceScore: number;
  algorithmVersion: string;
}

const FLEXIBILITY_SCORE_MAP: Record<FlexibilityScore, 1 | 2 | 3 | 4 | 5> = {
  very_limited: 1,
  limited: 2,
  average: 3,
  good: 4,
  excellent: 5,
};

export function normalizeCoreScore(score: number | undefined): 1 | 2 | 3 | 4 | 5 {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return 3;
  }

  return Math.max(1, Math.min(5, Math.round(score))) as 1 | 2 | 3 | 4 | 5;
}

export function buildEngineV1FitInputs(source: EngineV1SeedSource): FitInputs {
  return {
    category: source.bikeCategory,
    ambition: source.ambition,
    heightMm: source.heightCm * 10,
    inseamMm: source.inseamCm * 10,
    flexibilityScore: mapFlexibilityScore(
      FLEXIBILITY_SCORE_MAP[source.flexibilityScore] ?? 3
    ),
    coreScore: mapCoreScore(normalizeCoreScore(source.coreStabilityScore)),
    torsoMm: source.torsoLengthCm ? source.torsoLengthCm * 10 : undefined,
    armMm: source.armLengthCm ? source.armLengthCm * 10 : undefined,
    shoulderWidthMm: source.shoulderWidthCm
      ? source.shoulderWidthCm * 10
      : undefined,
    footLengthMm: source.footLengthCm ? source.footLengthCm * 10 : undefined,
    femurMm: source.femurLengthCm ? source.femurLengthCm * 10 : undefined,
    frameStackMm: source.frameStackMm,
    frameReachMm: source.frameReachMm,
    experienceLevel: source.experienceLevel,
    climbingLevel: source.climbingLevel,
  };
}

export function mapStoredCalculatedFit(result: FitOutputs): StoredCalculatedFit {
  return {
    recommendedStackMm: result.frameStackTargetMm,
    recommendedReachMm: result.frameReachTargetMm,
    effectiveTopTubeMm: estimateEffectiveTopTubeMm(result.saddleToBarReachMm),
    saddleHeightMm: result.saddleHeightMm,
    saddleSetbackMm: result.saddleSetbackMm,
    saddleHeightRange: result.saddleHeightRange,
    handlebarDropMm: result.barDropMm,
    handlebarReachMm: result.saddleToBarReachMm,
    stemLengthMm: result.stemLengthMm,
    stemAngleRecommendation: `${result.stemAngleDeg}°`,
    crankLengthMm: result.crankLengthMm,
    handlebarWidthMm: result.handlebarWidthMm,
  };
}

export function buildEngineComparisonSnapshot(
  result: FitOutputs
): EngineComparisonSnapshot {
  return {
    saddleHeightMm: result.saddleHeightMm,
    saddleSetbackMm: result.saddleSetbackMm,
    barDropMm: result.barDropMm,
    saddleToBarReachMm: result.saddleToBarReachMm,
    stemLengthMm: result.stemLengthMm,
    crankLengthMm: result.crankLengthMm,
    handlebarWidthMm: result.handlebarWidthMm,
    confidenceScore: result.confidenceScore,
  };
}

function getRiskFlagsForParameter(
  result: FitOutputs,
  parameter: RecommendationItemEnvelope["parameter"]
): string[] | undefined {
  const riskFlags = result.warnings
    .filter((warning) => {
      if (parameter === "saddleHeightMm") {
        return (
          warning.type === "saddle_too_high" ||
          warning.type === "saddle_too_low" ||
          warning.type === "measurement_warning"
        );
      }

      if (parameter === "barDropMm") {
        return warning.type === "drop_risk" || warning.type === "flexibility_warning";
      }

      if (parameter === "saddleToBarReachMm") {
        return warning.type === "reach_risk" || warning.type === "core_warning";
      }

      return false;
    })
    .map((warning) => warning.message);

  return riskFlags.length > 0 ? riskFlags : undefined;
}

export function buildRecommendationItems(
  result: FitOutputs
): RecommendationItemEnvelope[] {
  return [
    {
      parameter: "saddleHeightMm",
      target: result.saddleHeightMm,
      rangeLow: result.saddleHeightRange.min,
      rangeHigh: result.saddleHeightRange.max,
      confidence: result.confidenceScore / 100,
      method: "seed_engine_v1",
      why: "Primary pedaling extension baseline.",
      feasibility: "direct",
      riskFlags: getRiskFlagsForParameter(result, "saddleHeightMm"),
      changeOrder: 2,
    },
    {
      parameter: "saddleSetbackMm",
      target: result.saddleSetbackMm,
      confidence: result.confidenceScore / 100,
      method: "seed_engine_v1",
      why: "Supports knee tracking and seated power balance.",
      feasibility: "direct",
      changeOrder: 3,
    },
    {
      parameter: "barDropMm",
      target: result.barDropMm,
      rangeLow: result.barDropRange.min,
      rangeHigh: result.barDropRange.max,
      confidence: result.confidenceScore / 100,
      method: "seed_engine_v1",
      why: "Balances front-end comfort and aggressiveness.",
      feasibility:
        result.spacerStackMm >= 0 ? "component_change_required" : "not_yet_evaluated",
      riskFlags: getRiskFlagsForParameter(result, "barDropMm"),
      changeOrder: 4,
    },
    {
      parameter: "saddleToBarReachMm",
      target: result.saddleToBarReachMm,
      rangeLow: result.reachRange.min,
      rangeHigh: result.reachRange.max,
      confidence: result.confidenceScore / 100,
      method: "seed_engine_v1",
      why: "Balances cockpit length, control, and trunk support.",
      feasibility: "component_change_required",
      riskFlags: getRiskFlagsForParameter(result, "saddleToBarReachMm"),
      changeOrder: 5,
    },
    {
      parameter: "crankLengthMm",
      target: result.crankLengthMm,
      confidence: result.confidenceScore / 100,
      method: "seed_engine_v1",
      why: "Matches lower-body proportions and category baseline.",
      feasibility: "component_change_required",
      changeOrder: 6,
    },
    {
      parameter: "handlebarWidthMm",
      target: result.handlebarWidthMm,
      confidence: result.confidenceScore / 100,
      method: "seed_engine_v1",
      why: "Targets control and shoulder-width alignment.",
      feasibility: "component_change_required",
      changeOrder: 7,
    },
  ];
}

export function runEngineV1Seed(source: EngineV1SeedSource): EngineV1SeedResult {
  const fitInputs = buildEngineV1FitInputs(source);
  const fitOutputs = calculateBikeFit(fitInputs);

  return {
    fitInputs,
    fitOutputs,
    calculatedFit: mapStoredCalculatedFit(fitOutputs),
    comparisonSnapshot: buildEngineComparisonSnapshot(fitOutputs),
    recommendationItems: buildRecommendationItems(fitOutputs),
    confidenceScore: fitOutputs.confidenceScore,
    algorithmVersion: fitOutputs.algorithmVersion,
  };
}
