import "server-only";

import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import type { Locale } from "@/i18n/config";

export type BlogPost = {
  _id?: string;
  slug: string;
  status?: "draft" | "published";
  title: Record<Locale, string>;
  h1?: Partial<Record<Locale, string>>;
  body: Record<Locale, string>;
  excerpt?: Partial<Record<Locale, string>>;
  category: string;
  tags?: string[];
  featuredImageUrl?: string;
  featuredImageAlt?: Partial<Record<Locale, string>>;
  authorName?: string;
  publishedAt?: number;
  updatedAt: number;
  createdAt?: number;
  metaTitle: Record<Locale, string>;
  metaDescription: Record<Locale, string>;
  canonicalUrl?: string;
  ogTitle?: Partial<Record<Locale, string>>;
  ogDescription?: Partial<Record<Locale, string>>;
  ogImageUrl?: string;
  ogImageAlt?: Partial<Record<Locale, string>>;
  robotsIndex?: boolean;
  relatedPostSlugs?: string[];
  relatedGuidePaths?: string[];
  tableOfContents?: boolean;
};

export type BlogPostSummary = Pick<
  BlogPost,
  | "slug"
  | "title"
  | "excerpt"
  | "category"
  | "featuredImageUrl"
  | "featuredImageAlt"
  | "publishedAt"
  | "updatedAt"
  | "relatedGuidePaths"
>;

type BlogQueryApi = {
  blog?: {
    queries?: {
      getPublishedPost?: unknown;
      listPublishedPosts?: unknown;
      listPublishedSlugs?: unknown;
    };
  };
};

type PublishedPostsResult =
  | BlogPostSummary[]
  | {
      page?: BlogPostSummary[];
      posts?: BlogPostSummary[];
      isDone?: boolean;
      continueCursor?: string;
    };

function getBlogQueries() {
  return (api as unknown as BlogQueryApi).blog?.queries;
}

async function fetchBlogQuery(
  queryRef: unknown,
  args: Record<string, unknown>
): Promise<unknown> {
  const runFetchQuery = fetchQuery as unknown as (
    query: unknown,
    args: Record<string, unknown>
  ) => Promise<unknown>;

  return runFetchQuery(queryRef, args);
}

function normalizePageResult(result: PublishedPostsResult | null | undefined) {
  if (!result) {
    return { posts: [] as BlogPostSummary[], isDone: true, continueCursor: "" };
  }

  if (Array.isArray(result)) {
    return { posts: result, isDone: true, continueCursor: "" };
  }

  return {
    posts: result.page ?? result.posts ?? [],
    isDone: result.isDone ?? true,
    continueCursor: result.continueCursor ?? "",
  };
}

export function localizeBlogText(
  value: Partial<Record<Locale, string>> | undefined,
  locale: Locale,
  fallback = ""
) {
  return value?.[locale]?.trim() || value?.en?.trim() || value?.nl?.trim() || fallback;
}

export function getBlogCategoryLabel(category: string, locale: Locale) {
  const normalized = category.trim().replace(/[-_]+/g, " ");
  if (!normalized) {
    return locale === "nl" ? "Bikefitting" : "Bike fitting";
  }

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function truncateBlogExcerpt(value: string, maxLength = 160) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

export function formatBlogDate(timestamp: number | undefined, locale: Locale) {
  if (!timestamp) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(timestamp));
}

export async function listPublishedBlogPosts({
  numItems = 50,
  cursor,
  category,
}: {
  numItems?: number;
  cursor?: string | null;
  category?: string;
} = {}) {
  const listPublishedPosts = getBlogQueries()?.listPublishedPosts;
  if (!listPublishedPosts) {
    return { posts: [] as BlogPostSummary[], isDone: true, continueCursor: "" };
  }

  try {
    const result = (await fetchBlogQuery(listPublishedPosts, {
      numItems,
      cursor: cursor ?? null,
      category,
    })) as PublishedPostsResult;
    const normalized = normalizePageResult(result);
    const filtered = category
      ? normalized.posts.filter((post) => post.category === category)
      : normalized.posts;

    return { ...normalized, posts: filtered };
  } catch {
    return { posts: [] as BlogPostSummary[], isDone: true, continueCursor: "" };
  }
}

export async function listAllPublishedBlogPosts() {
  const firstPage = await listPublishedBlogPosts({ numItems: 100 });
  return firstPage.posts;
}

export async function listPublishedBlogSlugs() {
  const listPublishedSlugs = getBlogQueries()?.listPublishedSlugs;
  if (!listPublishedSlugs) {
    return [] as Array<{ slug: string; updatedAt: number; publishedAt?: number }>;
  }

  try {
    return (await fetchBlogQuery(listPublishedSlugs, {})) as Array<{
      slug: string;
      updatedAt: number;
      publishedAt?: number;
    }>;
  } catch {
    return [];
  }
}

export async function getPublishedBlogPost(slug: string) {
  const getPublishedPost = getBlogQueries()?.getPublishedPost;
  if (!getPublishedPost) {
    return null;
  }

  try {
    return (await fetchBlogQuery(getPublishedPost, { slug })) as BlogPost | null;
  } catch {
    return null;
  }
}

export async function listPublishedBlogPostsForGuidePath(path: string) {
  const normalizedPath = path.replace(/^\/(en|nl)(?=\/|$)/, "") || "/";
  const posts = await listAllPublishedBlogPosts();

  return posts.filter((post) =>
    post.relatedGuidePaths?.some((relatedPath) => {
      const normalizedRelatedPath = relatedPath.replace(/^\/(en|nl)(?=\/|$)/, "") || "/";
      return normalizedRelatedPath === normalizedPath;
    })
  );
}
