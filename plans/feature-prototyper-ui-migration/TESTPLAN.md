# Test Plan: Prototyper UI Migration

## Purpose

Verify that migrating the UI primitives in `src/components/ui/` to Prototyper UI does not break rendering, interaction, accessibility, or existing feature flows.

This test plan is based on the current repository state on 2026-03-17. It uses the repo's real scripts and current component APIs.

## Test Scope

Components and flows in scope:

- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/FieldLabel.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/AccessibleDialog.tsx`
- `src/components/ui/Tooltip.tsx`
- `src/components/ui/States.tsx`
- `src/components/questionnaire/ProgressBar.tsx`

Primary product areas affected:

- Auth pages
- Dashboard home
- Profile page
- Bikes list and bike form
- Fit flow
- Questionnaire flow
- Results page
- Public calculators
- Header and cookie consent actions

## Exit Criteria

- `npm run typecheck` passes
- `npm run lint` passes
- Existing unit tests pass
- Tooltip tests still pass or are updated to cover the new implementation
- No broken imports remain in `src/components/ui/index.ts`
- Core UI flows below work in the browser without regressions

## Test Levels

### 1. Static Validation

Run after each migration step:

```bash
npm run typecheck
```

Run before final sign-off:

```bash
npm run lint
npm test
```

Checks:

- New component source compiles with React 19 and Next 16
- Barrel exports still match consumer imports
- Old prop adapters preserve current call sites where intended
- No stale file names remain after dialog or label renames

### 2. Component Contract Checks

These should be validated with focused tests or manual spot checks while migrating each primitive.

#### Button

Verify:

- `variant="primary" | "secondary" | "outline" | "ghost" | "destructive"` still renders
- `size="sm" | "md" | "lg"` still renders
- `isLoading` disables the button and shows loading affordance
- Native button props like `type`, `disabled`, `onClick` still work

Key usages:

- `src/app/(auth)/login/page.tsx`
- `src/components/bikes/BikeForm.tsx`
- `src/components/questionnaire/QuestionnaireContainer.tsx`

#### Input and FieldLabel

Verify:

- `label`, `tooltip`, `tooltipLabel`, `error`, `helperText` still render correctly
- Input generates stable `id` when not provided
- `aria-describedby` includes helper, error, and tooltip ids as applicable
- Error styling and helper text styling remain distinct

Key usages:

- `src/components/measurements/StepBodyMeasurements.tsx`
- `src/components/measurements/StepAdvancedMeasurements.tsx`
- `src/components/bikes/BikeForm.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/components/questionnaire/questions/NumericQuestion.tsx`
- `src/components/questionnaire/questions/TextQuestion.tsx`

#### Select

Verify:

- Current `options: { value, label, disabled? }[]` API still works if a wrapper is used
- `placeholder`, `label`, `tooltip`, `error`, `helperText` still behave correctly
- Controlled value updates propagate correctly
- Keyboard navigation works if migrated to a custom popup select

Key usage:

- `src/components/bikes/BikeForm.tsx`

#### Card

Verify:

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` still export
- Variants `default`, `bordered`, `elevated` still produce expected visual distinction
- Existing layout spacing is preserved closely enough to avoid broken pages

Key usages:

- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/fit/page.tsx`
- `src/components/results/`

#### AccessibleDialog

Verify:

- Existing controlled API `open`, `title`, `description`, `onClose`, `children` is preserved or all consumers are updated safely
- Overlay click closes the dialog
- `Escape` closes the dialog
- Focus moves into the dialog on open
- Focus returns to the triggering control on close

Key usages:

- `src/app/(dashboard)/profile/page.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`

#### Tooltip

Verify:

- Tooltip appears on focus and hover
- Escape closes it if keyboard-triggered
- Accessible name/description wiring remains valid
- Existing test coverage is updated if the internal behavior changes

Key usages:

- `src/components/ui/FieldLabel.tsx`
- `src/components/ui/Tooltip.test.tsx`

#### States

Verify:

- `LoadingState`, `EmptyState`, `ErrorState` exports stay stable
- `ErrorState` still uses `role="alert"`
- Action slot still renders
- Visual semantics remain clear for loading, empty, and error conditions

Key usages:

- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/fit/page.tsx`
- `src/app/(dashboard)/bikes/page.tsx`
- `src/components/questionnaire/QuestionnaireContainer.tsx`

#### Questionnaire ProgressBar

Verify:

- Preserve the real current API: `current`, `total`, `estimatedMinutes?`, `className?`
- Percentage display remains correct
- Localized copy still renders
- Progress indicator width/value matches the computed percentage

Key usage:

- `src/components/questionnaire/QuestionnaireContainer.tsx`

### 3. Accessibility Checks

Manual checks in browser:

- Tab through login form, bike form, questionnaire, profile delete dialog, and results email dialog
- Confirm visible focus ring on buttons, fields, select trigger, dialog actions, and tooltip trigger
- Confirm form fields announce labels and errors correctly in browser accessibility tree
- Confirm dialogs expose title and optional description
- Confirm tooltip content is not only hover-accessible
- Confirm no keyboard trap outside intended dialog focus trap

### 4. Visual Regression Checks

Manual light-theme checks:

- Login page form spacing and submit button
- Dashboard cards and empty states
- Bike form inputs and select
- Questionnaire progress bar, numeric/text questions, navigation buttons
- Results page dialogs, cards, and CTA buttons
- Public calculators using `FieldLabel`

If dark mode is introduced as part of the migration, also verify:

- Background, foreground, border, and muted tokens all switch coherently
- Contrast remains acceptable on buttons, inputs, cards, dialogs, and error states

### 5. End-to-End Flow Checks

Run these manually in `npm run dev`:

1. Login flow
- Open auth page
- Enter email
- Submit
- Confirm loading state and no layout breakage

2. Bike create/edit flow
- Open bikes page
- Open create or edit form
- Exercise text inputs and the bike type select
- Submit and confirm validation/loading affordances still behave correctly

3. Questionnaire flow
- Open an in-progress questionnaire
- Confirm progress bar updates as steps change
- Validate numeric/text input rendering
- Use previous/next/submit buttons

4. Results page
- Open session results
- Open email/share dialog
- Confirm dialog focus management and actions
- Confirm error and empty states still render where applicable

5. Profile delete dialog
- Open profile page
- Trigger delete confirmation dialog
- Confirm cancel/close paths work with keyboard and mouse

## Risks Requiring Extra Attention

- `typecheck` script name mismatch in the current plan may cause false failures if not corrected
- `ProgressBar` API in the current plan does not match the real component
- `Input` and `Select` currently bundle label, tooltip, helper, and error behavior; replacing them with raw primitives risks broad consumer churn
- `AccessibleDialog` currently uses a controlled API; replacing it with a compositional dialog API is a high-regression area
- `Tooltip.test.tsx` will likely need updates if the DOM structure changes materially
- The repo currently shows no dark-mode infrastructure in `src/`; dark-mode verification should be conditional unless the migration also adds theme toggling

## Recommended Execution Order

1. Setup theme and dependencies
2. Add component source in a non-destructive way
3. Migrate Button
4. Migrate Input and FieldLabel
5. Migrate Select
6. Migrate Card
7. Migrate Tooltip
8. Migrate Dialog
9. Migrate States and questionnaire ProgressBar
10. Run full validation and manual flow checks
