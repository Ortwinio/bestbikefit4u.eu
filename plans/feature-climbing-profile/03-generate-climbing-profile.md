# 03 — Generate secondary climbing profile in the engine

## Goal
When `climbingLevel` is `regular` or `climbing_focused`, run a second calculation pass and attach the result to the session as a climbing-optimised fit profile.

## Steps

### 1. Locate the result generation entry point

Find where `calculateFit` is called to produce the session result (likely `convex/recommendations/seedEngine.ts` or a dedicated results action). This is where the second pass will be added.

### 2. Define the secondary pass inputs

```ts
const CLIMBING_PROFILE_LEVELS: ClimbingLevel[] = ["regular", "climbing_focused"];

function getClimbingProfileInputs(base: FitInputs): FitInputs | null {
  if (!base.climbingLevel || !CLIMBING_PROFILE_LEVELS.includes(base.climbingLevel)) {
    return null;
  }
  // Shift ambition one step toward comfort for climbing profile
  const ambitionShift: Record<Ambition, Ambition> = {
    aero: "performance",
    performance: "balanced",
    balanced: "comfort",
    comfort: "comfort",
  };
  return {
    ...base,
    ambition: ambitionShift[base.ambition],
    climbingLevel: base.climbingLevel,
  };
}
```

### 3. Run the second pass and attach to session result

```ts
const mainProfile = calculateFit(fitInputs);

const climbingInputs = getClimbingProfileInputs(fitInputs);
const climbingProfile = climbingInputs ? calculateFit(climbingInputs) : null;

// Store both in the session result document
await ctx.db.patch(sessionId, {
  fitResult: mainProfile,
  climbingFitResult: climbingProfile ?? undefined,
});
```

### 4. Update the Convex schema

In `convex/schema.ts`, add `climbingFitResult` to the `fitSessions` table (or wherever `fitResult` lives):

```ts
climbingFitResult: v.optional(/* same validator shape as fitResult */),
```

Use the same validator object that already describes `fitResult`. If `fitResult` uses a named validator, reuse it directly.

### 5. Update the session result query

Ensure the query that fetches session results (used by the results page) returns `climbingFitResult` alongside `fitResult`.

## Acceptance criteria
- [ ] Sessions with `climbing_focused` or `regular` level have a non-null `climbingFitResult` in the database
- [ ] Sessions with `rarely` or `occasional` have `climbingFitResult: undefined`
- [ ] The climbing profile values differ meaningfully from the main profile (higher bars, adjusted setback)
- [ ] Schema migration does not break existing session documents (field is optional)
