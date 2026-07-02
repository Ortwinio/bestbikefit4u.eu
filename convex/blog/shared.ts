import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireAdminRole, requireAnyRole, type AdminRole } from "../admin/authz";
import { requireUserId } from "../lib/authz";
import { bilingualStringValidator } from "../guides/shared";

export const blogPostEditableFields = {
  title: bilingualStringValidator,
  h1: v.optional(bilingualStringValidator),
  body: bilingualStringValidator,
  excerpt: v.optional(bilingualStringValidator),
  category: v.string(),
  tags: v.optional(v.array(v.string())),
  featuredImageUrl: v.optional(v.string()),
  featuredImageAlt: v.optional(bilingualStringValidator),
  authorName: v.optional(v.string()),
  author: v.optional(v.id("users")),
  metaTitle: bilingualStringValidator,
  metaDescription: bilingualStringValidator,
  canonicalUrl: v.optional(v.string()),
  ogTitle: v.optional(bilingualStringValidator),
  ogDescription: v.optional(bilingualStringValidator),
  ogImageUrl: v.optional(v.string()),
  ogImageAlt: v.optional(bilingualStringValidator),
  robotsIndex: v.boolean(),
  relatedPostSlugs: v.optional(v.array(v.string())),
  relatedGuidePaths: v.optional(v.array(v.string())),
  tableOfContents: v.boolean(),
} as const;

export const BLOG_EDITOR_ROLES: AdminRole[] = [
  "super_admin",
  "ops_admin",
  "support_admin",
  "fit_specialist",
  "qa_manager",
  "analyst",
];

export const BLOG_ADMIN_ROLES: AdminRole[] = [
  "super_admin",
  "ops_admin",
  "fit_specialist",
  "qa_manager",
];

type DbCtx = QueryCtx | MutationCtx;

export async function requireBlogEditor(ctx: DbCtx): Promise<Id<"users">> {
  await requireUserId(ctx);
  return requireAnyRole(ctx, BLOG_EDITOR_ROLES);
}

export async function requireBlogAdmin(ctx: DbCtx): Promise<Id<"users">> {
  await requireUserId(ctx);
  return requireAdminRole(ctx, BLOG_ADMIN_ROLES);
}

export function normalizeBlogSlug(slug: string) {
  return slug.trim().toLowerCase();
}

export function buildBlogPath(slug: string) {
  return `/blog/${normalizeBlogSlug(slug)}`;
}

export async function assertBlogSlugAvailable(
  ctx: DbCtx,
  slug: string,
  excludePostId?: Id<"blogPosts">
) {
  const existing = await ctx.db
    .query("blogPosts")
    .withIndex("by_slug", (q) => q.eq("slug", normalizeBlogSlug(slug)))
    .unique();

  if (existing && existing._id !== excludePostId) {
    throw new Error(`Blog post slug already exists: ${slug}`);
  }
}

export async function saveBlogRevision(
  ctx: MutationCtx,
  post: Doc<"blogPosts">,
  savedBy: Id<"users">
) {
  await ctx.db.insert("blogRevisions", {
    postId: post._id,
    version: post.version,
    snapshot: post,
    savedBy,
    savedAt: Date.now(),
  });
}

export function sortPostsByPublishedAtDesc(posts: Doc<"blogPosts">[]) {
  return [...posts].sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
}

export function sortPostsByUpdatedAtDesc(posts: Doc<"blogPosts">[]) {
  return [...posts].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function paginateInMemory<T>(
  rows: T[],
  cursor: string | null | undefined,
  numItems: number | undefined
) {
  const start = cursor ? Number.parseInt(cursor, 10) : 0;
  const safeStart = Number.isFinite(start) && start >= 0 ? start : 0;
  const safeNumItems =
    typeof numItems === "number" && Number.isFinite(numItems) && numItems > 0
      ? Math.min(Math.floor(numItems), 100)
      : 20;
  const page = rows.slice(safeStart, safeStart + safeNumItems);
  const nextIndex = safeStart + page.length;

  return {
    page,
    isDone: nextIndex >= rows.length,
    continueCursor: nextIndex < rows.length ? String(nextIndex) : "",
  };
}
