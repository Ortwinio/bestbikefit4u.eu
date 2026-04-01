import type { BikeType } from "@/lib/bikes";

export type PublicFitGeometryQuality = "full" | "partial" | "none";

export type PublicFitSnapshot = {
  bikeType?: BikeType | null;
  sizeLabel?: string | null;
  stackMm?: number | null;
  reachMm?: number | null;
  geometryQuality?: PublicFitGeometryQuality | "complete" | null;
  source?: string | null;
  snapshotUpdatedAt?: number | string | null;
};

export type QuickMatchScoreBand =
  | "unlikely"
  | "weak"
  | "borderline"
  | "could_fit";

export type QuickMatchConfidence = "high" | "medium" | "limited";

export type QuickMatchResult = {
  score: number;
  scoreMax: 75;
  scoreBand: QuickMatchScoreBand;
  confidence: QuickMatchConfidence;
  explanationCode: string;
  estimatedInseamCm: number;
  dimensionScores: {
    frameSize: number;
    cockpit: number;
    geometryConfidence: number;
  };
  calcVersion: "qm_v1";
};

export const QUICK_MATCH_CALC_VERSION = "qm_v1";
export const QUICK_MATCH_SCORE_MAX = 75;
export const QUICK_MATCH_MIN_HEIGHT_CM = 130;
export const QUICK_MATCH_MAX_HEIGHT_CM = 220;

type HeightRange = {
  min: number;
  max: number;
};

const NAMED_SIZE_HEIGHT_RANGES: Record<string, HeightRange> = {
  XXS: { min: 150, max: 163 },
  XS: { min: 157, max: 170 },
  S: { min: 165, max: 176 },
  SM: { min: 168, max: 179 },
  M: { min: 173, max: 183 },
  MD: { min: 173, max: 183 },
  ML: { min: 176, max: 186 },
  L: { min: 180, max: 190 },
  XL: { min: 187, max: 198 },
  XXL: { min: 194, max: 205 },
};

const NUMERIC_SIZE_HEIGHT_RANGES: Array<{ min: number; max: number; range: HeightRange }> = [
  { min: 46, max: 47, range: { min: 150, max: 163 } },
  { min: 48, max: 49, range: { min: 156, max: 168 } },
  { min: 50, max: 51, range: { min: 162, max: 173 } },
  { min: 52, max: 53, range: { min: 166, max: 178 } },
  { min: 54, max: 55, range: { min: 172, max: 183 } },
  { min: 56, max: 57, range: { min: 177, max: 188 } },
  { min: 58, max: 59, range: { min: 181, max: 192 } },
  { min: 60, max: 61, range: { min: 186, max: 198 } },
  { min: 62, max: 64, range: { min: 190, max: 203 } },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundNumber(value: number): number {
  return Math.round(value);
}

function normalizeSizeLabel(sizeLabel: string): string {
  return sizeLabel.trim().toUpperCase().replace(/[\s/_-]+/g, "");
}

function getHeightRangeForSizeLabel(sizeLabel: string | null | undefined): HeightRange | null {
  if (!sizeLabel) {
    return null;
  }

  const normalized = normalizeSizeLabel(sizeLabel);
  const namedMatch = NAMED_SIZE_HEIGHT_RANGES[normalized];
  if (namedMatch) {
    return namedMatch;
  }

  const numericMatch = normalized.match(/\d{2}/);
  if (!numericMatch) {
    return null;
  }

  const sizeNumber = Number.parseInt(numericMatch[0], 10);
  return (
    NUMERIC_SIZE_HEIGHT_RANGES.find(
      (entry) => sizeNumber >= entry.min && sizeNumber <= entry.max
    )?.range ?? null
  );
}

function scoreFrameSize(heightCm: number, sizeLabel: string | null | undefined): number {
  const range = getHeightRangeForSizeLabel(sizeLabel);
  if (!range) {
    return 0;
  }

  const midpoint = (range.min + range.max) / 2;
  if (heightCm >= range.min && heightCm <= range.max) {
    const midpointDiff = Math.abs(heightCm - midpoint);
    if (midpointDiff <= 2) {
      return 30;
    }
    if (midpointDiff <= 4) {
      return 28;
    }
    if (midpointDiff <= 6) {
      return 26;
    }
    return 24;
  }

  const edgeDiff =
    heightCm < range.min ? range.min - heightCm : heightCm - range.max;
  if (edgeDiff <= 2) {
    return 20;
  }
  if (edgeDiff <= 4) {
    return 14;
  }
  if (edgeDiff <= 6) {
    return 8;
  }
  if (edgeDiff <= 8) {
    return 3;
  }

  return 0;
}

function estimateTargetStackMm(estimatedInseamCm: number): number {
  return roundNumber(estimatedInseamCm * 6.75);
}

function estimateTargetReachMm(heightCm: number): number {
  return roundNumber(heightCm * 2.2);
}

function scoreSingleCockpitDimension(diffMm: number, maxScore: number): number {
  const thresholds = [
    { maxDiff: 8, score: maxScore },
    { maxDiff: 16, score: maxScore - 3 },
    { maxDiff: 24, score: maxScore - 6 },
    { maxDiff: 32, score: maxScore - 10 },
    { maxDiff: 40, score: maxScore - 14 },
    { maxDiff: 55, score: maxScore - 18 },
  ];

  for (const threshold of thresholds) {
    if (diffMm <= threshold.maxDiff) {
      return threshold.score;
    }
  }

  return 0;
}

function scoreCockpit(
  heightCm: number,
  estimatedInseamCm: number,
  snapshot: PublicFitSnapshot
): number {
  const hasStack = Number.isFinite(snapshot.stackMm);
  const hasReach = Number.isFinite(snapshot.reachMm);
  if (!hasStack && !hasReach) {
    return 0;
  }

  const stackDiff = hasStack
    ? Math.abs((snapshot.stackMm as number) - estimateTargetStackMm(estimatedInseamCm))
    : null;
  const reachDiff = hasReach
    ? Math.abs((snapshot.reachMm as number) - estimateTargetReachMm(heightCm))
    : null;

  if (stackDiff !== null && reachDiff !== null) {
    const stackScore = scoreSingleCockpitDimension(stackDiff, 16);
    const reachScore = scoreSingleCockpitDimension(reachDiff, 14);
    return clamp(stackScore + reachScore, 0, 30);
  }

  const partialDiff = stackDiff ?? reachDiff ?? 999;
  return clamp(scoreSingleCockpitDimension(partialDiff, 18), 0, 18);
}

function normalizeGeometryQuality(
  geometryQuality: PublicFitSnapshot["geometryQuality"]
): PublicFitGeometryQuality {
  if (geometryQuality === "complete") {
    return "full";
  }
  return geometryQuality ?? "none";
}

function scoreGeometryConfidence(snapshot: PublicFitSnapshot): number {
  const geometryQuality = normalizeGeometryQuality(snapshot.geometryQuality);
  const hasSizeLabel = Boolean(snapshot.sizeLabel && snapshot.sizeLabel.trim());
  const hasStack = Number.isFinite(snapshot.stackMm);
  const hasReach = Number.isFinite(snapshot.reachMm);

  if (geometryQuality === "none" || (!hasSizeLabel && !hasStack && !hasReach)) {
    return 0;
  }

  if (geometryQuality === "full" && hasSizeLabel && hasStack && hasReach) {
    return 15;
  }

  if (geometryQuality === "full" && hasStack && hasReach) {
    return 14;
  }

  if (geometryQuality === "partial" && hasSizeLabel && (hasStack || hasReach)) {
    return 10;
  }

  if (hasSizeLabel || hasStack || hasReach) {
    return 8;
  }

  return 0;
}

function getConfidence(
  snapshot: PublicFitSnapshot,
  geometryConfidence: number
): QuickMatchConfidence {
  const geometryQuality = snapshot.geometryQuality ?? "none";
  const normalizedGeometryQuality = normalizeGeometryQuality(geometryQuality);
  const hasData =
    Boolean(snapshot.sizeLabel && snapshot.sizeLabel.trim()) ||
    Number.isFinite(snapshot.stackMm) ||
    Number.isFinite(snapshot.reachMm);

  if (normalizedGeometryQuality === "none" || !hasData || geometryConfidence === 0) {
    return "limited";
  }

  if (
    normalizedGeometryQuality === "full" &&
    geometryConfidence >= 14 &&
    Number.isFinite(snapshot.stackMm) &&
    Number.isFinite(snapshot.reachMm)
  ) {
    return "high";
  }

  return "medium";
}

function getScoreBand(score: number): QuickMatchScoreBand {
  if (score >= 58) {
    return "could_fit";
  }
  if (score >= 40) {
    return "borderline";
  }
  if (score >= 20) {
    return "weak";
  }
  return "unlikely";
}

function getExplanationCode(
  confidence: QuickMatchConfidence,
  frameSize: number,
  cockpit: number,
  scoreBand: QuickMatchScoreBand
): string {
  if (confidence === "limited") {
    return "limited_geometry_data";
  }

  if (frameSize >= 24 && cockpit >= 20) {
    return "frame_size_close";
  }

  if (frameSize >= 20 && cockpit < 12) {
    return "cockpit_check_needed";
  }

  if (frameSize < 12 && cockpit >= 18) {
    return "frame_size_borderline";
  }

  if (scoreBand === "could_fit") {
    return "geometry_looks_compatible";
  }

  if (scoreBand === "borderline") {
    return "mixed_geometry_signals";
  }

  if (scoreBand === "weak") {
    return "weak_geometry_match";
  }

  return "unlikely_geometry_match";
}

export function isValidQuickMatchHeight(heightCm: number): boolean {
  return (
    Number.isFinite(heightCm) &&
    heightCm >= QUICK_MATCH_MIN_HEIGHT_CM &&
    heightCm <= QUICK_MATCH_MAX_HEIGHT_CM
  );
}

export function estimateInseamFromHeight(heightCm: number): number {
  return roundNumber(heightCm * 0.47);
}

export function runQuickMatch(
  heightCm: number,
  snapshot: PublicFitSnapshot
): QuickMatchResult {
  if (!isValidQuickMatchHeight(heightCm)) {
    throw new Error("quick_match_height_out_of_range");
  }

  const estimatedInseamCm = estimateInseamFromHeight(heightCm);
  const frameSize = scoreFrameSize(heightCm, snapshot.sizeLabel);
  const cockpit = scoreCockpit(heightCm, estimatedInseamCm, snapshot);
  const geometryConfidence = scoreGeometryConfidence(snapshot);
  const score = clamp(
    frameSize + cockpit + geometryConfidence,
    0,
    QUICK_MATCH_SCORE_MAX
  );
  const confidence = getConfidence(snapshot, geometryConfidence);
  const scoreBand = getScoreBand(score);

  return {
    score,
    scoreMax: QUICK_MATCH_SCORE_MAX,
    scoreBand,
    confidence,
    explanationCode: getExplanationCode(
      confidence,
      frameSize,
      cockpit,
      scoreBand
    ),
    estimatedInseamCm,
    dimensionScores: {
      frameSize,
      cockpit,
      geometryConfidence,
    },
    calcVersion: QUICK_MATCH_CALC_VERSION,
  };
}
