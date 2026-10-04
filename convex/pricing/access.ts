import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getAccess, type PricingEntitlement } from "../../shared/pricing/access";
import { isPaidAccessEnforced } from "../../shared/pricing/flags";

export async function getUserAccess(ctx: QueryCtx | MutationCtx, userId: Id<"users">, bikeId?: Id<"bikes">, readEntitlementsWhenOpen = false) {
  const enforced = isPaidAccessEnforced();
  if (!enforced && !bikeId && !readEntitlementsWhenOpen) return getAccess(null, undefined, { enforced: false });
  if (bikeId) {
    const bike = await ctx.db.get(bikeId);
    if (!bike || bike.userId !== userId) throw new Error("Bike not found");
  }
  const entitlements = await ctx.db.query("pricingEntitlements").withIndex("by_user", (query) => query.eq("userId", userId)).collect();
  const ownedEntitlements: PricingEntitlement[] = [];
  for (const entitlement of entitlements) {
    if (entitlement.productId === "single") {
      if (!entitlement.bikeId) continue;
      const bike = await ctx.db.get(entitlement.bikeId);
      if (bike && bike.userId !== userId) continue;
      if (!bike && entitlement.status !== "revoked") {
        ownedEntitlements.push({ ...entitlement, status: "revoked", revokedReason: "bike_deleted" });
        continue;
      }
    }
    ownedEntitlements.push(entitlement);
  }
  return getAccess({ entitlements: ownedEntitlements }, bikeId, { enforced });
}
