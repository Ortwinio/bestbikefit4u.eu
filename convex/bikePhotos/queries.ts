import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";

export const listForBike = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    await requireBikeOwner(ctx, args.bikeId);

    const photos = await ctx.db
      .query("bikePhotos")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();

    return [...photos].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) {
        return a.isPrimary ? -1 : 1;
      }
      const leftSort = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const rightSort = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (leftSort !== rightSort) {
        return leftSort - rightSort;
      }
      return b.createdAt - a.createdAt;
    });
  },
});

export const get = query({
  args: { photoId: v.id("bikePhotos") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const photo = await ctx.db.get(args.photoId);
    if (!photo || photo.userId !== userId) {
      return null;
    }
    return photo;
  },
});
