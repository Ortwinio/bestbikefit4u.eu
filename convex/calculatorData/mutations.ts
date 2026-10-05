import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import { assertPaidProfileWrite } from "../profiles/paidAccess";
import { PROFILE_OBSERVATION_FIELDS } from "../../shared/profileObservationFields";
import { calculatorInput } from "./validators";
import { inputKind, profileField, shouldReplace, validateInput } from "./merge";
import { readCalculatorInputs } from "./queries";
import { getInseamObservationQuality } from "../../shared/reliability/measurementQuality";
import { calculatorDataKey, isProfileCalculatorField } from "../../shared/calculatorDataScope";

export const save = mutation({
  args: { entries: v.array(calculatorInput), expectedUserId: v.id("users"), removedFields: v.optional(v.array(v.string())),
    calculator: v.optional(v.string()),
    confirmedProfileFields: v.optional(v.array(v.object({ field: v.string(),
      expectedValue: v.union(v.number(), v.string()), expectedTouchedAt: v.number() }))),
    inseamConfirmed: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (userId !== args.expectedUserId) throw new Error("ACCOUNT_CHANGED");
    if (args.entries.length > 64 || new Set(args.entries.map(calculatorDataKey)).size !== args.entries.length) {
      throw new Error("INVALID_CALCULATOR_INPUT");
    }
    const now = Date.now();
    const incoming = args.entries.map(entry => validateInput(entry, now));
    const { profile, entries } = await readCalculatorInputs(ctx, userId);
    const merged = new Map(entries.map(entry => [calculatorDataKey(entry), entry]));
    if ((args.removedFields?.length ?? 0) > 64 || (args.confirmedProfileFields?.length ?? 0) > 64
      || (args.removedFields?.length && (!args.calculator?.trim() || args.calculator.length > 100))) {
      throw new Error("INVALID_CALCULATOR_INPUT");
    }
    const removedFields = (args.removedFields ?? []).filter(field => !Object.hasOwn(PROFILE_OBSERVATION_FIELDS, profileField(field)));
    for (const field of removedFields) merged.delete(calculatorDataKey({ field, calculator: args.calculator! }));
    const accepted = incoming.filter(entry => {
      const current = merged.get(calculatorDataKey(entry));
      if (!isProfileCalculatorField(entry.field)) return !current || entry.touchedAt > current.touchedAt;
      const confirmation = args.confirmedProfileFields?.find(candidate => candidate.field === entry.field);
      if (confirmation) {
        if (!current || current.value !== confirmation.expectedValue || current.touchedAt !== confirmation.expectedTouchedAt) {
          throw new Error("PROFILE_VALUE_CHANGED");
        }
        return entry.touchedAt > current.touchedAt;
      }
      return shouldReplace(current, entry);
    });
    const updates: Record<string, number | string> = {};
    for (const entry of accepted) {
      merged.set(calculatorDataKey(entry), entry);
      const field = profileField(entry.field);
      if (!Object.hasOwn(PROFILE_OBSERVATION_FIELDS, field)) continue;
      updates[field] = field === "flexibilityScore" && typeof entry.value === "number"
        ? ["very_limited", "limited", "average", "good", "excellent"][entry.value - 1] : entry.value;
      if (field === "weightKg") updates.weightUpdatedAt = entry.touchedAt;
      if (field === "ftpWatts") updates.ftpMeasuredAt = entry.touchedAt;
    }
    const inseamChanged = accepted.some(entry => entry.field === "inseamCm");
    const heightChanged = accepted.some(entry => entry.field === "heightCm");
    const storedInseam = merged.get("inseamCm");
    const inseamQuality = (inseamChanged || heightChanged) && storedInseam && typeof storedInseam.value === "number"
      ? getInseamObservationQuality({ heightCm: Number(updates.heightCm ?? profile?.heightCm) || undefined,
        inseamCm: storedInseam.value, confirmed: inseamChanged && args.inseamConfirmed === true,
        repeatCount: inseamChanged ? 1 : storedInseam.repeatCount,
        withinTolerance: !inseamChanged && storedInseam.withinTolerance }) : undefined;
    if (inseamQuality && storedInseam) merged.set("inseamCm", { ...storedInseam, ...inseamQuality });
    await assertPaidProfileWrite(ctx, userId, updates, profile, true);
    if (accepted.length || removedFields.length) {
      const record = { ...updates, calculatorInputs: [...merged.values()], updatedAt: now, riderProfileUpdatedAt: now };
      if (profile) await ctx.db.patch(profile._id, record);
      else await ctx.db.insert("profiles", { userId, ...record });
      for (const entry of accepted) {
        const field = profileField(entry.field);
        if (!Object.hasOwn(PROFILE_OBSERVATION_FIELDS, field)) continue;
        const previous = await ctx.db.query("profileObservations").withIndex("by_user_field_bike_status", range =>
          range.eq("userId", userId).eq("field", field).eq("bikeId", undefined).eq("status", "current")).collect();
        for (const observation of previous) await ctx.db.patch(observation._id, { status: "superseded" });
        await ctx.db.insert("profileObservations", { userId, field, value: updates[field], unit: entry.unit,
          kind: inputKind(entry), method: entry.measurementMethod ?? entry.method, recordedAt: entry.touchedAt,
          source: "profile_edit", status: "current", ...(field === "inseamCm" ? inseamQuality : {}) });
      }
      if (inseamQuality && !inseamChanged) {
        const previous = await ctx.db.query("profileObservations").withIndex("by_user_field_bike_status", range =>
          range.eq("userId", userId).eq("field", "inseamCm").eq("bikeId", undefined).eq("status", "current")).collect();
        for (const observation of previous) await ctx.db.patch(observation._id, inseamQuality);
      }
    }
    return { acceptedFields: accepted.map(entry => entry.field),
      retainedFields: [...incoming.filter(entry => !accepted.includes(entry)).map(entry => entry.field),
        ...(args.removedFields ?? []).filter(field => !removedFields.includes(field))], removedFields };
  },
});
