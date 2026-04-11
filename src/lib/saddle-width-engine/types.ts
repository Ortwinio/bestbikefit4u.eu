export type SaddleRidingType =
  | "tt_triathlon"
  | "road_race"
  | "endurance_road"
  | "gravel"
  | "mtb"
  | "commuter_leisure"
  | "indoor_only";

export type SaddlePostureCategory = "aggressive" | "balanced" | "upright";

export type SaddleInputMethod = "measured" | "estimated";

export interface SaddleSymptomFlags {
  sisBonePain: boolean;
  numbness: boolean;
  chafing: boolean;
  slidingForward: boolean;
  instability: boolean;
  lowerBackPressure: boolean;
  handPressure: boolean;
  asymmetry: boolean;
}

export interface SaddleWidthInput {
  sitBoneWidthMm?: number;
  heightCm?: number;
  weightKg?: number;
  hipCircumferenceCm?: number;
  inputMethod: SaddleInputMethod;
  ridingType: SaddleRidingType;
  postureCategory: SaddlePostureCategory;
  indoorOutdoor?: "indoor" | "outdoor" | "mixed";
  symptoms?: SaddleSymptomFlags;
  currentSaddleWidthMm?: number;
  currentSaddleTilt?: "nose_down" | "neutral" | "nose_up" | "unknown";
  currentSaddleShape?: "flat" | "waved" | "hammock" | "short_nose" | "unknown";
  flexibilityScore?: number;
  coreStabilityScore?: number;
  typicalRideLength?: "short" | "medium" | "long" | "ultra";
}

export interface SaddleWidthResult {
  inputMethod: SaddleInputMethod;
  resolvedSitBoneWidthMm: number;
  estimatedSitBoneRange?: { min: number; max: number };
  targetSupportWidthMm: number;
  adjustedWidthMm: number;
  finalRecommendedWidthMm: number;
  widthRangeMinMm: number;
  widthRangeMaxMm: number;
  primaryWidthClass: string;
  primaryWidthClassRange: { min: number; max: number };
  alternateWidthClasses: string[];
  confidenceScore: number;
  confidenceLevel: "high" | "medium" | "lower";
  widthMatchScore?: number;
  widthMatchAssessment?: "too_narrow" | "good_match" | "too_wide";
  explanationKey: "measured_result" | "estimated_result";
  explanationParams: Record<string, string | number>;
}

export type SaddleFamily =
  | "short_nose_performance"
  | "endurance_allroad"
  | "gravel_mtb_support"
  | "comfort_upright";

export type SaddleNoseType = "short_nose" | "traditional_nose";
export type SaddleProfileShape = "flat" | "moderate_wave" | "waved";
export type SaddlePaddingPreference = "firm" | "medium" | "soft";

export interface FitInteractionWarning {
  code: string;
  severity: "info" | "warning";
  message: string;
}

export interface SaddleSuitabilityResult {
  saddleFamily: SaddleFamily;
  noseType: SaddleNoseType;
  profileShape: SaddleProfileShape;
  cutoutRecommended: boolean;
  paddingPreference: SaddlePaddingPreference;
  fitInteractionWarnings: FitInteractionWarning[];
  shapeFlags: string[];
}

export interface SaddleCalculationResult {
  width: SaddleWidthResult;
  suitability: SaddleSuitabilityResult;
}
