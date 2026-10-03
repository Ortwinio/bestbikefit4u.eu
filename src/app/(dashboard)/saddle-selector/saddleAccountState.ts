import type { SaddlePostureCategory, SaddleRidingType, SaddleWidthInput } from "@/lib/saddle-width-engine";
import { HIP_CIRCUMFERENCE_RANGE, SIT_BONE_WIDTH_RANGE } from "@/lib/saddle-width-engine/config";

type Measurement = "sitBoneWidthMm" | "heightCm" | "weightKg" | "hipCircumferenceCm";
type Measurements = Partial<Record<Measurement, number>>;
type Bike = { bikeType?: string; ridingStyle?: string | null; primaryGoal?: string };
type Saved = Measurements & { measurementMethod?: "measured" | "estimated"; ridingType?: string; postureCategory?: string };

export function mapBikeToRidingTypeFromBike(bike?: Bike): SaddleRidingType {
  if (bike?.ridingStyle === "racing") return "road_race";
  if (["sportive", "fitness"].includes(bike?.ridingStyle ?? "")) return "endurance_road";
  if (["recreational", "commuting", "touring"].includes(bike?.ridingStyle ?? "")) return "commuter_leisure";
  if (["gravel", "cyclocross"].includes(bike?.bikeType ?? "")) return "gravel";
  if (bike?.bikeType === "mountain") return "mtb";
  if (bike?.bikeType === "tt_triathlon") return "tt_triathlon";
  if (["city", "hybrid", "touring"].includes(bike?.bikeType ?? "")) return "commuter_leisure";
  return "endurance_road";
}

export function mapGoalToPosture(goal?: string): SaddlePostureCategory {
  if (goal === "aerodynamics" || goal === "performance") return "aggressive";
  return goal === "comfort" ? "upright" : "balanced";
}

export function normalizeProfileSitBoneWidth(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) &&
    value >= SIT_BONE_WIDTH_RANGE.min && value <= SIT_BONE_WIDTH_RANGE.max ? value : null;
}

export function getSaddleInitialValues(saved?: Saved | null, profile?: Measurements | null, bike?: Bike) {
  const profileFields: Measurement[] = [];
  let invalidSaved = false;
  const ranges: Record<Measurement, [number, number, number]> = {
    sitBoneWidthMm: [SIT_BONE_WIDTH_RANGE.min, SIT_BONE_WIDTH_RANGE.max, 125],
    heightCm: [140, 220, 180], weightKg: [40, 150, 75],
    hipCircumferenceCm: [HIP_CIRCUMFERENCE_RANGE.min, HIP_CIRCUMFERENCE_RANGE.max, 100],
  };
  function resolve(field: Measurement) {
    const [min, max, fallback] = ranges[field];
    const valid = (value?: number): value is number =>
      value !== undefined && Number.isFinite(value) && value >= min && value <= max;
    if (valid(profile?.[field])) { profileFields.push(field); return profile[field]; }
    if (valid(saved?.[field])) return saved[field];
    if (saved?.[field] !== undefined) invalidSaved = true;
    return fallback;
  }
  const measurements = {
    sitBoneWidthMm: resolve("sitBoneWidthMm"), heightCm: resolve("heightCm"),
    weightKg: resolve("weightKg"), hipCircumferenceCm: resolve("hipCircumferenceCm"),
  };
  const inputMethod = normalizeProfileSitBoneWidth(profile?.sitBoneWidthMm) ? "measured"
    : saved?.measurementMethod ?? (profileFields.length > 0 ? "estimated" : "measured");
  const values: SaddleWidthInput = {
    inputMethod,
    ...measurements,
    ridingType: bike ? mapBikeToRidingTypeFromBike(bike) : saved?.ridingType as SaddleRidingType ?? "endurance_road",
    postureCategory: bike?.primaryGoal ? mapGoalToPosture(bike.primaryGoal)
      : saved?.postureCategory as SaddlePostureCategory ?? "balanced",
  };
  return { values, invalidSaved, profileFields: profileFields.filter((field) =>
    inputMethod === "measured" ? field === "sitBoneWidthMm" : field !== "sitBoneWidthMm") };
}
