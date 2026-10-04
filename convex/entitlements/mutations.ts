import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

const EXPIRE_BATCH_SIZE = 200;

/**
 * Marks active entitlements whose end date has passed as expired.
 * Idempotent: a second run finds nothing left to expire.
 * Stripe-backed annual entitlements are normally ended by webhooks; this catches
 * one-off and gifted rights and any missed webhook.
 */
export const expireEndedEntitlements = internalMutation({
  args: { now: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now();
    const ended = await ctx.db
      .query("entitlements")
      .withIndex("by_status_ends_at", (q) => q.eq("status", "active").lte("endsAt", now))
      .take(EXPIRE_BATCH_SIZE);

    for (const entitlement of ended) {
      await ctx.db.patch(entitlement._id, { status: "expired", updatedAt: now });
    }

    return { expired: ended.length, hasMore: ended.length === EXPIRE_BATCH_SIZE };
  },
});
