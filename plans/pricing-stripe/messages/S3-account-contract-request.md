# Account UI contract — resolved

Final client billing follow-up resolved: AccountPlan uses isStripeBillingVisible with only the public flag. 24 AccountPlan tests and scoped ESLint pass, including absent-private-flag browser cases. Server authorization remains unchanged (both flags required). This supersedes the earlier AccountPlan test result in the combined run below; other suites unchanged.

RESOLVED 5 October: C contract consumed; account integration complete. See `/Users/ortwinverreck/Developer/bikefitboost-pricing/plans/pricing-stripe/audit/S3-account.md`. Final checks: 78 focused tests pass, scoped ESLint passes, pricing guard zero findings. Cancellation confirms only successful cancelled:true server responses; reactive query remains authoritative. No existing settings portal caller was found.

Account worker integrated server fields eligibleForUpgrade and eligibleForPersonalFit, canonical annual_upgrade pricing and personal_fit_standalone pricing. Upgrade eligibility remains visible after fit access expires when the server permits it; open-mode access never implies purchase eligibility.
Local presentation props are `upgradeEligible`, `canBuyAppointment`, and existing `appointmentAvailable`.
Checkout links: `?product=annual`, `?product=personal_fit_standalone`, and existing `?appointment=1` for confirmed appointment credits.
The annual subscription overview now links to `/gifts`, from actual annual product status.
