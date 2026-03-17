import { internalMutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { computePressureInsights } from "../lib/pressureFitInteraction";

async function getExistingRecommendationId(
  ctx: MutationCtx,
  sessionId: Id<"fitSessions">
): Promise<Id<"recommendations"> | null> {
  const existing = await ctx.db
    .query("recommendations")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .collect();
  if (existing.length === 0) return null;
  const [oldest] = [...existing].sort((a, b) => a.createdAt - b.createdAt);
  return oldest?._id ?? null;
}

/**
 * Stores the computed recommendation result and marks the session as completed.
 * Called by the generateAndStore action after the fit algorithm finishes.
 */
export const storeResult = internalMutation({
  args: {
    sessionId: v.id("fitSessions"),
    userId: v.id("users"),
    calculatedFit: v.object({
      recommendedStackMm: v.number(),
      recommendedReachMm: v.number(),
      effectiveTopTubeMm: v.number(),
      saddleHeightMm: v.number(),
      saddleSetbackMm: v.number(),
      saddleHeightRange: v.object({ min: v.number(), max: v.number() }),
      handlebarDropMm: v.number(),
      handlebarReachMm: v.number(),
      stemLengthMm: v.number(),
      stemAngleRecommendation: v.string(),
      crankLengthMm: v.number(),
      handlebarWidthMm: v.number(),
    }),
    confidenceScore: v.number(),
    algorithmVersion: v.string(),
    frameSizeRecommendations: v.array(
      v.object({
        brand: v.optional(v.string()),
        size: v.string(),
        fitScore: v.number(),
        notes: v.optional(v.string()),
      })
    ),
    fitNotes: v.array(v.string()),
    adjustmentPriorities: v.array(
      v.object({
        priority: v.number(),
        component: v.string(),
        currentValue: v.optional(v.string()),
        recommendedValue: v.string(),
        rationale: v.string(),
      })
    ),
    painPointSolutions: v.optional(
      v.array(
        v.object({
          painArea: v.string(),
          cause: v.string(),
          solution: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Idempotency: skip if another transaction already stored the result
    const existing = await getExistingRecommendationId(ctx, args.sessionId);
    if (existing) return existing;

    const session = await ctx.db.get(args.sessionId);
    const bike = session?.bikeId ? await ctx.db.get(session.bikeId) : null;
    const pressureCalculations =
      session?.bikeId
        ? await ctx.db
            .query("pressureCalculations")
            .withIndex("by_bike", (q) => q.eq("bikeId", session.bikeId))
            .collect()
        : [];
    const latestPressureCalc =
      pressureCalculations.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    const pressureInsights = computePressureInsights(
      { calculatedFit: args.calculatedFit },
      latestPressureCalc,
      bike,
      profile?.weightKg
    );

    const recId = await ctx.db.insert("recommendations", {
      sessionId: args.sessionId,
      userId: args.userId,
      bikeId: session?.bikeId,
      calculatedFit: args.calculatedFit,
      confidenceScore: args.confidenceScore,
      algorithmVersion: args.algorithmVersion,
      frameSizeRecommendations: args.frameSizeRecommendations,
      fitNotes: args.fitNotes,
      adjustmentPriorities: args.adjustmentPriorities,
      painPointSolutions: args.painPointSolutions,
      pressureInsights,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.sessionId, {
      status: "completed",
      completedAt: Date.now(),
    });

    return recId;
  },
});
