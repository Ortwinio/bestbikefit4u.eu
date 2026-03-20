# Step 03 — Ride Ingestion and Terrain Inference (Phase 2)

## Goal

Implement the `importRecentRides` Convex action (currently a placeholder that throws). Import the last 90 days of cycling activities from Strava, compute a riding profile, and store it for use in tire pressure and fit recommendations.

## Pre-requisites

- Phase 1 complete (OAuth working, tokens stored)
- `stravaActivities` table added to schema (see README section G)
- `ridingProfileJson` field already in `integrations` schema

## 1. Token refresh helper

Add to `convex/integrations/actions.ts`:

```ts
async function getValidAccessToken(ctx, integrationId) {
  const integration = await ctx.db.get(integrationId);
  if (!integration || integration.accessStatus !== "active") {
    throw new Error("Integration not active");
  }
  const bufferMs = 5 * 60 * 1000;
  if (integration.tokenExpiresAt - bufferMs > Date.now()) {
    return integration.accessToken;
  }
  // Refresh
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: integration.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    await ctx.db.patch(integrationId, { accessStatus: "error", syncErrorMessage: "Token refresh failed" });
    throw new Error("Token refresh failed");
  }
  const data = await res.json();
  await ctx.db.patch(integrationId, {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenExpiresAt: data.expires_at * 1000,
    syncErrorMessage: undefined,
  });
  return data.access_token;
}
```

## 2. Activity fetch

Fetch all cycling activities from the last 90 days:

```ts
const ninetyDaysAgo = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
const CYCLING_TYPES = new Set([
  "Ride", "VirtualRide", "GravelRide", "MountainBikeRide",
  "EBikeRide", "Velomobile", "Handcycle"
]);

// Page through up to 200 activities
const activities = [];
let page = 1;
while (true) {
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${ninetyDaysAgo}&per_page=100&page=${page}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Strava API error: ${res.status}`);
  const batch = await res.json();
  if (batch.length === 0) break;
  activities.push(...batch.filter(a => CYCLING_TYPES.has(a.sport_type)));
  if (batch.length < 100) break;
  page++;
  if (page > 2) break; // Safety: max 200 activities
}
```

## 3. Store activities

For each activity, upsert into `stravaActivities`:

```ts
for (const activity of activities) {
  const existing = await ctx.db
    .query("stravaActivities")
    .withIndex("by_strava_id", q => q.eq("stravaActivityId", String(activity.id)))
    .unique();

  const record = {
    userId,
    integrationId,
    stravaActivityId: String(activity.id),
    sportType: activity.sport_type,
    startDate: new Date(activity.start_date).getTime(),
    distanceM: activity.distance,
    movingTimeSec: activity.moving_time,
    totalElevationGainM: activity.total_elevation_gain,
    averageSpeedMs: activity.average_speed,
    averageCadence: activity.average_cadence ?? undefined,
    averageHeartrate: activity.average_heartrate ?? undefined,
    averageWatts: activity.average_watts ?? undefined,
    gearId: activity.gear_id ?? undefined,
    isCommute: activity.commute ?? undefined,
    importedAt: Date.now(),
  };

  if (existing) {
    await ctx.db.patch(existing._id, record);
  } else {
    await ctx.db.insert("stravaActivities", record);
  }
}
```

## 4. Compute riding profile

```ts
function computeRidingProfile(activities) {
  if (activities.length === 0) return null;

  const totalDistanceM = activities.reduce((s, a) => s + a.distanceM, 0);
  const totalTimeSec = activities.reduce((s, a) => s + a.movingTimeSec, 0);
  const totalElevM = activities.reduce((s, a) => s + a.totalElevationGainM, 0);

  // Activity type breakdown
  const typeCounts = {};
  for (const a of activities) {
    typeCounts[a.sportType] = (typeCounts[a.sportType] || 0) + 1;
  }
  const dominant = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];
  const typeBreakdown = Object.fromEntries(
    Object.entries(typeCounts).map(([k, v]) => [k, v / activities.length])
  );

  // Elevation profile
  const avgGainPerKm = totalDistanceM > 0
    ? (totalElevM / (totalDistanceM / 1000))
    : 0;
  const elevationCategory =
    avgGainPerKm < 5 ? "flat" :
    avgGainPerKm < 12 ? "rolling" :
    avgGainPerKm < 20 ? "hilly" : "mountainous";

  // Rider category
  const avgSpeedKmh = totalTimeSec > 0
    ? (totalDistanceM / 1000) / (totalTimeSec / 3600)
    : 0;
  const avgDistanceKm = totalDistanceM / 1000 / activities.length;
  const riderCategory =
    avgSpeedKmh > 33 ? "race" :
    avgDistanceKm > 80 ? "endurance" :
    avgDistanceKm > 40 ? "sportive" : "recreational";

  // Terrain bias
  const gravelFraction = (typeBreakdown["GravelRide"] || 0) + (typeBreakdown["MountainBikeRide"] || 0);
  const terrainBias =
    gravelFraction > 0.6 ? "gravel" :
    gravelFraction > 0.3 ? "mixed_road_gravel" : "road";

  // Surface recommendation for tire pressure
  const surfaceRecommendation =
    terrainBias === "gravel" ? "hardpack_gravel" :
    elevationCategory === "mountainous" ? "rough_asphalt" :
    elevationCategory === "hilly" ? "average_asphalt" : "smooth_asphalt";

  // Riding goal signal
  const ridingGoalSignal =
    riderCategory === "race" ? "speed" :
    riderCategory === "recreational" ? "comfort" : "balance";

  // Training frequency
  const oldestActivity = Math.min(...activities.map(a => a.startDate));
  const weeksSpanned = Math.max(1, (Date.now() - oldestActivity) / (7 * 24 * 3600 * 1000));
  const trainingFrequencyPerWeek = activities.length / weeksSpanned;

  // Cadence (if available)
  const activitiesWithCadence = activities.filter(a => a.averageCadence);
  const avgCadence = activitiesWithCadence.length > 0
    ? activitiesWithCadence.reduce((s, a) => s + a.averageCadence, 0) / activitiesWithCadence.length
    : undefined;

  return {
    version: 1,
    computedAt: Date.now(),
    rideCount: activities.length,
    totalDistanceKm: Math.round(totalDistanceM / 10) / 100,
    avgRideDistanceKm: Math.round(avgDistanceKm * 10) / 10,
    avgRideDurationMinutes: Math.round(totalTimeSec / activities.length / 60),
    dominantActivityType: dominant,
    activityTypeBreakdown: typeBreakdown,
    elevationProfile: { avgGainPerKm: Math.round(avgGainPerKm * 10) / 10, category: elevationCategory },
    riderCategory,
    trainingFrequencyPerWeek: Math.round(trainingFrequencyPerWeek * 10) / 10,
    terrainBias,
    surfaceRecommendation,
    ridingGoalSignal,
    hasHeartRateData: activities.some(a => a.averageHeartrate),
    avgCadence: avgCadence ? Math.round(avgCadence) : undefined,
  };
}
```

## 5. Store results

```ts
const profile = computeRidingProfile(cyclingActivities);

await ctx.db.patch(integrationId, {
  ridingProfileJson: profile ? JSON.stringify(profile) : undefined,
  rideCount: cyclingActivities.length,
  totalDistanceKm: profile?.totalDistanceKm,
  lastSyncAt: Date.now(),
  syncErrorMessage: undefined,
});
```

## 6. i18n keys for Phase 2 settings display

```
settings.integrations.strava.rideStats         // "Imported: {n} rides · {km} km · Last 90 days"
settings.integrations.strava.typicalTerrain    // "Typical terrain: {label}"
settings.integrations.strava.syncSuccess       // "Strava rides synced successfully"
settings.integrations.strava.syncError         // "Sync failed — try again"
```

## Acceptance Criteria

- [ ] `importRecentRides` no longer throws; it runs to completion
- [ ] Activities are stored in `stravaActivities` and deduplicated by `stravaActivityId`
- [ ] Only cycling activity types are imported
- [ ] `ridingProfileJson` is updated on the integration record after sync
- [ ] `rideCount`, `totalDistanceKm`, `lastSyncAt` are updated
- [ ] Token refresh works correctly when token is expired
- [ ] If token refresh fails, `accessStatus` is set to `"error"` and sync aborts cleanly
- [ ] `npm run typecheck` passes
