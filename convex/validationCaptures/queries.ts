import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireSessionOwner } from "../lib/authz";

export const listBySession = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    const captures = await ctx.db
      .query("validationCaptures")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return captures
      .filter((capture) => capture.status === "active")
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});
