import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireSessionOwner } from "../lib/authz";
import { buildConservativeRefinementSuggestion } from "../recommendations/refinement";

function isRideFeedbackBetaEnabled(): boolean {
  return process.env.ENGINE_V2_FEEDBACK_BETA_ENABLED?.toLowerCase() === "true";
}

export const submitBeta = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    implementationStatus: v.union(
      v.literal("confirmed"),
      v.literal("partial"),
      v.literal("not_implemented")
    ),
    comfortScore: v.number(),
    handlingScore: v.optional(v.number()),
    performanceFeelScore: v.optional(v.number()),
    kneePainArea: v.optional(
      v.union(
        v.literal("front"),
        v.literal("back"),
        v.literal("medial"),
        v.literal("lateral")
      )
    ),
    kneePainSeverity: v.optional(v.number()),
    lowerBackDiscomfortScore: v.optional(v.number()),
    handPressureScore: v.optional(v.number()),
    saddlePressureScore: v.optional(v.number()),
    climbingConfidenceScore: v.optional(v.number()),
    descendingControlScore: v.optional(v.number()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    if (!isRideFeedbackBetaEnabled()) {
      throw new Error("Ride feedback beta is disabled");
    }

    const { userId, session } = await requireSessionOwner(ctx, args.sessionId);

    const refinementSuggestion = buildConservativeRefinementSuggestion({
      implementationStatus: args.implementationStatus,
      comfortScore: args.comfortScore,
      kneePainArea: args.kneePainArea,
      kneePainSeverity: args.kneePainSeverity,
      lowerBackDiscomfortScore: args.lowerBackDiscomfortScore,
      handPressureScore: args.handPressureScore,
      saddlePressureScore: args.saddlePressureScore,
      climbingConfidenceScore: args.climbingConfidenceScore,
      descendingControlScore: args.descendingControlScore,
    });

    return await ctx.db.insert("rideFeedbackEntries", {
      sessionId: args.sessionId,
      userId,
      bikeId: session.bikeId,
      bikeProfileId: session.bikeProfileId,
      implementationStatus: args.implementationStatus,
      comfortScore: args.comfortScore,
      handlingScore: args.handlingScore,
      performanceFeelScore: args.performanceFeelScore,
      kneePainArea: args.kneePainArea,
      kneePainSeverity: args.kneePainSeverity,
      lowerBackDiscomfortScore: args.lowerBackDiscomfortScore,
      handPressureScore: args.handPressureScore,
      saddlePressureScore: args.saddlePressureScore,
      climbingConfidenceScore: args.climbingConfidenceScore,
      descendingControlScore: args.descendingControlScore,
      notes: args.notes,
      tags: args.tags,
      refinementSuggestion,
      createdAt: Date.now(),
    });
  },
});
