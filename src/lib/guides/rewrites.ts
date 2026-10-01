import { batchAGuides } from "./content/batch-a";
import { batchBGuides } from "./content/batch-b";
import { batchCGuides } from "./content/batch-c";
import { batchDGuides } from "./content/batch-d";
import type { GuideRewrite } from "./rewrite-types";

/** Each reviewed batch adds its own records here; unlisted guides retain their existing CMS path. */
const rewrites: readonly GuideRewrite[] = [...batchAGuides, ...batchBGuides, ...batchCGuides, ...batchDGuides];

export function getGuideRewrite(slug: string): GuideRewrite | undefined {
  return rewrites.find((guide) => guide.slug === slug);
}

export function listGuideRewrites(): readonly GuideRewrite[] {
  return rewrites;
}

/** Imported 44b content remains editable in the CMS after the separately approved publishing step. */
export function resolveGuideRewrite(
  slug: string,
  cms?: {
    importStatus?: string;
    h1: { nl: string; en: string };
    metaTitle: { nl: string; en: string };
    metaDescription: { nl: string; en: string };
    pageBrief: { nl: string; en: string };
    libraryBody?: { nl: string; en: string };
    featuredImageAlt?: { nl: string; en: string };
    heroImagePublicPath?: string;
    lastUpdatedAt?: number;
    primaryCtaLabel?: { nl: string; en: string };
    primaryCtaTarget?: string;
    body: { nl: { title: string; items: string[] }[]; en: { title: string; items: string[] }[] };
  } | null,
): GuideRewrite | undefined {
  const fallback = getGuideRewrite(slug);
  if (!fallback || cms?.importStatus !== "44b" || !cms.libraryBody?.nl || !cms.libraryBody.en) return fallback;
  const localize = (locale: "nl" | "en") => ({
    ...fallback[locale],
    title: cms.h1[locale],
    metaTitle: cms.metaTitle[locale],
    metaDescription: cms.metaDescription[locale],
    quickAnswer: cms.pageBrief[locale],
    markdown: cms.libraryBody![locale],
    alt: cms.featuredImageAlt?.[locale] ?? fallback[locale].alt,
    cta: cms.body[locale].find((section) => section.title === (locale === "nl" ? "Afsluiter" : "Closing CTA"))
      ?.items[0] ?? fallback[locale].cta,
    ctaLabel: cms.primaryCtaLabel?.[locale] ?? fallback[locale].ctaLabel,
    ctaTarget: cms.primaryCtaTarget ?? fallback[locale].ctaTarget,
  });
  const illustration = cms.heroImagePublicPath?.match(/^\/illustrations\/guides\/([^/]+)\.webp$/)?.[1];
  return {
    ...fallback,
    source: "cms-rewrite",
    illustration: illustration ?? fallback.illustration,
    updatedAt: cms.lastUpdatedAt ? new Date(cms.lastUpdatedAt).toISOString().slice(0, 10) : fallback.updatedAt,
    nl: localize("nl"),
    en: localize("en"),
  };
}
