# S1 — Stripe API, configuration and provider boundaries

Implemented in the pricing worktree only. No provider calls, mail, deployment or actual environment changes were performed.

- Both billing flags must be exactly `true` for server/provider work. Missing flags fail closed. Auth remains 401;
  disabled authenticated calls return the existing localized 501 stub without backend writes or provider/network calls.
  `isStripeBillingVisible()` is client presentation only, never payment authorization.
- Authenticated Convex checkout reservations validate ownership, eligibility, consent and canonical product before any
  provider work. Checkout accepts no client amount, coupon, customer or return URL. All return URLs use `resolveSiteOrigin`.
- Single/standalone use payment mode; annual/upgrade/bundle use subscription mode. The bundle has the configured annual
  and one-off addon line items. Upgrade coupons apply only server-side. Configured price amounts, currency, recurrence and
  coupon amount/duration are checked against the one shared catalog before creating Checkout.
- Trusted metadata includes reservation/user/product/bike/locale and annual price ID on both Checkout and subscription.
  Customer creation and Checkout use stable idempotency keys. Only signed backend events confirm paid access.
- Portal configuration enables invoices and payment methods, explicitly disables cancellation and subscription changes,
  and has an idempotent configuration key. The authenticated server-owned customer is used.
- Initial-year in-app cancellation schedules the end of the paid period. Renewed cancellation validates the owned payment,
  cancels at Stripe first, then uses Stripe's actual `ended_at` (fallback `canceled_at`) for the prorated refund. No public
  pre-reserved quote can preserve an earlier, larger refund. Backend immutable billing periods preserve original dates
  and payment references for retries after access ends. Refund metadata plus provider idempotency prevents repeat refunds,
  including retries after the provider's idempotency cache expires.
- An unexpanded invoice payment is resolved from the server-owned invoice: exact customer/subscription/paid EUR invoice
  and original line period are verified before querying its paid invoice payments and checking the resulting PaymentIntent.
  Ambiguous split payments or more than 100 historical refunds require review rather than guessing a refundable amount.
- Health/preflight require new provider settings only when both flags enable billing. `.env.example` remains disabled,
  documents all supplied sandbox IDs as comments only, and explains that Convex also needs both billing flags plus its
  webhook secret. API version is `2026-06-24.dahlia`.

## Restricted key permissions for release configuration

Use a restricted server key with only the required operations: customers create; Checkout Sessions create;
prices/coupons read; subscriptions read/update/cancel; PaymentIntents read; invoices and InvoicePayments read;
refunds read/create; billing portal configurations create and portal sessions create. Do not expose this key through
NEXT_PUBLIC variables. Webhook signature verification uses the separately configured Convex signing secret.
No settings were changed by this task.

## Validation

- Focused API/configuration suite: **115 tests passed, 9 files**, all provider operations mocked.
- Final scoped ESLint passed, including invoice-resolution additions.
- Final integrated TypeScript run: no errors in this scope; separate gift/page.tsx expiresAt
  union error was reported to root. Root owns final integrated typecheck and gates after all worker changes settle.
- Tests cover flag matrix/offline behavior, configured products/coupon, server-owned reservations, missing consent,
  owner rejection, portal restrictions, prorating, provider customer mismatch, failed-refund retry, stale-request timestamp,
  refunds beyond idempotency cache lifetime, and unexpanded invoice payment recovery/rejection.
