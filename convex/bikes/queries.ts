import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { isPressureStale } from "../lib/pressureStaleness";

export const getById = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const { bike } = await requireBikeOwner(ctx, args.bikeId);
    return bike;
  },
});

export const get = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const bike = await ctx.db.get(args.bikeId);
    if (!bike || bike.userId !== userId) {
      return null;
    }
    return bike;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    return await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listSummariesByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const bikes = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return await Promise.all(
      bikes.map(async (bike) => {
        const wheelsets = await ctx.db
          .query("wheelsets")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .collect();
        const activeWheelset =
          wheelsets.find((wheelset) => wheelset.isActive) ??
          [...wheelsets].sort((a, b) => b.createdAt - a.createdAt)[0] ??
          null;

        const tireSetups = activeWheelset
          ? await ctx.db
              .query("tireSetups")
              .withIndex("by_wheelset", (q) => q.eq("wheelsetId", activeWheelset._id))
              .collect()
          : [];
        const activeTireSetup =
          tireSetups.find((tireSetup) => tireSetup.isActive) ??
          [...tireSetups].sort((a, b) => b.createdAt - a.createdAt)[0] ??
          null;

        const calculations = await ctx.db
          .query("pressureCalculations")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .collect();
        const latestCalculation =
          [...calculations].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

        const recommendations = await ctx.db
          .query("recommendations")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .collect();
        const latestRecommendation =
          [...recommendations].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

        return {
          ...bike,
          latestRecommendationSummary: latestRecommendation
            ? {
                sessionId: latestRecommendation.sessionId,
                algorithmVersion: latestRecommendation.algorithmVersion,
                createdAt: latestRecommendation.createdAt,
                pressureWarningCount:
                  latestRecommendation.pressureInsights?.warnings.length ?? 0,
              }
            : null,
          advisedPressureSummary: latestCalculation
            ? {
                createdAt: latestCalculation.createdAt,
                recommendedFrontBar: latestCalculation.recommendedFrontBar,
                recommendedRearBar: latestCalculation.recommendedRearBar,
                recommendedFrontPsi: latestCalculation.recommendedFrontPsi,
                recommendedRearPsi: latestCalculation.recommendedRearPsi,
                currentFrontBar: latestCalculation.currentFrontBar,
                currentRearBar: latestCalculation.currentRearBar,
              }
            : null,
          activeWheelsetSummary: activeWheelset
            ? {
                name: activeWheelset.name,
                rimType: activeWheelset.rimType,
                internalRimWidthFrontMm: activeWheelset.internalRimWidthFrontMm,
                internalRimWidthRearMm: activeWheelset.internalRimWidthRearMm,
              }
            : null,
          activeTireSetupSummary: activeTireSetup
            ? {
                name: activeTireSetup.name,
                brand: activeTireSetup.brand,
                model: activeTireSetup.model,
                widthFrontMm: activeTireSetup.widthFrontMm,
                widthRearMm: activeTireSetup.widthRearMm,
                tubeType: activeTireSetup.tubeType,
                casingType: activeTireSetup.casingType,
                maxPressureBar: activeTireSetup.maxPressureBar,
              }
            : null,
          pressureStateSummary: {
            isStale: isPressureStale(latestCalculation, profile, activeTireSetup),
            hasCurrentPressure:
              latestCalculation?.currentFrontBar !== undefined ||
              latestCalculation?.currentRearBar !== undefined,
          },
        };
      })
    );
  },
});

export const getCurrentBike = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const bikes = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return [...bikes].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
  },
});
