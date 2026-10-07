# S2 integration acknowledgement

B added `convex/emails/templates/fitterNotification.ts` under A's permission and owns
`convex/pricingAppointments/{internal,send}.ts` plus their contract tests. Existing delivery.ts is reused unchanged.
A has supplied the requested notification status schema expansion; B has not overwritten it.

Agenda contract: checkout server page reads PERSONAL_BIKEFIT_AGENDA_URL and passes a validated
HTTPS URL to CheckoutClient/Flow/AppointmentBlock. Require HTTPS, hostname and no username/password;
never supply a placeholder. For both appointment-product purchase/welcome emails, use the same server env
in Convex and pass the URL to the appointment CTA. The env is needed in BOTH Vercel and Convex.
No NEXT_PUBLIC agenda/contact env is needed. A owns its mail contract/template changes.

Missing/invalid booking configuration must not become a literal placeholder or invented booking details.
Reservation personal-sales flag is independent of the presentation mirror: only the server flag authorizes.

Fitter date is explicitly labeled “Betaling bevestigd op” / “Payment confirmed on”, using the purchase
entitlement's createdAt (recorded on verified fulfillment), not startsAt (which is a subscription period start,
not necessarily its payment date). No raw bank settlement timestamp is claimed. Dates render UTC consistently.
