import type { BikeType } from "../bikes";
import type { GearingLengthBand, GearingSurfaceType } from "./types";

export const DEFAULT_GEARING_ALGORITHM_VERSION = "gearing-v1";

export const DEFAULT_DRIVETRAIN_EFFICIENCY = 0.97;

export const DEFAULT_AIR_DENSITY_KG_PER_M3 = 1.225;

export const DEFAULT_GRAVITY_MPS2 = 9.80665;

export const DEFAULT_BIKE_MASS_KG_BY_TYPE: Record<BikeType, number> = {
  road: 8.5,
  gravel: 10,
  mountain: 12.5,
  hybrid: 11.5,
  tt_triathlon: 8,
  cyclocross: 9.5,
  touring: 13,
  city: 14,
};

export const DEFAULT_CDA_BY_BIKE_TYPE: Record<BikeType, number> = {
  road: 0.32,
  gravel: 0.38,
  mountain: 0.5,
  hybrid: 0.42,
  tt_triathlon: 0.24,
  cyclocross: 0.4,
  touring: 0.45,
  city: 0.48,
};

export const DEFAULT_CRR_BY_SURFACE: Record<GearingSurfaceType, number> = {
  road: 0.0045,
  gravel: 0.0065,
  mtb: 0.0105,
  commuter: 0.0055,
  indoor: 0.0035,
  mixed: 0.0055,
};

export const DEFAULT_RANGE_TARGET_BY_BIKE_TYPE: Record<BikeType, number> = {
  road: 4.5,
  gravel: 5.0,
  mountain: 5.8,
  hybrid: 4.8,
  tt_triathlon: 4.0,
  cyclocross: 4.8,
  touring: 5.2,
  city: 4.4,
};

export const DEFAULT_DURATION_MINUTES_BY_BAND: Record<GearingLengthBand, number> = {
  short: 6,
  medium: 14,
  long: 40,
  alpine: 75,
};

export const DEFAULT_DURATION_MULTIPLIER_BY_BAND: Record<GearingLengthBand, number> = {
  short: 1.1,
  medium: 1.0,
  long: 0.9,
  alpine: 0.82,
};

export const DEFAULT_COMFORT_CADENCE_MIN_RPM = 75;
export const DEFAULT_COMFORT_CADENCE_MAX_RPM = 95;

export const DEFAULT_CLIMB_GRADIENTS_BY_BAND: Record<GearingLengthBand, number> = {
  short: 10,
  medium: 8,
  long: 7,
  alpine: 9,
};

export const DEFAULT_CLIMB_LENGTH_BAND_ORDER: GearingLengthBand[] = [
  "short",
  "medium",
  "long",
  "alpine",
];

export function getDefaultBikeMassKg(bikeType?: BikeType) {
  return bikeType ? DEFAULT_BIKE_MASS_KG_BY_TYPE[bikeType] : 10;
}

export function getDefaultCdA(bikeType?: BikeType) {
  return bikeType ? DEFAULT_CDA_BY_BIKE_TYPE[bikeType] : DEFAULT_CDA_BY_BIKE_TYPE.road;
}

export function getDefaultCrr(surfaceType?: GearingSurfaceType) {
  return surfaceType ? DEFAULT_CRR_BY_SURFACE[surfaceType] : DEFAULT_CRR_BY_SURFACE.road;
}

export function getDefaultRangeTarget(bikeType?: BikeType) {
  return bikeType ? DEFAULT_RANGE_TARGET_BY_BIKE_TYPE[bikeType] : DEFAULT_RANGE_TARGET_BY_BIKE_TYPE.road;
}

export function getDurationBandFromMinutes(minutes: number): GearingLengthBand {
  if (minutes < 8) return "short";
  if (minutes < 20) return "medium";
  if (minutes < 60) return "long";
  return "alpine";
}

export function getDurationMinutesForBand(band: GearingLengthBand) {
  return DEFAULT_DURATION_MINUTES_BY_BAND[band];
}

export function getDurationMultiplierForBand(band: GearingLengthBand) {
  return DEFAULT_DURATION_MULTIPLIER_BY_BAND[band];
}

export function getDefaultGradientPctForBand(band: GearingLengthBand) {
  return DEFAULT_CLIMB_GRADIENTS_BY_BAND[band];
}
