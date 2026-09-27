import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type ReferenceSnapshot = {
  candidateStorageIds: string[];
  referencedPhotoRows: Array<{
    storageId: string;
    bikeId: Id<"bikes">;
  }>;
  referencedBikePhotoUrls: Array<{
    photoUrl: string;
    bikeId: Id<"bikes">;
  }>;
  ignoredBikeIds?: Id<"bikes">[];
  referencedProfileImages?: string[];
};

export function getUnreferencedStorageIds({
  candidateStorageIds,
  referencedPhotoRows,
  referencedBikePhotoUrls,
  ignoredBikeIds = [],
  referencedProfileImages = [],
}: ReferenceSnapshot) {
  const ignoredBikeIdsSet = new Set(ignoredBikeIds);

  return candidateStorageIds.filter((storageId) => {
    if (referencedProfileImages.includes(storageId)) return false;
    const usedByPhoto = referencedPhotoRows.some(
      (row) =>
        row.storageId === storageId && !ignoredBikeIdsSet.has(row.bikeId)
    );
    if (usedByPhoto) {
      return false;
    }

    const usedByBikePhotoUrl = referencedBikePhotoUrls.some(
      (row) =>
        row.photoUrl === storageId && !ignoredBikeIdsSet.has(row.bikeId)
    );
    return !usedByBikePhotoUrl;
  });
}

export async function findUnreferencedStorageIdsForBikes({
  ctx,
  candidateStorageIds,
  ignoredBikeIds = [],
}: {
  ctx: MutationCtx;
  candidateStorageIds: string[];
  ignoredBikeIds?: Id<"bikes">[];
}) {
  const uniqueCandidateStorageIds = [...new Set(candidateStorageIds)];
  if (uniqueCandidateStorageIds.length === 0) {
    return [];
  }

  const referencedPhotoRows = (
    await Promise.all(
      uniqueCandidateStorageIds.map((storageId) =>
        ctx.db
          .query("bikePhotos")
          .withIndex("by_storage", (q) => q.eq("storageId", storageId))
          .collect()
      )
    )
  ).flatMap((rows) =>
    rows.map((row) => ({
      storageId: row.storageId,
      bikeId: row.bikeId,
    }))
  );

  const references = await Promise.all(uniqueCandidateStorageIds.map(async (storageId) => {
    const [bikes, profiles] = await Promise.all([
      ctx.db.query("bikes").withIndex("by_photo_url", (q) => q.eq("photoUrl", storageId)).collect(),
      ctx.db.query("users").withIndex("by_profile_image", (q) => q.eq("profile_image_url", storageId)).take(1),
    ]);
    return {
      bikes: bikes.map((bike) => ({ bikeId: bike._id, photoUrl: storageId })),
      profileImage: profiles.length > 0 ? [storageId] : [],
    };
  }));
  const referencedBikePhotoUrls = references.flatMap((reference) => reference.bikes);
  const referencedProfileImages = references.flatMap((reference) => reference.profileImage);

  return getUnreferencedStorageIds({
    candidateStorageIds: uniqueCandidateStorageIds,
    referencedPhotoRows,
    referencedBikePhotoUrls,
    referencedProfileImages,
    ignoredBikeIds,
  });
}
