import { describe, expect, it } from "vitest";
import { buildBikeDetailPhotos, buildLinkedGeometryDetail } from "../queries";

describe("bikes.getDetail photo composition", () => {
  it("keeps a legacy photo visible when gallery rows do not include it yet", () => {
    const result = buildBikeDetailPhotos({
      bikeId: "bike_1",
      bikePhotoUrl: "storage_legacy",
      bikeUpdatedAt: 100,
      photos: [
        {
          _id: "photo_1",
          storageId: "storage_new",
          isPrimary: true,
          sortOrder: 0,
          createdAt: 90,
          updatedAt: 90,
        },
      ],
    });

    expect(result.detailPhotos.map((photo) => ({
      storageId: photo.storageId,
      isPrimary: photo.isPrimary,
      isLegacy: photo.isLegacy,
    }))).toEqual([
      { storageId: "storage_legacy", isPrimary: true, isLegacy: true },
      { storageId: "storage_new", isPrimary: false, isLegacy: false },
    ]);
    expect(result.activePhotoStorageId).toBe("storage_legacy");
  });

  it("orders gallery photos by primary then sort order without adding a duplicate legacy photo", () => {
    const result = buildBikeDetailPhotos({
      bikeId: "bike_1",
      bikePhotoUrl: "storage_primary",
      bikeUpdatedAt: 100,
      photos: [
        {
          _id: "photo_2",
          storageId: "storage_secondary",
          isPrimary: false,
          sortOrder: 1,
          createdAt: 95,
          updatedAt: 95,
        },
        {
          _id: "photo_1",
          storageId: "storage_primary",
          isPrimary: true,
          sortOrder: 0,
          createdAt: 90,
          updatedAt: 90,
        },
      ],
    });

    expect(result.detailPhotos.map((photo) => photo.storageId)).toEqual([
      "storage_primary",
      "storage_secondary",
    ]);
    expect(result.detailPhotos.every((photo) => !photo.isLegacy)).toBe(true);
    expect(result.activePhotoStorageId).toBe("storage_primary");
  });

  it("builds linked geometry detail with reference fields and year label", () => {
    const result = buildLinkedGeometryDetail({
      record: {
        _id: "record_1",
        sizeLabel: "56",
        stack: 580,
        reach: 395,
        seatTubeAngle: 73.5,
        headTubeAngle: 72.8,
        source: "manufacturer",
        sourceUrl: "https://example.com/geometry",
        status: "active",
        version: 3,
        supersededBy: "record_2",
      },
      brand: { name: "Canyon" },
      model: {
        name: "Endurace CF",
        yearStart: 2023,
        yearEnd: 2024,
      },
    });

    expect(result).toEqual({
      recordId: "record_1",
      brandName: "Canyon",
      modelName: "Endurace CF",
      modelYearLabel: "2023-2024",
      sizeLabel: "56",
      stack: 580,
      reach: 395,
      seatTubeAngle: 73.5,
      headTubeAngle: 72.8,
      source: "manufacturer",
      sourceUrl: "https://example.com/geometry",
      status: "active",
      version: 3,
      supersededByRecordId: "record_2",
    });
  });
});
