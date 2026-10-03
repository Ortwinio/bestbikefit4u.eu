import type { Id } from "../_generated/dataModel";
import { makeFunctionReference } from "convex/server";
import type { MutationCtx } from "../_generated/server";
import { addCalendarMonths, PRODUCTS, type PaidProductId } from "../../shared/pricing/products";
import { isEntryEligible } from "../../shared/pricing/access";

export async function grantPurchasedAccess(ctx: MutationCtx, args: {
  userId: Id<"users">; bikeId?: Id<"bikes">; productId: PaidProductId;
  grantKey: string; startsAt: number; renewal?: boolean;
}) {
  if (!args.grantKey.trim() || !Number.isSafeInteger(args.startsAt) || args.startsAt < 0) throw new Error("INVALID_GRANT");
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
      || existing.startsAt !== args.startsAt || existing.bikeId !== (productId === "single" ? args.bikeId : undefined)) {
      throw new Error("GRANT_KEY_CONFLICT");
    }
    return existing._id;
  }
  const history = await ctx.db.query("pricingEntitlements").withIndex("by_user", (query) => query.eq("userId", args.userId)).collect();
  if (args.productId === "annual_entry" && !args.renewal
    && !isEntryEligible(history, args.startsAt)) {
    throw new Error("ENTRY_NOT_ELIGIBLE");
  }
  const appointmentGranted = productId === "annual_personal";
  const entitlementId = await ctx.db.insert("pricingEntitlements", {
    userId: args.userId, bikeId: productId === "single" ? args.bikeId : undefined,
    productId, status: "active", source: "purchase", grantKey: args.grantKey, startsAt: args.startsAt,
    expiresAt: addCalendarMonths(args.startsAt, PRODUCTS[productId].durationMonths),
    appointmentGranted, periodPriceCents: args.renewal ? PRODUCTS.annual.renewalPriceCents : PRODUCTS[productId].priceCents,
    renewed: args.renewal ?? false, cancelled: false, createdAt: Date.now(),
  });
  if (appointmentGranted) {
    await ctx.scheduler.runAfter(0,
      makeFunctionReference<"mutation">("pricingAppointments/internal:queueFitterNotification"), { entitlementId });
  }
  return entitlementId;
}
