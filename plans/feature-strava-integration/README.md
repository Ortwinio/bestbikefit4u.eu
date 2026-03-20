# Strava Integration — Full Product & Technical Plan

**Status:** Planning
**Target audience:** Founder + development team
**Strava API baseline:** Strava V3 REST API (https://developers.strava.com/docs/reference)
**Existing foundation:** `integrations` table in schema, `getStravaStatus` query, `disconnectStrava` mutation, placeholder `importRecentRides` action

---

## A. Executive Summary

BestBikeFit4U gives cyclists personalised bike fitting recommendations based on body measurements. The core engine is accurate but static — it knows your body, not your riding. Strava integration closes this gap.

A Strava-connected user gives us observed riding behaviour: how often they ride, what terrain they prefer, how long their rides typically are, and which bike they use most. This data does not replace body measurements — it contextualises them. A rider with average hamstring flexibility who does 80% climbing on a gravel bike has very different needs from a rider with the same measurements doing flat crits.

The integration has a natural entry point: Strava already stores the athlete's photo, which is the most immediately visible value for any new user. Beyond the photo, ride history gives us the richest signal available for contextualising fit and tire pressure recommendations without asking the user to answer more questions.

**MVP goal:** OAuth connect, profile photo import, and riding-context inference from recent rides.
**Phase 2 goal:** Per-bike ride data and terrain-aware tire pressure pre-fill.
**Phase 3 goal:** Fit intelligence using riding patterns — endurance vs. race posture, hill bias, training load.
**Phase 4 goal:** Premium features — event prep, dynamic fit refinement, fatigue-aware warnings.

---

## B. Business Value

### Why Strava integration matters

**1. Conversion — reduce friction at signup**
Strava has ~100 million registered users, a large portion of whom are precisely BestBikeFit4U's target audience. Offering "Connect with Strava" at onboarding gives new users a fast path to a personalised profile without manual data entry for their photo and riding context.

**2. Retention — make the app feel alive**
Without Strava, BestBikeFit4U is a point-in-time tool: you get your fit, leave, and forget. With Strava data refreshing periodically, the dashboard reflects the user's current riding reality. Users have a reason to return and re-evaluate their fit.

**3. Quality of recommendations — contextual fit advice**
The bike fitting engine currently uses body measurements and questionnaire answers. Strava data can supplement or validate questionnaire answers (e.g. infer riding style from actual activity data rather than self-reported category).

**4. Differentiation**
No major bike fitting platform currently offers Strava-informed dynamic fit refinement. This is a genuine product differentiator, especially for serious cyclists who are already on Strava.

**5. Tier gate — premium feature**
Strava integration (beyond photo import) is a natural Pro/Premium feature. This supports the business model: free users see the integration teased, paid users unlock it.

### What data Strava provides (available via V3 API)

| Data | Endpoint | Available to free apps |
|---|---|---|
| Athlete profile (name, location, weight, sex, age) | `GET /athlete` | Yes |
| Profile photo URL | `GET /athlete` (field: `profile`) | Yes |
| Activities list (summary per ride) | `GET /athlete/activities` | Yes (last 200 per page, paginated) |
| Activity detail | `GET /activities/{id}` | Yes (per activity) |
| Segment efforts | `GET /activities/{id}/segment_efforts` | Yes |
| Gear (bikes) | `GET /athlete` (field: `bikes`) | Yes |
| Heart rate streams | `GET /activities/{id}/streams` | Yes if user has HR enabled |
| Power streams | `GET /activities/{id}/streams` | Yes if user has power meter |
| Route data / polyline | `GET /activities/{id}` (field: `map.summary_polyline`) | Yes |
| Starred segments | `GET /segments/starred` | Yes |

**Not available without subscription-level app verification:** full laps, advanced segments beyond starred.

---

## C. User Journeys

### Journey 1: New user onboarding with Strava

```
1. User arrives at BestBikeFit4U landing page
2. Clicks "Get your free bike fit" or "Sign up with Strava"
3. → Strava OAuth consent screen (Strava-hosted)
   - Scope requested: read (activities + athlete profile)
4. User authorises → redirected to callback: /api/strava/callback
5. App:
   a. Exchanges code for access + refresh token (server-side only)
   b. Fetches athlete profile (name, profile photo URL)
   c. Creates BestBikeFit4U account using athlete email (if exposed)
      OR prompts user to enter email for magic-link auth
   d. Stores integration record
   e. Imports recent rides in background (async)
6. User arrives at profile page with:
   - Strava avatar already showing
   - "We imported your riding context from Strava" notice
   - Prompt to complete body measurements (still required)
7. After completing measurements, user starts bike fit
   - Riding context from Strava is used to pre-fill questionnaire defaults
```

**Note on auth:** @convex-dev/auth uses magic-link via email. Strava does not always expose email. The connect flow should not be used as the primary auth method — instead it is a "link account" flow that happens after email-based auth. New users authenticate first, then connect Strava.

### Journey 2: Existing user connecting Strava from Settings

```
1. User navigates to Settings → Connected apps
2. Sees "Strava" section with "Connect" button (Pro users) or lock icon (free users)
3. Clicks "Connect Strava"
4. → Strava OAuth consent screen
5. Returns to /settings?strava=connected
6. Settings page shows:
   - Strava athlete name + avatar
   - "Connected" badge
   - "Last synced: just now"
   - "Import profile photo from Strava" option (if current photo is not Strava-sourced)
   - "Sync now" button
   - "Disconnect" button
7. Background job runs: imports recent rides, infers riding profile
8. Dashboard shows Strava-enhanced context within minutes
```

### Journey 3: Profile picture import

```
Trigger A — At Strava connect time:
1. Strava callback fetches athlete.profile (CDN URL)
2. App downloads and re-hosts the image (or stores the URL)
3. If user has no existing profile photo:
   - Automatically sets Strava photo as profile photo
   - Shows "Profile photo imported from Strava" notice
4. If user has an existing photo:
   - Shows dialog: "Import your Strava profile photo?"
   - Options: "Yes, use Strava photo" / "Keep current photo"

Trigger B — User manually imports from Settings:
1. In Settings → Profile → Photo section
2. Button: "Import from Strava" (only visible when Strava is connected)
3. Shows preview of Strava photo
4. Confirm → updates profile image, sets source = "strava"

Edge cases:
- Strava photo URL expires: re-fetch on next sync (Strava CDN URLs are not permanent)
- User has no Strava photo: skip silently, do not show import option
- Photo download fails: surface a non-blocking error notice
```

### Journey 4: Consent and privacy flow

```
At connect time, before redirecting to Strava:
1. Show a pre-consent screen: "Before we connect to Strava"
   Content:
   - What we'll request access to (read-only: activities, athlete profile)
   - What we import: riding activity summaries, profile photo
   - What we do NOT access: your GPS routes, private notes, followers
   - How long we store it: until you disconnect
   - "Cancel" / "Continue to Strava"

On first sync after connect:
2. Dashboard shows a one-time notice:
   "We've imported X rides from Strava. This helps us personalise your
   tire pressure and fit recommendations. Your data is read-only and
   you can disconnect at any time."
   [Dismiss] [View settings]
```

### Journey 5: Disconnect / revoke flow

```
1. User navigates to Settings → Connected apps → Strava → "Disconnect"
2. Confirmation dialog:
   "Disconnect Strava?
   - Your Strava activity data will be removed from BestBikeFit4U
   - Recommendations based on your riding history will no longer update
   - Your bike fit recommendations and profile photo are not affected
   [Cancel] [Disconnect]"
3. On confirm:
   a. Call Strava deauthorize endpoint (POST /oauth/deauthorize) — server-side
   b. Set integrations.accessStatus = "revoked", clear tokens
   c. Set integrations.ridingProfileJson = undefined
   d. If profile photo source is "strava": do NOT automatically remove it (user chose it)
   e. Toast: "Strava disconnected"
4. Settings page returns to "Connect Strava" state
```

---

## D. Functional Requirements

### D1. Data to import from Strava (by phase)

#### Phase 1 — Profile only (MVP)

| Field | Strava source | Storage | Use |
|---|---|---|---|
| Athlete name | `athlete.firstname + lastname` | `integrations.athleteName` | Display in settings |
| Profile photo URL | `athlete.profile` | `integrations.athleteAvatarUrl` | Photo import |
| Strava athlete ID | `athlete.id` | `integrations.providerUserId` | Deduplication |
| Athlete weight | `athlete.weight` (kg) | Cross-reference only | Not stored; validate against `profiles.weightKg` |
| Bikes registered | `athlete.bikes[].name`, `id`, `distance` | Not stored in phase 1 | Future: bike linking |

#### Phase 2 — Ride summaries

| Field | Strava source | Storage | Use |
|---|---|---|---|
| Activity type | `activity.sport_type` | Aggregated in `ridingProfileJson` | Terrain inference |
| Distance (m) | `activity.distance` | Aggregated | Duration/effort classification |
| Moving time (s) | `activity.moving_time` | Aggregated | Ride length classification |
| Elevation gain (m) | `activity.total_elevation_gain` | Aggregated | Climbing bias |
| Average speed (m/s) | `activity.average_speed` | Aggregated | Rider category |
| Start date | `activity.start_date` | Aggregated | Training frequency |
| Gear ID | `activity.gear_id` | Aggregated | Per-bike context |

Import window: last 90 days, max 200 activities (Strava pagination limit per request).

#### Phase 3 — Fit intelligence signals

| Field | Strava source | Storage | Use |
|---|---|---|---|
| Heart rate (if available) | `activity.average_heartrate` | Aggregated | Effort zone classification |
| Kudos / perceived effort | `activity.suffer_score` (deprecated) | Skip — unreliable | — |
| Cadence | `activity.average_cadence` | Aggregated | Pedalling style hint |
| Power (if available) | `activity.average_watts` | Aggregated | Performance tier hint |

**Do not import:** full GPS tracks, segment efforts, private notes, location data, follower/following lists, clubs.

### D2. Inferred riding profile (stored as `ridingProfileJson`)

After importing rides, compute and store:

```json
{
  "version": 1,
  "computedAt": 1748000000000,
  "rideCount": 47,
  "totalDistanceKm": 1840,
  "avgRideDistanceKm": 39.1,
  "avgRideDurationMinutes": 78,
  "dominantActivityType": "Ride",
  "activityTypeBreakdown": {
    "Ride": 0.72,
    "GravelRide": 0.18,
    "MountainBikeRide": 0.10
  },
  "elevationProfile": {
    "avgGainPerKm": 8.4,
    "category": "hilly"
  },
  "riderCategory": "endurance",
  "trainingFrequencyPerWeek": 3.1,
  "terrainBias": "mixed_road_gravel",
  "surfaceRecommendation": "average_asphalt",
  "ridingGoalSignal": "balance",
  "hasHeartRateData": true,
  "avgCadence": 84
}
```

### D3. How Strava data maps to bike fitting inputs

| Strava signal | Bike fit input | Mechanism |
|---|---|---|
| `dominantActivityType` | `discipline` pre-fill | Road → "road", GravelRide → "gravel", MTB → "mtb" |
| `elevationProfile.category` | Tire pressure surface | Hilly/mixed → rougher surface recommendation |
| `riderCategory` | `ridingStyle` default | "endurance" → recreational/sportive; "fast" → racing |
| `avgRideDistanceKm` | Comfort vs. performance bias | >80km avg → comfort-leaning recommendation |
| `trainingFrequencyPerWeek` | Rider experience tier | >4 rides/week → experienced rider flag |
| `avgCadence` | Crank length direction | <75 rpm → longer crank bias; >90 → neutral |

**Critical constraint:** Strava data provides _default suggestions only_. The user always sees and can override these pre-fills. The bike fitting engine and tire pressure engine continue to use the same primary inputs — body measurements and confirmed questionnaire answers. Strava data is never silently injected into calculations without user awareness.

---

## E. UX / UI Design Recommendations

### E1. Settings page — Connected Apps section

**URL:** `/settings` (existing page, new section)

**When not connected (free user):**
```
┌────────────────────────────────────────────────────────────┐
│ 🔒 Strava                                           [Pro]  │
│ Connect your Strava account to improve terrain-based        │
│ tire pressure recommendations and import your profile photo │
│                                                             │
│ [Upgrade to Pro to connect Strava]                          │
└────────────────────────────────────────────────────────────┘
```

**When not connected (Pro user):**
```
┌────────────────────────────────────────────────────────────┐
│ Strava                                                      │
│ Connect your Strava account to import your riding history   │
│ and improve your bike fit and tire pressure recommendations  │
│                                                             │
│ We request read-only access to your activities and profile. │
│ We never access GPS tracks, private notes, or followers.    │
│                                                             │
│ [Connect Strava]                                            │
└────────────────────────────────────────────────────────────┘
```

**When connected:**
```
┌────────────────────────────────────────────────────────────┐
│ Strava                                          ✓ Connected │
│                                                             │
│ [Avatar] Jan Janssen                                        │
│          Last synced: 2 hours ago                           │
│                                                             │
│ Imported: 47 rides · 1,840 km · Last 90 days               │
│ Typical terrain: Mixed road/gravel                          │
│                                                             │
│ [Sync now]                        [Disconnect]              │
│                                                             │
│ Profile photo: Using Strava photo [Change photo]            │
└────────────────────────────────────────────────────────────┘
```

### E2. Pre-consent screen

**Shown before redirecting to Strava OAuth (modal or full page):**

```
We'd like to connect to your Strava account

What we'll access (read-only):
✓ Your athlete profile (name, photo)
✓ Your recent activity summaries (distance, duration, elevation, sport type)

What we will NOT access:
✗ Your GPS routes or maps
✗ Your private notes or activities
✗ Your followers, clubs, or social data
✗ Your segments or personal records

How we use this:
Your riding history helps us understand your terrain preference and riding
style. This improves your tire pressure recommendations and helps us
suggest a bike fit that matches how you actually ride.

Your data is read-only. You can disconnect at any time from Settings.

[Cancel]                                    [Continue to Strava →]
```

### E3. Dashboard Strava context display

**On the dashboard home, when Strava is connected:**

Add a compact "Riding Context" section below the main fit summary:

```
Your riding profile (from Strava)
Terrain: Mixed road/gravel  |  Typical ride: 39 km, 78 min  |  Weekly rides: 3
[These insights personalise your recommendations — Update →]
```

This section is informational only. A tooltip on "Update" links to Settings → Strava sync.

### E4. Pressure calculator Strava hint

When the user opens the tire pressure wizard and a Strava riding profile exists:

```
ℹ️  Based on your recent Strava rides, we've suggested a starting terrain.
    You can adjust this below.

Surface: [Average asphalt ▼]   ← pre-filled from Strava inference
```

The hint is dismissible and never overrides a user's previous confirmed selection.

### E5. Onboarding — "Connect Strava" prompt

After the user completes body measurements and before their first fit session:

```
One more thing — connect Strava to get smarter recommendations

Your ride history helps us understand:
• How aggressively you can ride (based on training frequency)
• What terrain you typically ride (road, gravel, trails)
• Your preferred ride distance and effort level

[Connect Strava]              [Skip for now]
```

"Skip for now" advances without connecting. The prompt should not appear again unless the user visits Settings.

### E6. Field labels and copy reference

| Location | Label | Copy |
|---|---|---|
| Settings button | Connect | "Connect Strava" |
| Settings button | Disconnect | "Disconnect" |
| Settings button | Sync | "Sync now" |
| Settings status | Last sync | "Last synced: {relative time}" |
| Settings status | Import count | "Imported: {n} rides · {km} km · Last 90 days" |
| Settings status | Terrain | "Typical terrain: {terrain label}" |
| Profile photo row | Source | "Using Strava photo" |
| Profile photo row | Action | "Import from Strava" |
| Dashboard hint | Terrain | "Terrain: {label}" |
| Dashboard hint | Ride stats | "Typical ride: {avgKm} km, {avgMin} min" |
| Pressure hint | Pre-fill | "Based on your recent Strava rides, we've suggested a starting terrain." |
| Pre-consent title | — | "We'd like to connect to your Strava account" |
| Disconnect confirm | — | "Your Strava activity data will be removed from BestBikeFit4U." |

### E7. Edge cases

| Situation | Handling |
|---|---|
| User has no Strava activities | Show "No rides found" in settings; do not show terrain hint |
| Strava token expired (can't refresh) | Set `accessStatus = "error"`, show "Reconnect Strava" in settings |
| Strava profile has no photo | Skip photo import silently |
| Strava weight differs from profile weight | Surface a one-time prompt: "Your Strava profile shows Xkg — update your BestBikeFit4U weight?" |
| User disconnects mid-sync | Sync action checks `accessStatus` at start; aborts if revoked |
| Strava API rate limit hit (600 req/15min) | Retry with exponential backoff; surface non-blocking error if all retries fail |
| User connects same Strava account on two BestBikeFit4U accounts | Use `providerUserId` to detect duplicate; surface a warning |

---

## F. Technical Architecture

### F1. OAuth flow

```
Browser                     BestBikeFit4U              Strava API
──────                      ─────────────              ──────────
Click "Connect Strava"
  │
  ├─► GET /api/strava/connect (Convex HTTP action)
  │     - generates random state (16 bytes hex)
  │     - stores state + userId + expiry in `integrations` table
  │     - builds Strava authorize URL:
  │       https://www.strava.com/oauth/authorize
  │         ?client_id={STRAVA_CLIENT_ID}
  │         &redirect_uri={SITE_URL}/api/strava/callback
  │         &response_type=code
  │         &approval_prompt=auto
  │         &scope=read,activity:read
  │         &state={state}
  │     - 302 redirect to Strava
  │
  │   [User sees Strava consent screen]
  │   [User clicks "Authorize"]
  │
  ├─► GET /api/strava/callback?code=...&state=...  (Convex HTTP action)
  │     - validate state matches stored state (CSRF check)
  │     - validate state not expired (15-min window)
  │     ├─► POST https://www.strava.com/oauth/token
  │     │     body: {client_id, client_secret, code, grant_type: "authorization_code"}
  │     │     response: {access_token, refresh_token, expires_at, athlete}
  │     ├─── upsert integrations record
  │     │     - providerUserId = athlete.id
  │     │     - athleteName = athlete.firstname + lastname
  │     │     - athleteAvatarUrl = athlete.profile
  │     │     - accessToken = access_token   [never sent to client]
  │     │     - refreshToken = refresh_token  [never sent to client]
  │     │     - tokenExpiresAt = expires_at * 1000
  │     │     - accessStatus = "active"
  │     ├─── schedule background ride import (Convex scheduler)
  │     └─── 302 redirect to /settings?strava=connected
  │
Settings page loads
  ├─── getStravaStatus query → shows connected state
  └─── (background) importRecentRides action runs asynchronously
```

### F2. Token storage and security

**Principle:** Tokens are never readable by the client. They live in the Convex database, accessed only from Convex actions (which run server-side).

- `accessToken` — stored as plain string in `integrations` table; only accessible from Convex actions
- `refreshToken` — same; never included in query responses
- Convex query `getStravaStatus` returns status, name, avatar, lastSyncAt, ridingProfileJson — **not** tokens

**Token refresh:**

```ts
async function getValidAccessToken(ctx, integration) {
  const nowMs = Date.now();
  const bufferMs = 5 * 60 * 1000; // 5 min buffer
  if (integration.tokenExpiresAt - bufferMs > nowMs) {
    return integration.accessToken; // still valid
  }
  // Refresh
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: integration.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await response.json();
  await ctx.db.patch(integration._id, {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenExpiresAt: data.expires_at * 1000,
  });
  return data.access_token;
}
```

### F3. Ride import and sync strategy

**Trigger points:**
1. Immediately after OAuth connect (background scheduled action)
2. User clicks "Sync now" in Settings (on-demand action)
3. Scheduled background sync — once per day per connected user (Convex cron)

**Import action (`convex/integrations/actions.ts`):**

```
importRecentRides:
1. Fetch integration record for current user
2. Verify accessStatus === "active"
3. Call getValidAccessToken() — refresh if needed
4. Fetch activities: GET /athlete/activities?per_page=200&after={90_days_ago_unix}
   - Paginate if needed (Strava returns max 200 per page)
5. Filter: only cycling types (Ride, VirtualRide, GravelRide, MountainBikeRide, EBikeRide)
6. Compute ridingProfile from filtered activities (see D2 above)
7. Patch integration: ridingProfileJson, lastSyncAt
8. If athlete weight present and profile.weightKg not set: flag for weight prompt
```

**Background cron (Convex scheduler):**

```ts
// convex/crons.ts
crons.daily(
  "strava-sync",
  { hourUTC: 3, minuteUTC: 0 },
  internal.integrations.actions.syncAllActiveIntegrations,
);
```

`syncAllActiveIntegrations` queries all integrations where `accessStatus === "active"` and schedules `importRecentRides` per user. Uses Convex `ctx.scheduler.runAfter` for each user to avoid hitting Strava rate limits simultaneously (spread by user index * 10 seconds).

### F4. Profile image import strategy

**At connect time:**
1. Strava provides `athlete.profile` — a CDN URL (e.g. `https://dgalywyr863hv.cloudfront.net/...`)
2. Store the URL directly in `integrations.athleteAvatarUrl`
3. For display in settings: use this URL directly
4. For the user's profile photo: update `users.profile_image_url = athleteAvatarUrl` and `users.profileImageSource = "strava"` (extend the union type to add `"strava"`)

**Re-hosting consideration:**
- Strava CDN URLs are stable but not permanent — they can change when the user updates their Strava photo
- Option A (simple): store URL directly; re-fetch on sync to detect changes → recommended for MVP
- Option B (robust): download image and re-upload to Convex file storage using `ctx.storage.store()` → better for Phase 2 (ensures availability even after Strava disconnect)

**MVP recommendation:** Store the Strava URL directly. On each sync, update `athleteAvatarUrl` if changed. If the user disconnects Strava, their profile photo (already set in `users.profile_image_url`) remains unchanged.

### F5. Convex HTTP actions (Next.js route handlers are an alternative)

Strava requires a server-side callback URL. In this stack, Convex HTTP actions handle this:

```ts
// convex/http.ts
const http = httpRouter();

http.route({
  path: "/strava/connect",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // Generate state, redirect to Strava
  }),
});

http.route({
  path: "/strava/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // Exchange code for tokens, upsert integration, redirect
  }),
});

export default http;
```

The Convex HTTP endpoint base URL is `https://{deployment}.convex.site`. Set the Strava redirect URI to `https://{deployment}.convex.site/strava/callback`.

Alternatively, use a Next.js route handler at `src/app/api/strava/callback/route.ts` — this runs on Vercel serverless and can call Convex mutations via the Convex HTTP client. Either approach is valid; Convex HTTP actions avoid Vercel cold starts for the callback.

### F6. Webhook usage

Strava offers webhook event subscriptions (push notifications when a user creates, updates, or deletes an activity). This is a Phase 3 feature.

Setup: `POST /push_subscriptions` to register a callback URL. Events arrive as `POST /api/strava/webhook` with `{ owner_id, object_type, object_id, aspect_type }`.

For Phase 1 and 2, polling (on-demand sync + daily cron) is sufficient.

### F7. Failure handling

| Failure | Detection | Recovery |
|---|---|---|
| Invalid state on callback | State mismatch | Return 400; user sees "Connection failed, try again" |
| Token exchange fails | Non-200 from Strava token endpoint | Log error; redirect to `/settings?strava=error` |
| Token refresh fails (revoked) | 401 from Strava | Set `accessStatus = "error"`; surface "Reconnect" in settings |
| Activity fetch fails (rate limit) | 429 from Strava | Retry after 15 min (Convex scheduler); partial results still saved |
| Profile image URL dead | HTTP error on re-fetch | Clear `athleteAvatarUrl`; keep existing `users.profile_image_url` |
| Strava API down | Timeout / 5xx | Retry 3x with exponential backoff; mark sync as failed |

---

## G. Data Model

### Existing tables (relevant fields)

**`users` table** — add `"strava"` to `profileImageSource` union:
```ts
profileImageSource: v.optional(
  v.union(v.literal("google"), v.literal("manual"), v.literal("strava"))
)
```

**`integrations` table** — already in schema (confirmed), plus proposed additions:

```ts
integrations: defineTable({
  userId: v.id("users"),
  provider: v.literal("strava"),

  // OAuth credentials (server-side only)
  providerUserId: v.optional(v.string()),    // Strava athlete ID
  accessToken: v.optional(v.string()),        // Never sent to client
  refreshToken: v.optional(v.string()),       // Never sent to client
  tokenExpiresAt: v.optional(v.number()),     // Unix ms

  // Connection state
  accessStatus: v.union(
    v.literal("not_connected"),
    v.literal("active"),
    v.literal("revoked"),
    v.literal("error"),                       // Token refresh failed
    v.literal("pending"),                     // OAuth in progress
  ),

  // OAuth CSRF state
  oauthState: v.optional(v.string()),
  oauthStateExpiresAt: v.optional(v.number()),

  // Profile data (safe to expose to client)
  athleteName: v.optional(v.string()),
  athleteAvatarUrl: v.optional(v.string()),
  athleteStravaWeight: v.optional(v.number()),  // NEW: for weight cross-reference prompt

  // Riding profile (inferred, safe to expose)
  ridingProfileJson: v.optional(v.string()),    // JSON blob (see D2 structure)
  rideCount: v.optional(v.number()),            // NEW: for display in settings
  totalDistanceKm: v.optional(v.number()),      // NEW: for display in settings
  lastSyncAt: v.optional(v.number()),
  syncErrorMessage: v.optional(v.string()),     // NEW: last error for display
})
.index("by_user_and_provider", ["userId", "provider"])
.index("by_status", ["accessStatus"])           // NEW: for cron sync of all active users
```

### New table: `stravaActivities` (Phase 2)

For Phase 2, store individual activity summaries (not used in Phase 1 where only the aggregated profile is stored):

```ts
stravaActivities: defineTable({
  userId: v.id("users"),
  integrationId: v.id("integrations"),

  stravaActivityId: v.string(),         // Strava's activity ID (string to avoid int overflow)
  sportType: v.string(),                // "Ride", "GravelRide", "MountainBikeRide", etc.
  startDate: v.number(),               // Unix ms
  distanceM: v.number(),               // Metres
  movingTimeSec: v.number(),           // Seconds
  totalElevationGainM: v.number(),     // Metres
  averageSpeedMs: v.number(),          // Metres/second
  averageCadence: v.optional(v.number()),
  averageHeartrate: v.optional(v.number()),
  averageWatts: v.optional(v.number()),
  gearId: v.optional(v.string()),      // Strava gear ID (for bike linking)
  isCommute: v.optional(v.boolean()),

  importedAt: v.number(),
})
.index("by_user", ["userId"])
.index("by_user_start_date", ["userId", "startDate"])
.index("by_strava_id", ["stravaActivityId"])  // For deduplication
```

### New table: `stravaGear` (Phase 3)

```ts
stravaGear: defineTable({
  userId: v.id("users"),
  integrationId: v.id("integrations"),
  stravaGearId: v.string(),
  name: v.string(),
  bikeId: v.optional(v.id("bikes")),    // Linked BestBikeFit4U bike (user-confirmed)
  totalDistanceM: v.number(),
  isRetired: v.boolean(),
  importedAt: v.number(),
})
.index("by_user", ["userId"])
.index("by_strava_gear_id", ["stravaGearId"])
```

### Fit context derived from Strava (stored in `ridingProfileJson`, not a separate table)

The structured JSON (see D2) is the fit context. It is not normalised into separate columns because:
- It is computed in bulk from many activities and not queried field-by-field
- It changes on every sync as a unit
- The schema for it will evolve through phases

If querying individual fields becomes necessary in Phase 3, migrate relevant fields to typed columns on the `integrations` table.

---

## H. Security, Privacy, and Compliance

### H1. Consent requirements

- OAuth scope must be minimal: `read` (athlete profile) + `activity:read` (activity summaries)
- Do NOT request `activity:read_all` (private activities) unless explicitly needed and disclosed
- Pre-consent screen must explain exactly what data is accessed before redirecting to Strava (see E2)
- Users must be able to withdraw consent at any time (disconnect flow)
- Strava's own terms require: "You must clearly display what data you will use and how it will be used" in your app listing on Strava

### H2. Secure token handling

- Tokens MUST NOT be returned from any Convex query — `getStravaStatus` must explicitly omit `accessToken` and `refreshToken`
- Access tokens expire in ~6 hours; refresh tokens are long-lived — both must be treated as secrets
- Store tokens in the Convex database (not in browser localStorage, cookies, or client-side state)
- Convex actions run server-side; tokens are only ever used within actions
- CSRF protection: validate the `state` parameter on callback; expire the state after 15 minutes
- Verify the authenticated user's `userId` when upserting the integration record (a callback must not be able to overwrite another user's integration)

### H3. Data minimisation

- Import only activity summaries, not full GPS streams (polylines contain location data)
- Do not store raw activity JSON — only the fields listed in D2
- Phase 2 `stravaActivities` stores only the fields needed for inference — not `description`, `private_note`, `segment_efforts`, `splits`, or map data
- Athlete weight from Strava: surface as a prompt only; do not auto-write to `profiles.weightKg`
- After disconnect: delete `ridingProfileJson`, clear tokens, clear `athleteAvatarUrl` from the integrations record — the user's profile photo is retained (they chose it)
- If the user deletes their BestBikeFit4U account: delete the integrations record and all derived Strava data

### H4. Profile image handling

- Strava profile images are hosted on Strava's CDN — accessing them does not require the user's token
- The URL is stored, not the image binary (Phase 1)
- If re-hosting in Phase 2: store in Convex file storage with proper content-type; do not make files publicly listable
- Users can always replace their profile photo with a different source (manual upload, Google) without disconnecting Strava
- If a user disconnects Strava and has a Strava-sourced profile photo, retain the photo but clear `profileImageSource`

### H5. Disconnect and delete

- Disconnect calls `POST /oauth/deauthorize` on Strava — this revokes the app's access at Strava's end, not just locally
- Local disconnect: clear tokens, set `accessStatus = "revoked"`, clear `ridingProfileJson`
- Full account deletion: also delete all `stravaActivities` and `stravaGear` rows for the user

### H6. Compliance considerations

- **GDPR (if serving EU users):** Strava activity data constitutes personal data. It must be included in your privacy policy with the legal basis (legitimate interest or consent), retention period, and data subject rights (right to erasure = disconnect + delete above).
- **Strava API Terms of Service:** BestBikeFit4U must comply with [Strava's API Agreement](https://www.strava.com/legal/api). Key constraints:
  - Do not cache data beyond what is necessary for the feature
  - Do not sell or transfer Strava data to third parties
  - Keep your app's requested scopes to the minimum needed
  - Display "Powered by Strava" or the Strava API logo where required by brand guidelines
- **Rate limits:** 600 requests per 15 minutes per app. The daily cron and sync strategy must spread requests to avoid hitting this limit. Monitor and implement queuing if needed.

---

## I. Phased Roadmap

### Phase 1: OAuth + Profile Photo (MVP)

**Scope:**
- Strava OAuth connect/disconnect flow with CSRF protection
- Profile photo import (store URL, set `users.profile_image_url`)
- Display athlete name and avatar in Settings
- `getStravaStatus` query (already exists), `disconnectStrava` mutation (already exists)
- Convex HTTP actions for `/strava/connect` and `/strava/callback`
- Pre-consent screen before redirect
- Settings page UI: connected/disconnected states
- Strava weight cross-reference prompt (informational only)
- i18n for all new strings

**Dependencies:**
- `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `SITE_URL` env vars in Convex
- Strava developer app registered with correct redirect URI
- Extend `profileImageSource` union to include `"strava"`

**Business value:** Reduces signup friction; profile feels personalised immediately. Low implementation risk.

**Technical complexity:** Medium — OAuth state management, server-side token handling, Convex HTTP actions.

**Risks:**
- Strava OAuth app registration requires manual review for apps with >100 users (can plan ahead)
- Strava CDN URL for profile photo may change — mitigated by re-fetching on sync

**Estimated effort:** 3-5 days

---

### Phase 2: Ride Ingestion and Riding Profile

**Scope:**
- `importRecentRides` Convex action (implement the placeholder that currently throws)
- Import last 90 days of activity summaries via Strava API
- Compute and store `ridingProfileJson` (see D2 structure)
- Daily background cron sync for all active integrations
- Settings page: show ride count, total distance, last synced, "Sync now" button
- Dashboard: "Riding context" section showing terrain and typical ride
- Pressure calculator: pre-fill surface type from Strava terrain inference
- Store `stravaActivities` table for raw summaries
- Token refresh logic

**Dependencies:** Phase 1 complete, `stravaActivities` table added to schema.

**Business value:** First meaningful fit personalisation from Strava. Tire pressure pre-fill is a tangible, immediately visible improvement. Gives users a reason to stay connected.

**Technical complexity:** Medium-high — pagination, rate limit handling, terrain inference algorithm, background cron.

**Risks:**
- Strava rate limits: 600 req/15min. A user with 200 activities uses 1-2 requests. Cron for 100 users = 100-200 requests — well within limits. Monitor as user base grows.
- Inference accuracy: terrain inference from activity types + elevation is an approximation. Frame as "based on recent rides" not as ground truth.

**Estimated effort:** 5-7 days

---

### Phase 3: Fit Intelligence and Refinement

**Scope:**
- Import Strava gear (bikes) from athlete profile
- User can link Strava gear ID to a BestBikeFit4U bike
- Per-bike ride history from Strava (filter activities by `gear_id`)
- Use riding profile to contextualise fit questionnaire defaults:
  - Pre-fill `ridingStyle` from `riderCategory`
  - Pre-fill `primaryGoal` from `ridingGoalSignal`
  - Pre-fill `weeklyHours` from `trainingFrequencyPerWeek * avgRideDurationMinutes / 60`
- Cadence signal → inform crank length recommendation (soft suggestion)
- Average ride distance → adjust comfort/performance bias
- Show Strava-sourced context on the fit results page ("Your fit accounts for your typical 39km road/gravel riding")
- Webhook support for real-time activity sync (register webhook subscription)

**Dependencies:** Phase 2 complete, bike fitting engine v2 in production (Phase 10 of engine-v2-migration).

**Business value:** Differentiator. Dynamic fit personalisation that improves with each ride.

**Technical complexity:** High — bike linking UX, questionnaire pre-fill without breaking the wizard, webhook endpoint, cross-referencing activity data with fit sessions.

**Risks:**
- Pre-filling questionnaire answers may surprise users if not explained clearly. Every pre-fill must be labelled "From Strava" and overridable.
- Strava gear IDs change if the user reorganises their Strava garage. Bike linking needs a re-link prompt.

**Estimated effort:** 8-12 days

---

### Phase 4: Premium / Advanced Features

**Scope:**
- Event-day setup: user enters a target event date; BestBikeFit4U suggests tire pressure based on the event's likely terrain (using segment data or user-entered surface type)
- Training load awareness: flag if recent Strava data shows a spike in training load, suggest a comfort-biased fit for recovery periods
- Auto-refresh fit suggestion when Strava profile signals a significant change (e.g. +15% weekly distance over 6 weeks → suggest revisiting aggressive position)
- Power-based rider tier: if average watts available, classify rider as recreational / club / elite and adjust recommendations accordingly
- Gate Phase 4 features behind Premium tier (higher price point than Phase 1-2 Pro)

**Dependencies:** Phase 3 complete, premium billing tier set up.

**Business value:** Maximum differentiation. Creates a long-term product moat. Recurring reason for cyclists to stay subscribed.

**Technical complexity:** Very high — event date logic, training load models, auto-trigger for fit suggestions.

**Risks:**
- Training load and fatigue modelling is complex and not BestBikeFit4U's core expertise. Keep recommendations conservative and clearly caveat them.
- Power data is only available for users with power meters (~15% of road cyclists). Do not build Phase 4 around power as the primary signal.

**Estimated effort:** 15+ days

---

## J. Recommended MVP Scope

The MVP (Phase 1 only) should ship the following and nothing more:

**Include:**
- [ ] Strava OAuth connect/disconnect with proper CSRF protection
- [ ] Profile photo import: store `athleteAvatarUrl`, update `users.profile_image_url`
- [ ] Extend `profileImageSource` union to include `"strava"`
- [ ] Settings page: connected/disconnected states, athlete name + avatar display
- [ ] Pre-consent screen before OAuth redirect
- [ ] Disconnect flow: revoke at Strava + clear tokens locally
- [ ] `"pending"` state handling for OAuth in-progress
- [ ] Strava weight prompt (informational, user-driven)
- [ ] i18n: all strings in EN + NL

**Explicitly defer:**
- Ride import and terrain inference (Phase 2)
- Background cron sync (Phase 2)
- Pressure calculator pre-fill (Phase 2)
- Bike linking from Strava gear (Phase 3)
- Webhooks (Phase 3)
- Any fit engine changes (Phase 3)

**Why this boundary:**
Phase 1 delivers the highest-visibility feature (profile photo) with the lowest risk. It proves the OAuth plumbing works before adding ride import complexity. It can ship in a week and gives real user value immediately.

---

## K. Key Implementation Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Strava app review required for >100 users | High | High | Register the Strava app immediately; submit for review early; review can take 1-2 weeks |
| Strava CDN URLs expire or change | Medium | Low | Re-fetch `athleteAvatarUrl` on every sync; do not rely on the URL being stable |
| Token refresh fails silently | Medium | High | Set `accessStatus = "error"` on any 401; surface "Reconnect" prompt in settings |
| CSRF state not cleaned up | Medium | Medium | Expire states after 15 minutes; clean up on successful callback |
| Strava rate limit hit in production | Low (early) / High (scale) | Medium | Monitor request volume; implement per-user request throttling in the cron; cache aggressively |
| Terrain inference is inaccurate | High | Low | Frame all inferences as suggestions; always let user override; label clearly "Based on Strava" |
| Strava scope changes or API deprecation | Low | High | Minimal scope request reduces surface area; monitor Strava developer changelog |
| User revokes Strava access from Strava's side (not BestBikeFit4U) | Medium | Low | Handle 401 on any API call by setting `accessStatus = "error"` and prompting reconnect |
| Privacy policy not updated | Medium | High | Update privacy policy before shipping Phase 1; include Strava data in the policy |
| Two BestBikeFit4U accounts connected to same Strava | Low | Medium | Check `providerUserId` uniqueness on callback; surface a clear error if duplicate found |
| Convex HTTP action cold start delays the OAuth callback | Low | Low | Convex HTTP actions are fast; test the redirect timing; add loading state on the frontend during callback |

---

## Implementation Files

Numbered implementation prompts are in the same directory:

- `01-oauth-connect-disconnect.md` — Phase 1: HTTP actions, connect/disconnect, settings UI
- `02-profile-photo-import.md` — Phase 1: Photo import, `profileImageSource` extension
- `03-ride-ingestion.md` — Phase 2: Activity import, terrain inference, `ridingProfileJson`
- `04-cron-and-sync.md` — Phase 2: Background sync, error handling, rate limiting
- `05-pressure-prefill.md` — Phase 2: Pressure calculator integration
- `06-bike-linking.md` — Phase 3: Strava gear → BestBikeFit4U bike linking
- `07-fit-intelligence.md` — Phase 3: Questionnaire pre-fill, fit context display
- `08-webhooks.md` — Phase 3: Real-time activity sync
