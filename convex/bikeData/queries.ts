import { query } from "../_generated/server";
import { v } from "convex/values";

export const listBrands = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("bikeBrands")
      .withIndex("by_name")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const listModelsByBrand = query({
  args: { brandId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bikeModels")
      .withIndex("by_brand_id", (q) => q.eq("brandId", args.brandId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});
