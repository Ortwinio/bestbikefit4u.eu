import { describe, expect, it } from "vitest";
import { getUnreferencedStorageIds } from "../storageReferences";

describe("storage reference cleanup", () => {
  it("keeps shared storage ids when another bike still references them", () => {
    const result = getUnreferencedStorageIds({
      candidateStorageIds: ["storage_shared", "storage_unique"],
      referencedPhotoRows: [
        { storageId: "storage_shared", bikeId: "bike_a" as never },
        { storageId: "storage_shared", bikeId: "bike_b" as never },
        { storageId: "storage_unique", bikeId: "bike_a" as never },
      ],
      referencedBikePhotoUrls: [],
      ignoredBikeIds: ["bike_a" as never],
    });

    expect(result).toEqual(["storage_unique"]);
  });

  it("treats legacy bike photoUrl references as in-use", () => {
    const result = getUnreferencedStorageIds({
      candidateStorageIds: ["storage_legacy"],
      referencedPhotoRows: [],
      referencedBikePhotoUrls: [
        { photoUrl: "storage_legacy", bikeId: "bike_b" as never },
      ],
      ignoredBikeIds: ["bike_a" as never],
    });

    expect(result).toEqual([]);
  });

  it("keeps another user's avatar even if a bike owner attaches and removes its storage id", () => {
    const result = getUnreferencedStorageIds({
      candidateStorageIds: ["victim_avatar"],
      referencedPhotoRows: [],
      referencedBikePhotoUrls: [],
      referencedProfileImages: ["victim_avatar"],
      ignoredBikeIds: ["attacker_bike" as never],
    });
    expect(result).toEqual([]);
  });

});
