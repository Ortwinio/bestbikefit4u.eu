/**
 * Input Validation for Bike Fit Algorithm
 */

import type { FitInputs, FitWarning } from "./types";
import {
  HEIGHT_MIN_MM,
  HEIGHT_MAX_MM,
  INSEAM_MIN_MM,
  INSEAM_MAX_MM,
  INSEAM_RATIO_MIN,
  INSEAM_RATIO_MAX,
  TORSO_MIN_MM,
  TORSO_MAX_MM,
  ARM_MIN_MM,
  ARM_MAX_MM,
} from "./constants";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: FitWarning[];
}

/**
 * Validate all inputs before calculation
 */
export function validateInputs(inputs: FitInputs): ValidationResult {
  const errors: string[] = [];
  const warnings: FitWarning[] = [];

  // Required field validation
  if (!inputs.heightMm) {
    errors.push("Height is required");
  }
  if (!inputs.inseamMm) {
    errors.push("Inseam is required");
  }

  // Hard rejects - height range
  if (inputs.heightMm < HEIGHT_MIN_MM || inputs.heightMm > HEIGHT_MAX_MM) {
    errors.push(
      `Height must be between ${HEIGHT_MIN_MM}mm and ${HEIGHT_MAX_MM}mm (got ${inputs.heightMm}mm)`
    );
  }

  // Hard rejects - inseam range
  if (inputs.inseamMm < INSEAM_MIN_MM || inputs.inseamMm > INSEAM_MAX_MM) {
    errors.push(
      `Inseam must be between ${INSEAM_MIN_MM}mm and ${INSEAM_MAX_MM}mm (got ${inputs.inseamMm}mm)`
    );
  }

  // Hard reject - inseam >= height (impossible)
  if (inputs.inseamMm >= inputs.heightMm) {
    errors.push("Inseam cannot be greater than or equal to height");
  }

  // Soft warnings - inseam ratio
  if (inputs.heightMm && inputs.inseamMm) {
    const inseamRatio = inputs.inseamMm / inputs.heightMm;
    if (inseamRatio < INSEAM_RATIO_MIN || inseamRatio > INSEAM_RATIO_MAX) {
      warnings.push({
        type: "measurement_warning",
        severity: "warning",
        message: `Inseam ratio (${(inseamRatio * 100).toFixed(1)}%) is outside normal range (${INSEAM_RATIO_MIN * 100}-${INSEAM_RATIO_MAX * 100}%)`,
        recommendation: "Please re-measure your inseam to ensure accuracy",
      });
    }
  }

  // Optional field validation - torso
  if (inputs.torsoMm !== undefined) {
    if (inputs.torsoMm < TORSO_MIN_MM || inputs.torsoMm > TORSO_MAX_MM) {
      warnings.push({
        type: "measurement_warning",
        severity: "warning",
        message: `Torso length (${inputs.torsoMm}mm) is outside normal range`,
        recommendation: "Please verify your torso measurement",
      });
    }
  }

  // Optional field validation - arm
  if (inputs.armMm !== undefined) {
    if (inputs.armMm < ARM_MIN_MM || inputs.armMm > ARM_MAX_MM) {
      warnings.push({
        type: "measurement_warning",
        severity: "warning",
        message: `Arm length (${inputs.armMm}mm) is outside normal range`,
        recommendation: "Please verify your arm measurement",
      });
    }
  }

  // Flexibility and core score validation
  if (inputs.flexibilityScore < 0 || inputs.flexibilityScore > 10) {
    errors.push("Flexibility score must be between 0 and 10");
  }
  if (inputs.coreScore < 0 || inputs.coreScore > 10) {
    errors.push("Core score must be between 0 and 10");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Map user's 1-5 score to algorithm's 0-10 scale
 * Using the exact mapping from documentation
 */
export function mapFlexibilityScore(userScore: 1 | 2 | 3 | 4 | 5): number {
  // Documentation mapping (sit-and-reach based):
  // Score 1 = very limited = ~1-2 on 0-10 scale
  // Score 2 = limited = ~3-4
  // Score 3 = average = ~5
  // Score 4 = good = ~6-7
  // Score 5 = excellent = ~8-9
  const mapping: Record<number, number> = {
    1: 2,
    2: 4,
    3: 5,
    4: 7,
    5: 9,
  };
  return mapping[userScore] ?? 5;
}

/**
 * Map user's 1-5 core score to algorithm's 0-10 scale
 * Using plank hold time mapping from documentation
 */
export function mapCoreScore(userScore: 1 | 2 | 3 | 4 | 5): number {
  // Documentation mapping (plank hold based):
  // Score 1 = <20s = ~1-2 on 0-10 scale
  // Score 2 = 20-40s = ~3-4
  // Score 3 = 40-60s = ~5
  // Score 4 = 60-90s = ~6-7
  // Score 5 = 90s+ = ~8-9
  const mapping: Record<number, number> = {
    1: 2,
    2: 4,
    3: 5,
    4: 7,
    5: 9,
  };
  return mapping[userScore] ?? 5;
}
