import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { isPressureStale } from "../lib/pressureStaleness";
import { buildBikePassportPreview, findBikeByPassportId } from "./passport";
import {
  buildPublicFitPhotoSources,
  buildPublicFitPreviewInternal,
  isPublicFitPreviewActive,
  isValidPublicFitCode,
  normalizePublicFitCode,
  resolvePublicFitSnapshot,
} from "./publicFit";

function sortNewestFirst<T extends { createdAt: number }>(rows: T[]) {
  return [...rows].sort((a, b) => b.createdAt - a.createdAt);
}

function buildGeometryModelYearLabel({
  yearStart,
  yearEnd,
}: {
  yearStart?: number;
  yearEnd?: number;
}) {
  if (yearStart && yearEnd && yearStart !== yearEnd) {
    return `${yearStart}-${yearEnd}`;
  }

  return yearStart ?? yearEnd ?? null;
}

function buildLinkedGeometryDetail({
  record,
  brand,
  model,
}: {
  record: {
    _id: string;
    sizeLabel: string;
    stack?: number;
    reach?: number;
    seatTubeAngle?: number;
    headTubeAngle?: number;
    source:
      | "manufacturer"
      | "admin_import"
      | "admin_manual"
      | "user_entered";
    sourceUrl?: string;
    status: "draft" | "active" | "superseded" | "rejected";
    version: number;
    supersededBy?: string;
  };
  brand: { name: string } | null;
  model: {
    name: string;
    yearStart?: number;
    yearEnd?: number;
  } | null;
}) {
  return {
    recordId: record._id,
    brandName: brand?.name ?? null,
    modelName: model?.name ?? null,
    modelYearLabel: buildGeometryModelYearLabel({
      yearStart: model?.yearStart,
      yearEnd: model?.yearEnd,
    }),
    sizeLabel: record.sizeLabel,
    stack: record.stack ?? null,
    reach: record.reach ?? null,
    seatTubeAngle: record.seatTubeAngle ?? null,
    headTubeAngle: record.headTubeAngle ?? null,
    source: record.source,
    sourceUrl: record.sourceUrl ?? null,
    status: record.status,
    version: record.version,
    supersededByRecordId: record.supersededBy ?? null,
  };
}

function buildBikeDetailPhotos({
  bikeId,
  bikePhotoUrl,
  bikeUpdatedAt,
  photos,
}: {
  bikeId: string;
  bikePhotoUrl?: string;
  bikeUpdatedAt: number;
  photos: Array<{
    _id: string;
    storageId: string;
    caption?: string;
    isPrimary: boolean;
    sortOrder?: number;
    createdAt: number;
    updatedAt: number;
  }>;
}) {
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

  const hasLegacyOnlyPhoto =
    typeof bikePhotoUrl === "string" &&
    bikePhotoUrl.length > 0 &&
    !orderedPhotos.some((photo) => photo.storageId === bikePhotoUrl);

  const legacyPhoto = hasLegacyOnlyPhoto
    ? {
        id: `legacy:${bikeId}`,
        storageId: bikePhotoUrl!,
        caption: undefined,
        isPrimary: true,
        isLegacy: true,
        createdAt: bikeUpdatedAt,
        updatedAt: bikeUpdatedAt,
      }
    : null;

  const detailPhotos = [
    ...(legacyPhoto ? [legacyPhoto] : []),
    ...orderedPhotos.map((photo) => ({
      id: String(photo._id),
      storageId: photo.storageId,
      caption: photo.caption,
      isPrimary: legacyPhoto ? false : photo.isPrimary,
      isLegacy: false,
      createdAt: photo.createdAt,
      updatedAt: photo.updatedAt,
    })),
  ];

  const activePhotoStorageId =
    legacyPhoto?.storageId ??
    orderedPhotos.find((photo) => photo.isPrimary)?.storageId ??
    orderedPhotos[0]?.storageId ??
    bikePhotoUrl ??
    null;

  return {
    detailPhotos,
    activePhotoStorageId,
  };
}

export { buildBikeDetailPhotos };
export { buildLinkedGeometryDetail };

function buildGarageLinkedGeometrySummary({
  record,
  brand,
  model,
}: {
  record: {
    sizeLabel: string;
  };
  brand: { name: string } | null;
  model: {
    name: string;
    yearStart?: number;
    yearEnd?: number;
  } | null;
}) {
  return {
    brandName: brand?.name ?? null,
    modelName: model?.name ?? null,
    modelYearLabel: buildGeometryModelYearLabel({
      yearStart: model?.yearStart,
      yearEnd: model?.yearEnd,
    }),
    sizeLabel: record.sizeLabel,
  };
}

export { buildGarageLinkedGeometrySummary };

function buildBikeGearingSummary(bike: {
  bikeType: string;
  currentSetup?: { crankLengthMm?: number | null } | null;
  gearing?: {
    drivetrainType?: "1x" | "2x";
    chainrings?: number[];
    cassetteTeeth?: number[];
    wheelCircumferenceMm?: number;
    crankLengthMm?: number;
    groupsetName?: string;
    derailleurMaxCog?: number;
    completeness?: "missing" | "partial" | "complete" | "validated";
  } | null;
}) {
  const gearing = bike.gearing ?? null;
  const chainrings = (gearing?.chainrings ?? []).filter(
    (value): value is number => Number.isFinite(value) && value > 0
  );
  const cassetteTeeth = (gearing?.cassetteTeeth ?? []).filter(
    (value): value is number => Number.isFinite(value) && value > 0
  );
  const wheelCircumferenceMm = gearing?.wheelCircumferenceMm ?? null;
  const lowestGearRatio =
    chainrings.length && cassetteTeeth.length
      ? Math.min(...chainrings) / Math.max(...cassetteTeeth)
      : null;
  const highestGearRatio =
    chainrings.length && cassetteTeeth.length
      ? Math.max(...chainrings) / Math.min(...cassetteTeeth)
      : null;

  const completeness =
    gearing?.completeness ??
    (!chainrings.length && !cassetteTeeth.length && !wheelCircumferenceMm
      ? "missing"
      : chainrings.length && cassetteTeeth.length && wheelCircumferenceMm
        ? "complete"
        : "partial");

  return {
    completeness,
    drivetrainType: gearing?.drivetrainType ?? null,
    chainrings,
    cassetteTeeth,
    wheelCircumferenceMm,
    crankLengthMm: gearing?.crankLengthMm ?? bike.currentSetup?.crankLengthMm ?? null,
    groupsetName: gearing?.groupsetName ?? null,
    derailleurMaxCog: gearing?.derailleurMaxCog ?? null,
    lowestGearRatio,
    highestGearRatio,
  };
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

    const [
      profile,
      bikeProfiles,
      wheelsets,
      recommendation,
      pressureCalculations,
      photos,
      linkedGeometryRecord,
    ] =
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
        bike.geometryRecordId ? ctx.db.get(bike.geometryRecordId) : null,
      ]);

    const [linkedGeometryBrand, linkedGeometryModel] = linkedGeometryRecord
      ? await Promise.all([
          ctx.db.get(linkedGeometryRecord.brandId),
          ctx.db.get(linkedGeometryRecord.modelId),
        ])
      : [null, null];

    const photoState = buildBikeDetailPhotos({
      bikeId: String(bike._id),
      bikePhotoUrl: bike.photoUrl,
      bikeUpdatedAt: bike.updatedAt,
      photos: photos.map((photo) => ({
        _id: String(photo._id),
        storageId: photo.storageId,
        caption: photo.caption,
        isPrimary: photo.isPrimary,
        sortOrder: photo.sortOrder,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
      })),
    });

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
    const geometryLinkState = linkedGeometryRecord
      ? "linked"
      : bike.geometryRecordId
        ? "missing_record"
        : "unlinked";

    return {
      bike,
      bikeProfiles: sortNewestFirst(bikeProfiles),
      photos: photoState.detailPhotos,
      activePhotoStorageId: photoState.activePhotoStorageId,
      gearingSummary: buildBikeGearingSummary(bike),
      wheelsets: wheelsetsWithTireSetups,
      activeWheelset,
      activeTireSetup: activeWheelset?.activeTireSetup ?? null,
      latestRecommendation,
      latestPressureCalculation,
      geometryLinkState,
      linkedGeometry:
        linkedGeometryRecord
          ? buildLinkedGeometryDetail({
              record: {
                _id: String(linkedGeometryRecord._id),
                sizeLabel: linkedGeometryRecord.sizeLabel,
                stack: linkedGeometryRecord.stack,
                reach: linkedGeometryRecord.reach,
                seatTubeAngle: linkedGeometryRecord.seatTubeAngle,
                headTubeAngle: linkedGeometryRecord.headTubeAngle,
                source: linkedGeometryRecord.source,
                sourceUrl: linkedGeometryRecord.sourceUrl,
                status: linkedGeometryRecord.status,
                version: linkedGeometryRecord.version,
                supersededBy: linkedGeometryRecord.supersededBy
                  ? String(linkedGeometryRecord.supersededBy)
                  : undefined,
              },
              brand: linkedGeometryBrand
                ? { name: linkedGeometryBrand.name }
                : null,
              model: linkedGeometryModel
                ? {
                    name: linkedGeometryModel.name,
                    yearStart: linkedGeometryModel.yearStart,
                    yearEnd: linkedGeometryModel.yearEnd,
                  }
                : null,
            })
          : null,
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
        const [
          wheelsets,
          calculations,
          recommendations,
          linkedGeometryRecord,
        ] = await Promise.all([
          ctx.db
            .query("wheelsets")
            .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
            .collect(),
          ctx.db
            .query("pressureCalculations")
            .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
            .collect(),
          ctx.db
            .query("recommendations")
            .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
            .collect(),
          bike.geometryRecordId ? ctx.db.get(bike.geometryRecordId) : null,
        ]);
        const activeWheelset =
          wheelsets.find((wheelset) => wheelset.isActive) ??
          [...wheelsets].sort((a, b) => b.createdAt - a.createdAt)[0] ??
          null;

        const [tireSetups, linkedGeometryBrand, linkedGeometryModel] = await Promise.all([
          activeWheelset
            ? ctx.db
                .query("tireSetups")
                .withIndex("by_wheelset", (q) => q.eq("wheelsetId", activeWheelset._id))
                .collect()
            : Promise.resolve([]),
          linkedGeometryRecord ? ctx.db.get(linkedGeometryRecord.brandId) : Promise.resolve(null),
          linkedGeometryRecord ? ctx.db.get(linkedGeometryRecord.modelId) : Promise.resolve(null),
        ]);
        const activeTireSetup =
          tireSetups.find((tireSetup) => tireSetup.isActive) ??
          [...tireSetups].sort((a, b) => b.createdAt - a.createdAt)[0] ??
          null;

        const latestCalculation =
          [...calculations].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

        const latestRecommendation =
          [...recommendations].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

        return {
          ...bike,
          linkedGeometrySummary: linkedGeometryRecord
            ? buildGarageLinkedGeometrySummary({
                record: {
                  sizeLabel: linkedGeometryRecord.sizeLabel,
                },
                brand: linkedGeometryBrand
                  ? { name: linkedGeometryBrand.name }
                  : null,
                model: linkedGeometryModel
                  ? {
                      name: linkedGeometryModel.name,
                      yearStart: linkedGeometryModel.yearStart,
                      yearEnd: linkedGeometryModel.yearEnd,
                    }
                  : null,
              })
            : null,
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
          gearingSummary: buildBikeGearingSummary(bike),
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

export const lookupByPassportId = query({
  args: { bikePassportId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const sourceBike = await findBikeByPassportId(ctx, args.bikePassportId);

    if (!sourceBike) {
      return { status: "not_found" as const };
    }
    if (sourceBike.userId === userId) {
      return {
        status: "self_owned" as const,
        bikeId: sourceBike._id,
        bikePassportId: sourceBike.bikePassportId ?? null,
      };
    }

    const existingImport = sourceBike.bikePassportId
      ? (
          await ctx.db
            .query("bikes")
            .withIndex("by_user_imported_from_passport", (q) =>
              q
                .eq("userId", userId)
                .eq("importedFromBikePassportId", sourceBike.bikePassportId!)
            )
            .collect()
        ).sort((left, right) => right.createdAt - left.createdAt)[0] ?? null
      : null;

    return buildBikePassportPreview({
      bike: sourceBike,
      photos: await ctx.db
        .query("bikePhotos")
        .withIndex("by_bike", (q) => q.eq("bikeId", sourceBike._id))
        .collect(),
      existingBikeId: existingImport?._id ?? null,
    });
  },
});

export const getByPublicFitCode = query({
  args: { publicFitCode: v.string() },
  handler: async (ctx, args) => {
    const normalizedCode = normalizePublicFitCode(args.publicFitCode);
    const accessMode = isValidPublicFitCode(normalizedCode)
      ? ("public_fit_code" as const)
      : ("bike_passport" as const);
    const bike = accessMode === "public_fit_code"
      ? await ctx.db
          .query("bikes")
          .withIndex("by_public_fit_code", (q) =>
            q.eq("publicFitCode", normalizedCode)
          )
          .unique()
      : await findBikeByPassportId(ctx, args.publicFitCode);

    if (!bike || !isPublicFitPreviewActive(bike)) {
      return null;
    }

    const [snapshot, photos] = await Promise.all([
      resolvePublicFitSnapshot(ctx, bike),
      ctx.db
        .query("bikePhotos")
        .withIndex("by_bike", (q) => q.eq("bikeId", bike._id))
        .collect(),
    ]);
    const photoSources = buildPublicFitPhotoSources({
      bike,
      photos,
    });

    return buildPublicFitPreviewInternal({
      bike,
      snapshot,
      primaryPhotoSource: photoSources.primaryPhotoSource,
      thumbnailSources: photoSources.thumbnailSources,
      accessMode,
    });
  },
});

export const getPublicFitByBikeId = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const bike = await ctx.db.get(args.bikeId);
    if (!bike || !isPublicFitPreviewActive(bike)) {
      return null;
    }

    const snapshot = await resolvePublicFitSnapshot(ctx, bike);

    return {
      bikeId: bike._id,
      bikePassportId: bike.bikePassportId ?? null,
      publicFitTokenVersion: bike.publicFitCodeCreatedAt ?? snapshot.snapshotUpdatedAt,
      passportTokenVersion: snapshot.snapshotUpdatedAt,
      publicFitEnabled: bike.publicFitEnabled === true,
      snapshot,
    };
  },
});
