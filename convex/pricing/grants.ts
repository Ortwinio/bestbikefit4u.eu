import type { Id } from "../_generated/dataModel";
import { makeFunctionReference } from "convex/server";
import type { MutationCtx } from "../_generated/server";
import { addCalendarMonths, PRODUCTS, isAnnualProduct, type PaidProductId } from "../../shared/pricing/products";
import { isUpgradeEligible, isPersonalFitEligible } from "../../shared/pricing/access";

export async function grantPurchasedAccess(ctx: MutationCtx, args: {
  userId: Id<"users">; bikeId?: Id<"bikes">; productId: PaidProductId;
  grantKey: string; startsAt: number; renewal?: boolean; periodEnd?: number; eligibilityAt?: number;
  subscriptionId?: string; customerId?: string; paymentIntentId?: string;
}) {
  if (!args.grantKey.trim() || !Number.isSafeInteger(args.startsAt) || args.startsAt < 0) throw new Error("INVALID_GRANT");
  if (args.periodEnd !== undefined && (!Number.isSafeInteger(args.periodEnd) || args.periodEnd <= args.startsAt)) {
    throw new Error("INVALID_PERIOD_END");
  }
  if (args.renewal && !isAnnualProduct(args.productId)) throw new Error("PRODUCT_NOT_RECURRING");
  const eligibilityAt = args.eligibilityAt ?? args.startsAt;
  if (!Number.isSafeInteger(eligibilityAt) || eligibilityAt < 0 || eligibilityAt > args.startsAt + 999) {
    throw new Error("INVALID_ELIGIBILITY_TIME");
  }
  const user = await ctx.db.get(args.userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (args.productId === "single") {
    const bike = args.bikeId ? await ctx.db.get(args.bikeId) : null;
    if (!bike || bike.userId !== args.userId) throw new Error("Bike not found");
    if (args.renewal) throw new Error("SINGLE_NOT_RECURRING");
  }
  const existing = await ctx.db.query("pricingEntitlements").withIndex("by_grant_key", (query) => query.eq("grantKey", args.grantKey)).unique();
  const productId = args.renewal ? "annual" : args.productId;
  if (existing) {
    if (existing.userId !== args.userId || existing.productId !== productId
      || existing.startsAt !== args.startsAt
      || (args.periodEnd !== undefined && existing.expiresAt !== args.periodEnd)
      || (args.subscriptionId !== undefined && existing.subscriptionId !== args.subscriptionId)
      || (args.customerId !== undefined && existing.customerId !== args.customerId)
      || (args.paymentIntentId !== undefined && existing.paymentIntentId !== undefined
        && existing.paymentIntentId !== args.paymentIntentId)
      || existing.bikeId !== (productId === "single" ? args.bikeId : undefined)) {
      throw new Error("GRANT_KEY_CONFLICT");
    }
    // An invoice may be delivered before Stripe attaches its payment intent.
    if (existing.paymentIntentId === undefined && args.paymentIntentId !== undefined) {
      await ctx.db.patch(existing._id, { paymentIntentId: args.paymentIntentId });
    }
    return existing._id;
  }
  const history = await ctx.db.query("pricingEntitlements").withIndex("by_user", (query) => query.eq("userId", args.userId)).collect();
  if (args.productId === "annual_upgrade" && !args.renewal
    && !isUpgradeEligible(history, eligibilityAt)) {
    throw new Error("UPGRADE_NOT_ELIGIBLE");
  }
  if (productId === "personal_fit_standalone" && !isPersonalFitEligible(history, eligibilityAt)) {
    throw new Error("PERSONAL_FIT_NOT_ELIGIBLE");
  }
  const appointmentGranted = productId === "annual_personal" || productId === "personal_fit_standalone";
  const entitlementId = await ctx.db.insert("pricingEntitlements", {
    userId: args.userId, bikeId: productId === "single" ? args.bikeId : undefined,
    productId, status: "active", source: "purchase", grantKey: args.grantKey, startsAt: args.startsAt,
    // A standalone appointment has no owner-specified expiry and grants no timed fit access.
    expiresAt: productId === "personal_fit_standalone" ? 0
      : args.periodEnd ?? addCalendarMonths(args.startsAt, PRODUCTS[productId].durationMonths),
    subscriptionId: args.subscriptionId, customerId: args.customerId, paymentIntentId: args.paymentIntentId,
    appointmentGranted, periodPriceCents: args.renewal ? PRODUCTS.annual.renewalPriceCents : PRODUCTS[productId].priceCents,
    renewed: args.renewal ?? false, cancelled: false, createdAt: Date.now(),
  });
  if (appointmentGranted) {
    await ctx.scheduler.runAfter(0,
      makeFunctionReference<"mutation">("pricingAppointments/internal:queueFitterNotification"), { entitlementId });
  }
  return entitlementId;
}
