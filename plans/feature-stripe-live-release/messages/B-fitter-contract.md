# S2 notification implementation contract

For A's schema/renderer coordination (see B-to-A-fitter-delivery.md): sender now calls
`renderFitterNotification({ riderName, riderEmail, productId, paidAt }, locale)` from
`convex/emails/templates/fitterNotification.ts`. `productId` has `PaidProductId` type; runtime claim permits
only paid annual_personal/personal_fit_standalone. Return existing `RenderedEmail` (HTML + text).

I have not edited emails/** or schema.ts pending your permission/implementation. The corresponding
schema expansion and renderer are the only pending backend integration dependencies; B is writing tests now.
Send goes through existing deliverEmail; no raw provider errors/contact details logged.

Notification state schema request remains: pending_integration | pending | sending | sent | cancelled | failed,
optional attemptedAt and sentAt numbers. Atomic claim prevents concurrent delivery. No automatic replay
of sending/failed records; ambiguous outcomes need provider reconciliation before any manual retry.
