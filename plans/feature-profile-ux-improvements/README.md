# Profile UX Improvements

## Goal

Make the profile page richer, more visual, and more actionable. Users should be able to quickly update their weight, understand their flexibility and core stability through engaging visuals, adjust those scores without re-doing the full wizard, and get concrete advice on how to improve each area.

## Background

### Current state

The profile summary page (`src/app/(dashboard)/profile/page.tsx`) shows three cards:
- **Body Measurements** — a plain `<dl>` list of numbers (height, inseam, optional extras)
- **Flexibility** — the score as plain capitalised text (e.g. "Good"), no context
- **Core Stability** — the score as "3/5", no context

To edit any value, the user must click "Edit Measurements" which launches the full 4-step `MeasurementWizard`. There is no way to make a quick change to one field or score without going through all four steps.

**Weight is missing from the UI.** `profiles.weightKg` is in the Convex schema and the `profileSchema` Zod validator, but it is not in any wizard step and not shown on the summary page.

### Wizard steps (for reference)

- Step 1 — Body Measurements (`StepBodyMeasurements`): height + inseam with measurement guides
- Step 2 — Advanced (`StepAdvancedMeasurements`): torso, arm, femur, shoulder (optional)
- Step 3 — Flexibility (`StepFlexibility`): 5-option card select using `flexibilityTests`
- Step 4 — Core Stability (`StepCoreStability`): 5-option card select using `coreStabilityTests`

Existing data from `src/lib/validations/profile.ts`:
- `flexibilityTests`: 5 levels (very_limited → excellent) with `label`, `description`, `testResult`
- `coreStabilityTests`: 5 levels (1-5) with `label` and plank hold durations

## Scope

### In Scope

1. **Weight on the profile summary** — editable inline from the main profile screen; triggers the tire pressure recalculate dialog from the dashboard-ux-improvements plan (Step 05 of that plan)
2. **Visual flexibility display** — a horizontal progress bar / scale showing the current level out of 5, with a label and a quick-edit affordance; colour shifts from amber (very_limited) to green (excellent)
3. **Flexibility improvement guide** — a new page at `/profile/improve/flexibility` with practical advice on improving hamstring flexibility for cyclists; linked from the flexibility card
4. **Visual core stability display** — a 5-segment bar or icon row showing score out of 5; colour shifts from amber (1) to green (5); quick-edit affordance
5. **Core stability improvement guide** — a new page at `/profile/improve/core-stability` with practical exercises; linked from the core stability card
6. **Quick-edit for flexibility and core stability** — inline edit mode on the summary card (same selectable cards as the wizard step, surfaced without the full wizard); includes the measurement instructions
7. **Body measurement quick-edit** — per-field inline edit on the body measurements card, with measurement how-to shown as a popover/tooltip or expandable section
8. **Weight in the wizard** — add `weightKg` to Step 1 of the `MeasurementWizard` so it is collected during onboarding and shown in the full edit flow

### Out of Scope

- Advanced measurement quick-edit (torso, arm, femur, shoulder remain wizard-only)
- Generating AI-written advice for the guide pages (static, well-written content is sufficient)
- Tracking improvement over time (history view)

## Architecture Notes

- **Guide pages** are static informational pages in the dashboard layout — no Convex queries needed. They follow the same layout as the rest of the dashboard.
- **Quick-edit pattern**: The flexibility and core stability cards use the same `Selectable` card components already used in the wizard steps. No new interaction patterns are introduced.
- **Weight quick-edit**: A small `NumberInput` inline on the summary card with a "Save" button; triggers the recalculate dialog if weight changed (shared logic from dashboard-ux-improvements Step 05).
- **Progress/scale component**: Use the existing `Progress` component from `@/components/ui` for the visual bars.

## Approach

1. **Weight field** — add to wizard Step 1 + profile summary card with inline edit + recalculate hook
2. **Profile summary visual redesign** — redesign the Flexibility and Core Stability cards with progress bars, colour coding, quick-edit, and "How to improve" links
3. **Body measurement quick-edit** — per-field inline edit on the summary with how-to guides
4. **Guide pages** — two static pages with exercises and practical advice
5. **i18n** — all new strings in `en.ts` and `nl.ts`

## Progress

- [x] Step 01: Weight field in wizard and profile summary
- [x] Step 02: Visual flexibility card with quick-edit
- [x] Step 03: Visual core stability card with quick-edit
- [x] Step 04: Body measurement quick-edit
- [x] Step 05: Improvement guide pages
- [x] Step 06: i18n

## Acceptance Criteria

- [x] Profile summary shows the user's weight with an inline edit field; saving a changed weight triggers the recalculate tire pressure dialog
- [x] Flexibility card shows a coloured horizontal bar (5 levels), the current level label, and a brief description
- [x] An "Edit" button on the flexibility card opens an inline selector with the same 5 options and the test instructions; saving updates via Convex mutation
- [x] A "How to improve your flexibility →" link on the flexibility card leads to `/profile/improve/flexibility`
- [x] Core stability card shows a 5-segment bar, the score label, and the plank hold description
- [x] An "Edit" button on the core stability card opens an inline selector; saving updates via Convex mutation
- [x] A "How to improve your core stability →" link leads to `/profile/improve/core-stability`
- [x] Body measurements card allows inline editing of height and inseam (and optional fields) with measurement how-to guidance shown contextually
- [x] The full MeasurementWizard Step 1 includes a `weightKg` field
- [x] All new strings are available in English and Dutch
