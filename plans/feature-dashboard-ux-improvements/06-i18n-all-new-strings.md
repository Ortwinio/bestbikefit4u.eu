# Step 06 — i18n: All New Strings

## Goal

Add all new UI strings from Steps 02–05 to both `src/i18n/messages/en.ts` and `src/i18n/messages/nl.ts`.

## Files to Edit

- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`

## New Keys (English values shown)

### Navigation

```ts
dashboard.nav.bikeFitting: "Bike Fitting"
```

### Bike Fitting History Screen

```ts
dashboard.fitHistory.title: "Bike Fitting History"
dashboard.fitHistory.emptyTitle: "No fitting sessions yet"
dashboard.fitHistory.emptyDescription: "Complete a bike fitting session to see your history here."
dashboard.fitHistory.emptyCtaLabel: "Start your first fitting"
dashboard.fitHistory.sessionDate: "Session date"
dashboard.fitHistory.viewReport: "View report"
dashboard.fitHistory.startNewSession: "Start new fitting session"
dashboard.fitHistory.saddleHeight: "Saddle height"
dashboard.fitHistory.handlebarDrop: "Handlebar drop"
dashboard.fitHistory.confidence: "Confidence"
```

### My Bikes — Notes

```ts
dashboard.bikes.notes.title: "My Notes"
dashboard.bikes.notes.placeholder: "Add personal notes about this bike — geometry tweaks, component changes, observations..."
dashboard.bikes.notes.editButton: "Edit note"
dashboard.bikes.notes.saveButton: "Save note"
dashboard.bikes.notes.charCount: "{count}/500"
```

### My Bikes — Fitting History

```ts
dashboard.bikes.fitHistory.title: "Fitting History"
dashboard.bikes.fitHistory.emptyText: "No fitting sessions for this bike yet."
dashboard.bikes.fitHistory.startNewForBike: "Start a fitting session for this bike"
dashboard.bikes.fitHistory.sessionCount: "{count, plural, one {1 fitting session} other {# fitting sessions}}"
```

### Tire Pressure Overview

```ts
dashboard.tirePressure.overview.title: "Your Bikes"
dashboard.tirePressure.overview.lastCalculated: "Last calculated"
dashboard.tirePressure.overview.frontPressure: "Front"
dashboard.tirePressure.overview.rearPressure: "Rear"
dashboard.tirePressure.overview.noCalculation: "No calculation yet"
dashboard.tirePressure.overview.noCalculationCta: "Get a recommendation"
dashboard.tirePressure.overview.recalculate: "Recalculate"
dashboard.tirePressure.overview.userNotes.placeholder: "Add notes about your experience with this pressure..."
dashboard.tirePressure.overview.userNotes.editButton: "Add note"
dashboard.tirePressure.overview.userNotes.saveButton: "Save"
```

### Profile — Weight

```ts
dashboard.profile.measurements.weight: "Body weight (kg)"
dashboard.profile.measurements.weightHelper: "Used for tire pressure calculations"
```

### Profile — Recalculate Dialog

```ts
dashboard.profile.recalculate.dialogTitle: "Update tire pressure?"
dashboard.profile.recalculate.dialogBody: "Your weight changed to {weight} kg. Would you like to recalculate the recommended tire pressure for your bikes?"
dashboard.profile.recalculate.confirmButton: "Yes, recalculate"
dashboard.profile.recalculate.dismissButton: "Not now"
dashboard.profile.recalculate.successToast: "Tire pressure recalculated for all your bikes"
dashboard.profile.recalculate.calculating: "Recalculating..."
```

## Dutch Translations

Translate all of the above to Dutch. Reference the existing patterns in `nl.ts` for terminology.

Notable translations:
- "Bike Fitting" → "Fietsafstelling"
- "Fitting History" → "Afstellingsgeschiedenis"
- "Body weight" → "Lichaamsgewicht"
- "Tire pressure" → "Bandenspanning"
- "Recalculate" → "Herberekenen"
- "Notes" → "Notities"
- "Saddle height" → "Zadelhoogte"
- "Handlebar drop" → "Stuurval"

## Acceptance Criteria

- [ ] All new keys exist in `en.ts` with natural English copy
- [ ] All new keys exist in `nl.ts` with natural Dutch copy
- [ ] No TypeScript errors from missing keys (the `messages` type is inferred from `en.ts`)
- [ ] `npm run lint` passes (no unused string warnings if any lint rule covers this)
