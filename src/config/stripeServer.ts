export const STRIPE_API_VERSION = "2026-06-24.dahlia" as const;

export const STRIPE_PRODUCT_CATALOG = {
  fit_pass: {
    productKey: "fit_pass",
    planKey: "pro_monthly",
    priceEnvVar: "STRIPE_PRO_MONTHLY_PRICE_ID",
    tier: "pro",
    mode: "subscription",
  },
  pro_monthly: {
    productKey: "pro_monthly",
    planKey: "pro_monthly",
    priceEnvVar: "STRIPE_PRO_MONTHLY_PRICE_ID",
    tier: "pro",
    mode: "subscription",
  },
  pro_yearly: {
    productKey: "pro_yearly",
    planKey: "pro_yearly",
    priceEnvVar: "STRIPE_PRO_YEARLY_PRICE_ID",
    tier: "pro",
    mode: "subscription",
    optional: true,
  },
} as const;

export type StripeProductKey = keyof typeof STRIPE_PRODUCT_CATALOG;
export type StripeConfiguredProduct = (typeof STRIPE_PRODUCT_CATALOG)[StripeProductKey] & {
  priceId: string;
};

export function isStripeProductKey(value: string): value is StripeProductKey {
  return Object.hasOwn(STRIPE_PRODUCT_CATALOG, value);
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function getStripeSiteUrl(requestOrigin: string): string | null {
  const configuredSiteUrl = process.env.SITE_URL?.trim();
  if (configuredSiteUrl) {
    try {
      const url = new URL(configuredSiteUrl);
      return url.origin;
    } catch {
      return null;
    }
  }

  if (isProductionRuntime()) {
    return null;
  }

  return requestOrigin;
}

export function getStripeProduct(productKey: StripeProductKey): StripeConfiguredProduct | null {
  const product = STRIPE_PRODUCT_CATALOG[productKey];
  const priceId = process.env[product.priceEnvVar]?.trim();
  if (!priceId) {
    return null;
  }

  return {
    ...product,
    priceId,
  };
}

export function getMissingStripeCheckoutEnv(productKey: StripeProductKey): string[] {
  const product = STRIPE_PRODUCT_CATALOG[productKey];
  const required = ["STRIPE_SECRET_KEY", product.priceEnvVar];

  return required.filter((key) => {
    const value = process.env[key];
    return !value || value.trim().length === 0;
  });
}

export function canUseDevStripeMock(productKey: StripeProductKey): boolean {
  return !isProductionRuntime() && getMissingStripeCheckoutEnv(productKey).length > 0;
}
