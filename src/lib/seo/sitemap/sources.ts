import { PAIN_PAGE_SLUGS } from "@/content/painPages";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { getGuideBacklog } from "@/lib/guides/backlog";
import { withLocalePrefix } from "@/i18n/navigation";
import { getProgrammaticCalculatorEntries } from "@/lib/seo/programmatic/tirePressure";
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
  path?: string;
  lastmod: string;
  changefreq?: SitemapContentEntry["changefreq"];
  priority?: number;
  locales?: readonly Locale[];
  localizedPaths?: LocalizedPathMap;
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
  const localizedPaths =
    seed.localizedPaths ??
    (seed.path ? buildLocalizedPaths(seed.path, seed.locales) : {});

  return {
    id: seed.id,
    localizedPaths: { ...localizedPaths },
    lastmod: normalizeLastmod(seed.lastmod),
    changefreq: seed.changefreq,
    priority: seed.priority,
  };
}

const PAGE_ROUTE_SEEDS: readonly RouteSeed[] = [
  { id: "home", path: "/", lastmod: "2026-02-23", changefreq: "weekly", priority: 1 },
  {
    id: "fiets-afstellen",
    path: "/fiets-afstellen",
    lastmod: "2026-05-05",
    changefreq: "weekly",
    priority: 0.9,
    locales: ["nl"],
  },
  {
    id: "bikefitting-nl",
    path: "/bikefitting",
    lastmod: "2026-05-05",
    changefreq: "weekly",
    priority: 0.9,
    locales: ["nl"],
  },
  {
    id: "bike-fitting-en",
    path: "/bike-fitting",
    lastmod: "2026-05-05",
    changefreq: "weekly",
    priority: 0.9,
    locales: ["en"],
  },
  { id: "about", path: "/about", lastmod: "2026-02-19", changefreq: "monthly", priority: 0.8 },
  {
    id: "how-it-works",
    path: "/how-it-works",
    lastmod: "2026-03-31",
    changefreq: "weekly",
    priority: 0.85,
  },
  { id: "pricing", path: "/pricing", lastmod: "2026-02-19", changefreq: "weekly", priority: 0.9 },
  { id: "faq", path: "/faq", lastmod: "2026-02-23", changefreq: "weekly", priority: 0.8 },
  { id: "contact", path: "/contact", lastmod: "2026-02-19", changefreq: "monthly", priority: 0.7 },
  {
    id: "pain-index",
    path: "/pain",
    lastmod: "2026-03-31",
    changefreq: "weekly",
    priority: 0.8,
  },
  ...PAIN_PAGE_SLUGS.map<RouteSeed>((slug) => ({
    id: `pain-${slug}`,
    path: `/pain/${slug}`,
    lastmod: "2026-03-31",
    changefreq: "weekly",
    priority: 0.8,
  })),
  {
    id: "case-study",
    path: "/case-study",
    lastmod: "2026-03-31",
    changefreq: "weekly",
    priority: 0.75,
  },
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
    id: "calculator-gearing",
    path: "/calculators/gearing",
    lastmod: "2026-04-10",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    id: "calculator-saddle-height",
    path: "/calculators/saddle-height",
    lastmod: "2026-02-19",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    id: "calculator-saddle-width",
    path: "/calculators/saddle-width",
    lastmod: "2026-04-10",
    changefreq: "monthly",
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
  {
    id: "calculator-fuel-hydration",
    path: "/calculators/fuel-hydration",
    lastmod: "2026-04-11",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    id: "calculator-ftp-wkg",
    path: "/calculators/ftp-wkg",
    lastmod: "2026-04-11",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    id: "calculator-power-speed",
    path: "/calculators/power-speed",
    lastmod: "2026-04-11",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    id: "calculator-climb-planner",
    path: "/calculators/climb-planner",
    lastmod: "2026-04-11",
    changefreq: "monthly",
    priority: 0.75,
  },
  {
    id: "calculator-gearing",
    path: "/calculators/gearing",
    lastmod: "2026-04-10",
    changefreq: "weekly",
    priority: 0.85,
  },
  {
    id: "calculator-bike-fit",
    path: "/calculators/bike-fit",
    lastmod: "2026-03-18",
    changefreq: "weekly",
    priority: 0.95,
  },
  {
    id: "calculator-tire-pressure",
    localizedPaths: {
      en: "/en/tire-pressure-calculator",
      nl: "/nl/bandenspanning-calculator",
    },
    lastmod: "2026-03-17",
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    id: "calculator-tire-pressure-road",
    path: "/bandenspanning/racefiets",
    lastmod: "2026-03-17",
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    id: "calculator-tire-pressure-gravel",
    path: "/bandenspanning/gravelbike",
    lastmod: "2026-03-17",
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    id: "calculator-tire-pressure-mtb",
    path: "/bandenspanning/mtb",
    lastmod: "2026-03-17",
    changefreq: "weekly",
    priority: 0.9,
  },
  ...getProgrammaticCalculatorEntries().map<RouteSeed>((entry) => ({
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
    lastmod: "2026-02-23",
    changefreq: "monthly",
    priority: 0.7,
  },
  ...getGuideBacklog("en")
    .filter((entry) => entry.path === "/guides" || entry.path.startsWith("/guides/"))
    .map<RouteSeed>((entry) => ({
      id: `guide-${entry.slug.replace(/\//g, "-")}`,
      path: entry.path,
      lastmod: "2026-04-11",
      changefreq: "monthly",
      priority: entry.path === "/guides" ? 0.8 : 0.7,
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
  return SITEMAP_SECTION_ORDER.flatMap((section) => {
    if (getSitemapEntries(section).length === 0) {
      return [];
    }

    return [
      {
        loc: toAbsoluteUrl(SITEMAP_SECTION_PATHS[section]),
        lastmod: getSitemapSectionLastmod(section),
      },
    ];
  });
}
