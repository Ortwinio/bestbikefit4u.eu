import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireUserId } from "../lib/authz";

export const listForWheelset = query({
  args: { wheelsetId: v.id("wheelsets") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const wheelset = await ctx.db.get(args.wheelsetId);
    if (!wheelset || wheelset.userId !== userId) {
      return [];
    }

    return await ctx.db
      .query("tireSetups")
      .withIndex("by_wheelset", (q) => q.eq("wheelsetId", args.wheelsetId))
      .collect();
  },
});

export const get = query({
  args: { tireSetupId: v.id("tireSetups") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tireSetup = await ctx.db.get(args.tireSetupId);
    if (!tireSetup || tireSetup.userId !== userId) {
      return null;
    }
    return tireSetup;
  },
});
