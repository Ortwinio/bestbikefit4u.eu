import { api } from "../../../../convex/_generated/api";
import type { FunctionReference } from "convex/server";

export type LocaleKey = "en" | "nl";
export type BlogStatus = "draft" | "published";
export type BlogTab = "content" | "seo" | "publishing" | "history";
export type BilingualText = { en: string; nl: string };

export type BlogPostRecord = {
  _id: string;
  slug: string;
  status: BlogStatus;
  title: BilingualText;
  h1?: BilingualText;
  body: BilingualText;
  excerpt?: BilingualText;
  category: string;
  tags?: string[];
  featuredImageUrl?: string;
  featuredImageAlt?: BilingualText;
  authorName?: string;
  author?: string;
  publishedAt?: number;
  updatedAt: number;
  createdAt: number;
  version: number;
  metaTitle: BilingualText;
  metaDescription: BilingualText;
  canonicalUrl?: string;
  ogTitle?: BilingualText;
  ogDescription?: BilingualText;
  ogImageUrl?: string;
  ogImageAlt?: BilingualText;
  robotsIndex: boolean;
  relatedPostSlugs?: string[];
  relatedGuidePaths?: string[];
  tableOfContents: boolean;
};

export type BlogRevisionRecord = {
  _id: string;
  postId: string;
  version: number;
  savedBy: string;
  savedByDetail?: {
    displayName?: string;
    email?: string;
  };
  savedAt: number;
};

export type BlogPostPayload = {
  slug: string;
  title: BilingualText;
  h1?: BilingualText;
  body: BilingualText;
  excerpt?: BilingualText;
  category: string;
  tags?: string[];
  featuredImageUrl?: string;
  featuredImageAlt?: BilingualText;
  authorName?: string;
  metaTitle: BilingualText;
  metaDescription: BilingualText;
  canonicalUrl?: string;
  ogTitle?: BilingualText;
  ogDescription?: BilingualText;
  ogImageUrl?: string;
  ogImageAlt?: BilingualText;
  robotsIndex: boolean;
  relatedPostSlugs?: string[];
  relatedGuidePaths?: string[];
  tableOfContents: boolean;
};

type BlogApi = {
  queries: {
    listAllPosts: FunctionReference<"query">;
    getDraftPost: FunctionReference<"query">;
    listBlogRevisions: FunctionReference<"query">;
  };
  mutations: {
    createPost: FunctionReference<"mutation">;
    updatePost: FunctionReference<"mutation">;
    publishPost: FunctionReference<"mutation">;
    unpublishPost: FunctionReference<"mutation">;
    deletePost: FunctionReference<"mutation">;
  };
};

export const blogApi = (api as unknown as { blog: BlogApi }).blog;

export const BLOG_CATEGORY_OPTIONS = [
  { value: "bike-fitting", label: "Bike fitting" },
  { value: "training", label: "Training" },
  { value: "gear", label: "Gear" },
  { value: "nutrition", label: "Nutrition" },
  { value: "other", label: "Other" },
] as const;

export const BLOG_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
] as const;

export function emptyText(): BilingualText {
  return { en: "", nl: "" };
}

export function slugifyBlogTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildBlogPreviewPath(slug: string) {
  const normalized = slugifyBlogTitle(slug);
  return normalized ? `bestbikefit4u.eu/blog/${normalized}` : "bestbikefit4u.eu/blog/{slug}";
}

export function formatBlogDate(value?: number | null) {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatBlogDateTime(value?: number | null) {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function blogStatusTone(status: BlogStatus) {
  return status === "published" ? "success" : "neutral";
}

export function formatBlogStatus(status: BlogStatus) {
  return status === "published" ? "Published" : "Draft";
}

export function splitCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinCommaList(value?: string[]) {
  return value?.join(", ") ?? "";
}

export function optionalBilingual(value: BilingualText) {
  return value.en.trim() || value.nl.trim() ? value : undefined;
}
