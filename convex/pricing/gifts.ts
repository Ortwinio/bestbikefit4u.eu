import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { addCalendarMonths } from "../../shared/pricing/products";

/** Called only inside the authenticated gift redemption transaction. */
export async function grantGiftEntitlement(ctx: MutationCtx, args: {
  userId: Id<"users">; bikeId: Id<"bikes">; giftId: string; redeemedAt: number;
}) {
  if (!args.giftId.trim() || !Number.isSafeInteger(args.redeemedAt) || args.redeemedAt < 0) {
    throw new Error("INVALID_GIFT_GRANT");
  }
  const bike = await ctx.db.get(args.bikeId);
  if (!bike || bike.userId !== args.userId) throw new Error("Bike not found");
  const grantKey = `gift:${args.giftId}`;
  const existing = await ctx.db.query("pricingEntitlements")
    .withIndex("by_grant_key", (query) => query.eq("grantKey", grantKey)).unique();
  if (existing) {
    if (existing.userId !== args.userId || existing.bikeId !== args.bikeId
      || existing.source !== "gift" || existing.productId !== "single" || existing.startsAt !== args.redeemedAt) {
      throw new Error("GRANT_KEY_CONFLICT");
    }
    return existing._id;
  }
  return ctx.db.insert("pricingEntitlements", {
    userId: args.userId, bikeId: args.bikeId, productId: "single", source: "gift", status: "active",
    startsAt: args.redeemedAt, expiresAt: addCalendarMonths(args.redeemedAt, 3), grantKey,
    appointmentGranted: false, periodPriceCents: 0, renewed: false, cancelled: false, createdAt: Date.now(),
  });
}
