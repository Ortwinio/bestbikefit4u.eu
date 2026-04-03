import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type DbCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

const PUBLIC_FIT_CODE_PATTERN = /^PFC-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/u;

export type PublicFitSnapshot = {
  bikeType: Doc<"bikes">["bikeType"];
  sizeLabel?: string;
  stackMm?: number;
  reachMm?: number;
  geometryQuality: "full" | "partial" | "none";
  source: "geometry_record" | "manual_geometry" | "none";
  snapshotUpdatedAt: number;
};

type PublicFitPhotoRow = Pick<
  Doc<"bikePhotos">,
  "storageId" | "isPrimary" | "sortOrder" | "createdAt"
>;

type PublicFitSourceValue = string | null;

function normalizeMaybeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeMaybeString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function isDirectUrl(value: string | undefined | null): value is string {
  return Boolean(
    value && (value.startsWith("http://") || value.startsWith("https://"))
  );
}

function isStorageIdLike(value: string | undefined | null): value is string {
  return Boolean(value && !isDirectUrl(value));
}

function buildPublicFitCandidate() {
  const segment = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
  return `PFC-${segment.slice(0, 4)}-${segment.slice(4, 8)}-${segment.slice(8, 12)}-${segment.slice(12, 16)}`;
}

export function normalizePublicFitCode(value: string) {
  return value.trim().toUpperCase();
}

export function isValidPublicFitCode(value: string) {
  return PUBLIC_FIT_CODE_PATTERN.test(normalizePublicFitCode(value));
}

export async function generateUniquePublicFitCode(ctx: DbCtx): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const publicFitCode = buildPublicFitCandidate();
    const existing = await ctx.db
      .query("bikes")
      .withIndex("by_public_fit_code", (q) => q.eq("publicFitCode", publicFitCode))
      .unique();
    if (!existing) {
      return publicFitCode;
    }
  }

  throw new Error("public_fit_code_generation_failed");
}

export function derivePublicFitSnapshot({
  bike,
  geometryRecord,
  now = Date.now(),
}: {
  bike: Pick<Doc<"bikes">, "bikeType" | "currentGeometry">;
  geometryRecord: Pick<Doc<"geometry_records">, "sizeLabel" | "stack" | "reach"> | null;
  now?: number;
}): PublicFitSnapshot {
  if (geometryRecord) {
    const sizeLabel = normalizeMaybeString(geometryRecord.sizeLabel);
    const stackMm = normalizeMaybeNumber(geometryRecord.stack);
    const reachMm = normalizeMaybeNumber(geometryRecord.reach);
    const geometryQuality =
      stackMm !== undefined && reachMm !== undefined
        ? "full"
        : sizeLabel || stackMm !== undefined || reachMm !== undefined
          ? "partial"
          : "none";

    return {
      bikeType: bike.bikeType,
      sizeLabel,
      stackMm,
      reachMm,
      geometryQuality,
      source: geometryQuality === "none" ? "none" : "geometry_record",
      snapshotUpdatedAt: now,
    };
  }

  const sizeLabel = normalizeMaybeString(bike.currentGeometry?.frameSize);
  const stackMm = normalizeMaybeNumber(bike.currentGeometry?.stackMm);
  const reachMm = normalizeMaybeNumber(bike.currentGeometry?.reachMm);
  const geometryQuality =
    stackMm !== undefined && reachMm !== undefined
      ? "full"
      : sizeLabel || stackMm !== undefined || reachMm !== undefined
        ? "partial"
        : "none";

  return {
    bikeType: bike.bikeType,
    sizeLabel,
    stackMm,
    reachMm,
    geometryQuality,
    source: geometryQuality === "none" ? "none" : "manual_geometry",
    snapshotUpdatedAt: now,
  };
}

export async function resolvePublicFitSnapshot(
  ctx: DbCtx,
  bike: Pick<
    Doc<"bikes">,
    "_id" | "bikeType" | "currentGeometry" | "geometryRecordId"
  >,
  now?: number
) {
  const geometryRecord = bike.geometryRecordId ? await ctx.db.get(bike.geometryRecordId) : null;
  return derivePublicFitSnapshot({ bike, geometryRecord, now });
}

export function buildPublicFitPhotoSources({
  bike,
  photos,
}: {
  bike: Pick<Doc<"bikes">, "photoUrl">;
  photos: PublicFitPhotoRow[];
}) {
  const orderedPhotos = [...photos].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) {
      return left.isPrimary ? -1 : 1;
    }
    const leftSort = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightSort = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftSort !== rightSort) {
      return leftSort - rightSort;
    }
    return right.createdAt - left.createdAt;
  });

  const sources = [
    ...(bike.photoUrl ? [bike.photoUrl] : []),
    ...orderedPhotos.map((photo) => photo.storageId),
  ].filter((value, index, all) => all.indexOf(value) === index);

  const primaryPhotoSource = sources[0] ?? null;
  const thumbnailSources = sources.slice(1, 5);

  return {
    primaryPhotoSource,
    thumbnailSources,
  };
}

export function buildPublicFitPreviewInternal({
  bike,
  snapshot,
  primaryPhotoSource,
  thumbnailSources,
  accessMode = "public_fit_code",
}: {
  bike: Pick<Doc<"bikes">, "_id" | "brand" | "model" | "publicFitCodeCreatedAt">;
  snapshot: PublicFitSnapshot;
  primaryPhotoSource: PublicFitSourceValue;
  thumbnailSources: string[];
  accessMode?: "public_fit_code" | "bike_passport";
}) {
  return {
    bikeId: bike._id,
    tokenVersion:
      accessMode === "bike_passport"
        ? snapshot.snapshotUpdatedAt
        : bike.publicFitCodeCreatedAt ?? snapshot.snapshotUpdatedAt,
    accessMode,
    preview: {
      brand: bike.brand ?? null,
      model: bike.model ?? null,
      bikeType: snapshot.bikeType,
      sizeLabel: snapshot.sizeLabel ?? null,
      geometryQuality: snapshot.geometryQuality,
      primaryPhotoSource,
      thumbnailSources,
    },
  };
}

export function isPublicFitPreviewActive(
  bike: Pick<Doc<"bikes">, "publicFitCode" | "publicFitEnabled">
) {
  return Boolean(bike.publicFitEnabled && bike.publicFitCode);
}

export async function assignOrReusePublicFitCode(
  ctx: DbCtx,
  bike: Pick<Doc<"bikes">, "publicFitCode" | "publicFitCodeCreatedAt">
) {
  const publicFitCodeCreatedAt = Date.now();

  if (bike.publicFitCode) {
    return {
      publicFitCode: bike.publicFitCode,
      publicFitCodeCreatedAt,
    };
  }

  const publicFitCode = await generateUniquePublicFitCode(ctx);
  return {
    publicFitCode,
    publicFitCodeCreatedAt,
  };
}

export function isPublicPhotoStorageId(value: string | null): value is string {
  return isStorageIdLike(value);
}
