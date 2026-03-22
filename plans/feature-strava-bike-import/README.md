# Strava Bike Import — Feature Plan

**Status:** Planning
**Target:** v1

---

## Goal

Let users import the bikes they have registered in Strava directly into BestBikeFit4U, so they can immediately start fit sessions without manually re-entering bike details.

---

## Background

Strava stores a user's equipment (bikes) on their athlete profile. When a user connects Strava, we already fetch and store their access token and athlete ID. We can use the Strava API to list their bikes and fetch detailed gear info (brand, model, frame type), then map that into our `bikes` table.

This removes friction for users who already maintain their fleet in Strava. Imported bikes are owned by the user and editable after import — the Strava record is the source of truth only at import time.

---

## Scope

### In scope

- List bikes from the connected Strava account (via `/api/v3/athlete` → `bikes[]`)
- Fetch detailed gear per bike (via `/api/v3/gear/{id}` → brand, model, frame type)
- Map Strava `frame_type` to our `bikeType` union
- Detect already-imported bikes (by `stravaGearId`) and skip or show as "already added"
- Token refresh before API call if the stored token has expired
- Import UI in the Settings page Strava section (or Bikes page — see §UI)
- i18n: English + Dutch strings for all new UI text

### Out of scope (v1)

- Automatic re-sync when Strava bike list changes
- Importing Strava activity data per bike (mileage, ride count)
- Syncing edits back to Strava
- Importing accessories / shoes (non-bike gear)

---

## Strava API reference

### Athlete bikes list (already fetched on connect)

`GET https://www.strava.com/api/v3/athlete`

Returns `bikes: SummaryGear[]` on the athlete object:

```json
{
  "bikes": [
    {
      "id": "b1234567",
      "primary": true,
      "name": "My Road Bike",
      "distance": 3255475,
      "resource_state": 2
    }
  ]
}
```

### Detailed gear

`GET https://www.strava.com/api/v3/gear/{id}` (requires `read` scope — already granted)

```json
{
  "id": "b1234567",
  "primary": true,
  "name": "My Road Bike",
  "distance": 3255475,
  "brand_name": "Specialized",
  "model_name": "Tarmac SL7",
  "frame_type": 3,
  "description": "Race build"
}
```

### `frame_type` → `bikeType` mapping

| Strava `frame_type` | Our `bikeType`    |
|---------------------|-------------------|
| 1                   | `mountain`        |
| 2                   | `cyclocross`      |
| 3                   | `road`            |
| 4                   | `tt_triathlon`    |
| _(unknown / null)_  | `road` (fallback) |

---

## Implementation prompts

| # | File | What it implements |
|---|---|---|
| 01 | `01-schema-and-backend.md` | Schema addition (`stravaGearId`), token refresh helper, `listStravaBikes` query, `importBikesFromStrava` action, `createBikeFromStrava` internal mutation |
| 02 | `02-settings-ui.md` | "Import bikes from Strava" UI in Settings page: list available/already-imported bikes, import selected, i18n strings |

---

## Acceptance criteria

- [ ] User with an active Strava connection sees their Strava bikes listed in Settings
- [ ] Bikes already imported are shown as "Already added" (not re-importable)
- [ ] Selecting and importing bikes creates records in the `bikes` table with correct name, brand, model, and bikeType
- [ ] Expired access tokens are refreshed transparently before the API call
- [ ] Importing an already-imported bike (by stravaGearId) is a no-op (idempotent)
- [ ] No Strava connection → import UI is not shown
- [ ] `npm run typecheck` passes
