import { ContentDisclosure } from "@/components/calculators/CalculatorAnswerSection";
import Link from "next/link";
import { Button } from "@/components/ui";
import { EditorialCta } from "@/components/science/EditorialLayout";
import { scienceExtras } from "@/i18n/marketing/science";
import { editorialImageAlt } from "@/i18n/marketing/editorialImageAlt";
import type { Metadata } from "next";
import { Ruler } from "lucide-react";
import {
  EditorialHero as PublicHero,
  EditorialShell as PublicPageShell,
  EditorialSection as PublicSection,
  EditorialCard as PublicSurfaceCard,
} from "@/components/science/EditorialLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { EditorialLinks as RelatedLinksSection } from "@/components/science/EditorialLayout";
import { methodsCopy as copy } from "@/i18n/marketing/science";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { BRAND } from "@/config/brand";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/science/bike-fit-methods", locale);

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

export default async function BikeFitMethodsPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const pageUrl = new URL(withLocalePrefix("/science/bike-fit-methods", locale), BRAND.siteUrl).toString();
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
        image="/illustrations/02-zadelhoogte-meten.webp"
        imageAlt={editorialImageAlt[locale].saddleHeight}
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
          <div className="grid gap-5 md:grid-cols-2">
            {page.methods.map((method) => (
              <PublicSurfaceCard
                key={method.name}
                title={method.name}
                description={method.focus}
                leading={<Ruler className="h-5 w-5" />}
              >
                <div className="space-y-2 text-sm leading-6">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{page.section.strengthLabel}:</span>{" "}
                    {method.strength}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{page.section.limitLabel}:</span>{" "}
                    {method.limit}
                  </p>
                </div>
              </PublicSurfaceCard>
            ))}
          </div>
        </PublicSection>
      </ContentDisclosure>

      <RelatedLinksSection title={page.linksTitle} links={page.links.slice(0, 3)} locale={locale} />
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
