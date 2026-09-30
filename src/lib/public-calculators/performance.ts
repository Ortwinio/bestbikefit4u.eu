import {
  DEFAULT_BIKE_MASS_KG_BY_TYPE,
  DEFAULT_CDA_BY_BIKE_TYPE,
  DEFAULT_CRR_BY_SURFACE,
  DEFAULT_DURATION_MULTIPLIER_BY_BAND,
} from "@/lib/gearing-engine/config";
import { calculateClimbPowerWatts, solveSpeedForPowerWatts } from "@/lib/gearing-engine/math";

// UI contracts approved 2026-09-30 in plans/redesign-canvas/05-new-tool-contracts.md.
export const TOOL_RANGES = {
  power: { min: 50, max: 600, step: 5, initial: 200 },
  speed: { min: 10, max: 50, step: 0.5, initial: 30 },
  riderMass: { min: 40, max: 150, step: 0.5, initial: 75 },
  bikeMass: { min: 3, max: 20, step: 0.5, initial: 8.5 },
  gradient: { min: 0, max: 15, step: 0.5, initial: 0 },
  climbGradient: { min: 2, max: 15, step: 0.5, initial: 7 },
  distance: { min: 1, max: 30, step: 0.5, initial: 5 },
  ftp: { min: 80, max: 500, step: 5, initial: 200 },
  twentyMinute: { min: 100, max: 550, step: 5, initial: 250 },
  ramp: { min: 150, max: 700, step: 5, initial: 320 },
  duration: { min: 0.5, max: 8, step: 0.25, initial: 2 },
  temperature: { min: 0, max: 40, step: 1, initial: 20 },
  bottleSize: { min: 500, max: 750, step: 50, initial: 500 },
} as const;

export type PerformanceBike = "road" | "gravel" | "mountain" | "city" | "tt_triathlon";
export type PerformanceSurface = "road" | "gravel" | "mtb" | "commuter";
export type FtpMethod = "known" | "twentyMinute" | "ramp";
export const FTP_TEST_FACTORS = { known: 1, twentyMinute: 0.95, ramp: 0.75 } as const;
export const SPEED_DOMAIN_KMH = { min: 0.36, max: 54 } as const;
export const REFERENCE_CLIMB = { distanceKm: 5, gradientPct: 7 } as const;

function range(value: number, key: keyof typeof TOOL_RANGES) {
  const { min, max } = TOOL_RANGES[key];
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${key} must be between ${min} and ${max}.`);
  }
  return value;
}

export function bikeDefaults(bike: PerformanceBike) {
  if (!Object.hasOwn(DEFAULT_CDA_BY_BIKE_TYPE, bike)) throw new RangeError("Unknown bike type.");
  return {
    bikeMassKg: DEFAULT_BIKE_MASS_KG_BY_TYPE[bike],
    cda: DEFAULT_CDA_BY_BIKE_TYPE[bike],
    surface: (bike === "mountain"
      ? "mtb"
      : bike === "gravel"
        ? "gravel"
        : bike === "city"
          ? "commuter"
          : "road") as PerformanceSurface,
  };
}

export interface RidingConditions {
  riderMassKg: number;
  bikeMassKg: number;
  bike: PerformanceBike;
  surface: PerformanceSurface;
  gradientPct: number;
}

function physics(input: RidingConditions) {
  range(input.riderMassKg, "riderMass");
  range(input.bikeMassKg, "bikeMass");
  range(input.gradientPct, "gradient");
  if (!Object.hasOwn(DEFAULT_CRR_BY_SURFACE, input.surface)) throw new RangeError("Unknown surface.");
  return {
    totalMassKg: input.riderMassKg + input.bikeMassKg,
    gradientPct: input.gradientPct,
    cda: bikeDefaults(input.bike).cda,
    crr: DEFAULT_CRR_BY_SURFACE[input.surface],
  };
}

export function powerAtSpeed(input: RidingConditions, speedKmh: number) {
  range(speedKmh, "speed");
  return calculateClimbPowerWatts({ ...physics(input), velocityMps: speedKmh / 3.6 });
}

// Decompose using the same helper, so constants and drivetrain losses cannot diverge.
export function powerSplit(input: RidingConditions, speedKmh: number) {
  if (!Number.isFinite(speedKmh) || speedKmh < SPEED_DOMAIN_KMH.min || speedKmh > SPEED_DOMAIN_KMH.max) {
    throw new RangeError("Speed is outside the physics solver domain.");
  }
  const args = { ...physics(input), velocityMps: speedKmh / 3.6 };
  const climbing = calculateClimbPowerWatts({ ...args, crr: 0, cda: 0 });
  const climbingAndRolling = calculateClimbPowerWatts({ ...args, cda: 0 });
  const total = calculateClimbPowerWatts(args);
  return { climbing, rolling: climbingAndRolling - climbing, air: total - climbingAndRolling, total };
}

export function speedAtPower(input: RidingConditions, powerWatts: number) {
  // Climb pacing and FTP conversions can extend beyond the power slider's 50–600 W range.
  if (!Number.isFinite(powerWatts) || powerWatts <= 0 || powerWatts > 1000) {
    throw new RangeError("Power must be positive and no more than 1000 W.");
  }
  const args = physics(input);
  const lowPower = calculateClimbPowerWatts({ ...args, velocityMps: 0.1 });
  const highPower = calculateClimbPowerWatts({ ...args, velocityMps: 15 });
  const limit = powerWatts < lowPower ? "below" : powerWatts > highPower ? "above" : null;
  const speedKmh = solveSpeedForPowerWatts({ ...args, targetPowerWatts: powerWatts }) * 3.6;
  return { speedKmh, limit, split: powerSplit(input, speedKmh) };
}

export function climbPlan(input: {
  distanceKm: number;
  gradientPct: number;
  ftpWatts: number;
  riderMassKg: number;
  bike: PerformanceBike;
}) {
  range(input.distanceKm, "distance");
  range(input.gradientPct, "climbGradient");
  range(input.ftpWatts, "ftp");
  const band =
    input.distanceKm < 3
      ? "short"
      : input.distanceKm < 8
        ? "medium"
        : input.distanceKm < 20
          ? "long"
          : "alpine";
  const multiplier = DEFAULT_DURATION_MULTIPLIER_BY_BAND[band];
  const targetPowerWatts = input.ftpWatts * Math.min(multiplier, 1.1);
  const defaults = bikeDefaults(input.bike);
  const result = speedAtPower({ ...input, ...defaults }, targetPowerWatts);
  return {
    ...result,
    band,
    multiplier,
    targetPowerWatts,
    minutes: result.limit ? null : (input.distanceKm / result.speedKmh) * 60,
  };
}

export function ftpEstimate(method: FtpMethod, watts: number, riderMassKg: number) {
  if (!Object.hasOwn(FTP_TEST_FACTORS, method)) throw new RangeError("Unknown FTP method.");
  range(watts, method === "known" ? "ftp" : method);
  range(riderMassKg, "riderMass");
  const ftpWatts = watts * FTP_TEST_FACTORS[method];
  const conditions: RidingConditions = {
    riderMassKg,
    bikeMassKg: DEFAULT_BIKE_MASS_KG_BY_TYPE.road,
    bike: "road",
    surface: "road",
    gradientPct: 0,
  };
  const flat = speedAtPower(conditions, ftpWatts);
  const climb = speedAtPower({ ...conditions, gradientPct: REFERENCE_CLIMB.gradientPct }, ftpWatts);
  return {
    ftpWatts,
    wattsPerKg: ftpWatts / riderMassKg,
    flat,
    climbMinutes: climb.limit ? null : (REFERENCE_CLIMB.distanceKm / climb.speedKmh) * 60,
  };
}

// Jeukendrup 2014, Figure 1. The longer-duration band wins where the published bands overlap.
export function carbohydrateGuidance(durationHours: number) {
  if (!Number.isFinite(durationHours) || durationHours < 0 || durationHours > TOOL_RANGES.duration.max) {
    throw new RangeError("Duration must be between 0 and 8 hours.");
  }
  const band = durationHours < 0.5 ? "none"
    : durationHours < 1 ? "small"
      : durationHours < 2 ? "upTo30"
        : durationHours <= 2.5 ? "upTo60" : "upTo90";
  const gramsPerHour = band === "none" ? 0 : band === "small" ? null
    : band === "upTo30" ? 30 : band === "upTo60" ? 60 : 90;
  return {
    band,
    gramsPerHour,
    totalGrams: gramsPerHour === null ? null : gramsPerHour * durationHours,
    requiresMultipleCarbohydrates: band === "upTo90",
  };
}

// Sawka et al., ACSM 2007: fluid 0.4–0.8 L/h; sports-drink sodium concentration 20–30 mmol/L.
// The corrected tool contract displays sodium only for rides longer than 1 h.
// Using approximately 23 mg/mmol converts the sodium concentration to 460–690 mg/L.
// The selected position is a UI heuristic, not a sweat measurement.
export const HYDRATION_BANDS = {
  fluidLitresPerHour: { min: 0.4, max: 0.8 },
  sodiumMgPerLitre: { min: 460, max: 690 },
} as const;
export type SweatLevel = "low" | "medium" | "high";

export function fuelHydration(input: {
  durationHours: number;
  temperatureC: number;
  sweat: SweatLevel;
  bottleSizeMl: number;
}) {
  range(input.durationHours, "duration");
  range(input.temperatureC, "temperature");
  range(input.bottleSizeMl, "bottleSize");
  const sweatPositions = { low: 0, medium: 0.5, high: 1 } as const;
  if (!Object.hasOwn(sweatPositions, input.sweat)) throw new RangeError("Unknown sweat level.");
  const position = (input.temperatureC / TOOL_RANGES.temperature.max + sweatPositions[input.sweat]) / 2;
  const fluid = HYDRATION_BANDS.fluidLitresPerHour;
  const sodium = input.durationHours > 1 ? HYDRATION_BANDS.sodiumMgPerLitre : null;
  const selectedFluidLitresPerHour = fluid.min + position * (fluid.max - fluid.min);
  const totalFluidLitres = { min: fluid.min * input.durationHours, max: fluid.max * input.durationHours };
  const bottleLitres = input.bottleSizeMl / 1000;
  return {
    carbohydrate: carbohydrateGuidance(input.durationHours),
    fluidLitresPerHour: fluid,
    sodiumMgPerLitre: sodium,
    sodiumMgPerBottle: sodium ? { min: sodium.min * bottleLitres, max: sodium.max * bottleLitres } : null,
    position,
    positionBasis: "heuristic-not-measurement" as const,
    selectedFluidLitresPerHour,
    totalFluidLitres,
    bottles: { min: totalFluidLitres.min / bottleLitres, max: totalFluidLitres.max / bottleLitres },
    selectedBottles: selectedFluidLitresPerHour * input.durationHours / bottleLitres,
    markersMinutes: [0, input.durationHours * 30, input.durationHours * 60],
  };
}

export type FtpRating = "superior" | "excellent" | "good" | "fair" | "untrained";
export type FtpComparison = "men" | "women";
// Allen & Coggan (2010), as published in Garmin's FTP ratings. Compare unrounded W/kg with lower bounds.
export const FTP_RATING_THRESHOLDS = {
  men: [
    { rating: "superior", min: 5.05 },
    { rating: "excellent", min: 3.93 },
    { rating: "good", min: 2.79 },
    { rating: "fair", min: 2.23 },
    { rating: "untrained", min: 0 },
  ],
  women: [
    { rating: "superior", min: 4.3 },
    { rating: "excellent", min: 3.33 },
    { rating: "good", min: 2.36 },
    { rating: "fair", min: 1.9 },
    { rating: "untrained", min: 0 },
  ],
} as const;

export function ftpRating(wattsPerKg: number, comparison: FtpComparison): FtpRating {
  if (!Number.isFinite(wattsPerKg) || wattsPerKg < 0) throw new RangeError("W/kg must be finite and nonnegative.");
  if (!Object.hasOwn(FTP_RATING_THRESHOLDS, comparison)) throw new RangeError("Unknown FTP comparison table.");
  return FTP_RATING_THRESHOLDS[comparison].find(({ min }) => wattsPerKg >= min)!.rating;
}

export function fuelTimeline(durationHours: number, temperatureC: number) {
  range(durationHours, "duration");
  range(temperatureC, "temperature");
  return { markersMinutes: [0, durationHours * 30, durationHours * 60] };
}
