import type Stripe from "stripe";
import { resolveSiteOrigin } from "../../../shared/brand";
import { stripeEnvironment } from "./serverStripe";
import { ANNUAL_UPGRADE_COUPON_CENTS, PERSONAL_FIT_ADDON_CENTS, PRODUCTS } from "../../../shared/pricing/products";

export interface CheckoutReservation {
  reservationId: string;
  userId: string;
  email?: string;
  customerId?: string;
  productId: string;
  bikeId?: string;
  eligibleForUpgrade: boolean;
}

/** Treat dashboard configuration as input: a misconfigured price must never charge the wrong amount. */
export async function validateCheckoutPrices(stripe: Stripe, productId: string): Promise<void> {
  const annual = ["annual", "annual_upgrade", "annual_personal"].includes(productId);
  const expected: Array<[Parameters<typeof stripeEnvironment>[0], number, boolean]> = annual
    ? [["STRIPE_ANNUAL_PRICE_ID", PRODUCTS.annual.priceCents, true]]
    : productId === "single" ? [["STRIPE_SINGLE_FIT_PRICE_ID", PRODUCTS.single.priceCents, false]]
      : [["STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID", PRODUCTS.personal_fit_standalone.priceCents, false]];
  if (productId === "annual_personal") {
    expected.push(["STRIPE_PERSONAL_FIT_ADDON_PRICE_ID", PERSONAL_FIT_ADDON_CENTS, false]);
  }
  for (const [name, amount, recurring] of expected) {
    const price = await stripe.prices.retrieve(stripeEnvironment(name));
    if (!price.active || price.currency !== "eur" || price.unit_amount !== amount
      || price.tax_behavior === "exclusive" || (recurring
        ? price.recurring?.interval !== "year" || price.recurring.interval_count !== 1
        : price.recurring !== null)) throw new Error("STRIPE_PRICE_MISMATCH");
  }
  if (productId === "annual_upgrade") {
    const coupon = await stripe.coupons.retrieve(stripeEnvironment("STRIPE_UPGRADE_COUPON_ID"));
    if (!coupon.valid || coupon.amount_off !== ANNUAL_UPGRADE_COUPON_CENTS || coupon.currency !== "eur"
      || coupon.duration !== "once") throw new Error("STRIPE_COUPON_MISMATCH");
  }
}

export function checkoutParameters(reservation: CheckoutReservation, locale: "nl" | "en"):
Stripe.Checkout.SessionCreateParams {
  const product = reservation.productId;
  const annual = ["annual", "annual_upgrade", "annual_personal"].includes(product);
  if (!["single", "annual", "annual_upgrade", "annual_personal", "personal_fit_standalone"].includes(product)) {
    throw new Error("INVALID_PRODUCT");
  }
  if (product === "annual_upgrade" && !reservation.eligibleForUpgrade) throw new Error("UPGRADE_NOT_ELIGIBLE");
  const price = annual ? "STRIPE_ANNUAL_PRICE_ID" : product === "single"
    ? "STRIPE_SINGLE_FIT_PRICE_ID" : "STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID";
  const line_items = [{ price: stripeEnvironment(price), quantity: 1 }];
  if (product === "annual_personal") {
    line_items.push({ price: stripeEnvironment("STRIPE_PERSONAL_FIT_ADDON_PRICE_ID"), quantity: 1 });
  }
  const metadata = {
    reservationId: reservation.reservationId, userId: reservation.userId, productId: product,
    locale, ...(reservation.bikeId ? { bikeId: reservation.bikeId } : {}),
    ...(annual ? { annualPriceId: stripeEnvironment("STRIPE_ANNUAL_PRICE_ID") } : {}),
  };
  const origin = resolveSiteOrigin();
  return {
    mode: annual ? "subscription" : "payment", line_items,
    ...(reservation.customerId ? { customer: reservation.customerId } : { customer_email: reservation.email }),
    ...(!annual && !reservation.customerId ? { customer_creation: "always" as const } : {}),
    client_reference_id: reservation.userId, metadata,
    ...(annual ? { subscription_data: { metadata } } : { payment_intent_data: { metadata } }),
    ...(product === "annual_upgrade" ? { discounts: [{ coupon: stripeEnvironment("STRIPE_UPGRADE_COUPON_ID") }] } : {}),
    success_url: `${origin}/${locale}/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${locale}/checkout?cancelled=1&product=${encodeURIComponent(product)}`,
  };
}
