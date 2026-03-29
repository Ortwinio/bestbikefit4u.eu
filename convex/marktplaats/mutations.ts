import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { createBikeWithProfiles } from "../bikes/mutations";
import {
  buildCanonicalUrlCandidates,
  deriveBikeImportDraft,
  normalizeMarktplaatsImportUrl,
  parsedMarktplaatsAdvertValidator,
  resolveBikeImportStatus,
} from "../bikeImports/shared";

export const upsertPreviewImport = internalMutation({
  args: {
    userId: v.id("users"),
    sourceUrl: v.string(),
    canonicalUrl: v.string(),
    advertTitle: v.optional(v.string()),
    parsedAdvert: v.optional(parsedMarktplaatsAdvertValidator),
    status: v.union(
      v.literal("pending_fetch"),
      v.literal("parsed"),
      v.literal("needs_review"),
      v.literal("failed")
    ),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sourceUrlNormalized = normalizeMarktplaatsImportUrl(args.sourceUrl);
    const canonicalUrlNormalized = normalizeMarktplaatsImportUrl(args.canonicalUrl);
    const existing = await ctx.db
      .query("bikeImports")
      .withIndex("by_user_canonical_url", (q) =>
        q
          .eq("userId", args.userId)
          .eq("sourceName", "marktplaats")
          .eq("canonicalUrlNormalized", canonicalUrlNormalized)
      )
      .first();

    const draftBike = args.parsedAdvert
      ? deriveBikeImportDraft(args.parsedAdvert)
      : existing?.draftBike;
    const nextStatus =
      args.parsedAdvert && draftBike
        ? resolveBikeImportStatus(args.parsedAdvert, draftBike)
        : args.status;

    if (existing) {
      if (existing.createdBikeId) {
        return existing._id;
      }
      await ctx.db.patch(existing._id, {
        sourceUrl: args.sourceUrl,
        sourceUrlNormalized,
        canonicalUrl: args.canonicalUrl,
        canonicalUrlNormalized,
        advertTitle: args.advertTitle,
        parsedAdvert: args.parsedAdvert,
        draftBike,
        status: nextStatus,
        failureReason: args.failureReason,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("bikeImports", {
      userId: args.userId,
      sourceName: "marktplaats",
      sourceUrl: args.sourceUrl,
      sourceUrlNormalized,
      canonicalUrl: args.canonicalUrl,
      canonicalUrlNormalized,
      advertTitle: args.advertTitle,
      parsedAdvert: args.parsedAdvert,
      draftBike,
      status: nextStatus,
      failureReason: args.failureReason,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createImportedBike = internalMutation({
  args: {
    importId: v.id("bikeImports"),
    userId: v.id("users"),
    canonicalUrl: v.string(),
    sourceUrl: v.string(),
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
  handler: async (ctx, args) => {
    const sourceUrlNormalized = normalizeMarktplaatsImportUrl(args.sourceUrl);
    const { canonicalUrlNormalized } = buildCanonicalUrlCandidates(
      sourceUrlNormalized,
      args.canonicalUrl
    );

    const existing = canonicalUrlNormalized
      ? await ctx.db
          .query("bikeImports")
          .withIndex("by_user_canonical_url", (q) =>
            q
              .eq("userId", args.userId)
              .eq("sourceName", "marktplaats")
              .eq("canonicalUrlNormalized", canonicalUrlNormalized)
          )
          .first()
      : null;

    if (existing?.createdBikeId) {
      await ctx.db.patch(args.importId, {
        status: "imported",
        createdBikeId: existing.createdBikeId,
        updatedAt: Date.now(),
      });
      return { bikeId: existing.createdBikeId, duplicate: true };
    }

    const bikeId = await createBikeWithProfiles(ctx, {
      userId: args.userId,
      name: args.name,
      bikeType: args.bikeType,
      source: "marketplace_import",
      brand: args.brand,
      model: args.model,
      description: args.description,
      descriptionSource: args.description ? "marketplace_import" : undefined,
      importSourceName: "marktplaats",
      importSourceUrl: args.sourceUrl,
      importCanonicalUrl: args.canonicalUrl,
      importedAdvertTitle: args.advertTitle,
      bikeImportId: args.importId,
    });

    await ctx.db.patch(args.importId, {
      canonicalUrl: args.canonicalUrl,
      canonicalUrlNormalized,
      status: "imported",
      createdBikeId: bikeId,
      updatedAt: Date.now(),
    });

    return { bikeId, duplicate: false };
  },
});
