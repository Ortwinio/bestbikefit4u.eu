import { ContentDisclosure } from "@/components/calculators/CalculatorAnswerSection";
import { StackReachFigure } from "@/components/science/StackReachFigure";
import Link from "next/link";
import { Button } from "@/components/ui";
import { EditorialCta } from "@/components/science/EditorialLayout";
import { scienceExtras } from "@/i18n/marketing/science";
import { editorialImageAlt } from "@/i18n/marketing/editorialImageAlt";
import type { Metadata } from "next";
import { ArrowUpDown, Bike, MoveHorizontal } from "lucide-react";
import {
  EditorialHero as PublicHero,
  EditorialShell as PublicPageShell,
  EditorialSection as PublicSection,
  EditorialCard as PublicSurfaceCard,
} from "@/components/science/EditorialLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { EditorialLinks as RelatedLinksSection } from "@/components/science/EditorialLayout";
import { stackCopy as copy } from "@/i18n/marketing/science";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { BRAND } from "@/config/brand";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/science/stack-and-reach", locale);

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

export default async function StackAndReachPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const pageUrl = new URL(withLocalePrefix("/science/stack-and-reach", locale), BRAND.siteUrl).toString();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.metadata.title,
    description: page.metadata.description,
    author: {
      "@type": "Organization",
      name: "BikeFitBoost",
    },
    mainEntityOfPage: pageUrl,
  };

  return (
    <PublicPageShell>
      <JsonLd schema={articleJsonLd} />

      <PublicHero answerLocale={locale}
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        description={page.hero.description}
        chips={page.hero.chips}
        image="/illustrations/08-stack-en-reach.webp"
        imageAlt={editorialImageAlt[locale].stackReach}
        illustration={<p>{page.hero.caption}</p>}
      />

      <ContentDisclosure title={page.section.title}>
        <PublicSection
          header={{
            eyebrow: page.section.eyebrow,
            title: page.section.title,
            description: page.section.description,
          }}
        >
          <StackReachFigure locale={locale} />
          <div className="grid gap-5 md:grid-cols-2">
            {page.cards.map((card, index) => {
              const icon =
                index === 0 ? (
                  <ArrowUpDown className="h-5 w-5" />
                ) : index === 1 ? (
                  <MoveHorizontal className="h-5 w-5" />
                ) : (
                  <Bike className="h-5 w-5" />
                );

              return (
                <PublicSurfaceCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  leading={icon}
                />
              );
            })}
          </div>
        </PublicSection>
      </ContentDisclosure>

      <RelatedLinksSection title={page.linksTitle} links={page.links.slice(0, 3)} locale={locale} />
      <EditorialCta
        title={scienceExtras[locale].ctaTitle}
        description={scienceExtras[locale].ctaDescription}
        actions={
          <Button render={<Link href={withLocalePrefix("/calculators/frame-size", locale)} />}>
            {scienceExtras[locale].frameCta}
          </Button>
        }
      />
    </PublicPageShell>
  );
}
