import type { Locale } from "@/i18n/config";

export type SitemapSection = "pages" | "calculators" | "guides" | "blog";

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type LocalizedPathMap = Partial<Record<Locale, string>>;

export type SitemapContentEntry = {
  id: string;
  localizedPaths: LocalizedPathMap;
  lastmod: string;
  changefreq?: SitemapChangeFrequency;
  priority?: number;
};

export type SitemapAlternateLink = {
  hreflang: Locale | "x-default";
  href: string;
};

export type SitemapUrlNode = {
  loc: string;
  lastmod: string;
  changefreq?: SitemapChangeFrequency;
  priority?: number;
  alternates: SitemapAlternateLink[];
};

export type SitemapIndexNode = {
  loc: string;
  lastmod: string;
};
