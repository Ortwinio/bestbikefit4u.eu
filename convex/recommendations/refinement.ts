type Direction = "increase" | "decrease" | "hold";

export interface ConservativeRefinementSuggestion {
  parameter: "saddleHeightMm" | "barDropMm" | "saddleSetbackMm";
  direction: Direction;
  delta: number;
  rationale: string;
}

export interface RideFeedbackSignals {
  implementationStatus: "confirmed" | "partial" | "not_implemented";
  comfortScore: number;
  kneePainArea?: "front" | "back" | "medial" | "lateral";
  kneePainSeverity?: number;
  lowerBackDiscomfortScore?: number;
  handPressureScore?: number;
  saddlePressureScore?: number;
  climbingConfidenceScore?: number;
  descendingControlScore?: number;
}

export function buildConservativeRefinementSuggestion(
  signals: RideFeedbackSignals
): ConservativeRefinementSuggestion | undefined {
  if (signals.implementationStatus !== "confirmed") {
    return undefined;
  }

  if (
    signals.kneePainArea === "back" &&
    (signals.kneePainSeverity ?? 0) >= 5
  ) {
    return {
      parameter: "saddleHeightMm",
      direction: "decrease",
      delta: 2,
      rationale: "Posterior knee discomfort after an implemented setup suggests a small saddle-height reduction.",
    };
  }

  if (
    signals.kneePainArea === "front" &&
    (signals.kneePainSeverity ?? 0) >= 5
  ) {
    return {
      parameter: "saddleHeightMm",
      direction: "increase",
      delta: 2,
      rationale: "Anterior knee discomfort after an implemented setup suggests a small saddle-height increase.",
    };
  }

  if (
    (signals.handPressureScore ?? 0) >= 7 ||
    (signals.lowerBackDiscomfortScore ?? 0) >= 7
  ) {
    return {
      parameter: "barDropMm",
      direction: "decrease",
      delta: 5,
      rationale: "High hand or lower-back load suggests reducing front-end aggression first.",
    };
  }

  if (
    (signals.saddlePressureScore ?? 0) >= 7 ||
    (signals.climbingConfidenceScore ?? 10) <= 4
  ) {
    return {
      parameter: "saddleSetbackMm",
      direction: "increase",
      delta: 3,
      rationale: "Pressure or poor seated climbing confidence suggests a small setback increase.",
    };
  }

  if (signals.comfortScore >= 8) {
    return {
      parameter: "saddleHeightMm",
      direction: "hold",
      delta: 0,
      rationale: "Comfort is strong, so the safest next action is to keep the current recommendation stable.",
    };
  }

  return undefined;
}

