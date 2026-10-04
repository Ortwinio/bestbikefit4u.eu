import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { UPGRADE_WINDOW_MONTHS } from "../../shared/pricing";

type DbCtx = QueryCtx | MutationCtx;

export type AccessLevel = "free" | "single" | "annual";

export type Access = {
  level: AccessLevel;
  /** True when access only covers the requested bike (single fit or gift). */
  bikeScoped: boolean;
  /** End of the entitlement that grants the current level. */
  endsAt?: number;
  /** The user has had any paid or gifted entitlement, now or before. */
  everPaid: boolean;
  /** Latest end date of any past entitlement, for read-only fallback after expiry. */
  lastPaidEndsAt?: number;
  /** A single fit or redeemed gift started less than 6 months ago: the user may upgrade for €9,50. */
  upgradeEligible: boolean;
};

type EntitlementLike = Pick<
  Doc<"entitlements">,
  "kind" | "bikeId" | "startsAt" | "endsAt" | "status"
>;

export function isEntitlementCurrent(entitlement: EntitlementLike, now: number): boolean {
  return (
    entitlement.status === "active" &&
    entitlement.startsAt <= now &&
    entitlement.endsAt > now
  );
}

/**
 * Pure access resolution, so it can be unit tested without a database.
 * Annual covers all bikes; single fit and gift only cover their own bike.
 */
export function resolveAccess(
  entitlements: EntitlementLike[],
  now: number,
  bikeId?: Id<"bikes">
): Access {
  const everPaid = entitlements.length > 0;
  const lastPaidEndsAt = everPaid
    ? Math.max(...entitlements.map((entitlement) => entitlement.endsAt))
    : undefined;
  // Upgrade window runs from the single fit purchase or gift redemption (startsAt).
  const upgradeEligible = entitlements.some(
    (entitlement) =>
      (entitlement.kind === "single_fit" || entitlement.kind === "gift_fit") &&
      entitlement.status !== "canceled" &&
      entitlement.startsAt <= now &&
      now < addMonths(entitlement.startsAt, UPGRADE_WINDOW_MONTHS)
  );

  const current = entitlements.filter((entitlement) => isEntitlementCurrent(entitlement, now));

  const annual = current
    .filter((entitlement) => entitlement.kind === "annual")
    .sort((a, b) => b.endsAt - a.endsAt)[0];
  if (annual) {
    return { level: "annual", bikeScoped: false, endsAt: annual.endsAt, everPaid, lastPaidEndsAt, upgradeEligible };
  }

  if (bikeId) {
    const bikeAccess = current
      .filter((entitlement) => entitlement.kind !== "annual" && entitlement.bikeId === bikeId)
      .sort((a, b) => b.endsAt - a.endsAt)[0];
    if (bikeAccess) {
      return { level: "single", bikeScoped: true, endsAt: bikeAccess.endsAt, everPaid, lastPaidEndsAt, upgradeEligible };
    }
  }

  return { level: "free", bikeScoped: false, everPaid, lastPaidEndsAt, upgradeEligible };
}

export async function getAccess(
  ctx: DbCtx,
  userId: Id<"users">,
  bikeId?: Id<"bikes">,
  now = Date.now()
): Promise<Access> {
  const entitlements = await ctx.db
    .query("entitlements")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  return resolveAccess(entitlements, now, bikeId);
}

/** Adds calendar months in UTC; used for single fit (3 months) and gift windows (1 month). */
export function addMonths(timestamp: number, months: number): number {
  const date = new Date(timestamp);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.getTime();
}
