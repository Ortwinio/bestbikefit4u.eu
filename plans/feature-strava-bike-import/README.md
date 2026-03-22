# Strava Bike Import & Usage Enrichment — Feature Plan

**Status:** Implemented
**Target:** v1 = bike import foundation | v1.1 = activity enrichment | v2 = fit intelligence

---

## Plan Audit

### Assessment

The original plan is directionally good, but not yet strong enough to execute without ambiguity.

Main findings:
- The plan has overlapping step definitions: `02-import-ui.md` and `02-settings-ui.md` describe the same surface with different assumptions.
- The riskier parts of the feature are under-specified: token refresh failure, partial import failure, rate limits, idempotency, and protection of user-corrected fields.
- Acceptance criteria are too shallow. They prove UI presence, but not sync correctness.
- The activity-import plan does not clearly define behavior for activities without `gear_id`, unmatched `gear_id`, or repeated incremental sync.
- v2 fit intelligence lacks a requirement that recommendation changes stay bounded and explainable.
- There was no real test plan.

### Improvements Applied

- Added explicit delivery rules and source-of-truth rules.
- Clarified canonical step ownership: `02-import-ui.md` is the primary v1 UI prompt; `02-settings-ui.md` is legacy overlap.
- Rewrote acceptance criteria to validate correctness, idempotency, and safety.
- Added a dedicated test plan at [05-test-plan.md](./05-test-plan.md).

### Implementation Status

- v1 shipped:
  - Strava token refresh is server-side.
  - athlete bike summary is cached in `integrations.stravaGearSummaryJson`.
  - imported bikes are idempotent on `stravaGearId`.
  - unknown `frame_type` now uses a safe provisional `hybrid` type with `bikeTypeSource = "fallback_pending_confirmation"` and `needsTypeConfirmation = true`, preserving the current app contract while forcing correction.
- v1.1 shipped:
  - recent Strava ride activities are normalized into `bikeActivities`.
  - bikes receive usage summaries, inferred role, and activity summary metadata.
- v2 shipped as advisory integration:
  - fit start and recommendation generation consume bike-role advisory context.
  - low-use reminder cron is wired through `convex/crons.ts`.

### Verification Completed

- `npm run typecheck`
- `npx vitest run src/components/settings/StravaBikeImportSection.test.ts convex/integrations/__tests__/*.test.ts convex/recommendations/__tests__/bikeRoleBias.test.ts convex/recommendations/__tests__/actions.advisory.test.ts convex/recommendations/__tests__/generate.mapping.integration.test.ts convex/sessions/__tests__/create.contract.test.ts`
- `npm run build:vercel`

---

## Goal

When a user connects Strava, BestBikeFit4U should:

1. Import their bikes automatically (brand, model, type, nickname, primary flag, lifetime distance)
2. Enrich those bikes with ride-usage signals from recent activities
3. Use bike-linked activity history to improve setup advice per bike
4. Ask only for the data Strava cannot provide (frame size, model year, geometry, components, current setup)

This reduces onboarding friction and gives the fit engine bike-specific context that manual entry rarely captures.

---

## Delivery Rules

- All Strava writes must be idempotent.
- User-entered bike fields always beat imported fields unless explicitly marked sync-owned.
- Token refresh must happen server-side before Strava API calls.
- Strava API failures must degrade gracefully:
  - connect remains valid if bike fetch fails
  - partial gear import failures surface itemized feedback
  - rate-limit failures abort safely and tell the user to retry later
- Activities without a resolvable bike may be stored, but must not pollute per-bike summaries.
- Bike-role fit intelligence is advisory only. It may bias recommendation envelopes, but must never override measurement-driven logic.

## Source Of Truth

| Field / behavior | Source of truth |
|---|---|
| `stravaGearId`, `stravaPrimary`, lifetime distance | Strava sync-owned |
| `bikeType` when `bikeTypeSource = "user"` | User-owned |
| model year, frame size, geometry source | User-owned |
| `inferredBikeRole`, recent usage stats | BestBikeFit4U derived |
| final fit recommendation | Fit engine with imported usage as advisory input |

---

## Background

Strava's athlete endpoint returns a `bikes[]` array. The gear endpoint returns richer bike detail per ID. Activity summaries include `gear_id`, `sport_type`, ride metrics, and a `trainer` flag — enough to map ride usage back to a specific bike and classify its role.

What Strava does **not** provide (must be collected from the user):
- Frame size / model year
- Stack / reach geometry
- Saddle height, setback, tilt
- Stem length, handlebar reach/drop
- Crank length, cleat position

The import flow is therefore: **Strava provides bike identity and ride context → BestBikeFit4U turns that into bike-specific fit intelligence.**

---

## Scope by release

### v1 — Bike import foundation
- OAuth already done; add token refresh before every API call
- Fetch athlete profile → detect bikes
- Fetch detailed gear per bike via `/gear/{id}`
- Create/update bike records (idempotent on `stravaGearId`)
- Map `frame_type` → `bikeType` with a `bikeTypeSource` field
- Store lifetime distance from Strava
- Show import review UI with already-imported detection
- Post-import wizard: confirm/correct type, add model year, frame size, geometry source

### v1.1 — Activity enrichment
- Import recent activities (last 90 / 180 days) from `/athlete/activities`
- Link each activity to a bike via `gear_id`
- Calculate per-bike usage metrics: ride count, recent distance, avg duration, climbing ratio, indoor ratio, dominant sport type
- Infer a bike role (endurance, race, gravel, MTB, TT, training) from usage patterns
- Store per-bike usage summaries for display and fit engine consumption

### v2 — Fit intelligence
- Feed bike type, role, and usage profile into fit profile selection
- Terrain bias inference (climbing load, indoor ratio, sport mix)
- Detect low-use bikes and prompt setup review
- Bias fit recommendations based on bike role:
  - High climbing load → stability and comfort
  - Short intense road rides → performance bias
  - Indoor trainer-heavy → indoor fit profile option

---

## Strava API reference

### Athlete endpoint — bike list
`GET /api/v3/athlete` → `bikes: SummaryGear[]`
```json
{ "id": "b1234567", "primary": true, "name": "My Road Bike", "distance": 3255475 }
```

### Gear detail
`GET /api/v3/gear/{id}` (requires `read` scope — already granted)
```json
{
  "id": "b1234567", "primary": true, "name": "My Road Bike",
  "brand_name": "Specialized", "model_name": "Tarmac SL7",
  "frame_type": 3, "description": "Race build", "distance": 3255475
}
```

### Activities
`GET /api/v3/athlete/activities` → `SummaryActivity[]`

Key fields for bike enrichment:
`gear_id`, `sport_type`, `distance`, `moving_time`, `total_elevation_gain`,
`trainer`, `commute`, `average_speed`, `max_speed`, `average_cadence`,
`average_watts`, `average_heartrate`, `device_name`, `start_date`

### Rate limits
200 req / 15 min · 2 000 req / day. Keep sync light: one athlete call, one gear call per bike, paginated activity batches.

### `frame_type` → `bikeType` mapping

| Strava `frame_type` | `bikeType`       | `bikeTypeSource`          |
|---------------------|------------------|---------------------------|
| 1                   | `mountain`       | `strava_frame_type`       |
| 2                   | `cyclocross`     | `strava_frame_type`       |
| 3                   | `road`           | `strava_frame_type`       |
| 4                   | `tt_triathlon`   | `strava_frame_type`       |
| null / unknown      | `hybrid` (provisional) | `fallback_pending_confirmation` |

Unknown frame type → use a provisional `hybrid` type and set `needsTypeConfirmation = true`. This preserves the current bike/session contract while still surfacing the ambiguity to the user.

---

## Data model

### `bikes` table additions

```ts
source: v.union(v.literal("manual"), v.literal("strava"), v.literal("admin_import")),
stravaGearId: v.optional(v.string()),
stravaPrimary: v.optional(v.boolean()),
bikeTypeSource: v.optional(v.union(
  v.literal("user"),
  v.literal("strava_frame_type"),
  v.literal("inferred_from_usage"),
  v.literal("admin_matched")
)),
lifetimeDistanceMeters: v.optional(v.number()),
recentDistance90dMeters: v.optional(v.number()),
rideCount90d: v.optional(v.number()),
inferredBikeRole: v.optional(v.union(
  v.literal("endurance_road"),
  v.literal("race_road"),
  v.literal("gravel"),
  v.literal("mountain"),
  v.literal("tt_triathlon"),
  v.literal("training"),
  v.literal("commute")
)),
lastStravaSync: v.optional(v.number()),
```

Index: `.index("by_strava_gear", ["stravaGearId"])`

### New table: `bikeActivities`

```ts
bikeActivities: defineTable({
  userId: v.id("users"),
  bikeId: v.optional(v.id("bikes")),
  stravaActivityId: v.string(),
  stravaGearId: v.optional(v.string()),
  name: v.string(),
  sportType: v.string(),
  startDate: v.number(),
  distanceMeters: v.number(),
  movingTimeSec: v.number(),
  elapsedTimeSec: v.number(),
  elevationGainMeters: v.optional(v.number()),
  trainer: v.boolean(),
  commute: v.boolean(),
  deviceName: v.optional(v.string()),
  averageSpeed: v.optional(v.number()),
  maxSpeed: v.optional(v.number()),
  averageCadence: v.optional(v.number()),
  averageWatts: v.optional(v.number()),
  weightedAverageWatts: v.optional(v.number()),
  averageHeartrate: v.optional(v.number()),
  maxHeartrate: v.optional(v.number()),
  importedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_bike", ["bikeId"])
  .index("by_strava_id", ["stravaActivityId"])
  .index("by_gear", ["stravaGearId"])
```

### `integrations` additions

```ts
stravaGearSummaryJson: v.optional(v.string()),  // cached bikes[] from athlete endpoint
lastActivitySyncAt: v.optional(v.number()),     // for incremental activity import
```

---

## Idempotency rules

- Bikes: unique on `(userId, stravaGearId)` — skip on re-import
- Activities: unique on `(userId, stravaActivityId)` — upsert on incremental sync
- User-corrected fields (bikeType when `bikeTypeSource = "user"`) must never be overwritten by sync

## Missing-Data Rules

- Unknown `frame_type` must trigger user confirmation and must not silently default to `road`.
- If one selected gear fetch fails, the other selected bikes still import successfully.
- Activities without `gear_id` may be stored with no `bikeId`, but must not affect bike summaries.
- Activities linked to a Strava `gear_id` that has not been imported must not be attached to the wrong bike.

---

## Product flow

```
1. Connect Strava (done)
         ↓
2. Fetch athlete + bikes list → store stravaGearSummaryJson
         ↓
3. Show import review screen
   [nickname | brand | model | detected type | distance | primary | status]
         ↓
4. User selects bikes → fetch /gear/{id} per bike → create bike records
         ↓
5. Post-import wizard: confirm type, add year/frame size, geometry source
         ↓
6. (v1.1) Import recent activities → link to bikes → compute usage metrics
         ↓
7. (v2) Infer bike role → feed into fit engine
```

---

## Implementation prompts

| # | File | What it implements |
|---|---|---|
| 01 | `01-schema-and-backend.md` | Schema additions (bikes, bikeActivities, integrations), token refresh helper, gear fetch action, idempotent bike upsert |
| 02 | `02-import-ui.md` | Canonical v1 import review UI + post-import wizard in Settings; i18n en + nl |
| 02-legacy | `02-settings-ui.md` | Legacy overlap; reference only unless explicitly consolidated |
| 03 | `03-activity-import.md` | Activity fetch action, pagination, bike linkage, per-bike usage summary mutations, bike role inference |
| 04 | `04-fit-intelligence.md` | Feed bike role + usage profile into fit engine; terrain/load bias; low-use detection |
| 05 | `05-test-plan.md` | Test strategy and release gates |

---

## Acceptance criteria

### v1
- [ ] Connected Strava users with bike data see an import section in Settings with clear imported vs. unimported state.
- [ ] Import creates or updates bike records idempotently on `(userId, stravaGearId)` with:
  - `source = "strava"`
  - `stravaGearId`
  - `stravaPrimary`
  - lifetime distance
  - `bikeType` only when Strava mapping is known
  - correct `bikeTypeSource`
- [ ] Re-running the same import does not create duplicate bikes.
- [ ] Unknown `frame_type` leaves `bikeType` unset and triggers user confirmation instead of defaulting silently.
- [ ] Expired or near-expiry tokens are refreshed before Strava API calls and refreshed credentials are persisted.
- [ ] Partial gear-fetch failure does not invalidate the entire import; failed bikes are surfaced explicitly.
- [ ] Post-import flow captures year, frame size, and geometry source.
- [ ] User-corrected `bikeType` sets `bikeTypeSource = "user"` and survives later Strava sync.
- [ ] Disconnecting Strava does not delete already imported local bikes.
- [ ] `npm run typecheck` passes

### v1.1
- [ ] User can trigger recent-ride import for an explicit window (`90` or `180` days).
- [ ] Activities are upserted idempotently on `(userId, stravaActivityId)`.
- [ ] Activities with `gear_id` are linked to the correct imported bike.
- [ ] Activities without a resolvable bike never corrupt per-bike summaries.
- [ ] Per-bike stats include at least: ride count, recent distance, average duration, last used, trainer ratio, and dominant sport type.
- [ ] Bike role is inferred, stored, and surfaced in the product UI.
- [ ] Incremental sync only fetches newer activities since `lastActivitySyncAt`.
- [ ] Pagination and rate-limit failure paths are handled safely.

### v2
- [ ] Fit engine reads imported usage context from the selected bike record.
- [ ] Recommendation envelopes differ meaningfully between at least endurance, race, and gravel roles for the same rider inputs.
- [ ] Usage modifiers such as climbing load, indoor ratio, and low-use state affect guidance in bounded, explainable ways.
- [ ] Low-use bike detection produces the intended dashboard message without duplicate spam.

---

## Validation

The feature is not complete until the relevant release slice satisfies the test plan in [05-test-plan.md](./05-test-plan.md).
