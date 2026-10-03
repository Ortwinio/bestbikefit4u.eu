import { EditorialFaq } from "@/components/science/EditorialLayout";
import { editorialImageAlt } from "@/i18n/marketing/editorialImageAlt";
import {
  enLandingCopy as page,
  enLandingFaq as faqItems,
  enLandingLinks as relatedLinks,
} from "@/i18n/marketing/landing";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, Gauge } from "lucide-react";
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

const PAGE_PATH = "/bike-fitting";
const ALTERNATES = buildSelectiveLocaleAlternates({ en: PAGE_PATH }, "en");

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  if (locale !== "en") {
    return {
      title: "Pagina niet gevonden",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: "Bike fitting at home: where to start | BestBikeFit4U",
    description:
      "Learn how to start bike fitting at home with better order, clearer setup " +
      "targets, and a practical handoff into the bike fit calculator.",
    keywords: [
      "bike fitting",
      "online bike fitting",
      "bike fitting at home",
      "virtual bike fitting",
      "how to fit a bike",
    ],
    openGraph: {
      title: "Bike fitting at home: where to start | BestBikeFit4U",
      description:
        "An English landing page for riders who want a practical first step into " + "online bike fitting.",
      type: "website",
      url: ALTERNATES.canonical,
    },
    alternates: ALTERNATES,
  };
}

export default async function BikeFittingPage() {
  const locale = await getRequestLocale();

  if (locale !== "en") {
    notFound();
  }

  const pagePath = withLocalePrefix(PAGE_PATH, "en");
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const homeUrl = new URL(withLocalePrefix("/", "en"), BRAND.siteUrl).toString();

  return (
    <PublicPageShell>
      <JsonLd
        schema={[
          buildBreadcrumbListSchema([
            { name: "Home", item: homeUrl },
            { name: "Bike fitting", item: pageUrl },
          ]),
          buildFaqPageSchema([...faqItems]),
        ]}
      />

      <PublicHero
        imageAlt={editorialImageAlt.en.cockpit}
        eyebrow={page.eyebrow}
        title={page.heroTitle}
        description={page.intro}
        actions={
          <>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", "en")}
                  locale="en"
                  pagePath={pagePath}
                  section="hero_primary"
                  ctaLabel={page.text4}
                />
              }
            >
              {page.text5}
            </Button>
            <Button variant="outline" render={<Link href={withLocalePrefix("/how-it-works", "en")} />}>
              {page.text6}
            </Button>
          </>
        }
      />

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: page.text7,
          title: page.text8,
          description: page.text9,
        }}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <PublicSurfaceCard title={page.text10} description={page.text11} leading="01">
            <p className="text-sm leading-6 text-muted-foreground">{page.text12}</p>
          </PublicSurfaceCard>
          <PublicSurfaceCard title={page.text13} description={page.text14} leading="02">
            <p className="text-sm leading-6 text-muted-foreground">{page.text15}</p>
          </PublicSurfaceCard>
          <PublicSurfaceCard title={page.text16} description={page.text17} leading="03">
            <p className="text-sm leading-6 text-muted-foreground">{page.text18}</p>
          </PublicSurfaceCard>
        </div>
      </PublicSection>

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: page.text19,
          title: page.text20,
          description: page.text21,
        }}
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <PublicSurfaceCard title={page.text22} leading={<Gauge className="h-5 w-5" />}>
            <ol className="space-y-3 text-sm leading-6 text-foreground">
              <li>{page.text23}</li>
              <li>{page.text24}</li>
              <li>{page.text25}</li>
              <li>{page.text26}</li>
              <li>{page.text27}</li>
            </ol>
          </PublicSurfaceCard>
          <PublicSurfaceCard title={page.text28} leading={<ClipboardList className="h-5 w-5" />}>
            <ul className="space-y-3 text-sm leading-6 text-foreground">
              <li>{page.text29}</li>
              <li>{page.text30}</li>
              <li>{page.text31}</li>
            </ul>
          </PublicSurfaceCard>
        </div>
      </PublicSection>

      <RelatedLinksSection locale="en" title={page.text32} links={relatedLinks} />

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
                    href={withLocalePrefix("/calculators/bike-fit", "en")}
                    locale="en"
                    pagePath={pagePath}
                    section="closing_primary"
                    ctaLabel={page.text38}
                  />
                }
              >
                {page.text39}
              </Button>
              <Button
                variant="outline"
                render={<Link href={withLocalePrefix("/calculators/saddle-height", "en")} />}
              >
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
