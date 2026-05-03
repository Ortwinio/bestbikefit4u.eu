import type { Metadata } from "next";
import { Compass, Ruler, ShieldCheck } from "lucide-react";
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
import { buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { FrameSizeCalculatorForm } from "./FrameSizeCalculatorForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const alternates = buildLocaleAlternates("/calculators/frame-size", locale);

  return {
    title: isNl ? "Framemaat calculator | BestBikeFit4U" : "Frame Size Calculator | BestBikeFit4U",
    description: isNl
      ? "Schat een realistische framemaat op basis van lengte, binnenbeenlengte en fietsdiscipline."
      : "Estimate a realistic frame size based on height, inseam, and bike category.",
    keywords: isNl
      ? ["framemaat calculator", "fietsmaat calculator", "racefiets maat estimate"]
      : ["frame size calculator", "bike size calculator", "road bike size estimate"],
    openGraph: {
      title: isNl ? "Framemaat calculator" : "Frame Size Calculator",
      description: isNl
        ? "Krijg een snelle framemaatinschatting op basis van je basisgegevens."
        : "Get a quick frame-size estimate based on your core measurements.",
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function FrameSizeCalculatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/calculators/frame-size", locale);
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const faqs = isNl
    ? [
        {
          q: "Kan een framemaatcalculator een volledige bike fit vervangen?",
          a: "Nee. Framemaat is maar één onderdeel van de fit. Reach, drop en contactpunten bepalen nog steeds of de fiets echt goed past.",
        },
        {
          q: "Waarom is binnenbeenlengte belangrijk voor framemaat?",
          a: "Die beïnvloedt zadelhoogte en de verhoudingen van de fiets, en daardoor welke maten realistisch zijn.",
        },
      ]
    : [
        {
          q: "Can a frame-size calculator replace a complete bike fit?",
          a: "No. Frame size is only one part of the fit. Reach, drop, and contact points still determine whether the bike works well for you.",
        },
        {
          q: "Why does inseam matter for frame size?",
          a: "It strongly affects saddle height and overall proportions, which influence which size ranges are realistic.",
        },
      ];
  const trustPoints = isNl
    ? [
        {
          title: "Slimmer shortlistten",
          description:
            "Deze tool helpt je eerst onlogische maten te schrappen voordat je tijd steekt in detailvergelijkingen.",
          icon: <Compass className="h-5 w-5" />,
        },
        {
          title: "Gebaseerd op echte proporties",
          description:
            "Lengte alleen is te grof. Binnenbeenlengte maakt de inschatting bruikbaarder en geloofwaardiger.",
          icon: <Ruler className="h-5 w-5" />,
        },
        {
          title: "Geen vervanging voor geometrievergelijking",
          description:
            "Een framemaatlabel is nooit het hele verhaal. Daarom blijft stack, reach en cockpitcontrole de volgende stap.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
      ]
    : [
        {
          title: "Shortlist smarter",
          description:
            "This tool helps you remove implausible sizes before you spend time on detailed comparisons.",
          icon: <Compass className="h-5 w-5" />,
        },
        {
          title: "Based on real proportions",
          description:
            "Height alone is too rough. Inseam makes the estimate more usable and more credible.",
          icon: <Ruler className="h-5 w-5" />,
        },
        {
          title: "Not a replacement for geometry comparison",
          description:
            "A frame-size label is never the whole story. That is why stack, reach, and cockpit checks still come next.",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
      ];

  return (
    <PublicPageShell className="text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: isNl ? "BestBikeFit4U Framemaat calculator" : "BestBikeFit4U Frame Size Calculator",
            description: isNl
              ? "Schat een realistische framemaat op basis van lengte, binnenbeenlengte en fietsdiscipline."
              : "Estimate a realistic frame size based on height, inseam, and bike category.",
            url: pageUrl,
          }),
        ]}
      />

      <PublicHero
        eyebrow="BestBikeFit4U calculator"
        title={isNl ? "Framemaat calculator" : "Frame Size Calculator"}
        description={
          isNl
            ? "Maak eerst een realistische shortlist van framematen voordat je fietsen, onderdelen of afstellingen vergelijkt."
            : "Shortlist realistic frame sizes before you compare bikes, parts, and setup changes."
        }
        chips={
          isNl
            ? ["NL en EN beschikbaar", "Snelle shortlist", "Bruikbaar thuis"]
            : ["Available in Dutch and English", "Fast shortlist", "Useful from home"]
        }
      />

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: isNl ? "Wat deze tool betrouwbaar maakt" : "What makes this tool trustworthy",
          title: isNl
            ? "Goed om opties te filteren, eerlijk over wat nog ontbreekt"
            : "Good at filtering options, honest about what is still missing",
          description: isNl
            ? "De waarde zit in het sneller uitsluiten van verkeerde maten, niet in het oversimplificeren van de volledige fit."
            : "The value is in ruling out wrong sizes faster, not in oversimplifying the full fit problem.",
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

      <FrameSizeCalculatorForm isNl={isNl} />

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
              startHref={withLocalePrefix("/calculators/bike-fit", locale)}
              startSection="frame_size_result"
              donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
              donateSection="frame_size_campaign_donate"
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
                    section="frame_size_result"
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
                    section="frame_size_pricing_cta"
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
          description: isNl ? "Korte antwoorden over framemaat en wat deze tool wel en niet doet." : "Short answers about frame size and what this tool does and does not do.",
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
          links={getRelatedLinks("frame-size", locale)}
          locale={locale}
        />
      </section>
    </PublicPageShell>
  );
}
