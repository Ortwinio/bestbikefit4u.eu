# Step 01 — OAuth Connect / Disconnect (Phase 1 MVP)

## Goal

Implement the complete Strava OAuth flow: connect, callback, and disconnect. This is the foundation for all Strava features.

## Pre-requisites

- Strava developer app registered at https://www.strava.com/settings/api
- Env vars set in Convex dashboard:
  - `STRAVA_CLIENT_ID`
  - `STRAVA_CLIENT_SECRET`
  - `SITE_URL` (e.g. `https://bestbikefit4u.com`)
- `integrations` table already in schema (confirmed present)

## 1. Schema additions

Add to the `integrations` table in `convex/schema.ts`:
- `"pending"` to `accessStatus` union (for OAuth in-progress state)
- `athleteStravaWeight: v.optional(v.number())` (Strava athlete weight for cross-reference prompt)
- `rideCount: v.optional(v.number())` (for settings display in Phase 2)
- `totalDistanceKm: v.optional(v.number())` (for settings display in Phase 2)
- `syncErrorMessage: v.optional(v.string())` (last sync error)

Add `"strava"` to `users.profileImageSource` union.

Add `.index("by_status", ["accessStatus"])` to the `integrations` table.

## 2. Convex HTTP actions

Create `convex/http.ts` (or add to existing if it exists) with two routes.

### `/strava/connect` — Initiates OAuth

```ts
http.route({
  path: "/strava/connect",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // 1. Authenticate the user from the request (use getAuthUserId from @convex-dev/auth)
    // 2. Generate 16-byte random state
    // 3. Store state in integrations table:
    //    - accessStatus = "pending"
    //    - oauthState = state
    //    - oauthStateExpiresAt = Date.now() + 15 * 60 * 1000
    // 4. Build Strava authorize URL with:
    //    - client_id = STRAVA_CLIENT_ID
    //    - redirect_uri = SITE_URL + "/api/strava/callback" (or Convex site URL)
    //    - response_type = "code"
    //    - approval_prompt = "auto"
    //    - scope = "read,activity:read"
    //    - state = generated state
    // 5. Return 302 redirect to Strava authorize URL
  }),
});
```

### `/strava/callback` — Handles OAuth return

```ts
http.route({
  path: "/strava/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle user denying access
    if (error === "access_denied") {
      return Response.redirect(`${SITE_URL}/settings?strava=denied`);
    }

    // 1. Find integration record by oauthState value
    // 2. Validate: state matches, not expired, userId matches authenticated user
    // 3. If invalid: redirect to /settings?strava=error&reason=invalid_state
    // 4. Exchange code for tokens:
    //    POST https://www.strava.com/oauth/token
    //    body: { client_id, client_secret, code, grant_type: "authorization_code" }
    // 5. Fetch athlete profile from token response (athlete object included in response)
    // 6. Upsert integration:
    //    - providerUserId = athlete.id.toString()
    //    - athleteName = athlete.firstname + " " + athlete.lastname
    //    - athleteAvatarUrl = athlete.profile (full CDN URL)
    //    - athleteStravaWeight = athlete.weight (if present)
    //    - accessToken = access_token
    //    - refreshToken = refresh_token
    //    - tokenExpiresAt = expires_at * 1000
    //    - accessStatus = "active"
    //    - oauthState = undefined (clear)
    //    - oauthStateExpiresAt = undefined
    // 7. Update users.profile_image_url if user has no existing photo
    //    (or queue a photo import decision — see Step 02)
    // 8. Schedule importRecentRides (Phase 2 — skip for now, add placeholder schedule call)
    // 9. Redirect to /settings?strava=connected
  }),
});
```

## 3. Update `disconnectStrava` mutation

The existing mutation in `convex/integrations/mutations.ts` already clears tokens. Extend it to:
1. Before clearing tokens: call `POST https://www.strava.com/oauth/deauthorize` with the current access token (server-side — use a Convex action that calls the mutation)
2. Also clear: `ridingProfileJson`, `athleteStravaWeight`, `syncErrorMessage`
3. Do NOT clear `athleteName` or `athleteAvatarUrl` from the integration record — keep for display reference
4. Do NOT clear `users.profile_image_url` — the user chose to use that photo

Since deauthorize requires an HTTP call, convert disconnect to a Convex action or create a separate `disconnectStravaAction` that calls the Strava API and then calls `disconnectStrava` mutation.

## 4. Settings page UI

File: `src/app/(dashboard)/settings/page.tsx`

Read the current file before editing. Add a "Connected apps" section.

**State from `getStravaStatus` query:**

```ts
const stravaStatus = useQuery(api.integrations.queries.getStravaStatus);
// Returns: { accessStatus, athleteName, athleteAvatarUrl, lastSyncAt, rideCount, totalDistanceKm }
// Does NOT return accessToken or refreshToken
```

Render:
- If `accessStatus === "not_connected"` or null: show "Connect Strava" button
- If `accessStatus === "pending"`: show "Connecting..." spinner
- If `accessStatus === "active"`: show athlete name, avatar, sync stats, "Sync now", "Disconnect"
- If `accessStatus === "revoked"`: show "Not connected" (same as not_connected)
- If `accessStatus === "error"`: show "Connection error — Reconnect Strava"

**Connect button handler:**
```ts
const handleConnectStrava = () => {
  window.location.href = "/api/strava/connect";
  // Or to the Convex HTTP action URL if using Convex HTTP router
};
```

Note on URL: if using Convex HTTP actions, the URL is `https://{deployment}.convex.site/strava/connect`. For cleanliness, expose a Next.js route handler at `/api/strava/connect` that redirects to the Convex HTTP action URL — this keeps the user-facing URL clean.

## 5. Pre-consent modal

Before redirecting to Strava, show a modal (using `AccessibleDialog` from `@/components/ui`):

Content: see README section E2.

Store `hasShownStravaConsent` in `localStorage` so the modal is not shown again if the user already saw it and reconnects.

## 6. Query update

Update `convex/integrations/queries.ts` `getStravaStatus` to return the new fields:
- `rideCount`, `totalDistanceKm`, `syncErrorMessage`
- Explicitly exclude `accessToken` and `refreshToken` from the return value (they should not be selected)

## 7. i18n

Add to `en.ts` and `nl.ts` — see README section B for all string keys:
```
settings.integrations.title
settings.integrations.strava.title
settings.integrations.strava.description
settings.integrations.strava.connect
settings.integrations.strava.disconnect
settings.integrations.strava.syncNow
settings.integrations.strava.lastSynced
settings.integrations.strava.connected
settings.integrations.strava.error
settings.integrations.strava.reconnect
settings.integrations.strava.pending
settings.integrations.strava.proOnly
settings.integrations.strava.rideStats
settings.integrations.strava.consent.title
settings.integrations.strava.consent.whatWeAccess
settings.integrations.strava.consent.whatWeDoNot
settings.integrations.strava.consent.howWeUse
settings.integrations.strava.consent.confirm
settings.integrations.strava.consent.cancel
settings.integrations.strava.disconnect.confirmTitle
settings.integrations.strava.disconnect.confirmBody
settings.integrations.strava.disconnect.confirm
settings.integrations.strava.disconnect.cancel
```

## 8. Pro gating

In the settings page Strava section:
```ts
const user = useQuery(api.users.queries.getCurrentUser);
const isPro = user?.tier === "pro" || user?.tier === "premium";
```

Free users see the section with a lock icon and "Available on Pro" label. The connect button is visually present but disabled, with an upgrade link.

## Acceptance Criteria

- [ ] "Connect Strava" button in settings initiates OAuth flow
- [ ] State CSRF protection works: invalid state returns error page
- [ ] Successful OAuth: tokens stored server-side, never in query response
- [ ] `accessStatus` transitions: not_connected → pending → active
- [ ] Settings page shows athlete name and avatar when connected
- [ ] "Disconnect" calls Strava deauthorize + clears tokens locally
- [ ] After disconnect, settings returns to "Connect Strava" state
- [ ] User denying Strava access returns to settings with a non-breaking notice
- [ ] Free users see the section locked
- [ ] All strings are in EN + NL
- [ ] `npm run typecheck` passes
