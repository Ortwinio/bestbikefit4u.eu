export const UPGRADE_WINDOW_MONTHS = 6;
export const PERSONAL_FIT_ADDON_CENTS = 21300;
export const ANNUAL_UPGRADE_COUPON_CENTS = 1200;
export const ANNUAL_GIFT_CREDITS = 2;

export const PRODUCTS = {
  free: { id: "free", priceCents: 0, renewalPriceCents: null, currency: "EUR", durationMonths: 0, scope: "none" },
  single: { id: "single", priceCents: 1350, renewalPriceCents: null, currency: "EUR", durationMonths: 3, scope: "bike" },
  annual: { id: "annual", priceCents: 2150, renewalPriceCents: 2150, currency: "EUR", durationMonths: 12, scope: "user" },
  annual_upgrade: { id: "annual_upgrade", priceCents: 950, renewalPriceCents: 2150, currency: "EUR", durationMonths: 12, scope: "user" },
  annual_personal: { id: "annual_personal", priceCents: 23450, renewalPriceCents: 2150, currency: "EUR", durationMonths: 12, scope: "user" },
  personal_fit_standalone: { id: "personal_fit_standalone", priceCents: 20950, renewalPriceCents: null, currency: "EUR", durationMonths: 0, scope: "appointment" },
} as const;

export type ProductId = keyof typeof PRODUCTS;
export type PaidProductId = Exclude<ProductId, "free">;

export function isAnnualProduct(productId: string): boolean {
  return productId === "annual" || productId === "annual_upgrade" || productId === "annual_personal";
}

export function addCalendarMonths(timestamp: number, months: number): number {
  if (!Number.isFinite(timestamp) || !Number.isInteger(months) || months < 0) throw new Error("INVALID_DURATION");
  const date = new Date(timestamp);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  if (!Number.isFinite(date.getTime())) throw new Error("INVALID_DURATION");
  return date.getTime();
}
