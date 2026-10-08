import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { getUserAccess } from "./access";
import { normalizeProductId } from "../../shared/pricing/access";
import { requireUserId } from "../lib/authz";
import { addCalendarMonths } from "../../shared/pricing/products";

export const getTransitionOffer = query({
  args: {},
  returns: v.union(
    v.object({ status: v.literal("none") }),
    v.object({ status: v.literal("upcoming"), goLiveAt: v.number() }),
    v.object({ status: v.literal("available"), redeemBy: v.number() }),
    v.object({ status: v.literal("redeemed"), bikeId: v.id("bikes"), expiresAt: v.number() }),
    v.object({ status: v.literal("expired") }),
  ),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const offer = await ctx.db.query("pricingTransitionOffers")
      .withIndex("by_user", (query) => query.eq("userId", userId)).unique();
    if (!offer) return { status: "none" } as const;
    if (offer.redeemedAt !== undefined && offer.bikeId) {
      return { status: "redeemed", bikeId: offer.bikeId, expiresAt: addCalendarMonths(offer.redeemedAt, 3) } as const;
    }
    const now = Date.now();
    if (now < offer.goLiveAt) return { status: "upcoming", goLiveAt: offer.goLiveAt } as const;
    if (now >= offer.redeemBy) return { status: "expired" } as const;
    return { status: "available", redeemBy: offer.redeemBy } as const;
  },
});

export const getAccess = query({
  args: { bikeId: v.optional(v.id("bikes")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return userId ? getUserAccess(ctx, userId, args.bikeId, true) : null;
  },
});

export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const entitlements = await ctx.db.query("pricingEntitlements").withIndex("by_user", (query) => query.eq("userId", userId)).collect();
    const transitionOffer = await ctx.db.query("pricingTransitionOffers").withIndex("by_user", (query) => query.eq("userId", userId)).unique();
    return { access: await getUserAccess(ctx, userId, undefined, true), entitlements: entitlements.map((entry) => ({ ...entry, productId: normalizeProductId(entry.productId) })), transitionOffer };
  },
});
