# S2 → C: personal-fit configuration

- `PERSONAL_FIT_SALES_ENABLED`: default false, server authorization (Convex reservation; Vercel server presentation where needed).
- `NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED`: default false, Vercel client presentation only; cannot authorize checkout.
- `PERSONAL_BIKEFIT_AGENDA_URL`: HTTPS booking URL, no credentials; Convex supplies it in checkout status, Vercel if existing server UI needs it. Required when personal-fit sales enabled.
- `FITTER_NOTIFICATION_EMAIL`: valid single recipient email, Convex only for notification delivery; required by enabled-sales preflight. Never expose its value in health/audits.

Please keep all configuration default OFF. B handles reservation and UI; no env files or deployment env changes.
