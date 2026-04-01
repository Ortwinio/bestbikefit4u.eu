import { getBikeTypeLabel, type BikeType } from "@/lib/bikes";
import type { DashboardMessages } from "@/i18n/dashboardMessages";

export type BikePassportImportPreview = {
  bikePassportId: string;
  existingBikeId?: string | null;
  name: string;
  brand: string;
  model: string;
  bikeType: BikeType;
  description: string;
  photoCount: number;
  includesPhotos: boolean;
  frameSize?: string;
  stackMm?: number;
  reachMm?: number;
};

export type BikePassportDraft = {
  bikePassportId: string;
  name: string;
  brand: string;
  model: string;
  bikeType: BikeType;
  description: string;
};

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
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

  return typeof value === "string" && supported.includes(value as BikeType)
    ? (value as BikeType)
    : "road";
}

export function normalizeBikePassportInput(raw: string) {
  return raw.trim().toUpperCase();
}

export function isSupportedBikePassportId(raw: string) {
  return /^BBF-[A-F0-9]{4}-[A-F0-9]{4}$/u.test(normalizeBikePassportInput(raw));
}

export function normalizeBikePassportPreview(
  payload: unknown,
  requestedPassportId: string
): BikePassportImportPreview | null {
  const record = asObject(payload);
  if (!record) {
    return null;
  }

  const status = asNonEmptyString(record.status);
  if (status !== "available" && status !== "ready") {
    return null;
  }

  const source = asObject(record.bike);
  if (!source) {
    return null;
  }

  const geometry = asObject(source.currentGeometry);
  const bikePassportId =
    asNonEmptyString(record.bikePassportId) ?? normalizeBikePassportInput(requestedPassportId);
  const name = asNonEmptyString(source.name);
  if (!name) {
    return null;
  }

  return {
    bikePassportId,
    existingBikeId: asNonEmptyString(record.existingBikeId),
    name,
    brand: asNonEmptyString(source.brand) ?? "",
    model: asNonEmptyString(source.model) ?? "",
    bikeType: resolveBikeType(source.bikeType),
    description: asNonEmptyString(source.description) ?? "",
    photoCount: 0,
    includesPhotos: record.copyIncludesPhotos === true,
    frameSize: asNonEmptyString(geometry?.frameSize) ?? undefined,
    stackMm: asFiniteNumber(geometry?.stackMm),
    reachMm: asFiniteNumber(geometry?.reachMm),
  };
}

export function buildBikePassportDraft(preview: BikePassportImportPreview): BikePassportDraft {
  return {
    bikePassportId: preview.bikePassportId,
    name: preview.name,
    brand: preview.brand,
    model: preview.model,
    bikeType: preview.bikeType,
    description: preview.description,
  };
}

export function normalizePassportCreatedBikeId(payload: unknown) {
  const record = asObject(payload);
  if (!record) {
    return null;
  }

  return (
    asNonEmptyString(record.bikeId) ??
    asNonEmptyString(record.createdBikeId) ??
    asNonEmptyString(record.newBikeId) ??
    asNonEmptyString(asObject(record.bike)?._id)
  );
}

export function getBikePassportTypeLabel(
  bikeType: string | undefined,
  messages: DashboardMessages
) {
  if (!bikeType) {
    return "-";
  }

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

  return supported.includes(bikeType as BikeType)
    ? getBikeTypeLabel(bikeType as BikeType, messages)
    : bikeType;
}
