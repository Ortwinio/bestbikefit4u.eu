import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireUserId } from "../lib/authz";

export const getLatestSaddleWidthSession = query({
  args: { bikeId: v.optional(v.id("bikes")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const sessions = await ctx.db
      .query("saddleWidthSessions")
      .withIndex("by_user_session_type", (q) =>
        q.eq("userId", userId).eq("sessionType", "dashboard")
      )
      .order("desc")
      .collect();

    return (
      sessions.find((session) => !args.bikeId || session.bikeId === args.bikeId) ?? null
    );
  },
});

export const listSaddleWidthSessions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("saddleWidthSessions")
      .withIndex("by_user_session_type", (q) =>
        q.eq("userId", userId).eq("sessionType", "dashboard")
      )
      .order("desc")
      .take(args.limit ?? 10);
  },
});
