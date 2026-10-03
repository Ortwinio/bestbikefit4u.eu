import { v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireUserId } from "../lib/authz";
import { legacyRiderObservations } from "../../shared/profileObservationMigration";
import {
  equalProfileObservationValues, PROFILE_OBSERVATION_FIELDS, validateProfileObservationValue,
  type ProfileObservationKind,
} from "../../shared/profileObservationFields";

const observationValue = v.union(v.number(), v.string(), v.array(v.string()));

export async function recordProfileObservations(
  ctx: MutationCtx,
  userId: Id<"users">,
  updates: Record<string, unknown>,
  previous: Doc<"profiles"> | null,
  options: { kinds?: Record<string, ProfileObservationKind>; method?: string; confirm?: boolean } = {},
) {
  for (const [field, value] of Object.entries(updates)) {
    if (value === undefined || !Object.hasOwn(PROFILE_OBSERVATION_FIELDS, field)) continue;
    const validated = validateProfileObservationValue(field, value);
    const current = await ctx.db.query("profileObservations")
      .withIndex("by_user_field_bike_status", range => range.eq("userId", userId).eq("field", field)
        .eq("bikeId", undefined).eq("status", "current")).collect();
    if (!options.confirm && equalProfileObservationValues(previous?.[field as keyof Doc<"profiles">], validated)) continue;
    const kind = options.kinds?.[field] ?? PROFILE_OBSERVATION_FIELDS[field].kind;
    if (kind === "derived" && current.some(observation => observation.kind === "measured")) {
      throw new Error("A calculated value cannot replace a measurement");
    }
    for (const observation of current) await ctx.db.patch(observation._id, { status: "superseded" });
    await ctx.db.insert("profileObservations", {
      userId, field, value: validated, unit: PROFILE_OBSERVATION_FIELDS[field].unit, kind,
      method: options.method ?? (kind === "measured" ? "single_measurement"
        : kind === "estimated" ? "self_assessment" : "self_report"),
      source: "profile_edit", recordedAt: Date.now(), status: "current",
    });
  }
}

export async function readProfileProvenance(ctx: Pick<QueryCtx, "db">, userId: Id<"users">) {
    const profile = await ctx.db.query("profiles").withIndex("by_user", range => range.eq("userId", userId)).unique();
    const observations = await ctx.db.query("profileObservations")
      .withIndex("by_user_field", range => range.eq("userId", userId))
      .filter(filter => filter.and(filter.eq(filter.field("status"), "current"),
        filter.eq(filter.field("bikeId"), undefined))).collect();
    const matching = observations.filter(observation => profile && equalProfileObservationValues(
      observation.value, profile[observation.field as keyof Doc<"profiles">],
    ));
    const fallback = profile ? legacyRiderObservations(profile).filter(observation =>
      !matching.some(current => current.field === observation.field)) : [];
    return { profile, observations: [...matching, ...fallback] };
}

export const getMyProvenance = query({
  args: {},
  handler: async ctx => {
    const userId = await requireUserId(ctx);
    return await readProfileProvenance(ctx, userId);
  },
});

export const saveObservation = mutation({
  args: {
    field: v.string(), value: observationValue,
    kind: v.union(v.literal("measured"), v.literal("estimated"), v.literal("declared")),
    method: v.union(v.literal("single_measurement"), v.literal("self_assessment"),
      v.literal("self_report"), v.literal("ftp_test")),
    expectedCurrentValue: v.union(observationValue, v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const value = validateProfileObservationValue(args.field, args.value);
    const definition = PROFILE_OBSERVATION_FIELDS[args.field];
    if ((args.kind === "measured" && definition.kind !== "measured")
      || (args.kind === "declared" && definition.kind !== "declared")
      || (args.kind === "estimated" && definition.kind === "declared")
      || (args.kind === "measured" && !["single_measurement", "ftp_test"].includes(args.method))
      || (args.method === "ftp_test" && args.field !== "ftpWatts")
      || (args.kind === "estimated" && args.method !== "self_assessment")
      || (args.kind === "declared" && args.method !== "self_report")) throw new Error("Invalid profile method");
    const profile = await ctx.db.query("profiles").withIndex("by_user", range => range.eq("userId", userId)).unique();
    const storedValue = profile?.[args.field as keyof Doc<"profiles">];
    const currentValue = storedValue === undefined ? null : validateProfileObservationValue(args.field, storedValue);
    if (!equalProfileObservationValues(currentValue, args.expectedCurrentValue)) {
      return { status: "conflict" as const, field: args.field, currentValue, incomingValue: value };
    }
    const now = Date.now();
    const updates = { [args.field]: value };
    const dates = { updatedAt: now, riderProfileUpdatedAt: now,
      ...(args.field === "weightKg" ? { weightUpdatedAt: now } : {}),
      ...(args.field === "ftpWatts" ? { ftpMeasuredAt: now, ftpMethod: args.method } : {}),
    };
    await recordProfileObservations(ctx, userId, updates, profile,
      { kinds: { [args.field]: args.kind }, method: args.method, confirm: true });
    if (profile) await ctx.db.patch(profile._id, { ...updates, ...dates });
    else await ctx.db.insert("profiles", { userId, ...updates, ...dates });
    return { status: "saved" as const, field: args.field };
  },
});
