import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { checkoutParameters, validateCheckoutPrices } from "./stripeCheckout";
const reservation = { reservationId: "reservation", userId: "owner", email: "owner@example.com",
  productId: "annual", eligibleForUpgrade: false };
beforeEach(() => {
  vi.stubEnv("STRIPE_ANNUAL_PRICE_ID", "price_annual");
  vi.stubEnv("STRIPE_SINGLE_FIT_PRICE_ID", "price_single");
  vi.stubEnv("STRIPE_PERSONAL_FIT_ADDON_PRICE_ID", "price_addon");
  vi.stubEnv("STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID", "price_standalone");
  vi.stubEnv("STRIPE_UPGRADE_COUPON_ID", "coupon_upgrade");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.bikefitboost.com");
});
afterEach(() => vi.unstubAllEnvs());
describe("configured checkout", () => {
  it.each(["single", "personal_fit_standalone"])("creates payment for %s", (productId) => {
    const params = checkoutParameters({ ...reservation, productId, bikeId: "owned-bike" }, "nl");
    expect(params.mode).toBe("payment");
    expect(params.metadata?.bikeId).toBe("owned-bike");
    expect(params.success_url).toBe("https://bikefitboost.com/nl/checkout?session_id={CHECKOUT_SESSION_ID}");
  });
  it.each(["annual", "annual_upgrade", "annual_personal"])("creates subscription for %s", (productId) => {
    const params = checkoutParameters({ ...reservation, productId, eligibleForUpgrade: true }, "en");
    expect(params.mode).toBe("subscription");
    expect(params.subscription_data?.metadata).toEqual(params.metadata);
    expect(params.line_items).toEqual(productId === "annual_personal"
      ? [{ price: "price_annual", quantity: 1 }, { price: "price_addon", quantity: 1 }]
      : [{ price: "price_annual", quantity: 1 }]);
    expect(params.discounts).toEqual(productId === "annual_upgrade" ? [{ coupon: "coupon_upgrade" }] : undefined);
    expect(params.allow_promotion_codes).toBeUndefined();
  });
  it("rejects ineligible upgrade and missing configuration", () => {
    expect(() => checkoutParameters({ ...reservation, productId: "annual_upgrade" }, "nl"))
      .toThrow("UPGRADE_NOT_ELIGIBLE");
    vi.stubEnv("STRIPE_ANNUAL_PRICE_ID", "");
    expect(() => checkoutParameters(reservation, "nl")).toThrow("STRIPE_CONFIGURATION_MISSING");
  });
  it("rejects misconfigured amount, recurrence or coupon before charging", async () => {
    const retrieve = vi.fn().mockResolvedValue({ active: true, currency: "eur", unit_amount: 2150,
      recurring: { interval: "year", interval_count: 1 }, tax_behavior: "inclusive" });
    const coupon = vi.fn().mockResolvedValue({ valid: true, amount_off: 1200, currency: "eur", duration: "once" });
    const stripe = { prices: { retrieve }, coupons: { retrieve: coupon } } as unknown as Stripe;
    await expect(validateCheckoutPrices(stripe, "annual_upgrade")).resolves.toBeUndefined();
    coupon.mockResolvedValue({ valid: true, amount_off: 1300, currency: "eur", duration: "once" });
    await expect(validateCheckoutPrices(stripe, "annual_upgrade")).rejects.toThrow("STRIPE_COUPON_MISMATCH");
    retrieve.mockResolvedValue({ active: true, currency: "eur", unit_amount: 2450 });
    await expect(validateCheckoutPrices(stripe, "annual")).rejects.toThrow("STRIPE_PRICE_MISMATCH");
  });
});
