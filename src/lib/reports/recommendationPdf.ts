import { BRAND } from "@/config/brand";

type FitSessionForPdf = {
  _id: string;
  createdAt: number;
  completedAt?: number;
  bikeType?: string;
  ridingStyle: string;
  primaryGoal: string;
};

type RecommendationForPdf = {
  algorithmVersion: string;
  confidenceScore: number;
  calculatedFit: {
    recommendedStackMm: number;
    recommendedReachMm: number;
    effectiveTopTubeMm: number;
    saddleHeightMm: number;
    saddleSetbackMm: number;
    saddleHeightRange: { min: number; max: number };
    handlebarDropMm: number;
    handlebarReachMm: number;
    stemLengthMm: number;
    stemAngleRecommendation: string;
    crankLengthMm: number;
    handlebarWidthMm: number;
  };
  frameSizeRecommendations: Array<{
    brand?: string;
    size: string;
    fitScore: number;
    notes?: string;
  }>;
  adjustmentPriorities: Array<{
    priority: number;
    component: string;
    currentValue?: string;
    recommendedValue: string;
    rationale: string;
  }>;
  fitNotes: string[];
};

function formatDate(value: number | undefined): string {
  if (!value) {
    return "n/a";
  }
  return new Date(value).toISOString().slice(0, 10);
}

function humanizeValue(value: string | undefined): string {
  if (!value) {
    return "n/a";
  }
  return value.replaceAll("_", " ");
}

export function buildRecommendationPdfLines(params: {
  session: FitSessionForPdf;
  recommendation: RecommendationForPdf;
}): string[] {
  const { session, recommendation } = params;
  const fit = recommendation.calculatedFit;
  const frameRecommendations = recommendation.frameSizeRecommendations
    .slice(0, 3)
    .map((frame, index) => {
      const brandPart = frame.brand ? `${frame.brand} ` : "";
      const notesPart = frame.notes ? ` | ${frame.notes}` : "";
      return `${index + 1}. ${brandPart}${frame.size} (${frame.fitScore}%)${notesPart}`;
    });

  const adjustmentLines = [...recommendation.adjustmentPriorities]
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 8)
    .map(
      (item, index) =>
        `${index + 1}. ${item.component}: ${item.recommendedValue} (${item.rationale})`
    );

  const noteLines = recommendation.fitNotes
    .slice(0, 5)
    .map((note, index) => `- ${index + 1}. ${note}`);

  return [
    BRAND.reportTitle,
    "======================================",
    "",
    `Session ID: ${session._id}`,
    `Created: ${formatDate(session.createdAt)}`,
    `Completed: ${formatDate(session.completedAt)}`,
    `Bike Type: ${humanizeValue(session.bikeType)}`,
    `Riding Style: ${humanizeValue(session.ridingStyle)}`,
    `Primary Goal: ${humanizeValue(session.primaryGoal)}`,
    `Algorithm Version: ${recommendation.algorithmVersion}`,
    `Confidence Score: ${recommendation.confidenceScore}%`,
    "",
    "Core Fit Metrics",
    "----------------",
    `Saddle Height: ${fit.saddleHeightMm} mm (range ${fit.saddleHeightRange.min}-${fit.saddleHeightRange.max} mm)`,
    `Saddle Setback: ${fit.saddleSetbackMm} mm`,
    `Handlebar Drop: ${fit.handlebarDropMm} mm`,
    `Handlebar Reach: ${fit.handlebarReachMm} mm`,
    `Stem: ${fit.stemLengthMm} mm | ${fit.stemAngleRecommendation}`,
    `Crank Length: ${fit.crankLengthMm} mm`,
    `Handlebar Width: ${fit.handlebarWidthMm} mm`,
    `Frame Stack Target: ${fit.recommendedStackMm} mm`,
    `Frame Reach Target: ${fit.recommendedReachMm} mm`,
    `Effective Top Tube: ${fit.effectiveTopTubeMm} mm`,
    "",
    "Adjustment Order",
    "----------------",
    ...(adjustmentLines.length > 0 ? adjustmentLines : ["No adjustment priorities generated."]),
    "",
    "Frame Recommendation Summary",
    "----------------------------",
    ...(frameRecommendations.length > 0
      ? frameRecommendations
      : ["No frame-size recommendations available."]),
    "",
    "Fit Notes",
    "---------",
    ...(noteLines.length > 0 ? noteLines : ["No additional fit notes."]),
    "",
    "Safety Disclaimer",
    "-----------------",
    "This report is a guidance tool and not medical advice.",
    "Apply adjustments in small steps (2-5 mm), one at a time.",
    "Stop riding and consult a qualified fitter or clinician if pain persists.",
  ];
}
