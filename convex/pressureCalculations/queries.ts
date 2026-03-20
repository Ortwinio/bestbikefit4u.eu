import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { isPressureStale } from "../lib/pressureStaleness";

export const listForBike = query({
  args: {
    bikeId: v.id("bikes"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireBikeOwner(ctx, args.bikeId);
    const calculations = await ctx.db
      .query("pressureCalculations")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();

    return calculations
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, args.limit ?? calculations.length);
  },
});

export const listForUser = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const calculations = await ctx.db
      .query("pressureCalculations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return calculations
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, args.limit ?? calculations.length);
  },
});

export const getLatestForBike = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    await requireBikeOwner(ctx, args.bikeId);
    const calculations = await ctx.db
      .query("pressureCalculations")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();

    return calculations.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
  },
});

export const getLatestByBike = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    await requireBikeOwner(ctx, args.bikeId);
    const calculations = await ctx.db
      .query("pressureCalculations")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();

    return calculations.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
  },
});

export const getLatestByBikeForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const bikes = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const calculations = await ctx.db
      .query("pressureCalculations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const latestByBike: Record<string, (typeof calculations)[number]> = {};

    for (const calculation of calculations) {
      if (!calculation.bikeId) continue;
      const current = latestByBike[calculation.bikeId];
      if (!current || calculation.createdAt > current.createdAt) {
        latestByBike[calculation.bikeId] = calculation;
      }
    }

    return bikes.map((bike) => ({
      bikeId: bike._id,
      latestCalculation: latestByBike[bike._id] ?? null,
    }));
  },
});

export const getRecalculableBikeCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const bikes = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let recalculableBikeCount = 0;

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

      if (activeTireSetup) {
        recalculableBikeCount += 1;
      }
    }

    return recalculableBikeCount;
  },
});

export const isBikePressureStale = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const { userId } = await requireBikeOwner(ctx, args.bikeId);
    const calculations = await ctx.db
      .query("pressureCalculations")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
    const latestCalc =
      calculations.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const wheelsets = await ctx.db
      .query("wheelsets")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
    const activeWheelset = wheelsets.find((wheelset) => wheelset.isActive) ?? wheelsets[0] ?? null;

    const tireSetups = activeWheelset
      ? await ctx.db
          .query("tireSetups")
          .withIndex("by_wheelset", (q) => q.eq("wheelsetId", activeWheelset._id))
          .collect()
      : [];
    const activeTireSetup =
      tireSetups.find((tireSetup) => tireSetup.isActive) ?? tireSetups[0] ?? null;

    return {
      isStale: isPressureStale(latestCalc, profile, activeTireSetup),
      lastCalcAt: latestCalc?.createdAt ?? null,
      weightUpdatedAt: profile?.weightUpdatedAt ?? null,
      pressureInputUpdatedAt: activeTireSetup?.updatedAt ?? null,
    };
  },
});
