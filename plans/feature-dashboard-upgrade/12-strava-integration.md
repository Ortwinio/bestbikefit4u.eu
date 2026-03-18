# 12 — Strava Integration (MVP)

## Goal

Implement Strava OAuth connect/disconnect and basic ride import that infers terrain type and riding category, feeding into tire pressure suggestions.

## Background

The settings page (prompt 05) has a Strava placeholder. This prompt implements the real thing. The integration is user-level (one Strava account per user), not bike-level.

**MVP scope:**
- Connect / disconnect Strava via OAuth
- Import recent rides (last 30, or configurable)
- Infer: typical terrain type, average speed, estimated ride duration, riding category (endurance / climbing / mixed / gravel)
- Store inferred profile to influence future pressure suggestions

**Phase 2 scope (out of scope for this prompt):**
- Route-surface-informed per-ride pressure
- Event-day setup
- Fatigue/load-aware fit warnings

## Pre-requisites

- Strava developer account and app registered at strava.com/settings/api
- `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` env vars set in Convex environment
- a deliberate decision to keep this work in Phase 4; this is the least repo-grounded part of the plan and should not block the dashboard upgrade

## Steps

### 1. Schema: integrations table

Add to `convex/schema.ts` (if not already present):
```ts
integrations: defineTable({
  userId: v.id("users"),
  provider: v.literal("strava"),
  providerUserId: v.string(),
  accessToken: v.string(),       // encrypted or stored in Convex env-safe way
  refreshToken: v.string(),
  tokenExpiresAt: v.number(),
  accessStatus: v.union(v.literal("active"), v.literal("revoked"), v.literal("error")),
  lastSyncAt: v.optional(v.number()),
  ridingProfileJson: v.optional(v.string()), // inferred terrain/category JSON
}).index("by_user_and_provider", ["userId", "provider"]),
```

**Security note:** Strava tokens must not be readable by the client. Store them in the `integrations` table and access only from Convex actions (server-side). Never expose tokens to browser.

### 2. OAuth flow: Convex HTTP action for callback

In `convex/http.ts`, add an HTTP action for the Strava callback:

```
GET /api/strava/callback?code=...&state=...
```

This action:
1. Validates the `state` parameter (CSRF protection — generate a random state, store temporarily, validate on callback)
2. Exchanges the `code` for `accessToken` + `refreshToken` via Strava's token endpoint
3. Fetches the Strava athlete profile to get `providerUserId`
4. Upserts the `integrations` record
5. Redirects to `/settings?strava=connected`

The redirect to Strava should be initiated from the client by navigating to `/api/strava/connect` which generates the OAuth URL and redirects.

### 3. Strava connect/disconnect UI in settings

In `src/app/(dashboard)/settings/page.tsx`, replace the Strava "Coming soon" placeholder:

**When not connected:**
- "Connect Strava" button → initiates OAuth flow (navigates to `/api/strava/connect`)
- Brief description: "Connect Strava to improve terrain-based tire pressure recommendations"

**When connected:**
- Show Strava athlete name and avatar (from `ridingProfileJson` or fetched on connect)
- "Last synced: [date]" label
- "Sync now" button → triggers `importRecentRides` action
- "Disconnect" button → calls `disconnectStrava` mutation (sets `accessStatus = "revoked"`, deletes tokens)

### 4. Ride import and terrain inference action

Create `convex/integrations/actions.ts` with `importRecentRides`:
1. Fetch the user's `integrations` record (verify `accessStatus === "active"`)
2. Refresh the access token if expired (Strava refresh flow)
3. Fetch last 30 activities from Strava Activities API (`/athlete/activities?per_page=30`)
4. For each activity, extract: `sport_type`, `distance`, `moving_time`, `total_elevation_gain`, `average_speed`
5. Compute a riding profile:
   - Dominant terrain: road / gravel / trail (from `sport_type` distribution)
   - Average speed category: slow (<20 km/h) / moderate / fast (>35 km/h)
   - Riding category: endurance / climbing / mixed / gravel (heuristic from elevation/sport split)
6. Store the inferred profile as JSON in `integrations.ridingProfileJson`
7. Update `integrations.lastSyncAt`

### 5. Feed Strava profile into pressure suggestions

In the pressure calculator (`src/app/(dashboard)/pressure-calculator/page.tsx`):
- If a Strava integration exists with a riding profile, show a subtle note: "Based on your recent Strava rides, your typical terrain is [terrain]"
- Pre-select the terrain type in the calculator form based on the inferred terrain

This is purely informational — the user can override the pre-selected terrain.

### 6. Free vs. paid gating

Per the product spec, Strava integration is a paid feature. In the settings page:
- If `users.tier === "free"`, show the Strava section with a lock icon and "Available on Pro" label
- The connect button is disabled with an upgrade prompt

### 7. Environment variables

Document in a comment at the top of `convex/integrations/actions.ts`:
```ts
// Required env vars (set in Convex dashboard → Settings → Environment Variables):
// STRAVA_CLIENT_ID
// STRAVA_CLIENT_SECRET
// SITE_URL (e.g., https://bestbikefit4u.com — used to build the OAuth callback URL)
```

### 8. i18n

Add translation keys for both locale files:
- `settings.integrations.strava.connect` — "Connect Strava"
- `settings.integrations.strava.disconnect` — "Disconnect"
- `settings.integrations.strava.syncNow` — "Sync now"
- `settings.integrations.strava.lastSynced` — "Last synced"
- `settings.integrations.strava.connected` — "Connected"
- `settings.integrations.strava.description` — "Connect Strava to improve terrain-based tire pressure recommendations"
- `settings.integrations.strava.proOnly` — "Available on Pro"
- `settings.integrations.strava.typicalTerrain` — "Based on your recent Strava rides, your typical terrain is"

## Acceptance Criteria

- [ ] Strava OAuth flow completes: user lands on Strava, authorizes, returns to `/settings?strava=connected`
- [ ] Tokens are stored server-side only (never sent to client)
- [ ] "Sync now" imports rides and updates the inferred terrain profile
- [ ] Pressure calculator shows terrain hint from Strava profile when available
- [ ] "Disconnect" revokes the integration and clears tokens
- [ ] Free users see the Strava section locked with an upgrade prompt
- [ ] Paid users can connect and use Strava
- [ ] `npm run typecheck` passes
