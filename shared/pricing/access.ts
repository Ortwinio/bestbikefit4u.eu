import { isPaidAccessEnforced } from "./flags";
import { addCalendarMonths, isAnnualProduct, UPGRADE_WINDOW_MONTHS, type PaidProductId, type ProductId } from "./products";

// Stored entry offers remain readable; they are never offered for new purchases.
export type StoredProductId = PaidProductId | "annual_entry";
export function normalizeProductId(productId: StoredProductId): PaidProductId {
  return productId === "annual_entry" ? "annual_upgrade" : productId;
}

export type PricingEntitlement = {
  productId: StoredProductId;
  bikeId?: string;
  status: "active" | "expired" | "revoked";
  revokedReason?: "bike_deleted" | "refunded" | "admin";
  startsAt: number;
  expiresAt: number;
  source: "purchase" | "gift" | "transition" | "legacy_pro";
  appointmentGranted: boolean;
  appointmentUsedAt?: number;
  periodPriceCents?: number;
  renewed?: boolean;
  cancelled?: boolean;
};

function isValidSingle(entry: PricingEntitlement, now: number): boolean {
  return entry.productId === "single" && entry.startsAt <= now
    && (entry.status !== "revoked" || entry.revokedReason === "bike_deleted");
}

export function isUpgradeEligible(entitlements: readonly PricingEntitlement[], now: number): boolean {
  if (entitlements.some((entry) => isAnnualProduct(normalizeProductId(entry.productId))
    && entry.status === "active" && entry.startsAt <= now && entry.expiresAt > now)) return false;
  return entitlements.some((entry) => isValidSingle(entry, now)
    && (entry.source === "purchase" || entry.source === "gift")
    && now < addCalendarMonths(entry.startsAt, UPGRADE_WINDOW_MONTHS));
}

export function isPersonalFitEligible(entitlements: readonly PricingEntitlement[], now: number): boolean {
  return entitlements.some((entry) => (isValidSingle(entry, now) && entry.source === "purchase")
    || (isAnnualProduct(normalizeProductId(entry.productId)) && entry.status === "active"
      && entry.startsAt <= now && entry.expiresAt > now));
}

export function getAccess(
  user: { entitlements: readonly PricingEntitlement[] } | null,
  bikeId?: string,
  options: { enforced?: boolean; now?: number } = {},
) {
  const enforced = options.enforced ?? isPaidAccessEnforced();
  const now = options.now ?? Date.now();
  const entitlements = (user?.entitlements ?? []).map((entry) => ({
    ...entry, productId: normalizeProductId(entry.productId),
  }));
  const active = entitlements.filter((entry) => entry.status === "active" && entry.startsAt <= now && entry.expiresAt > now);
  const accessRights = active.filter((entry) => entry.productId !== "personal_fit_standalone");
  const annual = accessRights.filter((entry) => isAnnualProduct(normalizeProductId(entry.productId)));
  const matching = accessRights.filter((entry) => entry.productId !== "single" || (bikeId !== undefined && entry.bikeId === bikeId));
  const best = [...(annual.length ? annual : matching.length ? matching : accessRights)].sort((left, right) => right.expiresAt - left.expiresAt)[0];
  return {
    enforced,
    fullProfile: !enforced || accessRights.length > 0,
    fullReport: !enforced || matching.length > 0,
    maxBikes: !enforced || annual.length > 0 ? null : 1,
    profileScoreCap: !enforced || accessRights.length > 0 ? 100 : 80,
    productId: (best?.productId ?? "free") as ProductId,
    expiresAt: best?.expiresAt ?? null,
    eligibleForUpgrade: isUpgradeEligible(entitlements, now),
    eligibleForPersonalFit: isPersonalFitEligible(entitlements, now),
    appointmentAvailable: entitlements.some((entry) => entry.status === "active" && entry.startsAt <= now
      && (entry.productId === "personal_fit_standalone"
        || (entry.productId === "annual_personal" && entry.expiresAt > now))
      && entry.appointmentGranted && entry.appointmentUsedAt === undefined),
  };
}
