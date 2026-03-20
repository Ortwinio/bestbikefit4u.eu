import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { validateStringLength } from "../lib/validation";

const MAX_JSON_BLOB = 10000;

const disciplineValidator = v.union(
  v.literal("road"),
  v.literal("gravel"),
  v.literal("mtb"),
  v.literal("tt")
);

const tubeTypeValidator = v.union(
  v.literal("inner_tube"),
  v.literal("latex_tube"),
  v.literal("tubeless")
);

const surfaceValidator = v.union(
  v.literal("smooth_asphalt"),
  v.literal("average_asphalt"),
  v.literal("rough_asphalt"),
  v.literal("hardpack_gravel"),
  v.literal("loose_gravel"),
  v.literal("trail")
);

export const save = mutation({
  args: {
    bikeId: v.optional(v.id("bikes")),
    tireSetupId: v.optional(v.id("tireSetups")),
    sourceType: v.union(
      v.literal("public_basic"),
      v.literal("dashboard_basic"),
      v.literal("dashboard_advanced")
    ),
    inputSnapshot: v.object({
      bodyWeightKg: v.number(),
      bikeWeightKg: v.optional(v.number()),
      extraLuggageKg: v.optional(v.number()),
      discipline: disciplineValidator,
      widthFrontMm: v.number(),
      widthRearMm: v.number(),
      tubeType: tubeTypeValidator,
      casingType: v.optional(v.string()),
      rimType: v.optional(v.union(v.literal("hooked"), v.literal("hookless"))),
      internalRimWidthFrontMm: v.optional(v.number()),
      internalRimWidthRearMm: v.optional(v.number()),
      surface: surfaceValidator,
      ridingGoal: v.optional(
        v.union(
          v.literal("speed"),
          v.literal("balance"),
          v.literal("comfort")
        )
      ),
      isWet: v.optional(v.boolean()),
      routeDistanceKm: v.optional(v.number()),
      routeElevationM: v.optional(v.number()),
      offRoadPercent: v.optional(v.number()),
    }),
    recommendedFrontBar: v.number(),
    recommendedRearBar: v.number(),
    recommendedFrontPsi: v.number(),
    recommendedRearPsi: v.number(),
    currentFrontBar: v.optional(v.number()),
    currentRearBar: v.optional(v.number()),
    comfortScore: v.optional(v.number()),
    gripScore: v.optional(v.number()),
    efficiencyScore: v.optional(v.number()),
    warningsJson: v.optional(v.string()),
    routeContextJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.warningsJson !== undefined) validateStringLength(args.warningsJson, "warningsJson", MAX_JSON_BLOB);
    if (args.routeContextJson !== undefined) validateStringLength(args.routeContextJson, "routeContextJson", MAX_JSON_BLOB);
    const userId = await requireUserId(ctx);
    if (args.bikeId) {
      await requireBikeOwner(ctx, args.bikeId);
    }
    if (args.tireSetupId) {
      const tireSetup = await ctx.db.get(args.tireSetupId);
      if (!tireSetup || tireSetup.userId !== userId) {
        throw new Error("Tire setup not found");
      }
    }

    return await ctx.db.insert("pressureCalculations", {
      userId,
      bikeId: args.bikeId,
      tireSetupId: args.tireSetupId,
      sourceType: args.sourceType,
      inputSnapshot: args.inputSnapshot,
      recommendedFrontBar: args.recommendedFrontBar,
      recommendedRearBar: args.recommendedRearBar,
      recommendedFrontPsi: args.recommendedFrontPsi,
      recommendedRearPsi: args.recommendedRearPsi,
      currentFrontBar: args.currentFrontBar,
      currentRearBar: args.currentRearBar,
      comfortScore: args.comfortScore,
      gripScore: args.gripScore,
      efficiencyScore: args.efficiencyScore,
      warningsJson: args.warningsJson,
      routeContextJson: args.routeContextJson,
      createdAt: Date.now(),
    });
  },
});
