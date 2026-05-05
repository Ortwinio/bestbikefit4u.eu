import type { Metadata } from "next";
import { ArrowRight, BookOpen, Compass, FlaskConical, HeartPulse, Ruler } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  FeatureIconCard,
  GuideLinkButton,
  PublicCtaBand,
  PublicHero,
  PublicPageShell,
  PublicSection,
} from "@/components/public";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { getGuideBacklog, getGuideChildren } from "@/lib/guides/backlog";
import { buildHubIntro, resolveGuidePrimaryCta } from "@/lib/guides/content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const entry = getGuideBacklog(locale).find((item) => item.slug === "guides");
  const alternates = buildLocaleAlternates("/guides", locale);

  return {
    title: entry?.metaTitle,
    description: entry?.pageBrief,
    openGraph: {
      title: entry?.metaTitle,
      description: entry?.pageBrief,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function GuidesHubPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/guides", locale);
  const entry = getGuideBacklog(locale).find((item) => item.slug === "guides");

  if (!entry) {
    return null;
  }

  const primaryCta = resolveGuidePrimaryCta(entry.primaryCtaTarget, locale);

  const clusterHubs = getGuideBacklog(locale).filter(
    (item) =>
      item.path.startsWith("/guides/") &&
      item.slug !== "guides" &&
      getGuideChildren(item.slug, locale).length > 0
  );

  return (
    <PublicPageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={isNl ? "Gidsenbibliotheek" : "Guide library"}
          title={entry.h1}
          description={entry.pageBrief}
          chips={
            isNl
              ? [`${clusterHubs.length} hubs`, "EN + NL parity", "Praktische vervolgstappen"]
              : [`${clusterHubs.length} hubs`, "EN + NL parity", "Practical next steps"]
          }
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Waar deze pagina voor is" : "What this page is for",
            title: isNl
              ? "Gebruik gidsen om sneller te prioriteren"
              : "Use guides to prioritize faster",
            description: buildHubIntro(entry, locale).join(" "),
          }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureIconCard
              icon={<BookOpen className="h-5 w-5" />}
              title={isNl ? "Praktische context" : "Practical context"}
              description={
                isNl
                  ? "Elke hub helpt je sneller bepalen welke fitvraag eerst aandacht verdient."
                  : "Each hub helps you decide faster which fit question deserves attention first."
              }
              color="teal"
            />
            <FeatureIconCard
              icon={<Compass className="h-5 w-5" />}
              title={isNl ? "Van probleem naar route" : "From problem to route"}
              description={
                isNl
                  ? "Gebruik discomfort, rijtype, geometrie of performance als ingang."
                  : "Start from discomfort, ride type, geometry, or performance."
              }
              color="primary"
            />
            <FeatureIconCard
              icon={<ArrowRight className="h-5 w-5" />}
              title={isNl ? "Eén duidelijke CTA" : "One clear CTA"}
              description={
                isNl
                  ? "Lees eerst, open daarna de best passende tool of flow."
                  : "Read first, then open the best matching tool or flow."
              }
              color="amber"
            />
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Start met de juiste route" : "Start with the right route",
            title: isNl
              ? "Verbind gidsen direct met calculators en fit science"
              : "Connect guides directly to calculators and fit science",
            description: isNl
              ? "Gebruik deze ingangen wanneer je sneller wilt schakelen tussen fiets afstellen, zadelhoogte, klachtentriage en reach racefiets."
              : "Use these entry points when you want to move faster between bike fitting, saddle height, symptom triage, and road-bike reach.",
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <GuideLinkButton
              href={withLocalePrefix("/calculators/bike-fit", locale)}
              title={isNl ? "Bike fit calculator" : "Bike Fit Calculator"}
              subtitle={
                isNl
                  ? "Gebruik de hoofdcalculator als fiets afstellen je centrale vraag is."
                  : "Use the main calculator when bike fitting is your central question."
              }
              icon={<Compass className="h-5 w-5" />}
            />
            <GuideLinkButton
              href={withLocalePrefix("/calculators/saddle-height", locale)}
              title={isNl ? "Zadelhoogte calculator" : "Saddle Height Calculator"}
              subtitle={
                isNl
                  ? "Begin hier als zadelhoogte afstellen je grootste open punt is."
                  : "Start here when setting saddle height is your biggest open question."
              }
              icon={<Ruler className="h-5 w-5" />}
            />
            <GuideLinkButton
              href={withLocalePrefix("/pain", locale)}
              title={
                isNl ? "Bikefit bij veelvoorkomende klachten" : "Bike Fit for Common Pain Points"
              }
              subtitle={
                isNl
                  ? "Routeer knie-, rug- en comfortvragen eerst via de klachtenhub."
                  : "Route knee, back, and comfort questions through the symptom hub first."
              }
              icon={<HeartPulse className="h-5 w-5" />}
            />
            <GuideLinkButton
              href={withLocalePrefix("/science/stack-and-reach", locale)}
              title={isNl ? "Stack en reach gids" : "Stack and Reach Guide"}
              subtitle={
                isNl
                  ? "Gebruik reach racefiets en framelogica voordat je cockpitlengte gaat gokken."
                  : "Use road-bike reach and frame logic before you guess cockpit length."
              }
              icon={<FlaskConical className="h-5 w-5" />}
            />
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: isNl ? "Clusters" : "Clusters",
            title: isNl ? "Verken de gidsen per onderwerp" : "Explore the guide library by topic",
            description: isNl
              ? "Elke hub is geschreven als bruikbare landingspagina, niet als dunne index."
              : "Each hub is written as a useful landing page, not a thin index.",
          }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {clusterHubs.map((hub) => (
              <GuideLinkButton
                key={hub.slug}
                href={withLocalePrefix(hub.path, locale)}
                title={hub.pageTitle}
                subtitle={hub.pageBrief}
                icon={<BookOpen className="h-5 w-5" />}
              />
            ))}
          </div>
        </PublicSection>

        <PublicCtaBand
          className="mt-12"
          eyebrow={isNl ? "Volgende stap" : "Next step"}
          title={isNl ? "Klaar om je eigen fit te starten?" : "Ready to start your own fit?"}
          description={
            isNl
              ? "Gebruik de gidsen als filter en open daarna je gratis fitflow."
              : "Use the guides as a filter, then open your free fit flow."
          }
          actions={
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix(primaryCta.href, locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="guides_home_cta"
                  ctaLabel={primaryCta.label ?? entry.primaryCtaLabel}
                />
              }
            >
              {primaryCta.label ?? entry.primaryCtaLabel}
            </Button>
          }
        />
      </div>
    </PublicPageShell>
  );
}
