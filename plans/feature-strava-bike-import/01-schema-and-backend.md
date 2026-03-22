# Step 01 — Schema & Backend (v1: Bike Import)

## Goal

Extend the schema for the richer bike data model, build the token-refresh helper, update the Strava callback to cache the bike list, and implement the idempotent bike import action.

---

## Pre-requisites

- Strava OAuth working; `integrations` table stores `accessToken`, `refreshToken`, `tokenExpiresAt`
- `bikes.mutations.create` exists
- `convex/integrations/queries.getStravaIntegrationForUser` (internal) exists

---

## 1. Schema — `bikes` table additions

In `convex/schema.ts`, add to the `bikes` table:

```ts
// Strava import fields
source: v.optional(v.union(
  v.literal("manual"),
  v.literal("strava"),
  v.literal("admin_import")
)),
stravaGearId: v.optional(v.string()),
stravaPrimary: v.optional(v.boolean()),

// Type classification audit trail
bikeTypeSource: v.optional(v.union(
  v.literal("user"),
  v.literal("strava_frame_type"),
  v.literal("inferred_from_usage"),
  v.literal("admin_matched")
)),

// Usage data (populated from Strava gear endpoint at import, enriched by v1.1)
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

Add index:

```ts
.index("by_strava_gear", ["stravaGearId"])
```

> **Do not remove existing fields.** These additions are purely additive.

---

## 2. Schema — `integrations` table additions

Add to the `integrations` table fields:

```ts
stravaGearSummaryJson: v.optional(v.string()),  // JSON of bikes[] from athlete endpoint
lastActivitySyncAt: v.optional(v.number()),     // used in v1.1 for incremental sync
```

Also add both fields to the `fields` object in `upsertStravaIntegration` (mutations.ts).

---

## 3. Schema — new `bikeActivities` table

Add this table for v1.1. Define it now so the schema is ready:

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

---

## 4. Token refresh helper

Create `convex/integrations/stravaToken.ts`:

```ts
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Returns a valid Strava access token for userId.
 * Refreshes automatically if the stored token is expired or within 5 minutes of expiry.
 */
export async function getFreshStravaToken(
  ctx: ActionCtx,
  userId: Id<"users">
): Promise<string> {
  const integration = await ctx.runQuery(
    internal.integrations.queries.getStravaIntegrationForUser,
    { userId }
  );

  if (!integration?.accessToken) {
    throw new Error("Strava not connected");
  }

  const BUFFER_MS = 5 * 60 * 1000;
  if (
    integration.tokenExpiresAt &&
    Date.now() < integration.tokenExpiresAt - BUFFER_MS
  ) {
    return integration.accessToken;
  }

  if (!integration.refreshToken) {
    throw new Error("No Strava refresh token stored");
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: integration.refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh Strava token");
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };

  await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
    userId,
    fields: {
      accessStatus: "active",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: data.expires_at * 1000,
    },
  });

  return data.access_token;
}
```

---

## 5. Update Strava callback to cache bike list

In `convex/http.ts`, after a successful token exchange, fetch the full athlete and cache the bike summary:

```ts
// After persisting the integration with tokens, fetch full athlete detail:
try {
  const athleteRes = await fetch("https://www.strava.com/api/v3/athlete", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (athleteRes.ok) {
    const athleteDetail = (await athleteRes.json()) as {
      bikes?: Array<{
        id: string;
        name: string;
        primary: boolean;
        distance: number;
      }>;
    };
    if (athleteDetail.bikes?.length) {
      await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
        userId: integration.userId,
        fields: {
          stravaGearSummaryJson: JSON.stringify(
            athleteDetail.bikes.map((b) => ({
              id: b.id,
              name: b.name,
              primary: b.primary,
              distanceMeters: b.distance,
            }))
          ),
        },
      });
    }
  }
} catch {
  // Non-fatal — user can still connect; bike list fetched on demand
}
```

---

## 6. Public query — gear summary

In `convex/integrations/queries.ts`:

```ts
export const getStravaGearSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();

    if (!integration || integration.accessStatus !== "active") return null;
    if (!integration.stravaGearSummaryJson) return null;

    return JSON.parse(integration.stravaGearSummaryJson) as Array<{
      id: string;
      name: string;
      primary: boolean;
      distanceMeters: number;
    }>;
  },
});
```

---

## 7. bikeType mapping helper

In `convex/integrations/actions.ts`, add a pure function (not exported):

```ts
type BikeType =
  | "road" | "gravel" | "mountain" | "hybrid"
  | "tt_triathlon" | "cyclocross" | "touring" | "city";

// Returns undefined for unknown frame types — do not default to "road" in DB.
function stravaFrameTypeToBikeType(frameType: number | null | undefined): BikeType | undefined {
  switch (frameType) {
    case 1: return "mountain";
    case 2: return "cyclocross";
    case 3: return "road";
    case 4: return "tt_triathlon";
    default: return undefined;
  }
}
```

---

## 8. Internal mutation — create or update bike from Strava

In `convex/integrations/mutations.ts`:

```ts
export const upsertBikeFromStrava = internalMutation({
  args: {
    userId: v.id("users"),
    stravaGearId: v.string(),
    name: v.string(),
    stravaPrimary: v.boolean(),
    lifetimeDistanceMeters: v.number(),
    bikeType: v.optional(/* same union as bikes table */),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bikes")
      .withIndex("by_strava_gear", (q) => q.eq("stravaGearId", args.stravaGearId))
      .unique();

    if (existing) {
      // Update distance and primary flag, but NEVER overwrite user-corrected bikeType
      await ctx.db.patch(existing._id, {
        stravaPrimary: args.stravaPrimary,
        lifetimeDistanceMeters: args.lifetimeDistanceMeters,
        lastStravaSync: Date.now(),
        // bikeType only updated if not user-corrected
        ...(existing.bikeTypeSource !== "user" && args.bikeType
          ? { bikeType: args.bikeType, bikeTypeSource: "strava_frame_type" as const }
          : {}),
      });
      return { id: existing._id, created: false };
    }

    const now = Date.now();
    const id = await ctx.db.insert("bikes", {
      userId: args.userId,
      source: "strava",
      stravaGearId: args.stravaGearId,
      stravaPrimary: args.stravaPrimary,
      name: args.name,
      bikeType: args.bikeType,
      bikeTypeSource: args.bikeType ? "strava_frame_type" : undefined,
      brand: args.brand,
      model: args.model,
      notes: args.notes,
      lifetimeDistanceMeters: args.lifetimeDistanceMeters,
      lastStravaSync: now,
      createdAt: now,
      updatedAt: now,
    });
    return { id, created: true };
  },
});
```

---

## 9. Public action — import selected bikes

In `convex/integrations/actions.ts`:

```ts
export const importBikesFromStrava = action({
  args: {
    gearIds: v.array(v.string()),
  },
  handler: async (ctx, { gearIds }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (gearIds.length === 0) return { imported: 0, skipped: 0, needsTypeConfirm: [] as string[] };

    const accessToken = await getFreshStravaToken(ctx, userId);

    let imported = 0;
    let skipped = 0;
    const needsTypeConfirm: string[] = []; // gear IDs with unknown frame_type

    for (const gearId of gearIds) {
      const gearRes = await fetch(`https://www.strava.com/api/v3/gear/${gearId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!gearRes.ok) { skipped++; continue; }

      const gear = (await gearRes.json()) as {
        id: string;
        name: string;
        primary: boolean;
        distance: number;
        brand_name?: string;
        model_name?: string;
        frame_type?: number;
        description?: string;
      };

      const bikeType = stravaFrameTypeToBikeType(gear.frame_type);
      if (!bikeType) needsTypeConfirm.push(gear.id);

      const result = await ctx.runMutation(
        internal.integrations.mutations.upsertBikeFromStrava,
        {
          userId,
          stravaGearId: gear.id,
          name: gear.name,
          stravaPrimary: gear.primary,
          lifetimeDistanceMeters: gear.distance,
          bikeType,
          brand: gear.brand_name || undefined,
          model: gear.model_name || undefined,
          notes: gear.description || undefined,
        }
      );

      if (result.created) imported++;
      else skipped++;
    }

    return { imported, skipped, needsTypeConfirm };
  },
});
```

`needsTypeConfirm` is returned so the UI can open the post-import type-selection wizard for those bikes.

---

## Acceptance criteria

- [ ] `bikes` table has all new fields and the `by_strava_gear` index
- [ ] `integrations` table has `stravaGearSummaryJson` and `lastActivitySyncAt`
- [ ] `bikeActivities` table is defined (even if empty until v1.1)
- [ ] Strava callback stores bike list JSON after successful connect
- [ ] `getFreshStravaToken` refreshes expired tokens before any API call
- [ ] `importBikesFromStrava` creates new bike records and skips existing ones
- [ ] Existing user-corrected `bikeType` (`bikeTypeSource = "user"`) is never overwritten
- [ ] Unknown `frame_type` leaves `bikeType` unset and returns gear ID in `needsTypeConfirm`
- [ ] `npm run typecheck` passes
