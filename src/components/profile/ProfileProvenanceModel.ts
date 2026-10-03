import { makeFunctionReference } from "convex/server";
import type { Doc } from "../../../convex/_generated/dataModel";
import { equalProfileObservationValues, type ProfileObservationValue } from "../../../shared/profileObservationFields";
import type { ProvenanceField, ProvenanceGroup } from "@/i18n/account/profileProvenance";

export type ProvenanceObservation = Pick<Doc<"profileObservations">, "field" | "value" | "unit" | "kind" | "method" | "source" | "recordedAt" | "status" | "bikeId">;
export type ProvenanceContext = { profile: Doc<"profiles"> | null; observations: ProvenanceObservation[] };
export type ObservationDraft = { field: string; value: ProfileObservationValue; kind: "measured" | "estimated" | "declared"; method: "single_measurement" | "self_assessment" | "self_report" | "ftp_test"; expectedCurrentValue: ProfileObservationValue | null };
export type ObservationResult = { status: "saved"; field: string } | { status: "conflict"; field: string; currentValue: ProfileObservationValue | null; incomingValue: ProfileObservationValue };
export const getMyProvenance = makeFunctionReference<"query", Record<string, never>, ProvenanceContext>("profiles/queries:getMyProvenance");
export const saveObservation = makeFunctionReference<"mutation", ObservationDraft, ObservationResult>("profiles/mutations:saveObservation");
export const fieldGroups: Record<Exclude<ProvenanceGroup, "all">, ProvenanceField[]> = {
  body: ["sex", "birthDate", "inseamCm", "heightCm", "armLengthCm", "torsoLengthCm", "shoulderWidthCm", "femurLengthCm", "footLengthCm", "handSpanCm", "hipCircumferenceCm", "age"],
  mobility: ["flexibilityScore", "coreStabilityScore"],
  riding: ["experienceLevel", "weeklyHours", "typicalRideLength", "positionPriority", "hasPain", "painAreas", "painSeverity", "kneePainTiming"],
  performance: ["weightKg", "ftpWatts", "ftpMethod", "sweatProfile"],
  contact: ["sitBoneWidthMm", "shoeSizeEu", "cleatSystem"],
};
export const scoreGroups: Record<Exclude<ProvenanceGroup, "all">, string[]> = {
  body: ["inseam", "height", "torso", "arm", "shoulders", "femur"],
  mobility: ["flexibility", "core"], riding: ["riderQuestions", "complaints", "goal"],
  performance: ["weight", "ftp"], contact: ["sitBones", "footwear"],
};

export function currentObservation(observations: ProvenanceContext["observations"], field: string, value: unknown) {
  return observations.filter(observation => !observation.bikeId && observation.field === field && observation.status === "current"
    && equalProfileObservationValues(observation.value, value))
    .sort((first, second) => second.recordedAt - first.recordedAt)[0];
}
