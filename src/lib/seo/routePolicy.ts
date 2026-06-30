import { DASHBOARD_PRESSURE_CALCULATOR_PATH } from "@/lib/pressureRoutes";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/config";

export type SeoRouteClassification =
  | "indexable_public"
  | "non_indexable_public_utility"
  | "private_app"
  | "auth"
  | "api_or_system";

type RouteFamily = {
  classification: SeoRouteClassification;
  prefixes: readonly string[];
};

export const SEO_ROUTE_FAMILIES: readonly RouteFamily[] = [
  {
    classification: "indexable_public",
    prefixes: [
      "/",
      "/about",
      "/bandenspanning",
      "/bandenspanning-calculator",
      "/bike-fitting",
      "/bikefitting",
      "/calculators",
      "/case-study",
      "/contact",
      "/faq",
      "/fit-pass",
      "/fiets-afstellen",
      "/guides",
      "/how-it-works",
      "/measurement-guide",
      "/pain",
      "/pricing",
      "/privacy",
      "/science/bike-fit-methods",
      "/science/stack-and-reach",
      "/terms",
      "/tire-pressure",
      "/tire-pressure-calculator",
      "/why-bikefit-matters",
    ],
  },
  {
    classification: "non_indexable_public_utility",
    prefixes: ["/science/calculation-engine", "/use-cases"],
  },
  {
    classification: "private_app",
    prefixes: [
      "/admin",
      "/app",
      "/bikes",
      "/dashboard",
      "/feedback",
      "/fit",
      "/fit-history",
      "/gearing",
      DASHBOARD_PRESSURE_CALCULATOR_PATH,
      "/profile",
      "/saddle-selector",
      "/settings",
      "/shoe-cleat-fit",
    ],
  },
  {
    classification: "auth",
    prefixes: ["/login"],
  },
  {
    classification: "api_or_system",
    prefixes: [
      "/_next",
      "/api",
      "/robots.txt",
      "/sitemap.xml",
      "/sitemap-blog.xml",
      "/sitemap-calculators.xml",
      "/sitemap-guides.xml",
      "/sitemap-pages.xml",
      "/static",
      "/trpc",
    ],
  },
] as const;

function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim();
  if (!trimmed) {
    return "/";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, "/");
  if (collapsed.length > 1 && collapsed.endsWith("/")) {
    return collapsed.slice(0, -1);
  }

  return collapsed;
}

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/(en|nl)(?=\/|$)/, "") || "/";
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  if (prefix === "/") {
    return pathname === "/";
  }

  if (prefix.endsWith("/")) {
    return pathname.startsWith(prefix);
  }

  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function withLocalePrefix(prefix: string, locale: Locale): string {
  if (prefix === "/") {
    return `/${locale}`;
  }

  return `/${locale}${prefix}`;
}

export function classifySeoPath(pathname: string): SeoRouteClassification | null {
  const normalized = normalizePathname(pathname);
  const localeStripped = stripLocalePrefix(normalized);

  for (const family of SEO_ROUTE_FAMILIES) {
    if (
      family.prefixes.some(
        (prefix) =>
          matchesPrefix(normalized, prefix) || matchesPrefix(localeStripped, prefix)
      )
    ) {
      return family.classification;
    }
  }

  return null;
}

export function expandLocaleAwarePrefixes(
  prefixes: readonly string[],
  locales: readonly Locale[] = SUPPORTED_LOCALES
): string[] {
  const expanded = new Set<string>();

  for (const prefix of prefixes) {
    const normalized = normalizePathname(prefix);
    expanded.add(normalized);
    if (
      normalized.startsWith("/_next") ||
      normalized.startsWith("/api") ||
      normalized.startsWith("/robots.txt") ||
      normalized.startsWith("/sitemap") ||
      normalized.startsWith("/trpc") ||
      normalized.startsWith("/static")
    ) {
      continue;
    }

    for (const locale of locales) {
      expanded.add(withLocalePrefix(normalized, locale));
    }
  }

  return [...expanded];
}

const NON_INDEXABLE_SITEMAP_CLASSIFICATIONS: readonly SeoRouteClassification[] = [
  "private_app",
  "auth",
  "api_or_system",
];

const ROBOTS_DISALLOW_PREFIXES = [
  ...SEO_ROUTE_FAMILIES.filter(
    (family) => family.classification === "private_app"
  ).flatMap((family) => family.prefixes),
  "/api",
  "/static",
  "/trpc",
] as const;

export const SEO_SITEMAP_EXCLUDED_PATHS = expandLocaleAwarePrefixes(
  SEO_ROUTE_FAMILIES
    .filter((family) =>
      NON_INDEXABLE_SITEMAP_CLASSIFICATIONS.includes(family.classification)
    )
    .flatMap((family) => family.prefixes)
);

export const SEO_ROBOTS_DISALLOW_PATHS =
  expandLocaleAwarePrefixes(ROBOTS_DISALLOW_PREFIXES);
