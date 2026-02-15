/**
 * Bike Fit Algorithm Types
 * Based on documentation specifications
 */

export type BikeCategory = "road" | "gravel" | "mtb" | "city";
export type Ambition = "comfort" | "balanced" | "performance" | "aero";
export type FlexibilityScore =
  | "very_limited"
  | "limited"
  | "average"
  | "good"
  | "excellent";

// Input types
export interface FitInputs {
  // Bike configuration
  category: BikeCategory;
  ambition: Ambition;

  // Required body measurements (mm)
  heightMm: number;
  inseamMm: number;

  // Assessment scores (0-10 scale internally, 1-5 from user)
  flexibilityScore: number; // 0-10 (mapped from user's 1-5)
  coreScore: number; // 0-10 (mapped from user's 1-5)

  // Optional measurements (mm)
  torsoMm?: number;
  armMm?: number;
  shoulderWidthMm?: number;
  footLengthMm?: number;
  femurMm?: number;

  // Optional experience level
  experienceLevel?: "beginner" | "intermediate" | "advanced";

  // Optional current setup for comparison (mm)
  currentSaddleHeightMm?: number;
  currentSetbackMm?: number;
  currentDropMm?: number;
  currentReachMm?: number;

  // Optional frame geometry for stem solving
  frameStackMm?: number;
  frameReachMm?: number;
  stemLengthMm?: number;
  stemAngleDeg?: number;
  spacerMm?: number;
}

// Output types
export interface FitOutputs {
  // Core measurements (all in mm unless noted)
  saddleHeightMm: number;
  saddleSetbackMm: number;
  saddleTiltDeg: number;
  barDropMm: number;
  saddleToBarReachMm: number;
  crankLengthMm: number;
  handlebarWidthMm: number;
  cleatOffsetMm: number;

  // Frame targets
  frameStackTargetMm: number;
  frameReachTargetMm: number;

  // Stem solution
  stemLengthMm: number;
  stemAngleDeg: number;
  spacerStackMm: number;

  // Ranges for adjustability
  saddleHeightRange: { min: number; max: number };
  barDropRange: { min: number; max: number };
  reachRange: { min: number; max: number };

  // Metadata
  confidenceScore: number; // 0-100
  algorithmVersion: string;

  // Warnings
  warnings: FitWarning[];

  // Comparison to current setup (if provided)
  deltas?: FitDeltas;
}

export interface FitWarning {
  type:
    | "saddle_too_high"
    | "saddle_too_low"
    | "drop_risk"
    | "reach_risk"
    | "flexibility_warning"
    | "core_warning"
    | "measurement_warning";
  severity: "info" | "warning" | "critical";
  message: string;
  recommendation: string;
}

export interface FitDeltas {
  saddleHeightDelta: number;
  saddleSetbackDelta: number;
  barDropDelta: number;
  reachDelta: number;
}

// Intermediate calculation types
export interface CalculationContext {
  inputs: FitInputs;
  flexIndex: number; // flexibilityScore - 5 (range: -5 to +5)
  coreIndex: number; // coreScore - 5 (range: -5 to +5)
}
