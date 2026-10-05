import { getInseamSigmaMm, type SaddleHeightProvenance, type SaddleHeightResult } from "./saddleHeight";

export interface KneeAngleInput {
  angleDegrees: number;
  currentSaddleHeightMm: number;
  inseamCm: number;
  provenance?: SaddleHeightProvenance;
}
export function calculateKneeAngle(input: KneeAngleInput) {
  const { angleDegrees, currentSaddleHeightMm, inseamCm } = input;
  if (!Number.isFinite(angleDegrees) || angleDegrees < 0 || angleDegrees > 90
    || !Number.isFinite(currentSaddleHeightMm) || currentSaddleHeightMm <= 0
    || !Number.isFinite(inseamCm) || inseamCm < 55 || inseamCm > 105) {
    throw new RangeError("Invalid knee-angle input");
  }
  const inWindow = angleDegrees >= 25 && angleDegrees <= 35;
  const desiredAdjustmentMm = inWindow ? 0 : Math.round((angleDegrees - 30) * 2);
  const stepMm = Math.max(-5, Math.min(5, desiredAdjustmentMm));
  const targetSaddleHeightMm = currentSaddleHeightMm + stepMm;
  const inseamMm = inseamCm * 10;
  const sigmaInseamMm = getInseamSigmaMm(inseamMm, input.provenance ?? { kind: "declared" });
  const sigmaModelMm = inWindow ? 4 : 0.01 * targetSaddleHeightMm;
  const halfWidthMm = Math.round(1.96 * Math.hypot(0.883 * sigmaInseamMm, sigmaModelMm));
  const widest = Math.round(1.96 * Math.hypot(0.883 * 0.03 * inseamMm, 0.01 * targetSaddleHeightMm));
  const range: SaddleHeightResult = {
    adviceMm: targetSaddleHeightMm, inseamMm, sigmaInseamMm, sigmaModelMm, halfWidthMm,
    lowerMm: Math.round((targetSaddleHeightMm - halfWidthMm) / 5) * 5,
    upperMm: Math.round((targetSaddleHeightMm + halfWidthMm) / 5) * 5,
    scaleMinMm: targetSaddleHeightMm - 1.25 * widest, scaleMaxMm: targetSaddleHeightMm + 1.25 * widest,
  };
  return {
    angleDegrees, inWindow, desiredAdjustmentMm, stepMm, targetSaddleHeightMm, evaluationAfterDays: 7 as const,
    verdict: inWindow ? "in-window" as const : angleDegrees < 25 ? "too-high" as const : "too-low" as const,
    range,
  };
}
export type KneeAngleResult = ReturnType<typeof calculateKneeAngle>;
