import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, HelpCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { FitDisclaimer } from "@/components/content/FitDisclaimer";
import {
  PublicCtaBand,
  PublicHero,
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
import { buildArticleSchema, buildBreadcrumbListSchema, buildFaqPageSchema } from "@/lib/seo/jsonLd";
import { getGuideChildren, getGuideEntryBySlug, getGuideLeafEntries } from "@/lib/guides/backlog";
import {
  buildFaqs,
  buildHubIntro,
  buildLeafSections,
  getGuideLinkLabel,
  relatedLinkDescription,
  resolveGuidePrimaryCta,
} from "@/lib/guides/content";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getGuideLeafEntries("en").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const entry = getGuideEntryBySlug(slug, locale);

  if (!entry) {
    return {
      title: locale === "nl" ? "Pagina niet gevonden" : "Page not found",
      robots: { index: false, follow: false },
    };
  }

  const alternates = buildLocaleAlternates(entry.path, locale);

  return {
    title: entry.metaTitle,
    description: entry.pageBrief,
    openGraph: {
      title: entry.metaTitle,
      description: entry.pageBrief,
      type: "article",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const { slug } = await params;
  const entry = getGuideEntryBySlug(slug, locale);

  if (!entry) {
    notFound();
  }

  const pagePath = withLocalePrefix(entry.path, locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const guidesIndexUrl = new URL(withLocalePrefix("/guides", locale), BRAND.siteUrl).toString();
  const homeUrl = new URL(withLocalePrefix("/", locale), BRAND.siteUrl).toString();
  const childPages = getGuideChildren(slug, locale);
  const isHub = childPages.length > 0;
  const faqs = buildFaqs(entry, locale);
  const leafSections = buildLeafSections(entry, locale);
  const relatedLinks = entry.internalLinkTargets.map((href) => ({
    href,
    label: getGuideLinkLabel(href, locale),
    description: relatedLinkDescription(locale),
  }));
  const primaryCta = resolveGuidePrimaryCta(entry.primaryCtaTarget, locale);

  return (
    <PublicPageShell>
      <JsonLd
        schema={[
          buildArticleSchema({
            headline: entry.h1,
            description: entry.pageBrief,
            url: pageUrl,
            inLanguage: locale,
          }),
          buildFaqPageSchema(faqs),
          buildBreadcrumbListSchema([
            { name: isNl ? "Home" : "Home", item: homeUrl },
            { name: isNl ? "Gidsen" : "Guides", item: guidesIndexUrl },
            { name: entry.h1, item: pageUrl },
          ]),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={isHub ? (isNl ? "Hub" : "Hub") : isNl ? "Gids" : "Guide"}
          title={entry.h1}
          description={entry.pageBrief}
          chips={
            isHub
              ? [
                  isNl ? `${childPages.length} child-pagina's` : `${childPages.length} child pages`,
                  isNl ? "EN + NL parity" : "EN + NL parity",
                  isNl ? "Navigatie + context" : "Navigation + context",
                ]
              : [
                  isNl ? `${leafSections.length} secties` : `${leafSections.length} sections`,
                  isNl ? `${entry.internalLinkTargets.length} gerelateerde links` : `${entry.internalLinkTargets.length} related links`,
                  isNl ? "Praktische gids" : "Practical guide",
                ]
          }
          actions={
            <Button
              variant="outline"
              render={<Link href={withLocalePrefix("/guides", locale)} />}
            >
              {isNl ? "Terug naar gidsen" : "Back to guides"}
            </Button>
          }
        />

        {isHub ? (
          <>
            <PublicSection
              className="mt-10"
              header={{
                eyebrow: isNl ? "Waar deze hub voor is" : "What this hub covers",
                title: isNl ? "Gebruik deze hub als inhoudelijke landingspagina" : "Use this hub as a content landing page",
                description: buildHubIntro(entry, locale).join(" "),
              }}
            >
              <div className="grid gap-6 md:grid-cols-2">
                {childPages.map((child) => (
                  <PublicSurfaceCard
                    key={child.slug}
                    title={child.pageTitle}
                    description={child.pageBrief}
                    leading={<BookOpen className="h-5 w-5" />}
                    footer={
                      <Link
                        href={withLocalePrefix(child.path, locale)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                      >
                        {isNl ? "Open gids" : "Open guide"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    }
                  >
                    <div />
                  </PublicSurfaceCard>
                ))}
              </div>
            </PublicSection>
            <RelatedLinksSection
              title={isNl ? "Verder verkennen" : "Explore next"}
              links={relatedLinks}
              locale={locale}
            />
          </>
        ) : (
          <>
            <PublicSection className="mt-10">
              <div className="rounded-[var(--radius-xl)] border border-border/70 bg-card p-5 text-sm leading-7 text-muted-foreground">
                {isNl
                  ? "Gebruik deze pagina als praktische gids, niet als medisch oordeel of excuus voor grote ongecontroleerde setupsprongen."
                  : "Use this page as a practical guide, not as medical judgment or an excuse for large uncontrolled setup changes."}
              </div>
            </PublicSection>

            {leafSections.map((section) => (
              <PublicSection
                key={section.title}
                className="mt-10"
                header={{ title: section.title }}
              >
                <div className="grid gap-4">
                  {section.items.map((item) => (
                    <PublicSurfaceCard key={item} description={item} leading={<ShieldCheck className="h-5 w-5" />}>
                      <div />
                    </PublicSurfaceCard>
                  ))}
                </div>
              </PublicSection>
            ))}

            <PublicSection
              className="mt-10"
              header={{
                eyebrow: "FAQ",
                title: "FAQ",
                icon: <HelpCircle className="h-5 w-5" />,
              }}
            >
              <div className="grid gap-4">
                {faqs.map((faq) => (
                  <PublicSurfaceCard
                    key={faq.q}
                    title={faq.q}
                    description={faq.a}
                    leading={<BookOpen className="h-5 w-5" />}
                  >
                    <div />
                  </PublicSurfaceCard>
                ))}
              </div>
            </PublicSection>

            <RelatedLinksSection
              title={isNl ? "Gerelateerde gidsen en tools" : "Related guides and tools"}
              links={relatedLinks}
              locale={locale}
            />

            {entry.cluster.includes("Pijn") || entry.cluster.includes("Pain") ? (
              <FitDisclaimer locale={locale} />
            ) : null}
          </>
        )}

        <PublicCtaBand
          className="mt-10"
          eyebrow={isNl ? "Volgende stap" : "Next step"}
          title={isNl ? "Klaar voor de volgende stap?" : "Ready for the next step?"}
          description={
            isNl
              ? "Gebruik de context van deze pagina en ga daarna door naar de best passende tool of flow."
              : "Use the context from this page, then continue into the best matching tool or workflow."
          }
          actions={
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix(primaryCta.href, locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="guide_primary_cta"
                  ctaLabel={primaryCta.label ?? entry.primaryCtaLabel}
                />
              }
            >
              {primaryCta.label ?? entry.primaryCtaLabel}
            </Button>
          }
        />
      </div>
    </PublicPageShell>
  );
}
