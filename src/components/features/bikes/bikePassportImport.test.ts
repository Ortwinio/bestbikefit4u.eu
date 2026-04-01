import { describe, expect, it } from "vitest";
import {
  buildBikePassportDraft,
  getBikePassportTypeLabel,
  isSupportedBikePassportId,
  normalizeBikePassportInput,
  normalizeBikePassportPreview,
  normalizePassportCreatedBikeId,
} from "./bikePassportImport";
import en from "@/i18n/messages/en";

describe("bikePassportImport helpers", () => {
  it("normalizes and validates passport ids", () => {
    expect(normalizeBikePassportInput(" bbf-ab12-cd34 ")).toBe("BBF-AB12-CD34");
    expect(isSupportedBikePassportId("BBF-AB12-CD34")).toBe(true);
    expect(isSupportedBikePassportId("bad id")).toBe(false);
    expect(isSupportedBikePassportId("BBF-TOO-LONG")).toBe(false);
  });

  it("normalizes the backend passport preview payload", () => {
    const preview = normalizeBikePassportPreview(
      {
        status: "available",
        bikePassportId: "BBF-AB12-CD34",
        existingBikeId: "bike_existing",
        copyIncludesPhotos: false,
        bike: {
          name: "Canyon Endurace CF SLX",
          brand: "Canyon",
          model: "Endurace CF SLX",
          bikeType: "road",
          description: "Endurance road setup",
          currentGeometry: {
            frameSize: "M",
            stackMm: 575,
            reachMm: 387,
          },
        },
      },
      "BBF-AB12-CD34"
    );

    expect(preview).toMatchObject({
      bikePassportId: "BBF-AB12-CD34",
      existingBikeId: "bike_existing",
      name: "Canyon Endurace CF SLX",
      brand: "Canyon",
      model: "Endurace CF SLX",
      bikeType: "road",
      photoCount: 0,
      includesPhotos: false,
      frameSize: "M",
      stackMm: 575,
      reachMm: 387,
    });
    expect(buildBikePassportDraft(preview!)).toMatchObject({
      bikePassportId: "BBF-AB12-CD34",
      name: "Canyon Endurace CF SLX",
      bikeType: "road",
    });
  });

  it("still accepts legacy ready status for compatibility", () => {
    const preview = normalizeBikePassportPreview(
      {
        status: "ready",
        bikePassportId: "BBF-AB12-CD34",
        copyIncludesPhotos: false,
        bike: {
          name: "Canyon Endurace CF SLX",
          bikeType: "road",
        },
      },
      "BBF-AB12-CD34"
    );

    expect(preview?.bikePassportId).toBe("BBF-AB12-CD34");
    expect(preview?.name).toBe("Canyon Endurace CF SLX");
  });

  it("normalizes created bike ids and bike type labels", () => {
    expect(normalizePassportCreatedBikeId({ bikeId: "bike-1" })).toBe("bike-1");
    expect(normalizePassportCreatedBikeId({ createdBikeId: "bike-2" })).toBe("bike-2");
    expect(getBikePassportTypeLabel("road", en.dashboard)).toBe("Road Bike");
    expect(getBikePassportTypeLabel("custom_track", en.dashboard)).toBe("custom_track");
  });
});
