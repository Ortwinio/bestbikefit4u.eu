import { bikeEditRanges } from "./bikeEditValidation";

export const BIKE_MEASURE_POINTS: Record<string, string> = {
  "currentSetup.saddleHeightMm": "bb_center_to_saddle_top",
  "currentSetup.saddleSetbackMm": "saddle_nose_behind_bb",
  "currentSetup.handlebarReachMm": "saddle_nose_to_bar_center",
  "currentSetup.handlebarDropMm": "saddle_top_to_bar_top",
  "currentSetup.stemLengthMm": "steerer_center_to_bar_center",
  "currentSetup.stemAngle": "stem_axis_degrees",
  "currentSetup.handlebarWidthMm": "bar_center_to_center",
  "currentSetup.crankLengthMm": "bb_center_to_pedal_center",
  "currentSetup.spacersMm": "below_stem_stack",
  "currentGeometry.stackMm": "bb_center_to_headtube_top_vertical",
  "currentGeometry.reachMm": "bb_center_to_headtube_top_horizontal",
  "currentGeometry.seatTubeAngle": "seat_tube_axis_degrees",
  "currentGeometry.headTubeAngle": "head_tube_axis_degrees",
  maxSeatpostMm: "component_marking", maxSpacerStackMm: "component_marking",
  saddleWidthMm: "saddle_widest_point",
};
export const BIKE_PROFILE_FIELDS: Record<string, {
  range?: readonly [number, number]; options?: readonly string[]; unit: string;
}> = {
  ...Object.fromEntries(Object.entries(bikeEditRanges).filter(([group]) => group !== "gearing")
    .flatMap(([group, fields]) => Object.entries(fields).map(([field, range]) =>
      [`${group}.${field}`, { range, unit: field.endsWith("Mm") ? "mm" : "degrees" }]))),
  "currentSetup.handlebarReachMm": { range: [200, 1000], unit: "mm" },
  "currentSetup.handlebarDropMm": { range: [-200, 300], unit: "mm" },
  "currentSetup.spacersMm": { range: [0, 100], unit: "mm" },
  "currentGeometry.frameSize": { unit: "none" },
  maxSeatpostMm: { range: [0, 500], unit: "mm" }, maxSpacerStackMm: { range: [0, 100], unit: "mm" },
  saddleWidthMm: { range: [90, 260], unit: "mm" },
  saddleModel: { unit: "none" }, pedalModel: { unit: "none" }, cleatSystem: { unit: "none" },
  primaryGoal: { unit: "none", options: ["comfort", "balanced", "performance", "aerodynamics"] },
};
export function validateBikeProfileField(field: string, value: unknown): number | string {
  if (!Object.hasOwn(BIKE_PROFILE_FIELDS, field)) throw new Error("Unsupported bike profile field");
  const definition = BIKE_PROFILE_FIELDS[field];
  if (definition.range) {
    if (typeof value !== "number" || !Number.isFinite(value)
      || value < definition.range[0] || value > definition.range[1]) throw new Error("Invalid bike profile value");
    return value;
  }
  if (typeof value !== "string" || !value.trim() || value.length > 100
    || (definition.options && !definition.options.includes(value))) throw new Error("Invalid bike profile value");
  return value.trim();
}
