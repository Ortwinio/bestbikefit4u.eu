import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { requireUserId } from "../lib/authz";
import {
  getSystemClimbingBikeProfile,
  getSystemDefaultBikeProfile,
} from "../bikeProfiles/defaults";
import {
  summarizeBikeActivityGroup,
  type BikeActivityUsageInput,
  type StravaBikeRole,
  mapStravaFrameTypeToBikeType,
} from "./strava";
import { matchActivityToBike, type BikeCandidate, type NormalizedBikeActivity } from "./activitySync";

const activitySyncValidator = v.object({
  syncRunId: v.string(),
  importedAt: v.number(),
  windowStartAt: v.number(),
  activities: v.array(
    v.object({
      stravaActivityId: v.string(),
      gearId: v.optional(v.string()),
      gearName: v.optional(v.string()),
      gearBrand: v.optional(v.string()),
      gearModel: v.optional(v.string()),
      activityName: v.string(),
      activityType: v.string(),
      sportType: v.optional(v.string()),
      startAt: v.number(),
      distanceKm: v.number(),
      movingTimeSec: v.number(),
      elapsedTimeSec: v.optional(v.number()),
      elevationGainM: v.optional(v.number()),
      commute: v.optional(v.boolean()),
      trainer: v.optional(v.boolean()),
      manual: v.optional(v.boolean()),
    })
  ),
});

function roleToBikeFields(role: StravaBikeRole): {
  ridingStyle?: BikeCandidate["ridingStyle"];
  primaryGoal?: BikeCandidate["primaryGoal"];
  discipline?: BikeCandidate["discipline"];
} {
  switch (role) {
    case "commute":
      return {
        ridingStyle: "commuting",
        primaryGoal: "comfort",
        discipline: "road",
      };
    case "training":
      return {
        ridingStyle: "fitness",
        primaryGoal: "balanced",
        discipline: "road",
      };
    case "gravel":
      return {
        ridingStyle: "sportive",
        primaryGoal: "balanced",
        discipline: "gravel",
      };
    case "mountain":
      return {
        ridingStyle: "recreational",
        primaryGoal: "comfort",
        discipline: "mtb",
      };
    case "tt_triathlon":
      return {
        ridingStyle: "racing",
        primaryGoal: "aerodynamics",
        discipline: "tt",
      };
    case "race_road":
      return {
        ridingStyle: "racing",
        primaryGoal: "performance",
        discipline: "road",
      };
    case "endurance_road":
    default:
      return {
        ridingStyle: "sportive",
        primaryGoal: "balanced",
        discipline: "road",
      };
  }
}

function summarizeIntegrationActivities(activities: NormalizedBikeActivity[]) {
  const ordered = [...activities].sort((a, b) => b.startAt - a.startAt);
  const rideCount = ordered.length;
  const totalDistanceKm = ordered.reduce((sum, activity) => sum + activity.distanceKm, 0);
  const totalMovingTimeSec = ordered.reduce((sum, activity) => sum + activity.movingTimeSec, 0);
  const totalElevationGainM = ordered.reduce((sum, activity) => sum + (activity.elevationGainM ?? 0), 0);
  return {
    source: "strava_v1_1" as const,
    syncedAt: Date.now(),
    activityCount: rideCount,
    rideCount,
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    totalMovingTimeSec,
    totalElevationGainM: totalElevationGainM > 0 ? Math.round(totalElevationGainM) : undefined,
    lastActivityAt: ordered[0]?.startAt,
    lastActivityName: ordered[0]?.activityName,
    lastActivityType: ordered[0]?.activityType,
    matchedGearCount: ordered.filter((activity) => activity.matchStatus === "matched_gear").length,
    unmatchedGearCount: ordered.filter((activity) => activity.matchStatus === "unmatched_gear").length,
    noGearCount: ordered.filter((activity) => activity.matchStatus === "no_gear").length,
  };
}

function computeInferenceConfidence(summary: {
  rideCount90d: number;
  trainerRatio: number;
  commuteRatio: number;
  climbingMetersPerKm: number;
  averageSpeedMps?: number;
}): number {
  return Math.min(
    0.95,
    0.25 +
      Math.min(0.35, summary.rideCount90d / 20) +
      Math.max(
        summary.commuteRatio,
        summary.trainerRatio,
        summary.climbingMetersPerKm >= 12 ? 0.15 : 0,
        (summary.averageSpeedMps ?? 0) >= 8 ? 0.15 : 0
      )
  );
}

export const upsertStravaIntegration = internalMutation({
  args: {
    userId: v.id("users"),
    fields: v.object({
      accessStatus: v.union(
        v.literal("not_connected"),
        v.literal("pending"),
        v.literal("active"),
        v.literal("revoked"),
        v.literal("error")
      ),
      oauthState: v.optional(v.string()),
      oauthStateExpiresAt: v.optional(v.number()),
      providerUserId: v.optional(v.string()),
      accessToken: v.optional(v.string()),
      refreshToken: v.optional(v.string()),
      tokenExpiresAt: v.optional(v.number()),
      athleteName: v.optional(v.string()),
      athleteAvatarUrl: v.optional(v.string()),
      athleteStravaWeight: v.optional(v.number()),
      lastSyncAt: v.optional(v.number()),
      lastActivitySyncAt: v.optional(v.number()),
      ridingProfileJson: v.optional(v.string()),
      stravaGearSummaryJson: v.optional(v.string()),
      syncErrorMessage: v.optional(v.string()),
      rideCount: v.optional(v.number()),
      totalDistanceKm: v.optional(v.number()),
    }),
    activitySync: v.optional(activitySyncValidator),
  },
  handler: async (ctx, { userId, fields, activitySync }) => {
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();

    const integrationId = existing
      ? (await ctx.db.patch(existing._id, fields), existing._id)
      : await ctx.db.insert("integrations", {
          userId,
          provider: "strava",
          ...fields,
        });

    if (!activitySync) {
      return integrationId;
    }

    const bikes = (await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()) as BikeCandidate[];

    const existingActivities = await ctx.db
      .query("bikeActivities")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const activity of existingActivities) {
      if (activity.startAt < activitySync.windowStartAt) {
        await ctx.db.delete(activity._id);
      }
    }

    const existingByActivityId = new Map(
      existingActivities
        .filter((activity) => activity.startAt >= activitySync.windowStartAt)
        .map((activity) => [activity.stravaActivityId, activity])
    );

    const normalizedActivities = activitySync.activities.map((activity): NormalizedBikeActivity => {
      const base: NormalizedBikeActivity = {
        ...activity,
        bikeId: undefined,
        matchStatus: activity.gearId ? "unmatched_gear" : "no_gear",
        matchConfidence: 0,
      };
      const match = matchActivityToBike(base, bikes);
      return {
        ...base,
        bikeId: match.bikeId,
        matchStatus: match.matchStatus,
        matchConfidence: match.matchConfidence,
        matchReason: match.matchReason,
      };
    });

    for (const activity of normalizedActivities) {
      const existingActivity = existingByActivityId.get(activity.stravaActivityId);
      const record = {
        userId,
        integrationId,
        stravaActivityId: activity.stravaActivityId,
        bikeId: activity.bikeId,
        gearId: activity.gearId,
        gearName: activity.gearName,
        gearBrand: activity.gearBrand,
        gearModel: activity.gearModel,
        activityName: activity.activityName,
        activityType: activity.activityType,
        sportType: activity.sportType,
        startAt: activity.startAt,
        distanceKm: activity.distanceKm,
        movingTimeSec: activity.movingTimeSec,
        elapsedTimeSec: activity.elapsedTimeSec,
        elevationGainM: activity.elevationGainM,
        commute: activity.commute,
        trainer: activity.trainer,
        manual: activity.manual,
        matchStatus: activity.matchStatus,
        matchConfidence: activity.matchConfidence,
        matchReason: activity.matchReason,
        importedAt: activitySync.importedAt,
        updatedAt: activitySync.importedAt,
        syncRunId: activitySync.syncRunId,
      };

      if (existingActivity) {
        await ctx.db.patch(existingActivity._id, record);
      } else {
        await ctx.db.insert("bikeActivities", record);
      }
    }

    const currentActivities = await ctx.db
      .query("bikeActivities")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const integrationSummary = summarizeIntegrationActivities(
      currentActivities.map((activity) => ({
        stravaActivityId: activity.stravaActivityId,
        gearId: activity.gearId,
        gearName: activity.gearName,
        gearBrand: activity.gearBrand,
        gearModel: activity.gearModel,
        activityName: activity.activityName,
        activityType: activity.activityType,
        sportType: activity.sportType,
        startAt: activity.startAt,
        distanceKm: activity.distanceKm,
        movingTimeSec: activity.movingTimeSec,
        elapsedTimeSec: activity.elapsedTimeSec,
        elevationGainM: activity.elevationGainM,
        commute: activity.commute,
        trainer: activity.trainer,
        manual: activity.manual,
        bikeId: activity.bikeId,
        matchStatus: activity.matchStatus,
        matchConfidence: activity.matchConfidence,
        matchReason: activity.matchReason,
      }))
    );

    const activityInputsByBike = new Map<Id<"bikes">, BikeActivityUsageInput[]>();
    const summaryCountsByBike = new Map<
      Id<"bikes">,
      { matched: number; unmatched: number; noGear: number }
    >();
    for (const activity of currentActivities) {
      if (!activity.bikeId) continue;
      const inputs = activityInputsByBike.get(activity.bikeId) ?? [];
      inputs.push({
        bikeId: activity.bikeId,
        sportType: activity.sportType ?? activity.activityType,
        distanceMeters: Math.round(activity.distanceKm * 1000),
        movingTimeSec: activity.movingTimeSec,
        elapsedTimeSec: activity.elapsedTimeSec ?? activity.movingTimeSec,
        elevationGainMeters: activity.elevationGainM ?? null,
        trainer: Boolean(activity.trainer),
        commute: Boolean(activity.commute),
        averageSpeed:
          activity.movingTimeSec > 0 ? activity.distanceKm / (activity.movingTimeSec / 3600) : null,
        maxSpeed: null,
        startDate: activity.startAt,
      });
      activityInputsByBike.set(activity.bikeId, inputs);
      const counts = summaryCountsByBike.get(activity.bikeId) ?? {
        matched: 0,
        unmatched: 0,
        noGear: 0,
      };
      if (activity.matchStatus === "matched_gear") counts.matched += 1;
      if (activity.matchStatus === "unmatched_gear") counts.unmatched += 1;
      if (activity.matchStatus === "no_gear") counts.noGear += 1;
      summaryCountsByBike.set(activity.bikeId, counts);
    }

    for (const bike of bikes) {
      const usageInputs = activityInputsByBike.get(bike._id);
      if (!usageInputs?.length) {
        if (
          bike.activitySummary ||
          bike.rideCount90d !== undefined ||
          bike.recentDistance90dMeters !== undefined ||
          bike.inferredBikeRole !== undefined
        ) {
          await ctx.db.patch(bike._id, {
            activitySummary: undefined,
            recentDistance90dMeters: undefined,
            rideCount90d: undefined,
            avgRideDistance90dMeters: undefined,
            avgSpeed90dKph: undefined,
            avgElevationPer100Km90d: undefined,
            trainerRideRatio90d: undefined,
            dominantSportType: undefined,
            lastRideAt: undefined,
            inferredBikeRole: undefined,
            updatedAt: activitySync.importedAt,
          });
        }
        continue;
      }

      const latestUsage = [...usageInputs].sort((a, b) => b.startDate - a.startDate)[0];
      const latestActivityRow = [...currentActivities]
        .filter((activity) => activity.bikeId === bike._id)
        .sort((a, b) => b.startAt - a.startAt)[0];
      const summary = summarizeBikeActivityGroup(bike._id, usageInputs);
      const confidence = computeInferenceConfidence(summary);
      const summaryCounts = summaryCountsByBike.get(bike._id) ?? {
        matched: 0,
        unmatched: 0,
        noGear: 0,
      };
      const roleFields = roleToBikeFields(summary.inferredBikeRole);

      const updates: Record<string, unknown> = {
        activitySummary: {
          source: "strava_v1_1",
          syncedAt: activitySync.importedAt,
          activityCount: summary.rideCount90d,
          rideCount: summary.rideCount90d,
          recentDistance90dMeters: summary.recentDistance90dMeters,
          totalDistanceKm: Number((summary.recentDistance90dMeters / 1000).toFixed(2)),
          totalMovingTimeSec: Math.round(summary.averageDurationSec * summary.rideCount90d),
          averageDurationSec: summary.averageDurationSec,
          trainerRatio: summary.trainerRatio,
          commuteRatio: summary.commuteRatio,
          climbingMetersPerKm: summary.climbingMetersPerKm,
          dominantSportType: summary.dominantSportType,
          averageSpeedMps: summary.averageSpeedMps,
          maxSpeedMps: summary.maxSpeedMps,
          inferredBikeRole: summary.inferredBikeRole,
          inferredRidingStyle: roleFields.ridingStyle,
          inferredPrimaryGoal: roleFields.primaryGoal,
          inferredDiscipline: roleFields.discipline,
          inferenceConfidence: confidence,
          lastActivityAt: latestUsage?.startDate,
          lastActivityName: latestActivityRow?.activityName,
          lastActivityType: latestActivityRow?.activityType,
          matchedGearCount: summaryCounts.matched,
          unmatchedGearCount: summaryCounts.unmatched,
          noGearCount: summaryCounts.noGear,
        },
        recentDistance90dMeters: summary.recentDistance90dMeters,
        rideCount90d: summary.rideCount90d,
        avgRideDistance90dMeters:
          summary.rideCount90d > 0
            ? Math.round(summary.recentDistance90dMeters / summary.rideCount90d)
            : undefined,
        avgSpeed90dKph: Number((summary.averageSpeedMps * 3.6).toFixed(1)),
        avgElevationPer100Km90d: Number(
          (summary.climbingMetersPerKm * 100).toFixed(1)
        ),
        trainerRideRatio90d: Number(summary.trainerRatio.toFixed(2)),
        dominantSportType: summary.dominantSportType,
        lastRideAt: latestUsage?.startDate,
        inferredBikeRole: summary.inferredBikeRole,
        updatedAt: activitySync.importedAt,
      };

      if (!bike.discipline && confidence >= 0.55 && roleFields.discipline) {
        updates.discipline = roleFields.discipline;
      }
      if (!bike.ridingStyle && confidence >= 0.6 && roleFields.ridingStyle) {
        updates.ridingStyle = roleFields.ridingStyle;
      }
      if (!bike.primaryGoal && confidence >= 0.6 && roleFields.primaryGoal) {
        updates.primaryGoal = roleFields.primaryGoal;
      }

      await ctx.db.patch(bike._id, updates as never);
    }

    await ctx.db.patch(integrationId, {
      accessStatus: "active",
      lastSyncAt: activitySync.importedAt,
      lastActivitySyncAt: activitySync.importedAt,
      rideCount: integrationSummary.rideCount,
      totalDistanceKm: integrationSummary.totalDistanceKm,
      ridingProfileJson: JSON.stringify({
        version: 1,
        syncedAt: activitySync.importedAt,
        syncRunId: activitySync.syncRunId,
        windowStartAt: activitySync.windowStartAt,
        summary: integrationSummary,
      }),
      syncErrorMessage: undefined,
    });

    return integrationId;
  },
});

export const upsertImportedStravaBike = internalMutation({
  args: {
    userId: v.id("users"),
    gear: v.object({
      gearId: v.string(),
      name: v.string(),
      primary: v.boolean(),
      distanceMeters: v.number(),
      brandName: v.optional(v.string()),
      modelName: v.optional(v.string()),
      description: v.optional(v.string()),
      frameType: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { userId, gear }) => {
    const existing = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const bike = existing.find((row) => row.stravaGearId === gear.gearId) ?? null;
    const mappedType = mapStravaFrameTypeToBikeType(gear.frameType ?? null);
    const now = Date.now();
    const needsTypeConfirmation = mappedType.bikeTypeSource === "fallback_pending_confirmation";
    const bikeType = bike?.bikeType ?? mappedType.bikeType ?? "road";
    const bikeTypeSource = bike?.bikeTypeSource ?? mappedType.bikeTypeSource ?? "strava_frame_type";
    const source = "strava" as const;

    if (bike) {
      const patch: Record<string, unknown> = {
        bikeType,
        bikeTypeSource,
        needsTypeConfirmation,
        source,
        stravaGearId: gear.gearId,
        stravaPrimary: gear.primary,
        lifetimeDistanceMeters: gear.distanceMeters,
        lastStravaSync: now,
        updatedAt: now,
      };

      if (!bike.name?.trim()) {
        patch.name = gear.name;
      }
      if (!bike.brand?.trim() && gear.brandName) {
        patch.brand = gear.brandName;
      }
      if (!bike.model?.trim() && gear.modelName) {
        patch.model = gear.modelName;
      }
      if (!bike.notes?.trim() && gear.description) {
        patch.notes = gear.description;
      }

      if (bike.bikeTypeSource !== "user" && mappedType.bikeType) {
        patch.bikeType = mappedType.bikeType;
      }

      await ctx.db.patch(bike._id, patch);
      return { bikeId: bike._id, imported: false, needsTypeConfirmation };
    }

    const bikeId = await ctx.db.insert("bikes", {
      userId,
      name: gear.name,
      bikeType,
      source,
      bikeTypeSource,
      needsTypeConfirmation,
      stravaGearId: gear.gearId,
      stravaPrimary: gear.primary,
      lifetimeDistanceMeters: gear.distanceMeters,
      brand: gear.brandName ?? undefined,
      model: gear.modelName ?? undefined,
      notes: gear.description ?? undefined,
      lastStravaSync: now,
      createdAt: now,
      updatedAt: now,
    });

    const defaultProfile = getSystemDefaultBikeProfile({ bikeType, ridingStyle: undefined });
    await ctx.db.insert("bikeProfiles", {
      userId,
      bikeId,
      name: defaultProfile.name,
      profileType: defaultProfile.profileType,
      isDefault: true,
      status: "active",
      source: "system_default",
      createdAt: now,
      updatedAt: now,
    });

    const climbingProfile = getSystemClimbingBikeProfile({ bikeType });
    if (climbingProfile) {
      await ctx.db.insert("bikeProfiles", {
        userId,
        bikeId,
        name: climbingProfile.name,
        profileType: climbingProfile.profileType,
        isDefault: false,
        status: "active",
        source: "system_default",
        createdAt: now,
        updatedAt: now,
      });
    }

    return { bikeId, imported: true, needsTypeConfirmation };
  },
});

export const setUserProfileImageFromStrava = internalMutation({
  args: {
    userId: v.id("users"),
    imageUrl: v.string(),
  },
  handler: async (ctx, { userId, imageUrl }) => {
    const user = await ctx.db.get(userId);
    if (!user) return;
    if (!user.profile_image_url || user.profileImageSource === "strava") {
      await ctx.db.patch(userId, {
        profile_image_url: imageUrl,
        profileImageSource: "strava",
      });
    }
  },
});

export const clearStravaConnection = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();

    if (!existing) return null;

    const [bikeActivities, bikes] = await Promise.all([
      ctx.db
        .query("bikeActivities")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("bikes")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    for (const activity of bikeActivities) {
      await ctx.db.delete(activity._id);
    }

    for (const bike of bikes) {
      if (
        !bike.activitySummary &&
        bike.rideCount90d === undefined &&
        bike.recentDistance90dMeters === undefined &&
        bike.inferredBikeRole === undefined
      ) {
        continue;
      }

      await ctx.db.patch(bike._id, {
        activitySummary: undefined,
        recentDistance90dMeters: undefined,
        rideCount90d: undefined,
        avgRideDistance90dMeters: undefined,
        avgSpeed90dKph: undefined,
        avgElevationPer100Km90d: undefined,
        trainerRideRatio90d: undefined,
        dominantSportType: undefined,
        lastRideAt: undefined,
        inferredBikeRole: undefined,
        lastStravaSync: undefined,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.patch(existing._id, {
      accessStatus: "revoked",
      accessToken: undefined,
      refreshToken: undefined,
      tokenExpiresAt: undefined,
      oauthState: undefined,
      oauthStateExpiresAt: undefined,
      ridingProfileJson: undefined,
      athleteStravaWeight: undefined,
      rideCount: undefined,
      totalDistanceKm: undefined,
      lastSyncAt: undefined,
      syncErrorMessage: undefined,
      stravaGearSummaryJson: undefined,
      lastActivitySyncAt: undefined,
    });

    return existing._id;
  },
});

export const importStravaPhoto = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();

    if (!integration?.athleteAvatarUrl) {
      throw new Error("No Strava photo available");
    }

    await ctx.db.patch(userId, {
      profile_image_url: integration.athleteAvatarUrl,
      profileImageSource: "strava",
    });
  },
});

export const disconnectStrava = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();

    if (!existing) {
      return null;
    }

    const [bikeActivities, bikes] = await Promise.all([
      ctx.db
        .query("bikeActivities")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("bikes")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    for (const activity of bikeActivities) {
      await ctx.db.delete(activity._id);
    }

    for (const bike of bikes) {
      if (
        !bike.activitySummary &&
        bike.rideCount90d === undefined &&
        bike.recentDistance90dMeters === undefined &&
        bike.inferredBikeRole === undefined
      ) {
        continue;
      }

      await ctx.db.patch(bike._id, {
        activitySummary: undefined,
        recentDistance90dMeters: undefined,
        rideCount90d: undefined,
        avgRideDistance90dMeters: undefined,
        avgSpeed90dKph: undefined,
        avgElevationPer100Km90d: undefined,
        trainerRideRatio90d: undefined,
        dominantSportType: undefined,
        lastRideAt: undefined,
        inferredBikeRole: undefined,
        lastStravaSync: undefined,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.patch(existing._id, {
      accessStatus: "revoked",
      accessToken: undefined,
      refreshToken: undefined,
      tokenExpiresAt: undefined,
      oauthState: undefined,
      oauthStateExpiresAt: undefined,
      ridingProfileJson: undefined,
      athleteStravaWeight: undefined,
      rideCount: undefined,
      totalDistanceKm: undefined,
      lastSyncAt: undefined,
      stravaGearSummaryJson: undefined,
      lastActivitySyncAt: undefined,
      syncErrorMessage: undefined,
    });

    return existing._id;
  },
});

export const createLowUseReminder = internalMutation({
  args: {
    userId: v.id("users"),
    bikeId: v.id("bikes"),
    bikeName: v.string(),
  },
  handler: async (ctx, { userId, bikeId, bikeName }) => {
    const messageTargets = await ctx.db
      .query("message_targets")
      .withIndex("by_target", (q) => q.eq("targetType", "user").eq("targetValue", userId))
      .collect();
    const targetMessageIds = new Set(messageTargets.map((target) => target.messageId));
    const existingMessages = await ctx.db.query("dashboard_messages").collect();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const existing = existingMessages.find((message) => {
      if (!targetMessageIds.has(message._id)) {
        return false;
      }
      if (message.type !== "re_fit_reminder") {
        return false;
      }
      if ((message.publishedAt ?? message.createdAt) < cutoff) {
        return false;
      }
      return message.ctaUrl === `/bikes/${bikeId}`;
    });

    if (existing) {
      return existing._id;
    }

    const messageId = await ctx.db.insert("dashboard_messages", {
      title: `Check your fit for ${bikeName}`,
      body: `You have not ridden ${bikeName} much recently. Review the setup before your next longer ride.`,
      type: "re_fit_reminder",
      priority: "normal",
      status: "published",
      ctaText: "Review bike",
      ctaUrl: `/bikes/${bikeId}`,
      locale: "all",
      dismissible: true,
      requiresAcknowledgement: false,
      publishedAt: Date.now(),
      createdAt: Date.now(),
      createdBy: userId,
    });

    await ctx.db.insert("message_targets", {
      messageId,
      targetType: "user",
      targetValue: userId,
      createdAt: Date.now(),
    });

    return messageId;
  },
});
