import { describe, expect, it } from "vitest";
import {
  buildPublicFitPreviewInternal,
  derivePublicFitSnapshot,
  isPublicFitPreviewActive,
} from "../publicFit";

describe("publicFit contract", () => {
  it("prefers linked geometry data when available", () => {
    const snapshot = derivePublicFitSnapshot({
      bike: {
        bikeType: "road",
        currentGeometry: {
          frameSize: "54",
          stackMm: 560,
          reachMm: 386,
        },
      },
      geometryRecord: {
        sizeLabel: "56",
        stack: 572,
        reach: 390,
      },
      now: 123,
    });

    expect(snapshot).toEqual({
      bikeType: "road",
      sizeLabel: "56",
      stackMm: 572,
      reachMm: 390,
      geometryQuality: "full",
      source: "geometry_record",
      snapshotUpdatedAt: 123,
    });
  });

  it("falls back to manual geometry when no linked record exists", () => {
    const snapshot = derivePublicFitSnapshot({
      bike: {
        bikeType: "gravel",
        currentGeometry: {
          frameSize: "M",
        },
      },
      geometryRecord: null,
      now: 456,
    });

    expect(snapshot).toEqual({
      bikeType: "gravel",
      sizeLabel: "M",
      stackMm: undefined,
      reachMm: undefined,
      geometryQuality: "partial",
      source: "manual_geometry",
      snapshotUpdatedAt: 456,
    });
  });

  it("keeps preview payload free of owner-facing identifiers", () => {
    const preview = buildPublicFitPreviewInternal({
      bike: {
        _id: "bike_1" as never,
        brand: "Canyon",
        model: "Endurace",
      },
      snapshot: {
        bikeType: "road",
        sizeLabel: "M",
        stackMm: 560,
        reachMm: 390,
        geometryQuality: "full",
        source: "geometry_record",
        snapshotUpdatedAt: 789,
      },
      primaryPhotoSource: "storage_1",
      thumbnailSources: ["storage_2"],
    });

    expect(preview).toEqual({
      bikeId: "bike_1",
      tokenVersion: 789,
      accessMode: "public_fit_code",
      preview: {
        brand: "Canyon",
        model: "Endurace",
        bikeType: "road",
        sizeLabel: "M",
        geometryQuality: "full",
        primaryPhotoSource: "storage_1",
        thumbnailSources: ["storage_2"],
      },
    });
    expect("userId" in preview.preview).toBe(false);
    expect("bikePassportId" in preview.preview).toBe(false);
  });

  it("only treats bikes with a code and enabled flag as publicly previewable", () => {
    expect(
      isPublicFitPreviewActive({
        publicFitCode: "PFC-AB12-CD34-EF56-1234",
        publicFitEnabled: true,
      })
    ).toBe(true);

    expect(
      isPublicFitPreviewActive({
        publicFitCode: "PFC-AB12-CD34-EF56-1234",
        publicFitEnabled: false,
      })
    ).toBe(false);
  });
});
