# S3 campaign removal

## Scope

Removed campaign branches from login, fit entry, five calculator pages, pressure CTA, FitPass entry/paywall, ClosingCtaBand and HeaderAuthActions. The standard closing CTA layout, buttons and tracking remain intact. Removed campaign-specific fit-start tracking and the donation CTA component. Campaign copy/date/URL exports are removed from commercial config. Report access remains open whenever Stripe billing is off; authentication and backend authorization stay intact.

Commercial FAQ/terms now use C's canonical annual (€21.50/year), annual_upgrade (€9.50 then €21.50/year), personal_fit_standalone (€209.50) and annual_personal (€234.50 then €21.50/year) catalog entries. Both locales describe the six-month purchase/gift redemption upgrade window, two annual gift measurements, automatic renewal and standalone appointment eligibility. FitPass recognizes all three annual product variants via isAnnualProduct.

No shared catalog/backend, pricing dictionaries/page, checkout/account dictionaries/components, home dictionaries or environment files edited. No builds, commits, network services, production calls or real emails.

## Final validation

- Focused mocked UI/config/PDF tests: 14 files, 159 tests passed. Includes all six calculator page suites, login, fit entry, pressure CTA, FitPass access/payments, header actions, commercial config and PDF route.
- Commercial tests exercise billing-on/off report access before, during and after the old campaign dates; NL/EN pricing and gift/upgrade terms; absence of expired campaign content.
- Scoped ESLint across owned UI and tests: passed.
- Git diff whitespace check: passed.

## Coordination

Client billing follow-up: FitPassPaywall now uses isStripeBillingVisible (public flag only). isReportAccessOpen continues to use strict server billing authorization and now has no runtime client callers; its only runtime caller is the PDF route. Added browser-presentation regression coverage for public=true/private=absent and public=absent/private=true. Other commercial imports in clients only consume price/copy helpers. CheckoutClient and AccountPlan were identified separately for their assigned workers. The fit-pass public page is a server component, so its strict helper remains appropriate. Support SLA labels retained per parent instruction.

Follow-up validation: FitPass payments/commercial/PDF route suites passed 37 tests; scoped ESLint passed. Follow-up scan confirms no runtime client imports/calls of isStripeBillingEnabled remain after the other workers' patches.

Revalidated 5 October after the full C contract update, including authenticated checkout-status and storage-normalization sections. Campaign scope requires no checkout/status changes; those remain checkout-worker owned. Current FAQ/terms already consume annual_upgrade and personal_fit_standalone. Repeated all 14 focused suites: 159 passed; scoped ESLint passed. Ran the parent pricing guard directly: exactly one failure remains in account-owned SubscriptionOverviewConnected.tsx:19 (old entry product key); no campaign-owned findings. This is reported to parent/account owner, not modified across ownership boundaries.

- C-contract.md consumed; no pending catalog dependency.
- Parent explicitly assigned ClosingCtaBand cleanup to this sidecar; completed without changing the standard layout.
- No runtime campaign helper/component/prop references remain in src. Parent-owned public homepage test still has obsolete campaign mocks; these are not runtime callers.
- Account worker's SubscriptionOverviewConnected.tsx still referenced the old entry key at audit time; left to its owner.

Owned source/test paths are listed in S3-campaign-files.txt.
