import { describe, expect, it } from "vitest";
import { calculateAccountSaddleHeight } from "./accountSaddle";
import { calculateKneeAngle } from "./kneeAngle";
import { getReliabilityRange, type ReliabilityEvidence, type ReliabilityMetric } from "./calculators";
import { getInseamSigmaMm } from "./saddleHeight";

const measured = { kind: "measured" as const, repeatCount: 3, withinTolerance: true };
describe("account saddle and measured knee angle", () => {
  it("keeps the 787 mm worked example and narrows only on measurement evidence", () => {
    const result = calculateAccountSaddleHeight({
      heightCm: 190, measurementsCm: [89, 89, 89], flexibilityScore: 2, coreScore: 3, goal: "performance",
    });
    expect(result.adviceMm).toBe(787);
    expect(result.halfWidthMm).toBe(18);
    expect(result.lowerMm).toBe(770);
    expect(result.upperMm).toBe(805);
    expect(result.breakdown.flexibilityMm).toBe(-1.5);
    expect(result.canCheckKneeAngle).toBe(true);
    const knee = calculateKneeAngle({
      angleDegrees: 31, currentSaddleHeightMm: result.adviceMm, inseamCm: 89, provenance: measured,
    });
    expect(knee.range.halfWidthMm).toBe(13);
    expect(knee.range.lowerMm).toBe(775);
    expect(knee.range.upperMm).toBe(800);
    expect(knee.stepMm).toBe(0);
  });
  it("uses the arithmetic mean but does not reward measurements more than 5 mm apart", () => {
    const result = calculateAccountSaddleHeight({ measurementsCm: [88, 89, 90] });
    expect(result.meanInseamCm).toBe(89);
    expect(result.withinTolerance).toBe(false);
    expect(result.sigmaInseamMm).toBe(10);
    expect(result.canCheckKneeAngle).toBe(false);
    expect(calculateAccountSaddleHeight({ measurementsCm: [89, 89.5] }).withinTolerance).toBe(true);
  });
  it("caps repeated precision and gives unresolved warnings priority over fitter methods", () => {
    expect(getInseamSigmaMm(890, { ...measured, repeatCount: 10 })).toBeCloseTo(10 / Math.sqrt(3));
    expect(getInseamSigmaMm(890, { ...measured, method: "fitter" })).toBe(5);
    expect(getInseamSigmaMm(890, { ...measured, method: "video", unresolvedWarning: true })).toBe(26.7);
    expect(getInseamSigmaMm(890, { kind: "declared", method: "fitter" })).toBe(26.7);
  });
  it.each([25, 30, 35])("allows sigmaM4 within the inclusive window %s", (angleDegrees) => {
    expect(calculateKneeAngle({ angleDegrees, currentSaddleHeightMm: 787, inseamCm: 89 }).range.sigmaModelMm).toBe(4);
  });
  it.each([[24, -5], [36, 5]])("keeps normal spread outside the window %s and limits each step", (angleDegrees, step) => {
    const result = calculateKneeAngle({ angleDegrees, currentSaddleHeightMm: 787, inseamCm: 89 });
    expect(result.stepMm).toBe(step);
    expect(result.range.sigmaModelMm).toBeCloseTo(0.01 * (787 + step));
    expect(result.evaluationAfterDays).toBe(7);
  });
  it("rejects invalid measurements and profile scores", () => {
    expect(() => calculateAccountSaddleHeight({ measurementsCm: [NaN] })).toThrow(RangeError);
    expect(() => calculateAccountSaddleHeight({ inseamCm: 89, flexibilityScore: 6 })).toThrow(RangeError);
    expect(() => calculateKneeAngle({ angleDegrees: NaN, currentSaddleHeightMm: 787, inseamCm: 89 })).toThrow(RangeError);
  });
});

const cases: Array<[ReliabilityMetric, number, number, number, number, ReliabilityEvidence, ReliabilityEvidence]> = [
  ["saddleSetback", 60, 15, 10, 6, { femurAndFootMeasured: true }, { kneeOverPedalMeasured: true }],
  ["handlebarDrop", 80, 30, 20, 12, { flexibilityAndCoreAssessed: true }, { flexibilityAndCoreTested: true }],
  ["reach", 500, 25, 15, 10, { torsoAndArmMeasured: true, bikeGeometryKnown: true }, { posturePhotoMeasured: true }],
  ["saddleWidth", 145, 15, 5, 5, { sitBonesMeasured: true }, { sitBonesMeasured: true }],
  ["speed", 30, 2, 1.2, 0.6, { bikePositionAndWeightKnown: true }, { dragFieldTest: true }],
  ["climbTime", 40, 4, 2, 1.2, { ftpAndWeightMeasured: true }, { guidedFtpTest: true }],
  ["ftpWkg", 4, 0.4, 0.16, 0.12, { weightMeasuredRecently: true }, { guidedTest: true }],
  ["cadence", 70, 8, 4, 4, { ftpAndWeightMeasured: true }, { ftpAndWeightMeasured: true }],
  ["hydration", 600, 300, 90, 90, { sweatTest: true }, { sweatTest: true }],
];
describe("all calculator uncertainty wrappers", () => {
  it.each(cases)("applies the document widths for %s without changing engine advice", (
    metric, value, publicWidth, accountWidth, paidWidth, accountEvidence, paidEvidence,
  ) => {
    for (const [evidence, expected] of [[{}, publicWidth], [accountEvidence, accountWidth], [paidEvidence, paidWidth]] as const) {
      const range = getReliabilityRange({ metric, value, evidence, level: "paid" })!;
      expect(range.value).toBe(value);
      expect(range.halfWidth).toBeCloseTo(expected);
      expect(range.scaleMin).toBeCloseTo(value - range.widestHalfWidth * 1.25);
      expect(range.scaleMax).toBeCloseTo(value + range.widestHalfWidth * 1.25);
    }
    expect(getReliabilityRange({ metric, value, level: "paid" })?.halfWidth).toBeCloseTo(publicWidth);
  });
  it("distinguishes FTP test protocols and keeps the widest scale fixed", () => {
    const result = getReliabilityRange({ metric: "ftpWkg", value: 4, evidence: { ftpMethod: "twenty-minute" } })!;
    expect(result.halfWidth).toBe(0.24);
    expect(result.widestHalfWidth).toBe(0.4);
  });
  it("uses saddle provenance including warning override and measured knee angle", () => {
    for (const [provenance, kneeAngleDegrees, width] of [
      [{ kind: "declared" as const }, undefined, 49],
      [{ kind: "measured" as const }, undefined, 23],
      [measured, undefined, 18], [measured, 31, 13],
      [{ ...measured, unresolvedWarning: true }, undefined, 49],
    ] as const) {
      expect(getReliabilityRange({ metric: "saddleHeight", value: 787,
        evidence: { inseamCm: 89, inseamProvenance: provenance, kneeAngleDegrees },
      })?.halfWidth).toBe(width);
    }
  });
  it("requires real frame options and selects two versus one candidate", () => {
    expect(getReliabilityRange({ metric: "frameSize", value: 56 })).toBeNull();
    const input = { metric: "frameSize" as const, value: 56, options: [50, 52, 54, 56, 58, 60] };
    const publicResult = getReliabilityRange(input)!;
    const refined = getReliabilityRange({ ...input, evidence: { bikeGeometryKnown: true } })!;
    expect(publicResult.kind === "size" && publicResult.eligibleIndices).toEqual([2, 3]);
    expect(refined.kind === "size" && refined.eligibleIndices).toEqual([3]);
  });
  it("uses crank steps of 2.5 mm and no paid-only refinement", () => {
    const input = { metric: "crankLength" as const, value: 172.5, options: [165, 167.5, 170, 172.5, 175], level: "paid" as const };
    const standard = getReliabilityRange(input)!;
    const refined = getReliabilityRange({ ...input, evidence: { femurAndRidingStyleKnown: true } })!;
    expect(standard.kind === "size" && standard.eligibleIndices).toHaveLength(3);
    expect(refined.kind === "size" && refined.eligibleIndices).toHaveLength(2);
  });
  it("refuses missing or invalid inputs", () => {
    expect(getReliabilityRange({ metric: "saddleHeight", value: 787 })).toBeNull();
    expect(getReliabilityRange({ metric: "speed", value: NaN })).toBeNull();
    expect(getReliabilityRange({ metric: "frameSize", value: 56, options: [56, 54] })).toBeNull();
  });
});
