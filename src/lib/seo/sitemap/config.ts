import { BRAND } from "@/config/brand";
import type { Locale } from "@/i18n/config";
import type { SitemapSection } from "./types";

export const SITEMAP_BASE_URL = BRAND.siteUrl;
export const SITEMAP_INDEX_PATH = "/sitemap.xml";
export const SITEMAP_SYSTEM_LASTMOD = "2026-02-23";

export const DEFAULT_LOCALE_FOR_X_DEFAULT: Locale = "en";

export const SITEMAP_SECTION_PATHS: Record<SitemapSection, string> = {
  pages: "/sitemap-pages.xml",
  calculators: "/sitemap-calculators.xml",
  guides: "/sitemap-guides.xml",
  blog: "/sitemap-blog.xml",
};

export const DEFAULT_SITEMAP_CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=86400";
export const BLOG_SITEMAP_CACHE_CONTROL =
  "public, s-maxage=900, stale-while-revalidate=86400";

export const ROBOTS_DISALLOW_PATHS = [
  "/api/",
  "/trpc/",
  "/dashboard",
  "/en/dashboard",
  "/nl/dashboard",
  "/fit",
  "/en/fit",
  "/nl/fit",
  "/bikes",
  "/en/bikes",
  "/nl/bikes",
  "/profile",
  "/en/profile",
  "/nl/profile",
  "/login",
  "/en/login",
  "/nl/login",
] as const;
