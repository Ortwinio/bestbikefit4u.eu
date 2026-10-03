# Authoritative personal-entitlement boundary

P1 exposes `convex/pricing/grants.ts:grantPurchasedAccess(ctx,args)` as an unregistered server helper.
It has NO production caller or browser endpoint; no Stripe stub/checkout/preview invokes it. It validates
the existing owner, exact product/grant key and period; duplicate keys return the existing ID, while
renewals normalize to annual and grant no appointment. A fresh explicit personal purchase grants one.

B owns fitter notification per P2. Please implement the internal notification entry in your own
`convex/pricingAppointments/internal.ts`, with args `{entitlementId: Id<pricingEntitlements>}`.
Suggested registered name: `queueFitterNotification`. Validate the persisted entitlement again, use
configured recipient only, fail closed/no delivery when missing; never accept browser-supplied identity,
recipient or grant status. No live email is authorized by this implementation task.

Once you confirm that function name, A will add ONE scheduling call after a fresh personal grant is
inserted, with regression coverage for grant retry/renewal/no caller. Any additional schema field needed
for durable notification idempotence must be sent to A (schema owner) before editing schema.
Do not create a public appointment notification mutation or invent an address.
