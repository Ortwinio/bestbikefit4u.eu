import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  validateNumberRange,
  validateShortString,
  validateTextString,
} from "../lib/validation";

const PROFILE_RANGES = {
  heightCm: [120, 230],
  inseamCm: [50, 120],
  armLengthCm: [35, 110],
  torsoLengthCm: [30, 90],
  femurLengthCm: [20, 80],
  shoulderWidthCm: [25, 70],
  footLengthCm: [15, 40],
  handSpanCm: [10, 35],
  sitBoneWidthMm: [70, 220],
  coreStabilityScore: [1, 5],
  age: [10, 100],
  weightKg: [30, 250],
} as const;

function validateProfileMeasurements(args: {
  heightCm?: number;
  inseamCm?: number;
  armLengthCm?: number;
  torsoLengthCm?: number;
  femurLengthCm?: number;
  shoulderWidthCm?: number;
  footLengthCm?: number;
  handSpanCm?: number;
  sitBoneWidthMm?: number;
  coreStabilityScore?: number;
  age?: number;
  weightKg?: number;
}) {
  if (args.heightCm !== undefined) {
    validateNumberRange(
      args.heightCm,
      "heightCm",
      PROFILE_RANGES.heightCm[0],
      PROFILE_RANGES.heightCm[1]
    );
  }
  if (args.inseamCm !== undefined) {
    validateNumberRange(
      args.inseamCm,
      "inseamCm",
      PROFILE_RANGES.inseamCm[0],
      PROFILE_RANGES.inseamCm[1]
    );
  }
  if (args.armLengthCm !== undefined) {
    validateNumberRange(
      args.armLengthCm,
      "armLengthCm",
      PROFILE_RANGES.armLengthCm[0],
      PROFILE_RANGES.armLengthCm[1]
    );
  }
  if (args.torsoLengthCm !== undefined) {
    validateNumberRange(
      args.torsoLengthCm,
      "torsoLengthCm",
      PROFILE_RANGES.torsoLengthCm[0],
      PROFILE_RANGES.torsoLengthCm[1]
    );
  }
  if (args.femurLengthCm !== undefined) {
    validateNumberRange(
      args.femurLengthCm,
      "femurLengthCm",
      PROFILE_RANGES.femurLengthCm[0],
      PROFILE_RANGES.femurLengthCm[1]
    );
  }
  if (args.shoulderWidthCm !== undefined) {
    validateNumberRange(
      args.shoulderWidthCm,
      "shoulderWidthCm",
      PROFILE_RANGES.shoulderWidthCm[0],
      PROFILE_RANGES.shoulderWidthCm[1]
    );
  }
  if (args.footLengthCm !== undefined) {
    validateNumberRange(
      args.footLengthCm,
      "footLengthCm",
      PROFILE_RANGES.footLengthCm[0],
      PROFILE_RANGES.footLengthCm[1]
    );
  }
  if (args.handSpanCm !== undefined) {
    validateNumberRange(
      args.handSpanCm,
      "handSpanCm",
      PROFILE_RANGES.handSpanCm[0],
      PROFILE_RANGES.handSpanCm[1]
    );
  }
  if (args.sitBoneWidthMm !== undefined) {
    validateNumberRange(
      args.sitBoneWidthMm,
      "sitBoneWidthMm",
      PROFILE_RANGES.sitBoneWidthMm[0],
      PROFILE_RANGES.sitBoneWidthMm[1]
    );
  }
  if (args.coreStabilityScore !== undefined) {
    validateNumberRange(
      args.coreStabilityScore,
      "coreStabilityScore",
      PROFILE_RANGES.coreStabilityScore[0],
      PROFILE_RANGES.coreStabilityScore[1]
    );
    if (!Number.isInteger(args.coreStabilityScore)) {
      throw new Error("coreStabilityScore must be a whole number");
    }
  }
  if (args.age !== undefined) {
    validateNumberRange(
      args.age,
      "age",
      PROFILE_RANGES.age[0],
      PROFILE_RANGES.age[1]
    );
  }
  if (args.weightKg !== undefined) {
    validateNumberRange(
      args.weightKg,
      "weightKg",
      PROFILE_RANGES.weightKg[0],
      PROFILE_RANGES.weightKg[1]
    );
  }
}

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

    validateProfileMeasurements({
      heightCm: args.heightCm,
      inseamCm: args.inseamCm,
      armLengthCm: args.armLengthCm,
      torsoLengthCm: args.torsoLengthCm,
      femurLengthCm: args.femurLengthCm,
      shoulderWidthCm: args.shoulderWidthCm,
      footLengthCm: args.footLengthCm,
      handSpanCm: args.handSpanCm,
      sitBoneWidthMm: args.sitBoneWidthMm,
      coreStabilityScore: args.coreStabilityScore,
      age: args.age,
      weightKg: args.weightKg,
    });

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

    validateProfileMeasurements({
      heightCm: args.heightCm,
      inseamCm: args.inseamCm,
      armLengthCm: args.armLengthCm,
      torsoLengthCm: args.torsoLengthCm,
      femurLengthCm: args.femurLengthCm,
      shoulderWidthCm: args.shoulderWidthCm,
      footLengthCm: args.footLengthCm,
    });

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

    validateProfileMeasurements({
      coreStabilityScore: args.coreStabilityScore,
    });

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
