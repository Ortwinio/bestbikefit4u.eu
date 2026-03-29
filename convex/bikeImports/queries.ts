import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireUserId } from "../lib/authz";
import { buildBikeImportPreview } from "./shared";

export const getPreview = query({
  args: {
    importId: v.id("bikeImports"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const row = await ctx.db.get(args.importId);
    if (!row || row.userId !== userId) {
      return null;
    }

    return buildBikeImportPreview(row);
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("bikeImports")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((row) => buildBikeImportPreview(row));
  },
});
