# Prompt 01 — Profile Schema & Mutations

## Goal

Extend the `profiles` Convex table with the 8 rider-profile question fields and a staleness timestamp. Add or update the relevant mutations and queries.

## Context

- Schema is in `convex/schema.ts` — the `profiles` table definition.
- Profile mutations are in `convex/profiles/mutations.ts`.
- Profile queries are in `convex/profiles/queries.ts`.
- Validation helpers are in `convex/lib/validation.ts` and `convex/profiles/mutations.ts` (PROFILE_RANGES + validateProfileMeasurements).
- The existing `weightUpdatedAt` field (set when `weightKg` changes) is the model for the new staleness timestamp.

## New Fields to Add to `profiles` Table

```typescript
// Rider profile questions (bike-agnostic, asked once)
experienceLevel: v.optional(v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced")
)),
weeklyHours: v.optional(v.union(
  v.literal("0-3"),
  v.literal("3-6"),
  v.literal("6-10"),
  v.literal("10-15"),
  v.literal("15+")
)),
typicalRideLength: v.optional(v.union(
  v.literal("short"),
  v.literal("medium"),
  v.literal("long"),
  v.literal("ultra")
)),
hasPain: v.optional(v.union(v.literal("yes"), v.literal("no"))),
painAreas: v.optional(v.array(v.string())),
kneePainTiming: v.optional(v.string()),
painSeverity: v.optional(v.number()),
positionPriority: v.optional(v.union(
  v.literal("comfort"),
  v.literal("balanced"),
  v.literal("performance")
)),

// Staleness tracking — set to Date.now() whenever any rider profile
// question field above changes. Used to invalidate fit recommendations.
riderProfileUpdatedAt: v.optional(v.number()),
```

## New Mutation: `updateRiderProfile`

Add a new exported mutation in `convex/profiles/mutations.ts`:

```typescript
export const updateRiderProfile = mutation({
  args: {
    experienceLevel: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    weeklyHours: v.union(v.literal("0-3"), v.literal("3-6"), v.literal("6-10"), v.literal("10-15"), v.literal("15+")),
    typicalRideLength: v.union(v.literal("short"), v.literal("medium"), v.literal("long"), v.literal("ultra")),
    hasPain: v.union(v.literal("yes"), v.literal("no")),
    painAreas: v.array(v.string()),
    kneePainTiming: v.optional(v.string()),
    painSeverity: v.optional(v.number()),
    positionPriority: v.union(v.literal("comfort"), v.literal("balanced"), v.literal("performance")),
  },
  handler: async (ctx, args) => {
    const userId = requireUserId(ctx);
    const profile = await getProfileByUser(ctx, userId); // throw if not found

    // Detect if any field actually changed to avoid spurious staleness updates
    const hasChange =
      profile.experienceLevel !== args.experienceLevel ||
      profile.weeklyHours !== args.weeklyHours ||
      profile.typicalRideLength !== args.typicalRideLength ||
      profile.hasPain !== args.hasPain ||
      // ... etc.
      profile.positionPriority !== args.positionPriority;

    await ctx.db.patch(profile._id, {
      ...args,
      updatedAt: Date.now(),
      ...(hasChange ? { riderProfileUpdatedAt: Date.now() } : {}),
    });

    return profile._id;
  },
});
```

## Query Update: `getMyProfile`

The existing `getMyProfile` query already returns the full profile document, so no changes are needed — the new fields will be included automatically once the schema is updated.

## Helper: `isRiderProfileComplete`

Add a helper function (can live in `convex/profiles/queries.ts` or `convex/lib/profile.ts`) that checks all required rider profile fields are set:

```typescript
export function isRiderProfileComplete(profile: Doc<"profiles">): boolean {
  return (
    profile.experienceLevel !== undefined &&
    profile.weeklyHours !== undefined &&
    profile.typicalRideLength !== undefined &&
    profile.hasPain !== undefined &&
    profile.positionPriority !== undefined
    // painAreas is only required if hasPain === "yes"
    && (profile.hasPain !== "yes" || (profile.painAreas?.length ?? 0) > 0)
  );
}
```

Also expose this as a computed field in `getMyProfile` or a separate `getProfileStatus` query so the frontend can use it as a gating signal.

## Also Update `upsert` Mutation

The full-profile `upsert` mutation (used by the MeasurementWizard) should optionally accept the new fields so existing callers don't break. All new fields should be `v.optional(...)` there.

## Validation

`painSeverity` is a scale 1–5. Add it to `PROFILE_RANGES` and `validateProfileMeasurements`.

## Files to Change

- `convex/schema.ts` — add 9 new fields to `profiles` table
- `convex/profiles/mutations.ts` — add `updateRiderProfile`, update `upsert` optional args
- `convex/profiles/queries.ts` — add `isRiderProfileComplete` logic / `getProfileStatus` query
