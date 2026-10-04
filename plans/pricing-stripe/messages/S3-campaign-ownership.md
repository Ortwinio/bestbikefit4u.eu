# Campaign sidecar to parent

Complete: commercial.ts/test, deleted campaign CTA component, calculator campaign callers/tests, login campaign callers/tests, fit start campaign callers/tests, FitPass campaign callers/tests, pressure CTA/test, ClosingCtaBand and HeaderAuthActions/test. Parent explicitly assigned ClosingCtaBand; its standard layout is preserved. No shared/backend/dictionary edits.

C contract consumed; commercial FAQ/terms now use canonical annual_upgrade and personal_fit_standalone entries, current renewal prices, six-month eligibility and two gift measurements. Final focused mocked suite: 159 tests / 14 files passed; scoped ESLint and whitespace check passed. Audit and file list: plans/pricing-stripe/audit/S3-campaign.md and S3-campaign-files.txt.

Parent-owned public homepage test retains obsolete campaign mocks (not runtime). Account owner: SubscriptionOverviewConnected.tsx still referenced annual_entry at last audit; please align to annual_upgrade. No file conflicts encountered.

5 October contract refresh: full updated C contract read; campaign integration already matches canonical catalog. Re-ran 159 tests / 14 files and scoped ESLint successfully. Parent pricing guard now reports exactly the account-owned SubscriptionOverviewConnected.tsx:19 legacy key, no campaign findings. Campaign sidecar complete; no checkout/account/mail files touched.

Client billing follow-up complete: FitPassPaywall uses isStripeBillingVisible. Added public=true/private=absent browser test and inverse flags test; FitPass/commercial/PDF focused check: 37 passed, lint passed. Runtime isReportAccessOpen is now only called from the PDF route. No changes to server authorization or SLA labels.

Visual sidecar: 188 real-component captures completed. Initial findings only pricing landmark/free-link and checkout footer target widths; no overflow or unexpected browser/network errors. Pricing fixes are observed on disk, checkout footer width fix also now present. Waiting for explicit source freeze before final rerun, per parent request. Audit S3-visual.md has representative review and scope; no UI source edits for the visual findings.

FINAL visual handoff: after explicit source freeze, 200 captures / 50 scenarios pass with zero axe, overflow, effective <44px targets, unexpected errors or external requests. All 12 source hashes unchanged during capture and reverified afterwards. New cases cover confirmed first-year/renewed cancellation and unconfirmed response. Final inspected representatives include NL390 pricing and both cancellation confirmations, EN1440 upgrade review, EN390 standalone paid. Scoped ESLint and parent price guard pass. Evidence: audit/S3-visual.md, audit/S3-visual.json, renders/S3-*.png; harness tests/visual/pricing-ui/**. No source changes outside original campaign scope and new visual harness.
