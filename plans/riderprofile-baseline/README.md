# R0 — baseline measurement before Riderprofiel phase 1

**Why:** PLAN §11 of the Riderprofiel plan (Ortwin, 3 okt 2026) asks for two weeks of baseline before phase 1
goes live. Today public calculator usage is not tracked at all, so "public result → account" cannot be measured.
**Branch / worktree:** `feature/baseline-measurement` in `/Users/ortwinverreck/Developer/bestbikefit4u-baseline`
(from `main`). Small, separate PR, released before phase 1. No visual change.

## Scope
1. **Value-free calculator events** (no measurement values, ever):
   - `calculator_result_view` — once per page view, the first time a public calculator shows a result after the
     user changed an input. Payload: calculator id, locale, path. Nothing else.
   - `calculator_login_cta_click` — clicks on the existing login/account links from a public calculator.
     Payload: calculator id, locale, path.
   Both must be allowed for anonymous users (`ANONYMOUS_MARKETING_EVENT_TYPES`) and go through the existing
   `marketingEvents` pipeline and cookie/consent rules. Add them via one shared hook/wrapper so calculator files
   change minimally (one line each) — the Riderprofiel branch edits the same calculators.
2. **Baseline report** — `convex/analytics/baseline.ts` internal query `riderProfileBaseline({ from, to })`
   returning aggregates only (counts, medians, ratios; no user ids, emails or values):
   - public calculator result views per calculator; login CTA clicks per calculator; `login_verified` events
     whose session started from a calculator (`src`), and new users created in the window;
   - median number of filled profile fields after 7 and 30 days for users created in the window;
   - account calculator use: calculatorStates updated per active user per month;
   - share of recommendations with ride feedback; return within 30 days (`lastLoginAt`).
   Plus `scripts/riderprofile-baseline.mjs` that runs it read-only (`node_modules/.bin/convex run --prod`) and writes
   `plans/riderprofile-baseline/baseline-<from>-<to>.json` + a short markdown summary.
3. Tests: events carry no values; anonymous allowed; report has no PII keys; aggregates on a fake DB.

Gates: focused vitest, `npm run typecheck`, `npm run lint`, `npm run build`. Notes `audit/R0-notes.md`,
`audit/files-R0.txt`. No commit/deploy. Print `DONE R0`.

## R0 implementation status — 3 October 2026

Complete in the baseline worktree, ready for lead review. 117 focused tests pass (20 existing skips), seven browser event checks pass, typecheck/lint/production build pass. No commit or deploy. Historical measurement limits and read-only runner usage: `audit/R0-notes.md`.
