import Link from "next/link";
import { Button } from "@/components/ui";
import { EditorialCta } from "@/components/science/EditorialLayout";
import { scienceExtras } from "@/i18n/marketing/science";
import { editorialImageAlt } from "@/i18n/marketing/editorialImageAlt";
import type { Metadata } from "next";
import { Calculator, Gauge, Ruler, Sigma } from "lucide-react";
import {
  EditorialHero as PublicHero,
  EditorialShell as PublicPageShell,
  EditorialSection as PublicSection,
  EditorialCard as PublicSurfaceCard,
} from "@/components/science/EditorialLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { EditorialLinks as RelatedLinksSection } from "@/components/science/EditorialLayout";
import { engineCopy as copy } from "@/i18n/marketing/science";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { BRAND } from "@/config/brand";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/science/calculation-engine", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "article",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function CalculationEnginePage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const pageUrl = new URL(withLocalePrefix("/science/calculation-engine", locale), BRAND.siteUrl).toString();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.metadata.title,
    description: page.metadata.description,
    author: {
      "@type": "Organization",
      name: "BestBikeFit4U",
    },
    mainEntityOfPage: pageUrl,
  };

  return (
    <PublicPageShell>
      <JsonLd schema={articleJsonLd} />

      <PublicHero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        description={page.hero.description}
        chips={page.hero.chips}
        image="/illustrations/06-meetset.webp"
        imageAlt={editorialImageAlt[locale].measuringKit}
        illustration={<p>{page.hero.caption}</p>}
      />

      {page.sections.map((section, index) => (
        <PublicSection
          key={section.title}
          className={index === 0 ? "pt-0" : undefined}
          header={{
            eyebrow: section.eyebrow,
            title: section.title,
            description: section.description,
          }}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {section.cards.map((card, cardIndex) => {
              const Icon = [Ruler, Sigma, Gauge][cardIndex] ?? Calculator;
              return (
                <PublicSurfaceCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  leading={<Icon aria-hidden="true" className="h-5 w-5" />}
                />
              );
            })}
          </div>
        </PublicSection>
      ))}

      <RelatedLinksSection title={page.linksTitle} links={page.links} locale={locale} />
      <EditorialCta
        title={scienceExtras[locale].ctaTitle}
        description={scienceExtras[locale].ctaDescription}
        actions={
          <Button render={<Link href={withLocalePrefix("/calculators/bike-fit", locale)} />}>
            {scienceExtras[locale].fitCta}
          </Button>
        }
      />
    </PublicPageShell>
  );
}
