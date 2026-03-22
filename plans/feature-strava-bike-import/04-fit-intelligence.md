# Step 04 — Fit Intelligence (v2)

## Goal

Feed the imported bike type, inferred role, and activity usage profile into the fit engine so that recommendations differ meaningfully between an endurance bike and a race bike for the same rider, and between a high-climbing road rider and a flat-terrain commuter.

---

## Pre-requisites

- Steps 01–03 complete
- Bikes have `bikeType`, `bikeTypeSource`, `inferredBikeRole`, `rideCount90d`, `recentDistance90dMeters` populated
- Fit engine reads the selected bike's properties at recommendation time

---

## 1. Fit profile selection by bike role

When a fit session is started with a specific bike, read the bike's `inferredBikeRole` and adjust the fit profile defaults:

| `inferredBikeRole`  | Fit bias |
|---------------------|----------|
| `race_road`         | Lower stack, more reach, aggressive saddle position |
| `endurance_road`    | Moderate stack/reach, neutral saddle |
| `gravel`            | Wider bar, relaxed reach, comfort-forward |
| `mountain`          | Upright, short stem, stable position |
| `tt_triathlon`      | Aero position, dedicated TT fit profile |
| `training`          | Indoor fit: emphasis on comfort and knee safety |
| `commute`           | Maximum comfort, upright posture |

Implement as a lookup table in `convex/fit/bikeRoleBias.ts`:

```ts
export type FitBias = {
  stackBias: "aggressive" | "neutral" | "comfort";
  reachBias: "aggressive" | "neutral" | "comfort";
  saddleBias: "low" | "neutral" | "high";
  handlebarDropBias: "drops" | "neutral" | "flat";
};

export const BIKE_ROLE_BIAS: Record<string, FitBias> = {
  race_road:      { stackBias: "aggressive", reachBias: "aggressive", saddleBias: "low",     handlebarDropBias: "drops"   },
  endurance_road: { stackBias: "neutral",    reachBias: "neutral",    saddleBias: "neutral",  handlebarDropBias: "neutral" },
  gravel:         { stackBias: "comfort",    reachBias: "neutral",    saddleBias: "neutral",  handlebarDropBias: "flat"    },
  mountain:       { stackBias: "comfort",    reachBias: "comfort",    saddleBias: "high",     handlebarDropBias: "flat"    },
  tt_triathlon:   { stackBias: "aggressive", reachBias: "aggressive", saddleBias: "low",      handlebarDropBias: "drops"   },
  training:       { stackBias: "comfort",    reachBias: "comfort",    saddleBias: "high",     handlebarDropBias: "flat"    },
  commute:        { stackBias: "comfort",    reachBias: "comfort",    saddleBias: "high",     handlebarDropBias: "flat"    },
};
```

---

## 2. Activity load bias

Use per-bike usage metrics to further bias recommendations:

### High climbing load
`avgElevationPer100km > 800m` → increase stability bias, slightly raise saddle recommendation

### Indoor trainer-heavy
`trainerRatio > 0.5` → suggest indoor fit profile option, flag that outdoor and indoor positions may differ

### Low-use bike
`rideCount90d < 3` → show prompt: "You haven't ridden this bike recently. Your fit may have changed since last measurement."

### Long steady rides
`avgTripKm > 80` → comfort and endurance bias

### Short intense rides
`avgTripKm < 40 && avgSpeedKmh > 32` → performance and aerodynamic bias

Implement these as a `deriveFitModifiers(bike, usageStats)` function called from the fit session creation flow.

---

## 3. Fit session integration

When creating a fit session linked to a bike:

1. Read bike's `bikeType`, `inferredBikeRole`
2. Call `getBikeUsageStats` for the bike
3. Compute fit modifiers via `deriveFitModifiers`
4. Pass modifiers to the fit engine alongside body measurements

The fit engine should treat these as advisory signals, not hard overrides. The rider's body measurements remain primary; the bike role adjusts the recommendation envelope.

---

## 4. UI — Fit session bike selector

On the `/fit` session start page, when a user has multiple bikes:

- Show all bikes as selectable cards
- For bikes with usage data, show: `inferredBikeRole` label + last-used date
- For bikes without usage data, show: `bikeType` label only
- Selecting a bike shows a hint: "Fit recommendations will be tuned for your {role} setup."

---

## 5. UI — Bike detail fit insight

On the bike detail page, below the usage stats card, add a "Fit insight" row:

```
┌─ Fit profile ───────────────────────────────────────┐
│  Inferred role: Endurance road                      │
│  Fit bias: Neutral stack · Moderate reach           │
│  Based on: 23 rides, avg 53.9 km, low climbing      │
│                                                      │
│  [Start fit session with this bike]                 │
└──────────────────────────────────────────────────────┘
```

Show the bias labels from `BIKE_ROLE_BIAS` in human-readable form.

---

## 6. Low-use detection

Run a scheduled Convex cron (weekly) that:
- Finds bikes with `rideCount90d < 3` and at least one completed fit session
- Creates a `dashboard_messages` record: "You haven't ridden your {bike name} in a while. Your fit may need a check."

This reuses the existing `dashboard_messages` table from the admin panel schema.

---

## Acceptance criteria

- [ ] Fit sessions created with a bike read `inferredBikeRole` from the bike record
- [ ] `BIKE_ROLE_BIAS` lookup modifies fit recommendation output for race vs. endurance vs. gravel bikes
- [ ] Activity load modifiers (climbing, indoor ratio, avg trip) further adjust recommendations
- [ ] Low-use bike detection runs on a schedule and creates dashboard messages
- [ ] Fit session bike selector shows role label for bikes with usage data
- [ ] Bike detail page shows "Fit insight" card with role and bias summary
- [ ] `npm run typecheck` passes
