# 43d — Calculator navigation and bike-fit session inputs

## Implementation

Lead confirmed 41a and 43a; 41b is complete. Lead explicitly approved storing
calculator inputs on the new fit session, without changing Mijn profiel or older fits.
This supersedes the earlier dependency-only audit in this file.

- One localized 11-tool registry drives desktop sidebar, mobile menu and dashboard
  quick links. Existing account tools retain their routes; /fit stays a separate
  session flow. Longest-path matching, keyboard menu behavior and 44px targets remain.
- /tools/bike-fit reuses the public form with C's shared state/autosave primitives.
  Saved values win over valid profile fields, which win over public defaults.
  Query refreshes do not replace an open editor. Profile measurements lack stored
  provenance, so they are labeled estimated with an explicit instruction to check them.
- The CTA awaits pending saves and persists untouched profile-derived inputs before
  entering /fit?calculator=bike-fit. Failure keeps the editor open for retry.
  Values do not go in the URL; the fit page queries the authenticated user's state.
  Missing state or an incompatible bike blocks session creation rather than silently
  falling back to profile values. Bike selection and the questionnaire remain.
- Optional fitSessions.calculatorInputs stores an ownership-checked, validated
  copy of the latest calculator row when the new session is created. Generation and
  report queries use these height/inseam/flexibility/core values; category and effective
  ambition also follow the calculator. Other profile fields retain existing behavior.
  Ordinary sessions, archived fits, public defaults, engines and profile documents are unchanged.
- Dark-mode quick-link hover uses paired accent background/foreground tokens.
  Account result bars sit above mobile tabs. New copy lives in B's account dictionaries.

## Ownership and release coordination

- Navigation and backend work were split between subagents; B owns integration and final checks.
- C's infrastructure is a prerequisite. Shared files in the manifest contain B's
  additive bike-fit extension; preserve C/D changes when staging, especially schema,
  calculator validators/defaults and fixture files. No generated API change by B.
- D confirmed /tools/power-speed, /tools/climb-planner, /tools/ftp-wkg and
  /tools/fuel-hydration in messages/20261001-d-to-b-c-info-queued-contracts.md.
  All four routes landed during final verification and appear in the passing
  production build. The 11-link menu must still ship with C/D's calculator work,
  not as a standalone frontend release. D owns validation of those four calculators.
- Lead must deploy the additive Convex schema/mutations before the frontend.
  No database writes, commit, push or deployment were performed.

## Validation

- Final integration: 157 tests pass across 14 navigation, layout, dashboard, fit,
  calculator and backend-contract suites (including D's newly landed tests).
  Another 35 existing session/recommendation tests and two route-inventory tests pass.
- Full lint passes. Typecheck passed before D's final test landed. The last whole-tree
  run reports only D-owned AccountPerformanceCalculator.test.tsx:64, unsupported
  `exact` option in getByRole. Reported to D in messages/20261001-b-to-d-info-43b-typecheck.md;
  not changed by B. Do not describe the current whole tree as typecheck-green.
- Isolated production build passes. Sixteen public/account, handoff and dashboard
  captures (NL 1440/390, light/dark) plus mobile-menu captures are in
  code-renders/43d-bike-fit. All eight calculator comparisons pass every applicable
  check. The other eight cases retain only the fixture bike-name language flag.
  All serious/critical axe, layout and mobile-target checks pass after the hover fix.
  Four scenarios also verify autosave, fresh-mount restoration, handoff values,
  bike selection and successful continuation into the questionnaire. Both mobile
  menus and all dashboard variants expose 11 links; result bars clear mobile tabs.
  Raw proof: audit/43d-browser.json, final source hash 0bfddebc45555f45… and build ID.
  Final handoff measurements use Dutch decimal commas and unchanged English dots;
  both locale assertions pass.
- Filtered sweep command: node tests/visual/final-sweep/sweep.mjs
  --filter=/dashboard,/tools/bike-fit,/fit --port=4354
  --output=plans/redesign-canvas/final-sweep/43d. The substring filter also includes
  fit-history, fit-pass, results, questionnaire and how-it-works (32 NL/EN cases).
  Final sweep: 24/32 fully green; eight NL cases flag only Endurance racefiets.
  Status, runtime errors, overflow, headings, locale, images, serious/critical axe
  and applicable touch-target/SEO checks all pass. Results are retained unchanged in
  final-sweep/43d/report.md and report.json. The later decimal-only handoff correction
  is separately tested and captured; the ordinary /fit sweep state has no handoff values.
- Browser persistence uses a fresh authenticated fixture mount and local mocked storage;
  it is not a production-login or production-Convex integration test. Backend ownership,
  invalid/missing/foreign state and immutable session-copy behavior have contract tests.

## Known audit distinctions

The strict NL detector flags the fixture user's bike name Endurance racefiets on
dashboard and fit screens. This is stored user content, not untranslated product copy;
raw findings are retained, not suppressed or renamed to manufacture a green audit.
A previously reported moderate mobile-shell landmark finding is outside this task's
navigation changes. Serious/critical findings and other failures remain actionable.

Exact B manifest: audit/files-43d.txt. Backend detail: audit/43d-backend-snapshot.md.
