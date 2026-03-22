# Step 03 — Activity Import & Usage Enrichment (v1.1)

## Goal

Import recent ride activities from Strava, link them to imported bikes via `gear_id`, calculate per-bike usage metrics (ride count, distance, avg trip size, top speed, average speed), and infer a bike role from usage patterns.

---

## Pre-requisites

- Step 01 and 02 complete
- `bikeActivities` table exists in schema
- Bikes are imported and have `stravaGearId` set

---

## 1. Activity import action

Create `convex/integrations/actions.ts` addition: `syncStravaActivities`

```ts
export const syncStravaActivities = action({
  args: {
    windowDays: v.union(v.literal(90), v.literal(180)),
  },
  handler: async (ctx, { windowDays }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const accessToken = await getFreshStravaToken(ctx, userId);

    // Get the last sync timestamp for incremental sync
    const integration = await ctx.runQuery(
      internal.integrations.queries.getStravaIntegrationForUser,
      { userId }
    );
    const afterTs = integration?.lastActivitySyncAt
      ? Math.floor(integration.lastActivitySyncAt / 1000)
      : Math.floor((Date.now() - windowDays * 24 * 60 * 60 * 1000) / 1000);

    let page = 1;
    let totalImported = 0;

    while (true) {
      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?after=${afterTs}&page=${page}&per_page=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) break;

      const activities = (await res.json()) as StravaActivity[];
      if (activities.length === 0) break;

      // Only import ride-type activities
      const rides = activities.filter(
        (a) => a.sport_type === "Ride" || a.sport_type === "VirtualRide" ||
                a.sport_type === "GravelRide" || a.sport_type === "MountainBikeRide" ||
                a.sport_type === "EMountainBikeRide" || a.sport_type === "EBikeRide"
      );

      for (const activity of rides) {
        await ctx.runMutation(internal.integrations.mutations.upsertBikeActivity, {
          userId,
          activity,
        });
        totalImported++;
      }

      if (activities.length < 50) break;
      page++;
    }

    // Update lastActivitySyncAt
    await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
      userId,
      fields: { lastActivitySyncAt: Date.now() },
    });

    // Recompute usage summaries for all bikes
    await ctx.runMutation(internal.integrations.mutations.recomputeBikeUsageSummaries, {
      userId,
    });

    return { imported: totalImported };
  },
});
```

### Strava activity type

```ts
interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  trainer: boolean;
  commute: boolean;
  gear_id?: string;
  device_name?: string;
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  average_heartrate?: number;
  max_heartrate?: number;
}
```

---

## 2. Internal mutation — upsert activity

In `convex/integrations/mutations.ts`:

```ts
export const upsertBikeActivity = internalMutation({
  args: {
    userId: v.id("users"),
    activity: v.any(), // typed via StravaActivity at callsite
  },
  handler: async (ctx, { userId, activity }) => {
    const stravaActivityId = String(activity.id);

    // Look up the local bikeId from the gear_id
    let bikeId: Id<"bikes"> | undefined;
    if (activity.gear_id) {
      const bike = await ctx.db
        .query("bikes")
        .withIndex("by_strava_gear", (q) => q.eq("stravaGearId", activity.gear_id))
        .unique();
      bikeId = bike?._id;
    }

    const existing = await ctx.db
      .query("bikeActivities")
      .withIndex("by_strava_id", (q) => q.eq("stravaActivityId", stravaActivityId))
      .unique();

    const record = {
      userId,
      bikeId,
      stravaActivityId,
      stravaGearId: activity.gear_id ?? undefined,
      name: activity.name,
      sportType: activity.sport_type,
      startDate: new Date(activity.start_date).getTime(),
      distanceMeters: activity.distance,
      movingTimeSec: activity.moving_time,
      elapsedTimeSec: activity.elapsed_time,
      elevationGainMeters: activity.total_elevation_gain ?? undefined,
      trainer: activity.trainer,
      commute: activity.commute,
      deviceName: activity.device_name ?? undefined,
      averageSpeed: activity.average_speed ?? undefined,  // m/s
      maxSpeed: activity.max_speed ?? undefined,           // m/s
      averageCadence: activity.average_cadence ?? undefined,
      averageWatts: activity.average_watts ?? undefined,
      weightedAverageWatts: activity.weighted_average_watts ?? undefined,
      averageHeartrate: activity.average_heartrate ?? undefined,
      maxHeartrate: activity.max_heartrate ?? undefined,
      importedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, record);
    } else {
      await ctx.db.insert("bikeActivities", record);
    }
  },
});
```

---

## 3. Internal mutation — recompute usage summaries

In `convex/integrations/mutations.ts`:

```ts
export const recomputeBikeUsageSummaries = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const now = Date.now();
    const cutoff90d = now - 90 * 24 * 60 * 60 * 1000;

    // Get all bike activities for this user in the last 90 days
    const activities = await ctx.db
      .query("bikeActivities")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const recent = activities.filter((a) => a.startDate >= cutoff90d);

    // Group by bikeId
    const byBike = new Map<string, typeof recent>();
    for (const a of recent) {
      if (!a.bikeId) continue;
      const key = a.bikeId as string;
      if (!byBike.has(key)) byBike.set(key, []);
      byBike.get(key)!.push(a);
    }

    // Update each bike's usage fields
    for (const [bikeId, rides] of byBike) {
      const totalDistance = rides.reduce((s, r) => s + r.distanceMeters, 0);
      const rideCount = rides.length;
      const avgDuration = rideCount
        ? rides.reduce((s, r) => s + r.movingTimeSec, 0) / rideCount
        : 0;
      const avgSpeed = rides
        .filter((r) => r.averageSpeed)
        .reduce((s, r, _, arr) => s + (r.averageSpeed ?? 0) / arr.length, 0);
      const maxSpeed = Math.max(...rides.map((r) => r.maxSpeed ?? 0));
      const trainerRatio = rideCount
        ? rides.filter((r) => r.trainer).length / rideCount
        : 0;
      const dominantSport = mostCommon(rides.map((r) => r.sportType));

      const inferredRole = inferBikeRole({
        rides,
        trainerRatio,
        dominantSport,
        avgSpeed,
      });

      await ctx.db.patch(bikeId as Id<"bikes">, {
        recentDistance90dMeters: totalDistance,
        rideCount90d: rideCount,
        inferredBikeRole: inferredRole,
        lastStravaSync: now,
        // Surface avg trip size as notes or separate field — store in usage summary
      });
    }
  },
});

function mostCommon(arr: string[]): string {
  const counts = new Map<string, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Ride";
}

function inferBikeRole({
  rides,
  trainerRatio,
  dominantSport,
  avgSpeed,
}: {
  rides: { distanceMeters: number; movingTimeSec: number; elevationGainMeters?: number }[];
  trainerRatio: number;
  dominantSport: string;
  avgSpeed: number;
}): "endurance_road" | "race_road" | "gravel" | "mountain" | "tt_triathlon" | "training" | "commute" | undefined {
  if (trainerRatio > 0.6) return "training";
  if (dominantSport === "MountainBikeRide" || dominantSport === "EMountainBikeRide") return "mountain";
  if (dominantSport === "GravelRide") return "gravel";
  const avgDistKm = rides.reduce((s, r) => s + r.distanceMeters, 0) / rides.length / 1000;
  const avgSpeedKmh = avgSpeed * 3.6;
  if (avgSpeedKmh > 34 && avgDistKm < 80) return "race_road";
  if (avgDistKm > 100) return "endurance_road";
  if (avgDistKm < 25 && trainerRatio < 0.1) return "commute";
  return "endurance_road"; // safe fallback
}
```

---

## 4. Public query — bike usage stats

In `convex/bikes/queries.ts`:

```ts
export const getBikeUsageStats = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, { bikeId }) => {
    await requireBikeOwner(ctx, bikeId);

    const activities = await ctx.db
      .query("bikeActivities")
      .withIndex("by_bike", (q) => q.eq("bikeId", bikeId))
      .collect();

    if (activities.length === 0) return null;

    const now = Date.now();
    const cutoff90d = now - 90 * 24 * 60 * 60 * 1000;
    const recent = activities.filter((a) => a.startDate >= cutoff90d);

    const totalDistanceKm = recent.reduce((s, a) => s + a.distanceMeters, 0) / 1000;
    const rideCount = recent.length;
    const avgTripKm = rideCount ? totalDistanceKm / rideCount : 0;
    const avgSpeedKmh = recent
      .filter((a) => a.averageSpeed)
      .reduce((s, a, _, arr) => s + ((a.averageSpeed ?? 0) * 3.6) / arr.length, 0);
    const topSpeedKmh = Math.max(...recent.map((a) => (a.maxSpeed ?? 0) * 3.6));
    const lastUsedAt = Math.max(...activities.map((a) => a.startDate));

    return {
      rideCount90d: rideCount,
      totalDistanceKm90d: Math.round(totalDistanceKm),
      avgTripKm: Math.round(avgTripKm * 10) / 10,
      avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
      topSpeedKmh: Math.round(topSpeedKmh * 10) / 10,
      lastUsedAt,
    };
  },
});
```

---

## 5. UI — Settings trigger

Add a "Import recent rides" button to the Strava section in Settings, below the bike list:

```tsx
<Button
  variant="outline"
  onClick={() => void handleSyncActivities()}
  isLoading={isSyncingActivities}
>
  {messages.settings.integrations.bikeImport.syncRides}
</Button>
```

Show the result as a toast: "Imported 47 rides across 3 bikes."

---

## 6. UI — Bike detail usage card

On the bike detail / edit page, if usage stats exist, show a compact stats row:

```
┌─ Ride usage (last 90 days) ─────────────────────────┐
│  23 rides   1 240 km   Avg trip 53.9 km             │
│  Avg speed 27.4 km/h   Top speed 58.1 km/h          │
│  Last ridden: 3 days ago                             │
│  Inferred role: Endurance road                       │
└──────────────────────────────────────────────────────┘
```

Use the `getBikeUsageStats` query. If `null`, show nothing (no empty state needed — simply omit the card).

---

## 7. i18n strings additions

Add to `integrations.bikeImport` in `en.ts`:

```ts
syncRides: "Import recent rides",
syncRidesSuccess: "Imported {count} rides from Strava.",
usageTitle: "Ride usage (last 90 days)",
rides: "{count} rides",
avgTrip: "Avg trip",
avgSpeed: "Avg speed",
topSpeed: "Top speed",
lastRidden: "Last ridden",
inferredRole: "Inferred role",
```

Dutch in `nl.ts` (translate accordingly).

---

## Acceptance criteria

- [ ] `syncStravaActivities` action imports rides (last 90 / 180 days selectable)
- [ ] Incremental sync uses `lastActivitySyncAt` — only fetches new rides
- [ ] Activities are linked to bikes via `gear_id` → `stravaGearId` lookup
- [ ] Per-bike metrics computed: ride count, distance, avg trip, avg speed, top speed, last used
- [ ] Bike role inferred and stored on the bike record
- [ ] Usage card appears on bike detail page when data is available
- [ ] Unit conversions correct: Strava returns meters/second, display in km/h
- [ ] `npm run typecheck` passes
