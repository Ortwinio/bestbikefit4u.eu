/**
 * Bike Fit Algorithm Constants
 * All lookup tables and constants from documentation
 */

import type { BikeCategory, Ambition } from "./types";

// Algorithm version
export const ALGORITHM_VERSION = "1.0.0";

// ============================================
// 4.1 Category Setup Constants
// ============================================

// Saddle height multipliers (Msh)
export const SADDLE_HEIGHT_MULTIPLIERS: Record<BikeCategory, number> = {
  road: 0.883,
  gravel: 0.88,
  mtb: 0.875,
  city: 0.87,
};

// Base reach offsets (OR) - added to base reach calculation
export const REACH_OFFSETS: Record<BikeCategory, number> = {
  road: 0,
  gravel: -10,
  mtb: -60,
  city: -120,
};

// ============================================
// 4.2 Bar Drop Ratio Table (Rbd)
// ============================================

export const BAR_DROP_RATIOS: Record<BikeCategory, Record<Ambition, number>> = {
  road: {
    comfort: 0.07,
    balanced: 0.1,
    performance: 0.13,
    aero: 0.16,
  },
  gravel: {
    comfort: 0.05,
    balanced: 0.07,
    performance: 0.09,
    aero: 0.11,
  },
  mtb: {
    comfort: 0.01,
    balanced: 0.03,
    performance: 0.05,
    aero: 0.05, // Same as performance for MTB
  },
  city: {
    comfort: -0.06,
    balanced: -0.04,
    performance: -0.02,
    aero: -0.02, // Same as performance for city
  },
};

// ============================================
// 4.3 Saddle Setback Offsets
// ============================================

// Category offsets (ΔSS_cat)
export const SETBACK_CATEGORY_OFFSETS: Record<BikeCategory, number> = {
  road: 0,
  gravel: 5,
  mtb: -5,
  city: 10,
};

// Ambition offsets (ΔSS_amb)
export const SETBACK_AMBITION_OFFSETS: Record<Ambition, number> = {
  comfort: 6,
  balanced: 0,
  performance: -6,
  aero: -18,
};

// ============================================
// 4.4 Saddle Tilt Targets (degrees)
// ============================================

export const BASE_SADDLE_TILT: Record<BikeCategory, number> = {
  road: -1.0,
  gravel: -1.0,
  mtb: 0.0,
  city: 0.0,
};

// ============================================
// 4.5 Cleat Position Offsets (mm behind ball of foot)
// ============================================

export const CLEAT_OFFSETS: Record<BikeCategory, Record<Ambition, number>> = {
  road: {
    comfort: 8,
    balanced: 6,
    performance: 3,
    aero: 5,
  },
  gravel: {
    comfort: 10,
    balanced: 8,
    performance: 6,
    aero: 7,
  },
  mtb: {
    comfort: 14,
    balanced: 12,
    performance: 10,
    aero: 10,
  },
  city: {
    comfort: 16,
    balanced: 14,
    performance: 12,
    aero: 12,
  },
};

// ============================================
// 4.6 Handlebar Width Constants
// ============================================

// MTB handlebar width formula constants
export const MTB_BAR_WIDTH_MIN = 720;
export const MTB_BAR_WIDTH_MAX = 820;
export const MTB_BAR_WIDTH_MULTIPLIER = 1.8;

// City handlebar width formula constants
export const CITY_BAR_WIDTH_MIN = 600;
export const CITY_BAR_WIDTH_MAX = 740;
export const CITY_BAR_WIDTH_MULTIPLIER = 1.6;

// Road/Gravel handlebar width additions by ambition
export const ROAD_BAR_WIDTH_ADDITIONS: Record<Ambition, number> = {
  comfort: 0,
  balanced: 0,
  performance: 0,
  aero: 0,
};

export const GRAVEL_BAR_WIDTH_ADDITIONS: Record<Ambition, number> = {
  comfort: 40,
  balanced: 30,
  performance: 20,
  aero: 20,
};

// ============================================
// 5.3 Crank Length Table
// ============================================

export const CRANK_LENGTH_TABLE: Array<{ maxInseam: number; crankLength: number }> = [
  { maxInseam: 739, crankLength: 165 },
  { maxInseam: 819, crankLength: 170 },
  { maxInseam: 879, crankLength: 172.5 },
  { maxInseam: 939, crankLength: 175 },
  { maxInseam: Infinity, crankLength: 177.5 },
];

// ============================================
// 5.4 Saddle Height Adjustments
// ============================================

export const SADDLE_HEIGHT_AMBITION_OFFSETS: Record<Ambition, number> = {
  comfort: -4,
  balanced: 0,
  performance: 3,
  aero: 6,
};

// ============================================
// 5.5 Reach Ambition Offsets
// ============================================

export const REACH_AMBITION_OFFSETS: Record<Ambition, number> = {
  comfort: -20,
  balanced: 0,
  performance: 10,
  aero: 25,
};

// ============================================
// 5.6 Experience Level Modifiers (for bar drop)
// ============================================

export const EXPERIENCE_DROP_MODIFIERS: Record<string, number> = {
  beginner: -10,
  intermediate: 0,
  advanced: 5,
};

// ============================================
// Clamp Ranges by Category
// ============================================

export const BAR_DROP_CLAMP_RANGES: Record<BikeCategory, { min: number; max: number }> = {
  road: { min: 40, max: 150 },
  gravel: { min: 20, max: 120 },
  mtb: { min: -10, max: 70 },
  city: { min: -140, max: 40 },
};

export const REACH_CLAMP_RANGES: Record<BikeCategory, { min: number; max: number }> = {
  road: { min: 470, max: 630 },
  gravel: { min: 450, max: 610 },
  mtb: { min: 380, max: 540 },
  city: { min: 300, max: 480 },
};

// ============================================
// 6.3 Default Cockpit Parts (for frame sizing)
// ============================================

export const DEFAULT_COCKPIT: Record<
  BikeCategory,
  { stemLength: number; stemAngle: number; spacerStack: number }
> = {
  road: { stemLength: 100, stemAngle: -6, spacerStack: 15 },
  gravel: { stemLength: 90, stemAngle: -6, spacerStack: 20 },
  mtb: { stemLength: 50, stemAngle: 0, spacerStack: 10 },
  city: { stemLength: 80, stemAngle: 10, spacerStack: 25 },
};

// Stem options for solving
export const STEM_LENGTH_OPTIONS = [60, 70, 80, 90, 100, 110, 120, 130];

export const STEM_ANGLE_OPTIONS: Record<BikeCategory, number[]> = {
  road: [-17, -10, -6, 0, 6],
  gravel: [-17, -10, -6, 0, 6],
  mtb: [-6, 0, 6, 10, 17],
  city: [-6, 0, 6, 10, 17],
};

export const SPACER_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40];

// Top cap default
export const TOP_CAP_MM = 10;

// ============================================
// 8. Injury Risk Thresholds
// ============================================

export const SADDLE_HEIGHT_HIGH_RISK_RATIO = 0.89; // SH > inseam * 0.890
export const SADDLE_HEIGHT_LOW_RISK_RATIO = 0.865; // SH < inseam * 0.865

export const DROP_RISK_FLEX_THRESHOLD = 3; // FS <= 3
export const DROP_RISK_DROP_THRESHOLD = 90; // BD > 90mm

export const DROP_RISK_CORE_THRESHOLD = 3; // CS <= 3
export const DROP_RISK_CORE_DROP_THRESHOLD = 80; // BD > 80mm

// ============================================
// Validation Limits
// ============================================

export const HEIGHT_MIN_MM = 1300;
export const HEIGHT_MAX_MM = 2100;
export const INSEAM_MIN_MM = 550;
export const INSEAM_MAX_MM = 1050;

export const INSEAM_RATIO_MIN = 0.4;
export const INSEAM_RATIO_MAX = 0.52;

export const TORSO_MIN_MM = 450;
export const TORSO_MAX_MM = 750;
export const ARM_MIN_MM = 450;
export const ARM_MAX_MM = 750;
