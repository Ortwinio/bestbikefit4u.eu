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
};

export function getUnreferencedStorageIds({
  candidateStorageIds,
  referencedPhotoRows,
  referencedBikePhotoUrls,
  ignoredBikeIds = [],
}: ReferenceSnapshot) {
  const ignoredBikeIdsSet = new Set(ignoredBikeIds);

  return candidateStorageIds.filter((storageId) => {
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

  const allBikes = await ctx.db.query("bikes").collect();
  const referencedBikePhotoUrls = allBikes
    .filter(
      (bike): bike is typeof bike & { photoUrl: string } =>
        typeof bike.photoUrl === "string" &&
        uniqueCandidateStorageIds.includes(bike.photoUrl)
    )
    .map((bike) => ({
      bikeId: bike._id,
      photoUrl: bike.photoUrl,
    }));

  return getUnreferencedStorageIds({
    candidateStorageIds: uniqueCandidateStorageIds,
    referencedPhotoRows,
    referencedBikePhotoUrls,
    ignoredBikeIds,
  });
}
