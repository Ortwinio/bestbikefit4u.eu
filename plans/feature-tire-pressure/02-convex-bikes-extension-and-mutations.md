# Prompt 02 — Convex Mutations & Queries for All Tire Pressure Tables

## Context

Project: BestBikeFit4U — Next.js 16, Convex backend, TypeScript.

**Prerequisite**: Prompt 01 must have been executed. The following are assumed to exist in `convex/schema.ts`:
- Tables `wheelsets`, `tireSetups`, `pressureProfiles`, `pressureCalculations`
- Extended `bikes` table with fields `discipline`, `bikeWeightKg`, `photoUrl`, `fitProfileId`, `brand`, `model`

Auth pattern: always call `requireUserId(ctx)` from `convex/lib/authz.ts` at the top of every mutation/query handler. For bike-owned resources (wheelsets, tire setups, etc.) verify ownership by checking the chain: `tireSetup → wheelset → bike → userId`.

Convex file structure convention in this project: each domain gets its own folder under `convex/`, with `mutations.ts` and `queries.ts`. Example: `convex/bikes/mutations.ts`, `convex/bikes/queries.ts`.

---

## Part A — Extend `convex/bikes/mutations.ts`

The file already exists and exports `create`, `update`, `remove`. Extend it:

### Update `create` mutation

Add the new optional fields to `args`:

```ts
discipline: v.optional(v.union(
  v.literal("road"), v.literal("gravel"), v.literal("mtb"), v.literal("tt")
)),
bikeWeightKg: v.optional(v.number()),
photoUrl: v.optional(v.string()),
fitProfileId: v.optional(v.id("profiles")),
brand: v.optional(v.string()),
model: v.optional(v.string()),
```

Pass them through to `ctx.db.insert("bikes", { ... })`.

### Update `update` mutation

Add the same optional fields to `args` and handle them in the partial update logic.

---

## Part B — Extend `convex/bikes/queries.ts`

Add or update the following query if it doesn't exist already:

### `get` query

```ts
export const get = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const bike = await ctx.db.get(args.bikeId);
    if (!bike || bike.userId !== userId) return null;
    return bike;
  },
});
```

### `list` query

```ts
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
```

---

## Part C — Create `convex/wheelsets/mutations.ts`

```
convex/wheelsets/mutations.ts
```

Export the following mutations. All are auth-guarded.

### `create`

Args:
```ts
bikeId: v.id("bikes"),
name: v.string(),
rimType: v.union(v.literal("hooked"), v.literal("hookless")),
internalRimWidthFrontMm: v.optional(v.number()),
internalRimWidthRearMm: v.optional(v.number()),
isActive: v.optional(v.boolean()),
```

Handler:
1. `const userId = await requireUserId(ctx)`
2. Verify bike belongs to user: fetch bike from DB, throw if `bike.userId !== userId`
3. If `isActive === true`, set all other wheelsets for this bike to `isActive: false` first
4. Insert into `wheelsets` with `userId`, `bikeId`, `createdAt: Date.now()`, `updatedAt: Date.now()`
5. Return the new ID

### `update`

Args: `wheelsetId: v.id("wheelsets")` + same optional fields as create (except `bikeId`).

Handler:
1. Fetch wheelset, verify `wheelset.userId === (await requireUserId(ctx))`
2. If `isActive === true`, deactivate all siblings for the same `bikeId`
3. Patch the wheelset

### `remove`

Args: `wheelsetId: v.id("wheelsets")`

Handler:
1. Verify ownership
2. Delete all `tireSetups` where `wheelsetId === args.wheelsetId` (cascade)
3. Delete the wheelset

---

## Part D — Create `convex/wheelsets/queries.ts`

### `listForBike`

```ts
args: { bikeId: v.id("bikes") }
```

Returns all wheelsets for the bike, in descending `createdAt` order, after verifying the bike belongs to the current user.

### `get`

```ts
args: { wheelsetId: v.id("wheelsets") }
```

Returns the wheelset if it belongs to the current user, else null.

---

## Part E — Create `convex/tireSetups/mutations.ts`

### `create`

Args:
```ts
wheelsetId: v.id("wheelsets"),
name: v.string(),
brand: v.optional(v.string()),
model: v.optional(v.string()),
widthFrontMm: v.number(),
widthRearMm: v.number(),
tubeType: v.union(
  v.literal("inner_tube"),
  v.literal("latex_tube"),
  v.literal("tubeless")
),
casingType: v.optional(v.union(
  v.literal("race_light"),
  v.literal("allround"),
  v.literal("reinforced")
)),
maxPressureBar: v.optional(v.number()),
isActive: v.optional(v.boolean()),
```

Handler:
1. `requireUserId(ctx)` → `userId`
2. Fetch wheelset, then its bike; verify `bike.userId === userId`
3. If `isActive === true`, deactivate all other tire setups for the same wheelset
4. Insert with `userId`, `wheelsetId`, `createdAt`, `updatedAt`

### `update`

Args: `tireSetupId: v.id("tireSetups")` + all optional fields from create (except `wheelsetId`).

Same ownership check + isActive deactivation logic.

### `remove`

Args: `tireSetupId: v.id("tireSetups")`

Verify ownership, then delete.

---

## Part F — Create `convex/tireSetups/queries.ts`

### `listForWheelset`

```ts
args: { wheelsetId: v.id("wheelsets") }
```

Verify user owns the wheelset's bike, return all tire setups.

### `get`

```ts
args: { tireSetupId: v.id("tireSetups") }
```

---

## Part G — Create `convex/pressureProfiles/mutations.ts`

### `save`

Creates or updates a profile. If a profile with the same `bikeId + useCase` already exists for the user, update it. Otherwise insert.

Args:
```ts
bikeId: v.id("bikes"),
tireSetupId: v.id("tireSetups"),
name: v.string(),
useCase: v.union(
  v.literal("race"),
  v.literal("endurance"),
  v.literal("wet_weather"),
  v.literal("gravel_mixed"),
  v.literal("comfort"),
  v.literal("custom")
),
targetSurface: v.optional(v.string()),
targetGoal: v.optional(v.string()),
recommendedFrontBar: v.number(),
recommendedRearBar: v.number(),
```

Handler: `requireUserId(ctx)` + bike ownership check.

### `remove`

Args: `profileId: v.id("pressureProfiles")`

---

## Part H — Create `convex/pressureProfiles/queries.ts`

### `listForBike`

```ts
args: { bikeId: v.id("bikes") }
```

---

## Part I — Create `convex/pressureCalculations/mutations.ts`

### `save`

Saves a calculation result. This is called after the pressure engine runs client-side.

Args:
```ts
bikeId: v.optional(v.id("bikes")),
tireSetupId: v.optional(v.id("tireSetups")),
sourceType: v.union(
  v.literal("public_basic"),
  v.literal("dashboard_basic"),
  v.literal("dashboard_advanced")
),
inputSnapshot: v.object({
  bodyWeightKg: v.number(),
  bikeWeightKg: v.optional(v.number()),
  extraLuggageKg: v.optional(v.number()),
  discipline: v.union(
    v.literal("road"), v.literal("gravel"), v.literal("mtb"), v.literal("tt")
  ),
  widthFrontMm: v.number(),
  widthRearMm: v.number(),
  tubeType: v.union(
    v.literal("inner_tube"), v.literal("latex_tube"), v.literal("tubeless")
  ),
  casingType: v.optional(v.string()),
  rimType: v.optional(v.union(v.literal("hooked"), v.literal("hookless"))),
  internalRimWidthFrontMm: v.optional(v.number()),
  internalRimWidthRearMm: v.optional(v.number()),
  surface: v.union(
    v.literal("smooth_asphalt"), v.literal("average_asphalt"),
    v.literal("rough_asphalt"), v.literal("hardpack_gravel"),
    v.literal("loose_gravel"), v.literal("trail")
  ),
  ridingGoal: v.optional(v.union(
    v.literal("speed"), v.literal("balance"), v.literal("comfort")
  )),
  isWet: v.optional(v.boolean()),
  routeDistanceKm: v.optional(v.number()),
  routeElevationM: v.optional(v.number()),
  offRoadPercent: v.optional(v.number()),
}),
recommendedFrontBar: v.number(),
recommendedRearBar: v.number(),
recommendedFrontPsi: v.number(),
recommendedRearPsi: v.number(),
currentFrontBar: v.optional(v.number()),
currentRearBar: v.optional(v.number()),
comfortScore: v.optional(v.number()),
gripScore: v.optional(v.number()),
efficiencyScore: v.optional(v.number()),
warningsJson: v.optional(v.string()),
routeContextJson: v.optional(v.string()),
```

Handler: `requireUserId(ctx)` → insert into `pressureCalculations`.

---

## Part J — Create `convex/pressureCalculations/queries.ts`

### `listForBike`

```ts
args: { bikeId: v.id("bikes"), limit: v.optional(v.number()) }
```

Returns calculations for a bike, ordered by `createdAt` descending. Default limit: 20.

### `listForUser`

```ts
args: { limit: v.optional(v.number()) }
```

Returns the most recent calculations across all bikes for the current user. Default limit: 10.

### `getLatestForBike`

```ts
args: { bikeId: v.id("bikes") }
```

Returns the most recent `pressureCalculation` for a bike (used for dashboard card display).

---

## Part K — Update `convex/lib/authz.ts`

Add ownership helpers for the new tables:

```ts
export async function requireWheelsetOwner(ctx: DbCtx, wheelsetId: Id<"wheelsets">) {
  const userId = await requireUserId(ctx);
  const wheelset = await ctx.db.get(wheelsetId);
  if (!wheelset || wheelset.userId !== userId) {
    throw new Error("Wheelset not found");
  }
  return { userId, wheelset };
}

export async function requireTireSetupOwner(ctx: DbCtx, tireSetupId: Id<"tireSetups">) {
  const userId = await requireUserId(ctx);
  const setup = await ctx.db.get(tireSetupId);
  if (!setup || setup.userId !== userId) {
    throw new Error("Tire setup not found");
  }
  return { userId, setup };
}
```

---

## Files to create/modify

- Modify: `convex/bikes/mutations.ts`
- Modify (or create): `convex/bikes/queries.ts`
- Modify: `convex/lib/authz.ts`
- Create: `convex/wheelsets/mutations.ts`
- Create: `convex/wheelsets/queries.ts`
- Create: `convex/tireSetups/mutations.ts`
- Create: `convex/tireSetups/queries.ts`
- Create: `convex/pressureProfiles/mutations.ts`
- Create: `convex/pressureProfiles/queries.ts`
- Create: `convex/pressureCalculations/mutations.ts`
- Create: `convex/pressureCalculations/queries.ts`

No UI files in this prompt.
