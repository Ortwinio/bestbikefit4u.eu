import { BRAND } from "@/config/brand";

const NOT_AVAILABLE = "n/a";

export type FitSessionForPdf = {
  _id: string;
  createdAt: number;
  completedAt?: number;
  bikeType?: string;
  ridingStyle: string;
  primaryGoal: string;
};

type NumericRange = {
  min: number;
  max: number;
};

export type RecommendationForPdf = {
  algorithmVersion: string;
  confidenceScore: number;
  calculatedFit: {
    recommendedStackMm: number;
    recommendedReachMm: number;
    effectiveTopTubeMm: number;
    saddleHeightMm: number;
    saddleSetbackMm: number;
    saddleHeightRange?: NumericRange;
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

export type PdfSummaryCard = {
  key: string;
  label: string;
  value: string;
  subtitle: string;
};

export type PdfCoreTargetRow = {
  parameter: string;
  target: string;
  range: string;
  why: string;
};

export type PdfImplementationRow = {
  days: string;
  action: string;
  track: string;
};

export type PdfMeasurementDefinitionRow = {
  metric: string;
  method: string;
  tools: string;
};

export type PdfReportViewModel = {
  title: string;
  meta: {
    sessionId: string;
    createdDate: string;
    completedDate: string;
    bikeType: string;
    goal: string;
    ridingStyle: string;
    algorithmVersion: string;
    confidence: string;
  };
  intro: {
    headline: string;
    paragraphs: string[];
    bestPractice: string;
  };
  summaryCards: PdfSummaryCard[];
  priorityChanges: string[];
  coreTargets: PdfCoreTargetRow[];
  implementationPlan: PdfImplementationRow[];
  warningActions: string[];
  measurementDefinitions: PdfMeasurementDefinitionRow[];
  fitNotes: string[];
  frameGuidance: {
    size: string;
    fitScore: string;
    notes: string;
  };
  safetyDisclaimer: string;
};

export function formatDateIso(value: number | undefined): string {
  if (!value || !Number.isFinite(value) || value <= 0) {
    return NOT_AVAILABLE;
  }

  return new Date(value).toISOString().slice(0, 10);
}

export function formatPercent(value: number | undefined): string {
  if (!Number.isFinite(value)) {
    return NOT_AVAILABLE;
  }
  const rounded = Math.round(value as number);
  return `${rounded}%`;
}

export function formatMm(
  value: number | undefined,
  options?: { allowHalfStep?: boolean }
): string {
  if (!Number.isFinite(value)) {
    return NOT_AVAILABLE;
  }

  const raw = value as number;
  const rounded = options?.allowHalfStep
    ? Math.round(raw * 2) / 2
    : Math.round(raw);

  const valueText = Number.isInteger(rounded)
    ? rounded.toFixed(0)
    : rounded.toFixed(1);

  return `${valueText} mm`;
}

export function formatStemAngle(value: string | undefined): string {
  if (!value) {
    return NOT_AVAILABLE;
  }

  const compact = value
    .trim()
    .replace(/degrees?/gi, "")
    .replace(/deg/gi, "")
    .replace(/\s+/g, "")
    .replace(/°/g, "");

  if (!compact || !/^[+-]?\d+(\.\d+)?$/.test(compact)) {
    return NOT_AVAILABLE;
  }

  const numeric = Number(compact);
  if (!Number.isFinite(numeric)) {
    return NOT_AVAILABLE;
  }

  const text = Number.isInteger(numeric)
    ? numeric.toFixed(0)
    : numeric.toFixed(1);

  return `${text}°`;
}

function formatRange(value: NumericRange | undefined): string {
  if (!value) {
    return NOT_AVAILABLE;
  }
  if (
    !Number.isFinite(value.min) ||
    !Number.isFinite(value.max) ||
    value.min > value.max
  ) {
    return NOT_AVAILABLE;
  }

  return `${Math.round(value.min)}-${Math.round(value.max)} mm`;
}

function humanizeToken(value: string | undefined): string {
  if (!value) {
    return NOT_AVAILABLE;
  }

  return value.replaceAll("_", " ");
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function mapPdfReportData(params: {
  session: FitSessionForPdf;
  recommendation: RecommendationForPdf;
}): PdfReportViewModel {
  const { session, recommendation } = params;
  const fit = recommendation.calculatedFit;
  const saddleRange = formatRange(fit.saddleHeightRange);

  const summaryCards: PdfSummaryCard[] = [
    {
      key: "confidence",
      label: "Fit confidence",
      value: formatPercent(recommendation.confidenceScore),
      subtitle: "Based on completeness and plausibility",
    },
    {
      key: "saddleHeight",
      label: "Saddle height",
      value: formatMm(fit.saddleHeightMm),
      subtitle: `Range ${saddleRange}`,
    },
    {
      key: "barDrop",
      label: "Handlebar drop",
      value: formatMm(fit.handlebarDropMm),
      subtitle: "Target from canonical fit output",
    },
  ];

  const sortedPriorities = [...recommendation.adjustmentPriorities].sort(
    (a, b) => a.priority - b.priority
  );
  const priorityChanges = sortedPriorities
    .slice(0, 3)
    .map((item) => `${item.component}: ${item.recommendedValue}`);

  const frame = recommendation.frameSizeRecommendations[0];
  const frameSize = frame?.brand ? `${frame.brand} ${frame.size}` : frame?.size;

  const coreTargets: PdfCoreTargetRow[] = [
    {
      parameter: "Saddle height",
      target: formatMm(fit.saddleHeightMm),
      range: saddleRange,
      why: "Knee stress and extension timing",
    },
    {
      parameter: "Saddle setback",
      target: formatMm(fit.saddleSetbackMm),
      range: NOT_AVAILABLE,
      why: "Hip stability and knee tracking",
    },
    {
      parameter: "Handlebar drop",
      target: formatMm(fit.handlebarDropMm),
      range: NOT_AVAILABLE,
      why: "Aero posture versus neck/lumbar load",
    },
    {
      parameter: "Handlebar reach",
      target: formatMm(fit.handlebarReachMm),
      range: NOT_AVAILABLE,
      why: "Shoulder posture and hand pressure",
    },
    {
      parameter: "Stem",
      target: `${formatMm(fit.stemLengthMm)} @ ${formatStemAngle(
        fit.stemAngleRecommendation
      )}`,
      range: "90-110 mm / -6° to +6° (reference)",
      why: "Fine-tune after saddle position is stable",
    },
    {
      parameter: "Crank length",
      target: formatMm(fit.crankLengthMm, { allowHalfStep: true }),
      range: "170-172.5 mm (reference)",
      why: "Hip closure and knee load",
    },
    {
      parameter: "Handlebar width",
      target: formatMm(fit.handlebarWidthMm),
      range: "400-440 mm (reference)",
      why: "Breathing and shoulder comfort",
    },
    {
      parameter: "Frame guidance",
      target: frameSize ?? NOT_AVAILABLE,
      range: "-",
      why: "Compare brands by stack and reach compatibility",
    },
  ];

  return {
    title: BRAND.reportTitle,
    meta: {
      sessionId: session._id || NOT_AVAILABLE,
      createdDate: formatDateIso(session.createdAt),
      completedDate: formatDateIso(session.completedAt),
      bikeType: titleCase(humanizeToken(session.bikeType)),
      goal: titleCase(humanizeToken(session.primaryGoal)),
      ridingStyle: titleCase(humanizeToken(session.ridingStyle)),
      algorithmVersion: recommendation.algorithmVersion || NOT_AVAILABLE,
      confidence: formatPercent(recommendation.confidenceScore),
    },
    intro: {
      headline: "Fit Recommendation Report",
      paragraphs: [
        "A good bike fit is a practical win: more comfort, fewer recurring pain patterns, and better control on longer rides.",
        "This report gives clear, measurable setup targets. Apply changes step-by-step and validate each change before moving on.",
      ],
      bestPractice:
        "Best practice: apply one change at a time (2-5 mm), validate on easy rides, then continue.",
    },
    summaryCards,
    priorityChanges:
      priorityChanges.length > 0
        ? priorityChanges
        : ["No priority adjustments generated yet."],
    coreTargets,
    implementationPlan: [
      {
        days: "1-3",
        action: "Cleats and baseline setup check",
        track: "Pain score (0-10), hotspots, knee tracking",
      },
      {
        days: "4-7",
        action: "Saddle height validation",
        track: "Knee feel, saddle pressure, pedal smoothness",
      },
      {
        days: "8-14",
        action: "Setback and cockpit fine tuning",
        track: "Hip stability, hand pressure, long ride comfort",
      },
    ],
    warningActions: [
      "Front knee pain: raise saddle 3-5 mm.",
      "Back-of-knee tightness: lower saddle 3-5 mm.",
      "Hand numbness or neck strain: raise bars 10 mm or shorten reach around 10 mm.",
    ],
    measurementDefinitions: [
      {
        metric: "Saddle height",
        method: "BB center -> top of saddle along seat tube axis",
        tools: "Tape, level",
      },
      {
        metric: "Saddle setback",
        method: "BB vertical line -> saddle nose (horizontal)",
        tools: "Plumb line",
      },
      {
        metric: "Bar drop",
        method: "Saddle top minus bar reference point (tops or hoods)",
        tools: "Tape",
      },
      {
        metric: "Bar reach",
        method: "BB -> bar center (horizontal)",
        tools: "Tape",
      },
    ],
    fitNotes: recommendation.fitNotes.slice(0, 4),
    frameGuidance: {
      size: frameSize ?? NOT_AVAILABLE,
      fitScore: frame ? formatPercent(frame.fitScore) : NOT_AVAILABLE,
      notes: frame?.notes ?? "",
    },
    safetyDisclaimer:
      "Safety: this report is guidance, not medical advice. Apply changes in 2-5 mm steps. Stop and consult a qualified fitter or clinician if pain persists.",
  };
}
