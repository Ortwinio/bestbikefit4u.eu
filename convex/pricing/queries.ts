import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { getUserAccess } from "./access";
import { normalizeProductId } from "../../shared/pricing/access";

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
