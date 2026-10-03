import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { PAIN_PAGE_SLUGS } from "@/content/painPages";
import { listGuideRewrites } from "@/lib/guides/rewrites";
import { getGuideUpdatedDate } from "@/config/authorship";
import { withSitemapTimeout } from "./timeout";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getLocaleRoutePair } from "@/i18n/localeRoutes";
import { getPressureBikeEntries } from "@/lib/seo/programmatic/tirePressure";
import {
  DEFAULT_LOCALE_FOR_X_DEFAULT,
  SITEMAP_SECTION_PATHS,
} from "./config";
import { dedupeAndSortNodes, isCanonicalSitemapPath, isExcludedFromSitemap } from "./filters";
import { normalizeLastmod, normalizePathname, toAbsoluteUrl } from "./normalize";
import type {
  LocalizedPathMap,
  SitemapContentEntry,
  SitemapIndexNode,
  SitemapSection,
  SitemapUrlNode,
} from "./types";

type RouteSeed = {
  id: string;
  path?: string;
  lastmod?: string;
  changefreq?: SitemapContentEntry["changefreq"];
  priority?: number;
  locales?: readonly Locale[];
  localizedPaths?: LocalizedPathMap;
};

type BlogSitemapRow = {
  slug: string;
  updatedAt?: number;
  publishedAt?: number;
};

type GuideSitemapRow = {
  slug: string;
  path: string;
  lastUpdatedAt?: number;
  publishedAt?: number;
  updatedAt?: number;
  createdAt?: number;
  importStatus?: string;
  libraryBody?: { nl?: string; en?: string };
};

type BlogQueryApi = {
  blog?: {
    queries?: {
      listPublishedSlugs?: unknown;
    };
  };
};

async function fetchSitemapQuery(
  queryRef: unknown,
  args: Record<string, unknown>
): Promise<unknown> {
  const runFetchQuery = fetchQuery as unknown as (
    query: unknown,
    args: Record<string, unknown>
  ) => Promise<unknown>;

  return runFetchQuery(queryRef, args);
}

function buildLocalizedPaths(
  pathname: string,
  locales: readonly Locale[] = SUPPORTED_LOCALES
): LocalizedPathMap {
  return Object.fromEntries(
    locales.map((locale) => [locale, withLocalePrefix(pathname, locale)])
  ) as LocalizedPathMap;
}

function toEntry(seed: RouteSeed): SitemapContentEntry {
  const pair = seed.path ? getLocaleRoutePair(seed.path) : undefined;
  const localizedPaths =
    seed.localizedPaths ??
    (pair ? Object.fromEntries(SUPPORTED_LOCALES.map((locale) => [locale, withLocalePrefix(pair[locale], locale)]))
      : seed.path ? buildLocalizedPaths(seed.path, seed.locales) : {});

  return {
    id: seed.id,
    localizedPaths: { ...localizedPaths },
    lastmod: normalizeLastmod(seed.lastmod),
    changefreq: seed.changefreq,
    priority: seed.priority,
  };
}

const PAGE_ROUTE_SEEDS: readonly RouteSeed[] = [
  { id: "author-ortwin-verreck", path: "/authors/ortwin-verreck", lastmod: "2026-10-03",
    changefreq: "monthly", priority: 0.6 },
  { id: "methods", path: "/methods", lastmod: "2026-10-03", changefreq: "monthly", priority: 0.7 },
  { id: "home", path: "/", changefreq: "weekly", priority: 1 },
  {
    id: "bike-fitting",
    path: "/bikefitting",
    changefreq: "weekly",
    priority: 0.9,
  },
  { id: "about", path: "/about", changefreq: "monthly", priority: 0.8 },
  {
    id: "how-it-works",
    path: "/how-it-works",
    changefreq: "weekly",
    priority: 0.85,
  },
  { id: "pricing", path: "/pricing", changefreq: "weekly", priority: 0.9 },
  { id: "faq", path: "/faq", changefreq: "weekly", priority: 0.8 },
  { id: "contact", path: "/contact", changefreq: "monthly", priority: 0.7 },
  {
    id: "pain-index",
    path: "/pain",
    changefreq: "weekly",
    priority: 0.8,
  },
  ...PAIN_PAGE_SLUGS.map<RouteSeed>((slug) => ({
    id: `pain-${slug}`,
    path: `/pain/${slug}`,
    changefreq: "weekly",
    priority: 0.8,
  })),
  {
    id: "case-study",
    path: "/case-study",
    changefreq: "weekly",
    priority: 0.75,
  },
  {
    id: "measurement-guide",
    path: "/measurement-guide",
    changefreq: "monthly",
    priority: 0.7,
  },
  { id: "privacy", path: "/privacy", changefreq: "yearly", priority: 0.3 },
  { id: "terms", path: "/terms", changefreq: "yearly", priority: 0.3 },
  {
    id: "science-bike-fit-methods",
    path: "/science/bike-fit-methods",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    id: "science-stack-reach",
    path: "/science/stack-and-reach",
    changefreq: "monthly",
    priority: 0.7,
  },
] as const;

const CALCULATOR_ROUTE_SEEDS: readonly RouteSeed[] = [
  {
    id: "calculator-saddle-height",
    path: "/calculators/saddle-height",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    id: "calculator-saddle-width",
    path: "/calculators/saddle-width",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    id: "calculator-crank-length",
    path: "/calculators/crank-length",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    id: "calculator-frame-size",
    path: "/calculators/frame-size",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    id: "calculator-fuel-hydration",
    path: "/calculators/fuel-hydration",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    id: "calculator-ftp-wkg",
    path: "/calculators/ftp-wkg",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    id: "calculator-power-speed",
    path: "/calculators/power-speed",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    id: "calculator-climb-planner",
    path: "/calculators/climb-planner",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    id: "calculator-gearing",
    path: "/calculators/gearing",
    changefreq: "weekly",
    priority: 0.85,
  },
  {
    id: "calculator-bike-fit",
    path: "/calculators/bike-fit",
    changefreq: "weekly",
    priority: 0.95,
  },
  {
    id: "calculator-tire-pressure",
    localizedPaths: {
      en: "/en/tire-pressure-calculator",
      nl: "/nl/bandenspanning-calculator",
    },
    changefreq: "weekly",
    priority: 0.9,
  },
  ...getPressureBikeEntries().map<RouteSeed>((entry) => ({
    ...entry,
    localizedPaths: {
      en: withLocalePrefix(entry.localizedPaths.en, "en"),
      nl: withLocalePrefix(entry.localizedPaths.nl, "nl"),
    },
  })),
] as const;

const GUIDE_ROUTE_SEEDS: readonly RouteSeed[] = [
  {
    id: "guide-why-bikefit-matters",
    path: "/why-bikefit-matters",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    id: "guides-index",
    path: "/guides",
    changefreq: "weekly",
    priority: 0.8,
  },
  ...listGuideRewrites().map<RouteSeed>((guide) => ({
    id: `guide-${guide.slug}`,
    path: `/guides/${guide.slug}`,
    lastmod: guide.updatedAt,
    changefreq: "monthly",
    priority: 0.7,
  })),
] as const;

const BLOG_ROUTE_SEEDS: readonly RouteSeed[] = [];

const ENTRIES_BY_SECTION: Record<SitemapSection, SitemapContentEntry[]> = {
  pages: PAGE_ROUTE_SEEDS.map(toEntry),
  calculators: CALCULATOR_ROUTE_SEEDS.map(toEntry),
  guides: GUIDE_ROUTE_SEEDS.map(toEntry),
  blog: BLOG_ROUTE_SEEDS.map(toEntry),
};

export function getSitemapEntries(section: SitemapSection): SitemapContentEntry[] {
  return ENTRIES_BY_SECTION[section].map((entry) => ({
    ...entry,
    localizedPaths: { ...entry.localizedPaths },
  }));
}

export async function getBlogSitemapEntries(): Promise<SitemapContentEntry[]> {
  const listPublishedSlugs = (api as unknown as BlogQueryApi).blog?.queries?.listPublishedSlugs;
  if (!listPublishedSlugs) {
    return [];
  }

  try {
    const rows = (await withSitemapTimeout(
      () => fetchSitemapQuery(listPublishedSlugs, {}), []
    )) as BlogSitemapRow[];

    return rows.map((row) =>
      toEntry({
        id: `blog-${row.slug}`,
        path: `/blog/${row.slug}`,
        lastmod: normalizeLastmod(row.updatedAt) ?? normalizeLastmod(row.publishedAt),
        changefreq: "weekly",
        priority: 0.6,
      })
    );
  } catch {
    return [];
  }
}

function sanitizeLocalizedPaths(localizedPaths: LocalizedPathMap): Array<[Locale, string]> {
  const sanitized: Array<[Locale, string]> = [];

  for (const locale of SUPPORTED_LOCALES) {
    const rawPath = localizedPaths[locale];
    if (!rawPath) {
      continue;
    }

    const normalizedPath = normalizePathname(rawPath);
    if (!isCanonicalSitemapPath(normalizedPath)) {
      continue;
    }

    if (isExcludedFromSitemap(normalizedPath)) {
      continue;
    }

    sanitized.push([locale, normalizedPath]);
  }

  return sanitized;
}

function getXDefaultPath(localizedPaths: Array<[Locale, string]>): string | null {
  const defaultPath = localizedPaths.find(
    ([locale]) => locale === DEFAULT_LOCALE_FOR_X_DEFAULT
  )?.[1];

  if (defaultPath) {
    return defaultPath;
  }

  return localizedPaths[0]?.[1] ?? null;
}

export function getSitemapNodes(section: SitemapSection): SitemapUrlNode[] {
  const entries = getSitemapEntries(section);
  return getSitemapNodesForEntries(entries);
}

export function getSitemapNodesForEntries(
  entries: SitemapContentEntry[]
): SitemapUrlNode[] {
  const nodes: SitemapUrlNode[] = [];

  for (const entry of entries) {
    const localizedPaths = sanitizeLocalizedPaths(entry.localizedPaths);
    if (localizedPaths.length === 0) {
      continue;
    }

    const alternates: SitemapUrlNode["alternates"] = localizedPaths.map(
      ([locale, path]) => ({
      hreflang: locale,
      href: toAbsoluteUrl(path),
    })
    );

    const xDefaultPath = getXDefaultPath(localizedPaths);
    if (xDefaultPath) {
      alternates.push({
        hreflang: "x-default",
        href: toAbsoluteUrl(xDefaultPath),
      });
    }

    for (const [, path] of localizedPaths) {
      nodes.push({
        loc: toAbsoluteUrl(path),
        lastmod: normalizeLastmod(entry.lastmod),
        changefreq: entry.changefreq,
        priority: entry.priority,
        alternates,
      });
    }
  }

  return dedupeAndSortNodes(nodes);
}

export async function getBlogSitemapNodes(): Promise<SitemapUrlNode[]> {
  return getSitemapNodesForEntries(await getBlogSitemapEntries());
}

export async function getGuideSitemapNodes(): Promise<SitemapUrlNode[]> {
  const staticNodes = getSitemapNodes("guides");
  const rows = await withSitemapTimeout(
    async () => await fetchSitemapQuery(api.guides.queries.listPublishedGuides, {}) as GuideSitemapRow[],
    [],
  );
  const merged = new Map(staticNodes.map((node) => [node.loc, node]));
  if (!Array.isArray(rows)) return staticNodes;
  for (const row of rows) {
    if (!row || typeof row.slug !== "string" || typeof row.path !== "string") continue;
    const local = listGuideRewrites().find((guide) => guide.slug === row.slug);
    const usesCmsRewrite = row.importStatus === "44b" && row.libraryBody?.nl && row.libraryBody.en;
    const lastmod = local
      ? normalizeLastmod(usesCmsRewrite ? getGuideUpdatedDate(row.lastUpdatedAt) : local.updatedAt)
      : normalizeLastmod(row.lastUpdatedAt) ?? normalizeLastmod(row.publishedAt)
        ?? normalizeLastmod(row.updatedAt) ?? normalizeLastmod(row.createdAt);
    const nodes = getSitemapNodesForEntries([toEntry({
      id: `guide-${row.slug}`,
      path: local ? `/guides/${local.slug}` : row.path,
      lastmod,
      changefreq: "monthly",
      priority: row.path === "/guides" ? 0.8 : 0.7,
    })]);
    for (const node of nodes) merged.set(node.loc, node);
  }
  return [...merged.values()].sort((first, second) => first.loc.localeCompare(second.loc));
}

function latestLastmod(nodes: Array<{ lastmod?: string }>): string | undefined {
  return nodes
    .map((node) => normalizeLastmod(node.lastmod))
    .filter((date): date is string => date !== undefined)
    .sort((a, b) => b.localeCompare(a))[0];
}

export function getSitemapSectionLastmod(section: SitemapSection): string | undefined {
  return latestLastmod(getSitemapNodes(section));
}

const SITEMAP_SECTION_ORDER: readonly SitemapSection[] = [
  "pages",
  "calculators",
  "guides",
  "blog",
];

export function getSitemapIndexNodes(): SitemapIndexNode[] {
  return SITEMAP_SECTION_ORDER.map((section) => ({
    loc: toAbsoluteUrl(SITEMAP_SECTION_PATHS[section]),
    lastmod: getSitemapSectionLastmod(section),
  }));
}

export async function getSitemapIndexNodesWithDynamicBlog(): Promise<SitemapIndexNode[]> {
  const [guides, blog] = await Promise.all([getGuideSitemapNodes(), getBlogSitemapNodes()]);
  return getSitemapIndexNodes().map((node) => {
    const nodes = node.loc === toAbsoluteUrl(SITEMAP_SECTION_PATHS.guides) ? guides
      : node.loc === toAbsoluteUrl(SITEMAP_SECTION_PATHS.blog) ? blog : undefined;
    return nodes ? { ...node, lastmod: latestLastmod(nodes) } : node;
  });
}
