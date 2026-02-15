/**
 * Recommendation Actions
 * Generates bike fit recommendations using the calculation engine
 */

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import {
  calculateBikeFit,
  mapFlexibilityScore,
  mapCoreScore,
  type FitInputs,
} from "../lib/fitAlgorithm";

/**
 * Internal action to generate recommendations from provided data
 * This should be called from a mutation that gathers all the data first
 */
export const generateFromData = internalAction({
  args: {
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

    // Optional bike geometry
    frameStackMm: v.optional(v.number()),
    frameReachMm: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    // Build inputs for the algorithm
    const fitInputs: FitInputs = {
      category: args.bikeCategory,
      ambition: args.ambition,
      heightMm: args.heightCm * 10,
      inseamMm: args.inseamCm * 10,
      flexibilityScore: mapFlexibilityScore(
        getFlexibilityNumeric(args.flexibilityScore) as 1 | 2 | 3 | 4 | 5
      ),
      coreScore: mapCoreScore(
        Math.min(5, Math.max(1, args.coreStabilityScore)) as 1 | 2 | 3 | 4 | 5
      ),
      torsoMm: args.torsoLengthCm ? args.torsoLengthCm * 10 : undefined,
      armMm: args.armLengthCm ? args.armLengthCm * 10 : undefined,
      shoulderWidthMm: args.shoulderWidthCm
        ? args.shoulderWidthCm * 10
        : undefined,
      footLengthMm: args.footLengthCm ? args.footLengthCm * 10 : undefined,
      frameStackMm: args.frameStackMm,
      frameReachMm: args.frameReachMm,
    };

    // Run the calculation
    const result = calculateBikeFit(fitInputs);

    // Return the full result to be stored by the calling mutation
    return {
      calculatedFit: {
        recommendedStackMm: result.frameStackTargetMm,
        recommendedReachMm: result.frameReachTargetMm,
        effectiveTopTubeMm: result.saddleToBarReachMm + 50,
        saddleHeightMm: result.saddleHeightMm,
        saddleSetbackMm: result.saddleSetbackMm,
        saddleHeightRange: result.saddleHeightRange,
        handlebarDropMm: result.barDropMm,
        handlebarReachMm: result.saddleToBarReachMm,
        stemLengthMm: result.stemLengthMm,
        stemAngleRecommendation: `${result.stemAngleDeg}°`,
        crankLengthMm: result.crankLengthMm,
        handlebarWidthMm: result.handlebarWidthMm,
      },
      confidenceScore: result.confidenceScore,
      algorithmVersion: result.algorithmVersion,
      frameSizeRecommendations: generateFrameSizeRecommendations(result),
      fitNotes: generateFitNotes(result, fitInputs),
      adjustmentPriorities: generateAdjustmentPriorities(result),
      warnings: result.warnings,
    };
  },
});

// Helper to convert flexibility score string to number
function getFlexibilityNumeric(
  score: "very_limited" | "limited" | "average" | "good" | "excellent"
): number {
  const map = {
    very_limited: 1,
    limited: 2,
    average: 3,
    good: 4,
    excellent: 5,
  };
  return map[score] || 3;
}

// Generate frame size recommendations
function generateFrameSizeRecommendations(
  result: ReturnType<typeof calculateBikeFit>
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
  result: ReturnType<typeof calculateBikeFit>,
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

// Generate adjustment priorities
function generateAdjustmentPriorities(
  result: ReturnType<typeof calculateBikeFit>
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
