"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { bikeImportSaveRequestValidator } from "./shared";

const MAX_IMPORTED_IMAGES = 8;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_FETCH_TIMEOUT_MS = 12_000;

const allowedMarketplaceHostnames = new Set([
  "marktplaats.nl",
  "www.marktplaats.nl",
]);

const allowedImageHostSuffixes = [
  "marktplaats.nl",
  "marktplaats.com",
];

type SaveWorkflowStart =
  | {
      outcome: "duplicate_reuse";
      bikeId: Id<"bikes">;
    }
  | {
      outcome: "already_processing";
    }
  | {
      outcome: "proceed";
      sourceUrl: string;
      canonicalUrl?: string;
      advertTitle?: string;
      selectedImages: Array<{
        url: string;
        normalizedUrl: string;
        sortOrder: number;
        selectedByDefault: boolean;
        caption?: string;
        width?: number;
        height?: number;
      }>;
    };

function isPrivateHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "::1" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function normalizeRemoteUrl(url: string, kind: "source" | "image"): URL {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new Error(`${kind}_url_invalid`);
  }

  const hostname = parsed.hostname.toLowerCase();
  if (parsed.protocol !== "https:") {
    throw new Error(`${kind}_url_protocol_unsupported`);
  }
  if (isPrivateHostname(hostname)) {
    throw new Error(`${kind}_url_private_host_blocked`);
  }

  if (kind === "source") {
    if (!allowedMarketplaceHostnames.has(hostname)) {
      throw new Error("source_url_host_unsupported");
    }
    return parsed;
  }

  const allowedHost = allowedImageHostSuffixes.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`)
  );
  if (!allowedHost) {
    throw new Error("image_url_host_unsupported");
  }

  return parsed;
}

async function fetchImageBlob(imageUrl: string): Promise<Blob> {
  const parsedUrl = normalizeRemoteUrl(imageUrl, "image");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(parsedUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "BestBikeFit/marktplaats-import",
      },
    });

    if (!response.ok) {
      throw new Error(`image_fetch_failed:${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new Error("image_content_type_unsupported");
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
      throw new Error("image_too_large");
    }

    const blob = await response.blob();
    if (blob.size > MAX_IMAGE_BYTES) {
      throw new Error("image_too_large");
    }
    return blob;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("image_fetch_timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function classifyImageFailure(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "image_ingest_unknown";
}

export const saveConfirmedImport = action({
  args: {
    saveRequest: bikeImportSaveRequestValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const start = (await ctx.runMutation(internal.bikeImports.mutations.beginSave, {
      userId,
      importId: args.saveRequest.importId,
      saveRequest: args.saveRequest,
    })) as SaveWorkflowStart;

    if (start.outcome === "duplicate_reuse") {
      return {
        status: "duplicate_reused" as const,
        bikeId: start.bikeId,
        imageImportedCount: 0,
        imageFailedCount: 0,
      };
    }

    if (start.outcome === "already_processing") {
      return {
        status: "already_processing" as const,
      };
    }

    normalizeRemoteUrl(start.sourceUrl, "source");
    if (start.canonicalUrl) {
      normalizeRemoteUrl(start.canonicalUrl, "source");
    }

    let bikeId: Id<"bikes"> | null = null;
    let imageImportedCount = 0;
    let imageFailedCount = 0;

    try {
      bikeId = (await ctx.runMutation(internal.bikeImports.mutations.createImportedBike, {
        userId,
        importId: args.saveRequest.importId,
        saveRequest: args.saveRequest,
      })) as Id<"bikes">;

      for (const image of start.selectedImages.slice(0, MAX_IMPORTED_IMAGES)) {
        let storageId: Id<"_storage"> | null = null;
        try {
          const blob = await fetchImageBlob(image.url);
          storageId = await ctx.storage.store(blob);
          await ctx.runMutation(internal.bikeImports.mutations.attachImportedPhoto, {
            userId,
            bikeId,
            storageId,
            caption: image.caption,
            isPrimary: args.saveRequest.primaryImageUrl
              ? image.url === args.saveRequest.primaryImageUrl
              : imageImportedCount === 0,
          });
          imageImportedCount += 1;
          await ctx.runMutation(internal.bikeImports.mutations.markImageIngestResult, {
            importId: args.saveRequest.importId,
            success: true,
            imageUrl: image.url,
          });
        } catch (error) {
          imageFailedCount += 1;
          if (storageId) {
            await ctx.storage.delete(storageId);
          }
          await ctx.runMutation(internal.bikeImports.mutations.markImageIngestResult, {
            importId: args.saveRequest.importId,
            success: false,
            imageUrl: `${image.url}#${classifyImageFailure(error)}`,
          });
        }
      }

      await ctx.runMutation(internal.bikeImports.mutations.markImported, {
        importId: args.saveRequest.importId,
        bikeId,
        saveRequest: args.saveRequest,
        imageImportedCount,
        imageFailedCount,
      });

      return {
        status: "imported" as const,
        bikeId,
        imageImportedCount,
        imageFailedCount,
      };
    } catch (error) {
      await ctx.runMutation(internal.bikeImports.mutations.markFailed, {
        importId: args.saveRequest.importId,
        stage: "save",
        failureCode: error instanceof Error ? error.message : "save_failed",
        failureReason:
          bikeId === null
            ? "Marktplaats import could not create a bike draft."
            : "Marktplaats import created the bike draft but failed to finalize the import state.",
      });
      throw error;
    }
  },
});
