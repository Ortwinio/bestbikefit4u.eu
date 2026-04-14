import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { writeAuditLog } from "../admin/audit";
import { buildGuideFieldChanges, writeGuideAuditLog } from "./audit";
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
      slug,
      path: buildGuidePath(slug),
      cluster: args.cluster,
      backlogOrder: args.backlogOrder,
      importStatus: args.importStatus,
      importNotes: args.importNotes,
      status: "draft",
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
      heroImagePublicPath: args.heroImagePublicPath,
      relatedGuidePaths: cleanStringArray(args.relatedGuidePaths),
      relatedKeywords: cleanStringArray(args.relatedKeywords),
      seoHints: args.seoHints,
      featuredImageUrl: args.featuredImageUrl,
      featuredImageAlt: args.featuredImageAlt,
      canonicalUrl: args.canonicalUrl,
      ogTitle: args.ogTitle,
      ogDescription: args.ogDescription,
      ogImageUrl: args.ogImageUrl,
      ogImageAlt: args.ogImageAlt,
      robotsIndex: args.robotsIndex,
      author: args.author,
      tags: cleanStringArray(args.tags),
      relatedGuides: cleanStringArray(args.relatedGuides),
      primaryCtaTarget: args.primaryCtaTarget,
      primaryCtaLabel: args.primaryCtaLabel,
      tableOfContents: args.tableOfContents,
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

    const patch = {
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
        ? { heroImagePublicPath: args.heroImagePublicPath }
        : {}),
      ...(args.relatedGuidePaths !== undefined
        ? { relatedGuidePaths: cleanStringArray(args.relatedGuidePaths) }
        : {}),
      ...(args.relatedKeywords !== undefined
        ? { relatedKeywords: cleanStringArray(args.relatedKeywords) }
        : {}),
      ...(args.seoHints !== undefined ? { seoHints: args.seoHints } : {}),
      ...(args.featuredImageUrl !== undefined
        ? { featuredImageUrl: args.featuredImageUrl }
        : {}),
      ...(args.featuredImageAlt !== undefined
        ? { featuredImageAlt: args.featuredImageAlt }
        : {}),
      ...(args.canonicalUrl !== undefined ? { canonicalUrl: args.canonicalUrl } : {}),
      ...(args.ogTitle !== undefined ? { ogTitle: args.ogTitle } : {}),
      ...(args.ogDescription !== undefined
        ? { ogDescription: args.ogDescription }
        : {}),
      ...(args.ogImageUrl !== undefined ? { ogImageUrl: args.ogImageUrl } : {}),
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

    if (!guide.h1.en.trim() || !guide.h1.nl.trim()) {
      throw new Error("H1 is required in English and Dutch before publishing");
    }

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
    overwrite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("guidePages")
      .withIndex("by_slug", (q) => q.eq("slug", normalizeGuideSlug(args.slug)))
      .unique();

    const now = Date.now();
    const baseRecord = {
      slug: normalizeGuideSlug(args.slug),
      path: args.path,
      cluster: args.cluster,
      backlogOrder: args.backlogOrder,
      importStatus: args.importStatus,
      importNotes: args.importNotes,
      status: "published" as const,
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
      relatedGuidePaths: cleanStringArray(args.relatedGuidePaths),
      relatedKeywords: cleanStringArray(args.relatedKeywords),
      seoHints: args.seoHints,
      featuredImageUrl: undefined,
      featuredImageAlt: undefined,
      canonicalUrl: undefined,
      ogTitle: undefined,
      ogDescription: undefined,
      ogImageUrl: undefined,
      ogImageAlt: undefined,
      robotsIndex: args.robotsIndex,
      author: undefined,
      tags: undefined,
      relatedGuides: cleanStringArray(args.relatedGuides),
      primaryCtaTarget: args.primaryCtaTarget,
      primaryCtaLabel: args.primaryCtaLabel,
      tableOfContents: args.tableOfContents,
      publishedAt: args.publishedAt,
      lastUpdatedAt: args.lastUpdatedAt,
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
  },
});
