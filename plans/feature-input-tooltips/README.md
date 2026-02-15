# Input Tooltip Coverage Plan

## Goal

Add clear, consistent tooltips for every user-facing input field across the app so users understand what each field means, expected units, and common mistakes.

## Background

Current forms rely on labels/placeholders only. Input guidance is uneven across flows (auth, dashboard forms, questionnaire, public contact/calculators), which increases user error and slows completion.

## Scope

In scope:

- Tooltip coverage for all `input`, `select`, and `textarea` fields in `src/app` and `src/components`.
- Shared tooltip UI pattern compatible with existing Tailwind + UI components.
- Accessibility behavior for mouse, keyboard, and touch.
- Validation pass to ensure no missing tooltip fields remain in maintained forms.

Out of scope:

- Rewriting full form IA or changing business logic.
- Translating tooltip content to new locales beyond currently supported copy.
- Backend/schema changes unrelated to tooltip display.

## Approach

1. Build a complete field inventory and tooltip content matrix.
2. Implement a reusable tooltip primitive and integrate it with shared form controls.
3. Roll out to authenticated/dashboard flows.
4. Roll out to public forms and calculators.
5. Add verification checks and documentation so future inputs keep tooltip coverage.

## Dependencies

- Shared controls: `src/components/ui/Input.tsx`, `src/components/ui/Select.tsx`
- Form-heavy feature areas in `src/components/measurements/`, `src/components/bikes/`, `src/components/questionnaire/`
- Public form pages under `src/app/(public)/`

## Acceptance Criteria

- Every input/select/textarea field has an associated tooltip.
- Tooltips explain purpose + expected unit/format where relevant.
- Tooltips are accessible by hover and keyboard focus; mobile tap behavior is usable.
- No regressions in `npm run lint`, `npm run typecheck`, and `npm run test`.
- A durable inventory/checklist is added for future form fields.

## Status

- Owner: `@codex`
- Target completion: `2026-02-22`
- Last updated: `2026-02-15`
- State: `COMPLETE`

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-tooltip-inventory-and-content-matrix.md` | P0 | Done |
| 02 | `02-tooltip-primitives-and-api.md` | P0 | Done |
| 03 | `03-rollout-dashboard-auth-forms.md` | P1 | Done |
| 04 | `04-rollout-public-forms-and-calculators.md` | P1 | Done |
| 05 | `05-validation-tests-and-guardrails.md` | P1 | Done |

## Outputs

- `output-01-tooltip-inventory.md`
- `output-02-tooltip-primitives.md`
- `output-03-dashboard-auth-rollout.md`
- `output-04-public-rollout.md`
- `output-05-validation-and-guardrails.md`
