import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireSessionOwner } from "../lib/authz";

export const listBySession = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    const entries = await ctx.db
      .query("rideFeedbackEntries")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return entries.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getLatestBySession = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    const entries = await ctx.db
      .query("rideFeedbackEntries")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return entries.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
  },
});
