import type { Doc } from "../convex/_generated/dataModel";

export type MigrationObservation = {
  field: string;
  value: number | string | string[] | number[];
  unit: string;
  kind: "measured" | "estimated" | "derived" | "declared";
  method: string;
  recordedAt: number;
};

type FieldDefinition = readonly [field: string, unit: string, type: "number" | "string" | "strings" | "numbers"];

const profileFields: readonly FieldDefinition[] = [
  ...["heightCm", "inseamCm", "armLengthCm", "torsoLengthCm", "shoulderWidthCm", "femurLengthCm",
    "footLengthCm", "handSpanCm", "hipCircumferenceCm"].map(field => [field, "cm", "number"] as const),
  ["sitBoneWidthMm", "mm", "number"], ["weightKg", "kg", "number"], ["age", "none", "number"],
  ["flexibilityScore", "score", "string"], ["coreStabilityScore", "score", "number"],
  ["ftpWatts", "W", "number"], ["shoeSizeEu", "none", "number"],
  ...["ftpMethod", "cleatSystem", "sweatProfile", "experienceLevel", "weeklyHours", "typicalRideLength",
    "hasPain", "kneePainTiming", "positionPriority"].map(field => [field, "none", "string"] as const),
  ["painAreas", "none", "strings"], ["ridingDisciplines", "none", "strings"], ["painSeverity", "score", "number"],
];

const bikeFields: readonly FieldDefinition[] = [
  ...["bikeType", "brand", "model", "discipline", "ridingStyle", "primaryGoal", "saddleModel",
    "pedalModel", "cleatSystem"].map(field => [field, "none", "string"] as const),
  ["year", "year", "number"], ["bikeWeightKg", "kg", "number"],
  ...["saddleWidthMm", "maxSeatpostMm", "maxSpacerStackMm"].map(field => [field, "mm", "number"] as const),
  ...["stackMm", "reachMm"].map(field => [`currentGeometry.${field}`, "mm", "number"] as const),
  ...["seatTubeAngle", "headTubeAngle"].map(field => [`currentGeometry.${field}`, "degrees", "number"] as const),
  ["currentGeometry.frameSize", "none", "string"],
  ...["saddleHeightMm", "saddleSetbackMm", "stemLengthMm", "handlebarWidthMm", "crankLengthMm",
    "handlebarReachMm", "handlebarDropMm", "spacersMm"].map(field => [`currentSetup.${field}`, "mm", "number"] as const),
  ["currentSetup.stemAngle", "degrees", "number"],
  ["gearing.chainrings", "teeth", "numbers"], ["gearing.cassetteTeeth", "teeth", "numbers"],
  ["gearing.wheelCircumferenceMm", "mm", "number"], ["gearing.crankLengthMm", "mm", "number"],
  ["gearing.derailleurMaxCog", "teeth", "number"],
  ["gearing.drivetrainType", "none", "string"], ["gearing.groupsetName", "none", "string"],
  ["tires.widthFrontMm", "mm", "number"], ["tires.widthRearMm", "mm", "number"], ["tires.tubeType", "none", "string"],
];

const riderQuestionFields = new Set(["experienceLevel", "weeklyHours", "typicalRideLength", "hasPain",
  "painAreas", "painSeverity", "kneePainTiming", "positionPriority", "ridingDisciplines"]);
const signedOrZeroFields = new Set(["currentSetup.saddleSetbackMm", "currentSetup.handlebarDropMm",
  "currentSetup.stemAngle", "currentSetup.spacersMm", "maxSeatpostMm", "maxSpacerStackMm"]);

function read(document: object, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)[key] : undefined, document);
}

function timestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function validValue(value: unknown, field: FieldDefinition): value is MigrationObservation["value"] {
  if (field[2] === "number") return typeof value === "number" && Number.isFinite(value)
    && (value > 0 || signedOrZeroFields.has(field[0]));
  if (field[2] === "string") return typeof value === "string" && value.trim().length > 0 && value.length <= 256;
  if (!Array.isArray(value) || value.length > 64) return false;
  if (field[2] === "strings") return value.every(entry => typeof entry === "string" && entry.trim().length > 0 && entry.length <= 128);
  return value.length > 0 && value.every(entry => typeof entry === "number" && Number.isFinite(entry) && entry > 0);
}

function sourceDate(document: object, path?: string): number {
  const specific = path ? read(document, path) : undefined;
  const creation = read(document, "_creationTime");
  if (timestamp(specific)) return specific;
  if (timestamp(creation)) return creation;
  throw new Error("Legacy document has no valid source timestamp");
}

function profileEvidence(document: object, field: string): Pick<MigrationObservation, "kind" | "method" | "recordedAt"> {
  const recordedAt = sourceDate(document, field === "weightKg" ? "weightUpdatedAt"
    : ["ftpWatts", "ftpMethod"].includes(field) ? "ftpMeasuredAt" : riderQuestionFields.has(field) ? "riderProfileUpdatedAt" : undefined);
  const height = read(document, "heightCm");
  const value = read(document, field);
  const ratio = field === "armLengthCm" ? 0.44 : field === "torsoLengthCm" ? 0.32 : undefined;
  if (ratio && typeof height === "number" && typeof value === "number" && Math.abs(value - height * ratio) < 0.000001) {
    return { kind: "derived", method: "legacy_height_formula", recordedAt };
  }
  if (field === "shoulderWidthCm" && value === 42) return { kind: "estimated", method: "legacy_default", recordedAt };
  if (field === "ftpWatts") {
    const method = read(document, "ftpMethod");
    if (typeof method === "string" && method.trim() && method.length <= 128) {
      const derived = ["derived", "twentyMinute", "20-minute", "ramp"].includes(method);
      const measured = ["measured", "fitter", "video", "60-minute", "one-hour"].includes(method);
      return { kind: derived ? "derived" : measured ? "measured" : "estimated", method, recordedAt };
    }
  }
  const declared = riderQuestionFields.has(field) || ["age", "shoeSizeEu", "cleatSystem", "sweatProfile", "ftpMethod"].includes(field);
  return { kind: declared ? "declared" : "estimated", method: declared ? "legacy_declared" : "legacy_unknown", recordedAt };
}

function bikeEvidence(document: object, field: string, geometry?: object | null): Pick<MigrationObservation, "kind" | "method" | "recordedAt"> {
  const recordedAt = sourceDate(document, field.startsWith("gearing.") ? "gearing.updatedAt" : undefined);
  if (field === "currentSetup.saddleHeightMm"
    && read(document, "currentSetup.saddleHeightMeasurement.measurePoint") === "bb_center_to_saddle_top"
    && timestamp(read(document, "currentSetup.saddleHeightMeasurement.measuredAt"))) {
    return { kind: "measured", method: "bb_center_to_saddle_top",
      recordedAt: sourceDate(document, "currentSetup.saddleHeightMeasurement.measuredAt") };
  }
  if (field.startsWith("currentGeometry.") && geometry) {
    const geometryKeys: Record<string, string> = { stackMm: "stack", reachMm: "reach", frameSize: "sizeLabel",
      seatTubeAngle: "seatTubeAngle", headTubeAngle: "headTubeAngle" };
    const key = geometryKeys[field.split(".")[1]];
    if (key && read(document, field) === read(geometry, key)
      && read(geometry, "status") === "active"
      && ["manufacturer", "admin_import", "admin_manual"].includes(String(read(geometry, "source")))) {
      return { kind: "declared", method: "geometry_database", recordedAt };
    }
  }
  if (field.startsWith("gearing.")) {
    const source = read(document, "gearing.source");
    if (source === "derived") return { kind: "derived", method: "legacy_gearing_derived", recordedAt };
    if (source === "preset") return { kind: "estimated", method: "legacy_gearing_preset", recordedAt };
    if (source === "imported") return { kind: "estimated", method: "legacy_gearing_import", recordedAt };
  }
  if (field === "bikeType" && ["fallback_pending_confirmation", "inferred_from_usage"].includes(String(read(document, "bikeTypeSource")))) {
    return { kind: "derived", method: "legacy_bike_type_inference", recordedAt };
  }
  const inferredFields: Record<string, string> = { discipline: "inferredDiscipline", ridingStyle: "inferredRidingStyle", primaryGoal: "inferredPrimaryGoal" };
  const inferredField = inferredFields[field];
  if (inferredField && read(document, field) === read(document, `activitySummary.${inferredField}`)) {
    return { kind: "derived", method: "legacy_activity_inference", recordedAt: sourceDate(document, "activitySummary.syncedAt") };
  }
  const source = read(document, "source");
  if (["strava", "marketplace_import", "passport_import", "admin_import"].includes(String(source))) {
    return { kind: "estimated", method: source === "strava" ? "strava_import"
      : source === "marketplace_import" ? "listing_import" : String(source), recordedAt };
  }
  const declared = ["bikeType", "brand", "model", "year", "discipline", "ridingStyle", "primaryGoal",
    "saddleModel", "pedalModel", "cleatSystem", "currentGeometry.frameSize", "gearing.drivetrainType", "gearing.groupsetName", "tires.tubeType"].includes(field);
  return { kind: declared ? "declared" : "estimated", method: declared ? "legacy_declared" : "legacy_unknown", recordedAt };
}

export function planLegacyObservations(table: "profiles" | "bikes", document: object, geometry?: object | null) {
  const observations: MigrationObservation[] = [];
  let invalidValues = 0;
  for (const definition of table === "profiles" ? profileFields : bikeFields) {
    const value = read(document, definition[0]);
    if (value === undefined || value === null) continue;
    if (!validValue(value, definition)) { invalidValues++; continue; }
    observations.push({ field: definition[0], unit: definition[1], value,
      ...(table === "profiles" ? profileEvidence(document, definition[0]) : bikeEvidence(document, definition[0], geometry)) });
  }
  return { observations, invalidValues };
}

export function legacyRiderObservations(profile: Doc<"profiles">) {
  return planLegacyObservations("profiles", profile).observations.map(observation => ({
    ...observation, source: "legacy_migration" as const, status: "current" as const,
  }));
}
