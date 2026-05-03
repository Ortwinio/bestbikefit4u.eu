import type { Metadata } from "next";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { CampaignCtaGroup } from "@/components/campaign/CampaignCtaGroup";
import {
  CONSUMER_CAMPAIGN_CONFIG,
  getConsumerCampaignCopy,
  isConsumerCampaignActive,
} from "@/config/commercial";
import { Button } from "@/components/prototyper-ui/ui/button";
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
import { buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  getFirstSearchParam,
  parseBikeCategory,
  parsePositiveNumberParam,
  type SearchParamRecord,
} from "@/lib/publicCalculators";
import { CrankLengthCalculatorForm } from "./CrankLengthCalculatorForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/crank-length", locale);

  return {
    title: isNl ? "Cranklengte calculator | BestBikeFit4U" : "Crank Length Calculator | BestBikeFit4U",
    description: isNl
      ? "Bereken een praktisch startpunt voor cranklengte op basis van binnenbeenlengte en fietsdiscipline."
      : "Calculate a practical crank-length starting point based on inseam and bike category.",
    keywords: isNl
      ? ["cranklengte calculator", "fiets crankmaat", "cranklengte fit"]
      : ["crank length calculator", "bike crank size", "cycling crank length fit"],
    openGraph: {
      title: isNl ? "Cranklengte calculator" : "Crank Length Calculator",
      description: isNl
        ? "Vind een eerste cranklengte-aanbeveling op basis van binnenbeenlengte en categorie."
        : "Find a first-pass crank-length recommendation based on inseam and category.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

interface CrankLengthCalculatorPageProps {
  searchParams: Promise<SearchParamRecord>;
}

export default async function CrankLengthCalculatorPage({
  searchParams,
}: CrankLengthCalculatorPageProps) {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const params = await searchParams;
  const inseamCm = parsePositiveNumberParam(params, "inseamCm") ?? undefined;
  const category = parseBikeCategory(getFirstSearchParam(params, "category"));
  const pagePath = withLocalePrefix("/calculators/crank-length", locale);
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = isNl
    ? [
        {
          q: "Maakt een kortere crank altijd comfortabeler?",
          a: "Niet altijd. Cranklengte moet passen bij je binnenbeenlengte, categorie en positie-doel, niet bij een algemene regel.",
        },
        {
          q: "Waarom is de cranklengte voor MTB soms korter?",
          a: "MTB-opstellingen kiezen soms iets korter voor meer pedaalvrijheid en controle op terrein.",
        },
      ]
    : [
        {
          q: "Does a shorter crank always improve comfort?",
          a: "Not always. Crank length needs to match your inseam, bike category, and position goals rather than following a blanket rule.",
        },
        {
          q: "Why is MTB crank guidance sometimes shorter?",
          a: "MTB setups may favor slightly shorter cranks for pedal clearance and terrain control.",
        },
      ];

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_26%,var(--background)_74%)_100%)] text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: isNl ? "BestBikeFit4U cranklengte calculator" : "BestBikeFit4U Crank Length Calculator",
            description: isNl
              ? "Bereken een praktisch startpunt voor cranklengte op basis van binnenbeenlengte en categorie."
              : "Calculate a practical crank-length starting point based on inseam and category.",
            url: pageUrl,
          }),
        ]}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow="BestBikeFit4U calculator"
          title={isNl ? "Cranklengte calculator" : "Crank Length Calculator"}
          description={
            isNl
              ? "Krijg een praktisch startpunt voor cranklengte voordat je componenten verandert."
              : "Get a practical starting point for crank length before you change components."
          }
          chips={
            isNl
              ? ["Snelle eerste check", "Praktisch componentadvies", "Gratis startpunt"]
              : ["Fast first check", "Practical component guidance", "Free starting point"]
          }
        />

        <CrankLengthCalculatorForm
          isNl={isNl}
          initialInseamCm={inseamCm}
          initialCategory={category}
        />

        <PublicCtaBand
          className="mt-10"
          eyebrow={isNl ? "Hoe verder?" : "What's next?"}
          title={
            isNl ? "Gebruik dit als springplank, niet als eindstation" : "Use this as a springboard, not the finish line"
          }
          description={
            isNl
              ? "Maak een gratis account aan om deze resultaten op te slaan, je setup met meer detail te verfijnen en veranderingen bij te houden."
              : "Create a free account to save these results, refine your setup with more detail, and track changes over time."
          }
          actions={
            campaignActive ? (
              <CampaignCtaGroup
                locale={locale}
                pagePath={pagePath}
                startHref={withLocalePrefix("/calculators/bike-fit", locale)}
                startSection="crank_length_result"
                donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
                donateSection="crank_length_campaign_donate"
                startLabel={isNl ? "Start gratis bike fit" : "Start free bike fit"}
                donateLabel={campaign.donateCta}
              />
            ) : (
              <>
                <Button
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix("/calculators/bike-fit", locale)}
                      locale={locale}
                      pagePath={pagePath}
                      section="crank_length_result"
                      ctaLabel={isNl ? "Start gratis bike fit" : "Start free bike fit"}
                    />
                  }
                >
                  {isNl ? "Start gratis bike fit" : "Start free bike fit"}
                </Button>
                <Button
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix("/pricing", locale)}
                      locale={locale}
                      pagePath={pagePath}
                      section="crank_length_pricing_cta"
                      ctaLabel={isNl ? "Bekijk prijzen" : "Compare plans"}
                    />
                  }
                  variant="outline"
                >
                  {isNl ? "Bekijk prijzen" : "Compare plans"}
                </Button>
              </>
            )
          }
          aside={
            isNl
              ? "De calculator geeft een praktisch startpunt. Een persoonlijke fitter kan toegevoegde waarde bieden bij complexe biomechanische kwesties."
              : "The calculator gives a practical starting point. An in-person fitter can add value for complex biomechanical issues."
          }
        />

        <PublicSection
          className="mt-10"
          header={{
            title: isNl ? "Veelgestelde vragen" : "FAQ",
          }}
        >
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <PublicSurfaceCard key={faq.q} title={faq.q} description={faq.a}>
                <div />
              </PublicSurfaceCard>
            ))}
          </div>
        </PublicSection>

        <RelatedLinksSection
          title={isNl ? "Gerelateerde tools en gidsen" : "Related tools and guides"}
          links={getRelatedLinks("crank-length", locale)}
          locale={locale}
        />
      </div>
    </PublicPageShell>
  );
}
