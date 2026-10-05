import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { getBillingContext } from "./billingContext";

export const getCheckoutStatus = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const bySession = await ctx.db.query("stripeCheckouts")
      .withIndex("by_session", q => q.eq("sessionId", args.sessionId)).unique();
    const checkout = bySession;
    if (!checkout || checkout.userId !== userId || (checkout.sessionId && checkout.sessionId !== args.sessionId)) return null;
    return { status: checkout.status === "refunded" ? "failed" as const : checkout.status,
      productId: checkout.productId, bikeId: checkout.bikeId,
      amountTotalCents: checkout.amountTotalCents ?? null, currency: "EUR" as const };
  },
});

export const billingContext = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return getBillingContext(ctx, userId);
  },
});
