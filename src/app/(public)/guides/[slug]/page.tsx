import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { type Locale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { BRAND } from "@/config/brand";
import { GUIDE_SLUGS, getGuideBySlug, getGuideCopy } from "../data";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: locale === "nl" ? "Gids niet gevonden" : "Guide not found",
      description:
        locale === "nl"
          ? "De gevraagde bikefitting gids bestaat niet."
          : "The requested bike fitting guide does not exist.",
      robots: { index: false, follow: false },
    };
  }

  const copy = getGuideCopy(guide, locale);

  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
    keywords: copy.seoKeywords,
    openGraph: {
      title: copy.seoTitle,
      description: copy.seoDescription,
      type: "article",
    },
    alternates: buildLocaleAlternates(`/guides/${guide.slug}`, locale),
  };
}

function buildArticleJsonLd(
  locale: Locale,
  slug: string,
  headline: string,
  description: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    inLanguage: locale,
    mainEntityOfPage: new URL(withLocalePrefix(`/guides/${slug}`, locale), BRAND.siteUrl).toString(),
    author: {
      "@type": "Organization",
      name: "BestBikeFit4U",
    },
  };
}

function buildFaqJsonLd(locale: Locale, faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntityOfPage: new URL(withLocalePrefix("/guides", locale), BRAND.siteUrl).toString(),
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const copy = getGuideCopy(guide, locale);
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix(`/guides/${guide.slug}`, locale);

  const articleJsonLd = buildArticleJsonLd(locale, guide.slug, copy.h1, copy.intro);
  const faqJsonLd = buildFaqJsonLd(locale, copy.faqs);

  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">{copy.h1}</h1>
        <p className="mt-4 text-lg text-gray-600">{copy.intro}</p>

        <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-gray-900">{copy.takeawaysTitle}</h2>
          <ul className="mt-4 space-y-2 text-gray-700 list-disc list-inside">
            {copy.takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-2xl font-semibold text-gray-900">{copy.adjustmentsTitle}</h2>
          <ol className="mt-4 space-y-2 text-gray-700 list-decimal list-inside">
            {copy.adjustments.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-gray-900">{copy.faqTitle}</h2>
          <dl className="mt-4 space-y-4">
            {copy.faqs.map((faq) => (
              <div key={faq.q}>
                <dt className="text-base font-semibold text-gray-900">{faq.q}</dt>
                <dd className="mt-1 text-gray-600">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-gray-900">{copy.relatedTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {copy.relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={withLocalePrefix(link.href, locale)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-blue-600 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">
            {isNl ? "Wil je jouw fit concreet laten berekenen?" : "Ready to calculate your personalized fit?"}
          </h2>
          <p className="mt-3 text-blue-100">
            {isNl
              ? "Start gratis en ontvang afstelwaarden met duidelijke prioriteiten."
              : "Start free and get setup targets with clear adjustment priorities."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <TrackedCtaLink
              href={withLocalePrefix("/login", locale)}
              locale={locale}
              pagePath={pagePath}
              section="guide_final_cta"
              ctaLabel={copy.primaryCta}
            >
              <Button className="bg-white text-blue-700 hover:bg-blue-50">{copy.primaryCta}</Button>
            </TrackedCtaLink>
            <Link href={withLocalePrefix("/about", locale)}>
              <Button variant="outline" className="border-white text-white hover:bg-blue-500">
                {copy.secondaryCta}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
