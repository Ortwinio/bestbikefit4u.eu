# Prompt 02 — Schema And Billing Model

## Goal

Extend Convex billing state so Stripe is represented in normalized records instead of only `users.stripeCustomerId` and `users.stripeSubscriptionId`.

## Read First

- `convex/schema.ts`
- `convex/stripe/mutations.ts`
- `convex/admin/queries.ts`
- `convex/admin/mutations.ts`
- `src/components/admin/billing/billing-live-data.ts`
- `src/components/admin/billing/BillingViews.tsx`

## Tasks

1. Extend `plans` with Stripe product/price fields:
   - `stripeProductId?: string`
   - `stripePriceId?: string`
   - `stripeLookupKey?: string`
   - `currency?: "EUR"`
2. Extend `subscriptions` with Stripe lifecycle fields:
   - `provider: "stripe" | "manual"`
   - `externalId` as Stripe subscription ID
   - `stripeCustomerId?: string`
   - `stripePriceId?: string`
   - `currentPeriodStart?: number`
   - `currentPeriodEnd?: number`
   - `cancelAtPeriodEnd?: boolean`
   - `canceledAt?: number`
   - `latestInvoiceId?: string`
   - `lastPaymentStatus?: string`
3. Add a `stripe_events` table:
   - `stripeEventId`
   - `eventType`
   - `livemode`
   - `apiVersion?`
   - `objectId?`
   - `processedAt`
   - `payloadJson`
   - indexes by event ID, type, processed time
4. Decide entitlement source:
   - `users.tier` remains the fast read model.
   - `subscriptions` is the auditable billing source.
5. Create shared helpers for:
   - Stripe status to app subscription status mapping
   - Stripe price ID to app plan/tier mapping
   - entitlement patch generation

## Acceptance Criteria

- Schema supports idempotent event processing.
- Existing admin/manual billing flows still work.
- There is a single helper path for mapping Stripe subscription state to app entitlement state.
- Typecheck and Convex codegen pass.

