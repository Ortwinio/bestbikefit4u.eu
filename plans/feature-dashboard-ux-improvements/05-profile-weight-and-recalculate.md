# Step 05 — Profile Weight & Tire Pressure Recalculation

## Goal

Expose the existing `weightKg` field in the profile UI, and when the user changes their weight, prompt them to recalculate tire pressure for all bikes that have an active tire setup.

## Schema Status

`profiles.weightKg` and `profiles.weightUpdatedAt` **already exist** in `convex/schema.ts`. No schema change is required.

The `profiles.mutations.upsert` mutation likely already accepts `weightKg`. Verify this and add it if missing.

## Profile Form Changes

File: `src/components/measurements/StepBodyMeasurements.tsx` (or the relevant wizard step)

Add a `weightKg` numeric input field:
- Label: `{messages.profile.measurements.weight}` (e.g. "Body weight (kg)")
- Input: number, min 30, max 300, step 0.5
- Optional field — a rider without a weight entry can still use the app
- Show a helper text: "Used for tire pressure calculations"

Also update `src/app/(dashboard)/profile/page.tsx`:
- In `ProfileSummary`, add a "Weight" row in the Body Measurements card (after existing measurements, only if `profile.weightKg` is set)
- Add `weightKg` to the `ProfileData` interface and `getDefaultValues` helper

## Weight Change Detection

In `src/app/(dashboard)/profile/page.tsx`, the `handleSaveProfile` function currently saves and closes the wizard. Extend it to detect a weight change:

```ts
const previousWeight = profileData?.weightKg;
const newWeight = data.weightKg;
const weightChanged = previousWeight !== undefined
  && newWeight !== undefined
  && Math.abs(newWeight - previousWeight) >= 0.5; // threshold to avoid trivial changes

await upsertProfile({ ..., weightKg: data.weightKg });

if (weightChanged) {
  setShowRecalculateDialog(true);
  setPendingNewWeight(newWeight);
} else {
  setIsEditing(false);
  toast.success(...);
}
```

## Recalculate Dialog

Add state `showRecalculateDialog` and `pendingNewWeight` to `ProfilePage`.

When `showRecalculateDialog` is true, show an `<AccessibleDialog>` (from `@/components/ui`):

- Title: "Update tire pressure?" (i18n)
- Body: "Your weight changed to X kg. Would you like to recalculate the recommended tire pressure for your bikes?" (i18n, with weight interpolated)
- Button: "Yes, recalculate" → calls `handleRecalculate()`
- Button: "Not now" → dismisses dialog, closes edit mode with success toast

### `handleRecalculate` Function

```ts
const handleRecalculate = async () => {
  setIsRecalculating(true);
  try {
    // Call the Convex action/mutation from Step 01
    await recalculatePressureForAllBikes({
      newWeightKg: pendingNewWeight,
      autoNoteSource: `weight_change_${pendingNewWeight}kg`,
    });
    setShowRecalculateDialog(false);
    setIsEditing(false);
    toast.success(messages.profile.recalculate.successToast);
  } catch (error) {
    reportClientError(error, { area: "profile", action: "recalculatePressure" });
    toast.error(...);
  } finally {
    setIsRecalculating(false);
  }
};
```

## New Convex Mutation: `recalculatePressureForAllBikes`

In `convex/pressureCalculations/mutations.ts` (or a new action file):

- Args: `{ newWeightKg: v.number(), autoNoteSource: v.string() }`
- Auth: `requireUserId`
- Logic:
  1. Fetch all bikes for the user
  2. For each bike, find the active wheelset → active tire setup
  3. Skip bikes with no active tire setup
  4. Re-run the pressure calculation using the existing engine helper with `bodyWeightKg = newWeightKg`
  5. Save a new `pressureCalculation` record with `autoNoteSource` set
- Returns: count of bikes recalculated

If the pressure calculation logic lives in a pure helper (likely in `src/lib/pressure/` or similar), call it directly from the mutation. If it requires an action (e.g. calls an external AI), wrap in a Convex action.

## UX Constraint From Current Product State

Because pressure-calculation deletion is not currently supported, this step should avoid generating confusing record sprawl:

- Step 04 should surface only the latest calculation per bike in this initiative
- Auto-generated recalculations should carry clear copy (`autoNoteSource` / derived label) so the user understands why a new record appeared
- If no bike can be recalculated, skip the dialog entirely and finish the profile save normally

## i18n Keys Needed (Step 06 will add them)

```
dashboard.profile.measurements.weight
dashboard.profile.measurements.weightHelper
dashboard.profile.recalculate.dialogTitle
dashboard.profile.recalculate.dialogBody
dashboard.profile.recalculate.confirmButton
dashboard.profile.recalculate.dismissButton
dashboard.profile.recalculate.successToast
dashboard.profile.recalculate.calculating
```

## Acceptance Criteria

- [ ] Profile form shows a "Body weight (kg)" field
- [ ] Profile summary card shows the user's weight if set
- [ ] Saving the profile with a weight change ≥ 0.5 kg triggers the recalculate dialog
- [ ] Clicking "Yes, recalculate" creates new pressure calculations for all bikes with an active tire setup
- [ ] Each new calculation has `autoNoteSource` set (e.g. "weight_change_75kg")
- [ ] On the Tire Pressure overview (Step 04), these auto-calculations appear as the latest calculation with the auto-note visible
- [ ] Clicking "Not now" dismisses the dialog and saves the profile normally
- [ ] The flow is non-blocking: if no bikes have an active tire setup, the dialog is skipped entirely
- [ ] The user can understand why a new latest pressure recommendation was created after weight change
