import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";

const INDEXABLE_PUBLIC_PATHS = [
  "/",
  "/about",
  "/pricing",
  "/faq",
  "/contact",
  "/measurement-guide",
  "/privacy",
  "/terms",
  "/science/calculation-engine",
  "/science/bike-fit-methods",
  "/science/stack-and-reach",
  "/guides",
  "/guides/bike-fitting-for-knee-pain",
  "/guides/bike-fitting-for-lower-back-pain",
  "/guides/road-bike-fit-guide",
  "/guides/gravel-bike-fit-guide",
  "/guides/mountain-bike-fit-guide",
  "/guides/triathlon-bike-fit-guide",
  "/calculators/saddle-height",
  "/calculators/crank-length",
  "/calculators/frame-size",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return SUPPORTED_LOCALES.flatMap((locale) =>
    INDEXABLE_PUBLIC_PATHS.map((path) => {
      const localizedPath = withLocalePrefix(path, locale);
      return {
        url: new URL(localizedPath, BRAND.siteUrl).toString(),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: localizedPath === `/${locale}` ? 1 : 0.7,
      };
    })
  );
}
