# 05 — Disconnect Cleanup And Safety

## Goal

Ensure Strava disconnect is predictable and privacy-safe.

## Suggested Owner

- Backend Integration

## Dependencies

- Step 03 sync contract

## Required Behavior

- Revoke the Strava connection when possible.
- Clear tokens and Strava integration state.
- Remove Strava-derived activity sync state and summaries.
- Preserve local bike records the user imported.
- Preserve any chosen profile photo unless the user explicitly changes it.

## Acceptance Criteria

- [ ] Tokens and integration sync state are cleared on disconnect.
- [ ] `bikeActivities` and Strava-derived summaries are removed or reset appropriately.
- [ ] Imported local bikes remain available after disconnect.
- [ ] Reconnect works cleanly after a prior disconnect.
- [ ] Disconnect leaves no stale Strava-derived advisory state in bike queries or reminders.

## Success Criteria

- [ ] A user who disconnects does not keep stale Strava-derived advisory state.
- [ ] A user does not lose their manually curated bike library.
