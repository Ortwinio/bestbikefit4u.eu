import { saddlePreferences } from "./schema";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireUserId } from "../lib/authz";
import { recordProfileObservations } from "../profiles/provenance";
import { getUserAccess } from "../pricing/access";
import { checkInseamPlausibility } from "../../shared/reliability/saddleHeight";
import { calculateKneeAngle } from "../../shared/reliability/kneeAngle";
import { latestMeasurementMean, ownedBike, saddleProvenance, saddleState, validRequestId } from "./state";

export const saveInseamMeasurement = mutation({
  args: { valueCm: v.number(), method: v.optional(v.union(v.literal("single_measurement"),
    v.literal("fitter"), v.literal("video"))), confirmed: v.optional(v.boolean()),
    override: v.optional(v.boolean()), requestId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    validRequestId(args.requestId);
    const state = await saddleState(ctx, userId);
    const existing = await ctx.db.query("reliabilityInseamMeasurements")
      .withIndex("by_user_request", range => range.eq("userId", userId).eq("requestId", args.requestId)).unique();
    if (existing) {
      if (existing.valueCm !== args.valueCm || existing.method !== (args.method ?? "single_measurement")) {
        throw new Error("Measurement request conflict");
      }
      return { status: "saved" as const, measurementId: existing._id,
        ...existing.summary };
    }
    if (!Number.isFinite(args.valueCm) || args.valueCm < 55 || args.valueCm > 105) throw new Error("Invalid inseam");
    const check = state.profile?.heightCm === undefined ? null
      : checkInseamPlausibility(state.profile.heightCm, args.valueCm);
    if (check?.status === "error") throw new Error("Invalid inseam");
    if (check?.status === "large" && !args.override) throw new Error("INSEAM_OVERRIDE_REQUIRED");
    const unresolvedWarning = check?.status === "large" || (check?.status === "check" && !args.confirmed);
    const now = Date.now();
    const method = args.method ?? "single_measurement";
    const seriesId = state.activeSeriesId ?? args.requestId;
    // An actual existing measured value is the first repeat; declared slider defaults are never seeded.
    if (!state.measurements.length && state.profile?.inseamCm !== undefined
      && Number.isFinite(state.profile.inseamCm) && state.profile.inseamCm >= 55 && state.profile.inseamCm <= 105
      && state.observations.some(item => item.field === "inseamCm" && item.kind === "measured")) {
      await ctx.db.insert("reliabilityInseamMeasurements", { userId, valueCm: state.profile.inseamCm,
        method: state.observations.find(item => item.field === "inseamCm")?.method ?? "single_measurement",
        recordedAt: state.observations.find(item => item.field === "inseamCm")!.recordedAt,
        requestId: `internal-seed-${args.requestId}`, seriesId, unresolvedWarning:
          saddleProvenance(state.observations).unresolvedWarning === true });
    }
    const measurementId = await ctx.db.insert("reliabilityInseamMeasurements", {
      userId, valueCm: args.valueCm, method, recordedAt: now, requestId: args.requestId, seriesId, unresolvedWarning,
    });
    const rows = (await ctx.db.query("reliabilityInseamMeasurements")
      .withIndex("by_user", range => range.eq("userId", userId)).collect())
      .filter(row => row.seriesId === seriesId).sort((a, b) => b._creationTime - a._creationTime).slice(0, 3);
    const summary = latestMeasurementMean(rows);
    const updates = { inseamCm: summary.meanInseamCm };
    await recordProfileObservations(ctx, userId, updates, state.profile, {
      kinds: { inseamCm: "measured" },
      method: rows.every(row => row.method === method) ? method : "single_measurement",
      confirm: true, inseamConfirmed: args.confirmed, unresolvedWarning: rows.some(row => row.unresolvedWarning),
      repeatCount: summary.repeatCount, withinTolerance: summary.withinTolerance,
    });
    if (state.profile) await ctx.db.patch(state.profile._id, { ...updates, updatedAt: now, riderProfileUpdatedAt: now });
    else await ctx.db.insert("profiles", { userId, ...updates, updatedAt: now, riderProfileUpdatedAt: now });
    const observation = await ctx.db.query("profileObservations")
      .withIndex("by_user_field_bike_status", range => range.eq("userId", userId).eq("field", "inseamCm")
        .eq("bikeId", undefined).eq("status", "current")).unique();
    const savedSummary = { ...summary, unresolvedWarning: rows.some(row => row.unresolvedWarning)
      || observation?.unresolvedWarning === true };
    await ctx.db.patch(measurementId, { profileObservationId: observation?._id, summary: savedSummary });
    return { status: "saved" as const, measurementId, ...savedSummary };
  },
});

export const saveKneeAngle = mutation({
  args: { angleDegrees: v.number(), currentSaddleHeightMm: v.number(),
    bikeId: v.optional(v.id("bikes")), requestId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    validRequestId(args.requestId);
    if (!Number.isFinite(args.currentSaddleHeightMm) || args.currentSaddleHeightMm <= 0
      || args.currentSaddleHeightMm > 1200) throw new Error("Invalid saddle height");
    const state = await saddleState(ctx, userId, args.bikeId);
    if (!(await getUserAccess(ctx, userId, args.bikeId)).fullReport) throw new Error("PAID_ACCESS_REQUIRED");
    const existing = await ctx.db.query("reliabilityKneeMeasurements")
      .withIndex("by_user_request", range => range.eq("userId", userId).eq("requestId", args.requestId)).unique();
    if (existing && (existing.angleDegrees !== args.angleDegrees
      || existing.currentSaddleHeightMm !== args.currentSaddleHeightMm || existing.bikeId !== args.bikeId)) {
      throw new Error("Measurement request conflict");
    }
    if (existing) {
      const saved = calculateKneeAngle({ angleDegrees: existing.angleDegrees,
        currentSaddleHeightMm: existing.currentSaddleHeightMm, inseamCm: existing.inseamCm,
        provenance: existing.provenance });
      return { ...saved, _id: existing._id, evaluationAt: existing.evaluationAt };
    }
    if (!state.model) throw new Error("PROFILE_MEASUREMENTS_REQUIRED");
    const model = calculateKneeAngle({ angleDegrees: args.angleDegrees,
      currentSaddleHeightMm: args.currentSaddleHeightMm, inseamCm: state.model.meanInseamCm,
      provenance: state.model.provenance });
    const now = Date.now();
    const evaluationAt = now + 7 * 24 * 60 * 60 * 1000;
    const id = await ctx.db.insert("reliabilityKneeMeasurements", { userId, bikeId: args.bikeId,
      requestId: args.requestId, angleDegrees: args.angleDegrees, currentSaddleHeightMm: args.currentSaddleHeightMm,
      inseamCm: state.model.meanInseamCm, provenance: state.model.provenance, sigmaInseamMm: model.range.sigmaInseamMm,
      inWindow: model.inWindow, stepMm: model.stepMm, targetSaddleHeightMm: model.targetSaddleHeightMm,
      recordedAt: now, evaluationAt });
    await ctx.scheduler.runAt(evaluationAt, internal.reliability.evaluation.sendEvaluation, { measurementId: id });
    return { ...model, _id: id, evaluationAt };
  },
});

export const saveSaddlePreferences = mutation({
  args: { bikeId: v.optional(v.id("bikes")), ...saddlePreferences,
    flexibilityScore: v.optional(v.number()), coreScore: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await ownedBike(ctx, userId, args.bikeId);
    for (const score of [args.flexibilityScore, args.coreScore]) {
      if (score !== undefined && (!Number.isInteger(score) || score < 1 || score > 5)) throw new Error("Invalid score");
    }
    if (args.currentSaddleHeightMm !== undefined && (!Number.isFinite(args.currentSaddleHeightMm)
      || args.currentSaddleHeightMm <= 0 || args.currentSaddleHeightMm > 1200)) throw new Error("Invalid saddle height");
    const { bikeId, flexibilityScore, coreScore, ...preferences } = args;
    const saved = await ctx.db.query("reliabilitySaddlePreferences")
      .withIndex("by_user_bike", range => range.eq("userId", userId).eq("bikeId", bikeId)).unique();
    const updates = Object.fromEntries(Object.entries(preferences).filter(([, value]) => value !== undefined));
    if (Object.keys(updates).length) {
      if (saved) await ctx.db.patch(saved._id, { ...updates, updatedAt: Date.now() });
      else await ctx.db.insert("reliabilitySaddlePreferences", { userId, bikeId, ...updates, updatedAt: Date.now() });
    }
    const profile = await ctx.db.query("profiles").withIndex("by_user", range => range.eq("userId", userId)).unique();
    const labels = ["very_limited", "limited", "average", "good", "excellent"] as const;
    const profileUpdates = { ...(flexibilityScore !== undefined ? { flexibilityScore: labels[flexibilityScore - 1] } : {}),
      ...(coreScore !== undefined ? { coreStabilityScore: coreScore } : {}) };
    if (Object.keys(profileUpdates).length) {
      await recordProfileObservations(ctx, userId, profileUpdates, profile, {
        kinds: { flexibilityScore: "estimated", coreStabilityScore: "estimated" }, method: "self_assessment" });
      if (profile) await ctx.db.patch(profile._id, { ...profileUpdates, updatedAt: Date.now(), riderProfileUpdatedAt: Date.now() });
      else await ctx.db.insert("profiles", { userId, ...profileUpdates, updatedAt: Date.now(), riderProfileUpdatedAt: Date.now() });
    }
    return { status: "saved" as const };
  },
});
