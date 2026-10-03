# P2 pricing worker — completed

Implemented only the public pricing route, pricing-specific cards/CSS, pricing dictionary and focused validation artifacts. No shared UI, frozen dictionaries, other routes, backend, Stripe, commits or deployments changed by this worker.

## Delivered

- Read AGENTS.md, pricing-v3 README/RELEASEPLAN, Pricing desktop board, mobile checkout Kies board, B-ui-plan and A/C contracts. No separate mobile Pricing board exists; mobile follows annual-first release requirements.
- Three paid cards: single €13.50, annual €24.50, annual_personal €234.50, with €19.50 annual renewal. Canonical IDs/type/prices imported from shared/pricing/products.ts. NL uses decimal commas, EN decimal points; every card says VAT included.
- Annual is ink/lime, taller and centered at desktop; first in DOM/reading order and first in the mobile stack. All CTAs use localized /checkout?product=canonical-ID links, enabled despite the Stripe stub. Pricing remains a public server-rendered standard offer page. Checkout owns getSubscription eligibility and annual_entry; its query contract has been read.
- Free €0 comparison includes 1 bike, 80% profile, core values and latest-report PDF. Added honest-advice section, five FAQs, trial CTA and localized metadata. Service/Offer JSON-LD matches visible products, VAT and localized URLs; FAQ schema matches visible answers; no ratings.
- Preserved appointment placeholders verbatim, including in EN. Retained only the explicitly permitted annual-card gift feature; omitted gift redemption, gift FAQs and gift comparison row for 2.0.
- PricingCard reuse contract communicated in messages/B-pricing-contract.md. Props: locale, productId, href, optional highlighted (defaults true for annual). Checkout selection behavior remains checkout-owned.
- Retired old monthly/campaign pricing page and its superseded regression tests. No commercial.ts imports remain; C may complete legacy catalog cleanup.

## Validation

- `npx vitest run 'src/app/(public)/pricing/page.test.tsx' src/i18n/marketing/marketingDutch.test.ts`: 2 files, 9 tests passed. Covers NL/EN, canonical offer amounts/links, annual-first reading order, free/PDF comparison, placeholders, 2.0 gift scope, absence of old prices/ratings and canonical metadata/JSON-LD.
- Owned files and visual script ESLint passed; scoped git diff --check passed. CSS module token check: 27 files, zero raw color lines.
- `node plans/pricing-v3/audit/P2-pricing-visual.mjs`: four component-fixture renders with actual pricing components/CSS/local brand fonts at NL/EN × 1440/390. Assertions passed: annual centered/tallest desktop, first mobile, 56px CTA height, no page-level overflow. Inspected desktop NL and mobile EN screenshots. Table scrolling is contained to the keyboard-focusable comparison region.
- Renders: plans/pricing-v3/renders/pricing/{nl,en}-{1440,390}.png and measurements.json (git-ignored). Fixture mocks locale/link/analytics/schema runtime and excludes shared header/footer; component visual QA, not full Next routing/checkout integration.
- Full `npm run typecheck` attempted twice. First sandboxed run could not write tsconfig.tsbuildinfo; authorized retry completed with errors outside pricing: paidAccess.test.ts fixture cast and generated api.pricing missing from concurrent account/dashboard code. No owned-file diagnostics. Reported to A/B in messages/B-pricing-validation.md. This is an integration limitation, not a successful full typecheck.
- Full build, suite and route/checkout end-to-end sweep remain parent integration gates. No live backend/payment activity used.
