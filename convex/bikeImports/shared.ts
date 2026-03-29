import type { Doc, Id } from "../_generated/dataModel";
import { v } from "convex/values";

export const bikeImportSourceNameValidator = v.literal("marktplaats");

export const bikeImportStatusValidator = v.union(
  v.literal("pending_fetch"),
  v.literal("parsed"),
  v.literal("needs_review"),
  v.literal("importing"),
  v.literal("imported"),
  v.literal("failed")
);

export const bikeImportConfidenceValidator = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
  v.literal("none")
);

export const bikeImportBikeTypeValidator = v.union(
  v.literal("road"),
  v.literal("gravel"),
  v.literal("mountain"),
  v.literal("hybrid"),
  v.literal("tt_triathlon"),
  v.literal("cyclocross"),
  v.literal("touring"),
  v.literal("city")
);

export const bikeImportStringCandidateValidator = v.object({
  value: v.optional(v.string()),
  confidence: bikeImportConfidenceValidator,
});

export const bikeImportBikeTypeCandidateValidator = v.object({
  value: v.optional(bikeImportBikeTypeValidator),
  confidence: bikeImportConfidenceValidator,
});

export const bikeImportImageCandidateValidator = v.object({
  url: v.string(),
  normalizedUrl: v.string(),
  sortOrder: v.number(),
  selectedByDefault: v.boolean(),
  caption: v.optional(v.string()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
});

export const parsedMarktplaatsAdvertValidator = v.object({
  parserVersion: v.string(),
  fetchedAt: v.number(),
  sourceUrl: v.string(),
  canonicalUrl: v.optional(v.string()),
  advertTitle: v.optional(v.string()),
  description: v.optional(v.string()),
  imageCandidates: v.array(bikeImportImageCandidateValidator),
  candidateBrand: bikeImportStringCandidateValidator,
  candidateModel: bikeImportStringCandidateValidator,
  candidateBikeType: bikeImportBikeTypeCandidateValidator,
});

export const bikeImportDraftValidator = v.object({
  name: v.string(),
  brand: v.optional(v.string()),
  model: v.optional(v.string()),
  bikeType: v.optional(bikeImportBikeTypeValidator),
  description: v.optional(v.string()),
  selectedImageUrls: v.array(v.string()),
  primaryImageUrl: v.optional(v.string()),
});

export const bikeImportSaveRequestValidator = v.object({
  importId: v.id("bikeImports"),
  name: v.string(),
  bikeType: bikeImportBikeTypeValidator,
  brand: v.optional(v.string()),
  model: v.optional(v.string()),
  description: v.optional(v.string()),
  selectedImageUrls: v.array(v.string()),
  primaryImageUrl: v.optional(v.string()),
});

export type BikeImportConfidence = "high" | "medium" | "low" | "none";
export type BikeImportStatus =
  | "pending_fetch"
  | "parsed"
  | "needs_review"
  | "importing"
  | "imported"
  | "failed";
export type BikeImportBikeType =
  | "road"
  | "gravel"
  | "mountain"
  | "hybrid"
  | "tt_triathlon"
  | "cyclocross"
  | "touring"
  | "city";

export type BikeImportStringCandidate = {
  value?: string;
  confidence: BikeImportConfidence;
};

export type BikeImportBikeTypeCandidate = {
  value?: BikeImportBikeType;
  confidence: BikeImportConfidence;
};

export type BikeImportImageCandidate = {
  url: string;
  normalizedUrl: string;
  sortOrder: number;
  selectedByDefault: boolean;
  caption?: string;
  width?: number;
  height?: number;
};

export type ParsedMarktplaatsAdvert = {
  parserVersion: string;
  fetchedAt: number;
  sourceUrl: string;
  canonicalUrl?: string;
  advertTitle?: string;
  description?: string;
  imageCandidates: BikeImportImageCandidate[];
  candidateBrand: BikeImportStringCandidate;
  candidateModel: BikeImportStringCandidate;
  candidateBikeType: BikeImportBikeTypeCandidate;
};

export type BikeImportDraft = {
  name: string;
  brand?: string;
  model?: string;
  bikeType?: BikeImportBikeType;
  description?: string;
  selectedImageUrls: string[];
  primaryImageUrl?: string;
};

export type BikeImportSaveRequest = {
  importId: Id<"bikeImports">;
  name: string;
  bikeType: BikeImportBikeType;
  brand?: string;
  model?: string;
  description?: string;
  selectedImageUrls: string[];
  primaryImageUrl?: string;
};

export type BikeImportPreview = {
  importId: Id<"bikeImports">;
  sourceName: "marktplaats";
  sourceUrl: string;
  canonicalUrl: string | null;
  advertTitle: string | null;
  status: BikeImportStatus;
  parsedAdvert: {
    advertTitle: string | null;
    description: string | null;
    imageCandidates: BikeImportImageCandidate[];
    candidateBrand: { value: string | null; confidence: BikeImportConfidence };
    candidateModel: { value: string | null; confidence: BikeImportConfidence };
    candidateBikeType: { value: BikeImportBikeType | null; confidence: BikeImportConfidence };
  } | null;
  draftBike: {
    name: string | null;
    brand: string | null;
    model: string | null;
    bikeType: BikeImportBikeType | null;
    description: string | null;
    selectedImageUrls: string[];
    primaryImageUrl: string | null;
  } | null;
  reviewFlags: {
    name: boolean;
    brand: boolean;
    model: boolean;
    bikeType: boolean;
    description: boolean;
    images: boolean;
  };
  createdBikeId: Id<"bikes"> | null;
  failureReason: string | null;
};

function normalizeUrlString(value: string): string {
  return value.trim().replace(/\/+$/, "").toLowerCase();
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeMarktplaatsImportUrl(input: string): string {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    throw new Error("Invalid Marktplaats URL");
  }

  const hostname = parsed.hostname.toLowerCase();
  const isMarktplaatsHost =
    hostname === "marktplaats.nl" || hostname === "www.marktplaats.nl";
  if (!isMarktplaatsHost) {
    throw new Error("Only Marktplaats URLs are supported");
  }

  const normalizedPath = parsed.pathname || "/";
  const normalizedSearch = parsed.search || "";
  const normalizedUrl = `https://${hostname}${normalizedPath}${normalizedSearch}`;
  return normalizeUrlString(normalizedUrl);
}

export function deriveBikeImportDraft(
  parsed: ParsedMarktplaatsAdvert
): BikeImportDraft {
  const selectedImages = parsed.imageCandidates
    .filter((candidate) => candidate.selectedByDefault)
    .map((candidate) => candidate.url);
  const fallbackSelectedImages =
    selectedImages.length > 0
      ? selectedImages
      : parsed.imageCandidates.slice(0, 8).map((candidate) => candidate.url);

  return {
    name: normalizeOptionalText(parsed.advertTitle) ?? "Imported bike draft",
    brand:
      parsed.candidateBrand.confidence === "high"
        ? normalizeOptionalText(parsed.candidateBrand.value)
        : undefined,
    model:
      parsed.candidateModel.confidence === "high"
        ? normalizeOptionalText(parsed.candidateModel.value)
        : undefined,
    bikeType:
      parsed.candidateBikeType.confidence === "high"
        ? parsed.candidateBikeType.value
        : undefined,
    description: normalizeOptionalText(parsed.description),
    selectedImageUrls: fallbackSelectedImages,
    primaryImageUrl: fallbackSelectedImages[0],
  };
}

export function resolveBikeImportStatus(
  parsed: ParsedMarktplaatsAdvert,
  draft: BikeImportDraft
): BikeImportStatus {
  const needsNameReview = draft.name.trim().length === 0;
  const needsBikeTypeReview =
    !draft.bikeType || parsed.candidateBikeType.confidence !== "high";
  const needsBrandReview =
    Boolean(parsed.candidateBrand.value) &&
    parsed.candidateBrand.confidence !== "high";
  const needsModelReview =
    Boolean(parsed.candidateModel.value) &&
    parsed.candidateModel.confidence !== "high";

  return needsNameReview ||
    needsBikeTypeReview ||
    needsBrandReview ||
    needsModelReview
    ? "needs_review"
    : "parsed";
}

export function buildBikeImportPreview(
  row: Pick<
    Doc<"bikeImports">,
    | "_id"
    | "sourceName"
    | "sourceUrl"
    | "canonicalUrl"
    | "advertTitle"
    | "status"
    | "parsedAdvert"
    | "draftBike"
    | "createdBikeId"
    | "failureReason"
  >
): BikeImportPreview {
  const parsedAdvert = row.parsedAdvert
    ? {
        advertTitle: normalizeOptionalText(row.parsedAdvert.advertTitle) ?? null,
        description: normalizeOptionalText(row.parsedAdvert.description) ?? null,
        imageCandidates: row.parsedAdvert.imageCandidates,
        candidateBrand: {
          value: normalizeOptionalText(row.parsedAdvert.candidateBrand.value) ?? null,
          confidence: row.parsedAdvert.candidateBrand.confidence,
        },
        candidateModel: {
          value: normalizeOptionalText(row.parsedAdvert.candidateModel.value) ?? null,
          confidence: row.parsedAdvert.candidateModel.confidence,
        },
        candidateBikeType: {
          value: row.parsedAdvert.candidateBikeType.value ?? null,
          confidence: row.parsedAdvert.candidateBikeType.confidence,
        },
      }
    : null;

  const draftBike = row.draftBike
    ? {
        name: normalizeOptionalText(row.draftBike.name) ?? null,
        brand: normalizeOptionalText(row.draftBike.brand) ?? null,
        model: normalizeOptionalText(row.draftBike.model) ?? null,
        bikeType: row.draftBike.bikeType ?? null,
        description: normalizeOptionalText(row.draftBike.description) ?? null,
        selectedImageUrls: row.draftBike.selectedImageUrls,
        primaryImageUrl: row.draftBike.primaryImageUrl ?? null,
      }
    : null;

  return {
    importId: row._id,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    canonicalUrl: row.canonicalUrl ?? null,
    advertTitle: normalizeOptionalText(row.advertTitle) ?? null,
    status: row.status,
    parsedAdvert,
    draftBike,
    reviewFlags: {
      name: !draftBike?.name,
      brand:
        parsedAdvert !== null &&
        parsedAdvert.candidateBrand.value !== null &&
        parsedAdvert.candidateBrand.confidence !== "high",
      model:
        parsedAdvert !== null &&
        parsedAdvert.candidateModel.value !== null &&
        parsedAdvert.candidateModel.confidence !== "high",
      bikeType:
        draftBike === null ||
        draftBike.bikeType === null ||
        (parsedAdvert !== null &&
          parsedAdvert.candidateBikeType.value !== null &&
          parsedAdvert.candidateBikeType.confidence !== "high"),
      description: false,
      images: (draftBike?.selectedImageUrls.length ?? 0) === 0,
    },
    createdBikeId: row.createdBikeId ?? null,
    failureReason: normalizeOptionalText(row.failureReason) ?? null,
  };
}

export function buildCanonicalUrlCandidates(
  sourceUrlNormalized: string,
  canonicalUrl: string | undefined
): { sourceUrlNormalized: string; canonicalUrlNormalized?: string } {
  return {
    sourceUrlNormalized,
    canonicalUrlNormalized: canonicalUrl
      ? normalizeUrlString(canonicalUrl)
      : undefined,
  };
}
