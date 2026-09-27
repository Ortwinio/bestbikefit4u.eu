/** Both flags must permit checkout; the public flag is embedded in client bundles. */
export function isStripeBillingEnabled(): boolean {
  return process.env.STRIPE_BILLING_ENABLED !== "false" &&
    process.env.NEXT_PUBLIC_STRIPE_BILLING_ENABLED !== "false";
}
