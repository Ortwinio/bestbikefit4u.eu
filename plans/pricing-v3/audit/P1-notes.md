# P1 products, entitlements and access

Only the pricing worktree was changed. No commit, push, deployment, live backend, purchase or mail call.
A-contract.md was published first; B/C received product, access, profile and report follow-up contracts.

## Implementation

- Canonical VAT-inclusive catalog and calendar-month terms; free/single/annual/entry/personal products.
  Entry requires genuine single history; each explicit personal package includes one appointment,
  annual renewal does not. Stripe stub results never grant rights.
- Optional persisted entitlements, transition offers/runs, authenticated owner queries and redemption.
  Shared pure getAccess and backend owner helper check expiry immediately. Bounded daily expiration
  preserves records; maximum free/single bike count is enforced on manual, passport, handoff and
  Strava creation, without deleting existing bikes. Deleted-bike grants retain entry history but no
  active access; refunds/admin revocations do not qualify. Account deletion removes the new records.
- Enforcement defaults OFF on both server and browser. Existing billing flag implementation is
  untouched; new access logic uses the distinct enforcement flag so preview works with stubbed Stripe.
  .env.example documents both flags. Do not deploy mismatched enforcement settings.
- Existing profile scoring stays identical OFF. ON: complete free base is exactly 80; six board
  refinements add 20. New measured test fields do not overwrite declared flexibility/core. Server
  refuses changed/refreshed paid values without access; complaints stay editable and expired values
  remain readable/removable with concurrency checks. B owns shared-hook/UI call-site integration.
- Selected-bike scoring also uses an 80-point base and board refinements of 5/5/2/2/3/3. Detail/garage
  use authoritative bike access, not rider-wide fullProfile. Direct bike/calculator-chain writers refuse
  paid changes; free catalogue linking/passport import copies basic fields only. Free Strava synchronization
  does not overwrite retained paid riding summaries. Removal clears matching evidence with owner/CAS checks.
- P2 requested an inert fitter outbox boundary: root added its schema/account cleanup and internal API
  registration. A fresh verified personal grant schedules B's internal queue once; retries/renewals do
  not. The queue stores pending integration only, never sends, and the grant helper still has no live caller.
- All report queries redact paid narrative server-side. Matching-bike access, annual rights and explicit
  old-report markers govern full access. Free can export its latest report only, with core-only PDF/mail.
  Exports use authoritative access and payload from one query snapshot, including when Next/Convex
  flags differ. New calculations never copy the old-report marker.
- Admin transition defaults to dry run; execution requires same-admin matching completed evidence.
  Existing reports are explicitly marked, eligible accounts get one offer, legacy paid periods keep
  their actual end date. No automatic transition or emails. See P1-transition-runbook.md.

## Tests and scope

Focused products/entitlements, profile writers/scoring/hooks, report/export and deletion suites pass.
Root adds real-helper integration tests linking exact expiry to score/write/report access and testing
legacy/OFF behaviour. Tests use deterministic synthetic data, not a deployed database or payment.
Detailed slices: P1-entitlements-notes.md, P1-profile-notes.md, P1-reports-notes.md.

Additional bike writer validation: 10 real-handler tests PASS (creation, imported basics, unchanged old
values, single-bike isolation, chain refusal before evidence writes, OFF behaviour). Bike/refinement suites
and 3 cross-profile/report exact-expiry integration tests pass. Both body and bike changes remain scoped
to supplied source values; no placeholder measurements or invented Strava activity are written.

## Final combined gates — 4 October 2026

C owns and completed the final integrated rerun after B's DONE P2. All P1 build/crawl evidence is current for the integrated tree: application typecheck, full lint, 3,323 unit tests (20 existing skips), 490 contracts, standalone Convex tsc, production build, 875-check local crawl with zero findings, and 34 bilingual email previews / 68 screenshots pass. Full commands, logs, build ID and offline limits are recorded in [P3-integrated-gates.md](P3-integrated-gates.md).

Final production build: `vTY-ao2GtdMT9XJunzTfi`. Crawl evidence: `plans/seo-crawl-fixes/audit/crawl-pricing-integrated-final.md`. These results supersede the initial 3,300-test/build/crawl snapshot and rerun the backend checks rather than carrying them forward.

## Shared visual acceptance

B completed and accepted all 200 cases; report overflow, sidebar labels, inverse-surface contrast, checkout notice and fixed-action findings are closed. See P2-notes.md, P2-gates.md and messages/B-P2-complete.md. B's visual build is 6KW82hm49ljNYI1ddtwmm; the final integrated rebuild above uses unchanged application source and is not a separate visual capture. Earlier pending visual handoffs are superseded.

P1 implementation and combined verification are complete. Unit fixtures validate persistence/authorization without touching production data. No commit, deployment, real payment or mail.
