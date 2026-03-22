import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import { requireUserId } from "../lib/authz";
import {
  parseStravaGearSummaryJson,
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
      inferredBikeRole: bike.inferredBikeRole ?? null,
      rideCount90d: bike.rideCount90d ?? 0,
      recentDistance90dMeters: bike.recentDistance90dMeters ?? 0,
      avgRideDistance90dMeters: bike.avgRideDistance90dMeters ?? 0,
      avgSpeed90dKph: bike.avgSpeed90dKph ?? null,
      avgElevationPer100Km90d: bike.avgElevationPer100Km90d ?? null,
      trainerRideRatio90d: bike.trainerRideRatio90d ?? null,
      dominantSportType: bike.dominantSportType ?? null,
      lastRideAt: bike.lastRideAt ?? null,
    };
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
      .filter((bike) => (bike.rideCount90d ?? 0) < 3)
      .map((bike) => ({
        userId: bike.userId,
        bikeId: bike._id,
        bikeName: bike.name,
      }));
  },
});
