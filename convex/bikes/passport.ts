import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { internalMutation, type MutationCtx, type QueryCtx } from "../_generated/server";

type DbCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

const BIKE_PASSPORT_PATTERN = /^BBF-[A-F0-9]{4}-[A-F0-9]{4}$/u;

export type CopyableBikeFields = Pick<
  Doc<"bikes">,
  | "name"
  | "bikeType"
  | "currentGeometry"
  | "currentSetup"
  | "discipline"
  | "ridingStyle"
  | "primaryGoal"
  | "bikeWeightKg"
  | "brand"
  | "model"
  | "bikeModelId"
  | "geometryRecordId"
  | "description"
  | "descriptionSource"
>;

type PassportPhotoSnapshot = Pick<
  Doc<"bikePhotos">,
  "storageId" | "caption" | "isPrimary" | "sortOrder"
>;

export function normalizeBikePassportId(value: string) {
  return value.trim().toUpperCase();
}

export function isValidBikePassportId(value: string) {
  return BIKE_PASSPORT_PATTERN.test(normalizeBikePassportId(value));
}

function buildPassportCandidate() {
  const segment = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `BBF-${segment.slice(0, 4)}-${segment.slice(4, 8)}`;
}

export async function generateUniqueBikePassportId(ctx: DbCtx): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const bikePassportId = buildPassportCandidate();
    const existing = await ctx.db
      .query("bikes")
      .withIndex("by_bike_passport_id", (q) =>
        q.eq("bikePassportId", bikePassportId)
      )
      .unique();
    if (!existing) {
      return bikePassportId;
    }
  }

  throw new Error("bike_passport_id_generation_failed");
}

export async function findBikeByPassportId(ctx: DbCtx, passportId: string) {
  const normalized = normalizeBikePassportId(passportId);
  if (!isValidBikePassportId(normalized)) {
    return null;
  }

  return await ctx.db
    .query("bikes")
    .withIndex("by_bike_passport_id", (q) => q.eq("bikePassportId", normalized))
    .unique();
}

export function getCopyableBikeFields(bike: Doc<"bikes">): CopyableBikeFields {
  return {
    name: bike.name,
    bikeType: bike.bikeType,
    currentGeometry: bike.currentGeometry,
    currentSetup: bike.currentSetup,
    discipline: bike.discipline,
    ridingStyle: bike.ridingStyle,
    primaryGoal: bike.primaryGoal,
    bikeWeightKg: bike.bikeWeightKg,
    brand: bike.brand,
    model: bike.model,
    bikeModelId: bike.bikeModelId,
    geometryRecordId: bike.geometryRecordId,
    description: bike.description,
    descriptionSource: bike.descriptionSource,
  };
}

export function isCopyablePassportPhotoStorageId(
  storageId: string | undefined | null
): storageId is string {
  return Boolean(
    storageId &&
      storageId.length > 0 &&
      !storageId.startsWith("http://") &&
      !storageId.startsWith("https://")
  );
}

export function buildPassportPhotoCopyPlan({
  bike,
  photos,
}: {
  bike: Pick<Doc<"bikes">, "photoUrl">;
  photos: PassportPhotoSnapshot[];
}) {
  const safePhotos = photos.filter((photo) =>
    isCopyablePassportPhotoStorageId(photo.storageId)
  );
  const primaryPhoto =
    safePhotos.find((photo) => photo.isPrimary) ?? safePhotos[0] ?? null;
  const legacyPhotoUrl = safePhotos.some((photo) => photo.storageId === bike.photoUrl)
    ? undefined
    : isCopyablePassportPhotoStorageId(bike.photoUrl)
      ? bike.photoUrl
      : undefined;

  return {
    safePhotos,
    primaryPhotoUrl: primaryPhoto?.storageId ?? legacyPhotoUrl,
  };
}

export function buildBikePassportPreview({
  bike,
  photos = [],
  existingBikeId = null,
}: {
  bike: Doc<"bikes">;
  photos?: PassportPhotoSnapshot[];
  existingBikeId?: Id<"bikes"> | null;
}) {
  const copyable = getCopyableBikeFields(bike);
  const photoPlan = buildPassportPhotoCopyPlan({ bike, photos });

  return {
    status: "available" as const,
    bikePassportId: bike.bikePassportId ?? null,
    existingBikeId,
    bike: {
      name: copyable.name,
      bikeType: copyable.bikeType,
      brand: copyable.brand ?? "",
      model: copyable.model ?? "",
      description: copyable.description ?? "",
      descriptionSource: copyable.descriptionSource,
      photoUrl: photoPlan.primaryPhotoUrl ?? null,
      currentGeometry: copyable.currentGeometry,
      currentSetup: copyable.currentSetup,
      discipline: copyable.discipline,
      ridingStyle: copyable.ridingStyle,
      primaryGoal: copyable.primaryGoal,
      bikeWeightKg: copyable.bikeWeightKg,
    },
    photos: photoPlan.safePhotos.map((photo) => ({
      storageId: photo.storageId,
      caption: photo.caption,
      isPrimary: photo.isPrimary,
      sortOrder: photo.sortOrder,
    })),
    copyIncludesPhotos: photoPlan.safePhotos.length > 0,
  };
}

export async function assignBikePassportId(
  ctx: MutationCtx,
  bikeId: Id<"bikes">
): Promise<string> {
  const bike = await ctx.db.get(bikeId);
  if (!bike) {
    throw new Error("bike_not_found");
  }
  if (bike.bikePassportId) {
    return bike.bikePassportId;
  }

  const bikePassportId = await generateUniqueBikePassportId(ctx);
  await ctx.db.patch(bikeId, {
    bikePassportId,
    updatedAt: Date.now(),
  });
  return bikePassportId;
}

export const backfillMissingPassportIds = internalMutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 250, 1000));
    const bikes = await ctx.db.query("bikes").collect();
    const missing = bikes
      .filter((bike) => !bike.bikePassportId)
      .sort((left, right) => left.createdAt - right.createdAt);
    const batch = missing.slice(0, limit);

    for (const bike of batch) {
      await assignBikePassportId(ctx, bike._id);
    }

    return {
      scanned: bikes.length,
      updated: batch.length,
      remaining: Math.max(0, missing.length - batch.length),
    };
  },
});
