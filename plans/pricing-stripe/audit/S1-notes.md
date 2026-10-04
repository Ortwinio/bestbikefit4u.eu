# S1 — catalog and Stripe backend

Implemented in the assigned pricing worktree. No commits, deployment, environment changes, real Stripe requests or mail sends. All provider tests use mocked SDK calls or local signature verification.

## Catalog and access

The existing shared catalog is authoritative: single EUR13.50, annual EUR21.50, eligible upgrade EUR9.50 first year then EUR21.50, bundle EUR234.50 then EUR21.50, standalone appointment EUR209.50. The bundle is annual2150 + one-off21300 cents; upgrade is the annual price minus a once-only1200-cent coupon. Genuine single purchases and gift redemptions qualify for six calendar months.

Reviewed `origin/feature/pricing-model-v2:shared/pricing.ts` and its tests. Adopted useful price/window constants in the existing structure; rejected its one-credit upgrade because the owner explicitly requires two gifts per paid subscription year. No second catalog.

Historical entry product rows retain an additive storage validator and read-normalizer only; current product/API/UI keys use annual_upgrade. Standalone appointments have no invented expiry: expiresAt0 is an explicit untimed appointment, excluded from fit access and generic expiry. The gift helper grants an owned-bike single entitlement atomically and idempotently; A derives two credits from each paid annual period. See S1-catalog-notes.md.

## Stripe boundaries and confirmation

Both billing flags must explicitly be true. Otherwise authenticated Stripe API paths and the Convex webhook retain STRIPE_NOT_IMPLEMENTED; no provider work occurs. The browser-only visibility helper is separate from server authorization. No flags or actual environment files were changed.

Authenticated Checkout reservations validate catalog product, bike ownership, eligibility and withdrawal acceptance. The server verifies configured EUR amounts and recurring intervals, applies the upgrade coupon itself and creates payment/subscription sessions with bound metadata. Return URLs use resolveSiteOrigin. Pending or returned checkout URLs never grant access. Receipts show the initial confirmed amount, not later renewal prices.

The Convex webhook verifies the raw request signature locally before an internal mutation. Event deduplication and grants are atomic. Access follows confirmed paid one-off sessions or paid annual invoice periods; subscription-created, unpaid/failed/expired sessions and action-required invoices never grant it. Signed invoice-payment linkage handles modern invoices without an expanded payment intent. Full refunds and subscription deletion apply correctly regardless of event order.

Portal configuration permits invoice history and payment-method changes, with subscription changes/cancellation disabled. In-app initial-year cancellation ends at period end without refund. Renewed subscriptions are cancelled first; the trusted provider end time determines the unused-period refund. Immutable original billing periods survive access expiry, enabling safe retries. Refund metadata plus provider idempotency prevents replay refunds beyond the provider's short-lived idempotency cache. See S1-webhook-notes.md and S1-api-notes.md for details.

## Configuration handoff (not enabled)

Vercel needs the restricted Stripe key and the four price IDs plus coupon ID only when billing is enabled. Convex needs the webhook signing secret and both enable flags. Sandbox IDs are documentation comments only; no code defaults. Subscribe the configured 2026-06-24.dahlia webhook to all README events, including invoice_payment.paid so payment/refund linkage does not require a secret API key in Convex. Existing Stripe SDK version supports that API version.

No provisioning or dashboard configuration was performed. A owns final combined build, crawl, email previews and visual sweep after S1/S3 freeze.

## Verification

- Integrated focused suite: **209 tests passed across19 files**, including catalog/gift access, appointment contracts, webhook/event ordering, API boundaries, cancellation retries, health and preflight. Log: `/private/tmp/s1-integrated-tests.log`.
- Final Convex tsc: **passed**. Log: `/private/tmp/s1-final-convex.log`.
- Final whole-tree lint: **passed**, including brand/domain, price, contrast, CSS and image guards. Log: `/private/tmp/s1-final-lint.log`.
- Full-app typecheck: **blocked only by A-owned `src/app/(public)/gift/page.tsx:44`**, where expiresAt is accessed on a union including the invalid state. No S1 errors. Exact finding sent in `messages/C-to-A-typecheck.md`; final log `/private/tmp/s1-final-typecheck.log`.
- S1 source frozen for A's final combined gates. The separate legacy paid-entry gift-source compatibility finding was passed to A in `messages/C-to-A-legacy-gift-source.md`; C did not modify gift-owned files.

All tests use mocked provider calls; no real Stripe interaction, payment, mail or environment change occurred.
