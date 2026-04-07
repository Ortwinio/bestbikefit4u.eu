import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Compass, HelpCircle, Sparkles, Target, Wrench } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  PublicCtaBand,
  PublicHero,
  PublicMetricPanel,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { type Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import {
  buildArticleSchema,
  buildBreadcrumbListSchema,
  buildFaqPageSchema,
} from "@/lib/seo/jsonLd";
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
    <PublicPageShell>
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
        <PublicHero
          eyebrow={isNl ? "Scenario" : "Use case"}
          title={copy.h1}
          description={copy.intro}
          chips={
            isNl
              ? [`${copy.challenges.length} uitdagingen`, `${copy.solutions.length} oplossingen`, "NL en EN beschikbaar"]
              : [`${copy.challenges.length} challenges`, `${copy.solutions.length} solutions`, "Available in Dutch and English"]
          }
          actions={
            <Button
              variant="outline"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/use-cases", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="use_case_breadcrumb_cta"
                  ctaLabel={isNl ? "Terug naar use cases" : "Back to use cases"}
                />
              }
            >
              {isNl ? "Terug naar use cases" : "Back to use cases"}
            </Button>
          }
        />

        <PublicSection className="mt-10">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <PublicMetricPanel
                label={isNl ? "Uitdagingen" : "Challenges"}
                value={copy.challenges.length}
                description={
                  isNl
                    ? "De terugkerende patronen waar rijders vaak tegenaan lopen."
                    : "The recurring patterns riders usually run into."
                }
                icon={<Target className="h-5 w-5" />}
                accent="warning"
              />
              <PublicMetricPanel
                label={isNl ? "Oplossingen" : "Solutions"}
                value={copy.solutions.length}
                description={
                  isNl
                    ? "Praktische richtingen voor je volgende fitstap."
                    : "Practical directions for your next fit step."
                }
                icon={<Wrench className="h-5 w-5" />}
              />
            </div>
            <PublicSurfaceCard
              title={isNl ? "Wat deze pagina doet" : "What this page is for"}
              description={
                isNl
                  ? "Deze use case helpt je de juiste vraag te stellen voordat je gaat meten of onderdelen verandert."
                  : "This use case helps you ask the right fit question before you measure anything or change parts."
              }
              leading={<Compass className="h-5 w-5" />}
            >
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground">
                {isNl
                  ? "Gebruik de scenarioanalyse als contextlaag, niet als eindpunt."
                  : "Use the scenario analysis as a context layer, not as the final answer."}
              </div>
            </PublicSurfaceCard>
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Waar je tegenaan loopt" : "What riders usually run into",
            title: copy.challengesTitle,
            icon: <Target className="h-5 w-5" />,
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {copy.challenges.map((item) => (
              <PublicSurfaceCard key={item} title={item} leading={<Target className="h-5 w-5" />}>
                <div />
              </PublicSurfaceCard>
            ))}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Wat je ermee doet" : "How to respond",
            title: copy.solutionsTitle,
            description: isNl
              ? "Gebruik deze volgorde om van scenario naar concrete vervolgstap te gaan."
              : "Use this order to move from scenario context into a concrete next step.",
            icon: <Wrench className="h-5 w-5" />,
          }}
        >
          <div className="grid gap-4">
            {copy.solutions.map((item, index) => (
              <div
                key={item}
                className="grid gap-4 rounded-[var(--radius-xl)] border border-border/80 bg-card px-5 py-5 sm:grid-cols-[auto_1fr]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "FAQ" : "FAQ",
            title: copy.faqTitle,
            icon: <HelpCircle className="h-5 w-5" />,
          }}
        >
          <div className="grid gap-4">
            {copy.faqs.map((faq) => (
              <PublicSurfaceCard key={faq.q} title={faq.q} description={faq.a} leading={<Compass className="h-5 w-5" />}>
                <div />
              </PublicSurfaceCard>
            ))}
          </div>
        </PublicSection>

        <RelatedLinksSection title={copy.relatedTitle} links={copy.relatedLinks} locale={locale} />

        <PublicCtaBand
          className="mt-10"
          eyebrow={isNl ? "Volgende stap" : "Next step"}
          title={
            isNl
              ? "Wil je dit vertalen naar jouw eigen setup?"
              : "Ready to turn this into your own setup?"
          }
          description={
            isNl
              ? "Gebruik de gratis bike fit calculator als startpunt en ga daarna verder met meer detail in je fitflow."
              : "Use the free bike fit calculator as a starting point, then continue with more detail in your fit flow."
          }
          actions={
            <>
              <Button
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
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="use_case_final_cta"
                    ctaLabel={copy.primaryCta}
                  />
                }
              >
                {copy.primaryCta}
              </Button>
            </>
          }
          aside={
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {isNl
                ? "De use case helpt je kaderen welke calculator of fitactie nu het meeste waarde geeft."
                : "The use case helps you frame which calculator or fit action will add the most value next."}
            </span>
          }
        />
      </div>
    </PublicPageShell>
  );
}
