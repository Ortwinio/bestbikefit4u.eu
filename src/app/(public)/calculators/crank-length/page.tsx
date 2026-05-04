import type { Metadata } from "next";
import { Gauge, Ruler, ShieldCheck } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { CampaignCtaGroup } from "@/components/campaign/CampaignCtaGroup";
import {
  CONSUMER_CAMPAIGN_CONFIG,
  getConsumerCampaignCopy,
  isConsumerCampaignActive,
} from "@/config/commercial";
import { Button } from "@/components/prototyper-ui/ui/button";
import {
  FeatureIconCard,
  type FeatureIconCardColor,
  PublicCtaBand,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
  RatingBadge,
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

const TRUST_POINT_COLORS: FeatureIconCardColor[] = ["teal", "primary", "green"];

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
  const trustPoints = isNl
    ? [
        {
          title: "Conservatief component-startpunt",
          description:
            "De calculator geeft een praktische eerste richting zonder te doen alsof cranklengte los staat van je totale positie.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Gebaseerd op binnenbeenlengte",
          description:
            "Binnenbeenlengte blijft de bruikbaarste publieke invoer om onlogische crankkeuzes sneller uit te filteren.",
          icon: <Ruler className="h-5 w-5" />,
        },
        {
          title: "Helpt keuzes vernauwen",
          description:
            "Gebruik de uitkomst om realistischer te vergelijken tussen 165, 170, 172.5 of 175 mm voordat je onderdelen vervangt.",
          icon: <Gauge className="h-5 w-5" />,
        },
      ]
    : [
        {
          title: "Conservative component starting point",
          description:
            "The calculator gives you a practical first direction without pretending crank length exists independently from your wider position.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Built on inseam first",
          description:
            "Inseam remains the most useful public input for ruling out implausible crank choices more quickly.",
          icon: <Ruler className="h-5 w-5" />,
        },
        {
          title: "Helps narrow the choice",
          description:
            "Use the result to compare 165, 170, 172.5, or 175 mm more realistically before you replace parts.",
          icon: <Gauge className="h-5 w-5" />,
        },
      ];
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
        <div>
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
          <div className="mt-4">
            <RatingBadge rating="4.8" count={isNl ? "380+ rijders" : "380+ riders"} />
          </div>
        </div>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Waarom dit vertrouwen wekt" : "Why this builds trust",
            title: isNl
              ? "Praktische componentkeuze zonder schijnzekerheid"
              : "Practical component choice without fake certainty",
            description: isNl
              ? "Deze publieke calculator helpt je de keuze versmallen voordat je grotere veranderingen aan je fiets doet."
              : "This public calculator helps you narrow the choice before you make larger changes to your bike.",
          }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {trustPoints.map((point, index) => (
              <FeatureIconCard
                key={point.title}
                icon={point.icon}
                title={point.title}
                description={point.description}
                color={TRUST_POINT_COLORS[index] ?? "primary"}
              />
            ))}
          </div>
        </PublicSection>

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
