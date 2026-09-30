# 20.1 validation — Curie

2026-09-29. Working-tree checks while account and public workers integrate; no commits, browser actions or screenshots. Parent owns production shell and standalone typecheck; Archimedes owns screenshots.

## Current status — parent final confirmation

Earlier lint blockers are **resolved**, including the visual harness and public `SaddleHeightTeaser` tooltip registration. Parent's final `npm run lint` passes every stage and 218/218 contrast checks; proof `/tmp/20-parent-final-lint.log` (verified).

Parent reports final typecheck **passes after the profile layout-gap and exercise-background fixes**. This confirmation supersedes earlier typecheck failures; no separate parent typecheck log path was supplied.

Latest completed build remains Curie's successful `/tmp/20-final-build.log`. Parent's later attempt, `/tmp/20-parent-final-build.log`, stops with `Another next build process is already running` (verified): a concurrent build lock, not a compilation failure or a completed validation of later edits. No lock removed or worker process interrupted. Unit proof remains **185 files / 827 tests passed**, `/tmp/20-final-test-unit.log`.

The chronological failures below are retained as historical evidence and are not active lint/typecheck blockers. No new source edits, validation commands, screenshots or commits were performed for this documentation update.

## Initial sequential checks

| Command | Result | Log |
| --- | --- | --- |
| `npm run lint` | Exit 0; 218/218 contrast checks; one unused `generateMetadata` warning at `src/app/(public)/calculators/bike-fit/page.test.tsx:5:33` | `/tmp/20-lint.log` |
| `npm run test:unit` | Exit 1; 753 passed, 4 failed; 173 passing files, 3 failing files | `/tmp/20-test-unit.log` |
| `npm run test:i18n` | Exit 0; 30 tests in 6 files passed | `/tmp/20-test-i18n.log` |
| `npm run build` | Exit 0; compilation/build-internal TypeScript passed, 230 static pages generated | `/tmp/20-build.log` |

Initial failures were missing `useSearchParams` mocks in the sidebar/message integration tests and outdated public bike-fit control expectations (`radiogroup` named `Flexibility`, `spinbutton`). Codex C's concurrent public test update resolved the latter: targeted recheck `/tmp/20-integration-rerun.log` had 20 passed and only the two shell failures remaining.

## Authorized shell test fixes

- `tests/integration/dashboard-message-locale.integration.test.tsx`: mock `useSearchParams`, `useAuthActions`, router `push`, and account-footer dictionary fields. Existing Dutch message/locale assertions retained.
- `src/components/layout/DashboardSidebar.test.tsx`: mock `useSearchParams`; canonical saddle-selector route assertion retained.
- No production shell changes. Focused command `npx vitest run tests/integration/dashboard-message-locale.integration.test.tsx src/components/layout/DashboardSidebar.test.tsx` passes both tests; `/tmp/20-shell-mocks.log`.

## Full integrated unit rerun

`npm run test:unit`, `/tmp/20-test-unit-integrated.log`, started 21:23:39: exit 1. **179 files pass, 2 fail; 796 tests pass, 3 fail.** Profile worker's ready handoff and new login tests are present. No account/dashboard test failures reported.

Remaining failures are concurrent **public marketing scope**, outside dashboard ownership. Parent/lead must route to the public page owner; these are separate from Codex C's now-resolved bike-fit calculator test failures. Do not infer that C personally owns the pricing/home worker.

1. `src/app/(public)/page.test.tsx`: suite collection fails, `Failed to resolve import "./page" ... Does the file exist?`, Vite import analysis at test line 5. No tests collected for this file in this run.
2. `src/app/(public)/pricing/page.test.tsx:39`: `keeps paused Pro unavailable and the free signup and calculator usable` cannot find role `button` named `Tijdelijk niet beschikbaar`; rendered body contains an empty div.
3. `src/app/(public)/pricing/page.test.tsx:52`: `localizes the pause, headings, navigation and FAQ schema in English` cannot find role `heading`; rendered body contains an empty div.
4. `src/app/(public)/pricing/page.test.tsx:65`: `honors either billing kill switch and restores only the existing login route when enabled` cannot find role `button` named `Tijdelijk niet beschikbaar`; rendered body contains an empty div.

Pricing stderr also reports `<JsonLd> is an async Client Component` and a component suspended inside an unawaited `act` scope. This points to a server-component/test-harness integration issue; no out-of-scope fix attempted. Exact error stacks and rendered DOM are preserved in the log.

The earlier build and lint passes predate these latest concurrent public changes; they are not a final integrated green gate. Recheck public home/pricing tests after owner integration, then complete the final gate. Parent receives repository-channel notification; no direct tmux/C dispatch used.

## Parent-reported concurrent typecheck

Parent reports a later typecheck failure after its 21:21 pass: `src/app/(public)/calculators/power-speed/PerformanceCalculator.tsx` imports `MoreTool`, missing from shared UI/index, and `src/app/(public)/page.test.tsx` cannot resolve `./page`. Public calculator/shared UI belongs to Codex C; public home belongs to the lead's public-page worker. No changes made here. Parent retains standalone typecheck ownership and should retry after these files land.

## Latest public targeted recheck — 21:25:12

`npx vitest run 'src/app/(public)/page.test.tsx' 'src/app/(public)/pricing/page.test.tsx'`, log `/tmp/20-public-integration-rerun.log`: **4 pass / 2 fail**. Pricing's three failures are resolved by the concurrent JsonLd test mock; the public home file now resolves. Supersedes the public errors above, while preserving their historical evidence.

Two public home behavior assertions still fail:

- `home page > keeps the homepage value-first flow ahead of signup in English`: cannot find text `Donate via our Alpe d'HuZes page`.
- `home page > keeps the Dutch CTA framing aligned`: cannot find text `Doneer via onze Alpe d'HuZes-pagina`.

Lead/public home owner should reconcile the campaign content and existing assertions. No public test/source edits made by Curie. At this check, `PerformanceCalculator.tsx` still imports `type MoreTool`, while `src/components/ui/index.ts:83` exports only `MoreToolsNav` and `MoreToolsNavProps`; parent-reported typecheck issue remains for C/lead to resolve. No final build/typecheck rerun claimed after these concurrent changes.

## Final shell/feedback checks — supersedes earlier failures

Following the parent's `FeedbackPanelProvider` placement fix and `account-feedback-placement` tests, ran lint, typecheck and full unit sequentially:

| Command | Latest result | Log |
| --- | --- | --- |
| `npm run lint` | Exit 1: one harness error, two harness warnings; ESLint stops subsequent lint stages | `/tmp/20-final-lint.log` |
| `npm run typecheck` | Exit 0 | `/tmp/20-final-typecheck.log` |
| `npm run test:unit` | Exit 0; **185 files / 827 tests pass**; started 21:27:25 | `/tmp/20-final-test-unit.log` |

Full unit includes the new feedback-placement tests. The previously recorded public homepage/pricing/calculator and shell test failures are resolved in this run. Latest typecheck also supersedes the missing `MoreTool`/home-module failures. No public production or public test fixes were made by Curie.

Only remaining failure from this check belongs to **Archimedes's visual harness**:

- `tests/visual/account-batch1/runtime.jsx:72:69`: `react-hooks/rules-of-hooks` — React Hook `useQuery` is called in function `query`, which is neither a component nor a custom Hook.
- Warnings at `tests/visual/account-batch1/image.jsx:2:10`: `@next/next/no-img-element` and `jsx-a11y/alt-text`.

Parent notified in the repository message; route this to Archimedes. Harness/source untouched by validation. No build, browser or screenshot rerun in this final check; previous build/i18n results retain their earlier working-tree timestamp. Non-failing Vitest/Vite configuration and JSDOM navigation notices remain in the unit log.

## Final build and lint recheck

- `npm run build`: **exit 0**, `/tmp/20-final-build.log`; webpack production compilation (67s), build-internal TypeScript and static generation pass. This supersedes the early build proof and includes the latest shell/feedback changes present when the build ran.
- `npm run lint`: **exit 1**, `/tmp/20-final-lint-recheck.log`. Harness errors/warnings are resolved; ESLint and runtime-boundary checks pass. Tooltip guardrail now fails solely because `src/components/home/SaddleHeightTeaser.tsx` contains form controls but is absent from the guardrail lists. Contrast stage is not reached in this aggregate run.
- Public-home ownership: no fix attempted. Parent routed this in `messages/20260929-2132-codex-b-to-lead-info-account-validation.md`. Aggregate lint remains pending that owner's integration.
- Latest standalone typecheck and unit proof remain `/tmp/20-final-typecheck.log` (pass) and `/tmp/20-final-test-unit.log` (185 files / 827 tests pass). Parent reports Halley's final profile layout-gap polish/visual refresh is still underway; do not claim this build covers edits made after its compilation. No API changes reported for that polish. Screenshot review remains parent/Archimedes-owned.
