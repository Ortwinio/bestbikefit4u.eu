import type { Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { requireBikeOwner, requireUserId } from "../lib/authz";
import { validateLongTextString, validateShortString, validateTextString } from "../lib/validation";
import {
  getSystemClimbingBikeProfile,
  getSystemDefaultBikeProfile,
} from "../bikeProfiles/defaults";
import {
  assignBikePassportId,
  buildPassportPhotoCopyPlan,
  findBikeByPassportId,
  generateUniqueBikePassportId,
  getCopyableBikeFields,
  isValidBikePassportId,
  normalizeBikePassportId,
} from "./passport";
import {
  assignOrReusePublicFitCode,
  resolvePublicFitSnapshot,
} from "./publicFit";

export const bikeTypeValidator = v.union(
  v.literal("road"),
  v.literal("gravel"),
  v.literal("mountain"),
  v.literal("hybrid"),
  v.literal("tt_triathlon"),
  v.literal("cyclocross"),
  v.literal("touring"),
  v.literal("city")
);

const disciplineValidator = v.union(
  v.literal("road"),
  v.literal("gravel"),
  v.literal("mtb"),
  v.literal("tt")
);

const ridingStyleValidator = v.union(
  v.literal("recreational"),
  v.literal("fitness"),
  v.literal("sportive"),
  v.literal("racing"),
  v.literal("commuting"),
  v.literal("touring")
);

const primaryGoalValidator = v.union(
  v.literal("comfort"),
  v.literal("balanced"),
  v.literal("performance"),
  v.literal("aerodynamics")
);

export const bikeSourceValidator = v.union(
  v.literal("manual"),
  v.literal("strava"),
  v.literal("admin_import"),
  v.literal("marketplace_import"),
  v.literal("passport_import")
);

export const descriptionSourceValidator = v.union(
  v.literal("manual"),
  v.literal("generated"),
  v.literal("template"),
  v.literal("marketplace_import")
);

type CreateBikeInput = {
  userId: Id<"users">;
  name: string;
  bikeType: "road" | "gravel" | "mountain" | "hybrid" | "tt_triathlon" | "cyclocross" | "touring" | "city";
  source:
    | "manual"
    | "strava"
    | "admin_import"
    | "marketplace_import"
    | "passport_import";
  currentGeometry?: {
    stackMm?: number;
    reachMm?: number;
    seatTubeAngle?: number;
    headTubeAngle?: number;
    frameSize?: string;
  };
  currentSetup?: {
    saddleHeightMm?: number;
    saddleSetbackMm?: number;
    stemLengthMm?: number;
    stemAngle?: number;
    handlebarWidthMm?: number;
    crankLengthMm?: number;
  };
  discipline?: "road" | "gravel" | "mtb" | "tt";
  ridingStyle?: "recreational" | "fitness" | "sportive" | "racing" | "commuting" | "touring";
  primaryGoal?: "comfort" | "balanced" | "performance" | "aerodynamics";
  bikeWeightKg?: number;
  photoUrl?: string;
  fitProfileId?: Id<"profiles">;
  brand?: string;
  model?: string;
  description?: string;
  descriptionSource?: "manual" | "generated" | "template" | "marketplace_import";
  notes?: string;
  bikeTypeSource?:
    | "user"
    | "strava_frame_type"
    | "fallback_pending_confirmation"
    | "inferred_from_usage"
    | "admin_matched";
  needsTypeConfirmation?: boolean;
  stravaGearId?: string;
  stravaPrimary?: boolean;
  lifetimeDistanceMeters?: number;
  lastStravaSync?: number;
  importSourceName?: "marktplaats";
  importSourceUrl?: string;
  importCanonicalUrl?: string;
  importedAdvertTitle?: string;
  bikeImportId?: Id<"bikeImports">;
  geometryRecordId?: Id<"geometry_records"> | null;
  bikePassportId?: string;
  importedFromBikePassportId?: string;
  createdAt?: number;
  updatedAt?: number;
};

export async function createBikeWithProfiles(
  ctx: MutationCtx,
  args: CreateBikeInput
) {
  validateShortString(args.name, "name");
  if (args.brand !== undefined) validateShortString(args.brand, "brand");
  if (args.model !== undefined) validateShortString(args.model, "model");
  if (args.description !== undefined) validateLongTextString(args.description, "description");
  if (args.notes !== undefined) validateTextString(args.notes, "notes");
  if (args.importSourceUrl !== undefined)
    validateTextString(args.importSourceUrl, "importSourceUrl");
  if (args.importCanonicalUrl !== undefined)
    validateTextString(args.importCanonicalUrl, "importCanonicalUrl");
  if (args.importedAdvertTitle !== undefined)
    validateTextString(args.importedAdvertTitle, "importedAdvertTitle");

  const now = args.createdAt ?? Date.now();
  const updatedAt = args.updatedAt ?? now;
  const bikePassportId = args.bikePassportId ?? (await generateUniqueBikePassportId(ctx));
  const defaultProfile = getSystemDefaultBikeProfile({
    bikeType: args.bikeType,
    ridingStyle: args.ridingStyle,
  });

  const bikeId = await ctx.db.insert("bikes", {
    userId: args.userId,
    name: args.name,
    bikeType: args.bikeType,
    source: args.source,
    currentGeometry: args.currentGeometry,
    currentSetup: args.currentSetup,
    discipline: args.discipline,
    ridingStyle: args.ridingStyle,
    primaryGoal: args.primaryGoal,
    bikeWeightKg: args.bikeWeightKg,
    photoUrl: args.photoUrl,
    fitProfileId: args.fitProfileId,
    brand: args.brand,
    model: args.model,
    description: args.description,
    descriptionSource:
      args.descriptionSource ?? (args.description ? "manual" : undefined),
    descriptionUpdatedAt: args.description ? now : undefined,
    notes: args.notes,
    bikeTypeSource: args.bikeTypeSource,
    needsTypeConfirmation: args.needsTypeConfirmation,
    stravaGearId: args.stravaGearId,
    stravaPrimary: args.stravaPrimary,
    lifetimeDistanceMeters: args.lifetimeDistanceMeters,
    lastStravaSync: args.lastStravaSync,
    importSourceName: args.importSourceName,
    importSourceUrl: args.importSourceUrl,
    importCanonicalUrl: args.importCanonicalUrl,
    importedAdvertTitle: args.importedAdvertTitle,
    bikeImportId: args.bikeImportId,
    geometryRecordId: args.geometryRecordId ?? undefined,
    bikePassportId,
    importedFromBikePassportId: args.importedFromBikePassportId,
    createdAt: now,
    updatedAt,
  });

  await ctx.db.insert("bikeProfiles", {
    userId: args.userId,
    bikeId,
    name: defaultProfile.name,
    profileType: defaultProfile.profileType,
    isDefault: true,
    status: "active",
    source: "system_default",
    createdAt: now,
    updatedAt,
  });

  const climbingProfile = getSystemClimbingBikeProfile({
    bikeType: args.bikeType,
  });
  if (climbingProfile) {
    await ctx.db.insert("bikeProfiles", {
      userId: args.userId,
      bikeId,
      name: climbingProfile.name,
      profileType: climbingProfile.profileType,
      isDefault: false,
      status: "active",
      source: "system_default",
      createdAt: now,
      updatedAt,
    });
  }

  return bikeId;
}

async function maybeRefreshPublicFitSnapshot(
  ctx: MutationCtx,
  bikeId: Id<"bikes">,
  currentBike: {
    publicFitCode?: string;
    publicFitEnabled?: boolean;
    publicFitSnapshot?: unknown;
  }
) {
  if (
    !currentBike.publicFitCode &&
    !currentBike.publicFitEnabled &&
    currentBike.publicFitSnapshot === undefined
  ) {
    return;
  }

  const bike = await ctx.db.get(bikeId);
  if (!bike) {
    return;
  }

  const publicFitSnapshot = await resolvePublicFitSnapshot(ctx, bike);
  await ctx.db.patch(bikeId, {
    publicFitSnapshot,
    updatedAt: Date.now(),
  });
}

export const create = mutation({
  args: {
    name: v.string(),
    bikeType: bikeTypeValidator,
    currentGeometry: v.optional(
      v.object({
        stackMm: v.optional(v.number()),
        reachMm: v.optional(v.number()),
        seatTubeAngle: v.optional(v.number()),
        headTubeAngle: v.optional(v.number()),
        frameSize: v.optional(v.string()),
      })
    ),
    currentSetup: v.optional(
      v.object({
        saddleHeightMm: v.optional(v.number()),
        saddleSetbackMm: v.optional(v.number()),
        stemLengthMm: v.optional(v.number()),
        stemAngle: v.optional(v.number()),
        handlebarWidthMm: v.optional(v.number()),
        crankLengthMm: v.optional(v.number()),
      })
    ),
    discipline: v.optional(disciplineValidator),
    ridingStyle: v.optional(ridingStyleValidator),
    primaryGoal: v.optional(primaryGoalValidator),
    bikeWeightKg: v.optional(v.number()),
    photoUrl: v.optional(v.string()),
    fitProfileId: v.optional(v.id("profiles")),
    geometryRecordId: v.optional(v.union(v.id("geometry_records"), v.null())),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionSource: v.optional(descriptionSourceValidator),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await createBikeWithProfiles(ctx, {
      ...args,
      userId,
      source: "manual",
    });
  },
});

export const update = mutation({
  args: {
    bikeId: v.id("bikes"),
    name: v.optional(v.string()),
    bikeType: v.optional(
      v.union(
        v.literal("road"),
        v.literal("gravel"),
        v.literal("mountain"),
        v.literal("hybrid"),
        v.literal("tt_triathlon"),
        v.literal("cyclocross"),
        v.literal("touring"),
        v.literal("city")
      )
    ),
    currentGeometry: v.optional(
      v.object({
        stackMm: v.optional(v.number()),
        reachMm: v.optional(v.number()),
        seatTubeAngle: v.optional(v.number()),
        headTubeAngle: v.optional(v.number()),
        frameSize: v.optional(v.string()),
      })
    ),
    currentSetup: v.optional(
      v.object({
        saddleHeightMm: v.optional(v.number()),
        saddleSetbackMm: v.optional(v.number()),
        stemLengthMm: v.optional(v.number()),
        stemAngle: v.optional(v.number()),
        handlebarWidthMm: v.optional(v.number()),
        crankLengthMm: v.optional(v.number()),
      })
    ),
    discipline: v.optional(disciplineValidator),
    ridingStyle: v.optional(ridingStyleValidator),
    primaryGoal: v.optional(primaryGoalValidator),
    bikeWeightKg: v.optional(v.number()),
    photoUrl: v.optional(v.string()),
    fitProfileId: v.optional(v.id("profiles")),
    geometryRecordId: v.optional(v.union(v.id("geometry_records"), v.null())),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionSource: v.optional(descriptionSourceValidator),
    bikeTypeSource: v.optional(
      v.union(
        v.literal("user"),
        v.literal("strava_frame_type"),
        v.literal("fallback_pending_confirmation"),
        v.literal("inferred_from_usage"),
        v.literal("admin_matched")
      )
    ),
    needsTypeConfirmation: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.name !== undefined) validateShortString(args.name, "name");
    if (args.brand !== undefined) validateShortString(args.brand, "brand");
    if (args.model !== undefined) validateShortString(args.model, "model");
    if (args.description !== undefined) validateLongTextString(args.description, "description");
    if (args.notes !== undefined) validateTextString(args.notes, "notes");
    const { bike } = await requireBikeOwner(ctx, args.bikeId);
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.bikeType !== undefined) updates.bikeType = args.bikeType;
    if (args.currentGeometry !== undefined)
      updates.currentGeometry = args.currentGeometry;
    if (args.currentSetup !== undefined)
      updates.currentSetup = args.currentSetup;
    if (args.discipline !== undefined) updates.discipline = args.discipline;
    if (args.ridingStyle !== undefined) updates.ridingStyle = args.ridingStyle;
    if (args.primaryGoal !== undefined) updates.primaryGoal = args.primaryGoal;
    if (args.bikeWeightKg !== undefined) updates.bikeWeightKg = args.bikeWeightKg;
    if (args.photoUrl !== undefined) updates.photoUrl = args.photoUrl;
    if (args.fitProfileId !== undefined) updates.fitProfileId = args.fitProfileId;
    if (args.geometryRecordId !== undefined) {
      updates.geometryRecordId = args.geometryRecordId ?? undefined;
    }
    if (args.brand !== undefined) updates.brand = args.brand;
    if (args.model !== undefined) updates.model = args.model;
    if (args.description !== undefined) {
      updates.description = args.description;
      updates.descriptionUpdatedAt = Date.now();
    }
    if (args.descriptionSource !== undefined) {
      updates.descriptionSource = args.descriptionSource;
    } else if (args.description !== undefined) {
      updates.descriptionSource = "manual";
    }
    if (args.bikeTypeSource !== undefined) updates.bikeTypeSource = args.bikeTypeSource;
    if (args.needsTypeConfirmation !== undefined)
      updates.needsTypeConfirmation = args.needsTypeConfirmation;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.bikeId, updates);
    if (
      args.bikeType !== undefined ||
      args.currentGeometry !== undefined ||
      args.geometryRecordId !== undefined
    ) {
      await maybeRefreshPublicFitSnapshot(ctx, args.bikeId, bike);
    }

    if (args.ridingStyle !== undefined || args.bikeType !== undefined) {
      const nextBike = {
        bikeType: args.bikeType ?? bike.bikeType,
        ridingStyle: args.ridingStyle ?? bike.ridingStyle,
      };
      const defaults = getSystemDefaultBikeProfile(nextBike);
      const defaultProfile = await ctx.db
        .query("bikeProfiles")
        .withIndex("by_bike_default", (q) =>
          q.eq("bikeId", args.bikeId).eq("isDefault", true)
        )
        .first();

      if (defaultProfile && defaultProfile.source === "system_default") {
        await ctx.db.patch(defaultProfile._id, {
          name: defaults.name,
          profileType: defaults.profileType,
          updatedAt: Date.now(),
        });
      }
    }
  },
});

export const assignPublicFitCode = mutation({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const { bike } = await requireBikeOwner(ctx, args.bikeId);
    const codeState = await assignOrReusePublicFitCode(ctx, bike);
    const publicFitSnapshot = await resolvePublicFitSnapshot(
      ctx,
      bike,
      codeState.publicFitCodeCreatedAt
    );

    await ctx.db.patch(args.bikeId, {
      publicFitCode: codeState.publicFitCode,
      publicFitEnabled: true,
      publicFitCodeCreatedAt: codeState.publicFitCodeCreatedAt,
      publicFitSnapshot,
      updatedAt: codeState.publicFitCodeCreatedAt,
    });

    return {
      publicFitCode: codeState.publicFitCode,
      publicFitEnabled: true,
      publicFitCodeCreatedAt: codeState.publicFitCodeCreatedAt,
      publicFitSnapshot,
    };
  },
});

export const revokePublicFitCode = mutation({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const { bike } = await requireBikeOwner(ctx, args.bikeId);

    await ctx.db.patch(args.bikeId, {
      publicFitEnabled: false,
      updatedAt: Date.now(),
    });

    return {
      publicFitCode: bike.publicFitCode ?? null,
      publicFitEnabled: false,
      publicFitCodeCreatedAt: bike.publicFitCodeCreatedAt ?? null,
    };
  },
});

export const remove = mutation({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    const { bike, userId } = await requireBikeOwner(ctx, args.bikeId);

    const fitSessions = await ctx.db
      .query("fitSessions")
      .withIndex("by_user_bike", (q) =>
        q.eq("userId", userId).eq("bikeId", args.bikeId)
      )
      .collect();

    if (fitSessions.length > 0) {
      throw new Error(
        "This bike cannot be deleted yet because it has fitting history."
      );
    }

    const pressureCalculations = await ctx.db
      .query("pressureCalculations")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
    for (const calculation of pressureCalculations) {
      await ctx.db.delete(calculation._id);
    }

    const pressureProfiles = await ctx.db
      .query("pressureProfiles")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
    for (const profile of pressureProfiles) {
      await ctx.db.delete(profile._id);
    }

    const bikeProfiles = await ctx.db
      .query("bikeProfiles")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
    for (const bikeProfile of bikeProfiles) {
      await ctx.db.delete(bikeProfile._id);
    }

    const wheelsets = await ctx.db
      .query("wheelsets")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
    for (const wheelset of wheelsets) {
      const tireSetups = await ctx.db
        .query("tireSetups")
        .withIndex("by_wheelset", (q) => q.eq("wheelsetId", wheelset._id))
        .collect();
      for (const tireSetup of tireSetups) {
        await ctx.db.delete(tireSetup._id);
      }
      await ctx.db.delete(wheelset._id);
    }

    const bikePhotos = await ctx.db
      .query("bikePhotos")
      .withIndex("by_bike", (q) => q.eq("bikeId", args.bikeId))
      .collect();
    const storageIdsToDelete = new Set<string>();
    for (const bikePhoto of bikePhotos) {
      storageIdsToDelete.add(bikePhoto.storageId);
      await ctx.db.delete(bikePhoto._id);
    }

    if (typeof bike.photoUrl === "string" && bike.photoUrl.length > 0) {
      storageIdsToDelete.add(bike.photoUrl);
    }

    for (const storageId of storageIdsToDelete) {
      await ctx.storage.delete(storageId as Id<"_storage">);
    }

    await ctx.db.delete(args.bikeId);
  },
});

export const importByPassport = mutation({
  args: {
    bikePassportId: v.string(),
    name: v.optional(v.string()),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    bikeType: v.optional(bikeTypeValidator),
    description: v.optional(v.string()),
    copyPhotos: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    validateTextString(args.bikePassportId, "bikePassportId");
    if (args.name !== undefined) {
      validateShortString(args.name, "name");
    }
    if (args.brand !== undefined) {
      validateShortString(args.brand, "brand");
    }
    if (args.model !== undefined) {
      validateShortString(args.model, "model");
    }
    if (args.description !== undefined) {
      validateLongTextString(args.description, "description");
    }

    const userId = await requireUserId(ctx);
    const normalizedPassportId = normalizeBikePassportId(args.bikePassportId);
    if (!isValidBikePassportId(normalizedPassportId)) {
      throw new Error("invalid_bike_passport_id");
    }
    const sourceBike = await findBikeByPassportId(ctx, normalizedPassportId);

    if (!sourceBike) {
      throw new Error("bike_passport_not_found");
    }
    if (sourceBike.userId === userId) {
      throw new Error("bike_passport_owned_by_user");
    }
    if (!sourceBike.bikePassportId) {
      throw new Error("bike_passport_not_ready");
    }

    const existingImport = (
      await ctx.db
        .query("bikes")
        .withIndex("by_user_imported_from_passport", (q) =>
          q
            .eq("userId", userId)
            .eq("importedFromBikePassportId", sourceBike.bikePassportId!)
        )
        .collect()
    )
      .sort((left, right) => right.createdAt - left.createdAt)[0] ?? null;

    if (existingImport) {
      return {
        status: "duplicate_reused" as const,
        bikeId: existingImport._id,
        createdBikeId: existingImport._id,
        sourceBikePassportId: sourceBike.bikePassportId,
        copiedPhotoCount: 0,
      };
    }

    const copyable = getCopyableBikeFields(sourceBike);
    const sourcePhotos =
      args.copyPhotos === false
        ? []
        : await ctx.db
            .query("bikePhotos")
            .withIndex("by_bike", (q) => q.eq("bikeId", sourceBike._id))
            .collect();
    const photoPlan =
      args.copyPhotos === false
        ? { safePhotos: [], primaryPhotoUrl: undefined }
        : buildPassportPhotoCopyPlan({
            bike: sourceBike,
            photos: sourcePhotos,
          });

    const bikeId = await createBikeWithProfiles(ctx, {
      userId,
      name: args.name ?? copyable.name,
      bikeType: args.bikeType ?? copyable.bikeType,
      source: "passport_import",
      currentGeometry: copyable.currentGeometry,
      currentSetup: copyable.currentSetup,
      discipline: copyable.discipline,
      ridingStyle: copyable.ridingStyle,
      primaryGoal: copyable.primaryGoal,
      bikeWeightKg: copyable.bikeWeightKg,
      photoUrl: photoPlan.primaryPhotoUrl,
      brand: args.brand ?? copyable.brand,
      model: args.model ?? copyable.model,
      description: args.description ?? copyable.description,
      descriptionSource:
        args.description !== undefined || copyable.description ? "template" : undefined,
      importedFromBikePassportId: sourceBike.bikePassportId,
    });

    if (photoPlan.safePhotos.length > 0) {
      const now = Date.now();
      for (const photo of photoPlan.safePhotos) {
        await ctx.db.insert("bikePhotos", {
          userId,
          bikeId,
          storageId: photo.storageId,
          caption: photo.caption,
          isPrimary: photo.isPrimary,
          sortOrder: photo.sortOrder,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return {
      status: "imported" as const,
      bikeId,
      sourceBikePassportId: sourceBike.bikePassportId ?? null,
      createdBikeId: bikeId,
      copiedPhotoCount: photoPlan.safePhotos.length,
    };
  },
});

export const ensurePassportIdForBike = mutation({
  args: {
    bikeId: v.id("bikes"),
  },
  handler: async (ctx, args) => {
    const { bike } = await requireBikeOwner(ctx, args.bikeId);
    return await assignBikePassportId(ctx, bike._id);
  },
});

export const ensurePassportIdsForOwnedBikes = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const bikes = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let updatedCount = 0;
    for (const bike of bikes) {
      if (bike.bikePassportId) {
        continue;
      }
      await assignBikePassportId(ctx, bike._id);
      updatedCount += 1;
    }

    return { updatedCount };
  },
});
