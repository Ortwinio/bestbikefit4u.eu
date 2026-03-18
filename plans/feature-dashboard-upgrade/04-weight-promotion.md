# 04 — Weight as First-Class Metric

## Goal

Promote body weight from an obscure optional field to a prominent, required-for-advanced-features metric in the rider profile and pressure engine. Show a clear warning when weight is missing and pressure calculations are requested.

## Background

`profiles.weightKg` already exists in the Convex schema as an optional field. The `pressureCalculations` schema already captures weight in `inputSnapshot.bodyWeightKg`. However:
- The profile form in `/profile` may not prominently surface weight
- The pressure calculator page currently delegates most behavior to `PressureWizard`, so the implementation should start in the wizard flow and only touch the route wrapper where needed
- There is no staleness signal when weight changes

This prompt makes weight prominent in the UI and ensures it flows into the pressure engine.

## Steps

### 1. Audit the profile form

Read `src/app/(dashboard)/profile/page.tsx` and the profile mutation `convex/profiles/mutations.ts` to understand:
- Whether `weightKg` is currently in the form
- Where it sits in the form order
- What validation range is used (the plan specifies 35–180 kg with a warning outside normal range)

### 2. Update the profile form

In `src/app/(dashboard)/profile/page.tsx` (or its form component):
- If `weightKg` is not already shown prominently, move it to the **top of the body metrics section**, immediately after height and inseam
- Make it visually distinct: add a label note "Used for tire pressure calculations"
- Validation: 35–180 kg (hard limits); show a soft warning for values outside 45–120 kg ("Please double-check your weight")
- Add a unit toggle: kg / lbs. Store always in kg. Convert on display.
- The field is not strictly required (the profile as a whole allows save without it) but show a hint: "Add weight to get accurate tire pressure recommendations"

### 3. Show a weight missing banner in the pressure calculator

In `src/app/(dashboard)/pressure-calculator/page.tsx`:
- Check if the user's profile has `weightKg` set
- If not, show a dismissible yellow banner: "Your profile is missing body weight. [Add weight →]" linking to `/profile`
- The calculator still works without weight (generic estimate), but the banner is persistent (not session-dismissible) until weight is added

### 4. Ensure pressure calculations use profile weight

Read `src/app/(dashboard)/pressure-calculator/page.tsx` and the pressure calculation save mutation.
- When the user is logged in and has a profile with `weightKg`, pre-fill the weight field in the calculator form with the profile weight
- The field should remain editable (user may want to calculate for a different weight) but default to profile weight
- When saving a calculation, store the submitted value in `pressureCalculations.inputSnapshot.bodyWeightKg`

### 5. Add weight change staleness signal

In `convex/profiles/mutations.ts`, in the `upsert` and `updateMeasurements` handlers:
- After updating `weightKg`, if the value changed, write a `weightUpdatedAt` timestamp to the profile
- Add `weightUpdatedAt: v.optional(v.number())` to the `profiles` schema (update `convex/schema.ts`)
- This timestamp will be used in prompt 09 (staleness detection) to mark pressure recommendations as stale

### 6. i18n

Add translation keys:
- `profile.weight.label` — "Body weight"
- `profile.weight.hint` — "Used for tire pressure calculations"
- `profile.weight.unitKg` — "kg"
- `profile.weight.unitLbs` — "lbs"
- `profile.weight.missingBanner` — "Your profile is missing body weight."
- `profile.weight.addWeight` — "Add weight →"
- `profile.weight.warningRange` — "Please double-check your weight"

Add to both locale files.

## Acceptance Criteria

- [ ] Weight field appears prominently in the profile form with unit toggle (kg/lbs)
- [ ] Soft warning shown for out-of-normal-range values
- [ ] Missing weight banner shown in pressure calculator when weight is not set
- [ ] Pressure calculator pre-fills weight from profile when logged in
- [ ] `profiles` schema includes `weightUpdatedAt` field
- [ ] `updateMeasurements` mutation sets `weightUpdatedAt` when `weightKg` changes
- [ ] `npm run typecheck` passes
