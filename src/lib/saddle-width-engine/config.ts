import type { SaddleRidingType } from "./types";

export const POSTURE_ADDITIONS_MM: Record<0 | 1 | 2 | 3 | 4, number> = {
  0: 10,
  1: 15,
  2: 20,
  3: 25,
  4: 30,
};

export const BIKE_TYPE_ADJUSTMENTS_MM: Record<SaddleRidingType, number> = {
  tt_triathlon: -3,
  road_race: 0,
  endurance_road: 2,
  gravel: 3,
  mtb: 4,
  commuter_leisure: 6,
  indoor_only: 2,
};

export const SYMPTOM_DELTAS_MM = {
  numbness_or_pressure: 6,
  chafing_or_blockage: -6,
  neutral: 0,
} as const;

export const WIDTH_BINS: Array<{ label: string; min: number; max: number }> = [
  { label: "XS", min: 125, max: 135 },
  { label: "S", min: 136, max: 145 },
  { label: "M", min: 146, max: 155 },
  { label: "L", min: 156, max: 165 },
  { label: "XL", min: 166, max: 175 },
  { label: "XXL", min: 176, max: 190 },
];

export const CONFIDENCE_WEIGHTS = {
  measuredBase: 95,
  estimatedBase: 55,
  missingRidingType: -5,
  missingPosture: -5,
  conflictingSymptoms: -10,
  partialProfileData: -5,
} as const;

export const SIT_BONE_WIDTH_RANGE = { min: 60, max: 200 } as const;
export const HIP_CIRCUMFERENCE_RANGE = { min: 70, max: 160 } as const;
