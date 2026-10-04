# P2 — pricing model v3 UI complete

Work only in feature/pricing-v3 worktree. No commits, deployments, real payments, mail or production data.
Four parallel workers: pricing, checkout, settings/visual harness, account integration. Parent owns report access,
FAQ/Main, dormant appointment preparation and final integration. Early contract: ../messages/B-ui-plan.md.

## Implemented

- New bilingual three-card pricing page uses canonical PRODUCTS, VAT-inclusive prices, annual center/tallest on
  desktop and first on mobile, matching visible Offer/FAQ JSON-LD with no ratings.
- Distraction-free checkout uses actual localized auth, saved selection, owned bike, server intro eligibility,
  required withdrawal consent and shared Stripe stub. Guarded success/failure previews never grant access.
- Report/results uses owner-scoped getReportAccess, no tier bypass or query-string success toast. Free latest
  PDF/email remain available as core-only exports; detailed comparison/steps use fullReport. Legacy reports
  retain explicit marking. Inaccessible PDF actions are disabled; the results email action explains the access
  restriction instead of opening/sending. Shared report actions also clear cached viewer URLs on access changes.
- Free result has contextual single-bike/annual checkout links and permanent safety copy. Accuracy labels are localized.
- FAQ visible answers and FAQPage JSON-LD stay in parity; new personal-fit terms retain supplied placeholders.
  Homepage CTA shows new prices and preserves S5's removal of unsupported trust claims.
- Settings and account updates are detailed in P2-settings-notes.md and P2-account-notes.md. Wizard/Welcome,
  selected-bike refinements and legacy Fit Pass access are integrated and tested.
- Dormant internal fitter-notification preparation reads authoritative entitlement/owner and configured
  FITTER_NOTIFICATION_EMAIL. A fresh personal grant schedules B's owner-derived, idempotent internal outbox
  mutation; retry/renewal never queues a second appointment. It writes only pending_integration intent, never
  sends mail. Missing configured recipient creates no row. A owns schema/API/account deletion and grant scheduling.
  The grant helper has no production caller; Stripe stub/preview never grants or schedules. No delivery claim.

## Design/scope decisions

- Board review-state strips and synthetic identities/dates are not production UI/data.
- Main board includes superseded unbacked figures/testimonials. These are not restored; existing S5 tests remain.
- Literal annual-card two-measurement gift feature is the README's exception only. No release 2.1 gift flow.
- Existing legal/location/duration/agenda placeholders remain visible, never replaced with invented business facts.
- Paid enforcement OFF keeps access unrestricted, independent of Stripe availability. New pricing/checkout are live
  entry points but always end in the exact not-implemented result. Settings UI itself is not an entitlement restriction.
- Read-only checkout review caught incorrect OTP format, draft URL persistence and reactive consent state. All
  four findings (including intro gift scope) are resolved; independent re-review and 29 checkout tests pass.

## Intermediate evidence (not final acceptance)

- /tmp/P2-types.log: full nonincremental typecheck passes.
- /tmp/P2-report-tests.log: report/actions/overview/FAQ/Main, 53 tests pass.
- /tmp/P2-extra-tests.log: notification preparation/report invitation/MarketingHome, 18 tests pass.
- /tmp/P2-parent-final-tests.log: report UI and real-handler notification boundary/outbox, 56 tests pass.
- /tmp/P2-types-2.log: second full nonincremental typecheck passes, including the outbox schema/API.
- /tmp/P2-unit.log: 3,201 pass, 20 skipped, 397 files pass/one skipped; subsequent fixes require final rerun.
- Initial lint found new form registrations; parent registered checkout's permanently labelled native controls
  and enforced Input tooltips for ProfileRefinements. Tooltip guard now passes.
- Four pricing component renders reviewed, annual hierarchy and contained mobile table scroll preserved.
  Full matrix and final visual review pending; no live auth, billing or server authorization claim from fixtures.

## Final shared gates

Source is frozen. Final v3 typecheck and lint pass, including254/254 contrast and28 token-only CSS Modules.
Full unit run: **3,323 passed,20 skipped**; contracts:490 passed. Convex standalone TypeScript passes.
Final production build **6KW82hm49ljNYI1ddtwmm** and local crawl875 checks pass with zero findings.
After C completed P3, B explicitly took over the final build/crawl; no concurrent build ran. Exact logs and
intermediate build history: P2-gates.md. Counts are not added across overlapping focused/shared runs.
The suite includes correction of the two stale PDF-error assertions requiring retired Pro copy.

Manual review found and fixed: older-free PDF button overflow; legacy sidebar plan label; inverse dashboard
notice contrast; mobile checkout notice overlap; duplicate appointment heading; mobile success action position
and its subsequent specificity/width regression. Scoped regressions plus final full gates cover the fixes.

Final matrix: **200/200 captured,300 PNGs**, NL/EN ×1440/390 ×OFF/ON. Pricing8, checkout72, results48,
Settings56, Dashboard16. Zero runtime/query/asset/server/geometry failures; fixed mobile success CTAs have
16px gutters and358px width.292 PNGs match the reviewed v2 run; all8 changed mobile success images are
manually reviewed and pass. All200 cases have visual acceptance through direct inspection or exact reviewed
hash matches. Per-owner review notes give exact coverage; no unresolved P2 visual finding remains.

The capture used the final build's compiled CSS manifest from disk after the local proxy missed its offline
Convex environment value. No dev CSS. Parent repaired the proxy with the crawler's safe loopback URL,
verified login200 and byte-identical served/disk CSS (P2-css-provenance.json). Fixture limitations remain
explicit: no live auth/payment/mail, actual PDF generation, Next hydration or backend transition claim.
Small-control observations are advisory; this is not an accessibility certification. Independent sidebar
scroll behavior is not exercised by the screenshots; its existing overflow-y-auto region is documented.

## Release boundaries

- Both paid-enforcement environment flags remain unset/false by default; no activation or production change here.
- Actual checkout, cancellation, portal/refund and webhook payment behavior remains the shared not-implemented
  contract. Saved selection or cancellation intent is not a purchase, cancellation or refund.
- Success/failure previews are guarded and visibly labelled; a URL cannot grant access.
- Agenda/location/duration/legal placeholders require business-owner input before a real appointment launch.
- The personal-fit notification queue is deliberately pending integration, not delivered mail. No real recipient
  is invented, and missing configured recipient creates no intent row.
- Release 2.1 gifts/reviews are not implemented. No new unsupported ratings or homepage statistics were introduced.
- All work remains uncommitted in the pricing worktree. No mail, payment, production-data operation or deployment.
