# S3 isolated pricing UI visual audit

Status: PASS on final frozen source, 5 October 2026. Final command exited 0. Visual sidecar did not edit other owners' UI source.

## Final result

- 200 captures: 50 scenarios × NL/EN × 1440/390. All expected PNGs rendered.
- Zero axe violations (no rules disabled), document overflow, enabled effective targets below 44×44, unexpected browser/runtime errors or external requests.
- All 12 tracked source SHA-256 hashes unchanged during capture and independently matched again after capture. Hashes and capturedAt timestamp are stored in S3-visual.json.
- Final source includes parent pricing landmark/free-link fixes, checkout footer minimum widths, and account confirmed-cancellation handling.
- Confirmed first-year and renewed cancellation scenarios assert confirmation status plus removal of stale renewal/cancel controls. Unconfirmed cancellation response remains an error state. All responses are local mocks.
- Scoped ESLint, pricing-copy guard and git diff whitespace check passed.
- Final representatives inspected: NL390 pricing page, EN1440 upgrade review, NL390 confirmed first-year/renewed cancellation, EN390 paid standalone. Earlier visual review also covered pending, payment error, chooser and subscription states listed below; all were recaptured against the final frozen source.
- Board appointment placeholders remain documented release configuration. No fictional appointment location/duration/agenda/terms substituted.

## Run and evidence

`node /Users/ortwinverreck/Developer/bikefitboost-pricing/tests/visual/pricing-ui/capture.mjs`

Machine proof: S3-visual.json. Harness: tests/visual/pricing-ui/**. Screenshots: plans/pricing-stripe/renders/S3-*.png. S3-visual-smoke.json is historical pre-fix evidence, superseded by the final full report.

The loopback harness renders real pricing page/cards, CheckoutFlow and SubscriptionOverview with actual CSS modules, globals and local fonts. Framework/analytics boundaries and service responses are isolated. Paid UI receives explicit fixture receipts; the URL is never proof. Scope excludes full Next shell/hydration, connected authentication and live services; A retains combined integration/build gates.

## Resolved early findings

- Pricing page: axe moderate landmark-unique. The comparison section and inner table region share the same accessible name. Source: src/app/(public)/pricing/page.tsx, comparison/tableWrap.
- Pricing page: inline create-account link is 20px tall on desktop; EN mobile also fails strict 44px target audit. Source: pricing.module.css free link.
- Checkout: footer Terms is 35×44px in EN, Privacy is 41.83×44px in EN; NL Privacy is also under 44px wide. Source: CheckoutFlow.module.css footer links. Add minimum width without shrinking the existing height.
- Pricing and paid appointment UI retain board-provided [DUUR AFSPRAAK], [LOCATIE], [AGENDALINK] and appointment-terms placeholders. Per parent, these are release configuration, not invented facts or defects to replace in this sidecar.

Smoke: 16 captures, no document overflow, no unexpected external requests. Real CSS modules and globals loaded; representative EN desktop pricing and NL mobile upgrade review inspected. Mocked cancellation intentionally returns 501 and is classified separately from unexpected browser errors in the final harness.

First full sweep: 188 captures = 47 scenarios × NL/EN × 1440/390. No unexpected runtime/browser errors, no horizontal document overflow, no attempted external requests. All 52 subscription captures and 12 isolated pricing-card captures pass axe and effective 44px targets. Four pricing-page captures have the duplicate comparison landmark; 120 checkout captures have footer-link widths below 44px. Three pricing-page variants also have the short inline create-account link. Strict harness correctly exits 1 for these findings. Pricing source changed during the run; hashes record this and final recapture must use frozen source.

Coverage: all five canonical paid products at selection/review/pending/paid/failed, plus email/code authentication, mocked payment exception, billing-off message and ineligible standalone selection. Subscription: loading/unavailable/free/free-open/single/expired-but-upgrade-eligible/annual/upgraded/renewed/personal/cancelled/cancellation-confirm/cancellation-off.

Representatives inspected: EN1440 full pricing, NL390 upgrade review, NL390 personal subscription, EN390 paid standalone appointment, EN1440 pending upgrade, NL1440 standalone chooser, NL390 payment exception, EN390 cancellation-off. Layouts remain readable with expected responsive stacking; prices and renewal amounts match the catalog. Mobile payment action is fixed at the viewport bottom, so full-page screenshots show its position at the capture viewport; this is existing component behavior, not a duplicated action. Programmatic heading focus is preserved in screenshots.

Parent confirmed source freeze after pricing landmark/free-link and checkout footer-width fixes. The final 200-case rerun supersedes the initial 188-case run and adds confirmed first-year/renewed cancellation plus unconfirmed-response rendering.

Harness: tests/visual/pricing-ui/capture.mjs. Artifacts: plans/pricing-stripe/renders/S3-*.png; machine results S3-visual.json (full) and S3-visual-smoke.json (smoke).
