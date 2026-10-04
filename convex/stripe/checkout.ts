import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getUserAccess } from "../pricing/access";
import { PRODUCTS, type PaidProductId } from "../../shared/pricing/products";
import { isStripeBillingEnabled } from "../../src/config/billing";
import { stripeNotImplemented } from "../../shared/billing/stripeStub";

/** A reservation authorizes a product only. It can never confirm a payment. */
export const reserveCheckout = mutation({
  args: {
    productId: v.string(), bikeId: v.optional(v.id("bikes")),
    locale: v.union(v.literal("nl"), v.literal("en")), withdrawalAccepted: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!isStripeBillingEnabled()) return stripeNotImplemented(args.locale);
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UNAUTHENTICATED");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("UNAUTHENTICATED");
    if (!args.withdrawalAccepted) throw new Error("WITHDRAWAL_ACCEPTANCE_REQUIRED");
    if (args.productId === "free" || !Object.hasOwn(PRODUCTS, args.productId)) throw new Error("INVALID_PRODUCT");
    const productId = args.productId as PaidProductId;
    if (productId === "single" && !args.bikeId) throw new Error("BIKE_REQUIRED");
    const access = await getUserAccess(ctx, userId, args.bikeId, true);
    if (productId === "annual_upgrade" && !access.eligibleForUpgrade) throw new Error("UPGRADE_NOT_ELIGIBLE");
    if (productId === "personal_fit_standalone" && !access.eligibleForPersonalFit) {
      throw new Error("PERSONAL_FIT_NOT_ELIGIBLE");
    }
    // Retry a provider failure using identical Checkout parameters; stale reservations never lock the account.
    const pending = await ctx.db.query("stripeCheckouts")
      .withIndex("by_user_created_at", q => q.eq("userId", userId).gt("createdAt", Date.now() - 23 * 60 * 60 * 1000))
      .order("desc").take(100);
    const reusable = pending.find(item => item.status === "pending" && item.productId === productId
      && item.bikeId === (productId === "single" ? args.bikeId : undefined) && item.locale === args.locale);
    if (reusable) return { reservationId: reusable._id, userId, email: user.email,
      customerId: reusable.customerId ?? user.stripeCustomerId, productId, bikeId: reusable.bikeId,
      eligibleForUpgrade: access.eligibleForUpgrade };
    const recent = await ctx.db.query("stripeCheckouts")
      .withIndex("by_user_created_at", q => q.eq("userId", userId).gt("createdAt", Date.now() - 60_000)).take(10);
    if (recent.length >= 10) throw new Error("RATE_LIMITED");
    const reservationId = await ctx.db.insert("stripeCheckouts", {
      userId, bikeId: productId === "single" ? args.bikeId : undefined,
      productId, locale: args.locale, status: "pending", createdAt: Date.now(),
    });
    return { reservationId, userId, email: user.email, customerId: user.stripeCustomerId,
      productId, bikeId: productId === "single" ? args.bikeId : undefined,
      eligibleForUpgrade: access.eligibleForUpgrade };
  },
});
