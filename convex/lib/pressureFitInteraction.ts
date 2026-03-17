type FitOutput = {
  calculatedFit: {
    handlebarDropMm: number;
  };
};

type PressureCalculation = {
  recommendedFrontBar: number;
  inputSnapshot: {
    surface:
      | "smooth_asphalt"
      | "average_asphalt"
      | "rough_asphalt"
      | "hardpack_gravel"
      | "loose_gravel"
      | "trail";
    ridingGoal?: "speed" | "balance" | "comfort";
    bodyWeightKg: number;
  };
  comfortScore?: number;
  gripScore?: number;
  efficiencyScore?: number;
};

type Bike = {
  bikeType:
    | "road"
    | "gravel"
    | "mountain"
    | "hybrid"
    | "tt_triathlon"
    | "cyclocross"
    | "touring"
    | "city";
};

export type PressureInsights = {
  comfortBias: "comfort" | "balanced" | "performance";
  stabilityScore: number;
  surfaceComplianceNote?: string;
  warnings: string[];
  version: number;
};

export function computePressureInsights(
  fitOutput: FitOutput,
  pressureCalc: PressureCalculation | null,
  bike: Bike | null,
  riderWeightKg?: number | null
): PressureInsights {
  if (!pressureCalc || !bike) {
    return {
      comfortBias: "balanced",
      stabilityScore: 0.5,
      warnings: [],
      version: 1,
    };
  }

  const warnings: string[] = [];
  let comfortBias: PressureInsights["comfortBias"] = "balanced";

  if (
    pressureCalc.inputSnapshot.ridingGoal === "comfort" &&
    (bike.bikeType === "gravel" || bike.bikeType === "touring")
  ) {
    comfortBias = "comfort";
  }

  if (
    pressureCalc.inputSnapshot.ridingGoal === "speed" &&
    (bike.bikeType === "road" || bike.bikeType === "tt_triathlon")
  ) {
    comfortBias = "performance";
  }

  if (
    (pressureCalc.inputSnapshot.surface === "hardpack_gravel" ||
      pressureCalc.inputSnapshot.surface === "loose_gravel") &&
    pressureCalc.recommendedFrontBar > 4.5
  ) {
    warnings.push("pressure_high_for_gravel");
  }

  if (pressureCalc.recommendedFrontBar < 1.5) {
    warnings.push("pressure_low_general");
  }

  if (
    fitOutput.calculatedFit.handlebarDropMm > 80 &&
    (pressureCalc.inputSnapshot.surface === "hardpack_gravel" ||
      pressureCalc.inputSnapshot.surface === "loose_gravel" ||
      pressureCalc.inputSnapshot.surface === "trail") &&
    pressureCalc.recommendedFrontBar < 2.5
  ) {
    warnings.push("aggressive_setup_rough_terrain");
  }

  if (
    riderWeightKg &&
    Math.abs(riderWeightKg - pressureCalc.inputSnapshot.bodyWeightKg) /
      pressureCalc.inputSnapshot.bodyWeightKg >
      0.2
  ) {
    warnings.push("weight_mismatch");
  }

  if (
    bike.bikeType === "road" &&
    (pressureCalc.inputSnapshot.surface === "hardpack_gravel" ||
      pressureCalc.inputSnapshot.surface === "loose_gravel")
  ) {
    warnings.push("gravel_road_conflict");
  }

  if (
    bike.bikeType === "mountain" &&
    pressureCalc.recommendedFrontBar > 3.5
  ) {
    warnings.push("mtb_pressure_stability");
  }

  if (
    comfortBias === "performance" &&
    pressureCalc.recommendedFrontBar < 3
  ) {
    warnings.push("performance_posture_low_pressure");
  }

  const stabilityScore = Math.max(
    0,
    Math.min(
      1,
      ((pressureCalc.gripScore ?? 0.5) + (pressureCalc.efficiencyScore ?? 0.5)) / 2
    )
  );

  const surfaceComplianceNote =
    warnings.length > 0
      ? "pressure_surface_adjustment_recommended"
      : "pressure_surface_match_good";

  return {
    comfortBias,
    stabilityScore,
    surfaceComplianceNote,
    warnings,
    version: 1,
  };
}
