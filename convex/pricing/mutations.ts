import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireBikeOwner } from "../lib/authz";
import { addCalendarMonths } from "../../shared/pricing/products";

export const redeemTransitionOffer = mutation({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, { bikeId }) => {
    const { userId } = await requireBikeOwner(ctx, bikeId);
    const offer = await ctx.db.query("pricingTransitionOffers").withIndex("by_user", (query) => query.eq("userId", userId)).unique();
    if (!offer) throw new Error("TRANSITION_OFFER_NOT_FOUND");
    if (offer.redeemedAt !== undefined) {
      if (offer.bikeId !== bikeId) throw new Error("TRANSITION_OFFER_ALREADY_REDEEMED");
      return offer.entitlementId;
    }
    const now = Date.now();
    if (now < offer.goLiveAt || now >= offer.redeemBy) throw new Error("TRANSITION_OFFER_UNAVAILABLE");
    const entitlementId = await ctx.db.insert("pricingEntitlements", {
      userId, bikeId, productId: "single", status: "active", startsAt: now,
      expiresAt: addCalendarMonths(now, 3), source: "transition", grantKey: `transition:${userId}`,
      appointmentGranted: false, periodPriceCents: 0, renewed: false, cancelled: false, createdAt: now,
    });
    await ctx.db.patch(offer._id, { redeemedAt: now, bikeId, entitlementId });
    return entitlementId;
  },
});
