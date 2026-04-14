import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalQuery, query } from "../_generated/server";
import {
  paginateInMemory,
  requireGuideAdmin,
  requireGuideEditor,
  sortGuidesByUpdatedAtDesc,
} from "./shared";

export const getPublishedGuide = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const guide = await ctx.db
      .query("guidePages")
      .withIndex("by_slug", (q) => q.eq("slug", slug.trim().toLowerCase()))
      .unique();

    if (!guide || guide.status !== "published") {
      return null;
    }

    return guide;
  },
});

export const listPublishedGuides = query({
  args: {},
  handler: async (ctx) => {
    const guides = await ctx.db
      .query("guidePages")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    return sortGuidesByUpdatedAtDesc(guides);
  },
});

export const listPublicRedirects = query({
  args: {},
  handler: async (ctx) => {
    const redirects = await ctx.db.query("redirects").collect();
    return redirects.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getDraftGuide = query({
  args: {
    id: v.id("guidePages"),
  },
  handler: async (ctx, { id }) => {
    await requireGuideEditor(ctx);
    return await ctx.db.get(id);
  },
});

export const listGuides = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("in_review"),
        v.literal("published"),
        v.literal("unpublished")
      )
    ),
    cluster: v.optional(v.string()),
    locale: v.optional(v.union(v.literal("en"), v.literal("nl"))),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireGuideEditor(ctx);

    let guides = await ctx.db.query("guidePages").collect();
    if (args.status) {
      guides = guides.filter((guide) => guide.status === args.status);
    }
    if (args.cluster) {
      guides = guides.filter((guide) => guide.cluster === args.cluster);
    }

    const rows = sortGuidesByUpdatedAtDesc(guides).map((guide) => ({
      ...guide,
      localized: args.locale
        ? {
            pageTitle: guide.pageTitle[args.locale],
            h1: guide.h1[args.locale],
            metaTitle: guide.metaTitle[args.locale],
            metaDescription: guide.metaDescription[args.locale],
            pageBrief: guide.pageBrief[args.locale],
          }
        : undefined,
    }));

    return paginateInMemory(rows, args.paginationOpts);
  },
});

export const getGuideBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    await requireGuideEditor(ctx);
    return await ctx.db
      .query("guidePages")
      .withIndex("by_slug", (q) => q.eq("slug", slug.trim().toLowerCase()))
      .unique();
  },
});

export const listRedirects = query({
  args: {},
  handler: async (ctx) => {
    await requireGuideAdmin(ctx);
    const redirects = await ctx.db.query("redirects").collect();
    return redirects.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getGuideAuditLog = query({
  args: {
    guideId: v.id("guidePages"),
  },
  handler: async (ctx, { guideId }) => {
    await requireGuideAdmin(ctx);
    const rows = await ctx.db
      .query("guideAuditLog")
      .withIndex("by_guideId", (q) => q.eq("guideId", guideId))
      .collect();

    return rows.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
  },
});

export const getGuideImportRecord = internalQuery({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("guidePages")
      .withIndex("by_slug", (q) => q.eq("slug", slug.trim().toLowerCase()))
      .unique();
  },
});
