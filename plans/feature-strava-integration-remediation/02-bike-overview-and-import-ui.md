# 02 — Bike Overview And Import UI

## Goal

Turn the Strava settings section into a useful bike overview and import surface.

## Suggested Owner

- Settings UX

## Dependencies

- Step 01 callback state contract
- Step 03 overview query contract

## Required UI

For every Strava bike show:

- bike name
- brand and model
- mapped bike type
- primary badge
- lifetime distance in km
- recent ride count
- average ride distance
- average speed
- last ride date
- import status
- readiness state
- plain-language explanation when inferred usage context is shown

## Interaction Rules

- Unimported bikes are pre-selected.
- Imported bikes are visibly marked and disabled for duplicate import.
- Bikes with missing or ambiguous type show a confirmation-needed state.
- Import button copy reflects the current selected count.
- Partial failures are shown per bike, not as a single vague error.

## Acceptance Criteria

- [ ] Settings shows the Strava bike overview when Strava is active.
- [ ] Rows show lifetime km plus recent average distance and speed when available.
- [ ] Imported bikes are clearly marked as already added.
- [ ] Unimported bikes are pre-selected by default.
- [ ] Import button count is accurate.
- [ ] Unknown bike type opens a confirmation step.
- [ ] Readiness state is visible after import.
- [ ] Mobile and desktop layouts remain easy to scan.

## Success Criteria

- [ ] A user can tell which bike is their most-used bike at a glance.
- [ ] A user can choose which bikes to import without leaving Settings.
- [ ] A user can tell what to do next for an imported but not fit-ready bike.
