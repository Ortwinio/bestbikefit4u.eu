# Prompt 06 — Admin And Analytics

## Goal

Make Stripe billing supportable by admins and reliable for conversion analytics.

## Read First

- `src/components/admin/billing/BillingViews.tsx`
- `src/components/admin/billing/billing-live-data.ts`
- `convex/admin/queries.ts`
- `convex/admin/mutations.ts`
- `src/lib/analytics/marketing.ts`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`

## Tasks

1. Add Stripe fields to admin billing plan and subscription views:
   - customer ID
   - subscription ID
   - price ID
   - current period
   - cancel-at-period-end
   - latest invoice
2. Add `stripe_events` read views or fold event summaries into billing event detail.
3. Make admin subscription lifecycle controls safe:
   - Manual plan changes should be labeled manual and should not pretend to update Stripe.
   - Stripe-backed subscriptions should prefer portal/Stripe Dashboard links unless a deliberate admin sync action exists.
4. Move conversion completion analytics to verified webhook state where possible.
5. Record `checkout_started` at client initiation and `checkout_completed` only after verified Stripe event processing.
6. Add support notes for common billing support cases.

## Acceptance Criteria

- Admin can diagnose a payment problem from Convex admin pages.
- Manual billing and Stripe billing are visually distinct.
- Conversion events do not over-count abandoned Checkout redirects.
- Billing support actions write audit logs.

