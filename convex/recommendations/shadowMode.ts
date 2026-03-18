import type { EngineComparisonSnapshot } from "./seedEngine";

export function isEngineV2ShadowEnabled(): boolean {
  return process.env.ENGINE_V2_SHADOW_ENABLED?.toLowerCase() === "true";
}

export function buildShadowDeltas(params: {
  baseline: EngineComparisonSnapshot;
  shadow: EngineComparisonSnapshot;
}): EngineComparisonSnapshot {
  const { baseline, shadow } = params;

  return {
    saddleHeightMm: shadow.saddleHeightMm - baseline.saddleHeightMm,
    saddleSetbackMm: shadow.saddleSetbackMm - baseline.saddleSetbackMm,
    barDropMm: shadow.barDropMm - baseline.barDropMm,
    saddleToBarReachMm: shadow.saddleToBarReachMm - baseline.saddleToBarReachMm,
    stemLengthMm: shadow.stemLengthMm - baseline.stemLengthMm,
    crankLengthMm: shadow.crankLengthMm - baseline.crankLengthMm,
    handlebarWidthMm: shadow.handlebarWidthMm - baseline.handlebarWidthMm,
    confidenceScore: shadow.confidenceScore - baseline.confidenceScore,
  };
}

export function hasMaterialShadowDelta(
  deltas: EngineComparisonSnapshot
): boolean {
  return Object.values(deltas).some((value) => Math.abs(value) > 0);
}
