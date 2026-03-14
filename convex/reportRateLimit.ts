import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireSessionOwner } from "./lib/authz";

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const RATE_LIMIT_MAX_REQUESTS = 8;

/**
 * Consume one token from the report download rate limit bucket for this session.
 * Returns true if the request is allowed, false if the limit is exceeded.
 * Rate limit is keyed by sessionId + userId (enforced via ownership check).
 */
export const consumeReportRateLimitToken = mutation({
  args: {
    sessionId: v.id("fitSessions"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSessionOwner(ctx, args.sessionId);
    const identifier = `report:${args.sessionId}:${userId}`;
    const now = Date.now();

    const existing = await ctx.db
      .query("reportRateLimits")
      .withIndex("by_identifier", (q) => q.eq("identifier", identifier))
      .unique();

    if (existing === null) {
      await ctx.db.insert("reportRateLimits", {
        identifier,
        tokens: RATE_LIMIT_MAX_REQUESTS - 1,
        lastRefillAt: now,
      });
      return true;
    }

    const elapsed = Math.max(0, now - existing.lastRefillAt);
    const refillRatePerMs = RATE_LIMIT_MAX_REQUESTS / RATE_LIMIT_WINDOW_MS;
    const available = Math.min(
      RATE_LIMIT_MAX_REQUESTS,
      existing.tokens + elapsed * refillRatePerMs
    );

    if (available < 1) {
      await ctx.db.patch(existing._id, {
        tokens: available,
        lastRefillAt: now,
      });
      return false;
    }

    await ctx.db.patch(existing._id, {
      tokens: available - 1,
      lastRefillAt: now,
    });
    return true;
  },
});
