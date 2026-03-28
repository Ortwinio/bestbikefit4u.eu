import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireRecommendationOwner } from "../lib/authz";

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

export const getLatestByBike = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const bike = await ctx.db.get(args.bikeId);
    if (!bike || bike.userId !== userId) {
      return null;
    }

    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();

    return recommendations.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
  },
});

export const getShadowComparisonBySession = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) return null;

    const comparisons = await ctx.db
      .query("recommendationShadowComparisons")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return comparisons.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
  },
});

export const getReportV2 = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return null;
    }

    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const recommendation =
      recommendations.sort((a, b) => a.createdAt - b.createdAt)[0] ?? null;

    const bike = session.bikeId ? await ctx.db.get(session.bikeId) : null;
    const bikeProfile = session.bikeProfileId
      ? await ctx.db.get(session.bikeProfileId)
      : null;
    const profile = await ctx.db.get(session.profileId);
    const user = await ctx.db.get(session.userId);
    const questionnaireResponses = await ctx.db
      .query("questionnaireResponses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const latestPressureCalculation = session.bikeId
      ? (
          await ctx.db
            .query("pressureCalculations")
            .withIndex("by_bike", (q) => q.eq("bikeId", session.bikeId))
            .collect()
        ).sort((a, b) => b.createdAt - a.createdAt)[0] ?? null
      : null;

    return {
      session,
      recommendation,
      bike,
      bikeProfile,
      profile,
      user,
      questionnaireResponses: questionnaireResponses.sort(
        (a, b) => a.questionOrder - b.questionOrder
      ),
      latestPressureCalculation,
    };
  },
});
