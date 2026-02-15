import { mutation } from "../_generated/server";
import { v } from "convex/values";
import {
  calculateBikeFit,
  mapFlexibilityScore,
  mapCoreScore,
  type FitInputs,
} from "../lib/fitAlgorithm";
import { requireSessionOwner, requireUserId } from "../lib/authz";

/**
 * Generate recommendations for a completed session
 * Gathers profile data, runs calculations, and stores results
 */
export const generate = mutation({
  args: {
    sessionId: v.id("fitSessions"),
  },
  handler: async (ctx, args) => {
    const { userId, session } = await requireSessionOwner(ctx, args.sessionId);

    // Check if recommendation already exists
    const existing = await ctx.db
      .query("recommendations")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (existing) {
      return existing._id;
    }

    // Get the profile
    const profile = await ctx.db.get(session.profileId);
    if (!profile) throw new Error("Profile not found");
    if (profile.userId !== userId) throw new Error("Profile not found");

    // Map session's primaryGoal to algorithm's ambition
    const ambitionMap: Record<
      string,
      "comfort" | "balanced" | "performance" | "aero"
    > = {
      comfort: "comfort",
      balanced: "balanced",
      performance: "performance",
      aerodynamics: "aero",
    };

    // Get bike category from session's bike or infer from riding style
    let bikeCategory: "road" | "gravel" | "mtb" | "city" = "road";
    if (session.bikeId) {
      const bike = await ctx.db.get(session.bikeId);
      if (bike) {
        if (bike.userId !== userId) throw new Error("Bike not found");
        const bikeTypeMap: Record<string, "road" | "gravel" | "mtb" | "city"> =
          {
            road: "road",
            gravel: "gravel",
            mountain: "mtb",
            hybrid: "city",
            city: "city",
            tt_triathlon: "road",
            cyclocross: "gravel",
            touring: "gravel",
          };
        bikeCategory = bikeTypeMap[bike.bikeType] || "road";
      }
    } else {
      // Infer from riding style
      const styleMap: Record<string, "road" | "gravel" | "mtb" | "city"> = {
        recreational: "city",
        fitness: "road",
        sportive: "road",
        racing: "road",
        commuting: "city",
        touring: "gravel",
      };
      bikeCategory = styleMap[session.ridingStyle] || "road";
    }

    // Map flexibility score to numeric value
    const flexScoreMap: Record<string, 1 | 2 | 3 | 4 | 5> = {
      very_limited: 1,
      limited: 2,
      average: 3,
      good: 4,
      excellent: 5,
    };
    const flexNum = flexScoreMap[profile.flexibilityScore] || 3;

    // Read the real core score (stored as 1-5) and clamp it
    const coreNum =
      typeof profile.coreStabilityScore === "number"
        ? (Math.max(1, Math.min(5, Math.round(profile.coreStabilityScore))) as
            1 | 2 | 3 | 4 | 5)
        : 3; // neutral default if missing

    // Build inputs for the algorithm
    const fitInputs: FitInputs = {
      category: bikeCategory,
      ambition: ambitionMap[session.primaryGoal] || "balanced",
      heightMm: profile.heightCm * 10,
      inseamMm: profile.inseamCm * 10,
      flexibilityScore: mapFlexibilityScore(flexNum),
      coreScore: mapCoreScore(coreNum),
      torsoMm: profile.torsoLengthCm ? profile.torsoLengthCm * 10 : undefined,
      armMm: profile.armLengthCm ? profile.armLengthCm * 10 : undefined,
      shoulderWidthMm: profile.shoulderWidthCm
        ? profile.shoulderWidthCm * 10
        : undefined,
      footLengthMm: profile.footLengthCm
        ? profile.footLengthCm * 10
        : undefined,
    };

    // Run the calculation
    const result = calculateBikeFit(fitInputs);

    // Generate frame size recommendations
    const frameSizeRecommendations = [
      {
        size: estimateFrameSize(
          result.frameStackTargetMm,
          result.frameReachTargetMm
        ),
        fitScore: result.confidenceScore,
        notes: "Based on your measurements and preferences",
      },
    ];

    // Generate fit notes
    const fitNotes = generateFitNotes(result, fitInputs);

    // Generate adjustment priorities
    const adjustmentPriorities = [
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

    // Generate pain point solutions if pain points exist
    let painPointSolutions:
      | Array<{ painArea: string; cause: string; solution: string }>
      | undefined;
    if (session.painPoints && session.painPoints.length > 0) {
      painPointSolutions = session.painPoints.map((pp) => ({
        painArea: pp.area,
        cause: getPainCause(pp.area),
        solution: getPainSolution(pp.area, result),
      }));
    }

    // Create recommendation
    const recId = await ctx.db.insert("recommendations", {
      sessionId: args.sessionId,
      userId,
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
      frameSizeRecommendations,
      fitNotes,
      adjustmentPriorities,
      painPointSolutions,
      createdAt: Date.now(),
    });

    // Update session status
    await ctx.db.patch(args.sessionId, {
      status: "completed",
      completedAt: Date.now(),
    });

    return recId;
  },
});

// Helper functions
function estimateFrameSize(stackMm: number, reachMm: number): string {
  if (stackMm < 520 || reachMm < 370) return "XS (48-50cm)";
  if (stackMm < 550 || reachMm < 385) return "S (51-53cm)";
  if (stackMm < 580 || reachMm < 400) return "M (54-55cm)";
  if (stackMm < 610 || reachMm < 415) return "L (56-58cm)";
  return "XL (59-62cm)";
}

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

  if (result.warnings.length > 0) {
    result.warnings.forEach((w) => {
      if (w.severity !== "info") {
        notes.push(w.recommendation);
      }
    });
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
  result: ReturnType<typeof calculateBikeFit>
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
