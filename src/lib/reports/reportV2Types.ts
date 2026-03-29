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

export type ReportQuestionnaireContext = {
  experienceLevel: string | null;
  weeklyHours: string | null;
  rideLength: string | null;
  positionPriority: string | null;
  typeOfRiding: string | null;
};

export type ReportRiderSection = {
  name: string | null;
  imageUrl: string | null;
  heightCm: number | null;
  weightKg: number | null;
  inseamCm: number | null;
  armLengthCm: number | null;
  torsoLengthCm: number | null;
  shoulderWidthCm: number | null;
  bmi: number | null;
  bmiCategory: "underweight" | "normal" | "overweight" | "obese" | null;
  flexibilityScore: number | null;
  flexibilityLabel: string | null;
  coreStabilityScore: number | null;
  comfortScore: number | null;
};

export type ReportBikeSection = {
  name: string;
  bikeType: string;
  brand: string | null;
  model: string | null;
  ridingStyle: string | null;
  goal: string | null;
  description: string | null;
  imageUrl: string | null;
  questionnaire: ReportQuestionnaireContext;
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
  reportDate: string;
  rider: ReportRiderSection;
  bike: ReportBikeSection;
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
