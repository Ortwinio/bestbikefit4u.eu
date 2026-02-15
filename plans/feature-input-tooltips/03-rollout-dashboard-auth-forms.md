# Step 03: Rollout To Dashboard And Auth Forms

## Objective

Apply tooltip coverage to authenticated and dashboard form flows using shared tooltip-enabled controls.

## Inputs

- `plans/feature-input-tooltips/output-01-tooltip-inventory.md`
- `plans/feature-input-tooltips/output-02-tooltip-primitives.md`
- `src/app/(auth)/login/page.tsx`
- `src/components/measurements/*.tsx`
- `src/components/bikes/BikeForm.tsx`
- `src/components/questionnaire/questions/NumericQuestion.tsx`
- `src/components/questionnaire/questions/TextQuestion.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`

## Tasks

1. Add tooltips to all auth fields (login flow).
2. Add tooltips to measurement wizard fields (required + advanced).
3. Add tooltips to bikes create/edit fields (geometry + setup).
4. Add tooltips to questionnaire typed-input fields (numeric/text responses).
5. Add tooltip to results email input in report modal.
6. Verify no field in these areas remains without tooltip coverage.
7. Record changed files and final coverage in `plans/feature-input-tooltips/output-03-dashboard-auth-rollout.md`.
8. Update plan status in `plans/feature-input-tooltips/README.md`.

## Deliverable

- Tooltip coverage completed for auth and dashboard forms.

## Completion Checklist

- [x] No uncovered input/select/textarea remains in listed auth/dashboard files.
- [x] Tooltip copy matches approved matrix.
- [x] UI remains readable on desktop and mobile.
- [x] Output file and status updates are committed.
