# Strava Bike Import & Usage Enrichment — Feature Plan

**Status:** Planning
**Target:** v1 = bike import foundation | v1.1 = activity enrichment | v2 = fit intelligence

---

## Goal

When a user connects Strava, BestBikeFit4U should:

1. Import their bikes automatically (brand, model, type, nickname, primary flag, lifetime distance)
2. Enrich those bikes with ride-usage signals from recent activities
3. Use bike-linked activity history to improve setup advice per bike
4. Ask only for the data Strava cannot provide (frame size, model year, geometry, components, current setup)

This reduces onboarding friction and gives the fit engine bike-specific context that manual entry rarely captures.

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
| null / unknown      | _(unset)_        | —                         |

Unknown frame type → leave `bikeType` unset and prompt the user. Do not default to `road` in the database — that hides misclassifications.

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
| 02 | `02-import-ui.md` | Import review modal + post-import wizard in Settings; i18n en + nl |
| 03 | `03-activity-import.md` | Activity fetch action, pagination, bike linkage, per-bike usage summary mutations, bike role inference |
| 04 | `04-fit-intelligence.md` | Feed bike role + usage profile into fit engine; terrain/load bias; low-use detection |

---

## Acceptance criteria

### v1
- [ ] Bikes found on Strava are listed in the Settings import UI
- [ ] Import creates records with name, brand, model, bikeType + bikeTypeSource, lifetime distance, stravaGearId
- [ ] Already-imported bikes show "Already added" and are not duplicated
- [ ] Unknown frame type leaves bikeType unset and prompts the user
- [ ] Expired tokens are refreshed before every Strava call
- [ ] Post-import wizard collects year, frame size, and geometry source
- [ ] User-corrected bikeType sets `bikeTypeSource = "user"` and is never overwritten
- [ ] `npm run typecheck` passes

### v1.1
- [ ] User can trigger "Import recent rides" (last 90 / 180 days)
- [ ] Activities are linked to the correct bike via `gear_id`
- [ ] Per-bike stats show: ride count, recent distance, avg duration, last used
- [ ] Bike role is inferred and surfaced on the bike detail page
- [ ] Incremental sync only fetches new activities since `lastActivitySyncAt`

### v2
- [ ] Fit engine reads `inferredBikeRole` and `recentDistance90dMeters` from the bike record
- [ ] Recommendations differ meaningfully between an endurance bike and a race bike for the same rider
