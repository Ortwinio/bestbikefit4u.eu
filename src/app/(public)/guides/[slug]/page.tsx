import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { FitDisclaimer } from "@/components/content/FitDisclaimer";
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
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import {
  buildArticleSchema,
  buildBreadcrumbListSchema,
  buildFaqPageSchema,
} from "@/lib/seo/jsonLd";
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
  const alternates = buildLocaleAlternates(`/guides/${guide.slug}`, locale);

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
  const guidesIndexUrl = new URL(withLocalePrefix("/guides", locale), BRAND.siteUrl).toString();
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
            { name: isNl ? "Gidsen" : "Guides", item: guidesIndexUrl },
            { name: copy.h1, item: pageUrl },
          ]),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={
            guide.cluster === "pain"
              ? isNl
                ? "Klachtgids"
                : "Pain guide"
              : isNl
                ? "Disciplinegids"
                : "Discipline guide"
          }
          title={copy.h1}
          description={copy.intro}
          chips={
            isNl
              ? [`${copy.takeaways.length} kernpunten`, `${copy.adjustments.length} acties`, "NL en EN beschikbaar"]
              : [`${copy.takeaways.length} takeaways`, `${copy.adjustments.length} actions`, "Available in Dutch and English"]
          }
          actions={
            <Button
              variant="outline"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/guides", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="guide_breadcrumb_cta"
                  ctaLabel={isNl ? "Terug naar gidsen" : "Back to guides"}
                />
              }
            >
              {isNl ? "Terug naar gidsen" : "Back to guides"}
            </Button>
          }
        />

        <PublicSection className="mt-10">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <PublicMetricPanel
                label={isNl ? "Kernpunten" : "Takeaways"}
                value={copy.takeaways.length}
                description={
                  isNl
                    ? "Snelle samenvatting van wat je wilt onthouden."
                    : "A fast summary of what you want to remember."
                }
                icon={<CheckCircle2 className="h-5 w-5" />}
              />
              <PublicMetricPanel
                label={isNl ? "Acties" : "Actions"}
                value={copy.adjustments.length}
                description={
                  isNl
                    ? "Praktische volgorde voor je volgende checks."
                    : "A practical order for your next setup checks."
                }
                icon={<Wrench className="h-5 w-5" />}
                accent="warning"
              />
            </div>
            <PublicSurfaceCard
              title={isNl ? "Hoe je deze gids gebruikt" : "How to use this guide"}
              description={
                isNl
                  ? "Gebruik deze pagina als filter voor je eerste keuzes en laat een calculator of volledige fit daarna de exacte waarden bepalen."
                  : "Use this page to filter your first decisions, then let a calculator or full fit define the exact numbers."
              }
              leading={<ShieldCheck className="h-5 w-5" />}
            >
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground">
                {isNl
                  ? "Een gids geeft richting. Hij vervangt geen persoonlijke beoordeling wanneer comfort of klachten blijven terugkomen."
                  : "A guide provides direction. It does not replace personal review when discomfort keeps returning."}
              </div>
            </PublicSurfaceCard>
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Snelle samenvatting" : "Quick summary",
            title: copy.takeawaysTitle,
            description: isNl
              ? "Gebruik deze blokken om snel te scannen wat je wilt onthouden voordat je gaat aanpassen."
              : "Use these blocks to scan the key decisions before you start changing your setup.",
            icon: <CheckCircle2 className="h-5 w-5" />,
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {copy.takeaways.map((item) => (
              <PublicSurfaceCard
                key={item}
                title={item}
                leading={<CheckCircle2 className="h-5 w-5" />}
              >
                <div />
              </PublicSurfaceCard>
            ))}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Praktische volgorde" : "Practical order",
            title: copy.adjustmentsTitle,
            description: isNl
              ? "Werk in kleine stappen en test telkens op dezelfde rit of dezelfde context."
              : "Work in small steps and validate on the same ride or in the same context each time.",
            icon: <Wrench className="h-5 w-5" />,
          }}
        >
          <div className="grid gap-4">
            {copy.adjustments.map((item, index) => (
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
            eyebrow: isNl ? "Veelgestelde vragen" : "Frequently asked questions",
            title: copy.faqTitle,
            icon: <HelpCircle className="h-5 w-5" />,
          }}
        >
          <div className="grid gap-4">
            {copy.faqs.map((faq) => (
              <PublicSurfaceCard key={faq.q} title={faq.q} description={faq.a} leading={<BookOpen className="h-5 w-5" />}>
                <div />
              </PublicSurfaceCard>
            ))}
          </div>
        </PublicSection>

        <RelatedLinksSection title={copy.relatedTitle} links={copy.relatedLinks} locale={locale} />

        {guide.cluster === "pain" ? <FitDisclaimer locale={locale} /> : null}

        <PublicCtaBand
          className="mt-10"
          eyebrow={isNl ? "Volgende stap" : "Next step"}
          title={
            isNl
              ? "Wil je dit vertalen naar je eigen setup?"
              : "Ready to turn this into your own setup?"
          }
          description={
            isNl
              ? "Start gratis en bekijk fitbegeleiding met duidelijke prioriteiten."
              : "Start free and review fit guidance with clear adjustment priorities."
          }
          actions={
            <>
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
              >
                {copy.primaryCta}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/how-it-works", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="guide_secondary_cta"
                    ctaLabel={copy.secondaryCta}
                  />
                }
              >
                {copy.secondaryCta}
              </Button>
            </>
          }
          aside={
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {isNl
                ? "Gebruik de gids om sneller te prioriteren en laat de calculator daarna de details aanscherpen."
                : "Use the guide to prioritize faster, then let the calculator refine the details."}
            </span>
          }
        />
      </div>
    </PublicPageShell>
  );
}
