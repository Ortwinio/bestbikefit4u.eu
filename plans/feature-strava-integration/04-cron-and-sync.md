# Step 04 — Background Cron Sync (Phase 2)

## Goal

Run a daily background sync for all users with an active Strava integration, with proper rate limit handling and error surface in the UI.

## 1. Cron job

File: `convex/crons.ts` (create if it doesn't exist)

```ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "strava-daily-sync",
  { hourUTC: 3, minuteUTC: 0 },
  internal.integrations.actions.syncAllActiveIntegrations,
);

export default crons;
```

## 2. Sync all active integrations action

Add to `convex/integrations/actions.ts`:

```ts
export const syncAllActiveIntegrations = internalAction({
  args: {},
  handler: async (ctx) => {
    // Query all active integrations
    const activeIntegrations = await ctx.runQuery(
      internal.integrations.queries.getAllActiveIntegrations
    );

    // Schedule each user's import with a delay to spread API calls
    // Strava allows 600 req/15min = 40/min
    // Each user import uses ~2-3 API calls
    // At 40 req/min / 3 calls per user = ~13 users/min = safe rate
    for (let i = 0; i < activeIntegrations.length; i++) {
      await ctx.scheduler.runAfter(
        i * 5000, // 5 seconds between each user
        internal.integrations.actions.importRecentRidesForUser,
        { integrationId: activeIntegrations[i]._id }
      );
    }
  },
});
```

## 3. Internal query for active integrations

Add to `convex/integrations/queries.ts`:

```ts
export const getAllActiveIntegrations = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("integrations")
      .withIndex("by_status", q => q.eq("accessStatus", "active"))
      .collect();
  },
});
```

## 4. Per-user import action (internal)

Refactor `importRecentRides` so it can be called both by the user (from settings) and internally (from cron):

```ts
// Public action — called from client
export const importRecentRides = action({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    // Find integration, call shared importLogic
    await importLogic(ctx, userId);
  },
});

// Internal action — called from cron
export const importRecentRidesForUser = internalAction({
  args: { integrationId: v.id("integrations") },
  handler: async (ctx, args) => {
    const integration = await ctx.runQuery(
      internal.integrations.queries.getById,
      { id: args.integrationId }
    );
    if (!integration) return;
    await importLogic(ctx, integration.userId);
  },
});
```

## 5. Rate limit handling

In `importLogic`, if a 429 response is received:

```ts
if (res.status === 429) {
  // Strava rate limited — schedule a retry in 20 minutes
  const retryAt = Date.now() + 20 * 60 * 1000;
  await ctx.scheduler.runAt(
    retryAt,
    internal.integrations.actions.importRecentRidesForUser,
    { integrationId: integration._id }
  );
  await ctx.db.patch(integration._id, {
    syncErrorMessage: "Rate limited by Strava — will retry automatically",
  });
  return;
}
```

## 6. "Sync now" UI

In the settings page, the "Sync now" button calls the public `importRecentRides` action and shows a loading state while it runs.

```tsx
const [syncing, setSyncing] = useState(false);
const importRides = useAction(api.integrations.actions.importRecentRides);

const handleSyncNow = async () => {
  setSyncing(true);
  try {
    await importRides();
    toast.success(messages.settings.integrations.strava.syncSuccess);
  } catch {
    toast.error(messages.settings.integrations.strava.syncError);
  } finally {
    setSyncing(false);
  }
};
```

## Acceptance Criteria

- [ ] `convex/crons.ts` registers the daily sync at 03:00 UTC
- [ ] Cron triggers `syncAllActiveIntegrations` which schedules per-user imports with 5s spacing
- [ ] Rate limit (429) response triggers an automatic retry after 20 minutes
- [ ] `syncErrorMessage` is set when sync fails and cleared on success
- [ ] Settings page shows `syncErrorMessage` if present
- [ ] "Sync now" button shows loading state during sync
- [ ] `npm run typecheck` passes
