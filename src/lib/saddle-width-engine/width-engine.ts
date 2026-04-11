import {
  BIKE_TYPE_ADJUSTMENTS_MM,
  CONFIDENCE_WEIGHTS,
  HIP_CIRCUMFERENCE_RANGE,
  POSTURE_ADDITIONS_MM,
  SIT_BONE_WIDTH_RANGE,
  SYMPTOM_DELTAS_MM,
  WIDTH_BINS,
} from "./config";
import type {
  SaddlePostureCategory,
  SaddleRidingType,
  SaddleSymptomFlags,
  SaddleWidthInput,
  SaddleWidthResult,
} from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundToWhole(value: number) {
  return Math.round(value);
}

function toConfidenceLevel(score: number): SaddleWidthResult["confidenceLevel"] {
  if (score >= 85) return "high";
  if (score >= 65) return "medium";
  return "lower";
}

export function estimateSitBoneWidth(input: {
  heightCm: number;
  weightKg: number;
  hipCircumferenceCm: number;
}) {
  const { heightCm, weightKg, hipCircumferenceCm } = input;

  if (
    !Number.isFinite(heightCm) ||
    !Number.isFinite(weightKg) ||
    !Number.isFinite(hipCircumferenceCm)
  ) {
    throw new Error("Estimated saddle width requires height, weight, and hip circumference.");
  }

  if (
    hipCircumferenceCm < HIP_CIRCUMFERENCE_RANGE.min ||
    hipCircumferenceCm > HIP_CIRCUMFERENCE_RANGE.max
  ) {
    throw new Error("Hip circumference is out of range.");
  }

  let base = 160;
  if (hipCircumferenceCm < 90) base = 115;
  else if (hipCircumferenceCm <= 95) base = 120;
  else if (hipCircumferenceCm <= 100) base = 125;
  else if (hipCircumferenceCm <= 106) base = 130;
  else if (hipCircumferenceCm <= 112) base = 138;
  else if (hipCircumferenceCm <= 118) base = 145;
  else if (hipCircumferenceCm <= 124) base = 152;

  let heightCorrection = 6;
  if (heightCm < 160) heightCorrection = -5;
  else if (heightCm <= 175) heightCorrection = 0;
  else if (heightCm <= 185) heightCorrection = 3;

  let weightCorrection = 5;
  if (weightKg < 60) weightCorrection = -3;
  else if (weightKg <= 80) weightCorrection = 0;
  else if (weightKg <= 95) weightCorrection = 3;

  const estimatedMm = clamp(base + heightCorrection + weightCorrection, 90, 170);

  return {
    estimatedMm,
    rangeMm: {
      min: estimatedMm - 10,
      max: estimatedMm + 10,
    },
  };
}

export function mapPostureToIndex(
  postureCategory: SaddlePostureCategory,
  ridingType: SaddleRidingType
): 0 | 1 | 2 | 3 | 4 {
  if (postureCategory === "aggressive" && ridingType === "tt_triathlon") {
    return 0;
  }
  if (postureCategory === "aggressive") {
    return 1;
  }
  if (postureCategory === "balanced") {
    return 2;
  }
  if (postureCategory === "upright" && ridingType === "commuter_leisure") {
    return 4;
  }
  return 3;
}

export function classifySymptoms(symptoms?: SaddleSymptomFlags): {
  widthDeltaMm: number;
  dominant: "widen" | "narrow" | "shape_or_setup" | "conflicting" | "none";
} {
  if (!symptoms) {
    return { widthDeltaMm: 0, dominant: "none" };
  }

  const widenSignals = symptoms.numbness || symptoms.sisBonePain || symptoms.instability;
  const narrowSignals = symptoms.chafing;
  const setupSignals =
    symptoms.slidingForward ||
    symptoms.lowerBackPressure ||
    symptoms.handPressure ||
    symptoms.asymmetry;

  if (widenSignals && narrowSignals) {
    return { widthDeltaMm: 0, dominant: "conflicting" };
  }
  if (widenSignals) {
    return {
      widthDeltaMm: SYMPTOM_DELTAS_MM.numbness_or_pressure,
      dominant: "widen",
    };
  }
  if (narrowSignals) {
    return {
      widthDeltaMm: SYMPTOM_DELTAS_MM.chafing_or_blockage,
      dominant: "narrow",
    };
  }
  if (setupSignals) {
    return { widthDeltaMm: 0, dominant: "shape_or_setup" };
  }
  return { widthDeltaMm: 0, dominant: "none" };
}

export function findWidthClass(widthMm: number) {
  const activeIndex = WIDTH_BINS.findIndex(
    (bin) => widthMm >= bin.min && widthMm <= bin.max
  );
  const resolvedIndex =
    activeIndex >= 0
      ? activeIndex
      : widthMm < WIDTH_BINS[0].min
        ? 0
        : WIDTH_BINS.length - 1;
  const primary = WIDTH_BINS[resolvedIndex];
  const alternates = [
    WIDTH_BINS[resolvedIndex - 1]?.label,
    WIDTH_BINS[resolvedIndex + 1]?.label,
  ].filter((value): value is string => Boolean(value));

  return {
    label: primary.label,
    range: { min: primary.min, max: primary.max },
    alternates,
  };
}

function resolveMeasuredSitBoneWidth(sitBoneWidthMm?: number) {
  if (!Number.isFinite(sitBoneWidthMm)) {
    throw new Error("Measured saddle width requires sit-bone width.");
  }
  if (
    sitBoneWidthMm! < SIT_BONE_WIDTH_RANGE.min ||
    sitBoneWidthMm! > SIT_BONE_WIDTH_RANGE.max
  ) {
    throw new Error("Sit-bone width is out of range.");
  }
  return sitBoneWidthMm!;
}

function calculateWidthMatch(
  currentSaddleWidthMm: number | undefined,
  finalRecommendedWidthMm: number
): Pick<SaddleWidthResult, "widthMatchScore" | "widthMatchAssessment"> {
  if (!Number.isFinite(currentSaddleWidthMm)) {
    return {};
  }

  const offset = Math.abs(currentSaddleWidthMm! - finalRecommendedWidthMm);
  if (offset <= 5) {
    return { widthMatchScore: 90, widthMatchAssessment: "good_match" };
  }
  if (offset <= 15) {
    const score = roundToWhole(89 - ((offset - 6) / 9) * 29);
    return {
      widthMatchScore: score,
      widthMatchAssessment:
        currentSaddleWidthMm! < finalRecommendedWidthMm ? "too_narrow" : "too_wide",
    };
  }

  const score = clamp(roundToWhole(59 - Math.min(offset - 15, 20) * 1.5), 20, 59);
  return {
    widthMatchScore: score,
    widthMatchAssessment:
      currentSaddleWidthMm! < finalRecommendedWidthMm ? "too_narrow" : "too_wide",
  };
}

export function calculateSaddleWidth(input: SaddleWidthInput): SaddleWidthResult {
  const symptomClassification = classifySymptoms(input.symptoms);
  const postureIndex = mapPostureToIndex(input.postureCategory, input.ridingType);
  const postureAddition = POSTURE_ADDITIONS_MM[postureIndex];
  const bikeAdjustment = BIKE_TYPE_ADJUSTMENTS_MM[input.ridingType];

  let resolvedSitBoneWidthMm: number;
  let estimatedSitBoneRange: { min: number; max: number } | undefined;

  if (input.inputMethod === "measured") {
    resolvedSitBoneWidthMm = resolveMeasuredSitBoneWidth(input.sitBoneWidthMm);
  } else {
    const estimate = estimateSitBoneWidth({
      heightCm: input.heightCm as number,
      weightKg: input.weightKg as number,
      hipCircumferenceCm: input.hipCircumferenceCm as number,
    });
    resolvedSitBoneWidthMm = estimate.estimatedMm;
    estimatedSitBoneRange = estimate.rangeMm;
  }

  const targetSupportWidthMm = resolvedSitBoneWidthMm + postureAddition;
  const adjustedWidthMm = targetSupportWidthMm + bikeAdjustment;
  const finalRecommendedWidthMm = adjustedWidthMm + symptomClassification.widthDeltaMm;
  const widthRangeMinMm = finalRecommendedWidthMm - 5;
  const widthRangeMaxMm = finalRecommendedWidthMm + 5;
  const widthClass = findWidthClass(finalRecommendedWidthMm);

  let confidenceScore: number =
    input.inputMethod === "measured"
      ? CONFIDENCE_WEIGHTS.measuredBase
      : CONFIDENCE_WEIGHTS.estimatedBase;

  if (!input.ridingType) confidenceScore += CONFIDENCE_WEIGHTS.missingRidingType;
  if (!input.postureCategory) confidenceScore += CONFIDENCE_WEIGHTS.missingPosture;
  if (symptomClassification.dominant === "conflicting") {
    confidenceScore += CONFIDENCE_WEIGHTS.conflictingSymptoms;
  }
  if (
    input.inputMethod === "estimated" &&
    (!input.heightCm || !input.weightKg || !input.hipCircumferenceCm)
  ) {
    confidenceScore += CONFIDENCE_WEIGHTS.partialProfileData;
  }

  confidenceScore = clamp(confidenceScore, 0, 100);
  const confidenceLevel = toConfidenceLevel(confidenceScore);
  const widthMatch = calculateWidthMatch(
    input.currentSaddleWidthMm,
    finalRecommendedWidthMm
  );

  return {
    inputMethod: input.inputMethod,
    resolvedSitBoneWidthMm,
    estimatedSitBoneRange,
    targetSupportWidthMm,
    adjustedWidthMm,
    finalRecommendedWidthMm,
    widthRangeMinMm,
    widthRangeMaxMm,
    primaryWidthClass: widthClass.label,
    primaryWidthClassRange: widthClass.range,
    alternateWidthClasses: widthClass.alternates,
    confidenceScore,
    confidenceLevel,
    explanationKey:
      input.inputMethod === "measured" ? "measured_result" : "estimated_result",
    explanationParams:
      input.inputMethod === "measured"
        ? {
            sbw: resolvedSitBoneWidthMm,
            posture: input.postureCategory,
            targetSupportWidth: targetSupportWidthMm,
            rangeMin: widthRangeMinMm,
            rangeMax: widthRangeMaxMm,
            primaryWidthClass: widthClass.label,
          }
        : {
            sbwEstMin: estimatedSitBoneRange?.min ?? resolvedSitBoneWidthMm - 10,
            sbwEstMax: estimatedSitBoneRange?.max ?? resolvedSitBoneWidthMm + 10,
            rangeMin: widthRangeMinMm,
            rangeMax: widthRangeMaxMm,
            primaryWidthClass: widthClass.label,
          },
    ...widthMatch,
  };
}
