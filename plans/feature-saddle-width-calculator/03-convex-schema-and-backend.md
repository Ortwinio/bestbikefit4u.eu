# Prompt 03 — Convex Schema Extension and Backend

## Context

Project: BestBikeFit4U — Next.js 16, Convex backend, TypeScript.

You are extending the Convex schema and implementing backend mutations and queries for the saddle width calculator. Prompt 02 must be completed first (the calculation engine must exist at `src/lib/saddle-width-engine/`).

---

## Prerequisite reading

Before starting:
- Read `convex/schema.ts` to understand existing table structures, especially `profiles` and `bikes`
- Read `convex/lib/authz.ts` to understand `requireUserId()` usage
- Read `convex/bikes/mutations.ts` for a mutation file pattern to follow
- Read `src/lib/saddle-width-engine/types.ts` to understand the engine's input/output types

---

## Part A — Extend `convex/schema.ts`

### 1. Add `hipCircumferenceCm` to `profiles` table

Find the `profiles` table definition and add after the existing `sitBoneWidthMm: v.optional(v.number())` line:

```typescript
hipCircumferenceCm: v.optional(v.number()),   // for saddle width fallback estimation; 70-160 cm typical
```

### 2. Add `saddleWidthSessions` table

Add a new table after the `wheelsets` table (or at the end of the schema, before the closing brace):

```typescript
saddleWidthSessions: defineTable({
  userId: v.optional(v.id("users")),           // null for anonymous public sessions
  bikeId: v.optional(v.id("bikes")),           // context bike, if provided

  sessionType: v.union(v.literal("public"), v.literal("dashboard")),
  measurementMethod: v.union(v.literal("measured"), v.literal("estimated")),

  // Anatomy inputs
  sitBoneWidthMm: v.optional(v.number()),
  heightCm: v.optional(v.number()),
  weightKg: v.optional(v.number()),
  hipCircumferenceCm: v.optional(v.number()),
  flexibilityScore: v.optional(v.number()),
  coreStabilityScore: v.optional(v.number()),

  // Riding inputs
  ridingType: v.string(),
  postureCategory: v.string(),
  indoorOutdoor: v.optional(v.string()),
  typicalRideLength: v.optional(v.string()),

  // Current saddle (dashboard only, all optional)
  currentSaddleWidthMm: v.optional(v.number()),
  currentSaddleShape: v.optional(v.string()),
  currentSaddleTilt: v.optional(v.string()),
  currentSaddleSatisfaction: v.optional(v.string()),

  // Symptoms (dashboard only)
  symptoms: v.optional(v.array(v.string())),

  // Width outputs
  recommendedWidthMm: v.number(),
  widthRangeMinMm: v.number(),
  widthRangeMaxMm: v.number(),
  primaryWidthClass: v.string(),

  // Suitability outputs
  saddleFamily: v.string(),
  noseType: v.string(),
  profileShape: v.string(),
  cutoutRecommended: v.boolean(),
  paddingPreference: v.string(),

  // Scores and explanations
  confidenceScore: v.number(),
  confidenceLevel: v.string(),
  widthMatchScore: v.optional(v.number()),
  fitInteractionWarnings: v.optional(v.array(v.string())),
  explanationKey: v.string(),

  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_session_type", ["userId", "sessionType"])
  .index("by_bike", ["bikeId"])
  .index("by_created_at", ["createdAt"])
```

---

## Part B — Mutations

Create `convex/saddleWidth/mutations.ts`.

### `createPublicSaddleWidthSession`

No authentication required. Public calculator saves anonymous sessions for analytics.

```typescript
export const createPublicSaddleWidthSession = mutation({
  args: {
    measurementMethod: v.union(v.literal("measured"), v.literal("estimated")),
    sitBoneWidthMm: v.optional(v.number()),
    heightCm: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    hipCircumferenceCm: v.optional(v.number()),
    ridingType: v.string(),
    postureCategory: v.string(),
    // outputs (pre-calculated in the browser)
    recommendedWidthMm: v.number(),
    widthRangeMinMm: v.number(),
    widthRangeMaxMm: v.number(),
    primaryWidthClass: v.string(),
    saddleFamily: v.string(),
    noseType: v.string(),
    profileShape: v.string(),
    cutoutRecommended: v.boolean(),
    paddingPreference: v.string(),
    confidenceScore: v.number(),
    confidenceLevel: v.string(),
    explanationKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("saddleWidthSessions", {
      userId: undefined,
      bikeId: undefined,
      sessionType: "public",
      ...args,
      createdAt: Date.now(),
    });
  },
});
```

### `createDashboardSaddleWidthSession`

Requires authentication. Accepts the full input set including symptoms, current saddle, and fit warnings.

```typescript
export const createDashboardSaddleWidthSession = mutation({
  args: {
    bikeId: v.optional(v.id("bikes")),
    measurementMethod: v.union(v.literal("measured"), v.literal("estimated")),
    sitBoneWidthMm: v.optional(v.number()),
    heightCm: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    hipCircumferenceCm: v.optional(v.number()),
    flexibilityScore: v.optional(v.number()),
    coreStabilityScore: v.optional(v.number()),
    ridingType: v.string(),
    postureCategory: v.string(),
    indoorOutdoor: v.optional(v.string()),
    typicalRideLength: v.optional(v.string()),
    currentSaddleWidthMm: v.optional(v.number()),
    currentSaddleShape: v.optional(v.string()),
    currentSaddleTilt: v.optional(v.string()),
    currentSaddleSatisfaction: v.optional(v.string()),
    symptoms: v.optional(v.array(v.string())),
    recommendedWidthMm: v.number(),
    widthRangeMinMm: v.number(),
    widthRangeMaxMm: v.number(),
    primaryWidthClass: v.string(),
    saddleFamily: v.string(),
    noseType: v.string(),
    profileShape: v.string(),
    cutoutRecommended: v.boolean(),
    paddingPreference: v.string(),
    confidenceScore: v.number(),
    confidenceLevel: v.string(),
    widthMatchScore: v.optional(v.number()),
    fitInteractionWarnings: v.optional(v.array(v.string())),
    explanationKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    // If bikeId provided, verify ownership
    if (args.bikeId) {
      await requireBikeOwner(ctx, args.bikeId, userId);
    }
    return await ctx.db.insert("saddleWidthSessions", {
      userId,
      sessionType: "dashboard",
      ...args,
      createdAt: Date.now(),
    });
  },
});
```

Import `requireUserId` from `../lib/authz` and `requireBikeOwner` from `../lib/authz` (or `../bikes/lib/authz` — check the existing pattern in `convex/bikes/mutations.ts`).

---

## Part C — Queries

Create `convex/saddleWidth/queries.ts`.

### `getLatestSaddleWidthSession`

Returns the most recent dashboard session for the authenticated user.

```typescript
export const getLatestSaddleWidthSession = query({
  args: { bikeId: v.optional(v.id("bikes")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    let q = ctx.db
      .query("saddleWidthSessions")
      .withIndex("by_user_session_type", (q) =>
        q.eq("userId", userId).eq("sessionType", "dashboard")
      )
      .order("desc");
    if (args.bikeId) {
      q = q.filter((q) => q.eq(q.field("bikeId"), args.bikeId));
    }
    return await q.first();
  },
});
```

### `listSaddleWidthSessions`

Returns paginated list of dashboard sessions for history display.

```typescript
export const listSaddleWidthSessions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("saddleWidthSessions")
      .withIndex("by_user_session_type", (q) =>
        q.eq("userId", userId).eq("sessionType", "dashboard")
      )
      .order("desc")
      .take(args.limit ?? 10);
  },
});
```

---

## Part D — Update `convex/_generated/api.d.ts`

After adding the new mutations and queries, run `npx convex dev` (or `npx convex codegen`) to regenerate `convex/_generated/api.d.ts`. Do not manually edit the generated file.

If auto-generation is not possible in this context, note in a message file that it needs to be run manually.

---

## Part E — Validation

After completing this prompt:

1. Run `npx tsc --noEmit` — must pass with no errors
2. Confirm `saddleWidthSessions` appears in the Convex dashboard (if connected)
3. Confirm `profiles` table now includes `hipCircumferenceCm` in the schema
