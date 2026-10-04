import { normalizeProductId, type PricingEntitlement } from "./access";
import { ANNUAL_GIFT_CREDITS, isAnnualProduct } from "./products";

export { addCalendarMonths } from "./products";

export const GIFTS_PER_YEAR = ANNUAL_GIFT_CREDITS;
export const MAX_GIFTS_PER_DAY = 5;

export function normalizeGiftEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("INVALID_RECIPIENT_EMAIL");
  }
  return normalized;
}

export type GiftStatus = "pending" | "redeemed" | "expired" | "cancelled";

export function giftConsumesCredit(gift: { status: GiftStatus; expiresAt: number }, now: number): boolean {
  return gift.status === "redeemed" || (gift.status === "pending" && gift.expiresAt > now);
}

export function giftPreview(gift: { status: GiftStatus; expiresAt: number } | null, now: number) {
  if (!gift || gift.status === "cancelled") return { status: "invalid" as const };
  if (gift.status === "redeemed") return { status: "redeemed" as const };
  if (gift.status === "expired" || gift.expiresAt <= now) return { status: "expired" as const, expiresAt: gift.expiresAt };
  return { status: gift.expiresAt - now <= 5 * 86400000 ? "expiring" as const : "valid" as const, expiresAt: gift.expiresAt };
}

export function isPaidAnnualGiftSource(entitlement: Pick<PricingEntitlement,
  "productId" | "source" | "status" | "startsAt" | "expiresAt"
>, now: number): boolean {
  return entitlement.source === "purchase" && isAnnualProduct(normalizeProductId(entitlement.productId))
    && entitlement.status === "active" && entitlement.startsAt <= now && entitlement.expiresAt > now;
}
