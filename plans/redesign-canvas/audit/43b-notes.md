# 43b — Performance calculators in account mode

Status: complete, 2026-10-01. No commit, push, deploy or database writes.

## Implementation

- `/tools/power-speed`, `/tools/climb-planner`, `/tools/ftp-wkg`, `/tools/fuel-hydration` mount the same
  `PerformanceCalculator` as the public routes inside the existing account shell. Public defaults,
  metadata, formulas, source citations and result rendering remain unchanged.
- The public form accepts initial values and a hydration-safe values-change callback. Account navigation
  stays under `/tools`; the climb gearing CTA goes to `/gearing`. Public links remain public.
- C’s `useCalculatorAccountState` and shared autosave primitives are reused unchanged. The editor key
  contains authenticated rider and calculator; these four scenario calculators are rider-scoped.
  Bike type/mass describe the scenario and do not mutate a garage bike. Backend support for optional
  bike scopes remains available and ownership-checked; no new picker or bike-record write is introduced.
- Saved values take precedence. Otherwise valid profile weight and FTP seed power/speed, climb and FTP
  inputs; missing/out-of-domain profile values use public defaults. Fuel has no weight/FTP input, so it
  uses saved state or public defaults without a misleading profile hint. No profile or fit snapshot writes.
- FTP starts with both comparison tables. Rider sex/gender is neither read nor inferred for comparison.
  Explicitly chosen table, FTP method, mode, bike/surface and fuel options are restored along with sliders.
- Discriminated Convex validators extend C’s registry with exact option unions and every performance
  input. Runtime validation uses `TOOL_RANGES`; no `v.any()` or unchecked numerical payload.
  Existing B bike-fit and C fit-tool cases are preserved. Existing upsert/query/auth code is unchanged.
- Account status/prefill copy reuses owner dictionaries. Titles are localized and account metadata is noindex.
  The mobile result bar uses C’s safe-area-aware offset above account navigation.

## Verification

- 50 focused domain/backend/public tests pass, plus 17 account integration tests (including B/C regressions).
  Four new-tool backend cases cover update instead of insert, logout rejection/login restoration,
  rider separation, foreign-bike rejection and invalid values. Inserts/patches target only calculator state.
- Each tool has saved > profile > default tests, all real input ranges and non-finite rejection.
  Account form tests cover no hydration write, actual edits, restoration, profile isolation, Dutch failure/retry,
  and loading before authenticated queries resolve. Existing public source/result/page tests pass.
- Sweep route registry tests pass (2). Full lint and typecheck pass; the production snapshot build passes.
  A test-only unsupported `exact` option was corrected before the successful build.
- `audit/43b-browser.json`: 32 comparisons (four tools × public/account × 1440/390 × light/dark).
  All applicable technical checks pass. Each account case changes a slider and restores the saved value
  in a fresh authenticated fixture page. Mobile result bars stay above account navigation.
  Visually inspected the mobile account power/speed page alongside its public counterpart.
- `final-sweep/43b/report.md` / `.json`: eight routes, 32 NL/EN × 1440/390 cases.
  All technical gates pass: 32/32 axe, overflow, runtime error, status, H1, locale and images;
  all 16 applicable mobile target checks and public metadata checks pass.
- Raw language flags are retained: 16 comparison cases and eight route-sweep cases contain English
  bibliographic titles on FTP and fuel pages. They are the approved Allen/Coggan, Jeukendrup and Sawka
  sources, identical on public and account pages (`src/i18n/calculators/performance.ts`). Lead explicitly
  allowed English source citations in task 40. No app-copy defect or error suppression remains.
- Browser persistence uses deterministic local fixtures, not production accounts. Backend tests cover
  authentication and storage; no real user data was created or altered. The QA server on :4355 is stopped.


## Release

Deploy Convex before frontend: new calculator discriminator values are added to the existing additive
calculatorStates schema and validators. No new table beyond C’s approved table, no migration performed.

Final sweep fingerprint: `f9f8bc368e80a08b91225be09ae964d69800ed5b94769132392a83cb8c4c251f`.

DONE 43b.
