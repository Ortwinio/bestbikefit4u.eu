import { v } from "convex/values";
import type { Infer } from "convex/values";

const category = v.union(v.literal("road"), v.literal("gravel"), v.literal("mtb"), v.literal("city"));
const saddleHeight = v.object({
  inseamCm: v.number(), source: v.union(v.literal("missing"), v.literal("measured"), v.literal("estimated")),
  category, ambition: v.union(v.literal("comfort"), v.literal("balanced"), v.literal("performance"), v.literal("aero")),
  flexibility: v.number(), core: v.number(), compare: v.boolean(), current: v.number(), currentConfirmed: v.boolean(),
});
const frameSize = v.object({
  heightCm: v.number(), inseamCm: v.number(), heightConfirmed: v.boolean(), inseamConfirmed: v.boolean(), category,
});
const crankLength = v.object({ inseamCm: v.number(), category, confirmed: v.boolean() });
export const bikeFitValues = v.object({
  heightCm: v.number(), inseamCm: v.number(),
  source: v.union(v.literal("missing"), v.literal("measured"), v.literal("estimated")),
  category, ambition: v.union(v.literal("comfort"), v.literal("balanced"), v.literal("performance"), v.literal("aero")),
  flexibility: v.number(), core: v.number(),
});

export const performanceValues = v.object({
  values: v.object({ power: v.number(), speed: v.number(), riderMass: v.number(), bikeMass: v.number(),
    gradient: v.number(), climbGradient: v.number(), distance: v.number(), ftp: v.number(),
    twentyMinute: v.number(), ramp: v.number(), duration: v.number(),
    temperature: v.number(), bottleSize: v.number() }),
  bike: v.union(v.literal("road"), v.literal("gravel"), v.literal("mountain"),
    v.literal("city"), v.literal("tt_triathlon")),
  surface: v.union(v.literal("road"), v.literal("gravel"), v.literal("mtb"), v.literal("commuter")),
  mode: v.union(v.literal("power"), v.literal("speed")),
  comparison: v.union(v.literal("both"), v.literal("men"), v.literal("women")),
  method: v.union(v.literal("known"), v.literal("twentyMinute"), v.literal("ramp")),
  intensity: v.union(v.literal("easy"), v.literal("endurance"), v.literal("tempo"), v.literal("race")),
  sweat: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
});
export type PerformanceValues = Infer<typeof performanceValues>;

/** Extend the discriminated union alongside the shared client validation/default registry. */
export const calculatorState = v.union(
  v.object({ calculator: v.literal("power-speed"), values: performanceValues }),
  v.object({ calculator: v.literal("climb-planner"), values: performanceValues }),
  v.object({ calculator: v.literal("ftp-wkg"), values: performanceValues }),
  v.object({ calculator: v.literal("fuel-hydration"), values: performanceValues }),

  v.object({ calculator: v.literal("saddle-height"), values: saddleHeight }),
  v.object({ calculator: v.literal("frame-size"), values: frameSize }),
  v.object({ calculator: v.literal("crank-length"), values: crankLength }),
  v.object({ calculator: v.literal("bike-fit"), values: bikeFitValues }),
);
export const calculatorId = v.union(
  v.literal("power-speed"), v.literal("climb-planner"), v.literal("ftp-wkg"), v.literal("fuel-hydration"),
  v.literal("saddle-height"), v.literal("frame-size"), v.literal("crank-length"),
  v.literal("bike-fit"),
);
export type CalculatorState = Infer<typeof calculatorState>;
export type CalculatorId = CalculatorState["calculator"];
export type CalculatorValuesMap = { [S in CalculatorState as S["calculator"]]: S["values"] };
export type CalculatorValues<K extends CalculatorId> = CalculatorValuesMap[K];
