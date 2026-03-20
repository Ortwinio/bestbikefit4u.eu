export type ReportParameterKey =
  | "saddleHeight"
  | "saddleSetback"
  | "handlebarDrop"
  | "handlebarReach"
  | "stem"
  | "crankLength"
  | "handlebarWidth";

export type ReportItemStatus = "ready" | "pending_data" | "optional";

export type ReportDelta = {
  direction: "increase" | "decrease" | "neutral";
  amountMm: number;
};

export type ReportProfileSection = {
  sessionId: string;
  bikeType: string;
  bikeImageUrl?: string | null;
  ridingStyle: string;
  goal: string;
  algorithmVersion: string;
  engineVersion: string;
  globalConfidence: number;
  dataQualityStatus: "complete" | "partial";
  missingData: string[];
};

export type ReportPriorityRow = {
  key: ReportParameterKey;
  targetLabel: string;
  status: ReportItemStatus;
  confidence: number;
};

export type ReportDetailedRow = {
  key: ReportParameterKey;
  targetLabel: string;
  rangeLabel: string | null;
  confidence: number;
  status: ReportItemStatus;
  feasibility: "direct" | "component_change_required" | "not_yet_evaluated";
  delta: ReportDelta | null;
  currentLabel: string | null;
};

export type ReportAdjustmentStep = {
  key: ReportParameterKey;
  targetLabel: string;
  order: number;
};

export type ReportTirePressureReady = {
  status: "ready";
  frontPsi: number;
  rearPsi: number;
  frontBar: number;
  rearBar: number;
  confidence: number | null;
  surface: string | null;
  inputs: Array<{ label: string; value: string }>;
  warnings: string[];
};

export type ReportTirePressurePending = {
  status: "pending_required_inputs";
  required: string[];
  quickStartTable: Array<{
    weightLabel: string;
    tireSizeLabel: string;
    psiLabel: string;
  }>;
};

export type ReportTirePressureSection =
  | ReportTirePressureReady
  | ReportTirePressurePending;

export type ReportV2Payload = {
  profile: ReportProfileSection;
  prioritySummary: ReportPriorityRow[];
  detailedFit: ReportDetailedRow[];
  adjustmentSequence: ReportAdjustmentStep[];
  tirePressure: ReportTirePressureSection;
  frameTargets: {
    stackMm: number;
    reachMm: number;
    effectiveTopTubeMm: number;
    recommendedFrameLabel: string | null;
  };
  fitNotes: string[];
};
