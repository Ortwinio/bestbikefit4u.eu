import {
  DEFAULT_BIKE_MASS_KG_BY_TYPE,
  DEFAULT_CDA_BY_BIKE_TYPE,
  DEFAULT_CRR_BY_SURFACE,
  DEFAULT_DURATION_MULTIPLIER_BY_BAND,
} from "@/lib/gearing-engine/config";
import { calculateClimbPowerWatts, solveSpeedForPowerWatts } from "@/lib/gearing-engine/math";

// Proposed UI contracts from plans/redesign-canvas/05-new-tool-contracts.md; awaiting approval.
export const PROPOSED_RANGES = {
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
} as const;

export type PerformanceBike = "road" | "gravel" | "mountain" | "city" | "tt_triathlon";
export type PerformanceSurface = "road" | "gravel" | "mtb" | "commuter";
export type FtpMethod = "known" | "twentyMinute" | "ramp";
export const PROPOSED_FTP_FACTORS = { known: 1, twentyMinute: 0.95, ramp: 0.75 } as const;
export const SPEED_DOMAIN_KMH = { min: 0.36, max: 54 } as const;
export const REFERENCE_CLIMB = { distanceKm: 5, gradientPct: 7 } as const;

function range(value: number, key: keyof typeof PROPOSED_RANGES) {
  const { min, max } = PROPOSED_RANGES[key];
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
  // Climb pacing and proposed FTP conversions can extend beyond the power slider's 50–600 W range.
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
  if (!Object.hasOwn(PROPOSED_FTP_FACTORS, method)) throw new RangeError("Unknown FTP method.");
  range(watts, method === "known" ? "ftp" : method);
  range(riderMassKg, "riderMass");
  const ftpWatts = watts * PROPOSED_FTP_FACTORS[method];
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

export function fuelTimeline(durationHours: number, temperatureC: number) {
  range(durationHours, "duration");
  range(temperatureC, "temperature");
  // Progress markers only, NOT invented food/drink doses or recommended intake intervals.
  return { adviceAvailable: false as const, markersMinutes: [0, durationHours * 30, durationHours * 60] };
}
