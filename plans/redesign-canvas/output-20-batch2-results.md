# Batch 20.2 — Fit results handoff

## Scope and references

Implemented against the approved complete snapshot:
- `plans/redesign-canvas/canvas/FitResults.dc.html`
- `plans/redesign-canvas/canvas/m/FitResults.dc.html`

No draft fallback. No commits. No backend, engine, shared report implementation, fit-pass/case-study implementation, shared UI, shell, global CSS, frozen dictionaries, other account dictionary, or visual harness edits.

## Exact files

Production:
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/AdjustmentSequence.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/BikeContextCard.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/DetailedFitTable.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/PriorityTable.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/ResultsPrimitives.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/RiderProfileCard.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/TirePressureSection.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/components/ValidationPlan.tsx`
- `src/components/account/FitResultsOverview.tsx`
- `src/components/account/FitResultsValue.tsx`
- `src/i18n/account/fitResults.ts`

Tests and proof:
- `src/app/(dashboard)/fit/[sessionId]/results/page.test.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/fixture.test-support.ts`
- `src/components/account/FitResultsOverview.test.tsx`
- This handoff file.

## Presentation and preservation

Lime introduction, real main/climbing profile selection, proportional schematic with actual selected saddle/reach/drop inputs, actual first three adjustment targets, paid current/target/difference comparison, and ink export action band. The drawing explicitly states that it is schematic, not an engine/geometry model. Missing current values never produce a fabricated current saddle or difference.

The board summary is followed by a native keyboard-accessible details disclosure retaining all existing report sections, metadata, confidence, ranges, warnings, adjustment sequence and validation plan. The free-access explanation remains visible outside that disclosure. Existing fit-pass and case opt-in components stay mounted under their original conditions.

Main/climbing switching now also updates the top diagram/summary (the old top metrics always read the main fit). No recommendation values, mapper algorithms, item confidence/ranges or source documents are changed. Number formatting uses NL/EN decimal conventions; only numeric fragments use monospace, not units/prose. Session identifiers and algorithm versions are not run through numeric formatting.

Original queries, generation mutation/status guards/retry, email action/payload/prefill/errors, PDF endpoint/filename/blob cleanup/errors, paid-access conditions (campaign/session/pro/premium), checkout acknowledgement/storage/URL cleanup, analytics and feedback signals are unchanged. Navigation remains locale-prefixed. New copy and replacement priority-summary labels are confined to the owned NL/EN module.

Local report cards use semantic colors, without the previous gradients/raw channel-valued CSS colors. Priority and validation tables become stacked rows on mobile rather than requiring 720px tables. Interactive controls use shared components with 44px+ sizing; navigation button wrappers explicitly preserve link semantics.

## Focused validation

`npx vitest run 'src/app/(dashboard)/fit/[sessionId]/results/page.test.tsx' src/components/account/FitResultsOverview.test.tsx src/lib/reports/reportV2Mapper.test.ts`

**24 passed in 3 files** (16 route interactions, 4 overview/number-format checks, 4 unchanged mapper regressions).

Coverage includes main/climbing source immutability, all existing paid access branches, free gating, generation once for both eligible statuses/retry, incomplete/loading/missing routes, email success/error and payload, PDF success/error/filename/cleanup, checkout cleanup, boundary props for case opt-in/fit-pass, missing measurements and localized numeric precision.

Scoped ESLint for the owned route directory, new components/tests and account dictionary passed. Scoped `git diff --check` passed. Vitest emits the pre-existing config-loader warning; no test failures. No whole-tree build/lint/typecheck run by this worker.

## Parent visual harness

No harness edits. Parent reported 28 initial results cases with zero overflow/errors/small controls; that report predates final detail styling and should be superseded by final rerun.

Representative final cases: paid filled; free with campaign explicitly disabled; paid without currentSetup; climbing with distinctly different target values; incomplete; generating/error; email dialog. Capture NL/EN at 1440/390. Include at least one **expanded details** capture on mobile to exercise responsive priority/validation tables and pressure content.

Selectors:
- Position image: `svg[role="img"]`, accessible name from `positionDescription`.
- Profile choice: `[role="group"] button[aria-pressed]`; activate the climbing label from existing results messages.
- Optional current saddle: `[data-current-saddle]` (absent when unknown or unpaid).
- Expanded report: `details > summary`; NL “Bekijk de onderbouwing en alle afstelwaarden”, EN “View the reasoning and all setup values”.
- Email/PDF: existing localized `messages.results.actions` accessible button names; dialog uses the existing accessible title/input label.

Fixture query requirements remain getReportV2, getCurrentUser and getSessionAccess. Supply actual mapper-shaped calculatedFit/ranges and optional climbingCalculatedFit, recommendationItems, currentSetup, pressure calculation and user tier. Campaign must be explicitly controlled to prove free gating. Standalone screenshots do not prove server authorization, real email delivery, real generated PDF content, checkout payment or consent persistence. Route unit tests mock case-study/fit-pass only at their boundaries; their shared implementations are untouched.

## Remaining UI requests

No blocking shared UI changes requested. Scoped dark action buttons use the shared hover-only modifier to avoid white-on-light hover colors; the selected profile/new-fit button colors are explicit. The shared EmptyState/LoadingState/Dialog remain reused and untouched; parent owns cross-cutting primitive auditing. Final screenshot inspection and whole-tree checks remain with parent.
