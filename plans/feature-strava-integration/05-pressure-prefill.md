# Step 05 — Pressure Calculator Pre-Fill (Phase 2)

## Goal

Use the inferred riding profile from Strava to pre-fill the terrain/surface field in the tire pressure wizard and show a contextual hint on the dashboard.

## Constraint

Strava data is contextual only. The user must always see and can always override the pre-filled value. The hint must be clearly labelled as coming from Strava. The calculation engine never receives Strava data directly — it only receives the confirmed user inputs.

## 1. Pressure calculator pre-fill

File: `src/app/(dashboard)/pressure-calculator/page.tsx`

Read the current file before editing.

Add a query for the Strava status:
```ts
const stravaStatus = useQuery(api.integrations.queries.getStravaStatus);
const ridingProfile = stravaStatus?.ridingProfileJson
  ? JSON.parse(stravaStatus.ridingProfileJson)
  : null;
```

Pass `defaultSurface` to the `<PressureWizard>`:
```ts
<PressureWizard
  defaultSurface={ridingProfile?.surfaceRecommendation ?? undefined}
  stravaHint={ridingProfile ? {
    terrain: ridingProfile.terrainBias,
    avgDistanceKm: ridingProfile.avgRideDistanceKm,
  } : null}
/>
```

In `<PressureWizard>` (read this component before editing), add the hint banner above the surface field:

```tsx
{stravaHint && (
  <div className="mb-4 flex items-start gap-2 rounded-lg bg-[color:var(--secondary)] p-3 text-sm">
    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
    <span>
      {messages.tirePressure.stravaHint.replace("{terrain}", getTerrainLabel(stravaHint.terrain))}
    </span>
    <button className="ml-auto text-xs underline" onClick={dismissHint}>
      {messages.common.dismiss}
    </button>
  </div>
)}
```

The hint is dismissible per-session (localStorage or local state). Do not show again in the same session after dismissal.

## 2. Dashboard riding context section

File: `src/app/(dashboard)/dashboard/page.tsx`

Read the current file before editing.

If `ridingProfile` is available, add a "Riding Context" section:

```tsx
{ridingProfile && (
  <Card variant="bordered" className="mt-6">
    <CardHeader>
      <div className="flex items-center gap-2">
        <BarChart2 className="h-5 w-5 text-orange-500" />
        <CardTitle>{messages.dashboard.stravaContext.title}</CardTitle>
        <span className="ml-auto text-xs text-gray-400">
          {messages.dashboard.stravaContext.poweredBy}
        </span>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-6 text-sm">
        <div>
          <p className="text-gray-500">{messages.dashboard.stravaContext.terrain}</p>
          <p className="font-medium">{getTerrainLabel(ridingProfile.terrainBias)}</p>
        </div>
        <div>
          <p className="text-gray-500">{messages.dashboard.stravaContext.typicalRide}</p>
          <p className="font-medium">
            {ridingProfile.avgRideDistanceKm} km,{" "}
            {ridingProfile.avgRideDurationMinutes} min
          </p>
        </div>
        <div>
          <p className="text-gray-500">{messages.dashboard.stravaContext.weeklyRides}</p>
          <p className="font-medium">
            {ridingProfile.trainingFrequencyPerWeek}×
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400">
        {messages.dashboard.stravaContext.disclaimer}
      </p>
    </CardContent>
  </Card>
)}
```

## 3. Terrain label helper

Add to `src/lib/strava.ts` (new file):

```ts
export function getTerrainLabel(terrainBias: string, messages: Messages): string {
  const map: Record<string, string> = {
    "road": messages.strava.terrain.road,
    "mixed_road_gravel": messages.strava.terrain.mixedRoadGravel,
    "gravel": messages.strava.terrain.gravel,
  };
  return map[terrainBias] ?? terrainBias;
}
```

## 4. i18n keys

```
dashboard.stravaContext.title            // "Your riding profile"
dashboard.stravaContext.poweredBy        // "via Strava"
dashboard.stravaContext.terrain          // "Typical terrain"
dashboard.stravaContext.typicalRide      // "Typical ride"
dashboard.stravaContext.weeklyRides      // "Weekly rides"
dashboard.stravaContext.disclaimer       // "Based on your last 90 days of rides. These insights personalise your recommendations."
tirePressure.stravaHint                  // "Based on your recent Strava rides, we've suggested a starting terrain: {terrain}."
strava.terrain.road                      // "Road"
strava.terrain.mixedRoadGravel           // "Mixed road/gravel"
strava.terrain.gravel                    // "Gravel"
```

## Acceptance Criteria

- [ ] Pressure wizard shows a Strava hint banner when a riding profile exists
- [ ] The surface field is pre-filled from `ridingProfile.surfaceRecommendation`
- [ ] The user can override the pre-filled surface
- [ ] The hint is dismissible and does not reappear in the same session after dismissal
- [ ] Dashboard shows "Riding context" card when Strava is connected and synced
- [ ] Dashboard card does not appear if Strava is not connected or has no rides
- [ ] Terrain labels are localised in EN + NL
- [ ] `npm run typecheck` passes
