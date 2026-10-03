import { v, type Infer } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { CalculatorValues } from "../calculatorStates/validators";
import { legacyRiderObservations } from "../../shared/profileObservationMigration";
import { equalProfileObservationValues } from "../../shared/profileObservationFields";
import { matchInputProvenance } from "../advice/provenance";

export const FIT_PROFILE_FIELDS = ["heightCm", "inseamCm", "torsoLengthCm", "armLengthCm", "shoulderWidthCm",
  "footLengthCm", "flexibilityScore", "coreStabilityScore"] as const;
export const sessionProfileSnapshot = v.object({
  capturedAt: v.number(), trial: v.boolean(),
  heightCm: v.optional(v.number()), inseamCm: v.optional(v.number()), torsoLengthCm: v.optional(v.number()),
  armLengthCm: v.optional(v.number()), shoulderWidthCm: v.optional(v.number()), footLengthCm: v.optional(v.number()),
  flexibilityScore: v.optional(v.union(v.literal("very_limited"), v.literal("limited"), v.literal("average"),
    v.literal("good"), v.literal("excellent"))), coreStabilityScore: v.optional(v.number()),
});
export const sessionObservationSnapshot = v.array(v.object({
  field: v.string(), value: v.union(v.number(), v.string()), unit: v.string(),
  kind: v.union(v.literal("measured"), v.literal("estimated"), v.literal("declared"), v.literal("derived")),
  method: v.string(), source: v.string(), recordedAt: v.number(), observationId: v.optional(v.id("profileObservations")),
}));

const flexibility = ["very_limited", "limited", "average", "good", "excellent"] as const;
export function calculatorProfileValues(inputs: CalculatorValues<"bike-fit">) {
  return { heightCm: inputs.heightCm, inseamCm: inputs.inseamCm,
    flexibilityScore: flexibility[inputs.flexibility - 1], coreStabilityScore: inputs.core };
}

export async function captureSessionProfile(
  ctx: Pick<QueryCtx, "db">, profile: Doc<"profiles">,
  inputs?: CalculatorValues<"bike-fit">, trial = false,
) {
  const overrides = inputs ? calculatorProfileValues(inputs) : {};
  const divergent = Object.entries(overrides).filter(([field, value]) =>
    !equalProfileObservationValues(profile[field as keyof Doc<"profiles">], value));
  if (divergent.length && !trial) throw new Error("CALCULATOR_PROFILE_CONFLICT");
  const capturedAt = Date.now();
  const values = Object.fromEntries(FIT_PROFILE_FIELDS.flatMap(field => {
    const value = trial && Object.hasOwn(overrides, field) ? overrides[field as keyof typeof overrides] : profile[field];
    return value === undefined ? [] : [[field, value]];
  }));
  const persisted = await ctx.db.query("profileObservations")
    .withIndex("by_user_field", q => q.eq("userId", profile.userId)).collect();
  const legacy = legacyRiderObservations(profile);
  const profileObservationSnapshot = FIT_PROFILE_FIELDS.flatMap<Infer<typeof sessionObservationSnapshot>[number]>(field => {
    const value = values[field];
    if (typeof value !== "number" && typeof value !== "string") return [];
    if (divergent.some(([changed]) => changed === field)) return [{ field, value,
      unit: field.endsWith("Cm") ? "cm" : "score", kind: "estimated" as const,
      method: "calculator_trial", source: "calculator_trial", recordedAt: capturedAt }];
    const current = persisted.filter(item => item.field === field && !item.bikeId && item.status === "current"
      && equalProfileObservationValues(item.value, value)).sort((a, b) => b.recordedAt - a.recordedAt)[0];
    const evidence = current ?? legacy.find(item => item.field === field && equalProfileObservationValues(item.value, value));
    return evidence ? [{ field, value, unit: evidence.unit, kind: evidence.kind, method: evidence.method,
      source: current?.source ?? "legacy_migration", recordedAt: evidence.recordedAt,
      ...(current ? { observationId: current._id } : {}) }] : [];
  });
  return {
    profileSnapshot: { ...values, capturedAt, trial } as Doc<"fitSessions">["profileSnapshot"],
    profileObservationSnapshot,
    inputProvenance: matchInputProvenance(profile.userId,
      FIT_PROFILE_FIELDS.map(field => ({ field, value: values[field] })), profile, null, persisted, capturedAt),
  };
}

/** New sessions always use immutable inputs. Only completed legacy reports retain the historic overlay. */
export function sessionProfile(profile: Doc<"profiles">, session: Pick<Doc<"fitSessions">,
  "profileSnapshot" | "calculatorInputs" | "status">, historicalReport = false): Doc<"profiles"> {
  if (session.profileSnapshot) {
    const snapshot = session.profileSnapshot;
    return { ...profile, ...Object.fromEntries(FIT_PROFILE_FIELDS.map(field => [field, snapshot[field]])) };
  }
  if (historicalReport && ["completed", "archived"].includes(session.status) && session.calculatorInputs) {
    return { ...profile, ...calculatorProfileValues(session.calculatorInputs) };
  }
  return profile;
}
