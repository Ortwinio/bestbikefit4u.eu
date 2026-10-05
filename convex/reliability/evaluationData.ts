import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const getEvaluationContext = internalQuery({
  args: { measurementId: v.id("reliabilityKneeMeasurements") },
  handler: async (ctx, args) => {
    const measurement = await ctx.db.get(args.measurementId);
    if (!measurement || measurement.evaluationSentAt !== undefined || measurement.evaluationAt > Date.now()) return null;
    const user = await ctx.db.get(measurement.userId);
    if (!user?.email || user.isAnonymous || user.emailPreferences?.service === false) return null;
    if (measurement.bikeId) {
      const bike = await ctx.db.get(measurement.bikeId);
      if (!bike || bike.userId !== user._id) return null;
    }
    const newer = await ctx.db.query("reliabilityKneeMeasurements")
      .withIndex("by_user", range => range.eq("userId", user._id)).collect();
    if (newer.some(item => item.bikeId === measurement.bikeId && item.recordedAt > measurement.recordedAt)) return null;
    return { user, measurement };
  },
});

export const markEvaluationSent = internalMutation({
  args: { measurementId: v.id("reliabilityKneeMeasurements") },
  handler: async (ctx, args) => {
    const measurement = await ctx.db.get(args.measurementId);
    if (measurement && measurement.evaluationSentAt === undefined) {
      await ctx.db.patch(measurement._id, { evaluationSentAt: Date.now() });
    }
  },
});
