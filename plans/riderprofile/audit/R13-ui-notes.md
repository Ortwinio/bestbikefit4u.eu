# R13 UI — optional rider demographics

## Scope complete
- Optional sex and birthDate rows in existing ProfileProvenance body group, using parent's registry and existing saveObservation API. Sex choices female/male/prefer_not_to_say are localized. Values save as declared/self_report; no inferred defaults or extra age update.
- Date control uses type=date, submits canonical YYYY-MM-DD, hides registry unit “date”. Display and conflict values are localized with UTC timezone, avoiding previous-day shifts.
- Both forms validate through shared validateProfileObservationValue and parent's validateBirthDate: genuine calendar date, not future, current supported age 10–100. Empty input cannot submit. Existing age does not infer birthDate.
- Every demographic row/prompt includes a visible why and optional/unscored explanation, including active conflicts. No tooltip-only rationale.
- Demographic prompts suppress gain badges/effects, including +0 and generic personal-advice fallbacks. Success truthfully records optional data without promising recalculated outcomes; abstention explicitly means no sex inference/sex-required estimate.
- Existing expected-current-value conflict handling, cancellation, skip/dismiss and retry remain. No delete/clear API invented.
- No estimated flexibility/FTP values displayed or created; A's sourced estimator remains separately owned. No changes to scoring weights, A files, backend/policy, R11 or frozen dictionaries.
- Existing row set, autosave, wizard and weight recalculation route tests remain green.

## Checks
- Four focused UI/route suites: **89 tests pass**, /tmp/R13-ui-tests.log.
- Initial 13 failures were test-only ambiguous label lookups (tooltip and input shared accessible label). Corrected using getByLabelText with selector input; accessible tooltip labels were deliberately retained.
- Full typecheck passes, /tmp/R13-ui-types.log.
- Scoped ESLint passes for all seven owned source/test files and R13 harness.
- Tooltip guard passes all 54 form files; CSS tokens pass 26 files, zero raw color lines. No R13 CSS changes needed.

## Responsive proof
- Separate harness audit/R13-ui-capture.mjs; R7 harness unchanged.
- **20 actual PNGs**: NL/EN × 1440/390 × dashboard-open, dashboard-answered, dashboard-declined, profile-edit, profile-filled.
- Fake authenticated/backend fixtures only, real current dashboard/profile shell and CSS/fonts, all external requests blocked. Current A hero/sidebar mount appears naturally in the real route; no edits to those components.
- All 20 captures: zero page errors, zero document overflow. Open DOB is verified blank; filled DOB and decline are verified localized; dashboard prompt cards reject +0 text.
- Visually reviewed NL1440 dashboard open and EN390 profile edit; visible rationale, native date field and preserved responsive layout.
- Results: renders/R13-ui-results.json; exact files: audit/files-R13-ui.txt.
- No measurement/demographic values in URLs, analytics or console logs. Harness URL only contains synthetic view-state names.

R13 UI owned scope DONE. Parent owns combined backend/policy completion and A estimator integration. No commit/deploy/dependencies or production data.

