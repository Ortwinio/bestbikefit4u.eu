import type { Ambition, BikeCategory } from "../../convex/lib/fitAlgorithm/types";

export type PublicFitScore = 1 | 2 | 3 | 4 | 5;

export type PublicFitConfidenceLevel = "high" | "medium" | "lower";

export type PublicValidationSeverity = "error" | "warning" | "info";

export type PublicValidationField =
  | "heightCm"
  | "inseamCm"
  | "category"
  | "ridingGoal"
  | "flexibility"
  | "coreStability"
  | "output"
  | "baseline";

export interface PublicFitBaseline {
  heightCm?: number;
  inseamCm?: number;
  category?: BikeCategory;
  ridingGoal?: Ambition;
  flexibility?: PublicFitScore;
  coreStability?: PublicFitScore;
  inseamSource: "measured" | "estimated" | "missing";
}

export interface PublicFitBaselineInput {
  heightCm?: number | null;
  inseamCm?: number | null;
  bikeCategory?: BikeCategory | null;
  category?: BikeCategory | null;
  ridingGoal?: Ambition | null;
  flexibility?: PublicFitScore | number | null;
  flexibilityScore?: PublicFitScore | number | null;
  coreStability?: PublicFitScore | number | null;
  coreStabilityScore?: PublicFitScore | number | null;
  inseamSource?: "measured" | "estimated" | "missing";
}

export interface PublicValidationIssue {
  code:
    | "missing_required_field"
    | "height_out_of_range"
    | "inseam_out_of_range"
    | "inseam_not_shorter_than_height"
    | "inseam_height_ratio_low"
    | "inseam_height_ratio_high"
    | "aggressive_output_with_low_support"
    | "crank_length_category_warning";
  field: PublicValidationField;
  severity: PublicValidationSeverity;
  message: string;
}

export interface PublicFitConfidence {
  score: number;
  level: PublicFitConfidenceLevel;
  reasons: string[];
}

export interface PublicCalculatorRange {
  min: number;
  max: number;
  center: number;
}

export interface PublicResultEnvelope<TValue> {
  calculatorKey?: string;
  value: TValue;
  recommended?: TValue;
  range?: PublicCalculatorRange;
  confidence: PublicFitConfidence;
  validationIssues: PublicValidationIssue[];
  primaryDrivers?: string[];
  secondaryModifiers?: string[];
  notCovered?: string[];
  nextAction?: string;
}

export interface PublicFitRequirements {
  requiredFields: PublicValidationField[];
  allowsEstimatedInseam?: boolean;
}

export const PUBLIC_FIT_REQUIREMENTS: Record<
  "bikeFit" | "saddleHeight" | "frameSize" | "crankLength",
  PublicFitRequirements
> = {
  bikeFit: {
    requiredFields: [
      "heightCm",
      "inseamCm",
      "category",
      "ridingGoal",
      "flexibility",
      "coreStability",
    ],
  },
  saddleHeight: {
    requiredFields: ["inseamCm", "category", "ridingGoal", "flexibility", "coreStability"],
  },
  frameSize: {
    requiredFields: ["heightCm", "inseamCm", "category"],
  },
  crankLength: {
    requiredFields: ["inseamCm", "category"],
  },
};

function normalizePositiveNumber(value: number | null | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }
  return value;
}

function normalizeScore(
  value: PublicFitScore | number | null | undefined
): PublicFitScore | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  const rounded = Math.round(value);
  if (rounded < 1 || rounded > 5) {
    return undefined;
  }
  return rounded as PublicFitScore;
}

function hasBaselineField(
  baseline: PublicFitBaseline,
  field: PublicValidationField
): boolean {
  switch (field) {
    case "heightCm":
      return baseline.heightCm !== undefined;
    case "inseamCm":
      return baseline.inseamCm !== undefined;
    case "category":
      return baseline.category !== undefined;
    case "ridingGoal":
      return baseline.ridingGoal !== undefined;
    case "flexibility":
      return baseline.flexibility !== undefined;
    case "coreStability":
      return baseline.coreStability !== undefined;
    default:
      return true;
  }
}

function fieldLabel(field: PublicValidationField): string {
  switch (field) {
    case "heightCm":
      return "height";
    case "inseamCm":
      return "inseam";
    case "category":
      return "bike category";
    case "ridingGoal":
      return "riding goal";
    case "flexibility":
      return "flexibility";
    case "coreStability":
      return "core stability";
    default:
      return field;
  }
}

function isScore(value: PublicFitScore | undefined): value is PublicFitScore {
  return value !== undefined && value >= 1 && value <= 5;
}

export function createPublicFitBaseline(input: PublicFitBaselineInput): PublicFitBaseline {
  const inseamCm = normalizePositiveNumber(input.inseamCm);

  return {
    heightCm: normalizePositiveNumber(input.heightCm),
    inseamCm,
    category: input.category ?? input.bikeCategory ?? undefined,
    ridingGoal: input.ridingGoal ?? undefined,
    flexibility:
      normalizeScore(input.flexibilityScore) ?? normalizeScore(input.flexibility) ?? undefined,
    coreStability:
      normalizeScore(input.coreStabilityScore) ?? normalizeScore(input.coreStability) ?? undefined,
    inseamSource: input.inseamSource ?? (inseamCm !== undefined ? "measured" : "missing"),
  };
}

export function countPublicFitRefinements(baseline: PublicFitBaseline): number {
  let count = 0;
  if (baseline.ridingGoal) count += 1;
  if (baseline.flexibility !== undefined) count += 1;
  if (baseline.coreStability !== undefined) count += 1;
  return count;
}

export function validatePublicFitBaseline(
  baseline: PublicFitBaseline,
  requirements?: PublicFitRequirements,
  isNl = false
): PublicValidationIssue[] {
  const issues: PublicValidationIssue[] = [];

  for (const field of requirements?.requiredFields ?? []) {
    if (!hasBaselineField(baseline, field)) {
      issues.push({
        code: "missing_required_field",
        field,
        severity: "error",
        message: isNl
          ? `Vul ${fieldLabel(field)} in om door te gaan.`
          : `Enter ${fieldLabel(field)} to continue.`,
      });
    }
  }

  if (baseline.heightCm !== undefined && (baseline.heightCm < 130 || baseline.heightCm > 220)) {
    issues.push({
      code: "height_out_of_range",
      field: "heightCm",
      severity: "error",
      message: isNl
        ? "Voer een lengte tussen 130 en 220 cm in."
        : "Enter a height between 130 and 220 cm.",
    });
  }

  if (baseline.inseamCm !== undefined && (baseline.inseamCm < 55 || baseline.inseamCm > 105)) {
    issues.push({
      code: "inseam_out_of_range",
      field: "inseamCm",
      severity: "error",
      message: isNl
        ? "Voer een binnenbeenlengte tussen 55 en 105 cm in."
        : "Enter an inseam between 55 and 105 cm.",
    });
  }

  if (
    baseline.heightCm !== undefined &&
    baseline.inseamCm !== undefined &&
    baseline.inseamCm >= baseline.heightCm
  ) {
    issues.push({
      code: "inseam_not_shorter_than_height",
      field: "baseline",
      severity: "error",
      message: isNl
        ? "Binnenbeenlengte moet lager zijn dan totale lengte."
        : "Inseam must be lower than total height.",
    });
  }

  if (
    baseline.heightCm !== undefined &&
    baseline.inseamCm !== undefined &&
    baseline.inseamCm < baseline.heightCm
  ) {
    const ratio = baseline.inseamCm / baseline.heightCm;

    if (ratio < 0.41) {
      issues.push({
        code: "inseam_height_ratio_low",
        field: "baseline",
        severity: "warning",
        message: isNl
          ? "Deze verhouding tussen lengte en binnenbeenlengte is ongebruikelijk. Controleer je meting nog eens."
          : "This height-to-inseam ratio is unusual. Recheck your measurement.",
      });
    }

    if (ratio > 0.54) {
      issues.push({
        code: "inseam_height_ratio_high",
        field: "baseline",
        severity: "warning",
        message: isNl
          ? "Deze verhouding tussen lengte en binnenbeenlengte is ongebruikelijk hoog. Controleer je meting nog eens."
          : "This height-to-inseam ratio is unusually high. Recheck your measurement.",
      });
    }
  }

  return issues;
}

export function validateFitOutputConsistency(
  input: Pick<PublicFitBaselineInput, "ridingGoal" | "flexibility" | "coreStability"> & {
    barDropMm?: number;
  },
  isNl = false
): PublicValidationIssue[] {
  const issues: PublicValidationIssue[] = [];
  const flexibility = normalizeScore(input.flexibility);
  const coreStability = normalizeScore(input.coreStability);

  if (
    input.barDropMm !== undefined &&
    input.barDropMm >= 70 &&
    input.ridingGoal === "aero" &&
    isScore(flexibility) &&
    isScore(coreStability) &&
    flexibility <= 2 &&
    coreStability <= 2
  ) {
    issues.push({
      code: "aggressive_output_with_low_support",
      field: "output",
      severity: "warning",
      message: isNl
        ? "Deze agressieve drop vraagt meer flexibiliteit en core-stabiliteit dan je nu hebt ingevuld."
        : "This aggressive drop asks for more flexibility and core stability than the current inputs suggest.",
    });
  }

  return issues;
}

export function validateCrankLengthRecommendation(
  category: BikeCategory,
  crankLengthMm: number,
  isNl = false
): PublicValidationIssue[] {
  if ((category === "mtb" || category === "city") && crankLengthMm > 175) {
    return [
      {
        code: "crank_length_category_warning",
        field: "output",
        severity: "warning",
        message: isNl
          ? "Deze cranklengte is aan de lange kant voor deze categorie. Controleer of je ook je zadelhoogte opnieuw beoordeelt."
          : "This crank length is on the long side for this category. Recheck saddle height if you try it.",
      },
    ];
  }

  return [];
}

export function derivePublicCalculatorConfidence({
  baseline,
  issues = [],
  requirements,
  isNl = false,
}: {
  baseline: PublicFitBaseline;
  issues?: PublicValidationIssue[];
  requirements?: PublicFitRequirements;
  isNl?: boolean;
}): PublicFitConfidence {
  let score = 20;
  const reasons: string[] = [];

  if (baseline.inseamSource === "measured" && baseline.inseamCm !== undefined) {
    score += 30;
    reasons.push(isNl ? "gemeten binnenbeenlengte" : "measured inseam");
  } else if (baseline.inseamSource === "estimated") {
    score += 12;
    reasons.push(isNl ? "geschatte binnenbeenlengte" : "estimated inseam");
  }

  if (baseline.heightCm !== undefined) {
    score += 12;
    reasons.push(isNl ? "lengte bekend" : "height provided");
  }

  if (baseline.category) {
    score += 10;
    reasons.push(isNl ? "fietscategorie gekozen" : "bike category selected");
  }

  score += Math.min(countPublicFitRefinements(baseline), 3) * 8;

  if (requirements) {
    const missingRequired = requirements.requiredFields.filter(
      (field) => !hasBaselineField(baseline, field)
    ).length;
    score -= missingRequired * 10;
  }

  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;

  score -= errors * 18;
  score -= warnings * 8;

  const boundedScore = Math.max(0, Math.min(100, score));
  const level: PublicFitConfidenceLevel =
    boundedScore >= 75 ? "high" : boundedScore >= 50 ? "medium" : "lower";

  return {
    score: boundedScore,
    level,
    reasons,
  };
}

export function getPublicFitConfidence(
  input: PublicFitBaselineInput,
  issues: PublicValidationIssue[] = [],
  isNl = false
): PublicFitConfidence {
  return derivePublicCalculatorConfidence({
    baseline: createPublicFitBaseline(input),
    issues,
    isNl,
  });
}

export function getConfidenceLabel(level: PublicFitConfidenceLevel, isNl = false): string {
  if (level === "high") return isNl ? "Hoge betrouwbaarheid" : "High confidence";
  if (level === "medium") return isNl ? "Gemiddelde betrouwbaarheid" : "Medium confidence";
  return isNl ? "Lagere betrouwbaarheid" : "Lower confidence";
}

export function createPublicCalculatorRange(
  min: number,
  max: number,
  center = Math.round((min + max) / 2)
): PublicCalculatorRange {
  return { min, max, center };
}

export function createPublicCalculatorResultEnvelope<TValue>(input: {
  calculatorKey?: string;
  recommended: TValue;
  range?: PublicCalculatorRange;
  confidence: PublicFitConfidence;
  issues?: PublicValidationIssue[];
  validationIssues?: PublicValidationIssue[];
  primaryDrivers?: string[];
  secondaryModifiers?: string[];
  notCovered?: string[];
  nextAction?: string;
}): PublicResultEnvelope<TValue> {
  return {
    calculatorKey: input.calculatorKey,
    value: input.recommended,
    recommended: input.recommended,
    range: input.range,
    confidence: input.confidence,
    validationIssues: input.validationIssues ?? input.issues ?? [],
    primaryDrivers: input.primaryDrivers ?? [],
    secondaryModifiers: input.secondaryModifiers ?? [],
    notCovered: input.notCovered ?? [],
    nextAction: input.nextAction,
  };
}

export function createPublicResultEnvelope<TValue>(
  value: TValue,
  confidence: PublicFitConfidence,
  validationIssues: PublicValidationIssue[]
): PublicResultEnvelope<TValue> {
  return {
    value,
    confidence,
    validationIssues,
  };
}
