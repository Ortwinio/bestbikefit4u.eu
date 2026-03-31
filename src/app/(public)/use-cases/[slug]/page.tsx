import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Compass, HelpCircle, Target, Wrench } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import {
  buildArticleSchema,
  buildBreadcrumbListSchema,
  buildFaqPageSchema,
} from "@/lib/seo/jsonLd";
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
  const alternates = buildLocaleAlternates(`/use-cases/${slug}`, locale);

  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
    keywords: copy.seoKeywords,
    openGraph: {
      title: copy.seoTitle,
      description: copy.seoDescription,
      type: "article",
      url: alternates.canonical,
    },
    alternates,
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
  const useCasesIndexUrl = new URL(withLocalePrefix("/use-cases", locale), BRAND.siteUrl).toString();
  const homeUrl = new URL(withLocalePrefix("/", locale), BRAND.siteUrl).toString();

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
          buildBreadcrumbListSchema([
            { name: isNl ? "Home" : "Home", item: homeUrl },
            { name: isNl ? "Use cases" : "Use cases", item: useCasesIndexUrl },
            { name: copy.h1, item: pageUrl },
          ]),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <Card className="dashboard-card-surface border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--primary)_8%)]">
            <CardContent className="p-8 sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                <Compass className="h-3.5 w-3.5" />
                {isNl ? "Scenario" : "Use case"}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
                {copy.h1}
              </h1>
              <p className="mt-4 text-lg leading-8 text-[color:var(--muted-foreground)]">
                {copy.intro}
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card-surface overflow-hidden border-[color:var(--border)] bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_12%,var(--card)_88%),color-mix(in_oklch,var(--warning)_10%,var(--card)_90%))]">
            <CardContent className="flex h-full flex-col justify-between p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                  {isNl ? "Scenarioframe" : "Scenario frame"}
                </p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                      {isNl ? "Uitdagingen" : "Challenges"}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">
                      {copy.challenges.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                      {isNl ? "Oplossingen" : "Solutions"}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">
                      {copy.solutions.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--background)]/70 p-4">
                <div className="flex items-start gap-3">
                  <Target className="mt-0.5 h-5 w-5 text-[color:var(--warning)]" />
                  <p className="text-sm leading-6 text-[color:var(--foreground)]">
                    {isNl
                      ? "Deze pagina helpt je de juiste vraag te stellen voordat je gaat meten of aanpassen."
                      : "This page is designed to help you ask the right fit question before measuring or adjusting."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[color:var(--warning)]/14 p-3 text-[color:var(--warning)]">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                {isNl ? "Waar je tegenaan loopt" : "What riders usually run into"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
                {copy.challengesTitle}
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {copy.challenges.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-5"
              >
                <p className="text-sm leading-7 text-[color:var(--foreground)]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--primary-soft)] p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[color:var(--background)] p-3 text-[color:var(--primary)]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                {isNl ? "Wat je ermee doet" : "How to respond"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
                {copy.solutionsTitle}
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            {copy.solutions.map((item, index) => (
              <div
                key={item}
                className="grid gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-5 sm:grid-cols-[auto_1fr]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-[color:var(--primary-foreground)]">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-[color:var(--foreground)]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[color:var(--primary-soft)] p-3 text-[color:var(--primary)]">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
                {isNl ? "FAQ" : "FAQ"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
                {copy.faqTitle}
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            {copy.faqs.map((faq) => (
              <article
                key={faq.q}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-5"
              >
                <h3 className="text-base font-semibold text-[color:var(--foreground)]">{faq.q}</h3>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]">{faq.a}</p>
              </article>
            ))}
          </div>
        </section>

        <RelatedLinksSection
          title={copy.relatedTitle}
          links={copy.relatedLinks}
          locale={locale}
        />

        <section className="mt-10 rounded-[2rem] bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_92%,black_8%),color-mix(in_oklch,var(--primary)_72%,var(--warning)_28%))] p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-bold text-[color:var(--primary-foreground)] sm:text-3xl">
            {isNl ? "Wil je dit vertalen naar jouw eigen setup?" : "Ready to turn this into your own setup?"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[color:var(--primary-foreground)]/84 sm:text-base">
            {isNl
              ? "Gebruik de gratis bike fit calculator als startpunt en ga daarna verder met meer detail in je fitflow."
              : "Use the free bike-fit calculator as a starting point, then continue with more detail in your fit flow."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              className="bg-[color:var(--background)] text-[color:var(--primary)] hover:bg-[color:var(--muted)]"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="use_case_calculator_cta"
                  ctaLabel={isNl ? "Open bike fit-calculator" : "Open Bike Fit Calculator"}
                />
              }
            >
              {isNl ? "Open bike fit-calculator" : "Open Bike Fit Calculator"}
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
              className="border-[color:var(--primary-foreground)] bg-transparent text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary-foreground)]/10"
            >
              {copy.primaryCta}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
