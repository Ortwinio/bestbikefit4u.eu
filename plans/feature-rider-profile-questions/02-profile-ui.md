# Prompt 02 — My Profile UI: Riding Style Card

## Goal

Add a "Riding Style" card to the My Profile page that presents the 5 rider profile questions. The card has a view state (shows current answers) and an edit state (wizard-style, step-by-step using the existing question UI components). It should look and feel consistent with the Flexibility and Core Stability cards.

## Context

- My Profile page: `src/app/(dashboard)/profile/page.tsx`
- Existing question UI components live in `src/components/questionnaire/questions/`:
  - `ExperienceLevelSelector` — for `experienceLevel`
  - `WeeklyHoursSelector` — for `weeklyHours`
  - `RideDistanceSelector` — for `typicalRideLength`
  - `PainDiscomfortSelector` — for `hasPain`
  - `PainAreasSelector` — for `painAreas`
  - `SingleChoiceQuestion` — for `positionPriority` (and `kneePainTiming`, `painSeverity`)
- The card follows the same pattern as `FlexibilityCard` and `CoreStabilityCard`:
  - `CardHeader` with icon + title + "Edit" button (top-right, `variant="primary-soft"`)
  - `CardContent` with read view / edit view
  - Edit triggers a full inline replacement of the card content

## New Component: `RidingStyleCard`

Create `src/components/profile/RidingStyleCard.tsx` (or add inline in profile/page.tsx following existing pattern).

### Read View

Show a compact summary of current answers:

```
Experience level    Intermediate
Weekly hours        6–10 hrs/wk
Typical ride        Medium (30–80 km)
Pain                Yes — Lower back, Knees
Position priority   Balanced
```

If rider profile is not yet complete, show a prompt:
> "Complete your riding profile to enable bike fitting"
> [Complete now →] (triggers edit mode)

### Edit View

A step-by-step wizard (same pattern as `MeasurementWizard`) that walks through the questions using the existing selector components. Steps:

1. Experience level (`ExperienceLevelSelector`)
2. Weekly hours (`WeeklyHoursSelector`)
3. Typical ride length (`RideDistanceSelector`)
4. Pain discomfort (`PainDiscomfortSelector`) + conditional `PainAreasSelector`
5. Position priority (`SingleChoiceQuestion` or a new `PositionPrioritySelector`)

Navigation: Previous / Next / Save (on last step) — same style as MeasurementWizard.

On save, call `api.profiles.mutations.updateRiderProfile`.

## Placement on My Profile Page

Add the `RidingStyleCard` to the grid in `ProfileSummary`:

```tsx
<div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
  <Card ...> {/* Body Measurements — xl:row-span-2 */} </Card>
  <FlexibilityCard ... />
  <CoreStabilityCard ... />
  <RidingStyleCard ... />   {/* NEW — spans full width or fits in grid */}
</div>
```

The riding style card can span 2 columns on xl (`xl:col-span-2`) to give more room for the answers summary.

## Incomplete State on Profile Page

If the rider profile questions are not yet answered, the card should show a highlighted incomplete state (similar to how the Profile page shows a warning if body measurements are missing) — using a `border-warning` or `bg-warning/10` treatment with a clear CTA to complete it.

## i18n

Add messages under `messages.profile.ridingStyle` in both `en.ts` and `nl.ts`:

```typescript
ridingStyle: {
  title: "Riding Style",
  editButton: "Edit",
  incompleteTitle: "Complete your riding profile",
  incompleteDescription: "Answer a few questions about your riding style to enable bike fitting.",
  completeCta: "Complete now",
  experienceLevel: "Experience level",
  weeklyHours: "Weekly hours",
  typicalRide: "Typical ride",
  pain: "Discomfort",
  positionPriority: "Position priority",
  noPain: "No discomfort",
  saveButton: "Save",
}
```

## Files to Create/Change

- `src/components/profile/RidingStyleCard.tsx` — new component
- `src/app/(dashboard)/profile/page.tsx` — add `RidingStyleCard`, wire up mutation + state
- `src/i18n/messages/en.ts` — add `profile.ridingStyle` messages
- `src/i18n/messages/nl.ts` — add `profile.ridingStyle` messages (NL translations)
