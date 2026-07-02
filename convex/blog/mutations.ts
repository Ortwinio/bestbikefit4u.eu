import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import {
  assertBlogSlugAvailable,
  blogPostEditableFields,
  normalizeBlogSlug,
  requireBlogAdmin,
  requireBlogEditor,
  saveBlogRevision,
} from "./shared";

function cleanOptionalString(value: string | undefined | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function cleanRequiredString(value: string, fieldName: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldName} is required`);
  }
  return trimmed;
}

function cleanStringArray(values: string[] | undefined) {
  return values?.map((value) => value.trim()).filter(Boolean);
}

type BilingualString = {
  en: string;
  nl: string;
};

type BlogPostEditableInput = {
  title: BilingualString;
  h1?: BilingualString;
  body: BilingualString;
  excerpt?: BilingualString;
  category: string;
  tags?: string[];
  featuredImageUrl?: string;
  featuredImageAlt?: BilingualString;
  authorName?: string;
  author?: Id<"users">;
  metaTitle: BilingualString;
  metaDescription: BilingualString;
  canonicalUrl?: string;
  ogTitle?: BilingualString;
  ogDescription?: BilingualString;
  ogImageUrl?: string;
  ogImageAlt?: BilingualString;
  robotsIndex: boolean;
  relatedPostSlugs?: string[];
  relatedGuidePaths?: string[];
  tableOfContents: boolean;
};

function cleanBlogPostFields(args: BlogPostEditableInput) {
  return {
    title: args.title,
    h1: args.h1,
    body: args.body,
    excerpt: args.excerpt,
    category: cleanRequiredString(args.category, "Category"),
    tags: cleanStringArray(args.tags),
    featuredImageUrl: cleanOptionalString(args.featuredImageUrl),
    featuredImageAlt: args.featuredImageAlt,
    authorName: cleanOptionalString(args.authorName),
    author: args.author,
    metaTitle: args.metaTitle,
    metaDescription: args.metaDescription,
    canonicalUrl: cleanOptionalString(args.canonicalUrl),
    ogTitle: args.ogTitle,
    ogDescription: args.ogDescription,
    ogImageUrl: cleanOptionalString(args.ogImageUrl),
    ogImageAlt: args.ogImageAlt,
    robotsIndex: args.robotsIndex,
    relatedPostSlugs: cleanStringArray(args.relatedPostSlugs)?.map(normalizeBlogSlug),
    relatedGuidePaths: cleanStringArray(args.relatedGuidePaths),
    tableOfContents: args.tableOfContents,
  };
}

function assertPostReadyToPublish(post: {
  slug: string;
  title?: { en?: string; nl?: string };
  body?: { en?: string; nl?: string };
  metaTitle?: { en?: string; nl?: string };
  metaDescription?: { en?: string; nl?: string };
  featuredImageUrl?: string | null;
  featuredImageAlt?: { en?: string; nl?: string };
}) {
  const hasLocalizedText = (
    field: { en?: string; nl?: string } | undefined,
    locale: "en" | "nl"
  ) => typeof field?.[locale] === "string" && field[locale].trim().length > 0;

  if (!post.slug.trim()) {
    throw new Error("Blog post slug is required before publishing");
  }

  for (const locale of ["en", "nl"] as const) {
    if (
      !hasLocalizedText(post.title, locale) ||
      !hasLocalizedText(post.body, locale) ||
      !hasLocalizedText(post.metaTitle, locale) ||
      !hasLocalizedText(post.metaDescription, locale)
    ) {
      throw new Error("English and Dutch title, body, and SEO fields are required before publishing");
    }
  }

  if (
    post.featuredImageUrl &&
    (!hasLocalizedText(post.featuredImageAlt, "en") ||
      !hasLocalizedText(post.featuredImageAlt, "nl"))
  ) {
    throw new Error("Published posts with a featured image require English and Dutch alt text");
  }
}

export const createPost = mutation({
  args: {
    slug: v.string(),
    ...blogPostEditableFields,
  },
  handler: async (ctx, args) => {
    const userId = await requireBlogEditor(ctx);
    const slug = normalizeBlogSlug(args.slug);
    if (!slug) {
      throw new Error("Blog post slug is required");
    }

    await assertBlogSlugAvailable(ctx, slug);

    const now = Date.now();
    const postId = await ctx.db.insert("blogPosts", {
      slug,
      status: "draft",
      ...cleanBlogPostFields(args),
      createdAt: now,
      updatedAt: now,
      version: 1,
    });

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Blog post creation failed");
    }

    await saveBlogRevision(ctx, post, userId);
    return postId;
  },
});

export const updatePost = mutation({
  args: {
    id: v.id("blogPosts"),
    slug: v.optional(v.string()),
    title: v.optional(blogPostEditableFields.title),
    h1: blogPostEditableFields.h1,
    body: v.optional(blogPostEditableFields.body),
    excerpt: blogPostEditableFields.excerpt,
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    featuredImageUrl: v.optional(v.string()),
    featuredImageAlt: blogPostEditableFields.featuredImageAlt,
    authorName: v.optional(v.string()),
    author: v.optional(v.id("users")),
    metaTitle: v.optional(blogPostEditableFields.metaTitle),
    metaDescription: v.optional(blogPostEditableFields.metaDescription),
    canonicalUrl: v.optional(v.string()),
    ogTitle: blogPostEditableFields.ogTitle,
    ogDescription: blogPostEditableFields.ogDescription,
    ogImageUrl: v.optional(v.string()),
    ogImageAlt: blogPostEditableFields.ogImageAlt,
    robotsIndex: v.optional(v.boolean()),
    relatedPostSlugs: v.optional(v.array(v.string())),
    relatedGuidePaths: v.optional(v.array(v.string())),
    tableOfContents: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireBlogEditor(ctx);
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Blog post not found");
    }

    let slugPatch: { slug: string } | undefined;
    if (args.slug !== undefined) {
      const nextSlug = normalizeBlogSlug(args.slug);
      if (!nextSlug) {
        throw new Error("Blog post slug is required");
      }
      if (nextSlug !== post.slug) {
        await assertBlogSlugAvailable(ctx, nextSlug, args.id);
      }
      slugPatch = { slug: nextSlug };
    }

    const patch = {
      ...slugPatch,
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.h1 !== undefined ? { h1: args.h1 } : {}),
      ...(args.body !== undefined ? { body: args.body } : {}),
      ...(args.excerpt !== undefined ? { excerpt: args.excerpt } : {}),
      ...(args.category !== undefined
        ? { category: cleanRequiredString(args.category, "Category") }
        : {}),
      ...(args.tags !== undefined ? { tags: cleanStringArray(args.tags) } : {}),
      ...(args.featuredImageUrl !== undefined
        ? { featuredImageUrl: cleanOptionalString(args.featuredImageUrl) }
        : {}),
      ...(args.featuredImageAlt !== undefined
        ? { featuredImageAlt: args.featuredImageAlt }
        : {}),
      ...(args.authorName !== undefined
        ? { authorName: cleanOptionalString(args.authorName) }
        : {}),
      ...(args.author !== undefined ? { author: args.author } : {}),
      ...(args.metaTitle !== undefined ? { metaTitle: args.metaTitle } : {}),
      ...(args.metaDescription !== undefined
        ? { metaDescription: args.metaDescription }
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
      ...(args.relatedPostSlugs !== undefined
        ? { relatedPostSlugs: cleanStringArray(args.relatedPostSlugs)?.map(normalizeBlogSlug) }
        : {}),
      ...(args.relatedGuidePaths !== undefined
        ? { relatedGuidePaths: cleanStringArray(args.relatedGuidePaths) }
        : {}),
      ...(args.tableOfContents !== undefined
        ? { tableOfContents: args.tableOfContents }
        : {}),
      updatedAt: Date.now(),
      version: post.version + 1,
    };

    await ctx.db.patch(args.id, patch);
    const updatedPost = await ctx.db.get(args.id);
    if (!updatedPost) {
      throw new Error("Blog post update failed");
    }

    await saveBlogRevision(ctx, updatedPost, userId);
    return updatedPost._id;
  },
});

export const publishPost = mutation({
  args: {
    id: v.id("blogPosts"),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireBlogAdmin(ctx);
    const post = await ctx.db.get(id);
    if (!post) {
      throw new Error("Blog post not found");
    }

    assertPostReadyToPublish(post);

    const now = Date.now();
    await ctx.db.patch(id, {
      status: "published",
      publishedAt: post.publishedAt ?? now,
      updatedAt: now,
      version: post.version + 1,
    });

    const updatedPost = await ctx.db.get(id);
    if (!updatedPost) {
      throw new Error("Blog post publish failed");
    }

    await saveBlogRevision(ctx, updatedPost, userId);
    return id;
  },
});

export const unpublishPost = mutation({
  args: {
    id: v.id("blogPosts"),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireBlogAdmin(ctx);
    const post = await ctx.db.get(id);
    if (!post) {
      throw new Error("Blog post not found");
    }

    await ctx.db.patch(id, {
      status: "draft",
      updatedAt: Date.now(),
      version: post.version + 1,
    });

    const updatedPost = await ctx.db.get(id);
    if (!updatedPost) {
      throw new Error("Blog post unpublish failed");
    }

    await saveBlogRevision(ctx, updatedPost, userId);
    return id;
  },
});

export const deletePost = mutation({
  args: {
    id: v.id("blogPosts"),
  },
  handler: async (ctx, { id }) => {
    await requireBlogAdmin(ctx);
    const post = await ctx.db.get(id);
    if (!post) {
      throw new Error("Blog post not found");
    }
    if (post.status === "published") {
      throw new Error("Published blog posts must be unpublished before deletion");
    }

    const revisions = await ctx.db
      .query("blogRevisions")
      .withIndex("by_postId", (q) => q.eq("postId", id))
      .collect();

    for (const revision of revisions) {
      await ctx.db.delete(revision._id);
    }
    await ctx.db.delete(id);

    return id;
  },
});
