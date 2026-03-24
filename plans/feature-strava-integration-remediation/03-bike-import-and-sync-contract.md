# 03 — Bike Import And Sync Contract

## Goal

Define exactly what gets imported, what gets synced, and what never gets overwritten.

## Suggested Owner

- Backend Integration

## Dependencies

- Step 01 callback state contract

## Import Rules

Import these Strava-backed fields:

- name
- brand
- model
- frame-type-derived bike type
- primary flag
- lifetime distance
- `stravaGearId`

Do not auto-overwrite after user confirmation:

- user-selected bike type
- manually edited bike name
- manually edited brand/model
- fit-critical manual setup values

## Matching Rules

1. Match activities to bikes by exact `stravaGearId`.
2. Only use heuristics as fallback when exact identity is unavailable.
3. Activities with no safe bike match must remain unattached.

## Acceptance Criteria

- [ ] Bike import is idempotent on `userId + stravaGearId`.
- [ ] User-owned bike fields are preserved on re-sync.
- [ ] Sync writes the same fields that read models and reminders consume.
- [ ] Partial per-bike fetch failures do not block the rest of the import.
- [ ] Exact `stravaGearId` match is used before any heuristic fallback.

## Success Criteria

- [ ] Re-import and re-sync produce no duplicate bikes.
- [ ] Imported metadata remains trustworthy enough to use in fit flows.
