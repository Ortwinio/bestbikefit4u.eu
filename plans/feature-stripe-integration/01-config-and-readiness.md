# Prompt 01 — Config And Readiness

## Goal

Make Stripe configuration explicit, fail-closed in production, and aligned with the existing product/pricing model.

## Read First

- `src/app/api/stripe/checkout/route.ts`
- `src/config/commercial.ts`
- `scripts/check-vercel-env.mjs`
- `src/app/(public)/pricing/page.tsx`
- `src/components/features/fitpass/FitPassPaywall.tsx`
- `src/components/features/fitpass/FitPassLandingCta.tsx`

## Tasks

1. Define the paid product catalog in server-owned config:
   - `pro_monthly`
   - `pro_yearly` if planned
   - future `premium`, `bike_shop`, and `enterprise` placeholders only if useful
2. Map each product to required environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRO_MONTHLY_PRICE_ID`
   - optional `STRIPE_PRO_YEARLY_PRICE_ID`
   - `SITE_URL`
   - `NEXT_PUBLIC_CONVEX_URL`
   - Convex `CONVEX_SITE_URL` or documented webhook URL
3. Update `scripts/check-vercel-env.mjs` so paid production deploys fail when Stripe-required env vars are missing.
4. Remove production mock checkout behavior. Mock checkout is only allowed in non-production development.
5. Document Stripe Dashboard setup:
   - Products and prices
   - Checkout enabled payment methods
   - Customer Portal configuration
   - Live webhook endpoint: `${CONVEX_SITE_URL}/stripe/webhook`
   - Required webhook events
6. Add a plan output file listing exact Vercel env vars and Convex env vars to configure.

## Acceptance Criteria

- Production build preflight fails if Stripe billing is enabled but required env vars are missing.
- Development can still use a safe mock checkout path.
- Price IDs are selected from server-owned config, never from client input.
- Plan output contains a complete Stripe Dashboard and env setup checklist.

