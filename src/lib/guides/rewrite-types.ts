import type { Locale } from "@/i18n/config";

/** Editorial source for the 44b rewrite; markdown contains sections 1–5, starting at H2. */
export type GuideRewriteLocale = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  keyword: string;
  relatedKeywords: readonly string[];
  alt: string;
  quickAnswer: string;
  markdown: string;
  cta: string;
  ctaLabel: string;
  /** Unprefixed route; the renderer adds the selected locale. */
  ctaTarget: string;
};

export type GuideRewrite = {
  slug: string;
  source?: "code-rewrite" | "cms-rewrite";
  /** ISO calendar date, shared by the visible date and Article.dateModified. */
  updatedAt?: string;
  /** Basename in /illustrations/guides, without the .webp extension. */
  illustration: string;
} & Record<Locale, GuideRewriteLocale>;

export function getRewriteFaqs(markdown: string) {
  const faq = markdown.split(/^## (?:Veelgestelde vragen|Frequently asked questions|FAQ)\s*$/m)[1];
  if (!faq) return [];
  return [...faq.matchAll(/^### (.+)\n+([\s\S]*?)(?=^### |^## |$(?![\s\S]))/gm)].map(
    ([, q, a]) => ({ q: q.trim(), a: a.trim().replace(/\s+/g, " ") })
  );
}
