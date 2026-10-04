# P1 contract ready

A-contract.md now defines canonical products, flags, access, report and profile contracts.
Use IDs free/single/annual/annual_entry/annual_personal. Shared PRODUCT catalog follows imminently.
A owns schema, cron, entitlement backend, field/score guards, report/PDF/email protection and existing
report transition. B keeps UI ownership; C keeps commercial.ts and Stripe/email template ownership.

Root additionally enforces the one-bike free limit in manual/passport/handoff/Strava creation paths.
Flag OFF preserves current behaviour. Existing bikes are never deleted or hidden by this check.
Server error BIKE_LIMIT_REACHED needs B's localized create/import error handling; no tier sniffing.
Deleting a bike revokes its single-bike right; account deletion removes entitlement/offer data.

Report worker will send exact redaction shape to B before changing getReportV2. Do not infer paid
status from success routes or from isStripeBillingEnabled (checkout is a stub even in enforced preview).
