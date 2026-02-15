import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireBikeOwner, requireSessionOwner } from "../lib/authz";
import { validateShortString } from "../lib/validation";

export const create = mutation({
  args: {
    bikeType: v.union(
      v.literal("road"),
      v.literal("gravel"),
      v.literal("mountain"),
      v.literal("hybrid"),
      v.literal("tt_triathlon"),
      v.literal("cyclocross"),
      v.literal("touring"),
      v.literal("city")
    ),
    ridingStyle: v.union(
      v.literal("recreational"),
      v.literal("fitness"),
      v.literal("sportive"),
      v.literal("racing"),
      v.literal("commuting"),
      v.literal("touring")
    ),
    primaryGoal: v.union(
      v.literal("comfort"),
      v.literal("balanced"),
      v.literal("performance"),
      v.literal("aerodynamics")
    ),
    bikeId: v.optional(v.id("bikes")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.bikeId) {
      const { bike } = await requireBikeOwner(ctx, args.bikeId);
      if (bike.bikeType !== args.bikeType) {
        throw new Error("Bike type must match selected bike");
      }
    }

    // Get user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile required to start a fit session");

    return await ctx.db.insert("fitSessions", {
      userId,
      profileId: profile._id,
      bikeId: args.bikeId,
      bikeType: args.bikeType,
      status: "in_progress",
      ridingStyle: args.ridingStyle,
      primaryGoal: args.primaryGoal,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    status: v.union(
      v.literal("in_progress"),
      v.literal("questionnaire_complete"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    const updates: Record<string, unknown> = { status: args.status };
    if (args.status === "completed") {
      updates.completedAt = Date.now();
    }
    await ctx.db.patch(args.sessionId, updates);
  },
});

export const addPainPoints = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    painPoints: v.array(
      v.object({
        area: v.string(),
        frequency: v.union(
          v.literal("rarely"),
          v.literal("sometimes"),
          v.literal("often"),
          v.literal("always")
        ),
        severity: v.union(
          v.literal("mild"),
          v.literal("moderate"),
          v.literal("severe")
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    for (const point of args.painPoints) {
      validateShortString(point.area, "painPoints.area");
    }
    await ctx.db.patch(args.sessionId, {
      painPoints: args.painPoints,
    });
  },
});

export const updateRidingDetails = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    weeklyHours: v.optional(v.number()),
    longestRideKm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    const updates: Record<string, unknown> = {};
    if (args.weeklyHours !== undefined) updates.weeklyHours = args.weeklyHours;
    if (args.longestRideKm !== undefined)
      updates.longestRideKm = args.longestRideKm;
    await ctx.db.patch(args.sessionId, updates);
  },
});
