import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { isPressureStale } from "../lib/pressureStaleness";

function sortNewestFirst<T extends { createdAt: number }>(rows: T[]) {
  return [...rows].sort((a, b) => b.createdAt - a.createdAt);
}

export const getById = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const { bike } = await requireBikeOwner(ctx, args.bikeId);
    return bike;
  },
});

export const get = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const bike = await ctx.db.get(args.bikeId);
    if (!bike || bike.userId !== userId) {
      return null;
    }
    return bike;
  },
});

export const getDetail = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const { bike } = await requireBikeOwner(ctx, args.bikeId);

    const [profile, bikeProfiles, wheelsets, recommendation, pressureCalculations, photos] =
      await Promise.all([
        ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", bike.userId))
          .unique(),
        ctx.db
          .query("bikeProfiles")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .collect(),
        ctx.db
          .query("wheelsets")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .collect(),
        ctx.db
          .query("recommendations")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .collect(),
        ctx.db
          .query("pressureCalculations")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .collect(),
        ctx.db
          .query("bikePhotos")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .collect(),
      ]);

    const orderedPhotos = [...photos].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) {
        return a.isPrimary ? -1 : 1;
      }
      const leftSort = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const rightSort = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (leftSort !== rightSort) {
        return leftSort - rightSort;
      }
      return b.createdAt - a.createdAt;
    });

    const legacyPhotos =
      orderedPhotos.length === 0 && bike.photoUrl
        ? [
            {
              id: `legacy:${bike._id}`,
              storageId: bike.photoUrl,
              caption: undefined,
              isPrimary: true,
              isLegacy: true,
              createdAt: bike.updatedAt,
              updatedAt: bike.updatedAt,
            },
          ]
        : [];

    const wheelsetsWithTireSetups = await Promise.all(
      sortNewestFirst(wheelsets).map(async (wheelset) => {
        const tireSetups = await ctx.db
          .query("tireSetups")
          .withIndex("by_wheelset", (q) => q.eq("wheelsetId", wheelset._id))
          .collect();
        const orderedTireSetups = sortNewestFirst(tireSetups);
        const activeTireSetup =
          orderedTireSetups.find((tireSetup) => tireSetup.isActive) ??
          orderedTireSetups[0] ??
          null;

        return {
          ...wheelset,
          tireSetups: orderedTireSetups,
          activeTireSetup,
        };
      })
    );

    const activeWheelset =
      wheelsetsWithTireSetups.find((wheelset) => wheelset.isActive) ??
      wheelsetsWithTireSetups[0] ??
      null;
    const latestRecommendation = sortNewestFirst(recommendation)[0] ?? null;
    const latestPressureCalculation = sortNewestFirst(pressureCalculations)[0] ?? null;

    return {
      bike,
      bikeProfiles: sortNewestFirst(bikeProfiles),
      photos: [
        ...orderedPhotos.map((photo) => ({
          id: String(photo._id),
          storageId: photo.storageId,
          caption: photo.caption,
          isPrimary: photo.isPrimary,
          isLegacy: false,
          createdAt: photo.createdAt,
          updatedAt: photo.updatedAt,
        })),
        ...legacyPhotos,
      ],
      activePhotoStorageId:
        orderedPhotos.find((photo) => photo.isPrimary)?.storageId ??
        orderedPhotos[0]?.storageId ??
        bike.photoUrl ??
        null,
      wheelsets: wheelsetsWithTireSetups,
      activeWheelset,
      activeTireSetup: activeWheelset?.activeTireSetup ?? null,
      latestRecommendation,
      latestPressureCalculation,
      pressureStateSummary: {
        isStale: isPressureStale(
          latestPressureCalculation,
          profile,
          activeWheelset?.activeTireSetup ?? null
        ),
        hasCurrentPressure:
          latestPressureCalculation?.currentFrontBar !== undefined ||
          latestPressureCalculation?.currentRearBar !== undefined,
      },
    };
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    return await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

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

export const listSummariesByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const bikes = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return await Promise.all(
      bikes.map(async (bike) => {
        const wheelsets = await ctx.db
          .query("wheelsets")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .collect();
        const activeWheelset =
          wheelsets.find((wheelset) => wheelset.isActive) ??
          [...wheelsets].sort((a, b) => b.createdAt - a.createdAt)[0] ??
          null;

        const tireSetups = activeWheelset
          ? await ctx.db
              .query("tireSetups")
              .withIndex("by_wheelset", (q) => q.eq("wheelsetId", activeWheelset._id))
              .collect()
          : [];
        const activeTireSetup =
          tireSetups.find((tireSetup) => tireSetup.isActive) ??
          [...tireSetups].sort((a, b) => b.createdAt - a.createdAt)[0] ??
          null;

        const calculations = await ctx.db
          .query("pressureCalculations")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .collect();
        const latestCalculation =
          [...calculations].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

        const recommendations = await ctx.db
          .query("recommendations")
          .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
          .collect();
        const latestRecommendation =
          [...recommendations].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

        return {
          ...bike,
          latestRecommendationSummary: latestRecommendation
            ? {
                sessionId: latestRecommendation.sessionId,
                algorithmVersion: latestRecommendation.algorithmVersion,
                createdAt: latestRecommendation.createdAt,
                pressureWarningCount:
                  latestRecommendation.pressureInsights?.warnings.length ?? 0,
              }
            : null,
          advisedPressureSummary: latestCalculation
            ? {
                createdAt: latestCalculation.createdAt,
                recommendedFrontBar: latestCalculation.recommendedFrontBar,
                recommendedRearBar: latestCalculation.recommendedRearBar,
                recommendedFrontPsi: latestCalculation.recommendedFrontPsi,
                recommendedRearPsi: latestCalculation.recommendedRearPsi,
                currentFrontBar: latestCalculation.currentFrontBar,
                currentRearBar: latestCalculation.currentRearBar,
              }
            : null,
          activeWheelsetSummary: activeWheelset
            ? {
                name: activeWheelset.name,
                rimType: activeWheelset.rimType,
                internalRimWidthFrontMm: activeWheelset.internalRimWidthFrontMm,
                internalRimWidthRearMm: activeWheelset.internalRimWidthRearMm,
              }
            : null,
          activeTireSetupSummary: activeTireSetup
            ? {
                name: activeTireSetup.name,
                brand: activeTireSetup.brand,
                model: activeTireSetup.model,
                widthFrontMm: activeTireSetup.widthFrontMm,
                widthRearMm: activeTireSetup.widthRearMm,
                tubeType: activeTireSetup.tubeType,
                casingType: activeTireSetup.casingType,
                maxPressureBar: activeTireSetup.maxPressureBar,
              }
            : null,
          pressureStateSummary: {
            isStale: isPressureStale(latestCalculation, profile, activeTireSetup),
            hasCurrentPressure:
              latestCalculation?.currentFrontBar !== undefined ||
              latestCalculation?.currentRearBar !== undefined,
          },
        };
      })
    );
  },
});

export const getCurrentBike = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const bikes = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return [...bikes].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
  },
});
