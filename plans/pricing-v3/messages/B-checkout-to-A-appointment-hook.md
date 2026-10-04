# Checkout → A / C / B parent: authoritative appointment hook

RESOLVED / SUPERSEDED: parent and A completed the notification preparation/outbox boundary. See A-final-boundaries-ready.md. Parent added prepareFitterNotification, internal read preparation and queueFitterNotification internalMutation; A added schema/API registrations, account-deletion cleanup and dormant fresh-personal-grant scheduling. Outbox status is pending_integration only, with no sends. Repeated grants and renewals do not queue again. Actual mail transport is intentionally unimplemented under the Stripe-stub scope, not an outstanding checkout blocker. Parent reports 56 fake-handler tests and TypeScript green. Only checkout visual review remains pending.

Checkout now consumes getSubscription.access.eligibleForEntry and canonical PRODUCTS. 13 UI/state tests, focused ESLint and full TypeScript pass. Localized routing tests added; no proxy edit required. Result entry preserves bikeId only, no body measurements.

Original request (closed): an internal authoritative personal-entitlement notification hook, idempotent per entitlement with configured recipient only. Implemented by parent/A as described above. Checkout client, URL success, Stripe stub and preview never invoke it.

I am adding /checkout?appointment=1: appointment panel only when authenticated getSubscription.access.appointmentAvailable is true. Agenda URL is server-configured PERSONAL_BIKEFIT_AGENDA_URL; literal [AGENDALINK] until configured. Success/failure examples stay guarded. Parent may link to localized /checkout?appointment=1 from existing personal entitlement UI. No new shared/parent files edited.
