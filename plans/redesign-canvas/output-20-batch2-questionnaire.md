# Task 20.2 — Questionnaire worker handoff

Implemented the questionnaire-owned slice only. No commits, shared-shell edits, frozen-dictionary edits, backend edits, broad validation or visual-harness edits.

## Source and presentation

Source is the current approved `plans/redesign-canvas/canvas/FitQuestionnaire.dc.html`, read with the README ownership section and BOARD-RULES account rules. Existing account shell reused. Added the approved heading/back link, split intro with lime steps panel, white question card, two-column option cards, question progress and petrol-soft session-topic sidebar. At narrow widths these stack. Removed the old decorative question images and testimonial carousel in favor of the approved presentation. No prototype sample data, review strip or hardcoded question bank enters the live UI.

## Exact file list for this worker

- `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx`
- `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.test.tsx`
- `src/components/questionnaire/QuestionnaireContainer.tsx`
- `src/components/questionnaire/QuestionnaireContainer.test.tsx`
- `src/components/questionnaire/QuestionnaireIntro.tsx`
- `src/components/questionnaire/QuestionRenderer.tsx`
- `src/components/questionnaire/questions/PositionFeelingSelector.tsx`
- `src/components/questionnaire/questions/SingleChoiceTooltipQuestion.tsx`
- `src/components/account/FitQuestionnaireHeader.tsx`
- `src/components/account/FitQuestionnaireGuide.tsx`
- `src/components/account/FitQuestionnaireProgress.tsx`
- `src/i18n/account/fitQuestionnaire.ts`
- `plans/redesign-canvas/output-20-batch2-questionnaire.md`

## Preserved behavior

Queries and mutation references/arguments, authz, session status handling, analytics, results route, backend question order, conditional visibility, stored response values, optional skipping, required checks, save/complete handlers and missing-answer navigation are preserved. Existing `localization.ts` and legacy question strings continue reading frozen dictionaries; all new/rewritten copy belongs to `fitQuestionnaire.ts` in NL/EN. Displayed step/progress numbers use Intl and mono styling.

Position choices preserve mutually exclusive `good`/`no_bike` plus multi-select discomfort keys. Single-choice cards use existing shared OptionCard radio mode with Base UI keyboard behavior. Option cards are at least 88px high; action/link targets are at least 44px. Existing answer explanation text remains below selected cards.

A focused test exposed an existing transient render crash when navigating from a string-valued question back to position checkboxes before the response synchronization effect runs. `QuestionRenderer` now guards array-shaped presentation props with `Array.isArray`; no response state or payload is rewritten.

`QuestionnaireProgressBar.tsx` is also consumed by the pressure wizard and remains identical to HEAD. The new progress presentation is isolated in `account/FitQuestionnaireProgress.tsx`.

## Focused validation

12 tests pass:

`npx vitest run src/components/questionnaire/QuestionnaireContainer.test.tsx 'src/app/(dashboard)/fit/[sessionId]/questionnaire/page.test.tsx'`

Coverage: NL/EN intro/links; no review fixtures; backend order; exclusive/multi-select storage and back navigation; climbing yes/no visibility; skipping without saving; save failure/retry; required validation/server missing-answer focus; loading/empty/missing session; query/mutation arguments; completion success/error analytics and localized results routing.

Scoped ESLint passes for the owned TS/TSX files. Whole-tree typecheck/build/integration/visual QA remain with the parent.

## Parent visual harness cases and selectors

Render actual `/nl/fit/<sessionId>/questionnaire` and `/en/fit/<sessionId>/questionnaire` at 1440/390. Use the existing fixture session with real enum `in_progress`; the worker does not add any runtime fixture support.

1. Loading: one of the three query results undefined. Missing: session null with questions/responses resolved. Empty: session exists and questions is `[]`.
2. Intro: responses `[]`. Start button accessible names `Start je bikefit` / `Start your bike fit`; intro method link points to localized `/fit/how-it-works`.
3. Saved position: nonempty response list with `current_position_feeling: ["too_stretched"]`. Position answers are `getByRole('button', {name: localizedOptionLabel})`, selection via `aria-pressed`. Test `good`, `no_bike`, multiple discomfort choices and selected explanations.
4. Road/terrain: click the localized Next/Skip actions from `messages.questionnaire.actions`. Single choices now use `getByRole('radio', {name: localizedOptionLabel})`, selection via `aria-checked`. Do not target these as buttons.
5. Climbing yes: select `yes` at `#question-heading-wants_climbing_profile`, then invoke the existing Complete action; the handler correctly opens `#question-heading-climbing_importance` instead of navigating. The query fixture must publish the saved answer so the existing conditional filter sees it. The sidebar changes from four to five topics. `no` completes without the follow-up.
6. Save error: reject `saveResponse`; the current selection and heading remain, with the existing error title. Retry resolves normally. Complete error: reject completion and confirm no results navigation. Pending: defer the promise to show disabled/loading navigation controls.
7. Back navigation after selecting a road answer: return to position; saved checkbox answers must remain intact and the page must not crash.

Stable headings: `#question-heading-current_position_feeling`, `#question-heading-road_riding_type`, `#question-heading-mtb_terrain`, `#question-heading-wants_climbing_profile`, `#question-heading-climbing_importance`. Progress is `role=progressbar`; current sidebar topic is `[aria-current="step"]`. Profile and back links are localized `/profile` and `/fit`.

No remaining shared UI change requests. Parent owns final 1440/390 screenshots, full validation and audit/20-notes.md.

DONE 20.2 — questionnaire-owned slice only.

## Visible selector target follow-up

Changed `src/components/questionnaire/questions/ExperienceLevelSelector.tsx`, `src/components/questionnaire/questions/WeeklyHoursSelector.tsx`, and `src/components/questionnaire/questions/RideDistanceSelector.tsx`: each native radio button now has a fixed nonshrinking 44px target and existing localized option label as its accessible name. Original 16/32px dots remain decorative inner spans; selected state, keys and callbacks are unchanged. Audited both pain selectors: their named controls are already full cards; small icons are not separate targets, so no edits needed.

Added `src/components/questionnaire/questions/SelectorAccessibility.test.tsx` covering all three dot selectors and pain selectors in NL/EN. The focused selector/container/route run passes 20 tests. No shared UI changes or broad validation. Parent should refresh captures and confirm computed dimensions at 390/1440.

Harness correction for parent: `tests/visual/account-batch2/runtime.jsx` currently returns raw `QUESTIONNAIRE_QUESTIONS`, while the actual backend returns filtered/sorted `getAllQuestions()`. Use the latter and saved `current_position_feeling` answers for production-representative filled captures; legacy experience/hours/distance can remain separate compatibility cases. Harness untouched by worker.
