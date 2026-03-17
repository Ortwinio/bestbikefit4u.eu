import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";

export const listForBike = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    await requireBikeOwner(ctx, args.bikeId);
    return await ctx.db
      .query("pressureProfiles")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
  },
});

export const get = query({
  args: { profileId: v.id("pressureProfiles") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.userId !== userId) {
      return null;
    }
    return profile;
  },
});
