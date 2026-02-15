/**
 * Core Bike Fit Calculations
 * Implements all formulas from documentation
 */

import type {
  FitInputs,
  FitOutputs,
  FitWarning,
  BikeCategory,
  Ambition,
  CalculationContext,
} from "./types";

import {
  SADDLE_HEIGHT_MULTIPLIERS,
  SADDLE_HEIGHT_AMBITION_OFFSETS,
  SETBACK_CATEGORY_OFFSETS,
  SETBACK_AMBITION_OFFSETS,
  BAR_DROP_RATIOS,
  BAR_DROP_CLAMP_RANGES,
  REACH_OFFSETS,
  REACH_AMBITION_OFFSETS,
  REACH_CLAMP_RANGES,
  CRANK_LENGTH_TABLE,
  BASE_SADDLE_TILT,
  CLEAT_OFFSETS,
  MTB_BAR_WIDTH_MIN,
  MTB_BAR_WIDTH_MAX,
  MTB_BAR_WIDTH_MULTIPLIER,
  CITY_BAR_WIDTH_MIN,
  CITY_BAR_WIDTH_MAX,
  CITY_BAR_WIDTH_MULTIPLIER,
  GRAVEL_BAR_WIDTH_ADDITIONS,
  EXPERIENCE_DROP_MODIFIERS,
  DEFAULT_COCKPIT,
  STEM_LENGTH_OPTIONS,
  STEM_ANGLE_OPTIONS,
  SPACER_OPTIONS,
  TOP_CAP_MM,
  SADDLE_HEIGHT_HIGH_RISK_RATIO,
  SADDLE_HEIGHT_LOW_RISK_RATIO,
  DROP_RISK_FLEX_THRESHOLD,
  DROP_RISK_DROP_THRESHOLD,
  DROP_RISK_CORE_THRESHOLD,
  DROP_RISK_CORE_DROP_THRESHOLD,
} from "./constants";

// ============================================
// Utility Functions
// ============================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

// ============================================
// Step 1: Crank Length
// ============================================

export function calculateCrankLength(
  inseamMm: number,
  category: BikeCategory
): number {
  let crankLength = 170; // Default

  for (const entry of CRANK_LENGTH_TABLE) {
    if (inseamMm <= entry.maxInseam) {
      crankLength = entry.crankLength;
      break;
    }
  }

  // MTB adjustment: prefer shorter crank for clearance
  if (category === "mtb" && inseamMm >= 820 && crankLength >= 175) {
    crankLength -= 2.5;
  }

  return crankLength;
}

// ============================================
// Step 2: Saddle Height
// ============================================

export function calculateSaddleHeight(ctx: CalculationContext): {
  height: number;
  range: { min: number; max: number };
} {
  const { inputs, flexIndex, coreIndex } = ctx;
  const { category, ambition, inseamMm } = inputs;

  // Base calculation: inseam × multiplier
  const Msh = SADDLE_HEIGHT_MULTIPLIERS[category];
  const SH0 = inseamMm * Msh;

  // Flexibility modifier: clamp(-8, +4, 1.5 × (FS - 5))
  const deltaFlex = clamp(1.5 * flexIndex, -8, 4);

  // Core modifier: clamp(-4, +2, 0.8 × (CS - 5))
  const deltaCore = clamp(0.8 * coreIndex, -4, 2);

  // Ambition modifier
  // For MTB/city with aero, treat as performance
  let effectiveAmbition = ambition;
  if ((category === "mtb" || category === "city") && ambition === "aero") {
    effectiveAmbition = "performance";
  }
  const deltaAmbition = SADDLE_HEIGHT_AMBITION_OFFSETS[effectiveAmbition];

  // Final calculation
  const saddleHeight = Math.round(SH0 + deltaFlex + deltaCore + deltaAmbition);

  // Safety band: clamp to reasonable range
  const minHeight = Math.round(inseamMm * 0.86);
  const maxHeight = Math.round(inseamMm * 0.91);

  return {
    height: clamp(saddleHeight, minHeight, maxHeight),
    range: { min: minHeight, max: maxHeight },
  };
}

// ============================================
// Step 3: Saddle Setback
// ============================================

export function calculateSaddleSetback(ctx: CalculationContext): number {
  const { inputs } = ctx;
  const { category, ambition, inseamMm } = inputs;

  // Base setback: SS0 = 0.070 × I - 5
  const SS0 = 0.07 * inseamMm - 5;

  // Category offset
  const deltaCat = SETBACK_CATEGORY_OFFSETS[category];

  // Ambition offset
  let effectiveAmbition = ambition;
  if ((category === "mtb" || category === "city") && ambition === "aero") {
    effectiveAmbition = "performance";
  }
  const deltaAmb = SETBACK_AMBITION_OFFSETS[effectiveAmbition];

  // Final setback
  return Math.round(SS0 + deltaCat + deltaAmb);
}

// ============================================
// Step 4: Bar Drop
// ============================================

export function calculateBarDrop(
  ctx: CalculationContext,
  saddleHeightMm: number
): {
  drop: number;
  range: { min: number; max: number };
} {
  const { inputs, flexIndex, coreIndex } = ctx;
  const { category, ambition, experienceLevel } = inputs;

  // Base drop: SH × Rbd
  let effectiveAmbition = ambition;
  if ((category === "mtb" || category === "city") && ambition === "aero") {
    effectiveAmbition = "performance";
  }
  const Rbd = BAR_DROP_RATIOS[category][effectiveAmbition];
  const BD0 = saddleHeightMm * Rbd;

  // Flexibility modifier: clamp(-25, +15, 5.0 × (FS - 5))
  const deltaFlex = clamp(5.0 * flexIndex, -25, 15);

  // Core modifier: clamp(-20, +10, 4.0 × (CS - 5))
  const deltaCore = clamp(4.0 * coreIndex, -20, 10);

  // Experience modifier
  const deltaExp =
    EXPERIENCE_DROP_MODIFIERS[experienceLevel || "intermediate"] || 0;

  // Final calculation
  const barDrop = Math.round(BD0 + deltaFlex + deltaCore + deltaExp);

  // Clamp by category
  const clampRange = BAR_DROP_CLAMP_RANGES[category];

  return {
    drop: clamp(barDrop, clampRange.min, clampRange.max),
    range: clampRange,
  };
}

// ============================================
// Step 5: Saddle-to-Bar Reach
// ============================================

export function calculateReach(ctx: CalculationContext): {
  reach: number;
  range: { min: number; max: number };
} {
  const { inputs, flexIndex, coreIndex } = ctx;
  const { category, ambition, heightMm, torsoMm, armMm } = inputs;

  // Base reach calculation
  let SR0: number;
  if (torsoMm !== undefined && armMm !== undefined) {
    // With torso and arm: SR0 = 0.47 × torso + 0.33 × arm + 25
    SR0 = 0.47 * torsoMm + 0.33 * armMm + 25;
  } else {
    // Fallback: SR0 = 0.33 × height
    SR0 = 0.33 * heightMm;
  }

  // Category offset
  const OR = REACH_OFFSETS[category];
  const SR1 = SR0 + OR;

  // Ambition offset
  let effectiveAmbition = ambition;
  if ((category === "mtb" || category === "city") && ambition === "aero") {
    effectiveAmbition = "performance";
  }
  const deltaAmb = REACH_AMBITION_OFFSETS[effectiveAmbition];

  // Flexibility modifier: clamp(-20, +10, 3.0 × (FS - 5))
  const deltaFlex = clamp(3.0 * flexIndex, -20, 10);

  // Core modifier: clamp(-20, +10, 3.0 × (CS - 5))
  const deltaCore = clamp(3.0 * coreIndex, -20, 10);

  // Final calculation
  const reach = Math.round(SR1 + deltaAmb + deltaFlex + deltaCore);

  // Clamp by category
  const clampRange = REACH_CLAMP_RANGES[category];

  return {
    reach: clamp(reach, clampRange.min, clampRange.max),
    range: clampRange,
  };
}

// ============================================
// Step 6: Saddle Tilt
// ============================================

export function calculateSaddleTilt(
  category: BikeCategory,
  barDropMm: number
): number {
  // Base tilt by category
  let tilt = BASE_SADDLE_TILT[category];

  // Drop-based modifier
  if (barDropMm > 90) {
    tilt -= 0.5;
  }
  if (barDropMm > 120) {
    tilt -= 0.5;
  }

  // Clamp to valid range
  return clamp(tilt, -3.0, 1.0);
}

// ============================================
// Step 7: Cleat Position
// ============================================

export function calculateCleatOffset(
  category: BikeCategory,
  ambition: Ambition
): number {
  let effectiveAmbition = ambition;
  if ((category === "mtb" || category === "city") && ambition === "aero") {
    effectiveAmbition = "performance";
  }
  return CLEAT_OFFSETS[category][effectiveAmbition];
}

// ============================================
// Step 8: Handlebar Width
// ============================================

export function calculateHandlebarWidth(
  category: BikeCategory,
  ambition: Ambition,
  shoulderWidthMm?: number
): number {
  // Default shoulder width if not provided
  const shoulder = shoulderWidthMm || 420;

  switch (category) {
    case "road": {
      // Road: round shoulder width to nearest 20mm
      return roundToNearest(shoulder, 20);
    }
    case "gravel": {
      // Gravel: road width + additions
      const baseWidth = roundToNearest(shoulder, 20);
      const addition = GRAVEL_BAR_WIDTH_ADDITIONS[ambition];
      return baseWidth + addition;
    }
    case "mtb": {
      // MTB: 1.80 × shoulder, clamped 720-820, round to 10
      const mtbWidth = shoulder * MTB_BAR_WIDTH_MULTIPLIER;
      const clamped = clamp(mtbWidth, MTB_BAR_WIDTH_MIN, MTB_BAR_WIDTH_MAX);
      return roundToNearest(clamped, 10);
    }
    case "city": {
      // City: 1.60 × shoulder, clamped 600-740, round to 10
      const cityWidth = shoulder * CITY_BAR_WIDTH_MULTIPLIER;
      const clamped = clamp(cityWidth, CITY_BAR_WIDTH_MIN, CITY_BAR_WIDTH_MAX);
      return roundToNearest(clamped, 10);
    }
    default:
      return 420;
  }
}

// ============================================
// Step 9: Frame Target Coordinates
// ============================================

export function calculateFrameTargets(
  saddleHeightMm: number,
  setbackMm: number,
  barDropMm: number,
  reachMm: number,
  seatTubeAngle?: number
): { stackTarget: number; reachTarget: number } {
  // Approximate saddle Y position
  // If seat tube angle unknown, use 0.96 approximation
  const saddleY = seatTubeAngle
    ? saddleHeightMm * Math.sin((seatTubeAngle * Math.PI) / 180)
    : saddleHeightMm * 0.96;

  // Saddle nose X coordinate (negative = behind BB)
  const saddleX = -setbackMm;

  // Bar target coordinates
  const barXTarget = saddleX + reachMm;
  const barYTarget = saddleY - barDropMm;

  return {
    stackTarget: Math.round(barYTarget),
    reachTarget: Math.round(barXTarget),
  };
}

// ============================================
// Step 10: Stem/Spacer Solution
// ============================================

export function solveStemAndSpacers(
  category: BikeCategory,
  stackTarget: number,
  reachTarget: number,
  frameStack?: number,
  frameReach?: number
): { stemLength: number; stemAngle: number; spacerStack: number } {
  // If no frame geometry, return defaults
  if (frameStack === undefined || frameReach === undefined) {
    return DEFAULT_COCKPIT[category];
  }

  const stemAngles = STEM_ANGLE_OPTIONS[category];
  let bestSolution = DEFAULT_COCKPIT[category];
  let bestScore = Infinity;

  // Brute force search through all combinations
  for (const stemLength of STEM_LENGTH_OPTIONS) {
    for (const stemAngle of stemAngles) {
      for (const spacer of SPACER_OPTIONS) {
        // Calculate bar position with this setup
        const angleRad = (stemAngle * Math.PI) / 180;
        const barX = frameReach + stemLength * Math.cos(angleRad);
        const barY =
          frameStack + TOP_CAP_MM + spacer + stemLength * Math.sin(angleRad);

        // Calculate error
        const errX = barX - reachTarget;
        const errY = barY - stackTarget;
        const score = Math.sqrt(errX * errX + errY * errY);

        // Prefer solutions with reasonable spacer stack
        const spacerPenalty =
          spacer > 35 && (category === "road" || category === "gravel")
            ? 10
            : 0;

        if (score + spacerPenalty < bestScore) {
          bestScore = score + spacerPenalty;
          bestSolution = {
            stemLength,
            stemAngle,
            spacerStack: spacer,
          };
        }
      }
    }
  }

  return bestSolution;
}

// ============================================
// Warnings Generation
// ============================================

export function generateWarnings(
  inputs: FitInputs,
  outputs: Partial<FitOutputs>
): FitWarning[] {
  const warnings: FitWarning[] = [];
  const { inseamMm, flexibilityScore, coreScore } = inputs;

  // Saddle height risk
  if (outputs.saddleHeightMm !== undefined) {
    if (outputs.saddleHeightMm > inseamMm * SADDLE_HEIGHT_HIGH_RISK_RATIO) {
      warnings.push({
        type: "saddle_too_high",
        severity: "warning",
        message: "Saddle height may be too high",
        recommendation:
          "This could strain your hamstrings and lower back. Consider lowering by 5-10mm if you experience discomfort.",
      });
    }
    if (outputs.saddleHeightMm < inseamMm * SADDLE_HEIGHT_LOW_RISK_RATIO) {
      warnings.push({
        type: "saddle_too_low",
        severity: "warning",
        message: "Saddle height may be too low",
        recommendation:
          "This could cause anterior knee pain. Consider raising by 5-10mm if you experience discomfort.",
      });
    }
  }

  // Drop risk with low flexibility
  if (outputs.barDropMm !== undefined) {
    if (
      flexibilityScore <= DROP_RISK_FLEX_THRESHOLD * 2 && // Convert to 0-10 scale
      outputs.barDropMm > DROP_RISK_DROP_THRESHOLD
    ) {
      warnings.push({
        type: "flexibility_warning",
        severity: "warning",
        message: "Bar drop may be too aggressive for your flexibility",
        recommendation:
          "Consider adding spacers or using a higher stem angle to reduce lumbar and neck strain.",
      });
    }

    // Drop risk with low core strength
    if (
      coreScore <= DROP_RISK_CORE_THRESHOLD * 2 && // Convert to 0-10 scale
      outputs.barDropMm > DROP_RISK_CORE_DROP_THRESHOLD
    ) {
      warnings.push({
        type: "core_warning",
        severity: "warning",
        message: "Bar drop may cause fatigue with your core strength",
        recommendation:
          "Consider a more upright position to reduce shoulder and neck strain during longer rides.",
      });
    }
  }

  // Reach risk with low core
  if (outputs.saddleToBarReachMm !== undefined) {
    const reachRange = REACH_CLAMP_RANGES[inputs.category];
    if (
      coreScore <= DROP_RISK_CORE_THRESHOLD * 2 &&
      outputs.saddleToBarReachMm > reachRange.max - 10
    ) {
      warnings.push({
        type: "reach_risk",
        severity: "info",
        message: "Reach is near the maximum for your build",
        recommendation:
          "If you experience hand numbness, consider a shorter stem or more stack.",
      });
    }
  }

  return warnings;
}

// ============================================
// Calculate Deltas
// ============================================

export function calculateDeltas(
  inputs: FitInputs,
  outputs: FitOutputs
): FitOutputs["deltas"] {
  if (
    inputs.currentSaddleHeightMm === undefined &&
    inputs.currentSetbackMm === undefined &&
    inputs.currentDropMm === undefined &&
    inputs.currentReachMm === undefined
  ) {
    return undefined;
  }

  return {
    saddleHeightDelta:
      inputs.currentSaddleHeightMm !== undefined
        ? outputs.saddleHeightMm - inputs.currentSaddleHeightMm
        : 0,
    saddleSetbackDelta:
      inputs.currentSetbackMm !== undefined
        ? outputs.saddleSetbackMm - inputs.currentSetbackMm
        : 0,
    barDropDelta:
      inputs.currentDropMm !== undefined
        ? outputs.barDropMm - inputs.currentDropMm
        : 0,
    reachDelta:
      inputs.currentReachMm !== undefined
        ? outputs.saddleToBarReachMm - inputs.currentReachMm
        : 0,
  };
}
