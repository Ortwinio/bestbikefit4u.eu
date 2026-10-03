import { BIKE_PROFILE_FIELDS, validateBikeProfileField } from "../../shared/bikeProfileFields";
import { assertCanCreateBike, bikeRefinementsAvailable } from "./access";
import { geometryValues, recordBikeProfileChanges } from "./profile";
import { bikeEditError } from "../../shared/bikeEditValidation";
import type { Doc, Id } from "../_generated/dataModel";
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
  isCopyablePassportPhotoStorageId,
  isValidBikePassportId,
  normalizeBikePassportId,
} from "./passport";
import {
  assignOrReusePublicFitCode,
  resolvePublicFitSnapshot,
} from "./publicFit";
import { internal } from "../_generated/api";
import {
  buildBikeGearingRecord,
  type BikeGearingRecord,
} from "../../src/lib/gearing-engine";

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

export const descriptionSourceValidator = v.union(
  v.literal("manual"),
  v.literal("generated"),
  v.literal("template"),
  v.literal("marketplace_import")
);

export function isManagedBikeStorageId(
  value: string | undefined | null
): value is string {
  return isCopyablePassportPhotoStorageId(value);
}

type CreateBikeInput = {
  userId: Id<"users">;
  name: string;
  bikeType: "road" | "gravel" | "mountain" | "hybrid" | "tt_triathlon" | "cyclocross" | "touring" | "city";
  source:
    | "manual"
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
    handlebarReachMm?: number;
    handlebarDropMm?: number;
    spacersMm?: number;
  };
  saddleModel?: string;
  saddleWidthMm?: number;
  pedalModel?: string;
  cleatSystem?: string;
  maxSeatpostMm?: number;
  maxSpacerStackMm?: number;
  gearing?: BikeGearingRecord;
  discipline?: "road" | "gravel" | "mtb" | "tt";
  ridingStyle?: "recreational" | "fitness" | "sportive" | "racing" | "commuting" | "touring";
  primaryGoal?: "comfort" | "balanced" | "performance" | "aerodynamics";
  bikeWeightKg?: number;
  photoUrl?: string;
  fitProfileId?: Id<"profiles">;
  bikeModelId?: Id<"bikeModels">;
  brand?: string;
  model?: string;
  description?: string;
  descriptionSource?: "manual" | "generated" | "template" | "marketplace_import";
  notes?: string;
  bikeTypeSource?:
    | "user"
    | "fallback_pending_confirmation"
    | "inferred_from_usage"
    | "admin_matched";
  needsTypeConfirmation?: boolean;
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
  await assertCanCreateBike(ctx, args.userId);
  const fullRefinements = await bikeRefinementsAvailable(ctx, args.userId);
  if (!fullRefinements && args.source === "passport_import") {
    args = { ...args,
      currentSetup: args.currentSetup ? { ...args.currentSetup, handlebarReachMm: undefined, handlebarDropMm: undefined } : undefined,
      currentGeometry: args.currentGeometry ? { ...args.currentGeometry, seatTubeAngle: undefined, headTubeAngle: undefined } : undefined,
      gearing: args.gearing ? { ...args.gearing, chainrings: undefined, cassetteTeeth: undefined } : undefined,
    };
  }
  validateShortString(args.name, "name");
  if (args.brand !== undefined) validateShortString(args.brand, "brand");
  if (args.model !== undefined) validateShortString(args.model, "model");
  if (args.description !== undefined) validateLongTextString(args.description, "description");
  if (args.notes !== undefined) validateTextString(args.notes, "notes");

  const now = args.createdAt ?? Date.now();
  const updatedAt = args.updatedAt ?? now;
  const bikePassportId = args.bikePassportId ?? (await generateUniqueBikePassportId(ctx));
  const defaultProfile = getSystemDefaultBikeProfile({
    bikeType: args.bikeType,
    ridingStyle: args.ridingStyle,
  });

  const linkedGeometry = args.geometryRecordId ? await ctx.db.get(args.geometryRecordId) : null;
  // A copied passport may outlive its catalogue entry. Retain copied dimensions, not an invalid trusted link.
  const geometryRecordId = args.source === "passport_import" && linkedGeometry?.status !== "active"
    ? undefined : args.geometryRecordId;
  const geometryRecord = geometryRecordId ? linkedGeometry : null;
  const currentGeometry = geometryRecordId ? geometryValues(geometryRecord) : args.currentGeometry;
  if (geometryRecordId && currentGeometry && !fullRefinements) {
    delete currentGeometry.seatTubeAngle;
    delete currentGeometry.headTubeAngle;
  }
  const additions = Object.fromEntries(["saddleModel", "saddleWidthMm", "pedalModel", "cleatSystem",
    "maxSeatpostMm", "maxSpacerStackMm"].flatMap(field => {
      const value = args[field as keyof CreateBikeInput];
      return value === undefined ? [] : [[field, validateBikeProfileField(field, value)]];
    }));
  // Internal passport/import callers can pass a full setup document. Keep values, never another owner's evidence.
  const currentSetup: CreateBikeInput["currentSetup"] = args.currentSetup ? Object.fromEntries(Object.entries(args.currentSetup)
    .filter(([field]) => Object.hasOwn(BIKE_PROFILE_FIELDS, `currentSetup.${field}`))
    .filter(([, value]) => value !== undefined)
    .map(([field, value]) => [field, validateBikeProfileField(`currentSetup.${field}`, value)])) : undefined;
  const bikeId = await ctx.db.insert("bikes", {
    ...additions,
    userId: args.userId,
    name: args.name,
    bikeType: args.bikeType,
    source: args.source,
    currentGeometry,
    currentSetup,
    gearing: buildBikeGearingRecord(args.gearing),
    discipline: args.discipline,
    ridingStyle: args.ridingStyle,
    primaryGoal: args.primaryGoal,
    bikeWeightKg: args.bikeWeightKg,
    photoUrl: args.photoUrl,
    fitProfileId: args.fitProfileId,
    bikeModelId: args.bikeModelId,
    brand: args.brand,
    model: args.model,
    description: args.description,
    descriptionSource:
      args.descriptionSource ?? (args.description ? "manual" : undefined),
    descriptionUpdatedAt: args.description ? now : undefined,
    notes: args.notes,
    bikeTypeSource: args.bikeTypeSource,
    needsTypeConfirmation: args.needsTypeConfirmation,
    geometryRecordId: geometryRecordId ?? undefined,
    bikePassportId,
    importedFromBikePassportId: args.importedFromBikePassportId,
    createdAt: now,
    updatedAt,
  });

  const supplied = { ...additions, ...(args.gearing ? { gearing: buildBikeGearingRecord(args.gearing) } : {}),
    ...(currentSetup ? { currentSetup } : {}),
    ...(currentGeometry ? { currentGeometry } : {}), ...(args.primaryGoal ? { primaryGoal: args.primaryGoal } : {}) };
  if (Object.keys(supplied).length) {
    const trustedGeometry = geometryRecord && ["manufacturer", "admin_import", "admin_manual"].includes(geometryRecord.source);
    const evidence: Record<string, { kind: "declared" | "estimated"; measuredAt: number;
      source: "profile_edit" | "geometry_database"; method?: string }> = geometryRecordId && currentGeometry ? Object.fromEntries(Object.keys(currentGeometry)
      .map(field => [`currentGeometry.${field}`, { kind: "declared" as const, measuredAt: now,
        source: trustedGeometry ? "geometry_database" as const : "profile_edit" as const }])) : {};
    if (args.source !== "manual") {
      for (const field of Object.keys(BIKE_PROFILE_FIELDS)) {
        const [group, key] = field.split(".");
        const value = key ? (supplied[group as keyof typeof supplied] as Record<string, unknown> | undefined)?.[key]
          : supplied[field as keyof typeof supplied];
        if (value !== undefined && !evidence[field]) evidence[field] = {
          kind: "estimated", measuredAt: now, source: "profile_edit", method: args.source,
        };
      }
    }
    const initial = { _id: bikeId, _creationTime: now, userId: args.userId } as Doc<"bikes">;
    const fieldMeasurements = await recordBikeProfileChanges(ctx, initial, supplied, evidence);
    await ctx.db.patch(bikeId, { fieldMeasurements });
  }

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
        handlebarReachMm: v.optional(v.number()), handlebarDropMm: v.optional(v.number()),
        spacersMm: v.optional(v.number()),
      })
    ),
    gearing: v.optional(
      v.object({
        drivetrainType: v.optional(v.union(v.literal("1x"), v.literal("2x"))),
        chainrings: v.optional(v.array(v.number())),
        cassetteTeeth: v.optional(v.array(v.number())),
        wheelCircumferenceMm: v.optional(v.number()),
        crankLengthMm: v.optional(v.number()),
        groupsetName: v.optional(v.string()),
        derailleurMaxCog: v.optional(v.number()),
        completeness: v.optional(
          v.union(
            v.literal("missing"),
            v.literal("partial"),
            v.literal("complete"),
            v.literal("validated")
          )
        ),
        source: v.optional(
          v.union(
            v.literal("user_entered"),
            v.literal("preset"),
            v.literal("derived"),
            v.literal("imported")
          )
        ),
        updatedAt: v.optional(v.number()),
      })
    ),
    discipline: v.optional(disciplineValidator),
    ridingStyle: v.optional(ridingStyleValidator),
    primaryGoal: v.optional(primaryGoalValidator),
    bikeWeightKg: v.optional(v.number()),
    saddleModel: v.optional(v.string()), saddleWidthMm: v.optional(v.number()),
    pedalModel: v.optional(v.string()), cleatSystem: v.optional(v.string()),
    maxSeatpostMm: v.optional(v.number()), maxSpacerStackMm: v.optional(v.number()),
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
        handlebarReachMm: v.optional(v.number()), handlebarDropMm: v.optional(v.number()),
        spacersMm: v.optional(v.number()),
      })
    ),
    gearing: v.optional(
      v.object({
        drivetrainType: v.optional(v.union(v.literal("1x"), v.literal("2x"))),
        chainrings: v.optional(v.array(v.number())),
        cassetteTeeth: v.optional(v.array(v.number())),
        wheelCircumferenceMm: v.optional(v.number()),
        crankLengthMm: v.optional(v.number()),
        groupsetName: v.optional(v.string()),
        derailleurMaxCog: v.optional(v.number()),
        completeness: v.optional(
          v.union(
            v.literal("missing"),
            v.literal("partial"),
            v.literal("complete"),
            v.literal("validated")
          )
        ),
        source: v.optional(
          v.union(
            v.literal("user_entered"),
            v.literal("preset"),
            v.literal("derived"),
            v.literal("imported")
          )
        ),
        updatedAt: v.optional(v.number()),
      })
    ),
    discipline: v.optional(disciplineValidator),
    ridingStyle: v.optional(ridingStyleValidator),
    primaryGoal: v.optional(primaryGoalValidator),
    bikeWeightKg: v.optional(v.number()),
    saddleModel: v.optional(v.string()), saddleWidthMm: v.optional(v.number()),
    pedalModel: v.optional(v.string()), cleatSystem: v.optional(v.string()),
    maxSeatpostMm: v.optional(v.number()), maxSpacerStackMm: v.optional(v.number()),
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
    clearFields: v.optional(v.array(v.union(v.literal("ridingStyle"), v.literal("primaryGoal"),
      v.literal("bikeWeightKg"), ...Object.keys(BIKE_PROFILE_FIELDS).map(field => v.literal(field))))),
  },
  handler: async (ctx, args) => {
    if (args.clearFields && (args.clearFields.length > 32
      || new Set(args.clearFields).size !== args.clearFields.length
      || args.clearFields.some(field => !["ridingStyle", "bikeWeightKg"].includes(field)
        && !Object.hasOwn(BIKE_PROFILE_FIELDS, field)))) throw new Error("Invalid clear fields");
    if (args.name !== undefined) validateShortString(args.name, "name");
    if (args.brand !== undefined) validateShortString(args.brand, "brand");
    if (args.model !== undefined) validateShortString(args.model, "model");
    if (args.description !== undefined) validateLongTextString(args.description, "description");
    if (args.notes !== undefined) validateTextString(args.notes, "notes");
    const { bike } = await requireBikeOwner(ctx, args.bikeId);
    const validationError = bikeEditError(args, bike);
    if (validationError) throw new Error(`Invalid bike values: ${validationError}`);
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.bikeType !== undefined) updates.bikeType = args.bikeType;
    if (args.currentGeometry !== undefined)
      updates.currentGeometry = { ...bike.currentGeometry, ...args.currentGeometry };
    if (args.currentSetup !== undefined)
      updates.currentSetup = { ...bike.currentSetup, ...args.currentSetup };
    if (args.gearing !== undefined) {
      updates.gearing = buildBikeGearingRecord({
        ...bike.gearing, ...args.gearing,
        updatedAt: Date.now(),
      });
    }
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
    for (const field of ["saddleModel", "saddleWidthMm", "pedalModel", "cleatSystem", "maxSeatpostMm", "maxSpacerStackMm"] as const) {
      if (args[field] !== undefined) updates[field] = validateBikeProfileField(field, args[field]);
    }

    for (const field of args.clearFields ?? []) {
      const [group, key] = field.split(".");
      if (key) updates[group] = { ...(bike[group as keyof Doc<"bikes">] as object),
        ...(updates[group] as object), [key]: undefined };
      else updates[field] = undefined;
    }
    const geometryRecord = args.geometryRecordId ? await ctx.db.get(args.geometryRecordId) : null;
    const databaseEvidence = args.geometryRecordId ? geometryValues(geometryRecord) : undefined;
    if (databaseEvidence && !(await bikeRefinementsAvailable(ctx, bike.userId, bike._id))) {
      delete databaseEvidence.seatTubeAngle;
      delete databaseEvidence.headTubeAngle;
    }
    if (databaseEvidence) updates.currentGeometry = databaseEvidence;
    if ((updates.currentSetup as Doc<"bikes">["currentSetup"])?.saddleHeightMm !== bike.currentSetup?.saddleHeightMm
      && updates.currentSetup !== undefined) {
      updates.currentSetup = { ...(updates.currentSetup as object), saddleHeightMeasurement: undefined };
    }
    const trustedGeometry = geometryRecord && ["manufacturer", "admin_import", "admin_manual"].includes(geometryRecord.source);
    const evidence = databaseEvidence ? Object.fromEntries(Object.keys(databaseEvidence).filter(field =>
      args.geometryRecordId !== bike.geometryRecordId ||
      databaseEvidence[field as keyof typeof databaseEvidence] !== bike.currentGeometry?.[field as keyof typeof databaseEvidence])
      .map(field => [`currentGeometry.${field}`, { kind: "declared" as const, measuredAt: Date.now(),
        source: trustedGeometry ? "geometry_database" as const : "profile_edit" as const }])) : {};
    updates.fieldMeasurements = await recordBikeProfileChanges(ctx, bike, updates, evidence);
    await ctx.db.patch(args.bikeId, updates);
    if (
      args.bikeType !== undefined ||
      args.currentGeometry !== undefined ||
      args.geometryRecordId !== undefined
    ) {
      await maybeRefreshPublicFitSnapshot(ctx, args.bikeId, bike);
    }

    if (args.ridingStyle !== undefined || args.bikeType !== undefined || args.clearFields?.includes("ridingStyle")) {
      const nextBike = {
        bikeType: args.bikeType ?? bike.bikeType,
        ridingStyle: args.clearFields?.includes("ridingStyle") ? undefined : args.ridingStyle ?? bike.ridingStyle,
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
  args: { bikeId: v.id("bikes"), confirmName: v.string() },
  handler: async (ctx, args) => {
    const { bike, userId } = await requireBikeOwner(ctx, args.bikeId);
    if (args.confirmName !== bike.name) throw new Error("Bike name confirmation does not match");
    const entitlements = await ctx.db.query("pricingEntitlements")
      .withIndex("by_bike", range => range.eq("bikeId", args.bikeId)).collect();
    for (const entitlement of entitlements) {
      if (entitlement.userId === userId && entitlement.status === "active") {
        await ctx.db.patch(entitlement._id, { status: "revoked", revokedReason: "bike_deleted" });
      }
    }
    await ctx.db.delete(args.bikeId);
    await ctx.scheduler.runAfter(0, internal.bikes.deletion.cascade, {
      bikeId: args.bikeId, userId, photoUrl: bike.photoUrl, stage: 0,
    });
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
      bikeModelId: copyable.bikeModelId,
      brand: args.brand ?? copyable.brand,
      model: args.model ?? copyable.model,
      description: args.description ?? copyable.description,
      descriptionSource:
        args.description !== undefined || copyable.description ? "template" : undefined,
      geometryRecordId: copyable.geometryRecordId,
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
