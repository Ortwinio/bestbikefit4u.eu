import type { BikeType } from "@/lib/bikes";

export type ImportConfidence = "high" | "medium" | "low" | "unknown";

export type MarktplaatsPhotoCandidate = {
  url: string;
  alt?: string;
  sortOrder?: number;
  selected: boolean;
};

export type MarktplaatsAdvertFindingKey =
  | "name"
  | "brand"
  | "model"
  | "bikeType"
  | "size"
  | "components"
  | "condition"
  | "maintenance";

export type MarktplaatsAdvertFinding = {
  key: MarktplaatsAdvertFindingKey;
  value: string;
  confidence: ImportConfidence;
  note?: string;
};

export type MarktplaatsPhotoReview = {
  totalCount: number;
  selectedCount: number;
  activePhotoUrl?: string;
  hasPhotos: boolean;
  warnings: string[];
};

export type MarktplaatsPreviewField<T extends string = string> = {
  value: T;
  confidence: ImportConfidence;
  note?: string | null;
};

export type MarktplaatsDraft = {
  importId: string;
  name: string;
  brand: string;
  model: string;
  bikeType: BikeType;
  description: string;
  selectedImageUrls: string[];
  primaryImageUrl?: string;
};

export type MarktplaatsImportPreview = {
  importId: string;
  sourceUrl: string;
  canonicalUrl?: string | null;
  advertTitle: string;
  description: string;
  photos: MarktplaatsPhotoCandidate[];
  summary: {
    sizeMention?: string;
    componentMentions: string[];
    conditionMentions: string[];
    maintenanceMentions: string[];
  };
  fields: {
    name: MarktplaatsPreviewField;
    brand: MarktplaatsPreviewField;
    model: MarktplaatsPreviewField;
    bikeType: MarktplaatsPreviewField<BikeType>;
  };
  warnings: string[];
};

function resolveConfidence(value: unknown): ImportConfidence {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "unknown";
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    : [];
}

function resolveBikeType(value: unknown): BikeType {
  const supported: BikeType[] = [
    "road",
    "gravel",
    "mountain",
    "hybrid",
    "tt_triathlon",
    "cyclocross",
    "touring",
    "city",
  ];
  if (typeof value === "string" && supported.includes(value as BikeType)) {
    return value as BikeType;
  }
  return "road";
}

export function isSupportedMarktplaatsUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return /(^|\.)marktplaats\.nl$/i.test(url.hostname);
  } catch {
    return false;
  }
}

export function normalizeMarktplaatsPreview(
  payload: unknown,
  fallbackUrl: string
): MarktplaatsImportPreview | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const importId = asNonEmptyString(record.importId);
  if (!importId) {
    return null;
  }
  const advertTitle =
    asNonEmptyString(record.advertTitle) ??
    asNonEmptyString(record.title) ??
    "Imported bike";
  const description = asNonEmptyString(record.description) ?? "";
  const rawPhotos = Array.isArray(record.photos)
    ? record.photos
    : Array.isArray(record.imageUrls)
      ? record.imageUrls.map((url, index) => ({ url, sortOrder: index, selectedByDefault: true }))
      : [];
  const photos = rawPhotos
    .map((photo, index) => {
      if (typeof photo === "string") {
        return {
          url: photo,
          alt: advertTitle,
          sortOrder: index,
          selected: true,
        } satisfies MarktplaatsPhotoCandidate;
      }
      if (!photo || typeof photo !== "object") {
        return null;
      }
      const raw = photo as Record<string, unknown>;
      const url = asNonEmptyString(raw.url) ?? asNonEmptyString(raw.imageUrl);
      if (!url) {
        return null;
      }
      return {
        url,
        alt: asNonEmptyString(raw.alt) ?? advertTitle,
        sortOrder:
          typeof raw.sortOrder === "number" && Number.isFinite(raw.sortOrder)
            ? raw.sortOrder
            : index,
        selected: raw.selected !== false && raw.selectedByDefault !== false,
      } satisfies MarktplaatsPhotoCandidate;
    })
    .filter(Boolean) as MarktplaatsPhotoCandidate[];

  const brandValue =
    asNonEmptyString(record.brand) ??
    asNonEmptyString((record.candidateBrand as Record<string, unknown> | undefined)?.value) ??
    "";
  const modelValue =
    asNonEmptyString(record.model) ??
    asNonEmptyString((record.candidateModel as Record<string, unknown> | undefined)?.value) ??
    "";
  const nameValue =
    asNonEmptyString(record.name) ??
    asNonEmptyString((record.candidateName as Record<string, unknown> | undefined)?.value) ??
    advertTitle;
  const bikeTypeValue = resolveBikeType(
    record.bikeType ??
      (record.candidateBikeType as Record<string, unknown> | undefined)?.value
  );
  const derivedSignals =
    record.derivedSignals && typeof record.derivedSignals === "object"
      ? (record.derivedSignals as Record<string, unknown>)
      : null;
  const warnings = Array.isArray(record.warnings)
    ? record.warnings.filter((warning): warning is string => typeof warning === "string")
    : [];
  const needsReview =
    record.needsReview && typeof record.needsReview === "object"
      ? (record.needsReview as Record<string, unknown>)
      : null;

  if (needsReview?.brand === true) {
    warnings.push("brand_needs_review");
  }
  if (needsReview?.model === true) {
    warnings.push("model_needs_review");
  }
  if (needsReview?.bikeType === true) {
    warnings.push("bike_type_needs_review");
  }
  if (typeof record.alreadyImportedBikeId === "string" && record.alreadyImportedBikeId.trim()) {
    warnings.push("already_imported");
  }
  warnings.push(...asStringArray(derivedSignals?.previewWarnings));

  return {
    importId,
    sourceUrl: asNonEmptyString(record.sourceUrl) ?? fallbackUrl,
    canonicalUrl: asNonEmptyString(record.canonicalUrl),
    advertTitle,
    description,
    photos,
    summary: {
      sizeMention:
        asNonEmptyString(derivedSignals?.sizeMention) ??
        asStringArray(derivedSignals?.sizeMentions)[0],
      componentMentions: asStringArray(derivedSignals?.componentMentions),
      conditionMentions: asStringArray(derivedSignals?.conditionMentions),
      maintenanceMentions: asStringArray(derivedSignals?.maintenanceMentions),
    },
    fields: {
      name: {
        value: nameValue,
        confidence: resolveConfidence(
          record.nameConfidence ??
            (record.candidateName as Record<string, unknown> | undefined)?.confidence
        ),
      },
      brand: {
        value: brandValue,
        confidence: resolveConfidence(
          record.brandConfidence ??
            (record.candidateBrand as Record<string, unknown> | undefined)?.confidence
        ),
      },
      model: {
        value: modelValue,
        confidence: resolveConfidence(
          record.modelConfidence ??
            (record.candidateModel as Record<string, unknown> | undefined)?.confidence
        ),
      },
      bikeType: {
        value: bikeTypeValue,
        confidence: resolveConfidence(
          record.bikeTypeConfidence ??
            (record.candidateBikeType as Record<string, unknown> | undefined)?.confidence
        ),
      },
    },
    warnings: [...new Set(warnings)],
  };
}

export function buildDraftFromPreview(
  preview: MarktplaatsImportPreview
): MarktplaatsDraft {
  const selectedImageUrls = preview.photos
    .filter((photo) => photo.selected)
    .map((photo) => photo.url);

  return {
    importId: preview.importId,
    name: preview.fields.name.value || preview.advertTitle,
    brand: preview.fields.brand.value,
    model: preview.fields.model.value,
    bikeType: preview.fields.bikeType.value,
    description: preview.description,
    selectedImageUrls,
    primaryImageUrl: selectedImageUrls[0],
  };
}

export function togglePhotoSelection(
  selectedPhotoIds: string[],
  photoId: string
): string[] {
  return selectedPhotoIds.includes(photoId)
    ? selectedPhotoIds.filter((id) => id !== photoId)
    : [...selectedPhotoIds, photoId];
}

export function resolvePrimaryPreviewPhoto(
  preview: MarktplaatsImportPreview,
  selectedImageUrls: string[],
  primaryImageUrl?: string
): string | undefined {
  if (primaryImageUrl && preview.photos.some((photo) => photo.url === primaryImageUrl)) {
    return primaryImageUrl;
  }

  const selectedPhoto = preview.photos.find((photo) => selectedImageUrls.includes(photo.url));
  if (selectedPhoto) {
    return selectedPhoto.url;
  }

  return preview.photos[0]?.url;
}

export function getAdvertFindings(
  preview: MarktplaatsImportPreview
): MarktplaatsAdvertFinding[] {
  const findings: MarktplaatsAdvertFinding[] = [];

  if (preview.fields.name.value.trim()) {
    findings.push({
      key: "name",
      value: preview.fields.name.value.trim(),
      confidence: preview.fields.name.confidence,
      note: preview.fields.name.note ?? undefined,
    });
  }

  if (preview.fields.brand.value.trim()) {
    findings.push({
      key: "brand",
      value: preview.fields.brand.value.trim(),
      confidence: preview.fields.brand.confidence,
      note: preview.fields.brand.note ?? undefined,
    });
  }

  if (preview.fields.model.value.trim()) {
    findings.push({
      key: "model",
      value: preview.fields.model.value.trim(),
      confidence: preview.fields.model.confidence,
      note: preview.fields.model.note ?? undefined,
    });
  }

  if (preview.fields.bikeType.value.trim()) {
    findings.push({
      key: "bikeType",
      value: preview.fields.bikeType.value,
      confidence: preview.fields.bikeType.confidence,
      note: preview.fields.bikeType.note ?? undefined,
    });
  }

  if (preview.summary.sizeMention?.trim()) {
    findings.push({
      key: "size",
      value: preview.summary.sizeMention.trim(),
      confidence: "medium",
      note: undefined,
    });
  }

  if (preview.summary.componentMentions.length > 0) {
    findings.push({
      key: "components",
      value: preview.summary.componentMentions.join(", "),
      confidence: preview.photos.length >= 3 ? "high" : "medium",
      note: undefined,
    });
  }

  if (preview.summary.conditionMentions.length > 0) {
    findings.push({
      key: "condition",
      value: preview.summary.conditionMentions.join(", "),
      confidence: "medium",
      note: undefined,
    });
  }

  if (preview.summary.maintenanceMentions.length > 0) {
    findings.push({
      key: "maintenance",
      value: preview.summary.maintenanceMentions.join(", "),
      confidence: "medium",
      note: undefined,
    });
  }

  return findings;
}

export function getPhotoReview(
  preview: MarktplaatsImportPreview,
  draft: MarktplaatsDraft
): MarktplaatsPhotoReview {
  const totalCount = preview.photos.length;
  const selectedCount = draft.selectedImageUrls.length;
  const warnings: string[] = [];

  if (totalCount === 0) {
    warnings.push("no_images_found");
  } else {
    if (totalCount === 1) {
      warnings.push("one_photo_only");
    }
    if (selectedCount === 0) {
      warnings.push("no_photos_selected");
    } else if (selectedCount < totalCount) {
      warnings.push("partial_photo_selection");
    }
  }

  return {
    totalCount,
    selectedCount,
    activePhotoUrl:
      draft.primaryImageUrl && preview.photos.some((photo) => photo.url === draft.primaryImageUrl)
        ? draft.primaryImageUrl
        : preview.photos[0]?.url,
    hasPhotos: totalCount > 0,
    warnings,
  };
}

export function normalizeCreatedBikeId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const record = payload as Record<string, unknown>;
  return (
    asNonEmptyString(record.bikeId) ??
    asNonEmptyString(record.createdBikeId) ??
    null
  );
}
