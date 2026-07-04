# Prompt 03 — Checkout Session Hardening

## Goal

Make `/api/stripe/checkout` production-safe, customer-aware, and product-aware.

## Read First

- `src/app/api/stripe/checkout/route.ts`
- `convex/users/queries.ts`
- `convex/users/mutations.ts`
- `convex/stripe/mutations.ts`
- `src/components/features/fitpass/FitPassPaywall.tsx`
- `src/components/features/fitpass/FitPassLandingCta.tsx`

## Tasks

1. Validate request body with a strict server-side schema:
   - `productKey`
   - optional `sessionId`
   - `locale`
2. Resolve product/price from server config.
3. Fail closed in production when Stripe config is missing.
4. Reuse existing `user.stripeCustomerId`; otherwise create a Stripe customer before Checkout.
5. Store new customer ID on the Convex user before returning checkout URL.
6. Add useful Checkout metadata:
   - `userId`
   - `productKey`
   - `planKey`
   - optional `fitSessionId`
7. Use subscription mode and include:
   - `client_reference_id`
   - `customer`
   - `allow_promotion_codes`
   - success/cancel URLs
8. Ensure no client-supplied price ID can be used.

## Acceptance Criteria

- Authenticated users get a Stripe-hosted Checkout URL for configured products.
- Existing Stripe customers are reused.
- Production cannot silently return a mock checkout URL.
- Checkout metadata is sufficient for webhook reconciliation.
- Unit tests cover missing env, invalid product, unauthenticated request, and successful session creation with mocked Stripe.

