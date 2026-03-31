import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { PAIN_PAGE_SLUGS, getPainPageBySlug, getPainPageCopy } from "@/content/painPages";
import { PainPointPageTemplate } from "@/components/public/PainPointPageTemplate";

export function generateStaticParams() {
  return PAIN_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const page = getPainPageBySlug(slug);

  if (!page) {
    return {
      title: locale === "nl" ? "Pagina niet gevonden" : "Page not found",
      robots: { index: false, follow: false },
    };
  }

  const copy = getPainPageCopy(page, locale);

  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
    keywords: copy.keywords,
    openGraph: {
      title: copy.seoTitle,
      description: copy.seoDescription,
      type: "article",
    },
    alternates: buildLocaleAlternates(`/pain/${slug}`, locale),
  };
}

export default async function PainPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const page = getPainPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <PainPointPageTemplate locale={locale} slug={slug} copy={getPainPageCopy(page, locale)} />;
}
