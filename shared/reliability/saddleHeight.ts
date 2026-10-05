/** Shared uncertainty model. Inputs use centimetres; all result lengths use millimetres. */
export const SADDLE_HEIGHT_BIKE_FACTORS = {
  road: 0.883,
  gravel: 0.880,
  mtb: 0.875,
  city: 0.870,
} as const;
export const SADDLE_HEIGHT_SCALE_HALF_WIDTH_MM = 60;

export interface SaddleHeightProvenance {
  kind: "derived" | "estimated" | "declared" | "measured";
  method?: string;
  repeatCount?: number;
  withinTolerance?: boolean;
  unresolvedWarning?: boolean;
}

export interface SaddleHeightInput {
  heightCm?: number;
  inseamCm?: number;
  provenance?: SaddleHeightProvenance;
  bikeFactor?: number;
  adjustmentsMm?: {
    flexibility?: number;
    core?: number;
    goal?: number;
    climbing?: number;
  };
}

export interface SaddleHeightResult {
  adviceMm: number;
  halfWidthMm: number;
  lowerMm: number;
  upperMm: number;
  inseamMm: number;
  sigmaInseamMm: number;
  sigmaModelMm: number;
  scaleMinMm: number;
  scaleMaxMm: number;
}

export interface InseamPlausibility {
  status: "ok" | "check" | "large" | "error";
  expectedInseamCm: number;
  deviationRatio: number;
  direction: "shorter" | "longer" | "equal";
}

const validHeight = (height: number) => Number.isFinite(height) && height > 0;
const validInseam = (inseam: number) => Number.isFinite(inseam) && inseam >= 55 && inseam <= 105;

export function checkInseamPlausibility(heightCm: number, inseamCm: number): InseamPlausibility {
  const expectedInseamCm = validHeight(heightCm) ? 0.47 * heightCm : 0;
  const deviationRatio = expectedInseamCm > 0 && Number.isFinite(inseamCm)
    ? (inseamCm - expectedInseamCm) / expectedInseamCm
    : 0;
  const direction = deviationRatio < 0 ? "shorter" : deviationRatio > 0 ? "longer" : "equal";
  const magnitude = Math.abs(deviationRatio);
  // Multiplication/division can place an exact decimal boundary a few ulps above its threshold.
  const epsilon = 8 * Number.EPSILON;
  const status = !validHeight(heightCm) || !validInseam(inseamCm) || inseamCm >= heightCm
    ? "error"
    : magnitude <= 0.05 + epsilon ? "ok" : magnitude <= 0.12 + epsilon ? "check" : "large";
  return { status, expectedInseamCm, deviationRatio, direction };
}

function halfWidth(sigmaInseamMm: number, sigmaModelMm: number): number {
  return 1.96 * Math.hypot(SADDLE_HEIGHT_BIKE_FACTORS.road * sigmaInseamMm, sigmaModelMm);
}

function inseamUncertainty(inseamMm: number, provenance: SaddleHeightProvenance): number {
  if (provenance.unresolvedWarning || provenance.kind !== "measured") return 0.03 * inseamMm;
  if (provenance.method === "fitter" || provenance.method === "video") return 5;
  if (provenance.withinTolerance && (provenance.repeatCount ?? 1) >= 2) {
    return 10 / Math.sqrt(Math.min(provenance.repeatCount!, 3));
  }
  return 10;
}

export function calculateSaddleHeight(input: SaddleHeightInput): SaddleHeightResult {
  const { heightCm, adjustmentsMm = {}, provenance } = input;
  if (heightCm !== undefined && !validHeight(heightCm)) throw new RangeError("Invalid height");
  const inseamCm = input.inseamCm ?? (heightCm === undefined ? NaN : 0.47 * heightCm);
  if (!validInseam(inseamCm) || (heightCm !== undefined && inseamCm >= heightCm)) {
    throw new RangeError("Invalid inseam");
  }
  const bikeFactor = input.bikeFactor ?? SADDLE_HEIGHT_BIKE_FACTORS.road;
  if (!Number.isFinite(bikeFactor) || bikeFactor <= 0) throw new RangeError("Invalid bike factor");
  if (provenance?.repeatCount !== undefined && (
    !Number.isInteger(provenance.repeatCount) || provenance.repeatCount < 1
  )) throw new RangeError("Invalid measurement count");
  const adjustments = [adjustmentsMm.flexibility, adjustmentsMm.core, adjustmentsMm.goal, adjustmentsMm.climbing];
  if (adjustments.some((value) => value !== undefined && !Number.isFinite(value))) {
    throw new RangeError("Invalid adjustment");
  }
  const inseamMm = inseamCm * 10;
  const adjustment = adjustments.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const rawAdvice = inseamMm * bikeFactor + adjustment;
  if (!Number.isFinite(rawAdvice)) throw new RangeError("Invalid combined adjustment");
  const advice = Math.min(0.91 * inseamMm, Math.max(0.86 * inseamMm, rawAdvice));
  // A height-derived value cannot become a measurement merely through provenance metadata.
  const effectiveProvenance = input.inseamCm === undefined
    ? { ...provenance, kind: "derived" as const }
    : provenance ?? { kind: "measured" as const };
  const sigmaInseamMm = inseamUncertainty(inseamMm, effectiveProvenance);
  const sigmaModelMm = 0.01 * advice;
  const width = halfWidth(sigmaInseamMm, sigmaModelMm);
  const adviceMm = Math.round(advice);
  const halfWidthMm = Math.round(width);
  return {
    adviceMm,
    halfWidthMm,
    // Bounds use the displayed whole-mm advice and uncertainty, matching the public worked example.
    lowerMm: Math.round((adviceMm - halfWidthMm) / 5) * 5,
    upperMm: Math.round((adviceMm + halfWidthMm) / 5) * 5,
    inseamMm,
    sigmaInseamMm,
    sigmaModelMm,
    scaleMinMm: adviceMm - SADDLE_HEIGHT_SCALE_HALF_WIDTH_MM,
    scaleMaxMm: adviceMm + SADDLE_HEIGHT_SCALE_HALF_WIDTH_MM,
  };
}

export interface PublicSaddleHeightNextStep {
  kind: "remeasure" | "add-inseam" | "save-and-repeat";
  halfWidthMm: number | null;
}

export function getPublicSaddleHeightNextStep(input: {
  hasInseam: boolean;
  unresolvedLargeWarning: boolean;
  result: SaddleHeightResult | null;
}): PublicSaddleHeightNextStep {
  if (input.unresolvedLargeWarning) return { kind: "remeasure", halfWidthMm: null };
  const kind = input.hasInseam ? "save-and-repeat" : "add-inseam";
  return {
    kind,
    halfWidthMm: input.result
      ? Math.round(halfWidth(input.hasInseam ? 10 / Math.sqrt(3) : 10, input.result.sigmaModelMm))
      : null,
  };
}

export interface PublicSaddleHeightState {
  status: "none" | InseamPlausibility["status"];
  plausibility: InseamPlausibility | null;
  result: SaddleHeightResult | null;
  basis: "estimated" | "measured" | "height-until-remeasured";
  unresolvedWarning: boolean;
  dashed: boolean;
  canRefine: boolean;
  nextStep: PublicSaddleHeightNextStep;
}

export function calculatePublicSaddleHeight(input: {
  heightCm?: number;
  inseamCm?: number;
  confirmed?: boolean;
  override?: boolean;
}): PublicSaddleHeightState {
  const hasInseam = input.inseamCm !== undefined;
  const plausibility = hasInseam && input.heightCm !== undefined
    ? checkInseamPlausibility(input.heightCm, input.inseamCm!)
    : null;
  let status: PublicSaddleHeightState["status"] = input.heightCm === undefined
    ? "none" : plausibility?.status ?? "none";
  const large = status === "large";
  const unresolvedWarning = large || (status === "check" && !input.confirmed);
  const useInseam = hasInseam && (!large || input.override);
  const basis = large && !input.override ? "height-until-remeasured" : useInseam ? "measured" : "estimated";
  let result: SaddleHeightResult | null = null;
  if (input.heightCm !== undefined && status !== "error") {
    try {
      result = calculateSaddleHeight({
        heightCm: input.heightCm,
        inseamCm: useInseam ? input.inseamCm : undefined,
        provenance: { kind: useInseam ? "measured" : "derived", unresolvedWarning },
      });
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      status = "error";
    }
  }
  return {
    status,
    plausibility,
    result,
    basis,
    unresolvedWarning,
    dashed: unresolvedWarning,
    canRefine: result !== null && hasInseam && (status === "ok" || (status === "check" && !!input.confirmed)),
    nextStep: getPublicSaddleHeightNextStep({ hasInseam, unresolvedLargeWarning: large, result }),
  };
}
