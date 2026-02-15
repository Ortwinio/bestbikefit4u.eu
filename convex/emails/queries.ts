import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireSessionOwner } from "../lib/authz";

/**
 * Get email reports for a session
 */
export const getBySession = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    return await ctx.db
      .query("emailReports")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

/**
 * Get all email reports for current user
 */
export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("emailReports")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
