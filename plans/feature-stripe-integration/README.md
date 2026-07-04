# Plan: Stripe Billing Integration

## Goal

Turn the existing partial Stripe checkout/webhook plumbing into a production-grade Stripe Billing integration for BestBikeFit4U subscriptions, customer billing management, entitlement updates, admin billing visibility, and reliable revenue analytics.

## Current Code Readiness

The repository is partially prepared for Stripe:

- `stripe` is already installed in `package.json`.
- `src/app/api/stripe/checkout/route.ts` creates Stripe Checkout Sessions in subscription mode.
- `convex/http.ts` exposes `POST /stripe/webhook` on the Convex site and verifies the raw webhook payload with `stripe-signature`.
- `convex/stripe/mutations.ts` can upgrade/downgrade `users.tier` using Stripe customer/subscription IDs.
- `users` already has `tier`, `proSince`, `stripeCustomerId`, and `stripeSubscriptionId`.
- Admin billing already has `plans`, `subscriptions`, and `billing_events` tables plus admin UI under licenses/subscriptions.
- Fit Pass CTA/paywall components already call `/api/stripe/checkout`.

The code is not yet complete for production billing:

- Checkout ignores `productKey` and only supports one environment variable price (`STRIPE_PRO_PRICE_ID`).
- Missing Stripe env vars return a mock URL even in production, which should fail closed.
- Checkout does not reuse an existing Stripe customer ID.
- Webhook handling only covers `checkout.session.completed` and `customer.subscription.deleted`.
- Webhooks are not idempotent by Stripe event ID.
- Stripe subscription lifecycle is not mapped into the `subscriptions` / `billing_events` admin tables.
- No handling for `customer.subscription.created`, `customer.subscription.updated`, `invoice.paid`, `invoice.payment_failed`, `checkout.session.expired`, refunds, or portal-driven changes.
- No Stripe Customer Portal endpoint exists for users to manage billing/cancel/update payment method.
- Marketing `checkout_completed` can be triggered by redirect query params, but access should be based on verified webhook state.
- Production preflight does not require Stripe secrets/prices when paid features are enabled.
- There is no reconciliation job to compare Stripe state with Convex billing state.

## External Integration Notes

Stripe’s subscription docs emphasize that subscription access must be driven by webhook state because subscription creation, renewals, payment failures, portal changes, and cancellations happen asynchronously. The customer portal also requires a server-created portal session and webhook handling for downstream changes.

## Scope

In scope:

- Stripe product/price configuration model for Pro / Premium / B2B-ready plans.
- Hardened checkout session creation.
- Idempotent webhook ingestion and event processing.
- Convex billing state as the source of app entitlements.
- Stripe Customer Portal endpoint and UI entry points.
- Admin billing views enriched with Stripe identifiers and event payloads.
- Production environment validation and rollout checklist.
- Test-mode and live-mode verification plan.

Out of scope:

- Stripe Connect marketplace payments.
- Usage-based metering.
- In-app card collection outside Stripe-hosted Checkout/Portal.
- Complex seat self-service for organizations beyond preserving schema compatibility.

## Architecture Decision

Use Stripe-hosted Checkout for new subscription purchases and Stripe Customer Portal for cancellation, payment method changes, invoices, and subscription management. Convex remains the application entitlement source, but all Stripe-originated state changes must flow through verified webhooks into normalized Convex billing records.

## Acceptance Criteria

- [x] In production, checkout cannot return a mock URL when Stripe secrets or price config are missing.
- [x] Checkout creates or reuses a Stripe customer mapped to the Convex user.
- [x] Checkout supports explicit product/price selection from server-owned config, not client-controlled prices.
- [x] Verified Stripe webhooks are idempotently stored by event ID.
- [x] Webhooks update `users.tier`, `users.stripeCustomerId`, `users.stripeSubscriptionId`, `subscriptions`, and `billing_events`.
- [x] Subscription status changes handle active, trialing, past_due, canceled, incomplete, incomplete_expired, unpaid, and paused states.
- [x] `invoice.paid` extends entitlement access; failed/canceled/unpaid states revoke or degrade access according to product rules.
- [x] Customer portal sessions are available to authenticated paid users.
- [x] Admin billing views show Stripe customer ID, subscription ID, price ID, current period, cancel-at-period-end, and recent Stripe event history.
- [x] Stripe test-mode checkout, payment failure, cancellation, portal update, and webhook replay flows are covered by tests/manual verification.
- [x] Production rollout documents exact required Vercel and Convex env vars.

## Success Criteria

- A user can start from the pricing page, complete Stripe Checkout, return to the app, and receive Pro access only after the verified webhook is processed.
- A user can open the Stripe Customer Portal from settings/account and cancel or update payment details without admin support.
- Admins can inspect Stripe-linked subscription rows and billing events without using the Stripe Dashboard for routine support.
- Failed payments or cancellations remove paid access predictably and leave an auditable event trail.
- Replayed Stripe events do not duplicate billing events or corrupt subscription state.

## Implementation Prompts

1. [01-config-and-readiness.md](./01-config-and-readiness.md) — production env validation, product mapping, and Stripe setup checklist.
2. [02-schema-and-billing-model.md](./02-schema-and-billing-model.md) — extend Convex schema for Stripe IDs, event idempotency, periods, and status mapping.
3. [03-checkout-session-hardening.md](./03-checkout-session-hardening.md) — harden `/api/stripe/checkout` and reuse customers.
4. [04-webhook-processing.md](./04-webhook-processing.md) — idempotent webhook ingestion and entitlement updates.
5. [05-customer-portal.md](./05-customer-portal.md) — portal route and account/settings UI entry points.
6. [06-admin-and-analytics.md](./06-admin-and-analytics.md) — admin billing, support workflows, and conversion events.
7. [07-testing-and-rollout.md](./07-testing-and-rollout.md) — automated tests, Stripe CLI/manual checks, production deployment runbook.

## Progress

- [x] Code readiness audit
- [x] Plan created
- [x] 01 — Config and readiness
- [x] 02 — Schema and billing model
- [x] 03 — Checkout hardening
- [x] 04 — Webhook processing
- [x] 05 — Customer portal
- [x] 06 — Admin and analytics
- [x] 07 — Testing and rollout

## Implementation Status

Completed on 2026-07-04.

Verification:

- `npx convex codegen`
- `npm run typecheck`
- `npm run build`
- `npm run lint:runtime-boundaries`
- `npx vitest run src/app/api/stripe/checkout/route.test.ts src/app/api/stripe/portal/route.test.ts convex/stripe/__tests__/mapping.test.ts convex/stripe/__tests__/webhook.test.ts convex/stripe/__tests__/webhookProcessing.test.ts src/components/admin/billing/billing-live-data.test.ts`
- `npx eslint src/app/api/stripe/checkout/route.ts src/app/api/stripe/checkout/route.test.ts src/app/api/stripe/portal/route.ts src/app/api/stripe/portal/route.test.ts src/config/stripeServer.ts convex/http.ts convex/schema.ts convex/stripe/mutations.ts convex/stripe/mapping.ts convex/stripe/webhook.ts convex/stripe/__tests__/mapping.test.ts convex/stripe/__tests__/webhook.test.ts convex/stripe/__tests__/webhookProcessing.test.ts convex/users/mutations.ts scripts/check-vercel-env.mjs src/components/admin/billing/BillingViews.tsx src/components/admin/billing/billing-live-data.ts src/components/admin/billing/billing-live-data.test.ts 'src/app/(dashboard)/settings/page.tsx' 'src/app/(dashboard)/fit/[sessionId]/results/page.tsx' src/components/features/fitpass/FitPassLandingCta.tsx src/i18n/messages/en.ts src/i18n/messages/nl.ts`
- Production preflight without Stripe env fails as expected.
- Production preflight with dummy complete Stripe env passes.

Rollout and audit notes are in `output-07-rollout-and-audit.md`.
