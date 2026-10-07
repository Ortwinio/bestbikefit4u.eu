import Stripe from "stripe";
import { assertStripeKeyMode } from "../../../shared/billing/stripeMode";
import { isStripeBillingEnabled } from "@/config/billing";

export const STRIPE_API_VERSION = "2026-06-24.dahlia" as const;
export const STRIPE_REQUIRED_ENV = [
  "STRIPE_SECRET_KEY", "STRIPE_ANNUAL_PRICE_ID", "STRIPE_SINGLE_FIT_PRICE_ID",
  "STRIPE_PERSONAL_FIT_ADDON_PRICE_ID", "STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID", "STRIPE_UPGRADE_COUPON_ID",
] as const;

export function stripeEnvironment(name: typeof STRIPE_REQUIRED_ENV[number]): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error("STRIPE_CONFIGURATION_MISSING");
  return value;
}

export function assertStripeMode() {
  return assertStripeKeyMode(process.env.STRIPE_MODE, process.env.STRIPE_SECRET_KEY?.trim());
}

/** Do not construct a provider client until both billing switches affirmatively permit it. */
export function getServerStripe(): Stripe {
  if (!isStripeBillingEnabled()) throw new Error("STRIPE_NOT_IMPLEMENTED");
  assertStripeMode();
  return new Stripe(stripeEnvironment("STRIPE_SECRET_KEY"), { apiVersion: STRIPE_API_VERSION });
}
