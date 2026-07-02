import { v } from "convex/values";
import { query } from "../_generated/server";
import {
  normalizeBlogSlug,
  paginateInMemory,
  requireBlogEditor,
  sortPostsByPublishedAtDesc,
  sortPostsByUpdatedAtDesc,
} from "./shared";

export const listPublishedPosts = query({
  args: {
    category: v.optional(v.string()),
    cursor: v.optional(v.union(v.string(), v.null())),
    numItems: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
      .collect();

    const category = args.category?.trim();
    if (category) {
      posts = posts.filter((post) => post.category === category);
    }

    return paginateInMemory(
      sortPostsByPublishedAtDesc(posts),
      args.cursor,
      args.numItems
    );
  },
});

export const getPublishedPost = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", normalizeBlogSlug(slug)))
      .unique();

    if (!post || post.status !== "published") {
      return null;
    }

    return post;
  },
});

export const listAllPosts = query({
  args: {
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBlogEditor(ctx);

    let posts = await ctx.db.query("blogPosts").collect();
    if (args.status) {
      posts = posts.filter((post) => post.status === args.status);
    }

    const category = args.category?.trim();
    if (category) {
      posts = posts.filter((post) => post.category === category);
    }

    return sortPostsByUpdatedAtDesc(posts);
  },
});

export const getDraftPost = query({
  args: {
    id: v.id("blogPosts"),
  },
  handler: async (ctx, { id }) => {
    await requireBlogEditor(ctx);
    return await ctx.db.get(id);
  },
});

export const listBlogRevisions = query({
  args: {
    postId: v.id("blogPosts"),
  },
  handler: async (ctx, { postId }) => {
    await requireBlogEditor(ctx);

    const rows = await ctx.db
      .query("blogRevisions")
      .withIndex("by_postId", (q) => q.eq("postId", postId))
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

export const listPublishedSlugs = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
      .collect();

    return sortPostsByPublishedAtDesc(posts).map((post) => ({
      slug: post.slug,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
    }));
  },
});
