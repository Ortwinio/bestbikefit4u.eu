import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireBikeProfileOwner, requireUserId } from "../lib/authz";

export const getById = query({
  args: { bikeProfileId: v.id("bikeProfiles") },
  handler: async (ctx, args) => {
    const { bikeProfile } = await requireBikeProfileOwner(ctx, args.bikeProfileId);
    return bikeProfile;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("bikeProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listByBike = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    await requireBikeOwner(ctx, args.bikeId);
    const profiles = await ctx.db
      .query("bikeProfiles")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();

    return profiles
      .filter((profile) => profile.status === "active")
      .sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.createdAt - b.createdAt;
      });
  },
});

export const getDefaultByBike = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    await requireBikeOwner(ctx, args.bikeId);
    return await ctx.db
      .query("bikeProfiles")
      .withIndex("by_bike_default", (q) =>
        q.eq("bikeId", args.bikeId).eq("isDefault", true)
      )
      .first();
  },
});
