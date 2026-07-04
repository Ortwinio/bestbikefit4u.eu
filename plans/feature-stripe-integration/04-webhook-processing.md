# Prompt 04 — Webhook Processing

## Goal

Make Stripe webhook processing idempotent, complete enough for subscription access, and connected to admin billing state.

## Read First

- `convex/http.ts`
- `convex/stripe/mutations.ts`
- `convex/schema.ts`
- `convex/admin/queries.ts`
- `convex/admin/mutations.ts`
- `convex/emails/fitpass.ts`

## Tasks

1. Keep raw body verification intact. Prefer Stripe SDK `constructEvent` where supported; otherwise keep constant-time HMAC verification and add tests.
2. Store every accepted Stripe event in `stripe_events` before processing, keyed by `stripeEventId`.
3. Skip processing when an event ID was already processed.
4. Handle at minimum:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `invoice.payment_action_required`
   - `charge.refunded` if Fit Pass one-off purchases remain relevant
5. Upsert `subscriptions` rows from Stripe subscription payloads.
6. Insert `billing_events` rows for all lifecycle changes.
7. Update `users.tier`, `proSince`, `stripeCustomerId`, and `stripeSubscriptionId` from normalized subscription state.
8. Only send welcome emails after a verified paid/active subscription transition, not merely a redirect.
9. Log unknown but valid event types as ignored, not failed.

## Acceptance Criteria

- Replaying the same Stripe event does not duplicate billing effects.
- `invoice.paid` / active subscription state grants access.
- canceled, unpaid, incomplete_expired, and terminal states revoke or degrade access according to product rules.
- Admin subscription and event pages show webhook-created records.
- Tests cover valid signature, invalid signature, replay, active subscription, failed payment, and cancellation.

