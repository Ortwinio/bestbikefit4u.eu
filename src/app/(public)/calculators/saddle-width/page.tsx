import type { Metadata } from "next";
import { Gauge, Ruler, ShieldCheck } from "lucide-react";
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
import { buildHowToSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { SaddleWidthCalculatorForm } from "./SaddleWidthCalculatorForm";

function buildFaqs(isNl: boolean) {
  return isNl
    ? [
        {
          q: "Hoe meet ik mijn zitbeenbreedte thuis?",
          a: "Leg golfkarton of aluminiumfolie op een harde stoel. Ga normaal zitten voor 30 seconden, sta voorzichtig op en meet de hart-op-hart afstand tussen de twee diepste afdrukken.",
        },
        {
          q: "Kan alleen zadelbreedte gevoelloosheid oplossen?",
          a: "Breedte helpt, maar kanteling en setback zijn vaak net zo belangrijk. Een neus-omlaag zadel concentreert druk centraal, ook wanneer de breedte klopt. Zit je dicht bij het advies maar heb je nog gevoelloosheid, controleer dan eerst tilt en setback.",
        },
        {
          q: "Waarom beïnvloedt mijn houding de zadelbreedte?",
          a: "Een agressievere positie roteert het bekken verder naar voren. Daardoor verschuift waar je zitbotten het zadel raken, en verandert hoeveel achterste steun logisch is.",
        },
      ]
    : [
        {
          q: "How do I measure my sit-bone width at home?",
          a: "Place corrugated cardboard or kitchen foil on a hard chair. Sit normally for 30 seconds, stand up carefully, and measure the center-to-center distance between the two deepest indentations.",
        },
        {
          q: "Can saddle width alone solve numbness?",
          a: "Width matters, but tilt and setback are often equally important. A nose-down tilt concentrates pressure centrally even on a correctly sized saddle. If your current saddle width is near the recommendation but you still have numbness, check tilt first.",
        },
        {
          q: "Why does my posture affect the saddle width recommendation?",
          a: "More aggressive positions rotate the pelvis forward, which shifts where the sit bones contact the saddle. An upright rider typically needs more rear support than a race rider with the same sit-bone measurement.",
        },
      ];
}

function buildTrustPoints(isNl: boolean) {
  return isNl
    ? [
        {
          title: "Anatomie eerst, niet alleen maatetiketten",
          description:
            "De aanbeveling begint bij zitbeenbreedte, want dat is de sterkste anatomische voorspeller. Rijhouding en fietscategorie verfijnen daarna.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Twee invoerpaden, eerlijk over nauwkeurigheid",
          description:
            "Heb je een directe zitbeenmeting? Gebruik die. Zo niet, dan geeft de schatting op basis van lichaamsgegevens toch een bruikbaar startbereik, met eerlijk lagere betrouwbaarheid.",
          icon: <Ruler className="h-5 w-5" />,
        },
        {
          title: "Breedte is het begin, niet het einde",
          description:
            "Zadelcomfort hangt ook af van vorm, neustype en kanteling. De dashboardversie combineert dit alles tot een volledige aanbeveling.",
          icon: <Gauge className="h-5 w-5" />,
        },
      ]
    : [
        {
          title: "Anatomy first, not just size labels",
          description:
            "The recommendation starts from sit-bone width because that is the strongest anatomical predictor. Riding posture and bike category refine it from there.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          title: "Two input paths, honest about accuracy",
          description:
            "If you have a direct sit-bone measurement, use it. If not, the body-data estimate gives a useful starting range, with clearly lower confidence.",
          icon: <Ruler className="h-5 w-5" />,
        },
        {
          title: "Width is the start, not the end",
          description:
            "Saddle comfort also depends on shape, nose type, and tilt. The dashboard version combines all of these into a complete recommendation.",
          icon: <Gauge className="h-5 w-5" />,
        },
      ];
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/saddle-width", locale);

  return {
    title: isNl
      ? "Zadelbreedtecalculator | BestBikeFit4U"
      : "Saddle Width Calculator | BestBikeFit4U",
    description: isNl
      ? "Bereken je ideale zadelbreedteaanbeveling op basis van zitbeenmeting of lichaamsgegevens. Inclusief zadelcategorie en betrouwbaarheidsscore."
      : "Calculate your ideal saddle width from sit-bone measurement or body data. Get a recommended width range, saddle family, and confidence score.",
    keywords: isNl
      ? [
          "zadelbreedte calculator",
          "zitbeenbreedte calculator",
          "racefiets zadelbreedteadvies",
          "gravelbike zadelmaat",
        ]
      : [
          "saddle width calculator",
          "sit bone width calculator",
          "road saddle size",
          "gravel saddle selector",
        ],
    openGraph: {
      title: isNl ? "Zadelbreedtecalculator" : "Saddle Width Calculator",
      description: isNl
        ? "Gratis zadelbreedteaanbeveling op basis van anatomie en rijprofiel."
        : "Free saddle width recommendation based on anatomy and riding profile.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function SaddleWidthCalculatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/calculators/saddle-width", locale);
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = buildFaqs(isNl);
  const trustPoints = buildTrustPoints(isNl);

  return (
    <PublicPageShell className="text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: "BestBikeFit4U Saddle Width Calculator",
            description: isNl
              ? "Bereken je ideale zadelbreedteaanbeveling op basis van zitbeenmeting of lichaamsgegevens."
              : "Calculate your ideal saddle width from sit-bone measurement or body data.",
            url: pageUrl,
          }),
          buildHowToSchema({
            name: isNl ? "Hoe bereken je zadelbreedte" : "How to calculate saddle width",
            description: isNl
              ? "Een kort proces om een bruikbaar startpunt voor zadelbreedte te krijgen."
              : "A short process for getting a practical saddle-width starting point.",
            steps: isNl
              ? [
                  "Bepaal of je een zitbeenmeting hebt of lichaamsgegevens wilt gebruiken.",
                  "Vul je metingen en rijprofiel in.",
                  "Lees het aanbevolen breedtebereik en de zadelcategorie.",
                  "Gebruik de uitkomst als shortlist voordat je een zadel koopt.",
                ]
              : [
                  "Decide whether you have a sit-bone measurement or will use body data.",
                  "Enter your measurements and riding profile.",
                  "Read the recommended width range and saddle family.",
                  "Use the result to shortlist saddles before buying.",
                ],
          }),
        ]}
      />

      <PublicHero
        eyebrow="BestBikeFit4U calculator"
        title={isNl ? "Zadelbreedtecalculator" : "Saddle Width Calculator"}
        description={
          isNl
            ? "Bereken een eerste zadelbreedteaanbeveling op basis van je zitbeenmeting of lichaamsgegevens en rijprofiel."
            : "Calculate a first-pass saddle width recommendation from your sit-bone measurement or body data and riding profile."
        }
        chips={
          isNl
            ? ["Gemeten of geschatte invoer", "Zadelcategorie inbegrepen", "Gratis startpunt"]
            : ["Measured or estimated input", "Saddle family included", "Free starting point"]
        }
      />

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: isNl ? "Waarom dit vertrouwen wekt" : "Why this builds trust",
          title: isNl
            ? "Een bruikbaar startpunt zonder schijnprecisie"
            : "A practical starting point without fake precision",
          description: isNl
            ? "De tool kiest bewust voor breedtebereiken, duidelijke aannames en een expliciete betrouwbaarheidsscore."
            : "The tool deliberately uses width ranges, clear assumptions, and an explicit confidence score.",
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

      <SaddleWidthCalculatorForm isNl={isNl} />

      <PublicCtaBand
        className="mt-10"
        eyebrow={isNl ? "Hoe verder?" : "What's next?"}
        title={isNl ? "Verfijn de uitkomst in je account" : "Refine the result in your account"}
        description={
          isNl
            ? "Maak een gratis account aan om symptomen, huidige zadelpositie en rijprofiel mee te nemen in een completere zadelanalyse."
            : "Create a free account to include symptoms, current saddle position, and riding profile in a more complete saddle analysis."
        }
        actions={
          campaignActive ? (
            <CampaignCtaGroup
              locale={locale}
              pagePath={pagePath}
              startHref={withLocalePrefix("/calculators/bike-fit", locale)}
              startSection="saddle_width_result"
              donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
              donateSection="saddle_width_campaign_donate"
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
                    section="saddle_width_result"
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
                    section="saddle_width_pricing_cta"
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
          description: isNl
            ? "Korte antwoorden op de belangrijkste vragen rond meten en interpreteren."
            : "Short answers to the key measuring and interpretation questions.",
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
          links={getRelatedLinks("saddle-width", locale)}
          locale={locale}
        />
      </section>
    </PublicPageShell>
  );
}
