import { DEFAULT_SOCIAL_IMAGE } from "@/lib/seo/social-image";
import { fitPageDetails } from "@/i18n/calculators/fitPageDetails";
import type { Metadata } from "next";
import { Compass, Gauge, ShieldCheck } from "lucide-react";
import {
  FeatureIconCard,
  type FeatureIconCardColor,
  PublicBreadcrumbs,
  PublicPageShell,
  PublicSection,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { getDictionary } from "@/i18n/getDictionary";
import {
  CALCULATOR_AGGREGATE_RATING,
  buildBreadcrumbListSchema,
  buildHowToSchema,
  buildWebApplicationSchema,
} from "@/lib/seo/jsonLd";
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
      ? "Bereken een gratis eerste inschatting voor zadelhoogte, reach, drop en framedoelen op " +
        "basis van je lichaamsmaten en rijdoel."
      : "Calculate a free first-pass estimate for saddle height, reach, drop, and frame " +
        "targets based on your body measurements and riding goal.",
    keywords: isNl
      ? ["bike fit calculator", "gratis bikefit", "online bikefitting"]
      : ["bike fit calculator", "free bike fit", "online bike fitting tool"],
    openGraph: {
      images: [DEFAULT_SOCIAL_IMAGE],
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
          a:
            "De calculator geeft een bruikbare eerste inschatting op basis van je maten en " +
            "rijdoel. In het dashboard kun je daarna verder verfijnen met meer context rond je " +
            "huidige setup.",
        },
        {
          q: "Welke waarde moet ik als eerste aanpassen?",
          a:
            "Begin meestal met zadelhoogte en algemene cockpitbalans. Daarna kun je reach, drop en " +
            "framedoelen stap voor stap verfijnen.",
        },
      ]
    : [
        {
          q: "How accurate is this free bike-fit calculator?",
          a:
            "It provides a useful first-pass estimate based on your measurements and riding goal. " +
            "Inside the dashboard you can refine it further with more context around your current " +
            "setup.",
        },
        {
          q: "Which value should I adjust first?",
          a:
            "Start with saddle height and overall cockpit balance. Then refine reach, drop, and " +
            "frame targets step by step.",
        },
      ];
}

const TRUST_POINT_COLORS: FeatureIconCardColor[] = ["teal", "primary", "green"];

export default async function BikeFitCalculatorPage() {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/calculators/bike-fit", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = buildFaqs(isNl);
  const trustPoints = isNl
    ? [
        {
          title: "Heldere start, geen loze precisie",
          description:
            "Je ziet direct welke richting logisch is voor zadelhoogte, reach en drop, zonder te " +
            "doen alsof een publieke intake al je volledige fit vervangt.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Zelfde rekenmotor als het product",
          description:
            "Deze calculator gebruikt dezelfde fitlogica als het dashboard. De publieke versie " +
            "houdt het alleen bewust bij een veilige eerste stap.",
          icon: <Gauge className="h-5 w-5" />,
        },
        {
          title: "Gebouwd voor de volgende beslissing",
          description:
            "Gebruik de uitkomst om een huidige setup, een nieuwe fiets of een verdere fitanalyse " +
            "beter te beoordelen.",
          icon: <Compass className="h-5 w-5" />,
        },
      ]
    : [
        {
          title: "Clear starting point, no fake precision",
          description:
            "You immediately see a sensible direction for saddle height, reach, and drop, without " +
            "pretending a public intake replaces a full fit.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Same fit engine as the product",
          description:
            "This calculator uses the same fit logic as the dashboard. The public version simply " +
            "keeps the output to a safe first step.",
          icon: <Gauge className="h-5 w-5" />,
        },
        {
          title: "Built for the next decision",
          description:
            "Use the result to assess your current setup, shortlist a new bike, or decide whether " +
            "you need deeper fit work.",
          icon: <Compass className="h-5 w-5" />,
        },
      ];

  return (
    <div className="text-foreground">
      <JsonLd
        schema={[
          buildBreadcrumbListSchema([
            {
              name: isNl ? "Home" : "Home",
              item: new URL(withLocalePrefix("/", locale), BRAND.siteUrl).toString(),
            },
            { name: isNl ? "Bike fit calculator" : "Bike Fit Calculator", item: pageUrl },
          ]),
          buildWebApplicationSchema({
            name: isNl ? "BestBikeFit4U bike fit calculator" : "BestBikeFit4U Bike Fit Calculator",
            description: isNl
              ? "Gratis bike fit calculator voor een eerste inschatting van zadelhoogte, reach, drop " +
                "en framedoelen."
              : "Free bike-fit calculator for a practical first-pass estimate of saddle height, reach, " +
                "drop, and frame targets.",
            url: pageUrl,
            aggregateRating: CALCULATOR_AGGREGATE_RATING,
          }),
          buildHowToSchema({
            name: isNl
              ? "Hoe gebruik je de bike fit calculator"
              : "How to use the bike-fit calculator",
            description: fitPageDetails[locale].bikeDescription,
            steps: isNl
              ? [
                  "Meet lengte en binnenbeenlengte zorgvuldig.",
                  "Kies je fietscategorie en rijdoel.",
                  fitPageDetails.nl.bikeCoreStep,
                  fitPageDetails.nl.bikeResultStep,
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

      <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 xl:px-16">
        <PublicBreadcrumbs
          items={[
            { label: isNl ? "Home" : "Home", href: withLocalePrefix("/", locale) },
            { label: isNl ? "Bike fit calculator" : "Bike Fit Calculator" },
          ]}
        />
      </div>
      <BikeFitCalculatorForm isNl={isNl} copy={dictionary.bikeFitCalculator} />
      <PublicPageShell className="pt-0 md:pt-0">
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
    </div>
  );
}
