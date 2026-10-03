import type { Metadata } from "next";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  EditorialCta as PublicCtaBand,
  EditorialHero as PublicHero,
  EditorialShell as PublicPageShell,
  EditorialSection as PublicSection,
  EditorialCard as PublicSurfaceCard,
} from "@/components/science/EditorialLayout";
import { EditorialLinks as RelatedLinksSection } from "@/components/science/EditorialLayout";
import { whyCopy as copy } from "@/i18n/marketing/why";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/why-bikefit-matters", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function WhyBikeFitMattersPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const pagePath = withLocalePrefix("/why-bikefit-matters", locale);

  return (
    <PublicPageShell>
      <div className="space-y-0">
        <PublicHero
          eyebrow={page.hero.eyebrow}
          title={page.hero.title}
          image="/illustrations/01-racefiets.webp"
          imageAlt=""
          description={page.hero.paragraphs.join(" ")}
          actions={
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="why_bikefit_matters_hero_cta"
                  ctaLabel={page.ctaLabel}
                />
              }
            >
              {page.ctaLabel}
            </Button>
          }
          chips={
            locale === "nl"
              ? ["Comfort en controle", "Meetbare aanpassingen", "NL en EN beschikbaar"]
              : ["Comfort and control", "Measurable adjustments", "Available in Dutch and English"]
          }
        />

        {/* TODO: restore testimonials only after provenance is verified (audit/12-notes.md). */}

        <PublicSection className="mt-10" header={{ title: page.whyTitle, description: page.whyIntro }}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <PublicSurfaceCard>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                {page.contactPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PublicSurfaceCard>
            <PublicSurfaceCard>
              {page.whyParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </PublicSurfaceCard>
          </div>
        </PublicSection>

        <PublicSection className="mt-10" header={{ title: page.benefitsTitle }}>
          <div className="grid gap-5 md:grid-cols-2">
            {page.benefits.map((block, index) => (
              <PublicSurfaceCard
                key={block.title}
                title={block.title}
                leading={String(index + 1).padStart(2, "0")}
              >
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
                {block.bullets ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                    {block.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </PublicSurfaceCard>
            ))}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{ title: page.adjustmentsTitle, description: page.adjustmentsIntro }}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <PublicSurfaceCard title={locale === "nl" ? "Wat er wordt aangepast" : "What gets adjusted"}>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                {page.fitAdjustmentItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PublicSurfaceCard>
            <PublicSurfaceCard
              title={locale === "nl" ? "Veelgebruikte principes" : "Common principles"}
              description={page.methodsIntro}
            >
              <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                {page.fitMethodItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </PublicSurfaceCard>
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{ title: page.considerTitle, description: page.considerIntro }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {page.considerFitItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-foreground shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </PublicSection>

        <RelatedLinksSection
          locale={locale}
          title={
            locale === "nl"
              ? "Lees verder met de pagina die je volgende keuze ondersteunt"
              : "Continue with the page that supports your next fit decision"
          }
          links={[
            {
              href: "/calculators/bike-fit",
              label: locale === "nl" ? "Bike fit calculator" : "Bike Fit Calculator",
              description:
                locale === "nl"
                  ? "Gebruik de hoofdcalculator als je fiets afstellen concreet wilt maken."
                  : "Use the main calculator when you want to turn bike fitting into concrete " +
                    "setup targets.",
            },
            {
              href: "/guides/road-bike-fit-guide",
              label: locale === "nl" ? "Racefiets fit gids" : "Road Bike Fit Guide",
              description:
                locale === "nl"
                  ? "Verbind comfort, controle en snelheid in één praktische gids."
                  : "Connect comfort, control, and speed in one practical guide.",
            },
            {
              href: "/science/bike-fit-methods",
              label: locale === "nl" ? "Bikefit-methodes uitgelegd" : "Bike Fitting Methods Explained",
              description:
                locale === "nl"
                  ? "Bekijk waarom zadelhoogte, KOPS en stack/reach als startpunten werken."
                  : "See why saddle height, KOPS, and stack/reach work as starting references.",
            },
            {
              href: "/science/stack-and-reach",
              label: locale === "nl" ? "Reach racefiets" : "Road bike reach",
              description:
                locale === "nl"
                  ? "Gebruik stack en reach wanneer framekeuze of cockpitlengte de echte vraag is."
                  : "Use stack and reach when frame choice or cockpit length is the real question.",
            },
          ]}
        />

        <PublicCtaBand
          className="mt-12"
          eyebrow={page.ctaEyebrow}
          title={page.ctaTitle}
          description={page.ctaBody}
          actions={
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="why_bikefit_matters_final_cta"
                  ctaLabel={page.ctaLabel}
                />
              }
            >
              {page.ctaLabel}
            </Button>
          }
        />
      </div>
    </PublicPageShell>
  );
}
