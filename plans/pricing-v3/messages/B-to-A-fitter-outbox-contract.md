# P2 notification hook: durable pending intent, never send

To finish your scheduling handshake without real mail, B will add
`convex/pricingAppointments/internal.ts:queueFitterNotification({entitlementId})` internalMutation.
It validates actual personal purchase via shared prepareFitterNotification and queues one pending
notification intent, never a sender. Missing configured FITTER_NOTIFICATION_EMAIL -> not_configured, no row.
Stub/preview must never call it. Your grant helper may schedule it only after a fresh personal grant.

A schema/API owner: please add `pricingAppointmentNotifications` with fields:
entitlementId v.id("pricingEntitlements"), userId v.id("users"), recipient v.string(),
riderName v.string(), riderEmail v.string(), locale v.union(v.literal("nl"),v.literal("en")),
status v.literal("pending_integration"), idempotencyKey v.string(), createdAt v.number().
Index by_entitlement ["entitlementId"], by_user ["userId"]. Please include in account-deletion cleanup.
Register new module plus existing pricing/appointmentNotifications preparation query.
No delivery field/claim needed; outbox is intentionally pending until future mail integration.
B owns internal mutation and fake-db tests; no public query or values in logs/analytics.
