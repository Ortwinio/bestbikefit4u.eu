import { calculateSaddleHeight, SADDLE_HEIGHT_BIKE_FACTORS, type SaddleHeightProvenance } from "./saddleHeight";

export interface AccountSaddleInput {
  heightCm?: number;
  inseamCm?: number;
  measurementsCm?: readonly number[];
  provenance?: SaddleHeightProvenance;
  bikeType?: keyof typeof SADDLE_HEIGHT_BIKE_FACTORS;
  goal?: "comfort" | "balanced" | "performance" | "aero";
  flexibilityScore?: number;
  coreScore?: number;
  climbing?: "none" | "low" | "medium" | "high";
}

function mappedScore(score = 3): number {
  if (!Number.isInteger(score) || score < 1 || score > 5) throw new RangeError("Invalid profile score");
  return [2, 4, 5, 7, 9][score - 1];
}

export function calculateAccountSaddleHeight(input: AccountSaddleInput) {
  const measurements = input.measurementsCm ?? [];
  if (measurements.some((value) => !Number.isFinite(value) || value < 55 || value > 105)) {
    throw new RangeError("Invalid inseam measurement");
  }
  const mean = measurements.length
    ? measurements.reduce((sum, value) => sum + value, 0) / measurements.length
    : input.inseamCm;
  const withinTolerance = measurements.length >= 2
    && Math.max(...measurements) - Math.min(...measurements) <= 0.5 + 1e-10;
  const provenance: SaddleHeightProvenance = measurements.length
    ? { ...input.provenance, kind: "measured", repeatCount: measurements.length, withinTolerance }
    : input.provenance ?? { kind: mean === undefined ? "derived" : "declared" };
  const flexibilityMm = Math.min(4, Math.max(-4.5, 1.5 * (mappedScore(input.flexibilityScore) - 5)));
  const coreMm = Math.min(2, Math.max(-2.4, 0.8 * (mappedScore(input.coreScore) - 5)));
  const goalMm = { comfort: -4, balanced: 0, performance: 3, aero: 6 }[input.goal ?? "balanced"];
  const climbingMm = { none: 0, low: 1, medium: 3, high: 4 }[input.climbing ?? "none"];
  const bikeFactor = SADDLE_HEIGHT_BIKE_FACTORS[input.bikeType ?? "road"];
  const result = calculateSaddleHeight({
    heightCm: input.heightCm, inseamCm: mean, provenance, bikeFactor,
    adjustmentsMm: { flexibility: flexibilityMm, core: coreMm, goal: goalMm, climbing: climbingMm },
  });
  const widest = Math.round(1.96 * Math.hypot(0.883 * 0.03 * result.inseamMm, 0.01 * result.adviceMm));
  const baseMm = result.inseamMm * bikeFactor;
  return {
    ...result, scaleMinMm: result.adviceMm - 1.25 * widest, scaleMaxMm: result.adviceMm + 1.25 * widest,
    meanInseamCm: result.inseamMm / 10, provenance, withinTolerance,
    measurementCount: measurements.length || provenance.repeatCount || 0,
    canCheckKneeAngle: provenance.kind === "measured" && !provenance.unresolvedWarning
      && (provenance.repeatCount ?? 0) >= 3 && provenance.withinTolerance === true,
    breakdown: {
      baseMm, flexibilityMm, coreMm, goalMm, climbingMm,
      unclampedMm: baseMm + flexibilityMm + coreMm + goalMm + climbingMm,
    },
  };
}
export type AccountSaddleResult = ReturnType<typeof calculateAccountSaddleHeight>;
