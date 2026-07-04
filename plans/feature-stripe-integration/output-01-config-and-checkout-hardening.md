# Stripe Config And Checkout Hardening Output

## Server-Owned Products

Checkout now resolves products from `src/config/stripeServer.ts`.

| Request `productKey` | Plan key | Stripe price env var | Notes |
| --- | --- | --- | --- |
| `fit_pass` | `pro_monthly` | `STRIPE_PRO_MONTHLY_PRICE_ID` | Current Fit Pass CTA wrapper for Pro monthly |
| `pro_monthly` | `pro_monthly` | `STRIPE_PRO_MONTHLY_PRICE_ID` | Direct Pro monthly product key |
| `pro_yearly` | `pro_yearly` | `STRIPE_PRO_YEARLY_PRICE_ID` | Optional future yearly price |

Clients can only send a product key. Price IDs are read from server environment only.

## Required Vercel Environment Variables

Set these for production deployments:

- `NEXT_PUBLIC_CONVEX_URL`: Convex deployment URL used by the Next.js app.
- `SITE_URL`: Canonical app origin, for example `https://bestbikefit4u.eu`.
- `STRIPE_SECRET_KEY`: Stripe live secret key.
- `STRIPE_WEBHOOK_SECRET`: Signing secret for the Convex webhook endpoint.
- `STRIPE_PRO_MONTHLY_PRICE_ID`: Live Stripe recurring monthly price for Pro / Fit Pass.

Optional:

- `STRIPE_PRO_YEARLY_PRICE_ID`: Live Stripe recurring yearly Pro price when enabled.
- `STRIPE_BILLING_ENABLED=false`: Emergency deployment escape hatch. Leave unset in normal production.

Production Vercel preflight (`npm run build:vercel` or `npm run vercel:preflight`) fails when billing is enabled and any required Stripe variable is missing.

## Required Convex Environment Variables

Set these in Convex for the deployed backend:

- `STRIPE_SECRET_KEY`: Stripe live secret key.
- `STRIPE_WEBHOOK_SECRET`: Signing secret for the webhook endpoint.
- `CONVEX_SITE_URL`: Convex HTTP actions site URL, used as the base for Stripe webhook setup documentation and future server-side links.

The live webhook endpoint is:

```text
${CONVEX_SITE_URL}/stripe/webhook
```

## Stripe Dashboard Setup

1. Create a Pro product.
2. Create a recurring monthly EUR price matching public pricing: EUR 9 / month.
3. Copy the live monthly price ID into `STRIPE_PRO_MONTHLY_PRICE_ID`.
4. If yearly pricing is enabled later, create a recurring yearly price and copy it into `STRIPE_PRO_YEARLY_PRICE_ID`.
5. Enable Stripe Checkout payment methods appropriate for the EU market.
6. Configure Customer Portal for cancellation, payment method updates, and invoice access.
7. Add the live webhook endpoint `${CONVEX_SITE_URL}/stripe/webhook`.
8. Configure webhook events required by the full billing plan:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `charge.refunded`

## Checkout Behavior Implemented

- Request body is strict: `productKey`, optional `sessionId`, and `locale`.
- Production fails closed when Stripe key, site URL, or selected price config is missing.
- Development/test can still return `/pricing?dev=stripe_mock` when Stripe is incomplete.
- Existing `users.stripeCustomerId` is reused.
- Missing Stripe customers are created with user metadata and stored via `users.mutations.storeStripeCustomerId` before checkout is returned.
- Checkout sessions use subscription mode with server-owned `line_items`, `customer`, `client_reference_id`, `allow_promotion_codes`, and reconciliation metadata.
