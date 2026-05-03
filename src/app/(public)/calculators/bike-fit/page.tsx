import type { Metadata } from "next";
import { Compass, Gauge, ShieldCheck } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { CampaignCtaGroup } from "@/components/campaign/CampaignCtaGroup";
import {
  CONSUMER_CAMPAIGN_CONFIG,
  getConsumerCampaignCopy,
  isConsumerCampaignActive,
} from "@/config/commercial";
import {
  PublicCtaBand,
  PublicFeatureCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { getLocalizedPublicCalculatorPath } from "@/lib/public-calculators";
import { buildHowToSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { BikeFitCalculatorForm } from "./BikeFitCalculatorForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/bike-fit", locale);

  return {
    title: isNl
      ? "Gratis bike fit calculator | BestBikeFit4U"
      : "Free Bike Fit Calculator | BestBikeFit4U",
    description: isNl
      ? "Bereken een gratis eerste inschatting voor zadelhoogte, reach, drop en framedoelen op basis van je lichaamsmaten en rijdoel."
      : "Calculate a free first-pass estimate for saddle height, reach, drop, and frame targets based on your body measurements and riding goal.",
    keywords: isNl
      ? ["bike fit calculator", "gratis bikefit", "online bikefitting"]
      : ["bike fit calculator", "free bike fit", "online bike fitting tool"],
    openGraph: {
      title: isNl ? "Gratis bike fit calculator" : "Free Bike Fit Calculator",
      description: isNl
        ? "Krijg direct een eerste bike-fit inschatting op basis van je maten."
        : "Get a practical first-pass bike-fit estimate from your measurements.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

function buildFaqs(isNl: boolean) {
  return isNl
    ? [
        {
          q: "Hoe nauwkeurig is deze gratis bike fit calculator?",
          a: "De calculator geeft een bruikbare eerste inschatting op basis van je maten en rijdoel. In het dashboard kun je daarna verder verfijnen met meer context rond je huidige setup.",
        },
        {
          q: "Welke waarde moet ik als eerste aanpassen?",
          a: "Begin meestal met zadelhoogte en algemene cockpitbalans. Daarna kun je reach, drop en framedoelen stap voor stap verfijnen.",
        },
      ]
    : [
        {
          q: "How accurate is this free bike-fit calculator?",
          a: "It provides a useful first-pass estimate based on your measurements and riding goal. Inside the dashboard you can refine it further with more context around your current setup.",
        },
        {
          q: "Which value should I adjust first?",
          a: "Start with saddle height and overall cockpit balance. Then refine reach, drop, and frame targets step by step.",
        },
      ];
}

export default async function BikeFitCalculatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/calculators/bike-fit", locale);
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = buildFaqs(isNl);
  const trustPoints = isNl
    ? [
        {
          title: "Heldere start, geen loze precisie",
          description:
            "Je ziet direct welke richting logisch is voor zadelhoogte, reach en drop, zonder te doen alsof een publieke intake al je volledige fit vervangt.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Zelfde rekenmotor als het product",
          description:
            "Deze calculator gebruikt dezelfde fitlogica als het dashboard. De publieke versie houdt het alleen bewust bij een veilige eerste stap.",
          icon: <Gauge className="h-5 w-5" />,
        },
        {
          title: "Gebouwd voor de volgende beslissing",
          description:
            "Gebruik de uitkomst om een huidige setup, een nieuwe fiets of een verdere fitanalyse beter te beoordelen.",
          icon: <Compass className="h-5 w-5" />,
        },
      ]
    : [
        {
          title: "Clear starting point, no fake precision",
          description:
            "You immediately see a sensible direction for saddle height, reach, and drop, without pretending a public intake replaces a full fit.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Same fit engine as the product",
          description:
            "This calculator uses the same fit logic as the dashboard. The public version simply keeps the output to a safe first step.",
          icon: <Gauge className="h-5 w-5" />,
        },
        {
          title: "Built for the next decision",
          description:
            "Use the result to assess your current setup, shortlist a new bike, or decide whether you need deeper fit work.",
          icon: <Compass className="h-5 w-5" />,
        },
      ];

  return (
    <PublicPageShell className="text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: isNl ? "BestBikeFit4U bike fit calculator" : "BestBikeFit4U Bike Fit Calculator",
            description: isNl
              ? "Gratis bike fit calculator voor een eerste inschatting van zadelhoogte, reach, drop en framedoelen."
              : "Free bike-fit calculator for a practical first-pass estimate of saddle height, reach, drop, and frame targets.",
            url: pageUrl,
          }),
          buildHowToSchema({
            name: isNl ? "Hoe gebruik je de bike fit calculator" : "How to use the bike-fit calculator",
            description: isNl
              ? "Meet lengte en binnenbeenlengte, kies je rijdoel en beoordeel flexibiliteit en core als startpunt."
              : "Measure height and inseam, choose your riding goal, and rate flexibility and core stability as a starting point.",
            steps: isNl
              ? [
                  "Meet lengte en binnenbeenlengte zorgvuldig.",
                  "Kies je fietscategorie en rijdoel.",
                  "Vul flexibiliteit en core-stabiliteit in.",
                  "Gebruik de uitkomst als startpunt voor je setup.",
                ]
              : [
                  "Measure height and inseam carefully.",
                  "Choose your bike category and riding goal.",
                  "Enter flexibility and core stability.",
                  "Use the result as a starting point for your setup.",
                ],
          }),
        ]}
      />

      <PublicHero
        eyebrow="BestBikeFit4U calculator"
        title={isNl ? "Gratis bike fit calculator" : "Free Bike Fit Calculator"}
        description={
          isNl
            ? "Bereken een eerste inschatting voor zadelhoogte, reach, drop en framedoelen op basis van je lichaamsmaten en rijdoel. Het is een snelle publieke intake die je helpt met je volgende stap."
            : "Calculate a first-pass estimate for saddle height, reach, drop, and frame targets from your body measurements and riding goal. It is a fast public intake that helps you decide the next step."
        }
        chips={
          isNl
            ? ["NL en EN beschikbaar", "Gratis publieke intake", "Veilig startpunt"]
            : ["Available in Dutch and English", "Free public intake", "Safe starting point"]
        }
      />

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: isNl ? "Waarom rijders hiermee starten" : "Why riders start here",
          title: isNl
            ? "Betrouwbaar genoeg om de juiste volgende stap te kiezen"
            : "Reliable enough to choose the right next step",
          description: isNl
            ? "De publieke calculator is bedoeld om je richting te geven, niet om schijnzekerheid te verkopen."
            : "The public calculator is built to give you direction, not to sell false certainty.",
        }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {trustPoints.map((point) => (
            <PublicFeatureCard
              key={point.title}
              icon={point.icon}
              title={point.title}
              description={point.description}
            />
          ))}
        </div>
      </PublicSection>

      <BikeFitCalculatorForm isNl={isNl} />

      <PublicCtaBand
        className="mt-10"
        eyebrow={isNl ? "Hoe verder?" : "What's next?"}
        title={isNl ? "Verfijn de uitkomst in je account" : "Refine the result in your account"}
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
              startHref={withLocalePrefix("/login", locale)}
              startSection="bike_fit_result"
              donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
              donateSection="bike_fit_campaign_donate"
              startLabel={isNl ? "Meld je aan om te bewaren" : "Sign in to save results"}
              donateLabel={campaign.donateCta}
            />
          ) : (
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="bike_fit_result"
                    ctaLabel={isNl ? "Meld je aan om te bewaren" : "Sign in to save results"}
                  />
                }
              >
                {isNl ? "Meld je aan om te bewaren" : "Sign in to save results"}
              </Button>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/pricing", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="bike_fit_pricing_cta"
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
          title: "FAQ",
          description: isNl
            ? "Korte antwoorden op de belangrijkste vragen."
            : "Short answers to the most common questions.",
        }}
      >
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-border/80 bg-card px-5 py-5 shadow-sm"
            >
              <h3 className="font-semibold text-foreground">{faq.q}</h3>
              <p className="mt-2 text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </PublicSection>

      <section className="mt-10">
        <RelatedLinksSection
          title={isNl ? "Gerelateerde tools en gidsen" : "Related tools and guides"}
          links={getRelatedLinks("bike-fit", locale)}
          locale={locale}
        />
      </section>
    </PublicPageShell>
  );
}
