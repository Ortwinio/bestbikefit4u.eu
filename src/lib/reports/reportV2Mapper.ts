import type { Doc } from "../../../convex/_generated/dataModel";
import type {
  ReportAdjustmentStep,
  ReportDelta,
  ReportDetailedRow,
  ReportItemStatus,
  ReportParameterKey,
  ReportPriorityRow,
  ReportTirePressureSection,
  ReportV2Payload,
} from "./reportV2Types";

type ReportV2Source = {
  session: Doc<"fitSessions">;
  recommendation: Doc<"recommendations"> | null;
  bike: Doc<"bikes"> | null;
  bikeProfile: Doc<"bikeProfiles"> | null;
  profile: Doc<"profiles"> | null;
  latestPressureCalculation: Doc<"pressureCalculations"> | null;
};

type QuickStartRow = {
  weightLabel: string;
  tireSizeLabel: string;
  psiLabel: string;
};

const PARAMETER_ORDER: ReportParameterKey[] = [
  "saddleHeight",
  "saddleSetback",
  "handlebarDrop",
  "handlebarReach",
  "stem",
  "crankLength",
  "handlebarWidth",
];

const QUICK_START_TABLE: QuickStartRow[] = [
  { weightLabel: "60-70 kg", tireSizeLabel: "28 mm", psiLabel: "65-72 psi" },
  { weightLabel: "70-80 kg", tireSizeLabel: "28 mm", psiLabel: "72-79 psi" },
  { weightLabel: "80-90 kg", tireSizeLabel: "30 mm", psiLabel: "62-70 psi" },
];

function normalizeParameterKey(value: string): ReportParameterKey | null {
  switch (value) {
    case "saddleHeightMm":
      return "saddleHeight";
    case "saddleSetbackMm":
      return "saddleSetback";
    case "barDropMm":
      return "handlebarDrop";
    case "saddleToBarReachMm":
      return "handlebarReach";
    case "crankLengthMm":
      return "crankLength";
    case "handlebarWidthMm":
      return "handlebarWidth";
    default:
      return null;
  }
}

function formatNumber(value: number, digits = 0): string {
  const rounded = digits > 0 ? value.toFixed(digits) : String(Math.round(value));
  return rounded;
}

function formatMm(value: number): string {
  return `${formatNumber(value, value % 1 === 0 ? 0 : 1)} mm`;
}

function formatPsi(value: number): string {
  return `${formatNumber(value)} psi`;
}

function formatBar(value: number): string {
  return `${formatNumber(value, 1)} bar`;
}

function humanizeEnum(value: string | undefined): string {
  if (!value) return "n/a";
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function getTargetLabelForKey(
  key: ReportParameterKey,
  source: ReportV2Source
): string {
  const fit = source.recommendation?.calculatedFit;
  if (!fit) return "n/a";

  switch (key) {
    case "saddleHeight":
      return formatMm(fit.saddleHeightMm);
    case "saddleSetback":
      return formatMm(fit.saddleSetbackMm);
    case "handlebarDrop":
      return formatMm(fit.handlebarDropMm);
    case "handlebarReach":
      return formatMm(fit.handlebarReachMm);
    case "stem":
      return `${formatMm(fit.stemLengthMm)} @ ${fit.stemAngleRecommendation}`;
    case "crankLength":
      return formatMm(fit.crankLengthMm);
    case "handlebarWidth":
      return formatMm(fit.handlebarWidthMm);
  }
}

function getCurrentLabelForKey(
  key: ReportParameterKey,
  source: ReportV2Source
): string | null {
  const setup = source.bike?.currentSetup;
  if (!setup) return null;

  switch (key) {
    case "saddleHeight":
      return typeof setup.saddleHeightMm === "number"
        ? formatMm(setup.saddleHeightMm)
        : null;
    case "saddleSetback":
      return typeof setup.saddleSetbackMm === "number"
        ? formatMm(setup.saddleSetbackMm)
        : null;
    case "stem":
      return typeof setup.stemLengthMm === "number"
        ? `${formatMm(setup.stemLengthMm)}${
            typeof setup.stemAngle === "number" ? ` @ ${setup.stemAngle}°` : ""
          }`
        : null;
    case "crankLength":
      return typeof setup.crankLengthMm === "number"
        ? formatMm(setup.crankLengthMm)
        : null;
    case "handlebarWidth":
      return typeof setup.handlebarWidthMm === "number"
        ? formatMm(setup.handlebarWidthMm)
        : null;
    default:
      return null;
  }
}

function getDeltaForKey(
  key: ReportParameterKey,
  source: ReportV2Source
): ReportDelta | null {
  const fit = source.recommendation?.calculatedFit;
  const setup = source.bike?.currentSetup;
  if (!fit || !setup) return null;

  let currentValue: number | undefined;
  let targetValue: number | undefined;

  switch (key) {
    case "saddleHeight":
      currentValue = setup.saddleHeightMm;
      targetValue = fit.saddleHeightMm;
      break;
    case "saddleSetback":
      currentValue = setup.saddleSetbackMm;
      targetValue = fit.saddleSetbackMm;
      break;
    case "stem":
      currentValue = setup.stemLengthMm;
      targetValue = fit.stemLengthMm;
      break;
    case "crankLength":
      currentValue = setup.crankLengthMm;
      targetValue = fit.crankLengthMm;
      break;
    case "handlebarWidth":
      currentValue = setup.handlebarWidthMm;
      targetValue = fit.handlebarWidthMm;
      break;
    default:
      return null;
  }

  if (typeof currentValue !== "number" || typeof targetValue !== "number") {
    return null;
  }

  const amount = Math.round(Math.abs(targetValue - currentValue));
  if (amount === 0) {
    return { direction: "neutral", amountMm: 0 };
  }
  return {
    direction: targetValue > currentValue ? "increase" : "decrease",
    amountMm: amount,
  };
}

function getMissingData(source: ReportV2Source): string[] {
  const missing = new Set<string>();

  if (!source.profile?.weightKg) missing.add("riderWeight");
  if (!source.bike?.bikeWeightKg) missing.add("bikeWeight");

  const inputSnapshot = source.latestPressureCalculation?.inputSnapshot;
  if (!inputSnapshot?.surface) missing.add("surface");
  if (!inputSnapshot?.bodyWeightKg) missing.add("pressureWeight");

  if (!source.latestPressureCalculation) {
    missing.add("tireWidth");
    missing.add("tireType");
  }

  return [...missing];
}

function getTirePressureSection(source: ReportV2Source): ReportTirePressureSection {
  const calculation = source.latestPressureCalculation;
  if (!calculation) {
    return {
      status: "pending_required_inputs",
      required: getMissingData(source),
      quickStartTable: QUICK_START_TABLE,
    };
  }

  return {
    status: "ready",
    frontPsi: calculation.recommendedFrontPsi,
    rearPsi: calculation.recommendedRearPsi,
    frontBar: calculation.recommendedFrontBar,
    rearBar: calculation.recommendedRearBar,
    confidence:
      typeof calculation.comfortScore === "number" &&
      typeof calculation.gripScore === "number" &&
      typeof calculation.efficiencyScore === "number"
        ? Math.round(
            ((calculation.comfortScore +
              calculation.gripScore +
              calculation.efficiencyScore) /
              3) *
              100
          )
        : null,
    surface: calculation.inputSnapshot.surface,
    inputs: [
      {
        label: "riderWeight",
        value: `${formatNumber(calculation.inputSnapshot.bodyWeightKg, 1)} kg`,
      },
      {
        label: "surface",
        value: humanizeEnum(calculation.inputSnapshot.surface),
      },
      {
        label: "goal",
        value: humanizeEnum(calculation.inputSnapshot.ridingGoal),
      },
    ],
    warnings:
      source.recommendation?.pressureInsights?.warnings ??
      (calculation.warningsJson ? [calculation.warningsJson] : []),
  };
}

function getRecommendationItemStatus(
  feasibility: ReportDetailedRow["feasibility"]
): ReportItemStatus {
  switch (feasibility) {
    case "direct":
      return "ready";
    case "component_change_required":
      return "optional";
    default:
      return "pending_data";
  }
}

function buildDetailedRows(source: ReportV2Source): ReportDetailedRow[] {
  const recommendation = source.recommendation;
  if (!recommendation) return [];

  const baseRows = new Map<ReportParameterKey, ReportDetailedRow>();

  for (const item of recommendation.recommendationItems ?? []) {
    const key = normalizeParameterKey(item.parameter);
    if (!key) continue;

    baseRows.set(key, {
      key,
      targetLabel: getTargetLabelForKey(key, source),
      rangeLabel:
        typeof item.rangeLow === "number" && typeof item.rangeHigh === "number"
          ? `${formatMm(item.rangeLow)} - ${formatMm(item.rangeHigh)}`
          : null,
      confidence: Math.round((item.confidence ?? recommendation.confidenceScore / 100) * 100),
      status: getRecommendationItemStatus(
        item.feasibility ?? "not_yet_evaluated"
      ),
      feasibility: item.feasibility ?? "not_yet_evaluated",
      delta: getDeltaForKey(key, source),
      currentLabel: getCurrentLabelForKey(key, source),
    });
  }

  const syntheticRows: ReportDetailedRow[] = PARAMETER_ORDER.map((key) => ({
    key,
    targetLabel: getTargetLabelForKey(key, source),
    rangeLabel:
      key === "saddleHeight"
        ? `${formatMm(recommendation.calculatedFit.saddleHeightRange.min)} - ${formatMm(
            recommendation.calculatedFit.saddleHeightRange.max
          )}`
        : null,
    confidence: recommendation.confidenceScore,
    status: key === "stem" || key === "crankLength" || key === "handlebarWidth"
      ? "optional"
      : "ready",
    feasibility:
      key === "stem" || key === "crankLength" || key === "handlebarWidth"
        ? "component_change_required"
        : "direct",
    delta: getDeltaForKey(key, source),
    currentLabel: getCurrentLabelForKey(key, source),
  }));

  return syntheticRows.map((row) => baseRows.get(row.key) ?? row);
}

function buildPrioritySummary(rows: ReportDetailedRow[]): ReportPriorityRow[] {
  return rows.map((row) => ({
    key: row.key,
    targetLabel: row.targetLabel,
    status: row.status,
    confidence: row.confidence,
  }));
}

function buildAdjustmentSequence(rows: ReportDetailedRow[]): ReportAdjustmentStep[] {
  return rows.map((row, index) => ({
    key: row.key,
    targetLabel: row.targetLabel,
    order: index + 1,
  }));
}

export function mapReportV2Payload(source: ReportV2Source): ReportV2Payload {
  const recommendation = source.recommendation;

  const detailedFit = recommendation ? buildDetailedRows(source) : [];
  const recommendedFrame = recommendation?.frameSizeRecommendations[0] ?? null;
  const missingData = getMissingData(source);

  return {
    profile: {
      sessionId: source.session._id,
      bikeType: humanizeEnum(source.session.bikeType ?? source.bike?.bikeType),
      ridingStyle: humanizeEnum(source.session.ridingStyle),
      goal: humanizeEnum(source.session.primaryGoal),
      algorithmVersion: recommendation?.algorithmVersion ?? "n/a",
      engineVersion: source.session.engineVersion ?? recommendation?.engineVersion ?? "v1",
      globalConfidence: recommendation?.confidenceScore ?? 0,
      dataQualityStatus: missingData.length > 0 ? "partial" : "complete",
      missingData,
    },
    prioritySummary: buildPrioritySummary(detailedFit),
    detailedFit,
    adjustmentSequence: buildAdjustmentSequence(detailedFit),
    tirePressure: getTirePressureSection(source),
    frameTargets: {
      stackMm: recommendation?.calculatedFit.recommendedStackMm ?? 0,
      reachMm: recommendation?.calculatedFit.recommendedReachMm ?? 0,
      effectiveTopTubeMm: recommendation?.calculatedFit.effectiveTopTubeMm ?? 0,
      recommendedFrameLabel: recommendedFrame
        ? `${recommendedFrame.brand ? `${recommendedFrame.brand} ` : ""}${recommendedFrame.size}`
        : null,
    },
    fitNotes: recommendation?.fitNotes ?? [],
  };
}
