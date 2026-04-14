import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalQuery, query } from "../_generated/server";
import {
  paginateInMemory,
  requireGuideAdmin,
  requireGuideEditor,
  sortGuidesByUpdatedAtDesc,
} from "./shared";

function readLocalizedField(
  value: { en?: string | null; nl?: string | null } | undefined,
  locale: "en" | "nl"
) {
  return value?.[locale] ?? "";
}

export const getPublishedGuide = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const guide = await ctx.db
      .query("guidePages")
      .withIndex("by_slug", (q) => q.eq("slug", slug.trim().toLowerCase()))
      .unique();

    if (!guide || guide.status !== "published" || guide.deletedAt) {
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

    return sortGuidesByUpdatedAtDesc(
      guides.filter((guide) => guide.deletedAt === undefined)
    );
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
    search: v.optional(v.string()),
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
    authorId: v.optional(v.id("users")),
    includeDeleted: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireGuideEditor(ctx);

    let guides = await ctx.db.query("guidePages").collect();
    if (!args.includeDeleted) {
      guides = guides.filter((guide) => guide.deletedAt === undefined);
    }
    if (args.status) {
      guides = guides.filter((guide) => guide.status === args.status);
    }
    if (args.cluster) {
      guides = guides.filter((guide) => guide.cluster === args.cluster);
    }
    if (args.authorId) {
      guides = guides.filter((guide) => guide.author === args.authorId);
    }

    const search = args.search?.trim().toLowerCase();
    if (search) {
      guides = guides.filter((guide) => {
        const haystacks = [
          guide.slug,
          guide.cluster,
          guide.pageTitle?.en,
          guide.pageTitle?.nl,
          guide.h1?.en,
          guide.h1?.nl,
          guide.metaTitle?.en,
          guide.metaTitle?.nl,
        ];
        return haystacks.some(
          (value) => typeof value === "string" && value.toLowerCase().includes(search)
        );
      });
    }

    const userIds = Array.from(
      new Set(guides.map((guide) => guide.author).filter(Boolean))
    );
    const users = await Promise.all(
      userIds.map(async (userId) => ({
        userId,
        user: userId ? await ctx.db.get(userId) : null,
      }))
    );
    const userMap = new Map(users.map(({ userId, user }) => [userId, user]));

    const rows = sortGuidesByUpdatedAtDesc(guides).map((guide) => ({
      ...guide,
      authorDetail: guide.author
        ? {
            _id: guide.author,
            displayName:
              userMap.get(guide.author)?.displayName ??
              userMap.get(guide.author)?.name ??
              userMap.get(guide.author)?.email ??
              "Unknown",
            email: userMap.get(guide.author)?.email ?? "",
            adminRole: userMap.get(guide.author)?.adminRole ?? undefined,
          }
        : null,
      localized: args.locale
        ? {
            pageTitle: readLocalizedField(guide.pageTitle, args.locale),
            h1: readLocalizedField(guide.h1, args.locale),
            metaTitle: readLocalizedField(guide.metaTitle, args.locale),
            metaDescription: readLocalizedField(guide.metaDescription, args.locale),
            pageBrief: readLocalizedField(guide.pageBrief, args.locale),
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

export const getGuideAdminFormOptions = query({
  args: {},
  handler: async (ctx) => {
    await requireGuideEditor(ctx);

    const [users, guides] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("guidePages").collect(),
    ]);

    const authorOptions = users
      .filter((user) => user.adminRole !== undefined)
      .map((user) => ({
        _id: user._id,
        label: user.displayName ?? user.name ?? user.email ?? "Unknown",
        email: user.email ?? "",
        adminRole: user.adminRole ?? "",
      }))
      .sort((left, right) => left.label.localeCompare(right.label));

    const relatedGuideOptions = sortGuidesByUpdatedAtDesc(
      guides.filter((guide) => guide.deletedAt === undefined)
    ).map((guide) => ({
      _id: guide._id,
      slug: guide.slug,
      status: guide.status,
      pageTitle: {
        en: guide.pageTitle?.en ?? "",
        nl: guide.pageTitle?.nl ?? "",
      },
    }));

    return {
      authorOptions,
      relatedGuideOptions,
    };
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

export const getGuideRevisions = query({
  args: {
    guideId: v.id("guidePages"),
  },
  handler: async (ctx, { guideId }) => {
    await requireGuideEditor(ctx);
    const rows = await ctx.db
      .query("guideRevisions")
      .withIndex("by_guideId", (q) => q.eq("guideId", guideId))
      .collect();

    const sortedRows = rows.sort((a, b) => b.savedAt - a.savedAt).slice(0, 50);
    const users = await Promise.all(
      sortedRows.map(async (row) => ({
        userId: row.savedBy,
        user: await ctx.db.get(row.savedBy),
      }))
    );
    const userMap = new Map(users.map(({ userId, user }) => [userId, user]));

    return sortedRows.map((row) => ({
      ...row,
      savedByDetail: {
        _id: row.savedBy,
        displayName:
          userMap.get(row.savedBy)?.displayName ??
          userMap.get(row.savedBy)?.name ??
          userMap.get(row.savedBy)?.email ??
          "Unknown",
        email: userMap.get(row.savedBy)?.email ?? "",
      },
    }));
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
