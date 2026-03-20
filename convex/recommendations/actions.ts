/**
 * Recommendation Actions
 * Generates bike fit recommendations using the calculation engine
 */

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { FitInputs, FitOutputs } from "../lib/fitAlgorithm";
import { runEngineV1Seed } from "./seedEngine";
import {
  buildShadowDeltas,
  isEngineV2ShadowEnabled,
} from "./shadowMode";

/**
 * Internal action that runs the fit algorithm and stores the result.
 * Scheduled by the `generate` mutation so heavy computation runs in an
 * action context (Node.js runtime, longer CPU budget).
 */
export const generateFromData = internalAction({
  args: {
    // Context for storage
    sessionId: v.id("fitSessions"),
    userId: v.id("users"),

    // Input data (already fetched by calling mutation)
    heightCm: v.number(),
    inseamCm: v.number(),
    torsoLengthCm: v.optional(v.number()),
    armLengthCm: v.optional(v.number()),
    shoulderWidthCm: v.optional(v.number()),
    footLengthCm: v.optional(v.number()),
    flexibilityScore: v.union(
      v.literal("very_limited"),
      v.literal("limited"),
      v.literal("average"),
      v.literal("good"),
      v.literal("excellent")
    ),
    coreStabilityScore: v.number(),

    // Session config
    bikeCategory: v.union(
      v.literal("road"),
      v.literal("gravel"),
      v.literal("mtb"),
      v.literal("city")
    ),
    ambition: v.union(
      v.literal("comfort"),
      v.literal("balanced"),
      v.literal("performance"),
      v.literal("aero")
    ),

    // Riding context
    painPoints: v.optional(
      v.array(
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
      )
    ),

    // Optional bike geometry
    frameStackMm: v.optional(v.number()),
    frameReachMm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const seed = runEngineV1Seed({
      heightCm: args.heightCm,
      inseamCm: args.inseamCm,
      torsoLengthCm: args.torsoLengthCm,
      armLengthCm: args.armLengthCm,
      shoulderWidthCm: args.shoulderWidthCm,
      footLengthCm: args.footLengthCm,
      flexibilityScore: args.flexibilityScore,
      coreStabilityScore: args.coreStabilityScore,
      bikeCategory: args.bikeCategory,
      ambition: args.ambition,
      frameStackMm: args.frameStackMm,
      frameReachMm: args.frameReachMm,
    });

    const fitNotes = generateFitNotes(seed.fitOutputs, seed.fitInputs);
    const painPointSolutions =
      args.painPoints && args.painPoints.length > 0
        ? args.painPoints.map((pp) => ({
            painArea: pp.area,
            cause: getPainCause(pp.area),
            solution: getPainSolution(pp.area, seed.fitOutputs),
          }))
        : undefined;

    // Store the result via an internal mutation (serialised, idempotent)
    await ctx.runMutation(internal.recommendations.internalMutations.storeResult, {
      sessionId: args.sessionId,
      userId: args.userId,
      calculatedFit: seed.calculatedFit,
      comparisonSnapshot: seed.comparisonSnapshot,
      recommendationItems: seed.recommendationItems,
      confidenceScore: seed.confidenceScore,
      algorithmVersion: seed.algorithmVersion,
      frameSizeRecommendations: generateFrameSizeRecommendations(seed.fitOutputs),
      fitNotes,
      adjustmentPriorities: generateAdjustmentPriorities(seed.fitOutputs),
      painPointSolutions,
    });

    if (isEngineV2ShadowEnabled()) {
      await ctx.scheduler.runAfter(
        0,
        internal.recommendations.actions.runShadowComparison,
        {
          sessionId: args.sessionId,
          userId: args.userId,
          heightCm: args.heightCm,
          inseamCm: args.inseamCm,
          torsoLengthCm: args.torsoLengthCm,
          armLengthCm: args.armLengthCm,
          shoulderWidthCm: args.shoulderWidthCm,
          footLengthCm: args.footLengthCm,
          flexibilityScore: args.flexibilityScore,
          coreStabilityScore: args.coreStabilityScore,
          bikeCategory: args.bikeCategory,
          ambition: args.ambition,
          frameStackMm: args.frameStackMm,
          frameReachMm: args.frameReachMm,
          baselineSnapshot: seed.comparisonSnapshot,
        }
      );
    }
  },
});

export const runShadowComparison = internalAction({
  args: {
    sessionId: v.id("fitSessions"),
    userId: v.id("users"),
    heightCm: v.number(),
    inseamCm: v.number(),
    torsoLengthCm: v.optional(v.number()),
    armLengthCm: v.optional(v.number()),
    shoulderWidthCm: v.optional(v.number()),
    footLengthCm: v.optional(v.number()),
    flexibilityScore: v.union(
      v.literal("very_limited"),
      v.literal("limited"),
      v.literal("average"),
      v.literal("good"),
      v.literal("excellent")
    ),
    coreStabilityScore: v.number(),
    bikeCategory: v.union(
      v.literal("road"),
      v.literal("gravel"),
      v.literal("mtb"),
      v.literal("city")
    ),
    ambition: v.union(
      v.literal("comfort"),
      v.literal("balanced"),
      v.literal("performance"),
      v.literal("aero")
    ),
    frameStackMm: v.optional(v.number()),
    frameReachMm: v.optional(v.number()),
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
  },
  handler: async (ctx, args) => {
    try {
      const shadowSeed = runEngineV1Seed({
        heightCm: args.heightCm,
        inseamCm: args.inseamCm,
        torsoLengthCm: args.torsoLengthCm,
        armLengthCm: args.armLengthCm,
        shoulderWidthCm: args.shoulderWidthCm,
        footLengthCm: args.footLengthCm,
        flexibilityScore: args.flexibilityScore,
        coreStabilityScore: args.coreStabilityScore,
        bikeCategory: args.bikeCategory,
        ambition: args.ambition,
        frameStackMm: args.frameStackMm,
        frameReachMm: args.frameReachMm,
      });

      await ctx.runMutation(
        internal.recommendations.internalMutations.storeShadowComparison,
        {
          sessionId: args.sessionId,
          userId: args.userId,
          baselineEngineVersion: "v2",
          shadowEngineVersion: "v2_shadow",
          status: "completed",
          baselineSnapshot: args.baselineSnapshot,
          shadowSnapshot: shadowSeed.comparisonSnapshot,
          deltas: buildShadowDeltas({
            baseline: args.baselineSnapshot,
            shadow: shadowSeed.comparisonSnapshot,
          }),
        }
      );
    } catch (error) {
      await ctx.runMutation(
        internal.recommendations.internalMutations.storeShadowComparison,
        {
          sessionId: args.sessionId,
          userId: args.userId,
          baselineEngineVersion: "v2",
          shadowEngineVersion: "v2_shadow",
          status: "failed",
          baselineSnapshot: args.baselineSnapshot,
          errorMessage:
            error instanceof Error
              ? error.message
              : "Shadow comparison failed",
        }
      );
    }
  },
});

// Generate frame size recommendations
function generateFrameSizeRecommendations(
  result: FitOutputs
) {
  const stack = result.frameStackTargetMm;
  const reach = result.frameReachTargetMm;

  return [
    {
      size: estimateFrameSize(stack, reach),
      fitScore: result.confidenceScore,
      notes: "Based on your measurements and preferences",
    },
  ];
}

function estimateFrameSize(stackMm: number, reachMm: number): string {
  if (stackMm < 520 || reachMm < 370) return "XS (48-50cm)";
  if (stackMm < 550 || reachMm < 385) return "S (51-53cm)";
  if (stackMm < 580 || reachMm < 400) return "M (54-55cm)";
  if (stackMm < 610 || reachMm < 415) return "L (56-58cm)";
  return "XL (59-62cm)";
}

// Generate fit notes
function generateFitNotes(
  result: FitOutputs,
  inputs: FitInputs
): string[] {
  const notes: string[] = [];

  notes.push(
    `Saddle height of ${result.saddleHeightMm}mm is optimized for your ${inputs.inseamMm}mm inseam.`
  );

  if (result.barDropMm > 100) {
    notes.push(
      "Your position is quite aggressive. Consider building up to this gradually."
    );
  } else if (result.barDropMm < 50) {
    notes.push("Your position prioritizes comfort with minimal bar drop.");
  }

  if (inputs.torsoMm && inputs.armMm) {
    notes.push(
      "Reach calculations are refined using your torso and arm measurements."
    );
  } else {
    notes.push(
      "Adding torso and arm measurements would improve reach accuracy."
    );
  }

  return notes;
}

function getPainCause(area: string): string {
  const causes: Record<string, string> = {
    lower_back: "Often caused by excessive reach or improper saddle position",
    neck: "Typically from too much bar drop or excessive reach",
    shoulders: "Usually from bars too wide or narrow, or too much weight on hands",
    hands: "Excessive weight on handlebars or poor bar angle",
    knees: "Commonly from incorrect saddle height or cleat position",
    feet: "Often from cleat misalignment or incorrect shoe fit",
    sit_bones: "Usually saddle width mismatch or incorrect saddle height",
  };
  return causes[area] || "Position may need adjustment";
}

function getPainSolution(
  area: string,
  result: FitOutputs
): string {
  const solutions: Record<string, string> = {
    lower_back: `Ensure saddle setback of ${result.saddleSetbackMm}mm and consider reducing bar drop if issues persist.`,
    neck: `Target bar drop of ${result.barDropMm}mm and ensure proper stem length of ${result.stemLengthMm}mm.`,
    shoulders: `Handlebar width of ${result.handlebarWidthMm}mm should match your shoulder width.`,
    hands: `Check that bar drop doesn't exceed ${result.barDropMm}mm and ensure proper brake lever positioning.`,
    knees: `Verify saddle height of ${result.saddleHeightMm}mm and check cleat offset of ${result.cleatOffsetMm}mm.`,
    feet: `Set cleats ${result.cleatOffsetMm}mm behind ball of foot and verify proper foot alignment.`,
    sit_bones: `Ensure saddle height of ${result.saddleHeightMm}mm allows slight knee bend at bottom of stroke.`,
  };
  return solutions[area] || "Review the recommended measurements and make gradual adjustments.";
}

// Generate adjustment priorities
function generateAdjustmentPriorities(
  result: FitOutputs
) {
  return [
    {
      priority: 1,
      component: "Cleats",
      recommendedValue: `${result.cleatOffsetMm}mm behind ball of foot`,
      rationale: "Start with cleat position for proper foot alignment",
    },
    {
      priority: 2,
      component: "Saddle Height",
      recommendedValue: `${result.saddleHeightMm}mm`,
      rationale: "Set saddle height before other adjustments",
    },
    {
      priority: 3,
      component: "Saddle Setback",
      recommendedValue: `${result.saddleSetbackMm}mm behind BB`,
      rationale: "Affects knee tracking and power transfer",
    },
    {
      priority: 4,
      component: "Bar Drop (Spacers)",
      recommendedValue: `${result.barDropMm}mm drop`,
      rationale: "Adjust spacers to achieve target drop",
    },
    {
      priority: 5,
      component: "Stem",
      recommendedValue: `${result.stemLengthMm}mm at ${result.stemAngleDeg}°`,
      rationale: "Fine-tune reach after other adjustments",
    },
  ];
}
