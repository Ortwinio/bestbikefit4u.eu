import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireSessionOwner } from "../lib/authz";

export const getSessionAccess = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, { sessionId }) => {
    const { userId } = await requireSessionOwner(ctx, sessionId);

    const purchases = await ctx.db
      .query("fitPassPurchases")
      .withIndex("by_user_session", (q) =>
        q.eq("userId", userId).eq("sessionId", sessionId)
      )
      .collect();

    const latestPurchase =
      purchases.sort((a, b) => b.purchasedAt - a.purchasedAt)[0] ?? null;

    return {
      hasAccess: latestPurchase !== null,
      purchasedAt: latestPurchase?.purchasedAt ?? null,
    };
  },
});
