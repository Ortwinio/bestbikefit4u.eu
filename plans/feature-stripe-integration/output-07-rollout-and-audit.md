# Stripe Rollout And Audit

## Implemented

- Server-owned Stripe product config in `src/config/stripeServer.ts`.
- Hardened checkout route at `/api/stripe/checkout`.
- Stripe Customer Portal route at `/api/stripe/portal`.
- Convex `stripe_events` ledger for webhook idempotency.
- Stripe lifecycle fields on `plans`, `subscriptions`, and `users`.
- Webhook processing for:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `invoice.payment_action_required`
  - `charge.refunded`
- Admin billing visibility for Stripe customer, subscription, price, current period, cancel-at-period-end, latest invoice, and event history.
- Billing support notes in `docs/BILLING_SUPPORT_NOTES.md`.

## Required Production Environment

Vercel:

```text
NEXT_PUBLIC_CONVEX_URL=https://<prod>.convex.cloud
SITE_URL=https://bestbikefit4u.eu
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_BILLING_ENABLED=true
```

Convex:

```text
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
```

Optional future yearly plan:

```text
STRIPE_PRO_YEARLY_PRICE_ID=price_...
```

## Stripe Dashboard Setup

1. Create the live Pro product.
2. Create the live monthly recurring EUR price.
3. Copy the live monthly price ID into Vercel and Convex.
4. Configure Customer Portal in live mode:
   - invoice history enabled
   - payment method update enabled
   - cancellation enabled according to the commercial policy
5. Add live webhook endpoint:
   - URL: `https://<convex-site-domain>/stripe/webhook`
   - Events:
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `invoice.payment_action_required`
     - `charge.refunded`

## Test Mode Verification

Run these before enabling live paid CTAs:

```bash
stripe listen --forward-to https://<convex-site-domain>/stripe/webhook
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
```

Manual app checks:

- Start checkout from the Fit Pass paywall.
- Confirm a Stripe customer is created or reused.
- Confirm a `stripe_events` row is written.
- Confirm a `subscriptions` row is created or updated.
- Confirm `users.tier` changes only after webhook processing.
- Open `/settings` and launch Customer Portal as a paid user.
- Cancel from the portal and confirm webhook-driven downgrade behavior.
- Replay the same event and confirm no duplicate billing effects.

## Rollback

If live billing has an incident:

1. Set `STRIPE_BILLING_ENABLED=false` only if you need deployment preflight to ignore missing billing env during a rollback.
2. Hide or disable paid CTAs at the product/config layer.
3. Keep the Convex webhook endpoint deployed and accepting events.
4. Reconcile Stripe Dashboard subscriptions against Convex `stripe_events`, `subscriptions`, and `billing_events`.
5. Manually adjust user tiers only after verifying Stripe subscription state.

## Audit Evidence

Passed locally on 2026-07-04:

- `npx convex codegen`
- `npm run typecheck`
- `npm run build`
- `npm run lint:runtime-boundaries`
- Stripe targeted Vitest suite: 27 tests passing.
- Targeted ESLint for Stripe checkout, portal, webhook, schema, admin billing, settings, and i18n files.
- Production missing-env preflight fails closed.
- Production complete-env preflight passes.

Known unrelated local state:

- `.tasks/events.log` was dirty before this implementation and is not part of the Stripe rollout.
- Sitemap XML response changes are present in the working tree but are unrelated to Stripe and are not required for this plan.
