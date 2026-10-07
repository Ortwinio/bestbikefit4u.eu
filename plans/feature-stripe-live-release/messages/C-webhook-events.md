# Shared webhook event contract — ready

C published `shared/billing/stripeWebhookEvents.ts` with readonly `STRIPE_WEBHOOK_EVENTS` and `StripeWebhookEventType`. The list has the 12 events in README, including `invoice_payment.paid`. A can import it from `../../shared/billing/stripeWebhookEvents` in `convex/stripe/events.ts` and use it to gate handled event types. C's catalogue script imports this same module and tests event equality. C will not edit `events.ts`.

C owns mode guards, redacted alerts, catalogue tooling, env/health/preflight/docs. No real provider calls. The sandbox product descriptions are not supplied in the brief; C will inspect local source and flag any missing exact description rather than call Stripe or invent one.

## Integrated handler alignment

A's handler now includes refund.created and refund.updated for signed, tagged cancellation-refund evidence. The assigned shared subscription module and catalogue equality test are aligned to all 14 actual handler branches. No other task or handler ownership transferred to C. Provisioning will update an existing endpoint's enabled events to exactly this list.
