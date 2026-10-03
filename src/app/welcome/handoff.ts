import { makeFunctionReference } from "convex/server";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { HandoffEntry, HandoffField } from "@/lib/handoff/store";
import { PROFILE_RANGES } from "../../../shared/profileBounds";
import { bikeEditRanges } from "../../../shared/bikeEditValidation";

export const bikeTypes = ["road", "gravel", "mountain", "hybrid", "tt_triathlon", "cyclocross", "touring", "city"] as const;
export type BikeType = (typeof bikeTypes)[number];
export const flexibilityValues = ["very_limited", "limited", "average", "good", "excellent"] as const;
export const riderFields = new Set<HandoffField>(["heightCm", "inseamCm", "flexibilityScore", "coreStabilityScore", "ridingGoal", "weightKg", "ftpWatts", "ftpMethod", "sitBoneWidthMm", "sweatProfile"]);
export const enumValues: Partial<Record<HandoffField, readonly string[]>> = {
  ridingGoal: ["comfort", "balanced", "performance"], bikeCategory: bikeTypes,
  rimType: ["hooked", "hookless", "unknown"], sweatProfile: ["low", "medium", "high"],
  surface: ["smooth_asphalt", "average_asphalt", "rough_asphalt", "hardpack_gravel", "loose_gravel", "trail"],
  ftpMethod: ["known", "twentyMinute", "ramp"],
};
export const bounds: Partial<Record<HandoffField, readonly [number, number]>> = {
  ...PROFILE_RANGES, flexibilityScore: [1, 5],
  currentSaddleHeightMm: bikeEditRanges.currentSetup.saddleHeightMm,
  currentCrankLengthMm: bikeEditRanges.currentSetup.crankLengthMm,
  currentSaddleWidthMm: [80, 250], tireWidthFrontMm: [18, 120], tireWidthRearMm: [18, 120],
  outerChainringTeeth: [20, 70], innerChainringTeeth: [20, 70], cassetteSmallestCogTeeth: [9, 60], cassetteLargestCogTeeth: [9, 60],
};
export type Conflict = { field: string; currentValue: number | string; incomingValue: number | string; unit: string };
export type Resolution = { field: string; choice: "profile" | "today" | "remeasure"; expectedCurrentValue: number | string };
export type ImportArgs = { records: HandoffEntry[]; resolutions?: Resolution[]; bike?: { name: string; bikeType: BikeType; saddleHeightMeasurePoint?: "bb_center_to_saddle_top" } };
export type ImportResult = { status: "imported" | "conflicts"; importedFields: string[]; conflicts: Conflict[]; profileId: Id<"profiles"> | null; bikeId: Id<"bikes"> | null };
export type Context = { profile: Doc<"profiles"> | null; observations: { field: string; value: number | string; kind: "measured" | "estimated" | "derived" | "declared"; method: string; recordedAt: number; status: "current" | "superseded" }[] };
export const importHandoff = makeFunctionReference<"mutation", ImportArgs, ImportResult>("profiles/mutations:importHandoff");
export const getHandoffContext = makeFunctionReference<"query", Record<string, never>, Context>("profiles/queries:getHandoffContext");

export function asBikeType(value: unknown): BikeType | "" {
  const mapped = value === "mtb" ? "mountain" : value === "tt" || value === "triathlon" ? "tt_triathlon" : value;
  return bikeTypes.includes(mapped as BikeType) ? mapped as BikeType : "";
}

export function profileField(field: string): string { return field === "ridingGoal" ? "positionPriority" : field; }
export function profileValue(entry: HandoffEntry): number | string {
  return entry.field === "flexibilityScore" && typeof entry.value === "number" ? flexibilityValues[entry.value - 1] ?? entry.value : entry.value;
}
