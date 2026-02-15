import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { validateShortString, validateTextString } from "../lib/validation";

// Create or update profile
export const upsert = mutation({
  args: {
    // Required measurements
    heightCm: v.number(),
    inseamCm: v.number(),
    flexibilityScore: v.union(
      v.literal("very_limited"),
      v.literal("limited"),
      v.literal("average"),
      v.literal("good"),
      v.literal("excellent")
    ),

    // Core stability (1-5)
    coreStabilityScore: v.number(),

    // Optional measurements
    armLengthCm: v.optional(v.number()),
    torsoLengthCm: v.optional(v.number()),
    femurLengthCm: v.optional(v.number()),
    shoulderWidthCm: v.optional(v.number()),
    footLengthCm: v.optional(v.number()),
    handSpanCm: v.optional(v.number()),
    sitBoneWidthMm: v.optional(v.number()),

    // Optional injury history
    injuryHistory: v.optional(
      v.array(
        v.object({
          bodyArea: v.string(),
          description: v.string(),
          severity: v.union(
            v.literal("mild"),
            v.literal("moderate"),
            v.literal("severe")
          ),
          isOngoing: v.boolean(),
        })
      )
    ),

    // Additional info
    age: v.optional(v.number()),
    weightKg: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Validate string lengths for free-text fields
    if (args.injuryHistory) {
      for (const injury of args.injuryHistory) {
        validateShortString(injury.bodyArea, "injuryHistory.bodyArea");
        validateTextString(injury.description, "injuryHistory.description");
      }
    }

    // Check for existing profile
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const profileData = {
      userId,
      heightCm: args.heightCm,
      inseamCm: args.inseamCm,
      armLengthCm: args.armLengthCm || args.heightCm * 0.44, // Fallback estimate
      torsoLengthCm: args.torsoLengthCm || args.heightCm * 0.32, // Fallback estimate
      femurLengthCm: args.femurLengthCm,
      shoulderWidthCm: args.shoulderWidthCm || 42, // Default
      footLengthCm: args.footLengthCm,
      handSpanCm: args.handSpanCm,
      sitBoneWidthMm: args.sitBoneWidthMm,
      flexibilityScore: args.flexibilityScore,
      coreStabilityScore: args.coreStabilityScore,
      injuryHistory: args.injuryHistory,
      age: args.age,
      weightKg: args.weightKg,
      updatedAt: Date.now(),
    };

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, profileData);
      return existingProfile._id;
    } else {
      // Create new profile
      return await ctx.db.insert("profiles", profileData);
    }
  },
});

// Update specific profile fields
export const updateMeasurements = mutation({
  args: {
    heightCm: v.optional(v.number()),
    inseamCm: v.optional(v.number()),
    armLengthCm: v.optional(v.number()),
    torsoLengthCm: v.optional(v.number()),
    femurLengthCm: v.optional(v.number()),
    shoulderWidthCm: v.optional(v.number()),
    footLengthCm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.heightCm !== undefined) updates.heightCm = args.heightCm;
    if (args.inseamCm !== undefined) updates.inseamCm = args.inseamCm;
    if (args.armLengthCm !== undefined) updates.armLengthCm = args.armLengthCm;
    if (args.torsoLengthCm !== undefined)
      updates.torsoLengthCm = args.torsoLengthCm;
    if (args.femurLengthCm !== undefined)
      updates.femurLengthCm = args.femurLengthCm;
    if (args.shoulderWidthCm !== undefined)
      updates.shoulderWidthCm = args.shoulderWidthCm;
    if (args.footLengthCm !== undefined)
      updates.footLengthCm = args.footLengthCm;

    await ctx.db.patch(profile._id, updates);
    return profile._id;
  },
});

// Update flexibility and core scores
export const updateAssessment = mutation({
  args: {
    flexibilityScore: v.union(
      v.literal("very_limited"),
      v.literal("limited"),
      v.literal("average"),
      v.literal("good"),
      v.literal("excellent")
    ),
    coreStabilityScore: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      flexibilityScore: args.flexibilityScore,
      coreStabilityScore: args.coreStabilityScore,
      updatedAt: Date.now(),
    });

    return profile._id;
  },
});
