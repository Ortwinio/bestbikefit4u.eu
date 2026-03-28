import type { Doc } from "../../../convex/_generated/dataModel";
import {
  deriveComfortScore,
  flexibilityTests,
} from "@/lib/validations/profile";
import type {
  ReportAdjustmentStep,
  ReportBikeSection,
  ReportDelta,
  ReportDetailedRow,
  ReportItemStatus,
  ReportParameterKey,
  ReportPriorityRow,
  ReportQuestionnaireContext,
  ReportRiderSection,
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
  user?: Doc<"users"> | null;
  questionnaireResponses?: Doc<"questionnaireResponses">[] | null;
  bikeImageUrl?: string | null;
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

const FLEXIBILITY_NUMERIC_SCORES = {
  very_limited: 1,
  limited: 2,
  average: 3,
  good: 4,
  excellent: 5,
} as const;

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

function humanizeEnum(value: string | undefined): string {
  if (!value) return "n/a";
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function toRenderString(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getDisplayName(user: Doc<"users"> | null | undefined): string | null {
  const emailName = user?.email?.split("@")[0]?.trim();
  return (
    toRenderString(user?.displayName) ??
    toRenderString(user?.name) ??
    toRenderString(user?.googleName) ??
    toRenderString(emailName) ??
    null
  );
}

function buildQuestionnaireResponseMap(
  responses: Doc<"questionnaireResponses">[] | null | undefined
): Map<string, Doc<"questionnaireResponses">["response"]> {
  return new Map(
    (responses ?? []).map((response) => [response.questionId, response.response])
  );
}

function normalizeSingleChoiceValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  return value;
}

function getReportDateIso(source: ReportV2Source): string {
  const timestamp =
    source.session.completedAt ?? source.session.createdAt ?? Date.now();
  return new Date(timestamp).toISOString();
}

function getQuestionnaireContext(source: ReportV2Source): ReportQuestionnaireContext {
  const responseMap = buildQuestionnaireResponseMap(source.questionnaireResponses);
  const profile = source.profile;

  return {
    experienceLevel: normalizeSingleChoiceValue(
      responseMap.get("experience_level") ?? profile?.experienceLevel
    ),
    weeklyHours: normalizeSingleChoiceValue(
      responseMap.get("weekly_hours") ?? profile?.weeklyHours
    ),
    rideLength: normalizeSingleChoiceValue(
      responseMap.get("typical_ride_length") ?? profile?.typicalRideLength
    ),
    positionPriority: normalizeSingleChoiceValue(
      responseMap.get("position_priority") ?? profile?.positionPriority
    ),
    typeOfRiding:
      normalizeSingleChoiceValue(responseMap.get("road_riding_type")) ??
      normalizeSingleChoiceValue(responseMap.get("mtb_terrain")),
  };
}

function mapRiderSection(source: ReportV2Source): ReportRiderSection {
  const profile = source.profile;
  const weightKg = profile?.weightKg ?? null;
  const heightCm = profile?.heightCm ?? null;
  const bmi =
    typeof weightKg === "number" && typeof heightCm === "number" && heightCm > 0
      ? Math.round((weightKg / ((heightCm / 100) * (heightCm / 100))) * 10) / 10
      : null;
  const flexibilityScore = profile?.flexibilityScore
    ? FLEXIBILITY_NUMERIC_SCORES[profile.flexibilityScore]
    : null;
  const flexibilityLabel =
    flexibilityTests.find((test) => test.score === profile?.flexibilityScore)?.label ??
    null;

  return {
    name: getDisplayName(source.user),
    heightCm,
    weightKg,
    inseamCm: profile?.inseamCm ?? null,
    armLengthCm: profile?.armLengthCm ?? null,
    torsoLengthCm: profile?.torsoLengthCm ?? null,
    shoulderWidthCm: profile?.shoulderWidthCm ?? null,
    bmi,
    bmiCategory:
      bmi === null
        ? null
        : bmi < 18.5
          ? "underweight"
          : bmi < 25
            ? "normal"
            : bmi < 30
              ? "overweight"
              : "obese",
    flexibilityScore,
    flexibilityLabel,
    coreStabilityScore: profile?.coreStabilityScore ?? null,
    comfortScore:
      !profile ||
      (profile.hasPain === undefined && profile.painSeverity === undefined)
        ? null
        : deriveComfortScore(profile.hasPain, profile.painSeverity),
  };
}

function mapBikeSection(source: ReportV2Source): ReportBikeSection {
  return {
    name: toRenderString(source.bike?.name) ?? "Unnamed bike",
    bikeType: source.bike?.bikeType ?? source.session.bikeType ?? "unknown",
    brand: toRenderString(source.bike?.brand),
    model: toRenderString(source.bike?.model),
    ridingStyle: source.bike?.ridingStyle
      ? source.bike.ridingStyle
      : source.session.ridingStyle
        ? source.session.ridingStyle
        : null,
    goal: source.bike?.primaryGoal
      ? source.bike.primaryGoal
      : source.session.primaryGoal
        ? source.session.primaryGoal
        : null,
    description: toRenderString(source.bike?.description),
    imageUrl: source.bikeImageUrl ?? null,
    questionnaire: getQuestionnaireContext(source),
  };
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
    reportDate: getReportDateIso(source),
    rider: mapRiderSection(source),
    bike: mapBikeSection(source),
    profile: {
      sessionId: source.session._id,
      bikeType: humanizeEnum(source.session.bikeType ?? source.bike?.bikeType),
      bikeImageUrl: source.bikeImageUrl ?? null,
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
