import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import { requireAdminRole, requireAnyRole, type AdminRole } from "../admin/authz";

export const bilingualStringValidator = v.object({
  en: v.string(),
  nl: v.string(),
});

export const guideSectionValidator = v.object({
  title: v.string(),
  type: v.union(
    v.literal("prose"),
    v.literal("steps"),
    v.literal("cards"),
    v.literal("table")
  ),
  items: v.array(v.string()),
  tableHeaders: v.optional(v.array(v.string())),
  tableRows: v.optional(v.array(v.array(v.string()))),
});

export const guideFaqValidator = v.object({
  q: v.string(),
  a: v.string(),
});

export const guideQuickAnswerValidator = v.object({
  keyTakeaway: bilingualStringValidator,
  commonMistake: bilingualStringValidator,
  payAttention: bilingualStringValidator,
});

export const guideSeoHintsValidator = v.object({
  funnel: v.optional(v.string()),
});

export const guideBodyValidator = v.object({
  en: v.array(guideSectionValidator),
  nl: v.array(guideSectionValidator),
});

export const guideFaqsValidator = v.object({
  en: v.array(guideFaqValidator),
  nl: v.array(guideFaqValidator),
});

export const guideEditableFields = {
  cluster: v.string(),
  backlogOrder: v.optional(v.number()),
  importStatus: v.optional(v.string()),
  importNotes: v.optional(v.string()),
  pageTitle: bilingualStringValidator,
  h1: bilingualStringValidator,
  metaTitle: bilingualStringValidator,
  metaDescription: bilingualStringValidator,
  pageBrief: bilingualStringValidator,
  body: guideBodyValidator,
  faqs: v.optional(guideFaqsValidator),
  quickAnswer: v.optional(guideQuickAnswerValidator),
  libraryBody: v.optional(bilingualStringValidator),
  heroImageFileName: v.optional(v.string()),
  heroImagePublicPath: v.optional(v.string()),
  relatedGuidePaths: v.optional(v.array(v.string())),
  relatedKeywords: v.optional(v.array(v.string())),
  seoHints: v.optional(guideSeoHintsValidator),
  featuredImageUrl: v.optional(v.string()),
  featuredImageAlt: v.optional(bilingualStringValidator),
  canonicalUrl: v.optional(v.string()),
  ogTitle: v.optional(bilingualStringValidator),
  ogDescription: v.optional(bilingualStringValidator),
  ogImageUrl: v.optional(v.string()),
  ogImageAlt: v.optional(bilingualStringValidator),
  robotsIndex: v.boolean(),
  author: v.optional(v.id("users")),
  tags: v.optional(v.array(v.string())),
  relatedGuides: v.optional(v.array(v.string())),
  primaryCtaTarget: v.optional(v.string()),
  primaryCtaLabel: v.optional(bilingualStringValidator),
  tableOfContents: v.boolean(),
} as const;

type DbCtx = QueryCtx | MutationCtx;

const GUIDE_EDITOR_ROLES: AdminRole[] = [
  "super_admin",
  "ops_admin",
  "support_admin",
  "fit_specialist",
  "qa_manager",
  "analyst",
];

const GUIDE_ADMIN_ROLES: AdminRole[] = [
  "super_admin",
  "ops_admin",
  "fit_specialist",
  "qa_manager",
];

export async function requireGuideEditor(ctx: DbCtx): Promise<Id<"users">> {
  await requireUserId(ctx);
  return requireAnyRole(ctx, GUIDE_EDITOR_ROLES);
}

export async function requireGuideAdmin(ctx: DbCtx): Promise<Id<"users">> {
  await requireUserId(ctx);
  return requireAdminRole(ctx, GUIDE_ADMIN_ROLES);
}

export function normalizeGuideSlug(slug: string) {
  return slug.trim().toLowerCase();
}

export function buildGuidePath(slug: string) {
  return `/guides/${normalizeGuideSlug(slug)}`;
}

export async function assertGuideSlugAvailable(
  ctx: DbCtx,
  slug: string,
  excludeGuideId?: Id<"guidePages">
) {
  const existing = await ctx.db
    .query("guidePages")
    .withIndex("by_slug", (q) => q.eq("slug", normalizeGuideSlug(slug)))
    .unique();

  if (existing && existing._id !== excludeGuideId) {
    throw new Error(`Guide slug already exists: ${slug}`);
  }
}

export async function saveGuideRevision(
  ctx: MutationCtx,
  guide: Doc<"guidePages">,
  savedBy: Id<"users">
) {
  await ctx.db.insert("guideRevisions", {
    guideId: guide._id,
    version: guide.version,
    snapshot: guide,
    savedBy,
    savedAt: Date.now(),
  });
}

export function sortGuidesByUpdatedAtDesc(
  guides: Doc<"guidePages">[]
) {
  return [...guides].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function paginateInMemory<T>(
  rows: T[],
  paginationOpts: { cursor: string | null; numItems: number }
) {
  const start = paginationOpts.cursor ? Number.parseInt(paginationOpts.cursor, 10) : 0;
  const safeStart = Number.isFinite(start) && start >= 0 ? start : 0;
  const page = rows.slice(safeStart, safeStart + paginationOpts.numItems);
  const nextIndex = safeStart + page.length;

  return {
    page,
    isDone: nextIndex >= rows.length,
    continueCursor: nextIndex < rows.length ? String(nextIndex) : "",
    splitCursor: null,
    pageStatus: null,
  };
}
