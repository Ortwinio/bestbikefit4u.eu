# F2 — full reliability UI

Worktree: `/Users/ortwinverreck/Developer/bikefitboost-reliability`, branch `feature/reliability-full`. No commits, deployments, production data/env changes or real mails. Source manifest: `files-F2.txt`. Logs/screenshots/reference JSON remain ignored and are not release source.

## Implementation

- Public shared two-step template now covers bike-fit, frame size, crank length, saddle width, power/speed, climb planner, FTP/W/kg, gearing, fuel/hydration and tyre pressure. Existing saddle/Quick Fix stays intact with provenance-aware reuse. There are 11 standalone routes in this repository; the document's12 rows are advice metrics, including the four bike-fit outputs, not12 separate routes.
- Shared result rows consume C's numeric ranges directly: continuous RangeBar or discrete Maatbalk, mono values/units, basis, one next action, omitted factors and account refinement. No public flexibility/core/goal controls. Existing account body forms were extracted unchanged behind compatible dispatchers rather than losing their controls or saved-state APIs.
- All body centres remain existing engine results; missing inseam derives through C's shared saddle model. Defaults are examples and never saved on render. Declared/estimated inputs are reused without becoming measured; repeated-measurement metadata survives saddle Save. Strongly implausible body inseam falls back to height, with broad/dashed uncertainty and a remeasure action. Server quality validation remains C/A-owned.
- Account saddle uses real measurement chips/dates, bike/goal/climbing, explicitly unknown or self-assessed scores, breakdown and eligible knee teaser. Paid knee uses measured angle, actual current height, existing access gating, C's capped adjustment plan, evaluation date and safety copy. No image upload/automatic-angle claim or invented profile defaults.
- Dashboard consumes C's actual A–D advice/ranges, one greatest gain and profile provenance/date/check panel. Preserves profile rings, bike/report/pressure actions and empty states. No legacy safety-band or global per-advice confidence replaces uncertainty.
- NL/EN dictionaries cover all new copy. Public/profile prefills use A's compatible shared hook; central account-state precedence and persisted data/leave notices remain F3-owned. No measurement values added to URLs, analytics or logs.

## Board/document decisions

- Executed all18 board scripts/34 states via the local reference harness. Written model takes precedence over provisional board numbers.
- Saddle-width step1 retains hip circumference because ontwerp §9 and the existing engine require it, despite its omission in Calculator.dc.html. No invented hip measurement or replacement formula.
- Frame labels and crank candidates come from actual engine bands/options, not static board fixture sizes. Carb values remain guidelines, not uncertainty ranges. Shared performance adapters handle cadence/fluid-loss centres and reverse speed/power units.
- Tyre pressure has no owner-approved uncertainty width. It receives the same two-step shell but no fabricated95% band; actual pressure values and manufacturer safety warnings remain, with an explicit uncertainty limitation.
- Visual review removed nested account card frames/repeated headings from initial template integration. Account inputs are the board's three real cards, not an artificial public two-step limit. Unknown flex/core scores stay blank numeric controls rather than an invented slider midpoint. Public calculators remain at most two steps.

## Verification and handoff

- Focused public/body/account/dashboard-component/pressure/account-regression suite passed424tests before final account composition tests. Saddle-specific provenance/Quick Fix/home handoff suite83pass. Full dashboard page recovery now29pass; new auth/query mocks retain old unrelated assertions and test replacement uncertainty semantics.
- Whole-tree TypeScript without incremental cache, full lint (including tooltip,254 contrast checks and token-only CSS modules), and diff whitespace check passed. Final focused rerun after visual fixes recorded below.
- Public candidate UI review44/44 passed at NL/EN1440/390, zero serious/critical axe or overflow, no app errors. Additional account/knee/dashboard light/dark96-state review runs against current source presentation fixtures with no real auth/backend writes. First capture recorded13 late asset404 failures during a concurrent .next rebuild; they were not hidden. Local font assets are snapshotted for the repeat run.
- Inspected representative public desktop/mobile and account/knee/dashboard light/dark screenshots. Account follow-up recapture is tracked below. These fixture checks do not replace A's final built-route/profile-persistence/reuse/crawl/PDF/email gates.
- A owns the final fresh build and release-wide gates; messages document source changes and fixtures. Public saddle provenance changes and flattened account cards must be included in that build. Source manifests exclude other owners' backend/shared-data/PDF changes.

## Final rerun

### F2B account review follow-up

- Flexibility and core use keyboard-accessible 1–5 sliders with NL/EN level labels. Unknown scores remain explicitly unset and are not included when saving another preference.
- The knee-angle teaser replaces the identical next-step prompt. Repeat-measurement and bike/goal prompts remain when applicable; no empty arrow strip is rendered.
- Regression checks cover NL/EN labels, bounds, ArrowRight/Home/End handling, explicit save payloads, unknown scores and conditional next steps.
- Focused reliability suite: 7 files, 79 tests passed. Whole-tree TypeScript (`--noEmit --incremental false`) and full lint passed. No commits or deployment.

- Final focused suite: **47 files passed, 1 skipped; 459 tests passed, 20 pre-existing skipped**. Includes all public calculators, full dashboard page, dashboard components, reliability account/body, pressure and AccountFitCalculator regressions.
- Whole-tree `tsc --noEmit --incremental false` passes after the final account composition fixes. Full lint rerun passes; `git diff --check` passes.
- Public candidate screenshots: **44/44 pass**, zero axe violations, overflow or application errors. Final current-source account/knee/dashboard light/dark screenshots: **96/96 pass**, zero axe violations, overflow or application errors. Evidence: ignored `F2-ui-review.json` (public subset; initial account failures retained) and `F2-account-review.json` (superseding account run), plus `F2-*.png`.
- Reviewed the corrected three-card account layout, mobile knee flow, NL/EN copy, dark-mode SVG/range strokes, mono values and the compact dashboard. Reduced-motion contexts are used throughout. Local preview servers and temporary certificates were stopped/removed by the harness; no production interaction.
- F2 source is frozen for A's fresh final build/full release gates. All 80 listed source/test/harness files exist; source manifest contains no logs, renders or crawl JSON. **DONE F2**.
