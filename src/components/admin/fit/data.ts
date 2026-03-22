export type EngineVersionStatus = "draft" | "qa" | "active" | "deprecated";
export type FitReviewStatus = "not_required" | "required" | "reviewed" | "overridden";

export type EngineVersionRecord = {
  id: string;
  versionLabel: string;
  status: EngineVersionStatus;
  activatedAt?: string;
  owner: string;
  description: string;
  runsCount: number;
  lowConfidenceCount: number;
  benchmark: string;
  confidence: string;
};

export type FitTraceStep = {
  step: string;
  method: string;
  input: string;
  output: string;
  modifier?: string;
  warning?: string;
};

export type FitRunRecord = {
  sessionId: string;
  user: string;
  bike: string;
  engineVersionId: string;
  completedAt: string;
  confidenceScore: number;
  warningsCount: number;
  reviewStatus: FitReviewStatus;
  resultSummary: string;
};

export const engineVersions: EngineVersionRecord[] = [
  {
    id: "v2.6.0",
    versionLabel: "v2.6.0",
    status: "active",
    activatedAt: "2026-03-18 09:20",
    owner: "Mila Vermeer",
    description: "Refined comfort weighting, lower noise in low-confidence edge cases, and cleaner geometry trace output.",
    runsCount: 1842,
    lowConfidenceCount: 21,
    benchmark: "+3.2% closer to target pressure / fit output",
    confidence: "High",
  },
  {
    id: "v2.5.2",
    versionLabel: "v2.5.2",
    status: "qa",
    owner: "Jonas Klein",
    description: "Fixes saddle setback regression in compact frames and adds better warning propagation.",
    runsCount: 314,
    lowConfidenceCount: 8,
    benchmark: "+1.1% fewer review queue items",
    confidence: "Medium",
  },
  {
    id: "v2.5.1",
    versionLabel: "v2.5.1",
    status: "draft",
    owner: "Jonas Klein",
    description: "Preparing a calibration pass for mixed-terrain measurements and age-based heuristics.",
    runsCount: 0,
    lowConfidenceCount: 0,
    benchmark: "Pending QA benchmark upload",
    confidence: "Draft",
  },
  {
    id: "v2.4.9",
    versionLabel: "v2.4.9",
    status: "deprecated",
    owner: "Mila Vermeer",
    description: "Legacy version kept for historical traceability only.",
    runsCount: 5320,
    lowConfidenceCount: 103,
    benchmark: "Superseded by v2.6.x",
    confidence: "Low",
  },
];

export const fitRuns: FitRunRecord[] = [
  {
    sessionId: "run-18291",
    user: "Sara van Dijk",
    bike: "Trek Domane SL 6",
    engineVersionId: "v2.6.0",
    completedAt: "2026-03-22 08:48",
    confidenceScore: 0.92,
    warningsCount: 0,
    reviewStatus: "not_required",
    resultSummary: "Stable comfort-biased result with no manual review needed.",
  },
  {
    sessionId: "run-18255",
    user: "Timo Jansen",
    bike: "Specialized Diverge",
    engineVersionId: "v2.6.0",
    completedAt: "2026-03-22 07:15",
    confidenceScore: 0.68,
    warningsCount: 2,
    reviewStatus: "required",
    resultSummary: "Review recommended because inseam and flexibility inputs are outliers.",
  },
  {
    sessionId: "run-18199",
    user: "Eva Brouwer",
    bike: "Canyon Ultimate",
    engineVersionId: "v2.5.2",
    completedAt: "2026-03-21 19:02",
    confidenceScore: 0.81,
    warningsCount: 1,
    reviewStatus: "reviewed",
    resultSummary: "Reviewed after fit-specialist override note was added.",
  },
  {
    sessionId: "run-18142",
    user: "Niels de Groot",
    bike: "Orbea Terra",
    engineVersionId: "v2.6.0",
    completedAt: "2026-03-21 14:20",
    confidenceScore: 0.54,
    warningsCount: 3,
    reviewStatus: "overridden",
    resultSummary: "Manual note documented a short-cockpit preference.",
  },
];

export const fitTraces: Record<string, FitTraceStep[]> = {
  "run-18291": [
    {
      step: "Rider baseline",
      method: "Inseam and torso normalization",
      input: "Inseam 84 cm, torso 63 cm",
      output: "Neutral baseline established",
    },
    {
      step: "Saddle height",
      method: "Inseam x 0.885",
      input: "84 cm inseam",
      output: "743 mm",
      modifier: "+6 mm comfort bias",
    },
    {
      step: "Bar reach",
      method: "Stack/reach target blend",
      input: "Comfort / endurance goal",
      output: "391 mm",
    },
  ],
  "run-18255": [
    {
      step: "Rider baseline",
      method: "Inseam and flexibility blend",
      input: "Inseam 89 cm, flexibility limited",
      output: "Baseline set with caution",
      warning: "Flexibility score lower than expected for preferred aggression",
    },
    {
      step: "Saddle height",
      method: "Inseam x 0.885",
      input: "89 cm inseam",
      output: "779 mm",
      modifier: "-4 mm due to low mobility",
    },
    {
      step: "Confidence gate",
      method: "Warning aggregation",
      input: "2 warnings",
      output: "Review queue flag raised",
      warning: "Manual review recommended",
    },
  ],
  "run-18199": [
    {
      step: "Rider baseline",
      method: "Inseam and reach balance",
      input: "Inseam 82 cm, rider weight 74 kg",
      output: "Stable baseline",
    },
    {
      step: "Saddle setback",
      method: "Hip angle and support heuristic",
      input: "Endurance road bike",
      output: "54 mm setback",
      modifier: "+2 mm after review",
    },
    {
      step: "Output confidence",
      method: "Score blend",
      input: "One warning",
      output: "0.81",
    },
  ],
  "run-18142": [
    {
      step: "Rider baseline",
      method: "Geometry and fit history blend",
      input: "Past runs on compact frames",
      output: "Aggressive baseline",
    },
    {
      step: "Handlebar drop",
      method: "Stack/reach normalization",
      input: "Short cockpit preference",
      output: "Drop reduced by 8 mm",
      warning: "Manual override note recorded",
    },
    {
      step: "Confidence gate",
      method: "Outlier detection",
      input: "3 warnings",
      output: "0.54",
      warning: "Needs review",
    },
  ],
};
