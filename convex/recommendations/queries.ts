import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  requireRecommendationOwner,
} from "../lib/authz";

export const getBySession = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) return null;

    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    if (recommendations.length === 0) {
      return null;
    }

    const [oldestRecommendation] = [...recommendations].sort(
      (a, b) => a.createdAt - b.createdAt
    );
    return oldestRecommendation ?? null;
  },
});

export const getById = query({
  args: { id: v.id("recommendations") },
  handler: async (ctx, args) => {
    const { recommendation } = await requireRecommendationOwner(ctx, args.id);
    return recommendation;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
