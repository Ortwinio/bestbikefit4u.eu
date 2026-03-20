# Step 03 — My Bikes Enhancements

## Goal

Add two things to the existing bike experience:
1. A free-text **notes** field on each bike (editable inline on the bike detail page)
2. A **Fitting History** section on the bike detail page showing past sessions for that bike

Also use this step to harden the existing bike deletion UX instead of introducing a second, inconsistent pattern.

## Bike Detail Page

File: `src/app/(dashboard)/bikes/[bikeId]/page.tsx`

Read the current file before editing.

### Notes Section

Add a collapsible or always-visible "Notes" card below the existing bike details:

```tsx
<Card variant="bordered">
  <CardHeader>
    <CardTitle>{messages.bikes.notes.title}</CardTitle>
  </CardHeader>
  <CardContent>
    <BikeNotesEditor bikeId={bikeId} initialNotes={bike.notes} />
  </CardContent>
</Card>
```

### `<BikeNotesEditor>` Component

Create `src/components/bikes/BikeNotesEditor.tsx`:

- Props: `{ bikeId: Id<"bikes">, initialNotes?: string }`
- Local state for the textarea value
- "Edit" button toggles into edit mode; "Save" calls `useMutation(api.bikes.mutations.update)` with `{ id: bikeId, notes: value }`
- Shows a toast on success (`messages.common.toasts.saved`)
- Character counter, max 500 chars
- Uses `<Textarea>` from `@/components/ui`

### Fitting History Section

Add after the notes card:

```tsx
<BikeFitHistorySection bikeId={bikeId} />
```

### `<BikeFitHistorySection>` Component

Create `src/components/bikes/BikeFitHistorySection.tsx`:

- Props: `{ bikeId: Id<"bikes"> }`
- Query: `useQuery(api.fitSessions.queries.getSessionsWithRecommendationsByBike, { bikeId })`
- Renders a timeline list of sessions with the same structure as in Step 02's `<BikeWithFitHistory>`
- "Start new fit session for this bike" link pre-selects the bike (pass `?bikeId=...` query param to `/fit`)

## Bike List Page Changes

File: `src/app/(dashboard)/bikes/page.tsx`

The bike cards on the list page should show a small "fitting history" indicator:
- Number of completed fit sessions for this bike (e.g. "3 fittings")
- Requires extending the existing bikes query or adding a count to each returned bike

If this would be expensive to add in one pass, it is acceptable to skip the count on the list page and only show history on the detail page.

## Existing Delete UX To Improve

Current state:
- Bike list page already exposes delete
- Bike edit page already exposes delete through `BikeForm`
- The current flow uses browser confirm/alert patterns, which is inconsistent with the rest of the dashboard
- Backend delete behavior is currently too weak unless Step 01 fixes the lifecycle contract

Required plan adjustment:
- Replace browser `window.confirm` / `alert` usage with the shared destructive dialog + toast pattern
- Make the destructive copy explicit about what happens to related wheelsets, tire setups, fit history references, and pressure history
- If Step 01 chooses to block deletion instead of cascading, the UI must surface the blocking reason clearly

## BikeForm Notes Field

File: `src/components/bikes/BikeForm.tsx`

Add an optional `notes` field to the form (below all other fields, clearly labeled as optional):
- `<Textarea>` with max 500 chars
- Visible in both the "Add Bike" and "Edit Bike" flows

## i18n Keys Needed (Step 06 will add them)

```
dashboard.bikes.notes.title
dashboard.bikes.notes.placeholder
dashboard.bikes.notes.editButton
dashboard.bikes.notes.saveButton
dashboard.bikes.notes.charCount
dashboard.bikes.fitHistory.title
dashboard.bikes.fitHistory.emptyText
dashboard.bikes.fitHistory.startNewForBike
dashboard.bikes.fitHistory.sessionCount
```

## Acceptance Criteria

- [ ] Bike detail page shows a Notes card with the current note (or empty state)
- [ ] Clicking "Edit" enables a textarea; "Save" persists the note via Convex mutation
- [ ] Notes survive a page reload
- [ ] Bike detail page shows a "Fitting History" section with past sessions
- [ ] "Start new fit session for this bike" link works and pre-selects the bike
- [ ] BikeForm has an optional notes textarea
- [ ] All character limits are enforced client-side and via Convex validator
- [ ] Bike deletion uses the shared dialog/toast UX rather than browser confirm/alert
- [ ] Bike deletion messaging matches the actual backend lifecycle behavior
