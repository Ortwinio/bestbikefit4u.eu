import { v } from "convex/values";
import { bikeEditRanges } from "../../shared/bikeEditValidation";
import { PROFILE_OBSERVATION_FIELDS, validateProfileObservationValue } from "../../shared/profileObservationFields";

export const calculator = v.union(...[
  "bike-fit", "saddle-height", "frame-size", "crank-length", "saddle-width", "tire-pressure",
  "gearing", "power-speed", "climb-planner", "ftp-wkg", "fuel-hydration", "shoe-cleat-fit",
].map(value => v.literal(value)));
export const changeValue = v.union(v.number(), v.string(), v.array(v.string()), v.array(v.number()));
export const kindValidator = v.union(v.literal("measured"), v.literal("estimated"), v.literal("declared"), v.literal("derived"));

const bikeRanges: Record<string, readonly [number, number]> = {
  ...Object.fromEntries(Object.entries(bikeEditRanges).flatMap(([group, fields]) =>
    Object.entries(fields).map(([field, range]) => [`${group}.${field}`, range]))),
  bikeWeightKg: [3, 20], saddleWidthMm: [90, 260],
  "tires.widthFrontMm": [18, 80], "tires.widthRearMm": [18, 80],
};
const bikeOptions: Record<string, readonly string[]> = {
  bikeType: ["road", "gravel", "mountain", "hybrid", "tt_triathlon", "cyclocross", "touring", "city"],
  primaryGoal: ["comfort", "balanced", "performance", "aerodynamics"],
  "tires.tubeType": ["inner_tube", "latex_tube", "tubeless"],
  "gearing.drivetrainType": ["1x", "2x"],
};
const bikeArrays = new Set(["gearing.chainrings", "gearing.cassetteTeeth"]);
export function chainField(field: string, value: unknown) {
  if (Object.hasOwn(PROFILE_OBSERVATION_FIELDS, field)) return {
    source: "profile" as const, value: validateProfileObservationValue(field, value),
    unit: PROFILE_OBSERVATION_FIELDS[field].unit,
  };
  const range = Object.hasOwn(bikeRanges, field) ? bikeRanges[field] : undefined;
  if (range) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < range[0] || value > range[1]) {
      throw new Error("Invalid bike value");
    }
  } else if (bikeArrays.has(field)) {
    const max = field === "gearing.chainrings" ? 3 : 14;
    if (!Array.isArray(value) || !value.length || value.length > max || value.some(item =>
      typeof item !== "number" || !Number.isInteger(item) || item < 1 || item > 100)) {
      throw new Error("Invalid gearing value");
    }
  } else if (Object.hasOwn(bikeOptions, field)) {
    if (typeof value !== "string" || !bikeOptions[field].includes(value)) throw new Error("Invalid bike option");
  } else if (field === "saddleModel" || field === "currentGeometry.frameSize") {
    if (typeof value !== "string" || !value.trim() || value.length > 100) throw new Error("Invalid bike text");
  } else throw new Error("Unsupported calculator field");
  return { source: "bike" as const, value: value as number | string | number[],
    unit: field === "bikeWeightKg" ? "kg" : field.endsWith("Mm") ? "mm"
      : field.endsWith("Angle") ? "degrees" : bikeArrays.has(field) ? "teeth" : "none" };
}
