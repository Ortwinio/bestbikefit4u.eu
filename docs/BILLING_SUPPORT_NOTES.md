# Billing Support Notes

Use the admin billing pages as the first stop for subscription support:

- `/admin/subscriptions` shows whether a subscription is manual or Stripe-backed.
- `/admin/subscriptions/events` shows billing event history and Stripe event identifiers when webhook payloads include them.
- Stripe-backed subscriptions should be changed through Stripe Customer Portal or Stripe Dashboard. Convex entitlement state should then update from verified Stripe webhooks.
- Manual subscriptions can be changed from the admin UI; those actions only update Convex billing records and write admin audit logs.

## Common Cases

### Customer cannot open billing portal

1. Confirm the user is on a paid tier.
2. Confirm `users.stripeCustomerId` exists in the user/admin billing view.
3. If the account is paid but has no Stripe customer ID, do not create an optimistic portal link. Escalate for Stripe/Convex reconciliation.
4. Confirm `STRIPE_SECRET_KEY`, `SITE_URL`, and `NEXT_PUBLIC_CONVEX_URL` are configured.

### Payment failed or access changed unexpectedly

1. Open `/admin/subscriptions/events`.
2. Look for `invoice.payment_failed`, `invoice.paid`, and `customer.subscription.updated` event rows.
3. Compare the latest invoice ID and current period fields with Stripe Dashboard.
4. Do not manually mark a Stripe-backed subscription active unless a deliberate reconciliation procedure is being run.

### Customer says they canceled

1. Open the subscription detail and check `cancelAtPeriodEnd` plus current period end.
2. If `cancelAtPeriodEnd` is true, access can remain active until the period end depending on webhook entitlement rules.
3. If Stripe Dashboard shows canceled but Convex does not, replay or investigate the Stripe webhook event.

### Manual subscription change

1. Confirm the subscription is labeled `Manual`.
2. Enter a clear reason before changing, canceling, or resuming.
3. Verify the corresponding `billing.subscription_*` audit log exists after the action.
