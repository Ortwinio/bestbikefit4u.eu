import { mutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { requireSessionOwner, requireUserId } from "../lib/authz";
import { mapBikeCategory, mapAmbition } from "./inputMapping";

/**
 * Generate recommendations for a completed session.
 * Gathers profile data, transitions status to "processing", then schedules
 * the generateFromData action to run the heavy computation outside the
 * mutation transaction (longer CPU budget, Node.js runtime).
 * Results arrive via the reactive `getBySession` subscription.
 */
export const generate = mutation({
  args: {
    sessionId: v.id("fitSessions"),
  },
  handler: async (ctx, args) => {
    const { userId, session } = await requireSessionOwner(ctx, args.sessionId);

    // Return early if recommendation already exists
    const existingRecommendationId = await getExistingRecommendationId(
      ctx,
      args.sessionId
    );
    if (existingRecommendationId) {
      return;
    }

    // Skip re-scheduling if already processing or not ready
    if (
      session.status !== "questionnaire_complete" &&
      session.status !== "processing"
    ) {
      return;
    }

    // Transition to "processing" to signal work is in progress
    if (session.status === "questionnaire_complete") {
      await ctx.db.patch(args.sessionId, { status: "processing" });
    }

    // Get the profile
    const profile = await ctx.db.get(session.profileId);
    if (!profile) throw new Error("Profile not found");
    if (profile.userId !== userId) throw new Error("Profile not found");

    // Resolve bike type (snapshot on session takes priority over linked bike)
    let bikeType: string | undefined = session.bikeType;
    let frameStackMm: number | undefined;
    let frameReachMm: number | undefined;
    if (session.bikeId) {
      const bike = await ctx.db.get(session.bikeId);
      if (bike && bike.userId === userId) {
        if (!bikeType) bikeType = bike.bikeType;
        frameStackMm = bike.currentGeometry?.stackMm ?? undefined;
        frameReachMm = bike.currentGeometry?.reachMm ?? undefined;
      }
    }

    const bikeCategory = mapBikeCategory(session, bikeType);
    const ambition = mapAmbition(session.primaryGoal);

    // Schedule the action — computation happens outside the mutation transaction
    await ctx.scheduler.runAfter(
      0,
      internal.recommendations.actions.generateFromData,
      {
        sessionId: args.sessionId,
        userId,
        heightCm: profile.heightCm,
        inseamCm: profile.inseamCm,
        torsoLengthCm: profile.torsoLengthCm,
        armLengthCm: profile.armLengthCm,
        shoulderWidthCm: profile.shoulderWidthCm,
        footLengthCm: profile.footLengthCm,
        flexibilityScore: profile.flexibilityScore,
        coreStabilityScore: profile.coreStabilityScore,
        bikeCategory,
        ambition,
        painPoints: session.painPoints,
        frameStackMm,
        frameReachMm,
      }
    );
  },
});

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

export const create = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    userId: v.id("users"),
    calculatedFit: v.object({
      recommendedStackMm: v.number(),
      recommendedReachMm: v.number(),
      effectiveTopTubeMm: v.number(),
      saddleHeightMm: v.number(),
      saddleSetbackMm: v.number(),
      saddleHeightRange: v.object({
        min: v.number(),
        max: v.number(),
      }),
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
    const userId = await requireUserId(ctx);
    if (args.userId !== userId) {
      throw new Error("Not authorized");
    }

    const { session } = await requireSessionOwner(ctx, args.sessionId);
    if (session.userId !== userId) {
      throw new Error("Not authorized");
    }

    return await ctx.db.insert("recommendations", {
      sessionId: args.sessionId,
      userId,
      calculatedFit: args.calculatedFit,
      confidenceScore: args.confidenceScore,
      algorithmVersion: args.algorithmVersion,
      frameSizeRecommendations: args.frameSizeRecommendations,
      fitNotes: args.fitNotes,
      adjustmentPriorities: args.adjustmentPriorities,
      painPointSolutions: args.painPointSolutions,
      createdAt: Date.now(),
    });
  },
});
