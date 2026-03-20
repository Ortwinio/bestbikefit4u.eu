# Step 04 — Tire Pressure Overview

## Goal

Transform the Tire Pressure page from a wizard-only entry point into a page that first shows a per-bike pressure summary (with user notes), and allows the user to start a new calculation from there.

Important scope clarification from repo review:
- There is currently no delete action for pressure calculations
- This step adds a **latest calculation overview**, not a full calculation history manager
- Therefore this step should not imply deletion support unless Step 01 explicitly adds it

## Current State

`src/app/(dashboard)/pressure-calculator/page.tsx` renders `<PressureWizard>` directly, with no summary of past calculations.

## New Page Layout

The page should now have two sections:

### 1. Per-Bike Pressure Summary

At the top of the page (before or alongside the wizard entry point), show a grid of `<BikePressureCard>` components — one per bike the user has.

Each card shows:
- Bike name + type
- Most recent recommended front pressure (bar + psi)
- Most recent recommended rear pressure (bar + psi)
- Date of the last calculation
- "Recalculate" button → opens the wizard pre-selected for that bike
- **User notes** on this calculation (editable inline, see below)
- If no calculation exists for the bike: "No calculation yet — get a recommendation" CTA

### `<BikePressureCard>` Component

Create `src/components/features/pressure/BikePressureCard.tsx`:

- Props: `{ bike, latestCalculation: pressureCalculation | null }`
- Renders the summary described above
- `userNotes` editing:
  - A small text input or textarea below the pressure values
  - "Edit note" icon button (pencil icon from lucide-react)
  - On save, calls `useMutation(api.pressureCalculations.mutations.updateNotes)` with `{ id: calculationId, userNotes }`
  - Max 300 chars; shows toast on success

### 2. Start New Calculation

Below the summary grid, keep the existing "Calculate tire pressure" entry point (button or collapsed wizard). When the user clicks "Recalculate" on a card, scroll to / open the wizard with that bike pre-selected.

## Data Required

- Query: use the existing bikes-by-user query in the repo (`api.bikes.queries.listByUser` unless renamed during implementation)
- Query per bike: `useQuery(api.pressureCalculations.queries.getLatestByBike, { bikeId })` — new from Step 01

To avoid N+1 queries, consider adding a new query `getLatestPressureCalculationsForAllBikes` that returns a map of `bikeId → latestCalculation`. This is more efficient than one query per bike card.

Recommended approach:
- Prefer the aggregated query over per-card queries so the page remains fast as bike count grows
- Keep the UI focused on the latest record only in this iteration; historical list management can be a separate follow-up once lifecycle actions are defined

## i18n Keys Needed (Step 06 will add them)

```
dashboard.tirePressure.overview.title
dashboard.tirePressure.overview.lastCalculated
dashboard.tirePressure.overview.frontPressure
dashboard.tirePressure.overview.rearPressure
dashboard.tirePressure.overview.noCalculation
dashboard.tirePressure.overview.noCalculationCta
dashboard.tirePressure.overview.recalculate
dashboard.tirePressure.overview.userNotes.placeholder
dashboard.tirePressure.overview.userNotes.editButton
dashboard.tirePressure.overview.userNotes.saveButton
```

## Acceptance Criteria

- [ ] Tire Pressure page shows a per-bike summary grid before the wizard
- [ ] Each card shows the latest recommended front/rear pressure values and the calculation date
- [ ] A user can add or edit a note on a calculation inline; it persists via Convex
- [ ] Cards with no calculation show an empty state CTA
- [ ] "Recalculate" button links to the wizard pre-selected for that bike
- [ ] The existing wizard functionality is not broken
- [ ] The screen does not suggest a delete capability for pressure calculations unless such a backend action exists
