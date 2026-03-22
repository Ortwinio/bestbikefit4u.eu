# Step 01 — Schema, Token Refresh & Backend

## Goal

Add the `stravaGearId` field to the `bikes` table, implement token refresh logic, and build the Convex action that fetches bikes from Strava and imports selected ones.

---

## Pre-requisites

- Strava OAuth integration is working (access token, refresh token, and `tokenExpiresAt` are stored in `integrations`)
- `bikes.mutations.create` exists and is fully typed

---

## 1. Schema — add `stravaGearId` to `bikes`

In `convex/schema.ts`, add one optional field to the `bikes` table:

```ts
stravaGearId: v.optional(v.string()),
```

This is the Strava gear ID (e.g. `"b1234567"`). Used to detect already-imported bikes and prevent duplicates.

Also add an index:

```ts
.index("by_strava_gear", ["stravaGearId"])
```

---

## 2. Token refresh helper

Create `convex/integrations/stravaToken.ts`:

```ts
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

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

  // Token still valid (5 min buffer)
  if (integration.tokenExpiresAt && Date.now() < integration.tokenExpiresAt - 5 * 60 * 1000) {
    return integration.accessToken;
  }

  // Refresh
  if (!integration.refreshToken) {
    throw new Error("No refresh token available");
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

## 3. Internal query — get user's already-imported Strava gear IDs

In `convex/bikes/queries.ts`, add an internal query:

```ts
export const getStravaGearIds = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const bikes = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return new Set(
      bikes
        .map((b) => b.stravaGearId)
        .filter((id): id is string => id !== undefined)
    );
  },
});
```

---

## 4. Public query — list Strava bikes with import status

Add to `convex/integrations/queries.ts`:

```ts
// Returns summary of Strava bikes (no API call — from stored athlete data only)
// Actual gear detail is fetched in the action.
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

    if (!integration || integration.accessStatus !== "active") {
      return null;
    }

    // stravaGearSummary is stored as JSON from the athlete endpoint
    // (added in step below — see §5)
    if (!integration.stravaGearSummaryJson) return null;

    return JSON.parse(integration.stravaGearSummaryJson) as Array<{
      id: string;
      name: string;
      primary: boolean;
      distanceM: number;
    }>;
  },
});
```

---

## 5. Schema — add `stravaGearSummaryJson` to `integrations`

In `convex/schema.ts`, add to the `integrations` table fields:

```ts
stravaGearSummaryJson: v.optional(v.string()),
```

Also update `upsertStravaIntegration` in `convex/integrations/mutations.ts` to include `stravaGearSummaryJson` in the `fields` object validator.

Update `convex/http.ts` — in the Strava callback, after token exchange, fetch the full athlete and store the bike summary:

```ts
// In the callback handler, after parsing tokenData:
const athleteRes = await fetch("https://www.strava.com/api/v3/athlete", {
  headers: { Authorization: `Bearer ${tokenData.access_token}` },
});
if (athleteRes.ok) {
  const athleteDetail = await athleteRes.json() as {
    bikes?: Array<{ id: string; name: string; primary: boolean; distance: number }>;
  };
  if (athleteDetail.bikes) {
    fields.stravaGearSummaryJson = JSON.stringify(
      athleteDetail.bikes.map((b) => ({
        id: b.id,
        name: b.name,
        primary: b.primary,
        distanceM: b.distance,
      }))
    );
  }
}
```

---

## 6. Internal mutation — create bike from Strava gear

In `convex/integrations/mutations.ts`, add:

```ts
export const createBikeFromStrava = internalMutation({
  args: {
    userId: v.id("users"),
    stravaGearId: v.string(),
    name: v.string(),
    bikeType: v.union(
      v.literal("road"),
      v.literal("gravel"),
      v.literal("mountain"),
      v.literal("hybrid"),
      v.literal("tt_triathlon"),
      v.literal("cyclocross"),
      v.literal("touring"),
      v.literal("city")
    ),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotency: skip if already imported
    const existing = await ctx.db
      .query("bikes")
      .withIndex("by_strava_gear", (q) => q.eq("stravaGearId", args.stravaGearId))
      .unique();
    if (existing) return existing._id;

    const now = Date.now();
    return await ctx.db.insert("bikes", {
      userId: args.userId,
      stravaGearId: args.stravaGearId,
      name: args.name,
      bikeType: args.bikeType,
      brand: args.brand,
      model: args.model,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});
```

---

## 7. Public action — import bikes from Strava

In `convex/integrations/actions.ts`, add:

```ts
// Maps Strava frame_type integer to our bikeType union
function stravaFrameTypeToBikeType(frameType: number | null | undefined): BikeType {
  switch (frameType) {
    case 1: return "mountain";
    case 2: return "cyclocross";
    case 3: return "road";
    case 4: return "tt_triathlon";
    default: return "road";
  }
}

type BikeType = "road" | "gravel" | "mountain" | "hybrid" | "tt_triathlon" | "cyclocross" | "touring" | "city";

export const importBikesFromStrava = action({
  args: {
    // Array of Strava gear IDs selected by the user to import
    gearIds: v.array(v.string()),
  },
  handler: async (ctx, { gearIds }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (gearIds.length === 0) return { imported: 0, skipped: 0 };

    const accessToken = await getFreshStravaToken(ctx, userId);

    let imported = 0;
    let skipped = 0;

    for (const gearId of gearIds) {
      const gearRes = await fetch(`https://www.strava.com/api/v3/gear/${gearId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!gearRes.ok) {
        skipped++;
        continue;
      }

      const gear = (await gearRes.json()) as {
        id: string;
        name: string;
        brand_name?: string;
        model_name?: string;
        frame_type?: number;
        description?: string;
        primary: boolean;
      };

      const bikeType = stravaFrameTypeToBikeType(gear.frame_type);

      const bikeId = await ctx.runMutation(
        internal.integrations.mutations.createBikeFromStrava,
        {
          userId,
          stravaGearId: gear.id,
          name: gear.name,
          bikeType,
          brand: gear.brand_name || undefined,
          model: gear.model_name || undefined,
          notes: gear.description || undefined,
        }
      );

      if (bikeId) imported++;
      else skipped++;
    }

    return { imported, skipped };
  },
});
```

---

## Acceptance criteria

- [ ] `bikes` table has `stravaGearId` field and `by_strava_gear` index
- [ ] `integrations` table has `stravaGearSummaryJson` field
- [ ] Strava callback stores bike summary JSON after successful connect
- [ ] `getFreshStravaToken` refreshes expired tokens transparently
- [ ] `importBikesFromStrava` action creates bikes in the database
- [ ] Re-importing the same gear ID is a no-op (idempotent)
- [ ] `npm run typecheck` passes
