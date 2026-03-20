import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireBikeOwner, requireUserId } from "../lib/authz";

export const getById = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) return null;

    return session;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("fitSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getLatestCompleted = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("fitSessions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "completed")
      )
      .order("desc")
      .first();
  },
});

export const getSessionsWithRecommendationsByBike = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const { userId } = await requireBikeOwner(ctx, args.bikeId);

    const sessions = await ctx.db
      .query("fitSessions")
      .withIndex("by_user_bike", (q) =>
        q.eq("userId", userId).eq("bikeId", args.bikeId)
      )
      .collect();

    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();

    const recommendationBySessionId = new Map(
      recommendations.map((recommendation) => [recommendation.sessionId, recommendation])
    );

    return sessions
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((session) => ({
        session,
        recommendation: recommendationBySessionId.get(session._id) ?? null,
      }));
  },
});

export const getAllSessionsWithBikes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const [sessions, bikes, recommendations] = await Promise.all([
      ctx.db
        .query("fitSessions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("bikes")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("recommendations")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    const bikeById = new Map(bikes.map((bike) => [bike._id, bike]));
    const recommendationBySessionId = new Map(
      recommendations.map((recommendation) => [recommendation.sessionId, recommendation])
    );

    return sessions
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((session) => ({
        session,
        bike: session.bikeId ? bikeById.get(session.bikeId) ?? null : null,
        recommendation: recommendationBySessionId.get(session._id) ?? null,
      }));
  },
});
