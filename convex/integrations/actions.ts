import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "../_generated/api";
import { action, internalAction, type ActionCtx } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import {
  fetchStravaActivities,
  fetchStravaAthlete,
  fetchStravaGearDetail,
  isSupportedRideActivity,
  mapStravaActivityToBikeActivityRecord,
  type StravaActivity,
} from "./strava";
import { getFreshStravaToken } from "./stravaToken";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function generateState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function refreshGearSummary(ctx: ActionCtx, userId: Id<"users">) {
  const accessToken = await getFreshStravaToken(ctx, userId);
  const athlete = await fetchStravaAthlete(accessToken);
  await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
    userId,
    fields: {
      accessStatus: "active",
      athleteName: athlete.athleteName,
      athleteAvatarUrl: athlete.athleteAvatarUrl,
      athleteStravaWeight: athlete.athleteWeight,
      stravaGearSummaryJson: JSON.stringify(athlete.bikes),
      lastSyncAt: Date.now(),
      syncErrorMessage: undefined,
    },
  });
  return { accessToken, athlete };
}

async function buildActivitySyncPayload(
  ctx: ActionCtx,
  userId: Id<"users">,
  windowDays: number
) {
  const accessToken = await getFreshStravaToken(ctx, userId);
  const importedAt = Date.now();
  const windowStartAt = importedAt - windowDays * 24 * 60 * 60 * 1000;
  const afterUnixSeconds = Math.floor(windowStartAt / 1000);
  const activities: StravaActivity[] = [];
  const pageSize = 50;

  for (let page = 1; page <= 10; page += 1) {
    const batch = await fetchStravaActivities({
      accessToken,
      afterUnixSeconds,
      page,
      perPage: pageSize,
    });
    if (batch.length === 0) {
      break;
    }
    activities.push(...batch.filter(isSupportedRideActivity));
    if (batch.length < pageSize) {
      break;
    }
  }

  const gearDetails = new Map<string, Awaited<ReturnType<typeof fetchStravaGearDetail>>>();
  const gearIds = [
    ...new Set(
      activities.map((activity) => activity.gear_id).filter((gearId): gearId is string => Boolean(gearId))
    ),
  ];
  for (const gearId of gearIds) {
    try {
      gearDetails.set(gearId, await fetchStravaGearDetail(accessToken, gearId));
    } catch {
      gearDetails.set(gearId, { id: gearId, name: "", primary: false, distanceMeters: 0 });
    }
  }

  return {
    importedAt,
    windowStartAt,
    syncRunId: `strava-activity-sync-${userId}-${importedAt}`,
    activities: activities.map((activity) => {
      const record = mapStravaActivityToBikeActivityRecord(activity);
      const gear = record.stravaGearId ? gearDetails.get(record.stravaGearId) ?? null : null;
      return {
        stravaActivityId: record.stravaActivityId,
        gearId: record.stravaGearId,
        gearName: gear?.name ?? undefined,
        gearBrand: gear?.brandName ?? undefined,
        gearModel: gear?.modelName ?? undefined,
        activityName: record.name,
        activityType: record.type,
        sportType: record.sportType,
        startAt: record.startDate,
        distanceKm: Number((record.distanceMeters / 1000).toFixed(2)),
        movingTimeSec: record.movingTimeSec,
        elapsedTimeSec: record.elapsedTimeSec,
        elevationGainM: record.elevationGainMeters ?? undefined,
        commute: record.commute,
        trainer: record.trainer,
        manual: false,
      };
    }),
  };
}

export const initiateStravaConnect = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const clientId = requireEnv("STRAVA_CLIENT_ID");
    const convexSiteUrl = requireEnv("CONVEX_SITE_URL");
    const redirectUri = `${convexSiteUrl}/strava/callback`;
    const state = generateState();

    await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
      userId,
      fields: {
        accessStatus: "pending",
        oauthState: state,
        oauthStateExpiresAt: Date.now() + 15 * 60 * 1000,
      },
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      approval_prompt: "auto",
      scope: "read,activity:read",
      state,
    });

    return `https://www.strava.com/oauth/authorize?${params.toString()}`;
  },
});

export const disconnectStravaAction = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const integration = await ctx.runQuery(
      internal.integrations.queries.getStravaIntegrationForUser,
      { userId }
    );

    if (integration?.accessToken) {
      try {
        await fetch("https://www.strava.com/oauth/deauthorize", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ access_token: integration.accessToken }),
        });
      } catch {
        // Keep local disconnect even if Strava deauthorize fails.
      }
    }

    await ctx.runMutation(internal.integrations.mutations.clearStravaConnection, {
      userId,
    });
  },
});

export const importBikesFromStrava = action({
  args: {
    gearIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { gearIds }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const { accessToken, athlete } = await refreshGearSummary(ctx, userId);
    const requestedGearIds = gearIds?.length
      ? [...new Set(gearIds)]
      : athlete.bikes.map((gear) => gear.id);

    const unresolved: Array<{ gearId: string; name: string; bikeId: Id<"bikes"> }> = [];
    const failed: Array<{ gearId: string; reason: string }> = [];
    let imported = 0;
    let updated = 0;

    for (const gearId of requestedGearIds) {
      try {
        const gear = await fetchStravaGearDetail(accessToken, gearId);
        const result = await ctx.runMutation(
          internal.integrations.mutations.upsertImportedStravaBike,
          {
            userId,
            gear: {
              gearId: gear.id,
              name: gear.name,
              primary: gear.primary,
              distanceMeters: gear.distanceMeters,
              brandName: gear.brandName,
              modelName: gear.modelName,
              description: gear.description,
              frameType: gear.frameType,
            },
          }
        );

        if (result.imported) {
          imported += 1;
        } else {
          updated += 1;
        }
        if (result.needsTypeConfirmation) {
          unresolved.push({ gearId: gear.id, name: gear.name, bikeId: result.bikeId });
        }
      } catch (error) {
        failed.push({
          gearId,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
      userId,
      fields: {
        accessStatus: "active",
        lastSyncAt: Date.now(),
        syncErrorMessage:
          failed.length > 0
            ? `Failed to import ${failed.length} Strava bike${failed.length === 1 ? "" : "s"}.`
            : undefined,
      },
    });

    return { imported, updated, unresolved, failed };
  },
});

export const syncStravaActivities = action({
  args: {
    windowDays: v.union(v.literal(90), v.literal(180)),
  },
  handler: async (ctx, { windowDays }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const activitySync = await buildActivitySyncPayload(ctx, userId, windowDays);
    await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
      userId,
      fields: {
        accessStatus: "active",
        lastActivitySyncAt: activitySync.importedAt,
        lastSyncAt: activitySync.importedAt,
        syncErrorMessage: undefined,
      },
      activitySync,
    });
    return { imported: activitySync.activities.length };
  },
});

export const importRecentRides = internalAction({
  args: {
    userId: v.id("users"),
    windowDays: v.optional(v.number()),
  },
  handler: async (ctx, { userId, windowDays = 90 }) => {
    const activitySync = await buildActivitySyncPayload(ctx, userId, windowDays);
    await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
      userId,
      fields: {
        accessStatus: "active",
        lastActivitySyncAt: activitySync.importedAt,
        lastSyncAt: activitySync.importedAt,
        syncErrorMessage: undefined,
      },
      activitySync,
    });
    return activitySync.syncRunId;
  },
});

export const scanLowUseBikes = internalAction({
  args: {},
  handler: async (ctx) => {
    const candidates = await ctx.runQuery(
      internal.integrations.queries.getLowUseReminderCandidates,
      {}
    );

    for (const candidate of candidates) {
      await ctx.runMutation(internal.integrations.mutations.createLowUseReminder, candidate);
    }
  },
});
