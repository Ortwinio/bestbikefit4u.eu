# S1 Stripe webhook and authenticated backend

- `/stripe/webhook` preserves the 501 localized stub before reading the request when billing is disabled. Enabled requests verify Stripe HMAC locally (API configuration `2026-06-24.dahlia`) before invoking an internal mutation. No public payment-confirmation mutation exists.
- Event-id deduplication and all writes happen in one Convex mutation. Confirmed one-off payments and confirmed paid annual invoice periods grant access; unpaid completion, subscription status, failed/expired sessions and action-required invoices do not grant it.
- An authenticated checkout reservation binds user/product/owned bike. Signed provider metadata must match that reservation. EUR totals must match the catalog. Annual invoice lines must match the configured annual price ID carried in signed subscription metadata. No extra Convex price environment variable is needed.
- Initial checkout receipts retain their initial amount/payment identity across renewals. Annual periods use the actual annual invoice line dates, with one grant per subscription + period start. Gift availability derives from those grants through the catalog/gift integration.
- Delayed SEPA, invoice-before-checkout, duplicate events, failure-after-payment, full-refund-before-payment, late payment-intent enrichment after refund, and subscription-deletion-before-invoice are covered. Partial refunds alone do not revoke all access. Subscription termination is persisted and also applies to delayed grants; replays cannot restore shortened access.
- `getCheckoutStatus({sessionId})` authenticates ownership; unknown/unowned IDs return null, pending is never payment proof. `reserveCheckout` reuses identical pending attempts less than 23 hours old; stale attempts do not lock the account. Changed locale receives a new reservation to avoid provider idempotency parameter conflicts.
- `stripeBillingPeriods` retains original confirmed paid period dates, amount, customer and payment identity even when access expires/cancels. `billingContext` returns this authoritative context for cancellation retries. There is no client-reservable refund quote: the API worker calculates the refund from provider-confirmed cancellation time and cancels before refunding. Standalone appointments never hide annual subscription state.
- New schema tables: `stripeCheckouts`, `stripeBillingPeriods`, `stripeInvoicePaymentLinks`, `stripePaymentRefunds`. Existing `stripe_events` remains the transactional deduplication log. No generated API files changed by this worker.

## Validation

- 30 focused tests across `convex/stripe/__tests__`: passed.
- Convex TypeScript (`tsc --noEmit -p convex/tsconfig.json`): passed.
- ESLint for `convex/stripe` and `convex/http.ts`: passed.
- All provider interactions in tests are local signatures or mocks; no Stripe calls, mails, deployments or environment changes occurred.

## Owned files

`convex/stripe/{checkout,billingContext,queries,events,mutations,webhook}.ts`, `convex/stripe/__tests__/{fixture,checkout.test,webhook.test,webhookProcessing.test}.ts`, Stripe route in `convex/http.ts`, new Stripe table blocks only in `convex/schema.ts`, this note.

## Required event configuration

Subscribe the Stripe endpoint to `invoice_payment.paid` in addition to the README's original events. Modern invoice payloads may omit their payment intent. This separately signed event persists invoice-to-payment identity and reconciles a full refund even when the refund precedes that mapping. Both mapping-before-invoice and mapping-after-refund orders are tested. No Stripe secret key or provider fetch is required on Convex. `billingContext.invoiceId` supports a separately validated API-side payment lookup before cancellation when identity has not arrived yet.
