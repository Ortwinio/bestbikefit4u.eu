import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { BRAND } from "@/config/brand";
import { buildArticleSchema, buildFaqPageSchema } from "@/lib/seo/jsonLd";
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
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();

  return (
    <div className="py-16">
      <JsonLd
        schema={[
          buildArticleSchema({
            headline: copy.h1,
            description: copy.intro,
            url: pageUrl,
            inLanguage: locale,
          }),
          buildFaqPageSchema(copy.faqs),
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground">{copy.h1}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{copy.intro}</p>

        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold text-foreground">{copy.takeawaysTitle}</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-foreground">
            {copy.takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-primary-soft p-6">
          <h2 className="text-2xl font-semibold text-foreground">{copy.adjustmentsTitle}</h2>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-foreground">
            {copy.adjustments.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold text-foreground">{copy.faqTitle}</h2>
          <dl className="mt-4 space-y-4">
            {copy.faqs.map((faq) => (
              <div key={faq.q}>
                <dt className="text-base font-semibold text-foreground">{faq.q}</dt>
                <dd className="mt-1 text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedLinksSection
          title={copy.relatedTitle}
          links={copy.relatedLinks}
          locale={locale}
        />

        <section className="mt-10 rounded-2xl bg-primary p-8 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground">
            {isNl ? "Wil je jouw fit concreet laten berekenen?" : "Ready to calculate your personalized fit?"}
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            {isNl
              ? "Start gratis en ontvang afstelwaarden met duidelijke prioriteiten."
              : "Start free and get setup targets with clear adjustment priorities."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="guide_final_cta"
                  ctaLabel={copy.primaryCta}
              />
              }
              className="bg-background text-primary hover:bg-muted"
            >
              {copy.primaryCta}
            </Button>
            <Button
              render={<Link href={withLocalePrefix("/about", locale)} />}
              variant="outline"
              className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              {copy.secondaryCta}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
