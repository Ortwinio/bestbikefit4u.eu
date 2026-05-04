import type { Metadata } from "next";
import { Bike, ClipboardList, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  PublicCtaBand,
  FeatureIconCard,
  type FeatureIconCardColor,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { BikeFitProcessIllustration } from "@/components/content/PublicPageIllustrations";
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { BRAND } from "@/config/brand";
import {
  buildHowToSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/seo/jsonLd";

const stepIcons = [ClipboardList, Bike, Target] as const;
const STEP_COLORS: FeatureIconCardColor[] = ["teal", "primary", "green"];

const copy: Record<
  Locale,
  {
    metadata: { title: string; description: string; keywords: string[] };
    eyebrow: string;
    title: string;
    intro: string;
    sectionTitle: string;
    sectionIntro: string;
    prepTitle: string;
    prepBody: string;
    afterTitle: string;
    afterBody: string;
    primaryCta: string;
    secondaryCta: string;
    steps: Array<{ title: string; body: string }>;
  }
> = {
  en: {
    metadata: {
      title: "How It Works | BestBikeFit4U",
      description:
        "See how BestBikeFit4U turns your measurements, riding goals, and bike context into practical fit guidance.",
      keywords: ["how online bike fit works", "bike fit process", "digital bike fitting"],
    },
    eyebrow: "Transparent process",
    title: "How BestBikeFit4U works",
    intro:
      "BestBikeFit4U combines your body measurements, riding goals, and bike context to help you make clearer fit decisions. The goal is a better next step on the bike you actually ride.",
    sectionTitle: "What happens in the fit flow",
    sectionIntro:
      "The flow is designed to move from useful inputs to practical recommendations without forcing riders through unnecessary complexity.",
    prepTitle: "What to prepare before you start",
    prepBody:
      "Bring your body measurements, a rough sense of your riding goals, and the bike context that matters most. The better the context, the clearer the output.",
    afterTitle: "What happens after you submit",
    afterBody:
      "You get fit guidance that helps you review your current position, understand the likely tradeoffs, and decide what to test next in a more structured way.",
    primaryCta: "Start Free Fit",
    secondaryCta: "Open Bike Fit Calculator",
    steps: [
      {
        title: "Step 1: Enter your measurements",
        body: "Start with the measurements that matter most for practical fit guidance, including height and inseam, with optional extra inputs when you have them.",
      },
      {
        title: "Step 2: Add your riding context",
        body: "Describe how you ride, what kind of bike you use, and whether comfort, performance, or bike choice is the bigger priority right now.",
      },
      {
        title: "Step 3: Review your recommendations",
        body: "See a clearer fit starting point, practical setup targets, and the most sensible next adjustments to review first.",
      },
    ],
  },
  nl: {
    metadata: {
      title: "Hoe het werkt | BestBikeFit4U",
      description:
        "Bekijk hoe BestBikeFit4U jouw metingen, rijdoelen en fietscontext omzet in praktische fit-aanbevelingen.",
      keywords: ["hoe online bikefit werkt", "bikefit proces", "digitale bikefitting"],
    },
    eyebrow: "Transparant proces",
    title: "Hoe BestBikeFit4U werkt",
    intro:
      "BestBikeFit4U combineert je lichaamsmetingen, rijdoelen en fietscontext om je te helpen duidelijkere fitbeslissingen te nemen. Het doel is een betere volgende stap op de fiets die je echt rijdt.",
    sectionTitle: "Wat er in de fitflow gebeurt",
    sectionIntro:
      "De flow is opgezet om van bruikbare input naar praktische aanbevelingen te gaan zonder rijders door onnodige complexiteit te trekken.",
    prepTitle: "Wat je voorbereidt voordat je start",
    prepBody:
      "Zorg voor je lichaamsmetingen, een globaal beeld van je rijdoelen en de fietscontext die het belangrijkst is. Hoe beter de context, hoe duidelijker de uitkomst.",
    afterTitle: "Wat er gebeurt na het invullen",
    afterBody:
      "Je krijgt fitadvies waarmee je je huidige positie kunt beoordelen, de belangrijkste afwegingen begrijpt en gerichter kunt bepalen wat je daarna wilt testen.",
    primaryCta: "Start gratis fit",
    secondaryCta: "Open Bike Fit Calculator",
    steps: [
      {
        title: "Stap 1: Vul je metingen in",
        body: "Begin met de metingen die het belangrijkst zijn voor praktisch fitadvies, zoals lengte en binnenbeenlengte, met extra optionele inputs als je die hebt.",
      },
      {
        title: "Stap 2: Voeg je rijcontext toe",
        body: "Beschrijf hoe je rijdt, wat voor fiets je gebruikt en of comfort, prestaties of fietskeuze nu de belangrijkste prioriteit is.",
      },
      {
        title: "Stap 3: Bekijk je aanbevelingen",
        body: "Zie een duidelijker fit-startpunt, praktische afsteldoelen en de meest logische volgende aanpassingen om als eerste te beoordelen.",
      },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/how-it-works", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function HowItWorksPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const pagePath = withLocalePrefix("/how-it-works", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_42%,var(--background)_58%)_100%)]">
      <TrackMarketingEventOnView
        eventType="how_it_works_view"
        locale={locale}
        pagePath={pagePath}
        section="how_it_works"
      />
      <JsonLd
        schema={[
          buildOrganizationSchema(),
          buildWebSiteSchema({
            url: pageUrl,
            description: page.metadata.description,
            inLanguage: locale,
          }),
          buildHowToSchema({
            name: page.title,
            description: page.metadata.description,
            steps: page.steps.map((step) => step.title),
          }),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.intro}
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="how_it_works_primary_cta"
                    ctaLabel={page.primaryCta}
                    conversionKey="pricing_signup"
                  />
                }
              >
                {page.primaryCta}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="how_it_works_secondary_cta"
                    ctaLabel={page.secondaryCta}
                  />
                }
              >
                {page.secondaryCta}
              </Button>
            </>
          }
          illustration={<BikeFitProcessIllustration locale={locale} />}
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: locale === "nl" ? "Waarom deze flow werkt" : "Why this flow works",
            title:
              locale === "nl"
                ? "Van bruikbare input naar praktische volgende stap"
                : "From usable input to a practical next step",
            description: page.sectionIntro,
          }}
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {page.steps.map((step, index) => {
              const Icon = stepIcons[index] ?? Target;
              return (
                <div key={step.title}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <FeatureIconCard
                    icon={<Icon className="h-8 w-8" />}
                    title={step.title}
                    description={step.body}
                    color={STEP_COLORS[index] ?? "primary"}
                  />
                </div>
              );
            })}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: locale === "nl" ? "Wat je kunt verwachten" : "What to expect",
            title:
              locale === "nl"
                ? "Voorbereiding en resultaat in één oogopslag"
                : "Preparation and output at a glance",
          }}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <PublicSurfaceCard
              title={page.prepTitle}
              description={page.prepBody}
              leading={<ClipboardList className="h-5 w-5" />}
            >
              <div />
            </PublicSurfaceCard>
            <PublicSurfaceCard
              title={page.afterTitle}
              description={page.afterBody}
              leading={<ShieldCheck className="h-5 w-5" />}
            >
              <div />
            </PublicSurfaceCard>
          </div>
        </PublicSection>

        <PublicCtaBand
          className="mt-12"
          eyebrow={locale === "nl" ? "Volgende stap" : "Next step"}
          title={
            locale === "nl"
              ? "Gebruik de volledige flow of begin eerst met de calculator"
              : "Use the full flow or start with the calculator first"
          }
          description={
            locale === "nl"
              ? "De gratis fitflow geeft meer context. De calculator geeft een snelle eerste richting als je nog niet klaar bent voor de volledige intake."
              : "The free fit flow gives you more context. The calculator gives a quick first direction if you are not ready for the full intake yet."
          }
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="how_it_works_footer_primary"
                    ctaLabel={page.primaryCta}
                  />
                }
              >
                {page.primaryCta}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="how_it_works_footer_secondary"
                    ctaLabel={page.secondaryCta}
                  />
                }
              >
                {page.secondaryCta}
              </Button>
            </>
          }
        />
      </div>
    </PublicPageShell>
  );
}
