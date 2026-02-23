import { GUIDE_SLUGS } from "@/app/(public)/guides/data";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  DEFAULT_LOCALE_FOR_X_DEFAULT,
  SITEMAP_SECTION_PATHS,
  SITEMAP_SYSTEM_LASTMOD,
} from "./config";
import { dedupeAndSortNodes, isBlockedByRobots, isCanonicalSitemapPath } from "./filters";
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
  path: string;
  lastmod: string;
  changefreq?: SitemapContentEntry["changefreq"];
  priority?: number;
  locales?: readonly Locale[];
};

function buildLocalizedPaths(
  pathname: string,
  locales: readonly Locale[] = SUPPORTED_LOCALES
): LocalizedPathMap {
  return Object.fromEntries(
    locales.map((locale) => [locale, withLocalePrefix(pathname, locale)])
  ) as LocalizedPathMap;
}

function toEntry(seed: RouteSeed): SitemapContentEntry {
  return {
    id: seed.id,
    localizedPaths: buildLocalizedPaths(seed.path, seed.locales),
    lastmod: normalizeLastmod(seed.lastmod),
    changefreq: seed.changefreq,
    priority: seed.priority,
  };
}

const PAGE_ROUTE_SEEDS: readonly RouteSeed[] = [
  { id: "home", path: "/", lastmod: "2026-02-23", changefreq: "weekly", priority: 1 },
  { id: "about", path: "/about", lastmod: "2026-02-19", changefreq: "monthly", priority: 0.8 },
  { id: "pricing", path: "/pricing", lastmod: "2026-02-19", changefreq: "weekly", priority: 0.9 },
  { id: "faq", path: "/faq", lastmod: "2026-02-23", changefreq: "weekly", priority: 0.8 },
  { id: "contact", path: "/contact", lastmod: "2026-02-19", changefreq: "monthly", priority: 0.7 },
  {
    id: "measurement-guide",
    path: "/measurement-guide",
    lastmod: "2026-02-19",
    changefreq: "monthly",
    priority: 0.7,
  },
  { id: "privacy", path: "/privacy", lastmod: "2026-02-22", changefreq: "yearly", priority: 0.3 },
  { id: "terms", path: "/terms", lastmod: "2026-02-19", changefreq: "yearly", priority: 0.3 },
  {
    id: "science-calculation-engine",
    path: "/science/calculation-engine",
    lastmod: "2026-02-19",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    id: "science-bike-fit-methods",
    path: "/science/bike-fit-methods",
    lastmod: "2026-02-19",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    id: "science-stack-reach",
    path: "/science/stack-and-reach",
    lastmod: "2026-02-19",
    changefreq: "monthly",
    priority: 0.7,
  },
] as const;

const CALCULATOR_ROUTE_SEEDS: readonly RouteSeed[] = [
  {
    id: "calculator-saddle-height",
    path: "/calculators/saddle-height",
    lastmod: "2026-02-19",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    id: "calculator-crank-length",
    path: "/calculators/crank-length",
    lastmod: "2026-02-19",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    id: "calculator-frame-size",
    path: "/calculators/frame-size",
    lastmod: "2026-02-19",
    changefreq: "weekly",
    priority: 0.8,
  },
] as const;

const GUIDE_ROUTE_SEEDS: readonly RouteSeed[] = [
  {
    id: "guides-index",
    path: "/guides",
    lastmod: "2026-02-19",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    id: "guide-why-bikefit-matters",
    path: "/why-bikefit-matters",
    lastmod: "2026-02-23",
    changefreq: "monthly",
    priority: 0.7,
  },
  ...GUIDE_SLUGS.map<RouteSeed>((slug) => ({
    id: `guide-${slug}`,
    path: `/guides/${slug}`,
    lastmod: "2026-02-19",
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

    if (isBlockedByRobots(normalizedPath)) {
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
        lastmod: entry.lastmod,
        changefreq: entry.changefreq,
        priority: entry.priority,
        alternates,
      });
    }
  }

  return dedupeAndSortNodes(nodes);
}

export function getSitemapSectionLastmod(section: SitemapSection): string {
  const entries = getSitemapEntries(section);
  if (entries.length === 0) {
    return SITEMAP_SYSTEM_LASTMOD;
  }

  return entries
    .map((entry) => normalizeLastmod(entry.lastmod))
    .sort((a, b) => b.localeCompare(a))[0];
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
