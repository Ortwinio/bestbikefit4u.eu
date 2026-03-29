import type { Id } from "../_generated/dataModel";
import { internalMutation, mutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { requireUserId } from "../lib/authz";
import { validateLongTextString, validateShortString, validateTextString } from "../lib/validation";
import { createBikePhotoRecord } from "../bikePhotos/mutations";
import { createBikeWithProfiles } from "../bikes/mutations";
import {
  bikeImportDraftValidator,
  bikeImportSaveRequestValidator,
  buildCanonicalUrlCandidates,
  deriveBikeImportDraft,
  normalizeMarktplaatsImportUrl,
  parsedMarktplaatsAdvertValidator,
  resolveBikeImportStatus,
  type BikeImportDraft,
  type BikeImportSaveRequest,
} from "./shared";

type ImportTelemetryEvent =
  | "parse_succeeded"
  | "parse_failed"
  | "save_started"
  | "save_succeeded"
  | "save_failed"
  | "image_ingest_succeeded"
  | "image_ingest_failed"
  | "duplicate_reused";

type ImportTelemetryEntry = {
  event: ImportTelemetryEvent;
  at: number;
  detail?: string;
  count?: number;
};

function normalizeOptionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function buildImportedFromNote(now: number): string {
  return `Imported from Marktplaats on ${new Date(now).toISOString().slice(0, 10)}`;
}

function appendTelemetryEntry(
  existing: string | undefined,
  entry: ImportTelemetryEntry
): string {
  const parsed = existing ? ((JSON.parse(existing) as ImportTelemetryEntry[]) ?? []) : [];
  return JSON.stringify([...parsed, entry].slice(-25));
}

function buildDraftFromSaveRequest(
  saveRequest: Pick<
    BikeImportSaveRequest,
    | "name"
    | "brand"
    | "model"
    | "bikeType"
    | "description"
    | "selectedImageUrls"
    | "primaryImageUrl"
  >
): BikeImportDraft {
  return {
    name: saveRequest.name,
    brand: normalizeOptionalString(saveRequest.brand),
    model: normalizeOptionalString(saveRequest.model),
    bikeType: saveRequest.bikeType,
    description: normalizeOptionalString(saveRequest.description),
    selectedImageUrls: saveRequest.selectedImageUrls,
    primaryImageUrl: saveRequest.primaryImageUrl,
  };
}

async function findImportedDuplicateBikeId(
  ctx: MutationCtx,
  params: {
    userId: Id<"users">;
    importId: Id<"bikeImports">;
    sourceUrlNormalized: string;
    canonicalUrlNormalized?: string;
  }
) {
  if (params.canonicalUrlNormalized) {
    const canonicalMatches = await ctx.db
      .query("bikeImports")
      .withIndex("by_user_canonical_url", (q) =>
        q
          .eq("userId", params.userId)
          .eq("sourceName", "marktplaats")
          .eq("canonicalUrlNormalized", params.canonicalUrlNormalized)
      )
      .collect();
    const canonicalDuplicate = canonicalMatches.find(
      (row) => row._id !== params.importId && row.status === "imported" && row.createdBikeId
    );
    if (canonicalDuplicate?.createdBikeId) {
      return canonicalDuplicate.createdBikeId;
    }
  }

  const sourceMatches = await ctx.db
    .query("bikeImports")
    .withIndex("by_user_source_url", (q) =>
      q
        .eq("userId", params.userId)
        .eq("sourceName", "marktplaats")
        .eq("sourceUrlNormalized", params.sourceUrlNormalized)
    )
    .collect();
  return (
    sourceMatches.find(
      (row) => row._id !== params.importId && row.status === "imported" && row.createdBikeId
    )?.createdBikeId ?? null
  );
}

export const createPending = mutation({
  args: {
    sourceUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const sourceUrlNormalized = normalizeMarktplaatsImportUrl(args.sourceUrl);

    const existing = await ctx.db
      .query("bikeImports")
      .withIndex("by_user_source_url", (q) =>
        q
          .eq("userId", userId)
          .eq("sourceName", "marktplaats")
          .eq("sourceUrlNormalized", sourceUrlNormalized)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("bikeImports", {
      userId,
      sourceName: "marktplaats",
      sourceUrl: args.sourceUrl.trim(),
      sourceUrlNormalized,
      status: "pending_fetch",
      saveAttemptCount: 0,
      imageAttemptCount: 0,
      imageImportedCount: 0,
      imageFailedCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const storeParsedAdvert = internalMutation({
  args: {
    importId: v.id("bikeImports"),
    parsedAdvert: parsedMarktplaatsAdvertValidator,
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.importId);
    if (!row) {
      throw new Error("Bike import not found");
    }

    const draftBike = deriveBikeImportDraft(args.parsedAdvert);
    const { canonicalUrlNormalized } = buildCanonicalUrlCandidates(
      row.sourceUrlNormalized,
      args.parsedAdvert.canonicalUrl
    );
    const status = resolveBikeImportStatus(args.parsedAdvert, draftBike);

    await ctx.db.patch(args.importId, {
      canonicalUrl: args.parsedAdvert.canonicalUrl,
      canonicalUrlNormalized,
      advertTitle: args.parsedAdvert.advertTitle,
      parsedAdvert: args.parsedAdvert,
      draftBike,
      status,
      failureCode: undefined,
      failureReason: undefined,
      duplicateBikeId: undefined,
      telemetryJson: appendTelemetryEntry(row.telemetryJson, {
        event: "parse_succeeded",
        at: Date.now(),
        count: args.parsedAdvert.imageCandidates.length,
      }),
      updatedAt: Date.now(),
    });
  },
});

export const updateDraft = mutation({
  args: {
    importId: v.id("bikeImports"),
    draftBike: bikeImportDraftValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const row = await ctx.db.get(args.importId);
    if (!row || row.userId !== userId) {
      throw new Error("Bike import not found");
    }

    validateShortString(args.draftBike.name, "name");
    if (args.draftBike.brand !== undefined) {
      validateShortString(args.draftBike.brand, "brand");
    }
    if (args.draftBike.model !== undefined) {
      validateShortString(args.draftBike.model, "model");
    }
    if (args.draftBike.description !== undefined) {
      validateLongTextString(args.draftBike.description, "description");
    }
    if (
      args.draftBike.primaryImageUrl !== undefined &&
      !args.draftBike.selectedImageUrls.includes(args.draftBike.primaryImageUrl)
    ) {
      throw new Error("Primary image must be selected");
    }

    await ctx.db.patch(args.importId, {
      draftBike: args.draftBike,
      status: row.parsedAdvert
        ? resolveBikeImportStatus(row.parsedAdvert, args.draftBike)
        : row.status,
      updatedAt: Date.now(),
    });
  },
});

export const markFailed = internalMutation({
  args: {
    importId: v.id("bikeImports"),
    failureCode: v.optional(v.string()),
    stage: v.optional(v.union(v.literal("parse"), v.literal("save"))),
    failureReason: v.string(),
  },
  handler: async (ctx, args) => {
    validateTextString(args.failureReason, "failureReason");
    const row = await ctx.db.get(args.importId);
    if (!row) {
      throw new Error("Bike import not found");
    }

    await ctx.db.patch(args.importId, {
      status: "failed",
      failureCode: args.failureCode?.trim() || undefined,
      failureReason: args.failureReason.trim(),
      telemetryJson: appendTelemetryEntry(row.telemetryJson, {
        event: args.stage === "parse" ? "parse_failed" : "save_failed",
        at: Date.now(),
        detail: args.failureCode?.trim() || args.failureReason.trim(),
      }),
      updatedAt: Date.now(),
    });
  },
});

export const beginSave = internalMutation({
  args: {
    userId: v.id("users"),
    importId: v.id("bikeImports"),
    saveRequest: bikeImportSaveRequestValidator,
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.importId);
    if (!row || row.userId !== args.userId) {
      throw new Error("Bike import not found");
    }
    if (args.saveRequest.importId !== args.importId) {
      throw new Error("Save request import id mismatch");
    }
    if (!row.parsedAdvert) {
      throw new Error("Bike import is missing parsed advert data");
    }

    validateShortString(args.saveRequest.name, "name");
    if (args.saveRequest.brand !== undefined) {
      validateShortString(args.saveRequest.brand, "brand");
    }
    if (args.saveRequest.model !== undefined) {
      validateShortString(args.saveRequest.model, "model");
    }
    if (args.saveRequest.description !== undefined) {
      validateLongTextString(args.saveRequest.description, "description");
    }
    if (
      args.saveRequest.primaryImageUrl !== undefined &&
      !args.saveRequest.selectedImageUrls.includes(args.saveRequest.primaryImageUrl)
    ) {
      throw new Error("Primary image must be selected");
    }

    if (row.status === "imported" && row.createdBikeId) {
      await ctx.db.patch(args.importId, {
        duplicateBikeId: row.createdBikeId,
        telemetryJson: appendTelemetryEntry(row.telemetryJson, {
          event: "duplicate_reused",
          at: Date.now(),
          detail: String(row.createdBikeId),
        }),
        updatedAt: Date.now(),
      });
      return {
        outcome: "duplicate_reuse" as const,
        bikeId: row.createdBikeId,
      };
    }

    if (row.status === "importing") {
      return {
        outcome: "already_processing" as const,
      };
    }

    const duplicateBikeId = await findImportedDuplicateBikeId(ctx, {
      userId: args.userId,
      importId: args.importId,
      sourceUrlNormalized: row.sourceUrlNormalized,
      canonicalUrlNormalized: row.canonicalUrlNormalized,
    });
    if (duplicateBikeId) {
      await ctx.db.patch(args.importId, {
        duplicateBikeId,
        telemetryJson: appendTelemetryEntry(row.telemetryJson, {
          event: "duplicate_reused",
          at: Date.now(),
          detail: String(duplicateBikeId),
        }),
        updatedAt: Date.now(),
      });
      return {
        outcome: "duplicate_reuse" as const,
        bikeId: duplicateBikeId,
      };
    }

    const draftBike = buildDraftFromSaveRequest(args.saveRequest);
    const imageCandidatesByUrl = new Map(
      row.parsedAdvert.imageCandidates.map((candidate) => [candidate.url, candidate])
    );
    for (const imageUrl of args.saveRequest.selectedImageUrls) {
      if (!imageCandidatesByUrl.has(imageUrl)) {
        throw new Error("Selected image is not available in the parsed advert");
      }
    }

    const now = Date.now();
    const selectedImages = args.saveRequest.selectedImageUrls.map((imageUrl) => {
      const candidate = imageCandidatesByUrl.get(imageUrl);
      if (!candidate) {
        throw new Error("Selected image is not available in the parsed advert");
      }
      return candidate;
    });

    await ctx.db.patch(args.importId, {
      draftBike,
      status: "importing",
      saveAttemptCount: (row.saveAttemptCount ?? 0) + 1,
      lastSaveStartedAt: now,
      failureCode: undefined,
      failureReason: undefined,
      duplicateBikeId: undefined,
      telemetryJson: appendTelemetryEntry(row.telemetryJson, {
        event: "save_started",
        at: now,
        count: selectedImages.length,
      }),
      updatedAt: now,
    });

    return {
      outcome: "proceed" as const,
      sourceUrl: row.sourceUrl,
      canonicalUrl: row.canonicalUrl ?? undefined,
      advertTitle: row.advertTitle ?? row.parsedAdvert.advertTitle ?? undefined,
      selectedImages,
    };
  },
});

export const createImportedBike = internalMutation({
  args: {
    userId: v.id("users"),
    importId: v.id("bikeImports"),
    saveRequest: bikeImportSaveRequestValidator,
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.importId);
    if (!row || row.userId !== args.userId) {
      throw new Error("Bike import not found");
    }
    if (args.saveRequest.importId !== args.importId) {
      throw new Error("Save request import id mismatch");
    }

    const now = Date.now();
    return await createBikeWithProfiles(ctx, {
      userId: args.userId,
      name: args.saveRequest.name,
      bikeType: args.saveRequest.bikeType,
      source: "marketplace_import",
      brand: normalizeOptionalString(args.saveRequest.brand),
      model: normalizeOptionalString(args.saveRequest.model),
      description: normalizeOptionalString(args.saveRequest.description),
      descriptionSource: args.saveRequest.description ? "marketplace_import" : undefined,
      notes: buildImportedFromNote(now),
      importSourceName: "marktplaats",
      importSourceUrl: row.sourceUrl,
      importCanonicalUrl: row.canonicalUrl ?? undefined,
      importedAdvertTitle: row.advertTitle ?? row.parsedAdvert?.advertTitle ?? undefined,
      bikeImportId: row._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const attachImportedPhoto = internalMutation({
  args: {
    userId: v.id("users"),
    bikeId: v.id("bikes"),
    storageId: v.string(),
    caption: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await createBikePhotoRecord(ctx, args);
  },
});

export const markImageIngestResult = internalMutation({
  args: {
    importId: v.id("bikeImports"),
    success: v.boolean(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.importId);
    if (!row) {
      throw new Error("Bike import not found");
    }

    await ctx.db.patch(args.importId, {
      imageAttemptCount: (row.imageAttemptCount ?? 0) + 1,
      imageImportedCount: (row.imageImportedCount ?? 0) + (args.success ? 1 : 0),
      imageFailedCount: (row.imageFailedCount ?? 0) + (args.success ? 0 : 1),
      telemetryJson: appendTelemetryEntry(row.telemetryJson, {
        event: args.success ? "image_ingest_succeeded" : "image_ingest_failed",
        at: Date.now(),
        detail: args.imageUrl,
      }),
      updatedAt: Date.now(),
    });
  },
});

export const markImported = internalMutation({
  args: {
    importId: v.id("bikeImports"),
    bikeId: v.id("bikes"),
    saveRequest: bikeImportSaveRequestValidator,
    imageImportedCount: v.number(),
    imageFailedCount: v.number(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.importId);
    if (!row) {
      throw new Error("Bike import not found");
    }
    if (args.saveRequest.importId !== args.importId) {
      throw new Error("Save request import id mismatch");
    }

    const now = Date.now();
    await ctx.db.patch(args.importId, {
      draftBike: buildDraftFromSaveRequest(args.saveRequest),
      status: "imported",
      createdBikeId: args.bikeId,
      duplicateBikeId: undefined,
      imageImportedCount: args.imageImportedCount,
      imageFailedCount: args.imageFailedCount,
      failureCode: undefined,
      failureReason: undefined,
      telemetryJson: appendTelemetryEntry(row.telemetryJson, {
        event: "save_succeeded",
        at: now,
        detail:
          args.imageFailedCount > 0
            ? `partial_image_failure:${args.imageFailedCount}`
            : "all_images_imported",
      }),
      updatedAt: now,
    });
  },
});
