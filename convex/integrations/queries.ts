import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import { requireUserId } from "../lib/authz";
import {
  getStravaBikeReadiness,
  parseStravaGearSummaryJson,
  summarizeStravaBikeOverviewActivities,
  type StravaGearSummary,
} from "./strava";

export const getStravaStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();

    if (!integration) return null;

    const {
      accessToken: _accessToken,
      refreshToken: _refreshToken,
      oauthState: _oauthState,
      oauthStateExpiresAt: _oauthStateExpiresAt,
      stravaGearSummaryJson: _stravaGearSummaryJson,
      ...safe
    } = integration;

    return safe;
  },
});

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

    return (
      parseStravaGearSummaryJson(integration.stravaGearSummaryJson) ??
      null
    ) as StravaGearSummary | null;
  },
});

export const getBikeUsageSummary = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, { bikeId }) => {
    const userId = await requireUserId(ctx);
    const bike = await ctx.db.get(bikeId);
    if (!bike || bike.userId !== userId) {
      return null;
    }
    return {
      inferredBikeRole:
        bike.inferredBikeRole ?? bike.activitySummary?.inferredBikeRole ?? null,
      rideCount90d: bike.rideCount90d ?? bike.activitySummary?.rideCount ?? 0,
      recentDistance90dMeters:
        bike.recentDistance90dMeters ??
        bike.activitySummary?.recentDistance90dMeters ??
        0,
      avgRideDistance90dMeters:
        bike.avgRideDistance90dMeters ??
        (bike.activitySummary?.rideCount && bike.activitySummary?.recentDistance90dMeters
          ? Math.round(
              bike.activitySummary.recentDistance90dMeters /
                Math.max(bike.activitySummary.rideCount, 1)
            )
          : 0),
      avgSpeed90dKph:
        bike.avgSpeed90dKph ??
        (bike.activitySummary?.averageSpeedMps !== undefined
          ? Number((bike.activitySummary.averageSpeedMps * 3.6).toFixed(1))
          : null),
      avgElevationPer100Km90d:
        bike.avgElevationPer100Km90d ??
        (bike.activitySummary?.climbingMetersPerKm !== undefined
          ? Number((bike.activitySummary.climbingMetersPerKm * 100).toFixed(1))
          : null),
      trainerRideRatio90d:
        bike.trainerRideRatio90d ?? bike.activitySummary?.trainerRatio ?? null,
      dominantSportType:
        bike.dominantSportType ?? bike.activitySummary?.dominantSportType ?? null,
      lastRideAt: bike.lastRideAt ?? bike.activitySummary?.lastActivityAt ?? null,
    };
  },
});

export const getStravaBikeOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const [integration, bikes, bikeActivities] = await Promise.all([
      ctx.db
        .query("integrations")
        .withIndex("by_user_and_provider", (q) =>
          q.eq("userId", userId).eq("provider", "strava")
        )
        .unique(),
      ctx.db
        .query("bikes")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("bikeActivities")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    if (!integration || integration.accessStatus !== "active") {
      return null;
    }

    const gearSummary = parseStravaGearSummaryJson(integration.stravaGearSummaryJson) ?? [];
    const importedBikeByGearId = new Map(
      bikes
        .filter((bike) => bike.stravaGearId)
        .map((bike) => [bike.stravaGearId as string, bike])
    );
    const activitiesByGearId = new Map<
      string,
      Array<{ distanceKm: number; movingTimeSec: number; startAt: number }>
    >();

    for (const activity of bikeActivities) {
      if (!activity.gearId) continue;
      const current = activitiesByGearId.get(activity.gearId) ?? [];
      current.push({
        distanceKm: activity.distanceKm,
        movingTimeSec: activity.movingTimeSec,
        startAt: activity.startAt,
      });
      activitiesByGearId.set(activity.gearId, current);
    }

    return gearSummary.map((gear) => {
      const importedBike = importedBikeByGearId.get(gear.id) ?? null;
      const recentUsage = summarizeStravaBikeOverviewActivities(
        activitiesByGearId.get(gear.id) ?? []
      );

      return {
        gearId: gear.id,
        name: importedBike?.name ?? gear.name,
        brandName: importedBike?.brand ?? undefined,
        modelName: importedBike?.model ?? undefined,
        mappedBikeType: importedBike?.bikeType ?? undefined,
        bikeTypeSource: importedBike?.bikeTypeSource ?? undefined,
        primary: importedBike?.stravaPrimary ?? gear.primary,
        lifetimeDistanceMeters:
          importedBike?.lifetimeDistanceMeters ?? gear.distanceMeters,
        importedBikeId: importedBike?._id ?? undefined,
        needsTypeConfirmation: importedBike?.needsTypeConfirmation ?? false,
        syncStatus: importedBike ? "imported" : "ready",
        readiness: getStravaBikeReadiness({ importedBike }),
        rideCountWindow: recentUsage.rideCountWindow,
        totalDistanceWindowMeters: recentUsage.totalDistanceWindowMeters,
        avgRideDistanceWindowMeters: recentUsage.avgRideDistanceWindowMeters,
        avgSpeedWindowKph: recentUsage.avgSpeedWindowKph,
        lastRideAt: recentUsage.lastRideAt,
        explanation:
          recentUsage.rideCountWindow > 0
            ? `${recentUsage.rideCountWindow} rides in the last 90 days`
            : undefined,
      };
    });
  },
});

export const getStravaIntegrationByState = internalQuery({
  args: { oauthState: v.string() },
  handler: async (ctx, { oauthState }) => {
    return await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), "strava"),
          q.eq(q.field("oauthState"), oauthState)
        )
      )
      .unique();
  },
});

export const getStravaIntegrationForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();
  },
});

export const getImportedStravaGearIdsForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const bikes = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return bikes
      .map((bike) => bike.stravaGearId)
      .filter((gearId): gearId is string => Boolean(gearId));
  },
});

export const getStravaAutoImportCandidates = internalQuery({
  args: {},
  handler: async (ctx) => {
    const integrations = await ctx.db
      .query("integrations")
      .withIndex("by_status", (q) => q.eq("accessStatus", "active"))
      .collect();

    const candidates = [];
    for (const integration of integrations) {
      const user = await ctx.db.get(integration.userId);
      candidates.push({
        userId: integration.userId,
        lastLoginAt: user?.lastLoginAt ?? null,
        lastSyncAt: integration.lastSyncAt ?? null,
      });
    }

    return candidates;
  },
});

export const getLowUseReminderCandidates = internalQuery({
  args: {},
  handler: async (ctx) => {
    const [bikes, sessions] = await Promise.all([
      ctx.db.query("bikes").collect(),
      ctx.db.query("fitSessions").collect(),
    ]);
    const completedBikeIds = new Set(
      sessions
        .filter((session) => session.status === "completed" && session.bikeId)
        .map((session) => String(session.bikeId))
    );

    return bikes
      .filter((bike) => completedBikeIds.has(String(bike._id)))
      .filter(
        (bike) =>
          (bike.rideCount90d ?? bike.activitySummary?.rideCount ?? 0) < 3
      )
      .map((bike) => ({
        userId: bike.userId,
        bikeId: bike._id,
        bikeName: bike.name,
      }));
  },
});
