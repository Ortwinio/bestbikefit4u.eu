import type { Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";

export async function getBillingContext(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user) return null;
  // Provider-confirmed periods survive access expiry/cancellation unchanged, so refunds can retry safely.
  const period = await ctx.db.query("stripeBillingPeriods")
    .withIndex("by_user_period", q => q.eq("userId", userId).lte("periodStart", Date.now())).order("desc").first();
  const entitlement = period ? await ctx.db.get(period.entitlementId) : null;
  return { userId, email: user.email, customerId: period?.customerId ?? user.stripeCustomerId,
    subscriptionId: period?.subscriptionId, invoiceId: period?.invoiceId, paymentIntentId: period?.paymentIntentId,
    entitlementId: entitlement?._id, periodStart: period?.periodStart, periodEnd: period?.periodEnd,
    periodPriceCents: period?.periodPriceCents, renewed: period?.renewed,
    cancelled: entitlement?.cancelled, appointmentUsed: Boolean(entitlement?.appointmentUsedAt) };
}
