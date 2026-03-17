import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";

export const listForBike = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    await requireBikeOwner(ctx, args.bikeId);
    const wheelsets = await ctx.db
      .query("wheelsets")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();

    return wheelsets.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: { wheelsetId: v.id("wheelsets") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const wheelset = await ctx.db.get(args.wheelsetId);
    if (!wheelset || wheelset.userId !== userId) {
      return null;
    }
    return wheelset;
  },
});
