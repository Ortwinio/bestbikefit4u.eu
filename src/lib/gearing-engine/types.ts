import type { BikeType } from "../bikes";

export type GearingDrivetrainType = "1x" | "2x";

export type GearingConfidenceLevel = "high" | "medium" | "low";

export type GearingLengthBand = "short" | "medium" | "long" | "alpine";

export type GearingSurfaceType =
  | "road"
  | "gravel"
  | "mtb"
  | "commuter"
  | "indoor"
  | "mixed";

export type GearingRideIntent =
  | "mountain_sportive"
  | "alpine_holiday"
  | "gran_fondo"
  | "local_hilly_ride"
  | "fast_club_ride"
  | "bikepacking"
  | "race";

export type GearingReadinessLabel =
  | "suitable"
  | "challenging"
  | "likely_overgeared";

export type GearingSetupLabel =
  | "comfort-oriented climbing setup"
  | "balanced sportive setup"
  | "performance climbing setup"
  | "race gearing"
  | "undergeared on the flat but mountain-ready"
  | "overgeared for Alpine use"
  | "needs bailout gear";

export type BikeGearingSource = "user_entered" | "preset" | "derived" | "imported";

export type BikeGearingCompleteness = "missing" | "partial" | "complete" | "validated";

export interface BikeGearingInput {
  drivetrainType?: GearingDrivetrainType;
  chainrings?: number[] | null;
  cassetteTeeth?: number[] | null;
  wheelCircumferenceMm?: number | null;
  crankLengthMm?: number | null;
  groupsetName?: string | null;
  derailleurMaxCog?: number | null;
  completeness?: BikeGearingCompleteness;
  source?: BikeGearingSource;
  updatedAt?: number | null;
}

export interface BikeGearingRecord {
  drivetrainType?: GearingDrivetrainType;
  chainrings?: number[];
  cassetteTeeth?: number[];
  wheelCircumferenceMm?: number;
  crankLengthMm?: number;
  groupsetName?: string;
  derailleurMaxCog?: number;
  completeness?: BikeGearingCompleteness;
  source?: BikeGearingSource;
  updatedAt?: number;
}

export interface GearingGearPair {
  frontChainringTeeth: number;
  rearCogTeeth: number;
  ratio: number;
  developmentM: number;
  gearInches: number;
  gainRatio?: number;
  speedKmhAtCadence?: number;
  cadenceRpmAtSpeed?: number;
}

export interface GearingMathInput {
  drivetrainType: GearingDrivetrainType;
  chainrings: number[];
  cassetteTeeth: number[];
  wheelCircumferenceMm: number;
  crankLengthMm?: number;
  cadenceRpm?: number;
  targetSpeedKmh?: number;
}

export interface GearingMathResult {
  drivetrainType: GearingDrivetrainType;
  normalizedChainrings: number[];
  normalizedCassetteTeeth: number[];
  wheelCircumferenceMm: number;
  wheelDiameterInches: number;
  wheelRadiusMm: number;
  gearPairs: GearingGearPair[];
  easiestGear: GearingGearPair;
  hardestGear: GearingGearPair;
  rangeRatio: number;
  rangePercent: number;
}

export interface GearingRiderInput {
  riderWeightKg?: number;
  bikeWeightKg?: number;
  ftpWatts?: number;
  preferredCadenceRpm?: number;
  comfortableCadenceMinRpm?: number;
  comfortableCadenceMaxRpm?: number;
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  weeklyTrainingHours?: number;
}

export interface GearingRouteInput {
  climbGradientPct?: number;
  climbMaxGradientPct?: number;
  climbLengthKm?: number;
  climbLengthBand?: GearingLengthBand;
  elevationGainM?: number;
}

export interface GearingContextInput {
  bikeType?: BikeType;
  surfaceType?: GearingSurfaceType;
  eventType?: string;
  rideIntent?: GearingRideIntent | string;
  preference?: string;
  alpineFlag?: boolean;
  rearDerailleurMaxCog?: number;
}

export interface GearingAnalysisInput
  extends GearingMathInput,
    GearingRiderInput,
    GearingRouteInput,
    GearingContextInput {}

export interface GearingConfidence {
  score: number;
  level: GearingConfidenceLevel;
  mathScore: number;
  suitabilityScore: number;
  reasons: string[];
}

export interface GearingSuitabilityResult {
  publicVerdict: GearingReadinessLabel;
  setupLabel: GearingSetupLabel;
  gearRangeScore: number;
  climbSuitabilityScore: number;
  eventReadinessScore: number;
  requiredPowerWatts?: number;
  sustainablePowerWatts?: number;
  powerGapWatts?: number;
  estimatedClimbDurationMinutes?: number;
  preferredCadenceFeasible?: boolean;
  cadenceNeededAtSustainablePowerRpm?: number;
  assumptions: string[];
  warnings: string[];
  recommendationText: string;
  confidence: GearingConfidence;
}

export interface GearingAnalysisResult {
  math: GearingMathResult;
  suitability: GearingSuitabilityResult;
}
