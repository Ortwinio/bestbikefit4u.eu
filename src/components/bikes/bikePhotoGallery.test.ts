import { describe, expect, it } from "vitest";
import {
  buildBikePhotoThumbnailLabel,
  formatBikePhotoCount,
  getBikePhotoAltText,
} from "./bikePhotoGalleryHelpers";

describe("bikePhotoGallery helpers", () => {
  it("formats the gallery count for one and many photos", () => {
    expect(
      formatBikePhotoCount({
        count: 1,
        oneLabel: "1 photo",
        manyLabel: "{count} photos",
      })
    ).toBe("1 photo");

    expect(
      formatBikePhotoCount({
        count: 4,
        oneLabel: "1 photo",
        manyLabel: "{count} photos",
      })
    ).toBe("4 photos");
  });

  it("builds descriptive alt text and button labels", () => {
    expect(
      getBikePhotoAltText({
        bikeName: "Canyon Endurace",
        index: 2,
        total: 5,
      })
    ).toBe("Canyon Endurace photo 2 of 5");

    expect(
      buildBikePhotoThumbnailLabel({
        bikeName: "Canyon Endurace",
        index: 2,
        total: 5,
        isPrimary: true,
        isSelected: true,
        primaryLabel: "Primary",
      })
    ).toBe("Canyon Endurace photo 2 of 5, Primary, selected");
  });
});
