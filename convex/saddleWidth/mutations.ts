import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireBikeOwner, requireUserId } from "../lib/authz";

export const createPublicSaddleWidthSession = mutation({
  args: {
    measurementMethod: v.union(v.literal("measured"), v.literal("estimated")),
    sitBoneWidthMm: v.optional(v.number()),
    heightCm: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    hipCircumferenceCm: v.optional(v.number()),
    ridingType: v.string(),
    postureCategory: v.string(),
    recommendedWidthMm: v.number(),
    widthRangeMinMm: v.number(),
    widthRangeMaxMm: v.number(),
    primaryWidthClass: v.string(),
    saddleFamily: v.string(),
    noseType: v.string(),
    profileShape: v.string(),
    cutoutRecommended: v.boolean(),
    paddingPreference: v.string(),
    confidenceScore: v.number(),
    confidenceLevel: v.string(),
    explanationKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("saddleWidthSessions", {
      userId: undefined,
      bikeId: undefined,
      sessionType: "public",
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const createDashboardSaddleWidthSession = mutation({
  args: {
    bikeId: v.optional(v.id("bikes")),
    measurementMethod: v.union(v.literal("measured"), v.literal("estimated")),
    sitBoneWidthMm: v.optional(v.number()),
    heightCm: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    hipCircumferenceCm: v.optional(v.number()),
    flexibilityScore: v.optional(v.number()),
    coreStabilityScore: v.optional(v.number()),
    ridingType: v.string(),
    postureCategory: v.string(),
    indoorOutdoor: v.optional(v.string()),
    typicalRideLength: v.optional(v.string()),
    currentSaddleWidthMm: v.optional(v.number()),
    currentSaddleShape: v.optional(v.string()),
    currentSaddleTilt: v.optional(v.string()),
    currentSaddleSatisfaction: v.optional(v.string()),
    symptoms: v.optional(v.array(v.string())),
    recommendedWidthMm: v.number(),
    widthRangeMinMm: v.number(),
    widthRangeMaxMm: v.number(),
    primaryWidthClass: v.string(),
    saddleFamily: v.string(),
    noseType: v.string(),
    profileShape: v.string(),
    cutoutRecommended: v.boolean(),
    paddingPreference: v.string(),
    confidenceScore: v.number(),
    confidenceLevel: v.string(),
    widthMatchScore: v.optional(v.number()),
    fitInteractionWarnings: v.optional(v.array(v.string())),
    explanationKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (args.bikeId) {
      await requireBikeOwner(ctx, args.bikeId);
    }

    return await ctx.db.insert("saddleWidthSessions", {
      userId,
      sessionType: "dashboard",
      ...args,
      createdAt: Date.now(),
    });
  },
});
