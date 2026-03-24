# Strava Integration Remediation Plan

**Status:** Planned
**Owner:** Codex
**Target:** Stable v1.2 Strava integration with trustworthy bike overview, import, bike-usage enrichment, and implementation-ready delivery slices

## Goal

Make the Strava integration useful immediately after connect:

1. The user connects Strava successfully.
2. The settings page shows a clear overview of the bikes Strava knows about.
3. Each bike shows the most relevant information for fit setup and decision-making.
4. The user can import selected bikes and their Strava-derived metadata safely.
5. Imported usage data improves BestBikeFit4U recommendations without corrupting user-owned bike data.

## Implementation Mode

This plan is written to be executed by multiple coding agents in parallel.

### Working rules

- Each implementation slice must own a disjoint write scope where possible.
- Shared contracts must be agreed in code before UI and recommendation work depends on them.
- Quality control is a first-class role, not a final afterthought.
- No slice is complete unless it meets both product acceptance and engineering acceptance.

### Required roles

#### Role 1: Backend Integration

Owns:

- OAuth callback
- token refresh
- Strava API fetches
- import actions
- disconnect cleanup

Primary write scope:

- `convex/http.ts`
- `convex/integrations/actions.ts`
- `convex/integrations/queries.ts`
- `convex/integrations/mutations.ts`
- `convex/integrations/strava.ts`
- `convex/integrations/stravaToken.ts`

#### Role 2: Settings UX

Owns:

- Strava card in Settings
- bike overview
- import interactions
- type confirmation flow
- empty, loading, and failure states

Primary write scope:

- `src/app/(dashboard)/settings/page.tsx`
- `src/components/settings/*`
- `src/i18n/messages/*`

#### Role 3: Fit Context

Owns:

- activity enrichment consumption
- bike context exposure to fit flows
- role explanation UI if added

Primary write scope:

- recommendation and session consumers
- bike usage display surfaces

#### Role 4: Quality Control

Owns:

- code quality review
- contract consistency review
- test coverage review
- Prototyper UI usage review
- UX review for clarity, state handling, and accessibility

Responsibilities:

- verify shared UI wrappers are used consistently instead of bypassing them
- verify Prototyper UI patterns are used correctly and idiomatically
- verify state names, action names, and data contracts stay coherent
- reject implementation that is technically functional but confusing to users
- validate loading, empty, success, partial-failure, and recovery states

Definition of done for Quality Control:

- no known contract mismatch between written sync data and read queries
- no unsafe overwrite of user-owned data
- no obvious duplicate or stale-state regression
- settings UX matches the plan and feels intentional rather than bolted on
- tests cover the main failure modes

## Product Outcome

After pressing `Connect Strava`, the user should return to Settings and see:

- Strava connection state and athlete identity
- A bike overview table/list with one row per Strava bike
- For each bike:
  - bike name
  - brand and model when available
  - Strava bike type / mapped bike type
  - primary bike flag
  - lifetime distance from Strava
  - ride count in the sync window
  - average ride distance in the sync window
  - average speed in the sync window
  - last ride date
  - import state: not imported, imported, needs confirmation, sync error
- Selection controls to import one or more bikes
- A safe import flow that brings in the bike record plus supported Strava metadata

## Product Decisions

These decisions are fixed for implementation unless explicitly changed:

1. The canonical activity window for the bike overview is `90 days`.
2. The bike overview shows both:
   - lifetime distance from Strava
   - recent usage metrics from the 90-day sync window
3. Average speed is shown in `kph`, rounded to `1 decimal`.
4. Average ride distance is shown in `km`, rounded to whole kilometers.
5. Recent metrics include indoor rides in the raw usage summary, but trainer-heavy behavior must be visibly explainable and must not silently bias road/gravel fit framing without disclosure.
6. Imported bikes remain local after disconnect, but Strava-derived activity summaries and sync state are removed.
7. Exact `stravaGearId` match is authoritative. Heuristic matching is fallback only.
8. A bike can be in one of four readiness states:
   - `available_in_strava`
   - `imported_needs_type_confirmation`
   - `imported_needs_fit_setup`
   - `fit_ready`
9. Strava context is advisory only and must be user-correctable.

## Scope

### In scope

- OAuth connect, callback hardening, and disconnect cleanup
- Post-connect bike overview in Settings
- Bike import with user review
- Import of Strava bike metadata:
  - name
  - brand
  - model
  - frame-type-derived bike type
  - primary flag
  - lifetime distance
  - recent ride statistics
- Activity sync tied to exact `stravaGearId`
- Clear ownership rules for user-entered vs Strava-owned fields
- Tests for callback, import, sync, cleanup, and UI states

### Out of scope

- Using Strava as the primary auth system
- Full GPS route import
- Segment-level analysis
- Automatic overwriting of user-confirmed fit inputs
- Premium gating changes

## Source Of Truth Rules

| Field / behavior | Source of truth |
|---|---|
| `stravaGearId`, `stravaPrimary`, lifetime distance | Strava sync-owned |
| `bikeType` when `bikeTypeSource = "user"` | User-owned |
| `brand`, `model`, `notes` when user edits them later | User-owned after manual edit |
| recent ride stats and inferred role | BestBikeFit4U derived from Strava activities |
| final recommendations | BestBikeFit4U engine with Strava context as advisory only |

## User Experience Requirements

### Connect flow

1. User clicks `Connect Strava`.
2. User sees a short consent summary before redirect.
3. Callback completes server-side.
4. Background sync starts automatically.
5. User returns to Settings with a success toast.
6. The Strava card expands to show athlete identity and bike overview.

### Bike overview after connect

The overview should answer three user questions immediately:

1. Which bikes did Strava find?
2. How much is each bike actually used?
3. Which bikes should I import into BestBikeFit4U?

### Bike readiness after import

BestBikeFit4U should not stop at "bike imported".

After import, each bike should clearly communicate what still matters for fit quality:

- bike type confirmed or not
- missing fit-critical inputs
- whether the bike is ready to use for a fit session

### Overview layout requirements

Each bike row/card should have a stable hierarchy:

1. Identity row:
   - bike name
   - brand and model
   - primary badge
   - import/readiness badge
2. Usage row:
   - lifetime km
   - recent ride count
   - average ride distance
   - average speed
   - last ride date
3. Action row:
   - import toggle or imported state
   - type confirmation state where needed
   - optional readiness CTA later

### Import flow

1. Unimported bikes are pre-selected.
2. Imported bikes are visibly locked or marked as already added.
3. Ambiguous bikes require type confirmation before being considered complete.
4. Importing never duplicates bikes.
5. Re-sync never overwrites user-confirmed fields.

## Bike Overview Contract

Each Strava bike card/row must contain:

- `name`
- `brand`
- `model`
- `mapped bike type`
- `primary`
- `lifetimeDistanceKm`
- `rideCountWindow`
- `avgRideDistanceKm`
- `avgSpeedKph`
- `lastRideAt`
- `status`
- `readiness`
- `explanation` for inferred usage state when present

### Empty-state behavior

- No Strava bikes: explain that no bikes were available from Strava.
- No recent rides for a bike: show lifetime distance and `No recent rides`.
- Gear fetch failed for one bike: keep the rest of the overview usable and show an item-level error.

### Display rules

- Lifetime distance always uses km.
- Average ride distance always uses km.
- Average speed always uses kph.
- Last ride date uses the user locale.
- Missing recent metrics must be rendered as a clear absence state, not fake zero values.
- Imported and non-imported bikes must be distinguishable at a glance.

## Data Contract

### Strava summary data per bike

```ts
type StravaBikeOverviewItem = {
  gearId: string;
  name: string;
  brandName?: string;
  modelName?: string;
  frameType?: number | null;
  mappedBikeType?: BikeType;
  bikeTypeSource: "strava_frame_type" | "fallback_pending_confirmation" | "user";
  primary: boolean;
  lifetimeDistanceMeters: number;
  importedBikeId?: Id<"bikes">;
  needsTypeConfirmation: boolean;
  syncStatus: "ready" | "imported" | "error";
  readiness:
    | "available_in_strava"
    | "imported_needs_type_confirmation"
    | "imported_needs_fit_setup"
    | "fit_ready";
  rideCountWindow: number;
  totalDistanceWindowMeters: number;
  avgRideDistanceWindowMeters?: number;
  avgSpeedWindowKph?: number;
  lastRideAt?: number;
  explanation?: string;
};
```

### Imported local bike fields

Required on import:

- `name`
- `source = "strava"`
- `stravaGearId`
- `stravaPrimary`
- `lifetimeDistanceMeters`
- `lastStravaSync`
- `bikeType`
- `bikeTypeSource`
- `needsTypeConfirmation`

Derived after activity sync:

- `activitySummary`
- top-level summary mirrors used by queries and reminders:
  - `rideCount90d`
  - `recentDistance90dMeters`
  - `avgRideDistance90dMeters`
  - `avgSpeed90dKph`
  - `avgElevationPer100Km90d`
  - `trainerRideRatio90d`
  - `dominantSportType`
  - `lastRideAt`
  - `inferredBikeRole`

## Fit Readiness Contract

Each imported bike should expose a simple readiness summary:

```ts
type BikeFitReadiness = {
  status:
    | "imported_needs_type_confirmation"
    | "imported_needs_fit_setup"
    | "fit_ready";
  missingFields: string[];
  completionScore: number; // 0-100
};
```

Minimum fit-critical fields to evaluate readiness:

- confirmed bike type
- frame size or equivalent size input when applicable
- at least one geometry/setup source or baseline setup path

Readiness must not block import, but it should guide the next step in the UX.

## Delivery Steps

1. [01-oauth-and-callback-hardening.md](./01-oauth-and-callback-hardening.md)
2. [02-bike-overview-and-import-ui.md](./02-bike-overview-and-import-ui.md)
3. [03-bike-import-and-sync-contract.md](./03-bike-import-and-sync-contract.md)
4. [04-activity-enrichment-and-fit-context.md](./04-activity-enrichment-and-fit-context.md)
5. [05-disconnect-cleanup-and-safety.md](./05-disconnect-cleanup-and-safety.md)
6. [06-test-plan-and-release-gates.md](./06-test-plan-and-release-gates.md)
7. [07-quality-control-and-ux-governance.md](./07-quality-control-and-ux-governance.md)

## Suggested Parallel Execution Plan

### Phase A

- Backend Integration: Step 01
- Settings UX: design the row/card structure for Step 02 using the fixed contract
- Quality Control: review contract before implementation starts

### Phase B

- Backend Integration: Step 03
- Settings UX: Step 02 implementation against the finalized query contract
- Quality Control: review shared naming, loading states, and Prototyper UI usage

### Phase C

- Backend Integration: Step 05
- Fit Context: Step 04
- Quality Control: review contract consistency and recommendation safety

### Phase D

- All roles support Step 06
- Quality Control owns Step 07 sign-off

## Acceptance Criteria

### Product acceptance

- [ ] Connecting Strava returns the user to Settings with a working connected state.
- [ ] The settings page shows a Strava bike overview automatically after connect.
- [ ] Every visible bike row includes lifetime km, recent average ride distance, and recent average speed when data exists.
- [ ] Every visible bike row clearly communicates import state and readiness state.
- [ ] Users can import one or more bikes from the overview.
- [ ] Imported bikes are not duplicated on re-import.
- [ ] Ambiguous bike types require confirmation before the bike is treated as fully imported.
- [ ] Imported bikes show what fit-critical data is still missing.
- [ ] Imported bike usage context feeds fit advisory logic without overriding user-owned fit inputs.
- [ ] Disconnecting Strava removes Strava-derived sync data while preserving the local bike records.

### Engineering acceptance

- [ ] Activity matching uses exact `stravaGearId` before any heuristic fallback.
- [ ] All public queries read the same shape that sync writes.
- [ ] Partial failures are itemized and non-destructive.
- [ ] Rate-limit or token-refresh failures produce recoverable error states.
- [ ] No fake zero values are used where data is actually unknown or missing.
- [ ] Top-level bike summary fields and nested activity summary remain consistent if both are stored.
- [ ] Callback, import, sync, disconnect, and settings UI all have focused automated tests.
- [ ] `npm run typecheck` and relevant test suites pass.

### UX acceptance

- [ ] The bike overview is scannable on desktop and mobile.
- [ ] Loading, empty, partial-failure, and success states are all intentional and distinct.
- [ ] Shared UI primitives from the local Prototyper UI wrapper layer are used consistently.
- [ ] The flow avoids raw backend language such as `gear_id`, `syncErrorMessage`, or `fallback_pending_confirmation` in user-facing copy.
- [ ] Inferred context is explainable in plain language.

### Quality control acceptance

- [ ] A dedicated quality-control review is completed before closeout.
- [ ] Quality-control review includes both code quality and UX review.
- [ ] Quality-control review explicitly verifies Prototyper UI usage and consistency.
- [ ] Quality-control review explicitly verifies accessibility basics for settings interactions.

## Success Criteria

### Functional success

- A newly connected user can understand their available Strava bikes in under 10 seconds.
- A user can import their primary bike in one pass without manual cleanup.
- Re-running sync does not create duplicate bikes or duplicate activities.
- Low-use reminders and bike-usage UI read correct synced metrics.
- Imported bikes can be prioritized for fit work based on readiness and usage.

### Experience success

- The overview helps users choose the right bike for a fit session.
- The user sees immediate value from Strava even before starting a new fit.
- The import flow feels safe because it is explicit about what will be imported and what remains user-controlled.
- The imported-bike experience creates a clear next action instead of ending at a data dump.

### Technical success

- Sync remains idempotent.
- Disconnect removes Strava-derived activity state cleanly.
- Derived bike context is explainable and bounded.

### Measurable success

- At least one imported bike can be completed from connect to fit-ready without manual database cleanup.
- Exact gear-match behavior is validated by automated tests for the main sync path.
- No known query/contract mismatch remains between sync writers and UI readers.

## Additional Ideas For BestBikeFit4U

- Bike readiness score:
  show which imported bikes are fit-ready versus missing key setup data such as frame size, saddle height, or crank length.

- Smart default bike selection:
  pre-select the most-used recent bike as the default bike for new fit sessions and pressure calculations.

- Fit drift prompts:
  if a bike suddenly shifts from long endurance rides to short intense rides, prompt the user to review posture bias and pressure setup.

- Multi-bike comparison:
  compare imported bikes by usage, role, and fit completeness so riders can decide which bike to optimize first.

- Ride-type-aware fit framing:
  phrase recommendations as "best for long gravel days" or "best for short fast road rides" using the synced bike role.

- Trust indicators:
  expose why a role was inferred, for example `12 rides, average 68 km, low trainer ratio, dominant GravelRide`.

- Guided post-import checklist:
  after import, offer a focused checklist for the selected bike so the user can move directly from Strava data to a fit-ready setup.

- Most-used-bike quick start:
  if one bike clearly dominates recent usage, offer `Start fit for this bike` directly from the Strava overview.

- Staleness notice:
  if there are no rides in the last 30-45 days, explain that riding-context advice may be stale.
