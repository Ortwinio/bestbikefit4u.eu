import { isPaidAccessEnforced } from "./flags";
import type { PaidProductId, ProductId } from "./products";

export type PricingEntitlement = {
  productId: PaidProductId;
  bikeId?: string;
  status: "active" | "expired" | "revoked";
  revokedReason?: "bike_deleted" | "refunded" | "admin";
  startsAt: number;
  expiresAt: number;
  source: "purchase" | "transition" | "legacy_pro";
  appointmentGranted: boolean;
  appointmentUsedAt?: number;
  periodPriceCents?: number;
  renewed?: boolean;
  cancelled?: boolean;
};

export function isEntryEligible(entitlements: readonly PricingEntitlement[], now: number): boolean {
  return entitlements.some((entry) => entry.productId === "single" && entry.startsAt <= now
    && (entry.status !== "revoked" || entry.revokedReason === "bike_deleted"));
}

export function getAccess(
  user: { entitlements: readonly PricingEntitlement[] } | null,
  bikeId?: string,
  options: { enforced?: boolean; now?: number } = {},
) {
  const enforced = options.enforced ?? isPaidAccessEnforced();
  const now = options.now ?? Date.now();
  const entitlements = user?.entitlements ?? [];
  const active = entitlements.filter((entry) => entry.status === "active" && entry.startsAt <= now && entry.expiresAt > now);
  const annual = active.filter((entry) => entry.productId !== "single");
  const matching = active.filter((entry) => entry.productId !== "single" || (bikeId !== undefined && entry.bikeId === bikeId));
  const best = [...(annual.length ? annual : matching.length ? matching : active)].sort((left, right) => right.expiresAt - left.expiresAt)[0];
  return {
    enforced,
    fullProfile: !enforced || active.length > 0,
    fullReport: !enforced || matching.length > 0,
    maxBikes: !enforced || annual.length > 0 ? null : 1,
    profileScoreCap: !enforced || active.length > 0 ? 100 : 80,
    productId: (best?.productId ?? "free") as ProductId,
    expiresAt: best?.expiresAt ?? null,
    eligibleForEntry: isEntryEligible(entitlements, now),
    appointmentAvailable: active.some((entry) => entry.productId === "annual_personal" && entry.appointmentGranted && entry.appointmentUsedAt === undefined),
  };
}
