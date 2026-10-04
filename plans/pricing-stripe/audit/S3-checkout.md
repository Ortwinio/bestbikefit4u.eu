# S3 checkout subsection

## Implemented

Read repository AGENTS.md, pricing-stripe README, pricing boards, existing flow/tests, and C-contract.md. No nested AGENTS.md under src/plans. README amounts override historical boards. User extended ownership to the actual src/app/(checkout)/checkout route.

- Uses C's single catalog: annual €21.50/year, single €13.50, bundle €234.50, eligible annual_upgrade €9.50 then €21.50/year, personal_fit_standalone €209.50.
- Authenticated getSubscription access controls upgrade and standalone eligibility using eligibleForUpgrade / eligibleForPersonalFit. Query strings and stored selections cannot create eligibility. Upgrades include two gift measurements per subscription year.
- Checkout posts C's exact productId/bikeId?/locale/withdrawalAccepted body with authentication; no client prices or coupon IDs. Missing consent, owned bike, auth, or standalone eligibility prevents submission. In-flight submit is disabled; errors retain choice.
- Client presentation uses C's isStripeBillingVisible public-only helper; it works without the private server variable in browser bundles. Server endpoints retain C's separate two-flag authorization gate. Flag-off remains the local STRIPE_NOT_IMPLEMENTED notice with no fetch. A server-disabled response is preserved if browser/server flags disagree.
- Route passes scalar session_id and cancelled; session ID survives email-code sign-in. CheckoutClient uses authenticated api.stripe.queries.getCheckoutStatus only when enabled and signed in. Unknown/pending is processing; only paid is success; failed/expired is retryable failure. Neither return URLs nor old entitlements prove this payment.
- Actual amountTotalCents and productId drive the receipt, keeping the €9.50 upgrade amount even after eligibility changes. Runtime validation accepts only own paid product keys from C's catalog; invalid/free/inherited keys remain pending without a receipt. Standalone success offers “Plan je afspraak”, with no annual-access or renewal claim. Pending never offers access or booking.
- Existing preview flag restrictions, labels, seven-character authentication, storage checks, reactive consent invalidation, mobile success actions, and safe agenda behavior remain.
- Visual-smoke follow-up: footer links now have minimum width and height of 44px with centered labels, fixing undersized NL/EN Terms/Privacy targets. Scoped CSS assertion checks both dimensions and the existing no-raw-colors rule; parent sweep worker owns browser remeasurement.

## Focused validation

74 tests pass in 7 files against the real C catalog and actual billing helpers, with payment requests/auth/Convex mocked. Covers NL/EN copy, prices, consent, eligibility, ownership, persistence, flag-off, public flag on with private server variable absent, server-disabled response, POST shape, duplicate submits, errors, status mapping, actual receipt amount, invalid paid-product responses, appointment state, return parameters and localized routing. Billing flags are stubbed/restored only within tests; no environment configuration files changed.

Commands (workdir /Users/ortwinverreck/Developer/bikefitboost-pricing):

`/opt/homebrew/bin/node /Users/ortwinverreck/Developer/bikefitboost-pricing/node_modules/vitest/vitest.mjs run /Users/ortwinverreck/Developer/bikefitboost-pricing/src/components/checkout '/Users/ortwinverreck/Developer/bikefitboost-pricing/src/app/(checkout)/checkout/page.test.tsx' --config /Users/ortwinverreck/Developer/bikefitboost-pricing/vitest.config.ts`

`/opt/homebrew/bin/node /Users/ortwinverreck/Developer/bikefitboost-pricing/node_modules/eslint/bin/eslint.js /Users/ortwinverreck/Developer/bikefitboost-pricing/src/components/checkout /Users/ortwinverreck/Developer/bikefitboost-pricing/src/i18n/marketing/checkout.ts '/Users/ortwinverreck/Developer/bikefitboost-pricing/src/app/(checkout)/checkout/page.tsx' '/Users/ortwinverreck/Developer/bikefitboost-pricing/src/app/(checkout)/checkout/page.test.tsx'`

Scoped ESLint and git diff --check pass. Scoped obsolete-price/key scan returns no matches. Vitest prints only the repository's existing Vite CommonJS-config warning.

## Handoff and boundaries

Checkout subsection complete. No commercial.ts exports required. Shared catalog/access/backend/account files untouched; no commits, builds, deployments, package/environment edits, real Stripe calls or mails. Parent/A owns combined release checks and visual sweep. Agenda/location/legal placeholders remain existing configuration requirements; no booking destination invented.

File manifest: /Users/ortwinverreck/Developer/bikefitboost-pricing/plans/pricing-stripe/audit/files-S3-checkout.txt.
