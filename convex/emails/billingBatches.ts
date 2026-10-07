import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { isStripeBillingEnabled } from "../../src/config/billing";
import { queueBillingEmail } from "./billingQueue";

export const RENEWAL_REMINDER_DAYS = 30;
export const BILLING_BATCH_SIZE = 50;
const DAY_MS = 86_400_000;

export const runDaily = internalMutation({
  args: { cursor: v.optional(v.string()), asOf: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (!isStripeBillingEnabled()) return { scanned: 0, complete: true };
    const now = args.asOf ?? Date.now();
    const page = await ctx.db.query("pricingEntitlements").paginate({
      cursor: args.cursor ?? null, numItems: BILLING_BATCH_SIZE,
    });
    for (const entitlement of page.page) {
      if (entitlement.status === "revoked"
        || entitlement.productId === "personal_fit_standalone") continue;
      if (entitlement.status === "active" && !entitlement.cancelled && entitlement.productId !== "single" && entitlement.subscriptionId
        && entitlement.startsAt <= now && entitlement.expiresAt > now && entitlement.expiresAt <= now + RENEWAL_REMINDER_DAYS * DAY_MS) {
        await queueBillingEmail(ctx, {
          kind: "renewal", userId: entitlement.userId, entitlementId: entitlement._id,
          sendKey: `renewal:${entitlement.subscriptionId}:${entitlement.startsAt}`,
        });
      }
      if (entitlement.expiresAt <= 0 || entitlement.expiresAt > now) continue;
      const replacement = await ctx.db.query("pricingEntitlements")
        .withIndex("by_user", (query) => query.eq("userId", entitlement.userId))
        .filter((query) => query.and(
          query.eq(query.field("status"), "active"), query.lte(query.field("startsAt"), now),
          query.gt(query.field("expiresAt"), now), query.neq(query.field("productId"), "personal_fit_standalone"),
          query.or(query.neq(query.field("productId"), "single"),
            query.eq(query.field("bikeId"), entitlement.bikeId)),
        )).first();
      if (replacement) continue;
      await queueBillingEmail(ctx, {
        kind: "expired", userId: entitlement.userId, entitlementId: entitlement._id,
        sendKey: `expired:${entitlement._id}`,
      });
    }
    if (!page.isDone) await ctx.scheduler.runAfter(0,
      makeFunctionReference<"mutation">("emails/billingBatches:runDaily"),
      { cursor: page.continueCursor, asOf: now });
    return { scanned: page.page.length, complete: page.isDone };
  },
});
