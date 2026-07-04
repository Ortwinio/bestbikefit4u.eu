# Prompt 05 — Customer Portal

## Goal

Let users self-serve billing management through Stripe Customer Portal.

## Read First

- `src/app/api/stripe/checkout/route.ts`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/profile/page.tsx`
- `src/components/layout/DashboardSidebar.tsx`
- `convex/users/queries.ts`

## Tasks

1. Create `POST /api/stripe/portal`.
2. Authenticate with `convexAuthNextjsToken`.
3. Load current user from Convex.
4. Require `user.stripeCustomerId`; return a clear error if missing.
5. Create a Stripe Billing Portal session with a safe return URL.
6. Add a "Manage billing" button in the most appropriate account/settings surface.
7. Add localized empty/error states:
   - no paid subscription
   - Stripe customer missing
   - portal unavailable
8. Confirm portal-driven subscription updates are handled by webhook events, not optimistic client state.

## Acceptance Criteria

- Paid users can open Stripe Customer Portal from the app.
- Free users do not see a misleading portal action.
- Portal cancellations and payment method changes update Convex through webhooks.
- Route is covered by mocked tests.

