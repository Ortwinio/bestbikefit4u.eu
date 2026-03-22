# Step 05 — Test Plan

## Goal

Prove the Strava bike import feature is correct, idempotent, safe under re-sync, and useful to the fit engine.

---

## Release Gates

### v1 gate

Must pass before shipping bike import foundation:
- schema and typecheck green
- token refresh tests green
- bike import idempotency tests green
- settings import UI tests green
- manual happy-path import check complete

### v1.1 gate

Must pass before shipping activity enrichment:
- v1 gate still green
- activity upsert and incremental sync tests green
- usage summary recomputation tests green
- bike role inference tests green
- manual multi-bike activity import check complete

### v2 gate

Must pass before shipping fit intelligence:
- v1 and v1.1 gates still green
- fit modifier tests green
- recommendation-difference regression tests green
- low-use message generation tests green

---

## Unit Tests

### Mapping

Test:
- `frame_type` to `bikeType`
- `frame_type` to `bikeTypeSource`
- unknown / null `frame_type`

Assertions:
- known values map exactly
- unknown values do not default to `road`
- unknown values leave `bikeType` unset

### Usage summarization

Test:
- ride count
- recent distance
- average duration
- trainer ratio
- dominant sport type
- exclusion of activities without `bikeId`

Assertions:
- summary fields are deterministic
- unlinked activities do not contaminate bike summaries

### Bike role inference

Test representative mixes:
- fast short road rides
- long endurance rides
- gravel-heavy rides
- MTB-heavy rides
- trainer-heavy rides
- commute-heavy rides

Assertions:
- inferred role matches expected bucket
- edge cases do not produce obviously wrong roles

### Fit bias derivation

Test:
- role bias lookup
- climbing modifier
- indoor modifier
- low-use prompt trigger

Assertions:
- modifiers are bounded
- modifiers combine predictably
- modifiers never override core rider measurements outright

---

## Backend Integration Tests

### Token refresh

Cases:
- valid token with more than 5 minutes left
- expired token with successful refresh
- refresh failure

Assertions:
- no unnecessary refresh
- refreshed credentials are persisted
- failure does not partially import bikes

### Bike import

Cases:
- first import with one bike
- first import with multiple bikes
- re-import same bikes
- partial failure on one gear fetch
- unknown `frame_type`

Assertions:
- no duplicate bikes
- successful bikes still import if one fails
- unknown type still imports and requires correction
- user-owned fields are preserved on re-sync

### Activity import

Cases:
- first 90-day import
- repeated import with same activities
- incremental import after `lastActivitySyncAt`
- activity without `gear_id`
- activity with unknown `gear_id`
- multi-page Strava response

Assertions:
- no duplicate activities
- bike summaries recompute correctly
- unmatched activities remain non-destructive
- sync window behaves correctly

### Disconnect safety

Case:
- user disconnects Strava after importing bikes

Assertions:
- imported bikes remain local
- future Strava calls are blocked until reconnect

---

## UI Tests

### Settings import section

Test:
- hidden when Strava inactive
- visible when active and gear summary exists
- imported bikes show disabled checked state and “Already added”
- unimported bikes are pre-selected
- import button count updates with selection

### Import flow

Test:
- import selected bikes
- success toast count
- partial failure feedback
- post-import refresh

### Type confirmation wizard

Test:
- appears only for bikes with unknown type
- saves `bikeType`
- saves `bikeTypeSource = "user"`
- advances through multiple unresolved bikes correctly

### v1.1 usage UI

Test:
- bike detail shows usage stats
- inferred role label appears when available
- missing usage data degrades gracefully

### v2 fit UI

Test:
- bike selector shows role / last-used hint
- fit insight card reflects stored role and bias

---

## Fit Regression Tests

Use fixed rider measurements and fixed bike records.

Compare outputs for:
- race road vs. endurance road
- gravel vs. road
- trainer-heavy vs. normal road usage

Assertions:
- recommendation deltas exist where expected
- deltas stay within predefined safe bounds
- output remains explainable and stable

---

## Manual Test Plan

### v1

1. Connect a Strava account with at least 2 bikes.
2. Verify bike list appears in Settings.
3. Import one bike, then re-open Settings.
4. Verify imported bike is marked already added.
5. Re-import the same bike and verify no duplicate local bike record is created.
6. Import a bike with unknown type and verify the correction wizard appears.
7. Set bike type manually, then re-run import and verify it is preserved.

### v1.1

1. Trigger 90-day ride import.
2. Verify activities link to imported bikes.
3. Verify bike usage summary updates.
4. Trigger import again and verify no duplicate activity rows are created.

### v2

1. Start fit sessions for two bikes with different inferred roles.
2. Verify the UI explains the bike-specific bias.
3. Confirm recommendation output changes in the intended direction.

---

## Required Validation Commands

- `npm run typecheck`
- focused `vitest` suites for:
  - Strava mapping
  - import actions and mutations
  - settings import UI
  - fit bias logic
