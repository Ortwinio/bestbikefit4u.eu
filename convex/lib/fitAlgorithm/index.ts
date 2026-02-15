/**
 * Bike Fit Algorithm - Main Entry Point
 *
 * This module implements a complete bike fitting algorithm based on
 * established biomechanical methods including:
 * - LeMond saddle height baseline
 * - Holmes-style knee angle targets (validation)
 * - KOPS for saddle fore-aft
 * - Stack & Reach coordinate system
 *
 * @module fitAlgorithm
 */

import type {
  FitInputs,
  FitOutputs,
  FitWarning,
  CalculationContext,
} from "./types";

import { validateInputs } from "./validation";
import {
  calculateCrankLength,
  calculateSaddleHeight,
  calculateSaddleSetback,
  calculateBarDrop,
  calculateReach,
  calculateSaddleTilt,
  calculateCleatOffset,
  calculateHandlebarWidth,
  calculateFrameTargets,
  solveStemAndSpacers,
  generateWarnings,
  calculateDeltas,
} from "./calculations";

import { ALGORITHM_VERSION } from "./constants";

// Re-export types
export type {
  FitInputs,
  FitOutputs,
  FitWarning,
  BikeCategory,
  Ambition,
  FlexibilityScore,
} from "./types";

export { mapFlexibilityScore, mapCoreScore } from "./validation";

/**
 * Calculate complete bike fit recommendations
 *
 * @param inputs - User measurements and preferences
 * @returns Complete fit recommendations with warnings
 * @throws Error if inputs fail validation
 */
export function calculateBikeFit(inputs: FitInputs): FitOutputs {
  // Step 0: Validate inputs
  const validation = validateInputs(inputs);
  if (!validation.isValid) {
    throw new Error(`Invalid inputs: ${validation.errors.join(", ")}`);
  }

  // Create calculation context
  const ctx: CalculationContext = {
    inputs,
    flexIndex: inputs.flexibilityScore - 5, // Range: -5 to +5
    coreIndex: inputs.coreScore - 5, // Range: -5 to +5
  };

  // Step 1: Crank Length
  const crankLengthMm = calculateCrankLength(inputs.inseamMm, inputs.category);

  // Step 2: Saddle Height
  const saddleResult = calculateSaddleHeight(ctx);
  const saddleHeightMm = saddleResult.height;

  // Step 3: Saddle Setback
  const saddleSetbackMm = calculateSaddleSetback(ctx);

  // Step 4: Bar Drop
  const dropResult = calculateBarDrop(ctx, saddleHeightMm);
  const barDropMm = dropResult.drop;

  // Step 5: Saddle-to-Bar Reach
  const reachResult = calculateReach(ctx);
  const saddleToBarReachMm = reachResult.reach;

  // Step 6: Saddle Tilt
  const saddleTiltDeg = calculateSaddleTilt(inputs.category, barDropMm);

  // Step 7: Cleat Offset
  const cleatOffsetMm = calculateCleatOffset(inputs.category, inputs.ambition);

  // Step 8: Handlebar Width
  const handlebarWidthMm = calculateHandlebarWidth(
    inputs.category,
    inputs.ambition,
    inputs.shoulderWidthMm
  );

  // Step 9: Frame Targets
  const frameTargets = calculateFrameTargets(
    saddleHeightMm,
    saddleSetbackMm,
    barDropMm,
    saddleToBarReachMm
  );

  // Step 10: Stem/Spacer Solution
  const stemSolution = solveStemAndSpacers(
    inputs.category,
    frameTargets.stackTarget,
    frameTargets.reachTarget,
    inputs.frameStackMm,
    inputs.frameReachMm
  );

  // Build partial outputs for warning generation
  const partialOutputs: Partial<FitOutputs> = {
    saddleHeightMm,
    saddleSetbackMm,
    barDropMm,
    saddleToBarReachMm,
  };

  // Generate warnings
  const algorithmWarnings = generateWarnings(inputs, partialOutputs);
  const allWarnings: FitWarning[] = [
    ...validation.warnings,
    ...algorithmWarnings,
  ];

  // Calculate confidence score
  const confidenceScore = calculateConfidence(inputs);

  // Build complete output
  const outputs: FitOutputs = {
    // Core measurements
    saddleHeightMm,
    saddleSetbackMm,
    saddleTiltDeg,
    barDropMm,
    saddleToBarReachMm,
    crankLengthMm,
    handlebarWidthMm,
    cleatOffsetMm,

    // Frame targets
    frameStackTargetMm: frameTargets.stackTarget,
    frameReachTargetMm: frameTargets.reachTarget,

    // Stem solution
    stemLengthMm: stemSolution.stemLength,
    stemAngleDeg: stemSolution.stemAngle,
    spacerStackMm: stemSolution.spacerStack,

    // Ranges
    saddleHeightRange: saddleResult.range,
    barDropRange: dropResult.range,
    reachRange: reachResult.range,

    // Metadata
    confidenceScore,
    algorithmVersion: ALGORITHM_VERSION,

    // Warnings
    warnings: allWarnings,

    // Deltas (if current setup provided)
    deltas: calculateDeltas(inputs, {
      saddleHeightMm,
      saddleSetbackMm,
      saddleTiltDeg,
      barDropMm,
      saddleToBarReachMm,
      crankLengthMm,
      handlebarWidthMm,
      cleatOffsetMm,
      frameStackTargetMm: frameTargets.stackTarget,
      frameReachTargetMm: frameTargets.reachTarget,
      stemLengthMm: stemSolution.stemLength,
      stemAngleDeg: stemSolution.stemAngle,
      spacerStackMm: stemSolution.spacerStack,
      saddleHeightRange: saddleResult.range,
      barDropRange: dropResult.range,
      reachRange: reachResult.range,
      confidenceScore,
      algorithmVersion: ALGORITHM_VERSION,
      warnings: [],
    }),
  };

  return outputs;
}

/**
 * Calculate confidence score based on input completeness
 */
function calculateConfidence(inputs: FitInputs): number {
  let score = 60; // Base score with required inputs

  // Add points for optional measurements
  if (inputs.torsoMm !== undefined) score += 10;
  if (inputs.armMm !== undefined) score += 10;
  if (inputs.shoulderWidthMm !== undefined) score += 5;
  if (inputs.femurMm !== undefined) score += 5;
  if (inputs.footLengthMm !== undefined) score += 3;
  if (inputs.experienceLevel !== undefined) score += 2;

  // Add points for frame geometry (enables accurate stem solving)
  if (inputs.frameStackMm !== undefined && inputs.frameReachMm !== undefined) {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Quick calculation for preview/estimation
 * Only calculates saddle height and basic metrics
 */
export function calculateQuickEstimate(inputs: {
  heightMm: number;
  inseamMm: number;
  category: FitInputs["category"];
}): {
  estimatedSaddleHeight: number;
  estimatedFrameSize: string;
} {
  const { inseamMm, heightMm, category } = inputs;

  // Quick saddle height estimate
  const multipliers = {
    road: 0.883,
    gravel: 0.88,
    mtb: 0.875,
    city: 0.87,
  };
  const estimatedSaddleHeight = Math.round(inseamMm * multipliers[category]);

  // Quick frame size estimate based on height
  let estimatedFrameSize: string;
  if (category === "road" || category === "gravel") {
    // Road/Gravel: cm sizing
    if (heightMm < 1600) estimatedFrameSize = "48-50 cm";
    else if (heightMm < 1680) estimatedFrameSize = "51-53 cm";
    else if (heightMm < 1750) estimatedFrameSize = "54-55 cm";
    else if (heightMm < 1830) estimatedFrameSize = "56-57 cm";
    else if (heightMm < 1900) estimatedFrameSize = "58-59 cm";
    else estimatedFrameSize = "60-62 cm";
  } else {
    // MTB/City: S/M/L sizing
    if (heightMm < 1600) estimatedFrameSize = "XS-S";
    else if (heightMm < 1700) estimatedFrameSize = "S-M";
    else if (heightMm < 1800) estimatedFrameSize = "M-L";
    else if (heightMm < 1900) estimatedFrameSize = "L-XL";
    else estimatedFrameSize = "XL-XXL";
  }

  return {
    estimatedSaddleHeight,
    estimatedFrameSize,
  };
}
