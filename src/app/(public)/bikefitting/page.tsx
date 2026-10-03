import { EditorialFaq } from "@/components/science/EditorialLayout";
import { editorialImageAlt } from "@/i18n/marketing/editorialImageAlt";
import {
  nlLandingCopy as page,
  nlLandingFaq as faqItems,
  nlLandingLinks as relatedLinks,
} from "@/i18n/marketing/landing";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import {
  EditorialCta as PublicCtaBand,
  EditorialHero as PublicHero,
  EditorialShell as PublicPageShell,
  EditorialSection as PublicSection,
  EditorialCard as PublicSurfaceCard,
} from "@/components/science/EditorialLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { EditorialLinks as RelatedLinksSection } from "@/components/science/EditorialLayout";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { BRAND } from "@/config/brand";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildBreadcrumbListSchema, buildFaqPageSchema } from "@/lib/seo/jsonLd";
import { buildSelectiveLocaleAlternates } from "@/lib/seo/pageAlternates";

const PAGE_PATH = "/bikefitting";
const ALTERNATES = buildSelectiveLocaleAlternates({ nl: PAGE_PATH }, "nl");

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  if (locale !== "nl") {
    return {
      title: "Page not found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: "Bikefitting thuis beginnen | BestBikeFit4U",
    description:
      "Ontdek hoe online bikefitting je helpt met een praktisch startplan voor " +
      "zadelhoogte, reach, drop en comfort. Begin thuis en zie wanneer een fysieke " +
      "fitter nodig is.",
    keywords: [
      "bikefitting",
      "online bikefitting",
      "bikefit berekenen",
      "bikefitting thuis",
      "digitale bikefit",
    ],
    openGraph: {
      title: "Bikefitting thuis beginnen | BestBikeFit4U",
      description:
        "Een productgerichte landingspagina voor rijders die online bikefitting " +
        "willen gebruiken als eerste stap.",
      type: "website",
      url: ALTERNATES.canonical,
    },
    alternates: ALTERNATES,
  };
}

export default async function BikefittingPage() {
  const locale = await getRequestLocale();

  if (locale !== "nl") {
    notFound();
  }

  const pagePath = withLocalePrefix(PAGE_PATH, "nl");
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const homeUrl = new URL(withLocalePrefix("/", "nl"), BRAND.siteUrl).toString();

  return (
    <PublicPageShell>
      <JsonLd
        schema={[
          buildBreadcrumbListSchema([
            { name: "Home", item: homeUrl },
            { name: "Bikefitting", item: pageUrl },
          ]),
          buildFaqPageSchema([...faqItems]),
        ]}
      />

      <PublicHero
        imageAlt={editorialImageAlt.nl.cockpit}
        eyebrow={page.eyebrow}
        title={page.heroTitle}
        description={page.intro}
        actions={
          <>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", "nl")}
                  locale="nl"
                  pagePath={pagePath}
                  section="hero_primary"
                  ctaLabel={page.text4}
                />
              }
            >
              {page.text5}
            </Button>
            <Button
              variant="outline"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", "nl")}
                  locale="nl"
                  pagePath={pagePath}
                  section="hero_secondary"
                  ctaLabel={page.text6}
                />
              }
            >
              {page.text7}
            </Button>
          </>
        }
      />

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: page.text8,
          title: page.text9,
          description: page.text10,
        }}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <PublicSurfaceCard title={page.text11} description={page.text12} leading="01">
            <p className="text-sm leading-6 text-muted-foreground">{page.text13}</p>
          </PublicSurfaceCard>
          <PublicSurfaceCard title={page.text14} description={page.text15} leading="02">
            <p className="text-sm leading-6 text-muted-foreground">{page.text16}</p>
          </PublicSurfaceCard>
          <PublicSurfaceCard title={page.text17} description={page.text18} leading="03">
            <p className="text-sm leading-6 text-muted-foreground">{page.text19}</p>
          </PublicSurfaceCard>
        </div>
      </PublicSection>

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: page.text20,
          title: page.text21,
          description: page.text22,
        }}
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <PublicSurfaceCard title={page.text23} leading={<ArrowRight className="h-5 w-5" />}>
            <ul className="space-y-3 text-sm leading-6 text-foreground">
              <li>{page.text24}</li>
              <li>{page.text25}</li>
              <li>{page.text26}</li>
              <li>{page.text27}</li>
            </ul>
          </PublicSurfaceCard>
          <PublicSurfaceCard title={page.text28} leading={<ShieldCheck className="h-5 w-5" />}>
            <ul className="space-y-3 text-sm leading-6 text-foreground">
              <li>{page.text29}</li>
              <li>{page.text30}</li>
              <li>{page.text31}</li>
            </ul>
          </PublicSurfaceCard>
        </div>
      </PublicSection>

      <RelatedLinksSection locale="nl" title={page.text32} links={relatedLinks} />

      <EditorialFaq eyebrow={page.text33} title={page.text34} items={faqItems} />

      <div className="mt-10">
        <PublicCtaBand
          eyebrow={page.text35}
          title={page.text36}
          description={page.text37}
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", "nl")}
                    locale="nl"
                    pagePath={pagePath}
                    section="closing_primary"
                    ctaLabel={page.text38}
                  />
                }
              >
                {page.text39}
              </Button>
              <Button variant="outline" render={<Link href={withLocalePrefix("/login", "nl")} />}>
                {page.text40}
              </Button>
            </>
          }
          aside={page.text41}
        />
      </div>
    </PublicPageShell>
  );
}
