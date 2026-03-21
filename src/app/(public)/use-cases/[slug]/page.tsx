import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { buildArticleSchema, buildFaqPageSchema } from "@/lib/seo/jsonLd";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { type Locale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { USE_CASE_SLUGS, getUseCaseBySlug, getUseCaseCopy } from "../data";

interface UseCasePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return USE_CASE_SLUGS.map((slug) => ({ slug }));
}

function linkButtonProps(href: string): ButtonProps {
  return {
    render: <Link href={href} />,
    nativeButton: false,
  } as ButtonProps;
}

export async function generateMetadata({
  params,
}: UseCasePageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const useCase = getUseCaseBySlug(slug);

  if (!useCase) {
    return {
      title: locale === "nl" ? "Pagina niet gevonden" : "Page not found",
      robots: { index: false, follow: false },
    };
  }

  const copy = getUseCaseCopy(useCase, locale);

  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
    keywords: copy.seoKeywords,
    openGraph: {
      title: copy.seoTitle,
      description: copy.seoDescription,
      type: "article",
    },
    alternates: buildLocaleAlternates(`/use-cases/${slug}`, locale),
  };
}

function buildPageUrl(locale: Locale, slug: string) {
  return new URL(withLocalePrefix(`/use-cases/${slug}`, locale), BRAND.siteUrl).toString();
}

export default async function UseCaseDetailPage({ params }: UseCasePageProps) {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const { slug } = await params;
  const useCase = getUseCaseBySlug(slug);

  if (!useCase) {
    notFound();
  }

  const copy = getUseCaseCopy(useCase, locale);
  const pagePath = withLocalePrefix(`/use-cases/${slug}`, locale);
  const pageUrl = buildPageUrl(locale, slug);

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

        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold text-foreground">{copy.challengesTitle}</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-foreground">
            {copy.challenges.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-primary-soft p-6">
          <h2 className="text-2xl font-semibold text-foreground">{copy.solutionsTitle}</h2>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-foreground">
            {copy.solutions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
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
            {isNl ? "Wil je dit vertalen naar jouw eigen setup?" : "Ready to turn this into your own setup?"}
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            {isNl
              ? "Gebruik de gratis bike fit calculator als startpunt en ga daarna verder met je volledige dashboard-fit."
              : "Use the free bike-fit calculator as a starting point, then continue with your full dashboard fit."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              className="bg-background text-primary hover:bg-muted"
              {...linkButtonProps(withLocalePrefix("/calculators/bike-fit", locale))}
            >
              {isNl ? "Open bike fit calculator" : "Open Bike Fit Calculator"}
            </Button>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="use_case_final_cta"
                  ctaLabel={copy.primaryCta}
                />
              }
              variant="outline"
              className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              {copy.primaryCta}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
