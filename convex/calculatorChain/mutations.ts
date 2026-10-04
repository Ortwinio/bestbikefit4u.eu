import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { recordProfileObservations } from "../profiles/provenance";
import { assertPaidBikeWrite } from "../bikes/profile";
import { equalProfileObservationValues, PROFILE_OBSERVATION_FIELDS } from "../../shared/profileObservationFields";
import { valueAt } from "../advice/provenance";
import { activeTires } from "./wheels";
import { calculator, chainField, changeValue, kindValidator } from "./fields";

const updateBike = makeFunctionReference<"mutation", {
  bikeId: import("../_generated/dataModel").Id<"bikes">;
  bikeType?: Doc<"bikes">["bikeType"];
  primaryGoal?: Doc<"bikes">["primaryGoal"];
  bikeTypeSource?: "user"; needsTypeConfirmation?: boolean;
}, unknown>("bikes/mutations:update");

export const applyChanges = mutation({
  args: {
    calculator, bikeId: v.optional(v.id("bikes")), tireSetupId: v.optional(v.id("tireSetups")), changes: v.array(v.object({
      field: v.string(), source: v.optional(v.union(v.literal("profile"), v.literal("bike"))),
      value: changeValue, expectedCurrentValue: v.union(changeValue, v.null()), kind: kindValidator,
      measurePoint: v.optional(v.literal("bb_center_to_saddle_top")),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const bike = args.bikeId ? (await requireBikeOwner(ctx, args.bikeId)).bike : null;
    if (!args.changes.length || args.changes.length > 32
      || new Set(args.changes.map(change => change.field)).size !== args.changes.length) {
      throw new Error("Invalid calculator changes");
    }
    const profile = await ctx.db.query("profiles").withIndex("by_user", q => q.eq("userId", userId)).unique();
    const { activeTireSetup } = args.changes.some(change => change.field.startsWith("tires."))
      ? await activeTires(ctx, userId, args.bikeId) : { activeTireSetup: null };
    if (args.changes.some(change => change.field.startsWith("tires."))
      && (!activeTireSetup || args.tireSetupId !== activeTireSetup._id)) {
      throw new Error("Active tire setup changed; review your inputs");
    }
    const planned = await Promise.all(args.changes.map(async change => {
      const definition = chainField(change.field, change.value);
      if (change.source && change.source !== definition.source) throw new Error("Invalid field scope");
      if (definition.source === "bike" && !bike) throw new Error("Bike required");
      if (change.measurePoint && change.field !== "currentSetup.saddleHeightMm") {
        throw new Error("Invalid measurement point");
      }
      if (change.field === "currentSetup.saddleHeightMm" && change.kind === "measured" && !change.measurePoint) {
        throw new Error("Saddle measurement point required");
      }
      const defaultKind = definition.source === "profile" ? PROFILE_OBSERVATION_FIELDS[change.field].kind
        : definition.unit === "none" || definition.unit === "teeth" ? "declared" : "measured";
      if ((change.kind === "measured" && defaultKind !== "measured")
        || (change.kind === "derived" && defaultKind === "declared")) throw new Error("Invalid observation kind");
      const existing = await ctx.db.query("profileObservations")
        .withIndex("by_user_field_bike_status", q => q.eq("userId", userId).eq("field", change.field)
          .eq("bikeId", definition.source === "bike" ? args.bikeId : undefined).eq("status", "current")).collect();
      if (change.kind === "derived" && existing.some(item => item.kind === "measured")) {
        throw new Error("A calculated value cannot replace a measurement");
      }
      const tireField = change.field.startsWith("tires.");
      if (tireField && !activeTireSetup) throw new Error("Active tire setup required");
      const currentValue = tireField ? valueAt(activeTireSetup, change.field.slice(6)) ?? null
        : valueAt(definition.source === "profile" ? profile : bike, change.field) ?? null;
      return { ...change, ...definition, currentValue, existing };
    }));
    const conflicts = planned.filter(change => !equalProfileObservationValues(change.currentValue, change.expectedCurrentValue))
      .map(change => ({ field: change.field, currentValue: change.currentValue, incomingValue: change.value }));
    if (conflicts.length) return { status: "conflict" as const, conflicts };
    const changed = planned.filter(change => !equalProfileObservationValues(change.currentValue, change.value));
    if (changed.some(change => change.field === "ftpWatts")
      && !planned.some(change => change.field === "ftpMethod")) {
      throw new Error("FTP_METHOD_REQUIRED");
    }
    if (bike) {
      for (const change of changed.filter(item => item.source === "bike" && !item.field.startsWith("tires."))) {
        const [group, key] = change.field.split(".");
        const updates = key ? { [group]: { ...(valueAt(bike, group) as object), [key]: change.value } }
          : { [group]: change.value };
        await assertPaidBikeWrite(ctx, bike, updates);
      }
    }
    const now = Date.now();
    const profileUpdates: Record<string, unknown> = {};
    const bikeUpdates: Record<string, unknown> = {};
    const tireUpdates: Record<string, unknown> = {};
    for (const change of changed) {
      const method = change.measurePoint ?? (change.kind === "measured" ? "single_measurement"
        : change.kind === "derived" ? "calculator_derived" : change.kind === "estimated" ? "self_assessment" : "self_report");
      if (change.source === "profile") {
        profileUpdates[change.field] = change.value;
        await recordProfileObservations(ctx, userId, { [change.field]: change.value }, profile,
          { kinds: { [change.field]: change.kind }, method });
      } else {
        for (const previous of change.existing) await ctx.db.patch(previous._id, { status: "superseded" });
        await ctx.db.insert("profileObservations", {
          userId, bikeId: args.bikeId, field: change.field, value: change.value, unit: change.unit,
          kind: change.kind, method, source: "profile_edit", recordedAt: now, status: "current",
        });
        if (change.field.startsWith("tires.")) {
          tireUpdates[change.field.slice(6)] = change.value;
          continue;
        }
        const [group, key] = change.field.split(".");
        if (key) {
          const original = valueAt(bike, group) as object | undefined;
          bikeUpdates[group] = { ...original, ...(bikeUpdates[group] as object), [key]: change.value };
        } else bikeUpdates[group] = change.value;
        if (change.field === "currentSetup.saddleHeightMm") {
          bikeUpdates.currentSetup = { ...(bikeUpdates.currentSetup as object), saddleHeightMeasurement:
            change.kind === "measured" ? { measurePoint: change.measurePoint,
              measuredAt: now, source: "profile_edit" } : undefined };
        }
      }
    }
    if (Object.keys(profileUpdates).length) {
      const dates = { updatedAt: now, riderProfileUpdatedAt: now,
        ...(profileUpdates.weightKg !== undefined ? { weightUpdatedAt: now } : {}),
        ...(profileUpdates.ftpWatts !== undefined ? { ftpMeasuredAt: now } : {}) };
      if (profile) await ctx.db.patch(profile._id, { ...profileUpdates, ...dates });
      else await ctx.db.insert("profiles", { userId, ...profileUpdates, ...dates });
    }
    if (activeTireSetup && Object.keys(tireUpdates).length) {
      await ctx.db.patch(activeTireSetup._id, { ...tireUpdates, updatedAt: now });
    }
    if (bike && (bikeUpdates.bikeType !== undefined || bikeUpdates.primaryGoal !== undefined)) {
      await ctx.runMutation(updateBike, { bikeId: bike._id,
        ...(bikeUpdates.bikeType !== undefined ? { bikeType: bikeUpdates.bikeType as Doc<"bikes">["bikeType"],
          bikeTypeSource: "user" as const, needsTypeConfirmation: false } : {}),
        ...(bikeUpdates.primaryGoal !== undefined
          ? { primaryGoal: bikeUpdates.primaryGoal as Doc<"bikes">["primaryGoal"] } : {}),
      });
      delete bikeUpdates.bikeType;
      delete bikeUpdates.primaryGoal;
    }
    if (bike && Object.keys(bikeUpdates).length) {
      await ctx.db.patch(bike._id, { ...bikeUpdates, updatedAt: now } as Partial<Doc<"bikes">>);
    }
    return { status: "saved" as const, fields: changed.map(change => change.field) };
  },
});
