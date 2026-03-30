import { describe, expect, it } from "vitest";
import {
  buildBikeImportPreview,
  deriveBikeImportDraft,
  normalizeMarktplaatsImportUrl,
  resolveBikeImportStatus,
  type ParsedMarktplaatsAdvert,
} from "../shared";

const parsedAdvertFixture: ParsedMarktplaatsAdvert = {
  parserVersion: "marktplaats.v1",
  fetchedAt: 1_743_000_000_000,
  sourceUrl: "https://www.marktplaats.nl/v/fietsen-en-brommers/fietsen-racefietsen/m1234567890-canyon-speedmax",
  canonicalUrl:
    "https://www.marktplaats.nl/v/fietsen-en-brommers/fietsen-racefietsen/m1234567890-canyon-speedmax",
  advertTitle: "Canyon Speedmax TT maat M",
  description: "Nette tijdritfiets met carbon cockpit en twee setjes wielen.",
  imageCandidates: [
    {
      url: "https://images.example.com/1.jpg",
      normalizedUrl: "https://images.example.com/1.jpg",
      sortOrder: 0,
      selectedByDefault: true,
    },
    {
      url: "https://images.example.com/2.jpg",
      normalizedUrl: "https://images.example.com/2.jpg",
      sortOrder: 1,
      selectedByDefault: false,
    },
  ],
  candidateBrand: {
    value: "Canyon",
    confidence: "high",
  },
  candidateModel: {
    value: "Speedmax",
    confidence: "high",
  },
  candidateBikeType: {
    value: "tt_triathlon",
    confidence: "high",
  },
};

describe("bike import shared contract", () => {
  it("normalizes Marktplaats URLs and rejects unsupported hosts", () => {
    expect(
      normalizeMarktplaatsImportUrl(
        "http://www.marktplaats.nl/v/fietsen/m123?foo=bar#fragment"
      )
    ).toBe("https://www.marktplaats.nl/v/fietsen/m123?foo=bar");

    expect(
      normalizeMarktplaatsImportUrl(
        "https://images.marktplaats.com/api/v1/listing?id=123#fragment"
      )
    ).toBe("https://images.marktplaats.com/api/v1/listing?id=123");

    expect(() =>
      normalizeMarktplaatsImportUrl("https://example.com/not-marktplaats")
    ).toThrow("Only Marktplaats URLs are supported");
  });

  it("derives a saveable draft from a high-confidence advert", () => {
    const draft = deriveBikeImportDraft(parsedAdvertFixture);

    expect(draft).toEqual({
      name: "Canyon Speedmax TT maat M",
      brand: "Canyon",
      model: "Speedmax",
      bikeType: "tt_triathlon",
      description: "Nette tijdritfiets met carbon cockpit en twee setjes wielen.",
      selectedImageUrls: ["https://images.example.com/1.jpg"],
      primaryImageUrl: "https://images.example.com/1.jpg",
    });
    expect(resolveBikeImportStatus(parsedAdvertFixture, draft)).toBe("parsed");
  });

  it("keeps low-confidence fields editable and marks the import for review", () => {
    const draft = deriveBikeImportDraft({
      ...parsedAdvertFixture,
      candidateBrand: { value: "Canyon", confidence: "medium" },
      candidateModel: { value: "Speedmax", confidence: "low" },
      candidateBikeType: { value: "tt_triathlon", confidence: "medium" },
    });

    expect(draft.brand).toBeUndefined();
    expect(draft.model).toBeUndefined();
    expect(draft.bikeType).toBeUndefined();
    expect(resolveBikeImportStatus(parsedAdvertFixture, draft)).toBe("needs_review");
  });

  it("builds a sparse preview without undefined rendering values", () => {
    const preview = buildBikeImportPreview({
      _id: "import_1" as never,
      sourceName: "marktplaats",
      sourceUrl: "https://www.marktplaats.nl/v/fietsen/m123",
      canonicalUrl: undefined,
      advertTitle: undefined,
      status: "failed",
      parsedAdvert: undefined,
      draftBike: undefined,
      createdBikeId: undefined,
      failureReason: "Fetch failed",
    });

    expect(preview).toEqual({
      importId: "import_1",
      sourceName: "marktplaats",
      sourceUrl: "https://www.marktplaats.nl/v/fietsen/m123",
      canonicalUrl: null,
      advertTitle: null,
      status: "failed",
      parsedAdvert: null,
      draftBike: null,
      reviewFlags: {
        name: true,
        brand: false,
        model: false,
        bikeType: true,
        description: false,
        images: true,
      },
      createdBikeId: null,
      failureReason: "Fetch failed",
    });
  });
});
