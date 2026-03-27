import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireUserId } from "../lib/authz";
import type { Doc } from "../_generated/dataModel";

// Returns true when all required rider profile questions have been answered.
// painAreas must be non-empty when hasPain === "yes".
export function isRiderProfileComplete(profile: Doc<"profiles">): boolean {
  return (
    profile.experienceLevel !== undefined &&
    profile.weeklyHours !== undefined &&
    profile.typicalRideLength !== undefined &&
    profile.hasPain !== undefined &&
    profile.positionPriority !== undefined &&
    (profile.hasPain !== "yes" || (profile.painAreas?.length ?? 0) > 0)
  );
}

// Get profile for the current user
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

// Get profile by user ID (internal use)
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await requireUserId(ctx);
    if (currentUserId !== args.userId) {
      throw new Error("Not authorized");
    }

    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// Check if user has completed profile
export const hasCompletedProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile !== null;
  },
});

// Returns the profile plus a computed flag indicating whether the rider
// profile questions have all been answered. Use this as a gating signal.
export const getProfileStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      return null;
    }

    return {
      profile,
      isRiderProfileComplete: isRiderProfileComplete(profile),
    };
  },
});
