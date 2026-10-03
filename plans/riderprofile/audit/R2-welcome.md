# R2 welcome — implementation and integration handoff

Implemented only the welcome route, its dictionary, tests and this task's audit artifacts. No commits, deployment, dependencies or production data.

## Behavior

- Auth-gated `/welcome`, localized login redirect with `handoff=1`, noindex metadata.
- C's `readHandoff()` / `clearHandoff()` and exact selected `HandoffEntry` records. Existing calculator, method, unit and timestamp survive unless the value is explicitly adjusted. No measurement values in URLs, analytics, errors or logs.
- Shared input/select/button/slider controls; keep, adjust and omit for rider and bike values. Numeric bounds reuse shared profile/bike ranges. Enum choices match actual public calculator values, including FTP `known/twentyMinute/ramp`, sweat `low/medium/high` and pressure surfaces.
- Bike creation defaults off; requires the user's own name (maximum 100 characters) and genuine bike type. Saddle-height import additionally requires explicit bottom-bracket-centre-to-saddle-top selection. Turning bike import off excludes its records.
- Existing-profile conflicts appear before save. Profile/today/remeasure each send `expectedCurrentValue`. Fresh server conflicts invalidate prior choices and retain all session data. Re-measure preserves the existing profile and explains the next step.
- Clear the session key only following `status: imported` or explicit cancellation. Errors/conflicts keep the review state and stored handoff; duplicate submission is guarded.
- First flexibility question does not contribute its default or a moved slider value until Keep is clicked. Changing the slider requires another Keep. Existing flexibility suppresses the question.
- A's real `scoreRiderProfile({profile, observations}, now)` and `ProfileStrengthRings` show the rider completeness/reliability pair. Preview uses normalized flexibility/goal fields, accepted provenance and current profile values; unresolved or rejected incoming values do not replace the profile in scoring.
- A's `scoreBike` and a separately titled ring pair appear when bike import is enabled. The preview mirrors the properties B currently persists (`bikeType`, saddle height and crank length); remaining bike handoff entries are observations only and never invent filled bike properties. Saddle height joins the score after explicit measure-point confirmation. Rider and bike reliability remain distinct. Supporting copy stays inside the dark score wrapper.
- RP3 typography, token surfaces, four-column desktop review rows, 440px aside and stacked mobile layout. The final confirm/cancel actions follow the optional question on mobile. No board review strip or hardcoded rider/bike example names.

## Verification

- Focused UI tests: **16 passed**. They use fake auth/backend and real C store, score, rings and shared controls. Cases cover auth gate, exact raw records, delayed success, retry, all three conflict choices, concurrent conflicts, cancel, numeric/enum edits, omission, corrupt storage, flexibility confirmation and explicit saddle measure point. Enum selection uses the real pointer-down/click sequence required by Base UI; browser verification also confirms the changed enum reaches the submitted records.
- Focused ESLint passes. CSS module token check: zero raw colors.
- Tooltip guard requires lead-owned registration; see `messages/R2-welcome-to-lead-tooltip.md`. No guard bypass or alias was introduced. The guard currently also flags C's crank-length/saddle-width forms.
- Full `npm run typecheck` was rerun after score integration; the last run has no welcome errors. It is blocked by concurrent C calculator work: missing `PersonalizeAdviceBlock`/`HandoffPrefillNotice`, `ConfiguratorLayout` notice prop, callback value types and saddle-height hook imports. Do not modify those from this task.
- Full `npm run lint` was attempted; it stops on concurrent C calculator effect-state/immutability errors (bike-fit, crank-length, frame-size, saddle-height, saddle-width). Welcome passes focused lint.
- Offline browser fixture uses esbuild, actual globals compiled with installed Tailwind/PostCSS, actual CSS modules, local brand fonts, and fake auth/backend. No external requests or live data.
- `node plans/riderprofile/audit/R2-welcome-capture.mjs`: 12 screenshots, NL/EN × 1440/390 × new/conflict/empty. The harness checks two rider meters plus two bike meters when enabled, horizontal overflow and browser runtime errors. Results and PNGs: `plans/riderprofile/renders/R2-welcome-*`. Desktop NL and mobile EN reviewed visually; adjusted dense row width, enum typography and mobile action order after review.
- Final capture: **12/12 pass**, zero overflow, zero browser runtime errors, all meter counts correct. Real browser enum change → save succeeds in all four new-account locale/viewport combinations. Final NL desktop and EN mobile images inspected; “Gebalanceerd” stays on one line, bike score is 15%/9% versus rider 33%/27% for the fixture, and explanatory copy is inside the dark wrapper.

## Parent integration

RP3 aside presentation remains pending A's optional compact summary, requested in `messages/B-to-A-RP3-aside.md`. The current implementation and captured evidence show two stacked completeness/reliability pairs (four rings with bike import enabled), rather than the board's side-by-side rider/bike completeness rings with reliability captions. Both scores are real; this is a presentation difference. A's component is untouched. Parent will integrate the compact API if it lands, then adjust the fixture's meter-count expectation and recapture the 12 states. Existing capture results document the current four-ring implementation, not final board parity.

Typed `makeFunctionReference` points to `profiles/mutations:importHandoff` and `profiles/queries:getHandoffContext` while generated typing is shared/in flight. Query/mutation signatures match B's current implementation. A's component and pure scorer are consumed directly; their owned files are untouched. Parent retains backend/E2E and full application runtime integration, including welcome routing/auth middleware and global checks once concurrent C work lands.

Files, including the offline render harness and all 13 generated render/result artifacts, are listed in `files-R2-welcome.txt`. Parent-owned `src/app/welcome/handoff-flow.test.tsx` was not changed.
