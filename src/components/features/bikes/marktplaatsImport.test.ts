import { describe, expect, it } from "vitest";
import {
  buildDraftFromPreview,
  getAdvertFindings,
  getPhotoReview,
  isSupportedMarktplaatsUrl,
  normalizeCreatedBikeId,
  normalizeMarktplaatsPreview,
  togglePhotoSelection,
} from "./marktplaatsImport";

describe("marktplaatsImport helpers", () => {
  it("accepts marktplaats hostnames only", () => {
    expect(isSupportedMarktplaatsUrl("https://www.marktplaats.nl/v/fietsen-en-brommers/m123")).toBe(true);
    expect(isSupportedMarktplaatsUrl("https://example.com/bike")).toBe(false);
    expect(isSupportedMarktplaatsUrl("not-a-url")).toBe(false);
  });

  it("normalizes a flexible preview payload", () => {
    const preview = normalizeMarktplaatsPreview(
      {
        importId: "import-1",
        title: "Canyon Endurace CF",
        description: "Imported advert text",
        candidateBrand: { value: "Canyon", confidence: "high" },
        candidateModel: { value: "Endurace CF", confidence: "medium" },
        candidateBikeType: { value: "road", confidence: "low" },
        derivedSignals: {
          sizeMentions: ["maat M"],
          componentMentions: ["Shimano Ultegra"],
          conditionMentions: ["Good condition"],
          maintenanceMentions: ["Recently serviced"],
          previewWarnings: ["brand_needs_review"],
        },
        photos: [{ imageUrl: "https://img/1.jpg" }],
      },
      "https://www.marktplaats.nl/example"
    );

    expect(preview).toMatchObject({
      advertTitle: "Canyon Endurace CF",
      description: "Imported advert text",
      fields: {
        brand: { value: "Canyon", confidence: "high" },
        model: { value: "Endurace CF", confidence: "medium" },
        bikeType: { value: "road", confidence: "low" },
      },
    });
    expect(preview?.photos).toHaveLength(1);
    expect(preview?.summary.sizeMention).toBe("maat M");
    expect(preview?.warnings).toContain("brand_needs_review");
  });

  it("builds a draft and toggles photo selection", () => {
    const preview = normalizeMarktplaatsPreview(
      {
        importId: "import-2",
        advertTitle: "Bike title",
        description: "Body",
        bikeType: "gravel",
        photos: [
          { url: "https://img/a.jpg", selected: true },
          { url: "https://img/b.jpg", selected: false },
        ],
      },
      "https://www.marktplaats.nl/example"
    );

    if (!preview) {
      throw new Error("Preview should normalize");
    }

    const draft = buildDraftFromPreview(preview);
    expect(draft.selectedImageUrls).toEqual(["https://img/a.jpg"]);
    expect(togglePhotoSelection(draft.selectedImageUrls, "https://img/b.jpg")).toEqual([
      "https://img/a.jpg",
      "https://img/b.jpg",
    ]);
    expect(togglePhotoSelection(draft.selectedImageUrls, "https://img/a.jpg")).toEqual([]);
  });

  it("builds structured findings and photo review state", () => {
    const preview = normalizeMarktplaatsPreview(
      {
        importId: "import-3",
        advertTitle: "Trek Domane SL",
        description: "Full advert body",
        candidateBrand: { value: "Trek", confidence: "high" },
        candidateModel: { value: "Domane SL", confidence: "medium" },
        candidateBikeType: { value: "road", confidence: "medium" },
        derivedSignals: {
          sizeMentions: ["maat 56 cm"],
          componentMentions: ["Shimano Ultegra", "Carbon frame"],
          conditionMentions: ["Good condition"],
          maintenanceMentions: ["Recently serviced"],
          previewWarnings: ["partial_photo_selection"],
        },
        photos: [
          { url: "https://img/a.jpg", selected: true },
          { url: "https://img/b.jpg", selected: false },
        ],
      },
      "https://www.marktplaats.nl/example"
    );

    if (!preview) {
      throw new Error("Preview should normalize");
    }

    const draft = buildDraftFromPreview(preview);

    expect(getAdvertFindings(preview)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "brand", value: "Trek", confidence: "high" }),
        expect.objectContaining({ key: "size", value: "maat 56 cm" }),
        expect.objectContaining({ key: "components", value: "Shimano Ultegra, Carbon frame" }),
      ])
    );
    expect(getPhotoReview(preview, draft)).toMatchObject({
      totalCount: 2,
      selectedCount: 1,
      activePhotoUrl: "https://img/a.jpg",
      hasPhotos: true,
      warnings: ["partial_photo_selection"],
    });
  });

  it("normalizes created bike ids from save responses", () => {
    expect(normalizeCreatedBikeId({ bikeId: "bike-1" })).toBe("bike-1");
    expect(normalizeCreatedBikeId({ createdBikeId: "bike-2" })).toBe("bike-2");
    expect(normalizeCreatedBikeId({})).toBeNull();
  });
});
