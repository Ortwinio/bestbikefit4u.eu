# S3 account subsection

Status: DONE S3 account subsection. C contract integration and confirmed cancellation handling complete.

## Integration notes

- Read `/Users/ortwinverreck/Developer/bikefitboost-pricing/plans/pricing-stripe/messages/C-contract.md`. Connected overview uses eligibleForUpgrade and eligibleForPersonalFit; annual_upgrade displays as an annual subscription. Stored entitlement matching uses C's normalizeProductId helper; no legacy UI product key. No shared/catalog/backend changes by this worker.
- Annual subscriptions link to `/gifts` from settings using the authoritative displayed annual product, never fullProfile/fullReport or open billing flags. Includes cancelled annual plans while their access remains active.
- Appointment purchase links target `/checkout?product=personal_fit_standalone`; confirmed appointment availability links to `/checkout?appointment=1`. Checkout owner must retain these route inputs.
- Upgrade offer remains available after the three-month fit expires when the server still reports six-month upgrade eligibility. Subscription copy derives upgrade, appointment, renewal, gift count and upgrade-window values from C's catalog/constants.
- No purchases or gifts are granted by this UI. Existing flag-off cancellation behavior is retained.
- Cancellation requires both HTTP success and cancelled:true before showing confirmation. Pending, malformed and failed responses cannot confirm cancellation. Confirmed cancellation hides the stale renewal and cancellation controls; the existing reactive subscription query continues to supply actual access/plan changes without client entitlement mutations. No refund amount is invented.
- Inspected the settings page and searched frontend portal callers: settings has no portal link or redirect handler, so no existing portal URL handling needed migration.

## Validation

- Final client-visibility follow-up: AccountPlan now uses isStripeBillingVisible (public flag only), including when the private flag is absent from the browser. Its 24 focused tests and scoped ESLint pass. The server billing helper/endpoints were not changed and still require both flags. This rerun supersedes the previous 21-test AccountPlan result within the 78-test combined run below; the other suites were unchanged.

- 78 focused tests passed across SubscriptionOverview, AccountPlan, settings, and ReportAccessPanel after final changes.
- Scoped ESLint passed for all eight modified source/test files.
- Parent pricing-copy guard passed with zero findings.
- Existing cancellation stub response and failure behavior remain covered; account tests cover billing/paid-access flags without granting purchases.
- Literal renewal assertions verify €21,50 / €21.50. Connected settings tests cover annual_upgrade, authoritative upgrade/appointment eligibility, appointment availability, and gift navigation with enforcement on/off. Mocked cancellation tests cover pending, confirmed success, reactive plan changes, HTTP failure and malformed success responses.
- No builds, package changes, commits, deployment, real Stripe requests, or real mail.

## Handoff

No outstanding account integration dependency. Parent/A retain combined typecheck, build and visual gates; checkout, mails and public/campaign work remain with their owners.
