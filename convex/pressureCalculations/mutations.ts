import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { validateStringLength } from "../lib/validation";
import { calculateAdvancedPressure } from "../../src/lib/pressure-engine";

const MAX_JSON_BLOB = 10000;
const MAX_USER_NOTES = 300;

function resolveDiscipline(
  bikeType:
    | "road"
    | "gravel"
    | "mountain"
    | "hybrid"
    | "tt_triathlon"
    | "cyclocross"
    | "touring"
    | "city"
): "road" | "gravel" | "mtb" | "tt" {
  switch (bikeType) {
    case "gravel":
    case "cyclocross":
    case "touring":
      return "gravel";
    case "mountain":
      return "mtb";
    case "tt_triathlon":
      return "tt";
    case "hybrid":
    case "city":
    case "road":
    default:
      return "road";
  }
}

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
    userNotes: v.optional(v.string()),
    autoNoteSource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.warningsJson !== undefined) validateStringLength(args.warningsJson, "warningsJson", MAX_JSON_BLOB);
    if (args.routeContextJson !== undefined) validateStringLength(args.routeContextJson, "routeContextJson", MAX_JSON_BLOB);
    if (args.userNotes !== undefined) validateStringLength(args.userNotes, "userNotes", MAX_USER_NOTES);
    if (args.autoNoteSource !== undefined) validateStringLength(args.autoNoteSource, "autoNoteSource", 120);
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
      userNotes: args.userNotes,
      autoNoteSource: args.autoNoteSource,
      createdAt: Date.now(),
    });
  },
});

export const updateNotes = mutation({
  args: {
    calculationId: v.id("pressureCalculations"),
    userNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const calculation = await ctx.db.get(args.calculationId);
    if (!calculation || calculation.userId !== userId) {
      throw new Error("Pressure calculation not found");
    }

    if (args.userNotes !== undefined) {
      validateStringLength(args.userNotes, "userNotes", MAX_USER_NOTES);
    }

    await ctx.db.patch(args.calculationId, {
      userNotes: args.userNotes,
    });
  },
});

export const recalculatePressureForAllBikes = mutation({
  args: {
    newWeightKg: v.number(),
    autoNoteSource: v.string(),
  },
  handler: async (ctx, args) => {
    validateStringLength(args.autoNoteSource, "autoNoteSource", 120);

    const userId = await requireUserId(ctx);
    const bikes = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let recalculatedCount = 0;

    for (const bike of bikes) {
      const wheelsets = await ctx.db
        .query("wheelsets")
        .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
        .collect();
      const activeWheelset =
        wheelsets.find((wheelset) => wheelset.isActive) ?? wheelsets[0] ?? null;

      if (!activeWheelset) {
        continue;
      }

      const tireSetups = await ctx.db
        .query("tireSetups")
        .withIndex("by_wheelset", (q) => q.eq("wheelsetId", activeWheelset._id))
        .collect();
      const activeTireSetup =
        tireSetups.find((tireSetup) => tireSetup.isActive) ?? tireSetups[0] ?? null;

      if (!activeTireSetup) {
        continue;
      }

      const latestCalculation = await ctx.db
        .query("pressureCalculations")
        .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
        .collect()
        .then((calculations) =>
          calculations.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null
        );

      const routeContext = latestCalculation?.routeContextJson
        ? (JSON.parse(latestCalculation.routeContextJson) as {
            routeDistanceKm?: number;
            routeElevationM?: number;
            offRoadPercent?: number;
          })
        : {};

      const result = calculateAdvancedPressure({
        discipline: bike.discipline ?? resolveDiscipline(bike.bikeType),
        bodyWeightKg: args.newWeightKg,
        bikeWeightKg: bike.bikeWeightKg,
        widthFrontMm: activeTireSetup.widthFrontMm,
        widthRearMm: activeTireSetup.widthRearMm,
        tubeType: activeTireSetup.tubeType,
        casingType: activeTireSetup.casingType,
        rimType: activeWheelset.rimType,
        internalRimWidthFrontMm: activeWheelset.internalRimWidthFrontMm,
        internalRimWidthRearMm: activeWheelset.internalRimWidthRearMm,
        maxPressureBar: activeTireSetup.maxPressureBar,
        surface:
          latestCalculation?.inputSnapshot.surface ?? "average_asphalt",
        ridingGoal: latestCalculation?.inputSnapshot.ridingGoal,
        isWet: latestCalculation?.inputSnapshot.isWet,
        extraLuggageKg: latestCalculation?.inputSnapshot.extraLuggageKg,
        routeDistanceKm: routeContext.routeDistanceKm,
        routeElevationM: routeContext.routeElevationM,
        offRoadPercent: routeContext.offRoadPercent,
        currentFrontBar: latestCalculation?.currentFrontBar,
        currentRearBar: latestCalculation?.currentRearBar,
      });

      await ctx.db.insert("pressureCalculations", {
        userId,
        bikeId: bike._id,
        tireSetupId: activeTireSetup._id,
        sourceType: "dashboard_advanced",
        inputSnapshot: {
          bodyWeightKg: args.newWeightKg,
          bikeWeightKg: bike.bikeWeightKg,
          extraLuggageKg: latestCalculation?.inputSnapshot.extraLuggageKg,
          discipline: bike.discipline ?? resolveDiscipline(bike.bikeType),
          widthFrontMm: activeTireSetup.widthFrontMm,
          widthRearMm: activeTireSetup.widthRearMm,
          tubeType: activeTireSetup.tubeType,
          casingType: activeTireSetup.casingType,
          rimType: activeWheelset.rimType,
          internalRimWidthFrontMm: activeWheelset.internalRimWidthFrontMm,
          internalRimWidthRearMm: activeWheelset.internalRimWidthRearMm,
          surface:
            latestCalculation?.inputSnapshot.surface ?? "average_asphalt",
          ridingGoal: latestCalculation?.inputSnapshot.ridingGoal,
          isWet: latestCalculation?.inputSnapshot.isWet,
          routeDistanceKm: routeContext.routeDistanceKm,
          routeElevationM: routeContext.routeElevationM,
          offRoadPercent: routeContext.offRoadPercent,
        },
        recommendedFrontBar: result.frontBar,
        recommendedRearBar: result.rearBar,
        recommendedFrontPsi: result.frontPsi,
        recommendedRearPsi: result.rearPsi,
        currentFrontBar: latestCalculation?.currentFrontBar,
        currentRearBar: latestCalculation?.currentRearBar,
        comfortScore: result.comfortScore,
        gripScore: result.gripScore,
        efficiencyScore: result.efficiencyScore,
        warningsJson: JSON.stringify(result.warnings),
        routeContextJson: JSON.stringify(routeContext),
        autoNoteSource: args.autoNoteSource,
        createdAt: Date.now(),
      });

      recalculatedCount += 1;
    }

    return { recalculatedCount };
  },
});
