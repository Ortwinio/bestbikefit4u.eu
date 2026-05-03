import type { Metadata } from "next";
import { ArrowUpDown, Gauge, ShieldCheck } from "lucide-react";
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
import { buildFaqPageSchema, buildHowToSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { GearingCalculatorForm } from "./GearingCalculatorForm";

function buildFaqs(isNl: boolean) {
  return isNl
    ? [
        {
          q: "Wat is mijn lichtste en zwaarste versnelling?",
          a: "De lichtste versnelling is je kleinste kettingring met de grootste krans. De zwaarste versnelling is je grootste kettingring met de kleinste krans.",
        },
        {
          q: "Waarom helpt trapfrequentie bij verzetadvies?",
          a: "Dezelfde versnelling voelt anders als je sneller of langzamer trapt. De calculator laat daarom de snelheid bij jouw gekozen cadans zien.",
        },
        {
          q: "Is 1x altijd genoeg voor beklimmingen?",
          a: "Niet altijd. 1x kan prima werken, maar voor lange of steile beklimmingen is een ruimer bereik vaak prettiger.",
        },
      ]
    : [
        {
          q: "What are my easiest and hardest gears?",
          a: "Your easiest gear is your smallest chainring paired with the largest cassette cog. Your hardest gear is your largest chainring paired with the smallest cog.",
        },
        {
          q: "Why does cadence matter in a gearing calculator?",
          a: "The same gear feels very different if you spin faster or slower. That is why the calculator shows speed at your chosen cadence.",
        },
        {
          q: "Is 1x always enough for climbing?",
          a: "Not always. 1x can work well, but long or steep climbs usually feel better with a wider range.",
        },
      ];
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/gearing", locale);

  return {
    title: isNl ? "Verzet calculator | BestBikeFit4U" : "Gearing Calculator | BestBikeFit4U",
    description: isNl
      ? "Bereken je lichtste en zwaarste versnelling, snelheid bij cadans en een snelle kliminschatting op basis van kettingring, cassette en wielmaat."
      : "Calculate your easiest and hardest gear, speed at cadence, and a quick climb-readiness verdict from chainring, cassette, and wheel size.",
    keywords: isNl
      ? ["verzet calculator", "gear ratio calculator", "klimverzet calculator", "cassette calculator"]
      : ["gearing calculator", "gear ratio calculator", "climb gearing calculator", "cassette calculator"],
    openGraph: {
      title: isNl ? "Verzet calculator" : "Gearing Calculator",
      description: isNl
        ? "Zie direct je lichtste versnelling, zwaarste versnelling en kliminschatting."
        : "See your easiest gear, hardest gear, and climb-readiness verdict immediately.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function GearingCalculatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/calculators/gearing", locale);
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = buildFaqs(isNl);
  const trustPoints = isNl
    ? [
        {
          title: "Exacte drivetrain math",
          description:
            "Chainring, cassette en wielmaat worden direct in ratio, development en snelheid omgezet.",
          icon: <ArrowUpDown className="h-5 w-5" />,
        },
        {
          title: "Eerlijke kliminschatting",
          description:
            "De tool zegt niet meer dan ze weet: de klimuitkomst is een bruikbare vuistregel, geen vermogensmeter.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Directe upgrade-richting",
          description:
            "Je ziet meteen of een grotere cassette, kleiner binnenblad of ruimer 1x-bereik logischer is.",
          icon: <Gauge className="h-5 w-5" />,
        },
      ]
    : [
        {
          title: "Exact drivetrain math",
          description:
            "Chainring, cassette, and wheel size convert straight into ratio, development, and speed.",
          icon: <ArrowUpDown className="h-5 w-5" />,
        },
        {
          title: "Honest climb verdict",
          description:
            "The tool does not pretend to know more than it does: the climb readout is a practical rule, not a power meter.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Clear upgrade direction",
          description:
            "You can see right away whether a larger cassette, smaller inner ring, or wider 1x range makes more sense.",
          icon: <Gauge className="h-5 w-5" />,
        },
      ];

  return (
    <PublicPageShell className="text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: isNl ? "BestBikeFit4U Verzet calculator" : "BestBikeFit4U Gearing Calculator",
            description: isNl
              ? "Bereken je lichtste en zwaarste versnelling, snelheid bij cadans en een snelle kliminschatting."
              : "Calculate your easiest and hardest gear, speed at cadence, and a quick climb verdict.",
            url: pageUrl,
          }),
          buildHowToSchema({
            name: isNl ? "Hoe gebruik je de verzet calculator" : "How to use the gearing calculator",
            description: isNl
              ? "Een korte flow om je drivetrain snel te begrijpen."
              : "A short flow to understand your drivetrain quickly.",
            steps: isNl
              ? [
                  "Kies 1x of 2x en vul je kettingring(s) in.",
                  "Voer cassette, wielomtrek, cadans en klimhelling in.",
                  "Lees lichtste en zwaarste versnelling plus snelheid bij cadans.",
                  "Controleer de kliminschatting en upgrade-richting.",
                ]
              : [
                  "Choose 1x or 2x and enter your chainring(s).",
                  "Fill in cassette, wheel circumference, cadence, and climb gradient.",
                  "Read the easiest and hardest gear plus speed at cadence.",
                  "Check the climb verdict and upgrade direction.",
                ],
          }),
          buildFaqPageSchema(faqs),
        ]}
      />

      <div className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_26%,var(--background)_74%)_100%)] text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <PublicHero
            eyebrow="BestBikeFit4U calculator"
            title={isNl ? "Verzet calculator" : "Gearing Calculator"}
            description={
              isNl
                ? "Begrijp snel je lichtste en zwaarste versnelling, de snelheid bij jouw cadans en of je setup een gekozen klim aankan."
                : "Quickly understand your easiest and hardest gear, speed at your cadence, and whether your setup can handle the climb you have in mind."
            }
            chips={
              isNl
                ? ["1x en 2x", "Snel en exact", "Dashboard hand-off"]
                : ["1x and 2x", "Fast and exact", "Dashboard hand-off"]
            }
          />

          <PublicSection
            className="mt-10"
            header={{
              eyebrow: isNl ? "Waarom dit werkt" : "Why this works",
              title: isNl
                ? "Exacte verzetmath, snelle route-check"
                : "Exact gearing math, fast route check",
              description: isNl
                ? "De public calculator legt de basis. In het dashboard koppel je daar later rijder en event aan."
                : "The public calculator lays the groundwork. The dashboard later adds rider and event context.",
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

          <GearingCalculatorForm isNl={isNl} />

          <PublicCtaBand
            className="mt-10"
            eyebrow={isNl ? "Hoe verder?" : "What's next?"}
            title={isNl ? "Vergelijk dit met je dashboard setup" : "Compare this with your dashboard setup"}
            description={
              isNl
                ? "Maak een gratis account aan om deze setup naast je echte fiets te zetten en de kliminschatting verder te verfijnen."
                : "Create a free account to compare this setup with your real bike and refine the climb verdict further."
            }
            actions={
              campaignActive ? (
                <CampaignCtaGroup
                  locale={locale}
                  pagePath={pagePath}
                  startHref={withLocalePrefix("/calculators/bike-fit", locale)}
                  startSection="gearing_result"
                  donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
                  donateSection="gearing_campaign_donate"
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
                        section="gearing_result"
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
                        section="gearing_pricing_cta"
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
                ? "De public versie is bedoeld voor snelle oriëntatie. Het dashboard gaat verder met rijder, event en climb demand."
                : "The public version is for quick orientation. The dashboard goes further with rider, event, and climb demand."
            }
          />

          <RelatedLinksSection
            title={isNl ? "Gerelateerde tools en gidsen" : "Related tools and guides"}
            links={getRelatedLinks("gearing", locale)}
            locale={locale}
          />
        </div>
      </div>
    </PublicPageShell>
  );
}
