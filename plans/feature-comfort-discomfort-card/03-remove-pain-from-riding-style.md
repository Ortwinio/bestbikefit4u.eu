# Prompt 03 — Remove pain fields from RidingStyleCard

## Goal

Now that pain/discomfort has its own card, remove the duplicate pain fields from the `RidingStyleCard` edit form and view state.

---

## Context

Read `plans/feature-comfort-discomfort-card/README.md` first.

After Prompt 02 the profile page has both the `ComfortCard` and the `RidingStyleCard` showing pain data. This prompt removes pain from `RidingStyleCard` to eliminate the duplication.

---

## Changes to `src/components/profile/RidingStyleCard.tsx`

### 1. `RiderProfileData` interface

Remove `hasPain` and `painAreas` from the exported `RiderProfileData` interface (they are now owned by the Comfort card).

Keep: `experienceLevel`, `weeklyHours`, `typicalRideLength`, `positionPriority`.

### 2. `DraftState` interface

Remove `hasPain` and `painAreas` from `DraftState`.

### 3. Constants

Remove `PAIN_KEYS` and `PAIN_AREA_KEYS` constants.

### 4. `initDraft`

Remove `hasPain` and `painAreas` from the draft initialisation.

### 5. `canSave` check

Remove `draft.hasPain !== null` from the `canSave` condition.

### 6. `handleSave`

Remove `hasPain` and `painAreas` from the data passed to `onSave`.

### 7. View state (`renderViewState`)

Remove the pain row (the `<div className="flex items-center justify-between gap-3">` row showing `t.pain` / pain area chips / `t.noPain`).

### 8. Edit state (`renderEditState`)

Remove the `<ToggleQuestion>` for pain and the conditional pain-areas chip block.

### 9. i18n — remove unused keys

From `profile.ridingStyle` in both `en.ts` and `nl.ts`, remove:
- `pain`
- `noPain`

---

## Changes to `src/app/(dashboard)/profile/page.tsx`

### `handleSaveRidingStyle`

Update the call to `updateRiderProfile` — remove `hasPain` and `painAreas` from the payload (since those are now saved through `handleSaveComfort`).

### `ProfileSummary` / `RidingStyleCard` props

No interface change needed beyond what was already updated.

---

## Verification

- `RidingStyleCard` edit form no longer shows pain toggle or pain area chips
- `RidingStyleCard` view state no longer shows a pain row
- `ComfortCard` still shows pain data correctly (reads from profile, unaffected)
- `updateRiderProfile` mutation called by Riding Style no longer carries pain fields
- No TypeScript errors
