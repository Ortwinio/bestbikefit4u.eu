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
const calculatedFitValidator = v.object({
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
});

export const storeResult = internalMutation({
  args: {
    sessionId: v.id("fitSessions"),
    userId: v.id("users"),
    calculatedFit: calculatedFitValidator,
    climbingCalculatedFit: v.optional(calculatedFitValidator),
    comparisonSnapshot: v.optional(
      v.object({
        saddleHeightMm: v.number(),
        saddleSetbackMm: v.number(),
        barDropMm: v.number(),
        saddleToBarReachMm: v.number(),
        stemLengthMm: v.number(),
        crankLengthMm: v.number(),
        handlebarWidthMm: v.number(),
        confidenceScore: v.number(),
      })
    ),
    recommendationItems: v.optional(
      v.array(
        v.object({
          parameter: v.string(),
          target: v.number(),
          rangeLow: v.optional(v.number()),
          rangeHigh: v.optional(v.number()),
          confidence: v.optional(v.number()),
          method: v.optional(v.string()),
          why: v.optional(v.string()),
          feasibility: v.optional(
            v.union(
              v.literal("direct"),
              v.literal("component_change_required"),
              v.literal("not_yet_evaluated")
            )
          ),
          riskFlags: v.optional(v.array(v.string())),
          changeOrder: v.optional(v.number()),
        })
      )
    ),
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
      bikeProfileId: session?.bikeProfileId,
      engineVersion: session?.engineVersion ?? "v2",
      sourceType: session?.engineVersion === "v2" ? "engine_v2" : "engine_v1",
      comparisonSnapshot: args.comparisonSnapshot,
      recommendationItems: args.recommendationItems,
      calculatedFit: args.calculatedFit,
      climbingCalculatedFit: args.climbingCalculatedFit,
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

export const storeShadowComparison = internalMutation({
  args: {
    sessionId: v.id("fitSessions"),
    userId: v.id("users"),
    baselineEngineVersion: v.union(
      v.literal("v1"),
      v.literal("v2_shadow"),
      v.literal("v2")
    ),
    shadowEngineVersion: v.union(
      v.literal("v1"),
      v.literal("v2_shadow"),
      v.literal("v2")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    baselineSnapshot: v.object({
      saddleHeightMm: v.number(),
      saddleSetbackMm: v.number(),
      barDropMm: v.number(),
      saddleToBarReachMm: v.number(),
      stemLengthMm: v.number(),
      crankLengthMm: v.number(),
      handlebarWidthMm: v.number(),
      confidenceScore: v.number(),
    }),
    shadowSnapshot: v.optional(
      v.object({
        saddleHeightMm: v.number(),
        saddleSetbackMm: v.number(),
        barDropMm: v.number(),
        saddleToBarReachMm: v.number(),
        stemLengthMm: v.number(),
        crankLengthMm: v.number(),
        handlebarWidthMm: v.number(),
        confidenceScore: v.number(),
      })
    ),
    deltas: v.optional(
      v.object({
        saddleHeightMm: v.number(),
        saddleSetbackMm: v.number(),
        barDropMm: v.number(),
        saddleToBarReachMm: v.number(),
        stemLengthMm: v.number(),
        crankLengthMm: v.number(),
        handlebarWidthMm: v.number(),
        confidenceScore: v.number(),
      })
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("recommendationShadowComparisons")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const [oldest] = [...existing].sort((a, b) => a.createdAt - b.createdAt);
    if (oldest) {
      await ctx.db.patch(oldest._id, {
        status: args.status,
        baselineEngineVersion: args.baselineEngineVersion,
        shadowEngineVersion: args.shadowEngineVersion,
        baselineSnapshot: args.baselineSnapshot,
        shadowSnapshot: args.shadowSnapshot,
        deltas: args.deltas,
        errorMessage: args.errorMessage,
        completedAt:
          args.status === "completed" || args.status === "failed"
            ? Date.now()
            : undefined,
      });
      return oldest._id;
    }

    return await ctx.db.insert("recommendationShadowComparisons", {
      sessionId: args.sessionId,
      userId: args.userId,
      baselineEngineVersion: args.baselineEngineVersion,
      shadowEngineVersion: args.shadowEngineVersion,
      status: args.status,
      baselineSnapshot: args.baselineSnapshot,
      shadowSnapshot: args.shadowSnapshot,
      deltas: args.deltas,
      errorMessage: args.errorMessage,
      createdAt: Date.now(),
      completedAt:
        args.status === "completed" || args.status === "failed"
          ? Date.now()
          : undefined,
    });
  },
});
