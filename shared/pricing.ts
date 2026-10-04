/**
 * Pricing model v2: the single source of truth for consumer products and prices.
 *
 * All amounts are in euro cents and include 21% Dutch VAT. Stripe holds matching
 * prices (see `plans/feature-pricing-model-v2/README.md`); the price IDs come from
 * environment variables so test and live mode can differ.
 *
 * Prices are hypotheses until conversion data supports them; change them here and
 * in Stripe together.
 */

export const PRICING_CURRENCY = "EUR" as const;

export type ConsumerProductKey = "single_fit" | "annual" | "annual_upgrade" | "annual_personal_fit";

export type EntitlementKind = "single_fit" | "annual" | "gift_fit";

export type ConsumerProduct = {
  key: ConsumerProductKey;
  /** What the customer pays at checkout. */
  firstChargeCents: number;
  /** What Stripe charges on each renewal; null for one-off products. */
  renewalCents: number | null;
  /** The entitlement a successful payment grants. */
  grants: EntitlementKind;
  /** Access length in months for one-off products; annual follows the subscription period. */
  accessMonths: number | null;
  /** Number of bikes covered; null = all bikes. */
  bikeLimit: number | null;
  /** Gift fits the buyer can send per subscription year. */
  giftsPerYear: number;
  includesPersonalFitAppointment: boolean;
};

export const ANNUAL_PRICE_CENTS = 2150;
export const SINGLE_FIT_PRICE_CENTS = 1350;
export const ANNUAL_UPGRADE_PRICE_CENTS = 950;
export const PERSONAL_FIT_ADDON_CENTS = 21300;

/** Coupon amount that turns the annual price into the upgrade price. */
export const ANNUAL_UPGRADE_COUPON_CENTS = ANNUAL_PRICE_CENTS - ANNUAL_UPGRADE_PRICE_CENTS;

/** A personal bike fit appointment booked after buying a single fit or annual licence. */
export const PERSONAL_FIT_STANDALONE_CENTS = 20950;

export const SINGLE_FIT_ACCESS_MONTHS = 3;
/** The €9,50 upgrade is available up to 6 months after a single fit purchase or gift redemption. */
export const UPGRADE_WINDOW_MONTHS = 6;
export const GIFT_REDEEM_WINDOW_MONTHS = 1;
export const GIFT_VALUE_CENTS = SINGLE_FIT_PRICE_CENTS;

export const CONSUMER_PRODUCTS: Record<ConsumerProductKey, ConsumerProduct> = {
  single_fit: {
    key: "single_fit",
    firstChargeCents: SINGLE_FIT_PRICE_CENTS,
    renewalCents: null,
    grants: "single_fit",
    accessMonths: SINGLE_FIT_ACCESS_MONTHS,
    bikeLimit: 1,
    giftsPerYear: 0,
    includesPersonalFitAppointment: false,
  },
  annual: {
    key: "annual",
    firstChargeCents: ANNUAL_PRICE_CENTS,
    renewalCents: ANNUAL_PRICE_CENTS,
    grants: "annual",
    accessMonths: null,
    bikeLimit: null,
    giftsPerYear: 2,
    includesPersonalFitAppointment: false,
  },
  annual_upgrade: {
    key: "annual_upgrade",
    firstChargeCents: ANNUAL_UPGRADE_PRICE_CENTS,
    renewalCents: ANNUAL_PRICE_CENTS,
    grants: "annual",
    accessMonths: null,
    bikeLimit: null,
    giftsPerYear: 1,
    includesPersonalFitAppointment: false,
  },
  annual_personal_fit: {
    key: "annual_personal_fit",
    firstChargeCents: ANNUAL_PRICE_CENTS + PERSONAL_FIT_ADDON_CENTS,
    renewalCents: ANNUAL_PRICE_CENTS,
    grants: "annual",
    accessMonths: null,
    bikeLimit: null,
    giftsPerYear: 2,
    includesPersonalFitAppointment: true,
  },
};

/** Stripe environment variables per building block (server-only values). */
export const STRIPE_PRICING_ENV = {
  annualPriceId: "STRIPE_ANNUAL_PRICE_ID",
  singleFitPriceId: "STRIPE_SINGLE_FIT_PRICE_ID",
  personalFitAddonPriceId: "STRIPE_PERSONAL_FIT_ADDON_PRICE_ID",
  personalFitStandalonePriceId: "STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID",
  upgradeCouponId: "STRIPE_UPGRADE_COUPON_ID",
} as const;

export function formatEuroCents(cents: number, locale: "nl" | "en"): string {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-IE", {
    style: "currency",
    currency: PRICING_CURRENCY,
  }).format(cents / 100);
}
