import { v } from "convex/values";
import { guideEditableFields, normalizeGuideSlug, buildGuidePath } from "./shared";

export const guideRewriteImportFields = {
  ...guideEditableFields,
  slug: v.string(),
  path: v.string(),
  status: v.union(v.literal("draft"), v.literal("in_review"),
    v.literal("published"), v.literal("unpublished")),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.union(v.id("users"), v.literal("import-json")),
  updatedBy: v.union(v.id("users"), v.literal("import-json")),
  version: v.number(),
  publishedAt: v.optional(v.number()),
  lastUpdatedAt: v.optional(v.number()),
};

export const guideRewriteDocumentValidator = v.object(guideRewriteImportFields);

export function assertRewriteIdentity(document: { slug: string; path: string }) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(document.slug)
    || document.slug !== normalizeGuideSlug(document.slug)
    || document.path !== buildGuidePath(document.slug)) {
    throw new Error("Rewrite slug and path must be canonical and match");
  }
}
