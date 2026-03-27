# Prompt 05 — Staleness Detection & Recalculation UI

## Goal

When a rider profile question is changed, mark affected fit recommendations as stale and surface a clear warning + recalculate action in the fit history.

## Staleness Logic

A recommendation is stale if:

```
profile.riderProfileUpdatedAt > recommendation.riderProfileUpdatedAt
```

Edge cases:
- `recommendation.riderProfileUpdatedAt` is `undefined` (created before this feature) → treat as **stale** (conservative)
- `profile.riderProfileUpdatedAt` is `undefined` (rider profile questions never updated) → treat as **not stale**

## Backend

### Query: `getSessionsWithRecommendations` (or `getFitHistory`)

The fit history query (used by `BikeWithFitHistory`) should include a `isStale` boolean alongside each recommendation. Compute it server-side:

```typescript
const isStale =
  profile.riderProfileUpdatedAt !== undefined &&
  (rec.riderProfileUpdatedAt === undefined ||
    profile.riderProfileUpdatedAt > rec.riderProfileUpdatedAt);
```

Add `isStale` to the returned shape so the frontend can display the warning without additional computation.

### Mutation: `recalculateSession`

Add a new mutation in `convex/recommendations/mutations.ts`:

```typescript
export const recalculateSession = mutation({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    const userId = requireUserId(ctx);
    // Verify ownership
    // Delete existing recommendation for this session
    // Re-run generate() logic (or schedule generateFromData)
    // Set session status back to "processing"
  }
});
```

This allows the user to trigger a fresh recommendation using their updated rider profile data.

## Frontend

### `BikeWithFitHistory` component

In `src/components/bikes/BikeWithFitHistory.tsx`, the sessions map currently renders metrics and a "View Report" button. Add stale state handling:

**When `isStale` is true:**

Show a warning banner above the metrics:
```
⚠  Your riding profile has changed. This result may no longer be accurate.
   [Recalculate →]
```

Style: `border-warning/20 bg-warning/5` with `AlertTriangle` icon (matching the existing delete dialog warning panel pattern).

The "Recalculate" button calls `api.recommendations.mutations.recalculateSession` and shows an `isLoading` state while processing.

**When session status becomes `"processing"` after recalculate:**
The existing status badge will show "Processing" automatically — no extra UI needed.

### Fit History page / dashboard

If any session across all bikes is stale, consider showing a summary notification at the top of the dashboard or fit history page:
> "Your riding profile was updated. X fit session(s) may need recalculation."

This is optional and can be deferred.

## i18n

Add under `messages.fitHistory`:

```typescript
stale: {
  warning: "Your riding profile has changed. This result may no longer be accurate.",
  recalculate: "Recalculate",
  recalculating: "Recalculating...",
  recalculateSuccess: "Recalculation started. Your new results will appear shortly.",
}
```

Both EN and NL.

## Files to Change

- `convex/recommendations/mutations.ts` — add `recalculateSession` mutation
- `convex/sessions/queries.ts` (or fit history query) — add `isStale` to returned data shape
- `src/components/bikes/BikeWithFitHistory.tsx` — add stale warning + recalculate button
- `src/i18n/messages/en.ts` — add `fitHistory.stale` messages
- `src/i18n/messages/nl.ts` — same for NL
