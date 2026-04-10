import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireUserId } from "../lib/authz";

export const listGearingSessions = query({
  args: { limit: v.optional(v.number()), bikeId: v.optional(v.id("bikes")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const limit = args.limit ?? 10;

    if (args.bikeId) {
      return await ctx.db
        .query("gearingSessions")
        .withIndex("by_user_bike_session_type", (q) =>
          q.eq("userId", userId).eq("bikeId", args.bikeId).eq("sessionType", "dashboard")
        )
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("gearingSessions")
      .withIndex("by_user_session_type", (q) =>
        q.eq("userId", userId).eq("sessionType", "dashboard")
      )
      .order("desc")
      .take(limit);
  },
});

export const getLatestGearingSession = query({
  args: { bikeId: v.optional(v.id("bikes")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    if (args.bikeId) {
      const sessions = await ctx.db
        .query("gearingSessions")
        .withIndex("by_user_bike_session_type", (q) =>
          q.eq("userId", userId).eq("bikeId", args.bikeId).eq("sessionType", "dashboard")
        )
        .order("desc")
        .take(1);
      return sessions[0] ?? null;
    }

    const sessions = await ctx.db
      .query("gearingSessions")
      .withIndex("by_user_session_type", (q) =>
        q.eq("userId", userId).eq("sessionType", "dashboard")
      )
      .order("desc")
      .take(1);

    return sessions[0] ?? null;
  },
});
