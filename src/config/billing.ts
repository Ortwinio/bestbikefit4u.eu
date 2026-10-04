/** Both flags must permit checkout; the public flag is embedded in client bundles. */
export function isStripeBillingEnabled(): boolean {
  return process.env.STRIPE_BILLING_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_STRIPE_BILLING_ENABLED === "true";
}

/** Client presentation only; never use this as authorization for provider calls. */
export function isStripeBillingVisible(): boolean {
  return process.env.NEXT_PUBLIC_STRIPE_BILLING_ENABLED === "true";
}
