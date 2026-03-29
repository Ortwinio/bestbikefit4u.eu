import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  MarktplaatsAdvertFindingsPreview,
  MarktplaatsPhotoVerificationPreview,
} from "./MarktplaatsBikeImportFlow";
import {
  buildDraftFromPreview,
  getAdvertFindings,
  getPhotoReview,
  normalizeMarktplaatsPreview,
} from "./marktplaatsImport";

const t = {
  findingsTitle: "What we found in this advert",
  findingsDescription: "Review the structured findings.",
  findingsCount: "{count} findings",
  findingDescriptionSummary: "Imported description available ({characters} characters).",
  findingPhotoSummary: "{count} advert photos found.",
  findingLabels: {
    name: "Bike name",
    brand: "Brand",
    model: "Model",
    bikeType: "Bike type",
    size: "Size mention",
    components: "Components",
    condition: "Condition",
    maintenance: "Maintenance",
  },
  confidenceBadge: "{level} confidence",
  photoVerificationTitle: "Photo verification",
  photoCountSummary: "{selected} of {total} selected",
  primaryPhotoTitle: "Primary preview image",
  primaryPhotoDescription: "Use the thumbnail strip to inspect the advert photos.",
  photoActiveBadge: "Active preview",
  photoPreviewBadge: "View photo",
  photosEmptyTitle: "No importable photos found",
  photosEmptyDescription: "You can still save without photos.",
  photoFallbackLabel: "Advert photo",
  photoSelected: "Selected for import",
  photoDeselected: "Not selected",
  photoBadgeSelected: "Selected",
  photoBadgeOptional: "Optional",
} as const;

describe("MarktplaatsBikeImportFlow preview sections", () => {
  it("renders findings and photo verification after previewing an advert", () => {
    const preview = normalizeMarktplaatsPreview(
      {
        importId: "import-1",
        advertTitle: "Canyon Endurace CF 7",
        description: "Full imported advert text for review.",
        candidateBrand: { value: "Canyon", confidence: "high" },
        candidateModel: { value: "Endurace CF 7", confidence: "medium" },
        candidateBikeType: { value: "road", confidence: "medium" },
        derivedSignals: {
          sizeMentions: ["maat M"],
          componentMentions: ["Shimano Ultegra"],
          conditionMentions: ["Good condition"],
          maintenanceMentions: ["Recently serviced"],
          previewWarnings: ["partial_photo_selection"],
        },
        photos: [
          { url: "https://img/1.jpg", selected: true },
          { url: "https://img/2.jpg", selected: false },
        ],
      },
      "https://www.marktplaats.nl/example"
    );

    if (!preview) {
      throw new Error("Preview should normalize");
    }

    const draft = buildDraftFromPreview(preview);
    const photoReview = getPhotoReview(preview, draft);
    const html = renderToStaticMarkup(
      <>
        <MarktplaatsAdvertFindingsPreview t={t as never} findings={getAdvertFindings(preview)} />
        <MarktplaatsPhotoVerificationPreview
          t={t as never}
          preview={preview}
          draft={draft}
          photoReview={photoReview}
          translatedPhotoWarnings={photoReview.warnings}
          setDraft={() => undefined}
        />
      </>
    );

    expect(html).toContain("What we found in this advert");
    expect(html).toContain("8 findings");
    expect(html).toContain("Photo verification");
    expect(html).toContain("Primary preview image");
    expect(html).toContain("1 of 2 selected");
    expect(html).toContain("Active preview");
  });

  it("shows an explicit empty photo state when no photos are available", () => {
    const preview = normalizeMarktplaatsPreview(
      {
        importId: "import-2",
        advertTitle: "No photo bike",
        description: "Imported body",
        candidateBikeType: { value: "road", confidence: "low" },
        derivedSignals: {
          sizeMentions: [],
          componentMentions: [],
          conditionMentions: [],
          maintenanceMentions: [],
          previewWarnings: ["no_images_found"],
        },
        photos: [],
      },
      "https://www.marktplaats.nl/example"
    );

    if (!preview) {
      throw new Error("Preview should normalize");
    }

    const draft = buildDraftFromPreview(preview);
    const photoReview = getPhotoReview(preview, draft);
    const html = renderToStaticMarkup(
      <MarktplaatsPhotoVerificationPreview
        t={t as never}
        preview={preview}
        draft={draft}
        photoReview={photoReview}
        translatedPhotoWarnings={photoReview.warnings}
        setDraft={() => undefined}
      />
    );

    expect(html).toContain("No importable photos found");
    expect(html).toContain("You can still save without photos.");
  });
});
