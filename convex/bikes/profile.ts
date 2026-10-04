import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { mutation, type MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireBikeOwner } from "../lib/authz";
import { valueAt } from "../advice/provenance";
import { planLegacyObservations } from "../../shared/profileObservationMigration";
import { equalProfileObservationValues } from "../../shared/profileObservationFields";
import { scoreBike } from "../../shared/profileScore";
import { BIKE_MEASURE_POINTS, BIKE_PROFILE_FIELDS, validateBikeProfileField } from "../../shared/bikeProfileFields";
import { getUserAccess } from "../pricing/access";
import { isPaidAccessEnforced } from "../../shared/pricing/flags";

export const PAID_BIKE_FIELDS = [
  "currentSetup.handlebarReachMm", "currentSetup.handlebarDropMm", "currentGeometry.seatTubeAngle",
  "currentGeometry.headTubeAngle", "gearing.chainrings", "gearing.cassetteTeeth", "activitySummary",
  "recentDistance90dMeters", "rideCount90d", "avgRideDistance90dMeters", "avgSpeed90dKph",
  "avgElevationPer100Km90d", "trainerRideRatio90d", "dominantSportType", "lastRideAt", "inferredBikeRole",
] as const;

export async function assertPaidBikeWrite(ctx: MutationCtx, bike: Doc<"bikes">,
  updates: Record<string, unknown>, evidence: Record<string, unknown> = {}) {
  if (!isPaidAccessEnforced()) return;
  const next = { ...bike, ...updates };
  const changed = PAID_BIKE_FIELDS.some(field => valueAt(next, field) !== undefined && valueAt(next, field) !== null
    && (evidence[field] !== undefined || JSON.stringify(valueAt(next, field)) !== JSON.stringify(valueAt(bike, field))));
  if (changed && !(await getUserAccess(ctx, bike.userId, bike._id)).fullReport) throw new Error("PAID_BIKE_ACCESS_REQUIRED");
}

type Evidence = { kind: "measured" | "estimated" | "declared"; measuredAt: number;
  measurePoint?: string; source: "profile_edit" | "geometry_database"; method?: string };

export function geometryValues(record: Doc<"geometry_records"> | null) {
  if (!record || record.status !== "active") throw new Error("Active geometry record required");
  const fields = { stackMm: record.stack, reachMm: record.reach, seatTubeAngle: record.seatTubeAngle,
    headTubeAngle: record.headTubeAngle, frameSize: record.sizeLabel };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) validateBikeProfileField(`currentGeometry.${key}`, value);
  }
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)) as Doc<"bikes">["currentGeometry"];
}

/** Matching evidence only. Metadata augments an observation; a naked metadata flag is never evidence. */
export function bikeProfileSummary(bike: Doc<"bikes">, observations: Doc<"profileObservations">[],
  tires?: { widthFrontMm: number; widthRearMm: number; tubeType: string } | null, now = Date.now(),
  geometry?: Doc<"geometry_records"> | null, access?: { enforced: boolean; fullReport: boolean }) {
  const scoredBike = { ...bike, ...(tires ? { tires } : {}) };
  const current = observations.filter(item => item.userId === bike.userId && item.bikeId === bike._id && item.status === "current"
    && equalProfileObservationValues(item.value, valueAt(scoredBike, item.field)));
  const legacy = planLegacyObservations("bikes", bike, geometry).observations.filter(item =>
    !current.some(stored => stored.field === item.field));
  const bikeObservations = [...current, ...legacy.map(item => ({ ...item, bikeId: bike._id,
    source: "legacy_migration", status: "current" as const }))].map(item => {
    const metadata = bike.fieldMeasurements?.[item.field];
    return metadata && metadata.measuredAt === item.recordedAt ? { ...item,
      source: metadata.source === "geometry_database" && item.method === "geometry_database" ? "geometry_database" : item.source,
      ...(metadata.kind === "measured" && item.kind === "measured" ? { measurePoint: metadata.measurePoint } : {}) } : item;
  });
  const spacersMm = bike.currentSetup?.spacersMm;
  const maxSpacerStackMm = bike.maxSpacerStackMm;
  const exceeds = spacersMm !== undefined && maxSpacerStackMm !== undefined && spacersMm > maxSpacerStackMm;
  return {
    profileScore: scoreBike({ bike: scoredBike, observations: bikeObservations }, now, access), bikeObservations,
    adjustmentRoom: { status: exceeds ? "exceeds" as const : "unknown" as const,
      reason: exceeds ? "spacer_limit_exceeded" as const : "seatpost_extension_unknown" as const,
      ...(spacersMm !== undefined ? { spacersMm } : {}),
      ...(maxSpacerStackMm !== undefined ? { maxSpacerStackMm } : {}),
      ...(bike.maxSeatpostMm !== undefined ? { maxSeatpostMm: bike.maxSeatpostMm } : {}) },
  };
}

/** Merge metadata for untouched fields; replace changed evidence and remove obsolete measured flags. */
export async function recordBikeProfileChanges(ctx: MutationCtx, bike: Doc<"bikes">,
  updates: Record<string, unknown>, evidence: Record<string, Evidence> = {}) {
  await assertPaidBikeWrite(ctx, bike, updates, evidence);
  const metadata = { ...bike.fieldMeasurements };
  const next = { ...bike, ...updates };
  for (const field of Object.keys(BIKE_PROFILE_FIELDS)) {
    const value = valueAt(next, field);
    if (equalProfileObservationValues(valueAt(bike, field), value) && !evidence[field]) continue;
    if (value !== undefined) validateBikeProfileField(field, value);
    const current = await ctx.db.query("profileObservations")
      .withIndex("by_user_field_bike_status", q => q.eq("userId", bike.userId).eq("field", field)
        .eq("bikeId", bike._id).eq("status", "current")).collect();
    for (const observation of current) await ctx.db.patch(observation._id, { status: "superseded" });
    delete metadata[field];
    if (value === undefined) continue;
    const proof = evidence[field] ?? { kind: "declared" as const, measuredAt: Date.now(), source: "profile_edit" as const };
    const { method, ...storedProof } = proof;
    metadata[field] = storedProof;
    await ctx.db.insert("profileObservations", { userId: bike.userId, bikeId: bike._id, field,
      value: value as number | string, unit: BIKE_PROFILE_FIELDS[field].unit, kind: proof.kind,
      method: method ?? (proof.source === "geometry_database" ? "geometry_database" : proof.measurePoint
        ?? (proof.kind === "estimated" ? "self_assessment" : "self_report")),
      source: "profile_edit", recordedAt: proof.measuredAt, status: "current" });
  }
  return metadata;
}

const updateBike = makeFunctionReference<"mutation", { bikeId: Id<"bikes">;
  primaryGoal: NonNullable<Doc<"bikes">["primaryGoal"]> }, unknown>("bikes/mutations:update");
export const removeRefinement = mutation({
  args: { bikeId: v.id("bikes"), field: v.string(), expectedCurrentValue: v.any() },
  handler: async (ctx, args) => {
    const { bike } = await requireBikeOwner(ctx, args.bikeId);
    const fields = PAID_BIKE_FIELDS.slice(0, 4) as readonly string[];
    if (![...fields, "gearing", "activitySummary"].includes(args.field)) throw new Error("Invalid refinement field");
    if (JSON.stringify(valueAt(bike, args.field)) !== JSON.stringify(args.expectedCurrentValue)) {
      throw new Error("BIKE_VALUE_CHANGED");
    }
    const removedFields = args.field === "gearing" ? ["gearing.chainrings", "gearing.cassetteTeeth"]
      : args.field === "activitySummary" ? PAID_BIKE_FIELDS.slice(6) : [args.field];
    const updates: Record<string, unknown> = {};
    const fieldMeasurements = { ...bike.fieldMeasurements };
    for (const field of removedFields) {
      const [group, key] = field.split(".");
      if (key) updates[group] = { ...(valueAt(bike, group) as object), ...(updates[group] as object), [key]: undefined };
      else updates[group] = undefined;
      delete fieldMeasurements[field];
      const observations = await ctx.db.query("profileObservations")
        .withIndex("by_user_field_bike_status", range => range.eq("userId", bike.userId).eq("field", field)
          .eq("bikeId", bike._id).eq("status", "current")).collect();
      for (const observation of observations) await ctx.db.patch(observation._id, { status: "superseded" });
    }
    await ctx.db.patch(bike._id, { ...updates, fieldMeasurements, updatedAt: Date.now() });
    return { status: "removed" as const, field: args.field };
  },
});

export const updateFields = mutation({
  args: { bikeId: v.id("bikes"), changes: v.array(v.object({
    field: v.string(), value: v.union(v.number(), v.string()),
    expectedCurrentValue: v.union(v.number(), v.string(), v.null()),
    kind: v.union(v.literal("measured"), v.literal("estimated"), v.literal("declared")),
    measuredAt: v.optional(v.number()), measurePoint: v.optional(v.string()),
  })) },
  handler: async (ctx, { bikeId, changes }) => {
    const { bike } = await requireBikeOwner(ctx, bikeId);
    if (!changes.length || changes.length > 32 || new Set(changes.map(item => item.field)).size !== changes.length) {
      throw new Error("Invalid bike profile changes");
    }
    const now = Date.now();
    const validated = changes.map(item => {
      const value = validateBikeProfileField(item.field, item.value);
      if (item.measuredAt !== undefined && (!Number.isSafeInteger(item.measuredAt)
        || item.measuredAt <= 0 || item.measuredAt > now)) throw new Error("Invalid measurement date");
      if (item.kind === "measured" && (!BIKE_MEASURE_POINTS[item.field] || item.measuredAt === undefined
        || item.measurePoint !== BIKE_MEASURE_POINTS[item.field])) throw new Error("Measurement point and date required");
      if (item.measurePoint !== undefined && item.measurePoint !== BIKE_MEASURE_POINTS[item.field]) {
        throw new Error("Invalid measurement point");
      }
      return { ...item, value, currentValue: valueAt(bike, item.field) ?? null };
    });
    const conflicts = validated.filter(item => item.currentValue !== item.expectedCurrentValue)
      .map(item => ({ field: item.field, currentValue: item.currentValue, incomingValue: item.value }));
    if (conflicts.length) return { status: "conflict" as const, conflicts };
    const updates: Record<string, unknown> = {};
    const evidence: Record<string, Evidence> = {};
    for (const item of validated) {
      const [group, key] = item.field.split(".");
      if (key) updates[group] = { ...(valueAt(bike, group) as object), ...(updates[group] as object), [key]: item.value };
      else updates[group] = item.value;
      evidence[item.field] = { kind: item.kind, measuredAt: item.measuredAt ?? now, source: "profile_edit",
        ...(item.kind === "measured" ? { measurePoint: item.measurePoint } : {}) };
      if (item.field === "currentSetup.saddleHeightMm") {
        updates.currentSetup = { ...(updates.currentSetup as object), saddleHeightMeasurement:
          item.kind === "measured" ? { measurePoint: "bb_center_to_saddle_top", measuredAt: item.measuredAt,
            source: "profile_edit" } : undefined };
      }
    }
    let latestBike = bike;
    if (updates.primaryGoal !== undefined) {
      await ctx.runMutation(updateBike, { bikeId, primaryGoal: updates.primaryGoal as NonNullable<Doc<"bikes">["primaryGoal"]> });
      latestBike = (await ctx.db.get(bikeId)) ?? bike;
      delete updates.primaryGoal;
      delete evidence.primaryGoal;
    }
    const fieldMeasurements = await recordBikeProfileChanges(ctx, latestBike, updates, evidence);
    await ctx.db.patch(bikeId, { ...updates, fieldMeasurements, updatedAt: now });
    return { status: "saved" as const, fields: validated.map(item => item.field) };
},
});
