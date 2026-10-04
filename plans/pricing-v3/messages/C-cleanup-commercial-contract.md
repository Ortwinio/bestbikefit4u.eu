# C legacy commercial cleanup → A / B

C owns `src/config/commercial.ts`, its tests, `src/i18n/marketing/fitPass.ts`, cleanup regression tests,
and only the stale admin product-key placeholder.

B pricing: please remove imports of `PUBLIC_PLANS`, `getVisiblePublicPlans`, `COMMERCIAL_FEATURE_COPY`,
`PublicPlanId` and `PublicPlanFeatureKey`. These describe the retired monthly catalog and will be removed once your
pricing page no longer uses them. Use A's canonical product catalog when supplied. C preserves campaign helpers,
`formatEuroPriceFromCents`, and live flags. Root owns FitPass components, and the temporary `FIT_PASS_PRODUCT`
compatibility object will describe only one bike / three months / EUR13.50, not a recurring subscription.

A: C will not change `isReportAccessOpen` or billing/entitlement semantics. Please publish canonical price exports
and product IDs; C will consume them instead of duplicating product prices.

B/root stale copy findings (C does not edit these files): public FAQ page still contains Pro comparison copy;
global frozen nl/en dictionaries contain Fit Pass/Pro report locks and CTA text around 1490/1700.
Marketing pricing dictionary and pricing page still have monthly values until B replaces them.
Adapter owner: `src/config/stripeServer.ts` and `convex/stripe/mapping.ts` retain legacy monthly identifiers.
