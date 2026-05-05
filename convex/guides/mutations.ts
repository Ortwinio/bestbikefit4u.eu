import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { writeAuditLog } from "../admin/audit";
import { buildGuideFieldChanges, writeGuideAuditLog } from "./audit";
import { BRAND } from "@/config/brand";
import {
  assertGuideSlugAvailable,
  buildGuidePath,
  guideEditableFields,
  guideSeoHintsValidator,
  normalizeGuideSlug,
  requireGuideAdmin,
  requireGuideEditor,
  saveGuideRevision,
} from "./shared";

function cleanStringArray(values: string[] | undefined) {
  return values?.map((value) => value.trim()).filter(Boolean);
}

function cleanOptionalString(value: string | undefined | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeRedirectPath(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "/";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

function hasText(value: string | undefined | null) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasLocalizedText(
  value: { en?: string; nl?: string } | undefined | null,
  locale: "en" | "nl"
) {
  return hasText(value?.[locale]);
}

function validateCanonicalUrl(canonicalUrl: string | undefined | null) {
  const cleaned = cleanOptionalString(canonicalUrl);
  if (!cleaned) {
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    throw new Error("Canonical URL must be a valid absolute URL");
  }

  if (parsed.hostname !== BRAND.host) {
    throw new Error(`Canonical URL must use ${BRAND.host}`);
  }

  if (parsed.search || parsed.hash) {
    throw new Error("Canonical URL cannot include query parameters or fragments");
  }
}

function hasLocalizedGuideContent(guide: {
  pageTitle?: { en?: string; nl?: string };
  h1?: { en?: string; nl?: string };
  metaTitle?: { en?: string; nl?: string };
  metaDescription?: { en?: string; nl?: string };
  pageBrief?: { en?: string; nl?: string };
  body?: { en?: Array<{ items?: string[] }>; nl?: Array<{ items?: string[] }> };
  libraryBody?: { en?: string; nl?: string };
}, locale: "en" | "nl") {
  const hasStructuredBody = (guide.body?.[locale] ?? []).some((section) =>
    (section.items ?? []).some((item) => hasText(item))
  );

  return (
    hasText(guide.pageTitle?.[locale]) &&
    hasText(guide.h1?.[locale]) &&
    hasText(guide.metaTitle?.[locale]) &&
    hasText(guide.metaDescription?.[locale]) &&
    hasText(guide.pageBrief?.[locale]) &&
    (hasStructuredBody || hasText(guide.libraryBody?.[locale]))
  );
}

function assertGuideReadyForReviewOrPublish(guide: {
  pageTitle?: { en?: string; nl?: string };
  h1?: { en?: string; nl?: string };
  metaTitle?: { en?: string; nl?: string };
  metaDescription?: { en?: string; nl?: string };
  pageBrief?: { en?: string; nl?: string };
  body?: { en?: Array<{ items?: string[] }>; nl?: Array<{ items?: string[] }> };
  libraryBody?: { en?: string; nl?: string };
  featuredImageAlt?: { en?: string; nl?: string };
  featuredImageUrl?: string | null;
  heroImagePublicPath?: string | null;
  canonicalUrl?: string | null;
}) {
  if (!hasLocalizedGuideContent(guide, "en") || !hasLocalizedGuideContent(guide, "nl")) {
    throw new Error("English and Dutch content must both be complete before review or publishing");
  }

  validateCanonicalUrl(guide.canonicalUrl);

  const hasGuideImage = hasText(guide.featuredImageUrl) || hasText(guide.heroImagePublicPath);
  if (
    hasGuideImage &&
    (!hasLocalizedText(guide.featuredImageAlt, "en") ||
      !hasLocalizedText(guide.featuredImageAlt, "nl"))
  ) {
    throw new Error(
      "Published guides with a featured or hero image must provide English and Dutch image alt text"
    );
  }
}

function buildGuideRecordFromArgs(
  args: any
) {
  const slug = normalizeGuideSlug(args.slug);
  return {
    slug,
    path: args.path ?? buildGuidePath(slug),
    cluster: args.cluster,
    backlogOrder: args.backlogOrder,
    importStatus: args.importStatus,
    importNotes: args.importNotes,
    status: args.status ?? "draft",
    pageTitle: args.pageTitle,
    h1: args.h1,
    metaTitle: args.metaTitle,
    metaDescription: args.metaDescription,
    pageBrief: args.pageBrief,
    body: args.body,
    faqs: args.faqs,
    quickAnswer: args.quickAnswer,
    libraryBody: args.libraryBody,
    heroImageFileName: args.heroImageFileName,
    heroImagePublicPath: cleanOptionalString(args.heroImagePublicPath),
    relatedGuidePaths: cleanStringArray(args.relatedGuidePaths),
    relatedKeywords: cleanStringArray(args.relatedKeywords),
    seoHints: args.seoHints,
    featuredImageUrl: cleanOptionalString(args.featuredImageUrl),
    featuredImageAlt: args.featuredImageAlt,
    canonicalUrl: cleanOptionalString(args.canonicalUrl),
    ogTitle: args.ogTitle,
    ogDescription: args.ogDescription,
    ogImageUrl: cleanOptionalString(args.ogImageUrl),
    ogImageAlt: args.ogImageAlt,
    robotsIndex: args.robotsIndex,
    author: args.author,
    tags: cleanStringArray(args.tags),
    relatedGuides: cleanStringArray(args.relatedGuides),
    primaryCtaTarget: args.primaryCtaTarget,
    primaryCtaLabel: args.primaryCtaLabel,
    tableOfContents: args.tableOfContents,
    publishedAt: args.publishedAt,
    lastUpdatedAt: args.lastUpdatedAt,
    deletedAt: undefined,
    deletedBy: undefined,
  };
}

export const createGuide = mutation({
  args: {
    slug: v.string(),
    ...guideEditableFields,
  },
  handler: async (ctx, args) => {
    const userId = await requireGuideEditor(ctx);
    const slug = normalizeGuideSlug(args.slug);
    await assertGuideSlugAvailable(ctx, slug);

    const now = Date.now();
    const guideId = await ctx.db.insert("guidePages", {
      ...buildGuideRecordFromArgs({
        ...args,
        slug,
        status: "draft",
      }),
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
      version: 1,
    });

    const guide = await ctx.db.get(guideId);
    if (!guide) {
      throw new Error("Guide creation failed");
    }

    await saveGuideRevision(ctx, guide, userId);
    await writeAuditLog(ctx, {
      adminUserId: userId,
      action: "guide.create",
      targetType: "guidePage",
      targetId: String(guideId),
      payload: { slug, cluster: args.cluster, status: "draft", version: 1 },
    });
    await writeGuideAuditLog(ctx, {
      guideId,
      action: "create",
      resourceType: "guide",
      resourceId: String(guideId),
      userId,
      metadata: { slug, cluster: args.cluster, status: "draft", version: 1 },
    });

    return guideId;
  },
});

export const updateGuide = mutation({
  args: {
    id: v.id("guidePages"),
    slug: v.optional(v.string()),
    cluster: v.optional(v.string()),
    backlogOrder: v.optional(v.number()),
    importStatus: v.optional(v.string()),
    importNotes: v.optional(v.string()),
    pageTitle: v.optional(guideEditableFields.pageTitle),
    h1: v.optional(guideEditableFields.h1),
    metaTitle: v.optional(guideEditableFields.metaTitle),
    metaDescription: v.optional(guideEditableFields.metaDescription),
    pageBrief: v.optional(guideEditableFields.pageBrief),
    body: v.optional(guideEditableFields.body),
    faqs: v.optional(guideEditableFields.faqs),
    quickAnswer: v.optional(guideEditableFields.quickAnswer),
    libraryBody: v.optional(guideEditableFields.libraryBody),
    heroImageFileName: v.optional(v.string()),
    heroImagePublicPath: v.optional(v.string()),
    relatedGuidePaths: v.optional(v.array(v.string())),
    relatedKeywords: v.optional(v.array(v.string())),
    seoHints: v.optional(guideSeoHintsValidator),
    featuredImageUrl: v.optional(v.string()),
    featuredImageAlt: v.optional(guideEditableFields.featuredImageAlt),
    canonicalUrl: v.optional(v.string()),
    ogTitle: v.optional(guideEditableFields.ogTitle),
    ogDescription: v.optional(guideEditableFields.ogDescription),
    ogImageUrl: v.optional(v.string()),
    ogImageAlt: v.optional(guideEditableFields.ogImageAlt),
    robotsIndex: v.optional(v.boolean()),
    author: v.optional(v.id("users")),
    tags: v.optional(v.array(v.string())),
    relatedGuides: v.optional(v.array(v.string())),
    primaryCtaTarget: v.optional(v.string()),
    primaryCtaLabel: v.optional(guideEditableFields.primaryCtaLabel),
    tableOfContents: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireGuideEditor(ctx);
    const guide = await ctx.db.get(args.id);
    if (!guide) {
      throw new Error("Guide not found");
    }

    let slugPatch:
      | {
          slug: string;
          path: string;
        }
      | undefined;

    if (args.slug !== undefined) {
      const nextSlug = normalizeGuideSlug(args.slug);
      if (!nextSlug) {
        throw new Error("Guide slug is required");
      }

      if (guide.status === "published" && nextSlug !== guide.slug) {
        throw new Error("Published guide slugs must be changed through the redirect flow");
      }

      if (nextSlug !== guide.slug) {
        await assertGuideSlugAvailable(ctx, nextSlug, args.id);
      }

      slugPatch = {
        slug: nextSlug,
        path: buildGuidePath(nextSlug),
      };
    }

    const patch: any = {
      ...slugPatch,
      ...(args.cluster !== undefined ? { cluster: args.cluster } : {}),
      ...(args.backlogOrder !== undefined ? { backlogOrder: args.backlogOrder } : {}),
      ...(args.importStatus !== undefined ? { importStatus: args.importStatus } : {}),
      ...(args.importNotes !== undefined ? { importNotes: args.importNotes } : {}),
      ...(args.pageTitle !== undefined ? { pageTitle: args.pageTitle } : {}),
      ...(args.h1 !== undefined ? { h1: args.h1 } : {}),
      ...(args.metaTitle !== undefined ? { metaTitle: args.metaTitle } : {}),
      ...(args.metaDescription !== undefined
        ? { metaDescription: args.metaDescription }
        : {}),
      ...(args.pageBrief !== undefined ? { pageBrief: args.pageBrief } : {}),
      ...(args.body !== undefined ? { body: args.body } : {}),
      ...(args.faqs !== undefined ? { faqs: args.faqs } : {}),
      ...(args.quickAnswer !== undefined ? { quickAnswer: args.quickAnswer } : {}),
      ...(args.libraryBody !== undefined ? { libraryBody: args.libraryBody } : {}),
      ...(args.heroImageFileName !== undefined
        ? { heroImageFileName: args.heroImageFileName }
        : {}),
      ...(args.heroImagePublicPath !== undefined
        ? { heroImagePublicPath: cleanOptionalString(args.heroImagePublicPath) }
        : {}),
      ...(args.relatedGuidePaths !== undefined
        ? { relatedGuidePaths: cleanStringArray(args.relatedGuidePaths) }
        : {}),
      ...(args.relatedKeywords !== undefined
        ? { relatedKeywords: cleanStringArray(args.relatedKeywords) }
        : {}),
      ...(args.seoHints !== undefined ? { seoHints: args.seoHints } : {}),
      ...(args.featuredImageUrl !== undefined
        ? { featuredImageUrl: cleanOptionalString(args.featuredImageUrl) }
        : {}),
      ...(args.featuredImageAlt !== undefined
        ? { featuredImageAlt: args.featuredImageAlt }
        : {}),
      ...(args.canonicalUrl !== undefined
        ? { canonicalUrl: cleanOptionalString(args.canonicalUrl) }
        : {}),
      ...(args.ogTitle !== undefined ? { ogTitle: args.ogTitle } : {}),
      ...(args.ogDescription !== undefined
        ? { ogDescription: args.ogDescription }
        : {}),
      ...(args.ogImageUrl !== undefined
        ? { ogImageUrl: cleanOptionalString(args.ogImageUrl) }
        : {}),
      ...(args.ogImageAlt !== undefined ? { ogImageAlt: args.ogImageAlt } : {}),
      ...(args.robotsIndex !== undefined ? { robotsIndex: args.robotsIndex } : {}),
      ...(args.author !== undefined ? { author: args.author } : {}),
      ...(args.tags !== undefined ? { tags: cleanStringArray(args.tags) } : {}),
      ...(args.relatedGuides !== undefined
        ? { relatedGuides: cleanStringArray(args.relatedGuides) }
        : {}),
      ...(args.primaryCtaTarget !== undefined
        ? { primaryCtaTarget: args.primaryCtaTarget }
        : {}),
      ...(args.primaryCtaLabel !== undefined
        ? { primaryCtaLabel: args.primaryCtaLabel }
        : {}),
      ...(args.tableOfContents !== undefined
        ? { tableOfContents: args.tableOfContents }
        : {}),
      updatedAt: Date.now(),
      updatedBy: userId,
      version: guide.version + 1,
    };

    validateCanonicalUrl(patch.canonicalUrl ?? guide.canonicalUrl);

    const auditPatch = Object.fromEntries(
      Object.entries(patch).filter(
        ([fieldName]) => !["updatedAt", "updatedBy", "version"].includes(fieldName)
      )
    );
    const fieldChanges = buildGuideFieldChanges(guide, auditPatch);

    await ctx.db.patch(args.id, patch);
    const updatedGuide = await ctx.db.get(args.id);
    if (!updatedGuide) {
      throw new Error("Guide update failed");
    }

    await saveGuideRevision(ctx, updatedGuide, userId);
    await writeAuditLog(ctx, {
      adminUserId: userId,
      action: "guide.update",
      targetType: "guidePage",
      targetId: String(args.id),
      payload: {
        beforeVersion: guide.version,
        afterVersion: updatedGuide.version,
      },
    });
    await writeGuideAuditLog(ctx, {
      guideId: args.id,
      action: "update",
      resourceType: "guide",
      resourceId: String(args.id),
      userId,
      fieldChanges,
      metadata: {
        beforeVersion: guide.version,
        afterVersion: updatedGuide.version,
      },
    });

    return updatedGuide._id;
  },
});

export const publishGuide = mutation({
  args: {
    id: v.id("guidePages"),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireGuideAdmin(ctx);
    const guide = await ctx.db.get(id);
    if (!guide) {
      throw new Error("Guide not found");
    }

    assertGuideReadyForReviewOrPublish(guide);

    const now = Date.now();
    await ctx.db.patch(id, {
      status: "published",
      publishedAt: guide.publishedAt ?? now,
      lastUpdatedAt: now,
      updatedAt: now,
      updatedBy: userId,
    });

    await writeAuditLog(ctx, {
      adminUserId: userId,
      action: "guide.publish",
      targetType: "guidePage",
      targetId: String(id),
      payload: { slug: guide.slug },
    });
    await writeGuideAuditLog(ctx, {
      guideId: id,
      action: "publish",
      resourceType: "guide",
      resourceId: String(id),
      userId,
      metadata: { slug: guide.slug },
    });

    return id;
  },
});

export const unpublishGuide = mutation({
  args: {
    id: v.id("guidePages"),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireGuideAdmin(ctx);
    const guide = await ctx.db.get(id);
    if (!guide) {
      throw new Error("Guide not found");
    }

    await ctx.db.patch(id, {
      status: "unpublished",
      updatedAt: Date.now(),
      updatedBy: userId,
    });

    await writeAuditLog(ctx, {
      adminUserId: userId,
      action: "guide.unpublish",
      targetType: "guidePage",
      targetId: String(id),
      payload: { slug: guide.slug },
    });
    await writeGuideAuditLog(ctx, {
      guideId: id,
      action: "unpublish",
      resourceType: "guide",
      resourceId: String(id),
      userId,
      metadata: { slug: guide.slug },
    });

    return id;
  },
});

export const submitGuideForReview = mutation({
  args: {
    id: v.id("guidePages"),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireGuideEditor(ctx);
    const guide = await ctx.db.get(id);
    if (!guide) {
      throw new Error("Guide not found");
    }

    if (guide.status === "published") {
      throw new Error("Published guides cannot be submitted for review");
    }

    assertGuideReadyForReviewOrPublish(guide);

    await ctx.db.patch(id, {
      status: "in_review",
      updatedAt: Date.now(),
      updatedBy: userId,
    });

    await writeAuditLog(ctx, {
      adminUserId: userId,
      action: "guide.submit_for_review",
      targetType: "guidePage",
      targetId: String(id),
      payload: { slug: guide.slug },
    });
    await writeGuideAuditLog(ctx, {
      guideId: id,
      action: "submit_for_review",
      resourceType: "guide",
      resourceId: String(id),
      userId,
      metadata: { slug: guide.slug },
    });

    return id;
  },
});

export const requestGuideChanges = mutation({
  args: {
    id: v.id("guidePages"),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireGuideAdmin(ctx);
    const guide = await ctx.db.get(id);
    if (!guide) {
      throw new Error("Guide not found");
    }

    await ctx.db.patch(id, {
      status: "draft",
      updatedAt: Date.now(),
      updatedBy: userId,
    });

    await writeAuditLog(ctx, {
      adminUserId: userId,
      action: "guide.request_changes",
      targetType: "guidePage",
      targetId: String(id),
      payload: { slug: guide.slug },
    });
    await writeGuideAuditLog(ctx, {
      guideId: id,
      action: "request_changes",
      resourceType: "guide",
      resourceId: String(id),
      userId,
      metadata: { slug: guide.slug },
    });

    return id;
  },
});

export const deleteGuide = mutation({
  args: {
    id: v.id("guidePages"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, reason }) => {
    const userId = await requireGuideAdmin(ctx);
    const guide = await ctx.db.get(id);
    if (!guide) {
      throw new Error("Guide not found");
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      status: "unpublished",
      deletedAt: now,
      deletedBy: userId,
      updatedAt: now,
      updatedBy: userId,
      version: guide.version + 1,
    });

    const deletedGuide = await ctx.db.get(id);
    if (!deletedGuide) {
      throw new Error("Guide delete failed");
    }

    await saveGuideRevision(ctx, deletedGuide, userId);
    await writeAuditLog(ctx, {
      adminUserId: userId,
      action: "guide.delete",
      targetType: "guidePage",
      targetId: String(id),
      payload: { slug: guide.slug, status: "unpublished" },
      reason,
    });
    await writeGuideAuditLog(ctx, {
      guideId: id,
      action: "delete",
      resourceType: "guide",
      resourceId: String(id),
      userId,
      metadata: { slug: guide.slug, reason },
    });

    return id;
  },
});

export const restoreGuideRevision = mutation({
  args: {
    guideId: v.id("guidePages"),
    revisionId: v.id("guideRevisions"),
  },
  handler: async (ctx, { guideId, revisionId }) => {
    const userId = await requireGuideAdmin(ctx);
    const [guide, revision] = await Promise.all([
      ctx.db.get(guideId),
      ctx.db.get(revisionId),
    ]);

    if (!guide) {
      throw new Error("Guide not found");
    }
    if (!revision || revision.guideId !== guideId) {
      throw new Error("Revision not found");
    }

    const snapshot = revision.snapshot as Record<string, unknown>;
    const nextSlug = normalizeGuideSlug(String(snapshot.slug ?? guide.slug));
    await assertGuideSlugAvailable(ctx, nextSlug, guideId);

    const now = Date.now();
    const patch = {
      slug: nextSlug,
      path: buildGuidePath(nextSlug),
      cluster: String(snapshot.cluster ?? guide.cluster),
      backlogOrder:
        typeof snapshot.backlogOrder === "number" ? snapshot.backlogOrder : undefined,
      importStatus:
        typeof snapshot.importStatus === "string" ? snapshot.importStatus : undefined,
      importNotes:
        typeof snapshot.importNotes === "string" ? snapshot.importNotes : undefined,
      status:
        (snapshot.status as "draft" | "in_review" | "published" | "unpublished") ??
        guide.status,
      pageTitle: snapshot.pageTitle ?? guide.pageTitle,
      h1: snapshot.h1 ?? guide.h1,
      metaTitle: snapshot.metaTitle ?? guide.metaTitle,
      metaDescription: snapshot.metaDescription ?? guide.metaDescription,
      pageBrief: snapshot.pageBrief ?? guide.pageBrief,
      body: snapshot.body ?? guide.body,
      faqs: snapshot.faqs ?? undefined,
      quickAnswer: snapshot.quickAnswer ?? undefined,
      libraryBody: snapshot.libraryBody ?? undefined,
      heroImageFileName:
        typeof snapshot.heroImageFileName === "string"
          ? snapshot.heroImageFileName
          : undefined,
      heroImagePublicPath:
        typeof snapshot.heroImagePublicPath === "string"
          ? snapshot.heroImagePublicPath
          : undefined,
      relatedGuidePaths: cleanStringArray(
        Array.isArray(snapshot.relatedGuidePaths)
          ? (snapshot.relatedGuidePaths as string[])
          : undefined
      ),
      relatedKeywords: cleanStringArray(
        Array.isArray(snapshot.relatedKeywords)
          ? (snapshot.relatedKeywords as string[])
          : undefined
      ),
      seoHints: snapshot.seoHints,
      featuredImageUrl:
        typeof snapshot.featuredImageUrl === "string"
          ? snapshot.featuredImageUrl
          : undefined,
      featuredImageAlt: snapshot.featuredImageAlt ?? undefined,
      canonicalUrl:
        typeof snapshot.canonicalUrl === "string" ? snapshot.canonicalUrl : undefined,
      ogTitle: snapshot.ogTitle ?? undefined,
      ogDescription: snapshot.ogDescription ?? undefined,
      ogImageUrl:
        typeof snapshot.ogImageUrl === "string" ? snapshot.ogImageUrl : undefined,
      ogImageAlt: snapshot.ogImageAlt ?? undefined,
      robotsIndex:
        typeof snapshot.robotsIndex === "boolean" ? snapshot.robotsIndex : guide.robotsIndex,
      author: snapshot.author ?? undefined,
      tags: cleanStringArray(
        Array.isArray(snapshot.tags) ? (snapshot.tags as string[]) : undefined
      ),
      relatedGuides: cleanStringArray(
        Array.isArray(snapshot.relatedGuides)
          ? (snapshot.relatedGuides as string[])
          : undefined
      ),
      primaryCtaTarget:
        typeof snapshot.primaryCtaTarget === "string"
          ? snapshot.primaryCtaTarget
          : undefined,
      primaryCtaLabel: snapshot.primaryCtaLabel ?? undefined,
      tableOfContents:
        typeof snapshot.tableOfContents === "boolean"
          ? snapshot.tableOfContents
          : guide.tableOfContents,
      publishedAt:
        typeof snapshot.publishedAt === "number" ? snapshot.publishedAt : undefined,
      lastUpdatedAt:
        typeof snapshot.lastUpdatedAt === "number" ? snapshot.lastUpdatedAt : undefined,
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: userId,
      version: guide.version + 1,
    };

    await ctx.db.patch(guideId, patch as any);

    const restoredGuide = await ctx.db.get(guideId);
    if (!restoredGuide) {
      throw new Error("Guide restore failed");
    }

    await saveGuideRevision(ctx, restoredGuide, userId);
    await writeAuditLog(ctx, {
      adminUserId: userId,
      action: "guide.restore_revision",
      targetType: "guidePage",
      targetId: String(guideId),
      payload: { revisionId: String(revisionId), restoredVersion: revision.version },
    });
    await writeGuideAuditLog(ctx, {
      guideId,
      action: "restore_revision",
      resourceType: "guide",
      resourceId: String(guideId),
      userId,
      metadata: { revisionId: String(revisionId), restoredVersion: revision.version },
    });

    return guideId;
  },
});

export const addRedirect = mutation({
  args: {
    from: v.string(),
    to: v.string(),
    statusCode: v.union(v.literal(301), v.literal(302)),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { from, to, statusCode, reason }) => {
    const userId = await requireGuideAdmin(ctx);
    const normalizedFrom = normalizeRedirectPath(from);
    const normalizedTo = normalizeRedirectPath(to);

    const existing = await ctx.db
      .query("redirects")
      .withIndex("by_from", (q) => q.eq("from", normalizedFrom))
      .unique();

    if (existing) {
      throw new Error(`Redirect already exists for ${normalizedFrom}`);
    }

    const redirectId = await ctx.db.insert("redirects", {
      from: normalizedFrom,
      to: normalizedTo,
      statusCode,
      reason: reason?.trim() || undefined,
      createdBy: userId,
      createdAt: Date.now(),
    });

    await writeAuditLog(ctx, {
      adminUserId: userId,
      action: "guide_redirect.create",
      targetType: "redirect",
      targetId: String(redirectId),
      payload: { from: normalizedFrom, to: normalizedTo, statusCode },
      reason,
    });
    await writeGuideAuditLog(ctx, {
      action: "redirect_create",
      resourceType: "redirect",
      resourceId: String(redirectId),
      userId,
      metadata: { from: normalizedFrom, to: normalizedTo, statusCode, reason },
    });

    return redirectId;
  },
});

export const deleteRedirect = mutation({
  args: {
    id: v.id("redirects"),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireGuideAdmin(ctx);
    const redirect = await ctx.db.get(id);
    if (!redirect) {
      throw new Error("Redirect not found");
    }

    await ctx.db.delete(id);

    await writeAuditLog(ctx, {
      adminUserId: userId,
      action: "guide_redirect.delete",
      targetType: "redirect",
      targetId: String(id),
      payload: {
        from: redirect.from,
        to: redirect.to,
        statusCode: redirect.statusCode,
      },
      reason: redirect.reason,
    });
    await writeGuideAuditLog(ctx, {
      action: "redirect_delete",
      resourceType: "redirect",
      resourceId: String(id),
      userId,
      metadata: {
        from: redirect.from,
        to: redirect.to,
        statusCode: redirect.statusCode,
        reason: redirect.reason,
      },
    });

    return id;
  },
});

export const changeSlug = mutation({
  args: {
    id: v.id("guidePages"),
    slug: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, slug, reason }) => {
    const userId = await requireGuideAdmin(ctx);
    const guide = await ctx.db.get(id);
    if (!guide) {
      throw new Error("Guide not found");
    }

    const nextSlug = normalizeGuideSlug(slug);
    if (nextSlug === guide.slug) {
      return id;
    }

    await assertGuideSlugAvailable(ctx, nextSlug, id);
    const nextPath = buildGuidePath(nextSlug);
    const now = Date.now();

    await ctx.db.patch(id, {
      slug: nextSlug,
      path: nextPath,
      updatedAt: now,
      updatedBy: userId,
      version: guide.version + 1,
    });

    if (guide.status === "published") {
      const existingRedirect = await ctx.db
        .query("redirects")
        .withIndex("by_from", (q) => q.eq("from", guide.path))
        .unique();

      if (!existingRedirect) {
        await ctx.db.insert("redirects", {
          from: guide.path,
          to: nextPath,
          statusCode: 301,
          reason: reason ?? `Auto-created: slug changed from ${guide.slug}`,
          createdBy: userId,
          createdAt: now,
        });
      }
    }

    const updatedGuide = await ctx.db.get(id);
    if (!updatedGuide) {
      throw new Error("Guide slug change failed");
    }

    await saveGuideRevision(ctx, updatedGuide, userId);
    await writeAuditLog(ctx, {
      adminUserId: userId,
      action: "guide.change_slug",
      targetType: "guidePage",
      targetId: String(id),
      payload: {
        from: guide.slug,
        to: nextSlug,
        redirectCreated: guide.status === "published",
      },
      reason,
    });
    await writeGuideAuditLog(ctx, {
      guideId: id,
      action: "slug_change",
      resourceType: "guide",
      resourceId: String(id),
      userId,
      fieldChanges: [{ field: "slug", oldValue: guide.slug, newValue: nextSlug }],
      metadata: {
        fromPath: guide.path,
        toPath: nextPath,
        redirectCreated: guide.status === "published",
        reason,
      },
    });

    return id;
  },
});

export const importGuide = internalMutation({
  args: {
    slug: v.string(),
    path: v.string(),
    cluster: v.string(),
    backlogOrder: v.optional(v.number()),
    importStatus: v.optional(v.string()),
    importNotes: v.optional(v.string()),
    pageTitle: guideEditableFields.pageTitle,
    h1: guideEditableFields.h1,
    metaTitle: guideEditableFields.metaTitle,
    metaDescription: guideEditableFields.metaDescription,
    pageBrief: guideEditableFields.pageBrief,
    body: v.optional(guideEditableFields.body),
    faqs: v.optional(guideEditableFields.faqs),
    quickAnswer: v.optional(guideEditableFields.quickAnswer),
    libraryBody: v.optional(guideEditableFields.libraryBody),
    heroImageFileName: v.optional(v.string()),
    heroImagePublicPath: v.optional(v.string()),
    relatedGuidePaths: v.optional(v.array(v.string())),
    relatedKeywords: v.optional(v.array(v.string())),
    seoHints: v.optional(guideSeoHintsValidator),
    primaryCtaTarget: v.optional(v.string()),
    primaryCtaLabel: v.optional(guideEditableFields.primaryCtaLabel),
    relatedGuides: v.optional(v.array(v.string())),
    robotsIndex: v.boolean(),
    tableOfContents: v.boolean(),
    publishedAt: v.number(),
    lastUpdatedAt: v.number(),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("in_review"),
        v.literal("published"),
        v.literal("unpublished")
      )
    ),
    overwrite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return importGuideRecord(ctx, args);
  },
});

export const importGuideFromAdmin = mutation({
  args: {
    slug: v.string(),
    path: v.string(),
    cluster: v.string(),
    backlogOrder: v.optional(v.number()),
    importStatus: v.optional(v.string()),
    importNotes: v.optional(v.string()),
    pageTitle: guideEditableFields.pageTitle,
    h1: guideEditableFields.h1,
    metaTitle: guideEditableFields.metaTitle,
    metaDescription: guideEditableFields.metaDescription,
    pageBrief: guideEditableFields.pageBrief,
    body: v.optional(guideEditableFields.body),
    faqs: v.optional(guideEditableFields.faqs),
    quickAnswer: v.optional(guideEditableFields.quickAnswer),
    libraryBody: v.optional(guideEditableFields.libraryBody),
    heroImageFileName: v.optional(v.string()),
    heroImagePublicPath: v.optional(v.string()),
    relatedGuidePaths: v.optional(v.array(v.string())),
    relatedKeywords: v.optional(v.array(v.string())),
    seoHints: v.optional(guideSeoHintsValidator),
    primaryCtaTarget: v.optional(v.string()),
    primaryCtaLabel: v.optional(guideEditableFields.primaryCtaLabel),
    relatedGuides: v.optional(v.array(v.string())),
    robotsIndex: v.boolean(),
    tableOfContents: v.boolean(),
    publishedAt: v.number(),
    lastUpdatedAt: v.number(),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("in_review"),
        v.literal("published"),
        v.literal("unpublished")
      )
    ),
    overwrite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireGuideAdmin(ctx);
    return importGuideRecord(ctx, args);
  },
});

async function importGuideRecord(
  ctx: any,
  args: any
) {
  const existing = await ctx.db
    .query("guidePages")
    .withIndex("by_slug", (q: any) => q.eq("slug", normalizeGuideSlug(args.slug)))
    .unique();

  const now = Date.now();
  const baseRecord = {
    ...buildGuideRecordFromArgs({
      slug: normalizeGuideSlug(args.slug),
      path: args.path,
      cluster: args.cluster,
      backlogOrder: args.backlogOrder,
      importStatus: args.importStatus,
      importNotes: args.importNotes,
      status: args.status ?? "published",
      pageTitle: args.pageTitle,
      h1: args.h1,
      metaTitle: args.metaTitle,
      metaDescription: args.metaDescription,
      pageBrief: args.pageBrief,
      body:
        args.body ??
        ({
          en: [],
          nl: [],
        } as const),
      faqs: args.faqs,
      quickAnswer: args.quickAnswer,
      libraryBody: args.libraryBody,
      heroImageFileName: args.heroImageFileName,
      heroImagePublicPath: args.heroImagePublicPath,
      relatedGuidePaths: args.relatedGuidePaths,
      relatedKeywords: args.relatedKeywords,
      seoHints: args.seoHints,
      robotsIndex: args.robotsIndex,
      relatedGuides: args.relatedGuides,
      primaryCtaTarget: args.primaryCtaTarget,
      primaryCtaLabel: args.primaryCtaLabel,
      tableOfContents: args.tableOfContents,
      publishedAt: (args.status ?? "published") === "published" ? args.publishedAt : undefined,
      lastUpdatedAt: args.lastUpdatedAt,
    }),
    updatedAt: now,
    updatedBy: "import-json" as const,
  };

  if (existing) {
    if (!args.overwrite) {
      return {
        outcome: "skipped" as const,
        id: existing._id,
        slug: existing.slug,
      };
    }

    await ctx.db.patch(existing._id, {
      ...baseRecord,
      version: existing.version + 1,
    });

    return {
      outcome: "updated" as const,
      id: existing._id,
      slug: normalizeGuideSlug(args.slug),
    };
  }

  const guideId = await ctx.db.insert("guidePages", {
    ...baseRecord,
    createdAt: now,
    createdBy: "import-json",
    version: 1,
  });

  return {
    outcome: "created" as const,
    id: guideId,
    slug: normalizeGuideSlug(args.slug),
  };
}
