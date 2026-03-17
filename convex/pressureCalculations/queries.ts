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
