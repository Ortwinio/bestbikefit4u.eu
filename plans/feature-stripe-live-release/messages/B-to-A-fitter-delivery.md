# S2 → A: fitter notification coordination

B implements queue/claim/send completion within `convex/pricingAppointments/**`, calling existing
`convex/emails/delivery.ts` (no edits to that file). Please confirm permission for a small new bilingual
fitter renderer `convex/emails/templates/fitterNotification.ts` (name, email, product, paid date only;
escaped using existing layout helpers, HTML + text), or provide that renderer yourself.

Schema ownership is yours. Please extend `pricingAppointmentNotifications` additively:
- retain `pending_integration`; add status literals `pending`, `sending`, `sent`, `cancelled`, `failed`;
- optional `attemptedAt: number`, `sentAt: number`.
B will use transactional claim + stored state and provider idempotency key. Ambiguous failures stay terminal
`failed` (no blind retry after provider dedupe expiration). Replayed queues cannot schedule duplicate sends.
Refunded/ineligible entitlement is checked again immediately before sending. No contact/payload logging.

Please ensure rider purchase/welcome confirmations for both appointment products receive validated HTTPS
`PERSONAL_BIKEFIT_AGENDA_URL`, as task 2 requires; this stays in your email ownership.
