# T1 — rider transition-offer redemption

Completed 8 October 2026, in `feature/transition-offer-redeem`. All previously open subagents were closed;
the remaining UI, tests and verification were completed directly. No commits, deployments, environment changes,
production data operations, real Stripe calls or real emails.

## Implementation

- Authenticated `pricing/queries:getTransitionOffer` returns only the current user's minimal status:
  none, upcoming, available, redeemed or expired. Dates and redeemed bike/expiry have explicit validators.
- The dashboard shows an availability-date card before launch, then an explicit owned-bike selector.
  No card appears for none, expired, redeemed, loading or signed-out states.
- The report's bike-specific paid boundary offers the free measurement before the unchanged paid prices.
  Inline confirmation names the bike and states the three-month, one-bike scope. Pending submission is guarded;
  known mutation errors have short NL/EN messages, without exposing backend errors.
- The existing owner-checked redemption mutation remains authoritative and idempotent. Its entitlement updates
  the existing reactive results access query; the backend test verifies full-report access after redemption.
  Billing flags OFF do not hide a valid offer or enable any Stripe path.
- Prelaunch transition runs can persist offers after the existing admin-owned, completed dry-run requirement.
  They do not grant legacy paid access early. Their offers-only mode persists if resumed after go-live.
  The runbook requires a fresh launch-time dry-run/apply for legacy access migration.
- The seven-day reminder links to localized `/dashboard#transition-offer`, in HTML and text.
  Reminder previews use fictional data only.
- Existing `plans/usability/canvas/project/Dashboard.dc.html` and `FitResults.dc.html` provide the card and
  paid-boundary design context. New offer/confirmation copy follows 02a; existing prices/layout remain.
- The native bike picker has a visible label and permanent explanatory text. It is exempted from measurement
  tooltip coverage rather than adding a redundant tooltip to a non-measurement field.

## Gates

| Gate | Result |
| --- | --- |
| Focused dashboard, transition UI and pricing tests | 79 passed |
| Email/template focused tests | 146 passed |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass, including tooltip, contrast, CSS token, brand and price checks |
| `npm run test:unit -- --maxWorkers=2 --testTimeout=15000` | 494 files passed, 1 skipped; 4,629 tests passed, 20 skipped |
| `npm run test:contracts` | 55 files, 622 tests passed |
| `npm run test:i18n` | 6 files, 30 tests passed |
| Standalone Convex TypeScript check | Pass |
| Production build via `scripts/usability/build.mjs` | Pass; build `lMGEkHKUYq-RxCF-grggx` |
| Reminder email previews | NL/EN HTML, text, 375px and 600px screenshots generated locally |
| Transition fixture capture | 24/24; no axe failures, overflow, mutation calls or changed-source findings |
| Touched-route usability guard | 24 cases, zero automated failures/errors |

Earlier broad unit attempts encountered worker startup/timeouts, including a very long unrelated test pause.
The final run used `caffeinate` and an eight-minute process-group timeout: it completed successfully in 129.53s.
No hanging command remains. Existing Vite config-loader/TypeScript source-map warnings and jsdom navigation
notices were non-failing. No unrelated source changes were made to suppress them.

Guard arguments: `--local --scope=U3 --filter=/dashboard,/fit/visual-session/results --automated-only`,
output `plans/feature-stripe-live-release/renders/02a-guard`.
This is a targeted automatic pass, not a whole-release manual approval: the generated report retains manual
requirements for wider U3 surfaces, including tyre-pressure/PDF surfaces outside this change.

## Visual evidence and review

- `renders/02a-{dashboard,paid-limit}-{available,upcoming,redeemed}-{nl,en}-{390,1440}.png`: all 24 combinations;
  exact files and assertions are in `audit/02a-visual.json`.
- `renders/02a-email-previews/transitionReminder-{nl,en}-{375,600}.png`, with matching HTML/text previews.
- `renders/02a-guard/report.json` and `report.md`, with full-page dashboard/results screenshots for NL/EN,
  390/1440 and default/paid/flag-off fixtures, including menu/detail states.

Manually inspected available dashboard cards in EN 390 and NL 1440, upcoming cards in NL 390/1440 and EN 1440,
redeemed dashboard EN 390, available paid boundaries in NL/EN 390 and EN 1440, upcoming paid boundary EN 390,
both 375px reminder emails, and the paid NL 390 full results page. Cards remain readable, price information remains
below the free option, dates are localized, and no popups, countdowns or urgency language were introduced.
Controls use 44px minimum targets; automatic axe/overflow checks cover the full fixture matrix.

## Scope limitations / release handoff

- The standalone redeemed paid-limit screenshot proves offer disappearance only; its surrounding price fixture
  is not the actual full-report post-redemption route. Access activation is asserted in backend tests, and the
  results component already subscribes to the access query. No live authenticated mutation was performed.
- Confirmation/error states use local callbacks in UI tests, not a deployed backend.
- Production transition dry-run/grants, announcement/reminder sends and live-account verification remain lead-run
  release operations. Follow the updated `plans/pricing-v3/audit/P1-transition-runbook.md`.
- No remaining T1 implementation blockers. Logs, screenshots and generated visual JSON are local review evidence,
  not files to commit. The original 02a task brief is lead-owned, not an implementation change.
