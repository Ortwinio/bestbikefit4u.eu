import { getInseamSigmaMm, type SaddleHeightProvenance } from "./saddleHeight";

export type ReliabilityMetric = "saddleHeight" | "saddleSetback" | "handlebarDrop" | "reach"
  | "frameSize" | "crankLength" | "saddleWidth" | "speed" | "climbTime" | "ftpWkg" | "ftpPower" | "cadence" | "hydration";
export interface ReliabilityEvidence {
  inseamCm?: number;
  inseamProvenance?: SaddleHeightProvenance;
  kneeAngleDegrees?: number;
  femurAndFootMeasured?: boolean;
  kneeOverPedalMeasured?: boolean;
  flexibilityAndCoreAssessed?: boolean;
  flexibilityAndCoreTested?: boolean;
  torsoAndArmMeasured?: boolean;
  bikeGeometryKnown?: boolean;
  posturePhotoMeasured?: boolean;
  bikesCompared?: boolean;
  /** Actual geometry comparison margin; never guessed from a frame size label. */
  frameMarginMm?: number;
  femurAndRidingStyleKnown?: boolean;
  sitBonesMeasured?: boolean;
  ridingPositionKnown?: boolean;
  bikePositionAndWeightKnown?: boolean;
  dragFieldTest?: boolean;
  ftpAndWeightMeasured?: boolean;
  guidedFtpTest?: boolean;
  ftpMethod?: "twenty-minute" | "ramp";
  weightMeasuredRecently?: boolean;
  guidedTest?: boolean;
  sweatTest?: boolean;
}
export interface ReliabilityInput {
  metric: ReliabilityMetric;
  value: number;
  level?: "public" | "account" | "paid";
  evidence?: ReliabilityEvidence;
  options?: readonly number[];
}
interface RangeBase {
  metric: ReliabilityMetric;
  value: number;
  lower: number;
  upper: number;
  halfWidth: number;
  widestHalfWidth: number;
  scaleMin: number;
  scaleMax: number;
  uncertaintyKey: string;
  basisKey: string;
  nextStepKey: string;
}
export type ReliabilityRange = (RangeBase & { kind: "continuous" })
  | (RangeBase & { kind: "size"; options: number[]; eligibleIndices: number[]; marginMm?: number });

/** Wraps real engine output. Account/payment status by itself supplies no measurement evidence. */
export function getReliabilityRange(input: ReliabilityInput): ReliabilityRange | null {
  const { metric, value } = input;
  const e = input.evidence ?? {};
  const uncertaintyKey = {
    saddleHeight: "inseam", saddleSetback: "femur", handlebarDrop: "flexibility", reach: "torso-and-arm",
    frameSize: "bike-geometry", crankLength: "inseam-and-femur", saddleWidth: "sit-bones", speed: "drag",
    climbTime: "ftp-and-weight", ftpWkg: "test-method", ftpPower: "test-method", cadence: "power", hydration: "sweat-loss",
  }[metric];
  if (!Number.isFinite(value) || (metric === "frameSize" && value < 0)
    || (value <= 0 && !["saddleSetback", "handlebarDrop", "frameSize"].includes(metric))) return null;
  let halfWidth: number;
  let widestHalfWidth: number;
  let basisKey = "public-input";
  let nextStepKey = "add-measurements";
  const select = (widths: readonly number[], account: boolean | undefined, paid?: boolean) => {
    const index = paid ? 2 : account ? 1 : 0;
    basisKey = index === 2 ? "validated-measurement" : index === 1 ? "profile-measurement" : "public-input";
    nextStepKey = index === widths.length - 1 ? "narrowest-online"
      : index === 0 ? "add-measurements" : "validate-measurements";
    return widths[Math.min(index, widths.length - 1)];
  };
  switch (metric) {
    case "saddleHeight": {
      if (!Number.isFinite(e.inseamCm) || e.inseamCm! < 55 || e.inseamCm! > 105) return null;
      const inseamMm = e.inseamCm! * 10;
      const provenance = e.inseamProvenance ?? { kind: "declared" as const };
      const sigmaB = getInseamSigmaMm(inseamMm, provenance);
      const inWindow = e.kneeAngleDegrees !== undefined && e.kneeAngleDegrees >= 25 && e.kneeAngleDegrees <= 35;
      halfWidth = Math.round(1.96 * Math.hypot(0.883 * sigmaB, inWindow ? 4 : 0.01 * value));
      widestHalfWidth = Math.round(1.96 * Math.hypot(0.883 * 0.03 * inseamMm, 0.01 * value));
      basisKey = inWindow ? "knee-angle-measured" : provenance.kind;
      nextStepKey = provenance.unresolvedWarning ? "remeasure" : provenance.kind !== "measured" ? "measure-inseam"
        : (provenance.repeatCount ?? 1) < 3 || !provenance.withinTolerance ? "repeat-inseam"
          : inWindow ? "narrowest-online" : "measure-knee-angle";
      break;
    }
    case "saddleSetback":
      widestHalfWidth = 15;
      halfWidth = select([15, 10, 6], e.femurAndFootMeasured, e.kneeOverPedalMeasured);
      break;
    case "handlebarDrop":
      widestHalfWidth = 30;
      halfWidth = select([30, 20, 12], e.flexibilityAndCoreAssessed, e.flexibilityAndCoreTested);
      break;
    case "reach":
      widestHalfWidth = 25;
      halfWidth = select([25, 15, 10], e.torsoAndArmMeasured && e.bikeGeometryKnown, e.posturePhotoMeasured);
      break;
    case "saddleWidth":
      widestHalfWidth = 15;
      halfWidth = select([15, 5], e.sitBonesMeasured);
      break;
    case "speed":
      widestHalfWidth = 2;
      halfWidth = select([2, 1.2, 0.6], e.bikePositionAndWeightKnown, e.dragFieldTest);
      break;
    case "climbTime":
      widestHalfWidth = value * 0.1;
      halfWidth = value * select([0.1, 0.05, 0.03], e.ftpAndWeightMeasured, e.guidedFtpTest);
      break;
    case "ftpPower":
    case "ftpWkg":
      widestHalfWidth = value * 0.1;
      halfWidth = value * select(
        [e.ftpMethod === "twenty-minute" ? 0.06 : 0.1, 0.04, 0.03], e.weightMeasuredRecently, e.guidedTest,
      );
      break;
    case "cadence":
      widestHalfWidth = 8;
      halfWidth = select([8, 4], e.ftpAndWeightMeasured);
      break;
    case "hydration":
      widestHalfWidth = value * 0.5;
      halfWidth = value * select([0.5, 0.15], e.sweatTest);
      break;
    case "frameSize":
    case "crankLength": {
      // Actual engine-returned options only: never invent crank lengths or frame categories.
      const options = input.options ? [...input.options] : [];
      if (options.length < 2 || options.some((option, index) => !Number.isFinite(option)
        || (index > 0 && option <= options[index - 1]))) return null;
      const refined = metric === "frameSize" ? e.bikeGeometryKnown : e.femurAndRidingStyleKnown;
      const count = Math.min(options.length, metric === "frameSize" ? refined ? 1 : 2 : refined ? 2 : 3);
      const ranked = options.map((option, index) => ({ index, distance: Math.abs(option - value) }))
        .sort((a, b) => a.distance - b.distance || a.index - b.index);
      const eligibleIndices = ranked.slice(0, count).map(({ index }) => index).sort((a, b) => a - b);
      const lower = options[eligibleIndices[0]], upper = options[eligibleIndices[eligibleIndices.length - 1]];
      const publicCount = Math.min(options.length, metric === "frameSize" ? 2 : 3);
      widestHalfWidth = Math.max(...ranked.slice(0, publicCount).map(({ distance }) => distance));
      halfWidth = Math.max(Math.abs(value - lower), Math.abs(upper - value));
      const marginMm = metric === "frameSize" && e.bikesCompared && e.bikeGeometryKnown
        && Number.isFinite(e.frameMarginMm) && e.frameMarginMm! >= 0 ? e.frameMarginMm : undefined;
      return {
        uncertaintyKey, ...(marginMm === undefined ? {} : { marginMm }),
        kind: "size", metric, value, options, eligibleIndices, lower, upper, halfWidth, widestHalfWidth,
        scaleMin: value - 1.25 * widestHalfWidth, scaleMax: value + 1.25 * widestHalfWidth,
        basisKey: refined ? "profile-measurement" : "public-input",
        nextStepKey: refined ? "compare-bike-geometry" : "add-measurements",
      };
    }
  }
  const roundBounds = (number: number) => metric === "saddleHeight" ? Math.round(number / 5) * 5 : number;
  return {
    uncertaintyKey, kind: "continuous", metric, value, halfWidth, widestHalfWidth,
    lower: roundBounds(value - halfWidth), upper: roundBounds(value + halfWidth),
    scaleMin: value - 1.25 * widestHalfWidth, scaleMax: value + 1.25 * widestHalfWidth,
    basisKey, nextStepKey,
  };
}
