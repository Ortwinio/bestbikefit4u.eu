import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";

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
