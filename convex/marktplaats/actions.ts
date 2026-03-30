import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { ConvexError, v } from "convex/values";
import { parseMarktplaatsAdvert, normalizeMarktplaatsUrl, type ParsedBikeType } from "./parser";
import { deriveBikeImportDraft, type ParsedMarktplaatsAdvert } from "../bikeImports/shared";

type PreviewResponse = {
  importId: string;
  alreadyImportedBikeId?: string;
  sourceUrl: string;
  canonicalUrl: string;
  advertTitle?: string;
  nameDraft: string;
  description?: string;
  rawDescription?: string;
  imageUrls: string[];
  candidateBrand?: string;
  candidateBrandConfidence: "high" | "medium" | "low";
  candidateModel?: string;
  candidateModelConfidence: "high" | "medium" | "low";
  candidateBikeType?: ParsedBikeType;
  candidateBikeTypeConfidence: "high" | "medium" | "low";
  derivedSignals: {
    sizeMentions: string[];
    componentMentions: string[];
    conditionMentions: string[];
    maintenanceMentions: string[];
    previewWarnings: string[];
  };
  needsReview: {
    brand: boolean;
    model: boolean;
    bikeType: boolean;
  };
};

function buildNameDraft(input: {
  advertTitle?: string;
  brand?: string;
  model?: string;
}): string {
  const joined = [input.brand, input.model].filter(Boolean).join(" ").trim();
  if (joined.length >= 3) {
    return joined;
  }
  return input.advertTitle?.trim() || "Imported bike";
}

function buildFetchHeaders() {
  return {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  };
}

export const previewBikeImport = action({
  args: {
    sourceUrl: v.string(),
  },
  handler: async (ctx, args): Promise<PreviewResponse> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const sourceUrl = normalizeMarktplaatsUrl(args.sourceUrl);
    try {
      const response = await fetch(sourceUrl, {
        headers: buildFetchHeaders(),
        redirect: "follow",
      });

      if (!response.ok) {
        const importId = await ctx.runMutation(internal.marktplaats.mutations.upsertPreviewImport, {
          userId,
          sourceUrl,
          canonicalUrl: sourceUrl,
          status: "failed",
          failureReason: `Advert fetch failed (${response.status})`,
        });
        throw new ConvexError(
          `Could not fetch this Marktplaats advert (${response.status}). Reference: ${importId}`
        );
      }

      const html = await response.text();
      if (!html.trim()) {
        throw new ConvexError("The advert returned an empty response.");
      }

      const parsed = parseMarktplaatsAdvert({ sourceUrl, html });
      const parsedAdvert: ParsedMarktplaatsAdvert = {
        parserVersion: "marktplaats.v1",
        fetchedAt: Date.now(),
        sourceUrl: parsed.sourceUrl,
        canonicalUrl: parsed.canonicalUrl,
        advertTitle: parsed.advertTitle,
        description: parsed.description,
        imageCandidates: parsed.imageUrls.map((url, index) => ({
          url,
          normalizedUrl: url.trim(),
          sortOrder: index,
          selectedByDefault: index < 8,
        })),
        candidateBrand: {
          value: parsed.candidateBrand.value,
          confidence: parsed.candidateBrand.confidence,
        },
        candidateModel: {
          value: parsed.candidateModel.value,
          confidence: parsed.candidateModel.confidence,
        },
        candidateBikeType: {
          value: parsed.candidateBikeType.value,
          confidence: parsed.candidateBikeType.confidence,
        },
      };
      const existingImport = await ctx.runQuery(api.marktplaats.queries.findExistingImportByCanonicalUrl, {
        canonicalUrl: parsed.canonicalUrl,
      });

      const importId = await ctx.runMutation(internal.marktplaats.mutations.upsertPreviewImport, {
        userId,
        sourceUrl: parsed.sourceUrl,
        canonicalUrl: parsed.canonicalUrl,
        advertTitle: parsed.advertTitle,
        parsedAdvert,
        status:
          parsed.candidateBrand.needsReview ||
          parsed.candidateModel.needsReview ||
          parsed.candidateBikeType.needsReview
            ? "needs_review"
            : "parsed",
      });

      return {
        importId,
        alreadyImportedBikeId: existingImport?.createdBikeId,
        sourceUrl: parsed.sourceUrl,
        canonicalUrl: parsed.canonicalUrl,
        advertTitle: parsed.advertTitle,
        nameDraft: deriveBikeImportDraft(parsedAdvert).name || buildNameDraft({
          advertTitle: parsed.advertTitle,
          brand: parsed.candidateBrand.value,
          model: parsed.candidateModel.value,
        }),
        description: parsed.description,
        rawDescription: parsed.rawDescription,
        imageUrls: parsed.imageUrls,
        candidateBrand: parsed.candidateBrand.value,
        candidateBrandConfidence: parsed.candidateBrand.confidence,
        candidateModel: parsed.candidateModel.value,
        candidateModelConfidence: parsed.candidateModel.confidence,
        candidateBikeType: parsed.candidateBikeType.value,
        candidateBikeTypeConfidence: parsed.candidateBikeType.confidence,
        derivedSignals: parsed.derivedSignals,
        needsReview: {
          brand: parsed.candidateBrand.needsReview,
          model: parsed.candidateModel.needsReview,
          bikeType: parsed.candidateBikeType.needsReview,
        },
      };
    } catch (error) {
      const failureReason =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "Could not load this Marktplaats advert.";
      await ctx.runMutation(internal.marktplaats.mutations.upsertPreviewImport, {
        userId,
        sourceUrl,
        canonicalUrl: sourceUrl,
        status: "failed",
        failureReason,
      });
      throw new ConvexError(failureReason);
    }
  },
});

export const confirmBikeImport = action({
  args: {
    importId: v.id("bikeImports"),
    sourceUrl: v.string(),
    canonicalUrl: v.string(),
    advertTitle: v.optional(v.string()),
    name: v.string(),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    bikeType: v.union(
      v.literal("road"),
      v.literal("gravel"),
      v.literal("mountain"),
      v.literal("hybrid"),
      v.literal("tt_triathlon"),
      v.literal("cyclocross"),
      v.literal("touring"),
      v.literal("city")
    ),
    description: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ bikeId: string; duplicate: boolean }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.runMutation(internal.marktplaats.mutations.createImportedBike, {
      importId: args.importId,
      userId,
      canonicalUrl: normalizeMarktplaatsUrl(args.canonicalUrl),
      sourceUrl: normalizeMarktplaatsUrl(args.sourceUrl),
      advertTitle: args.advertTitle,
      name: args.name,
      brand: args.brand,
      model: args.model,
      bikeType: args.bikeType,
      description: args.description,
    });
  },
});
