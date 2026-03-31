import type { Metadata } from "next";
import { Bike, ClipboardList, Target } from "lucide-react";
import { Button } from "@/components/ui";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
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
      keywords: [
        "how online bike fit works",
        "bike fit process",
        "digital bike fitting",
      ],
    },
    eyebrow: "Transparent process",
    title: "How BestBikeFit4U works",
    intro:
      "BestBikeFit4U combines your body measurements, riding goals, and bike context to help you make clearer fit decisions. The goal is not abstract theory. The goal is a better next step on the bike you actually ride.",
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
      keywords: [
        "hoe online bikefit werkt",
        "bikefit proces",
        "digitale bikefitting",
      ],
    },
    eyebrow: "Transparant proces",
    title: "Hoe BestBikeFit4U werkt",
    intro:
      "BestBikeFit4U combineert je lichaamsmetingen, rijdoelen en fietscontext om je te helpen duidelijkere fitbeslissingen te nemen. Het doel is geen abstracte theorie, maar een betere volgende stap op de fiets die je echt rijdt.",
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
    <div className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_42%,var(--background)_58%)_100%)] py-16">
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
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <div className="rounded-[2rem] border border-border/70 bg-card/95 px-6 py-10 shadow-sm sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              {page.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-foreground sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{page.intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
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
            </div>
          </div>

          <BikeFitProcessIllustration locale={locale} />
        </section>

        <section className="mt-10 rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold text-foreground">{page.sectionTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {page.sectionIntro}
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {page.steps.map((step, index) => {
              const Icon = stepIcons[index] ?? Target;
              return (
                <article
                  key={step.title}
                  className="rounded-[1.75rem] border border-border/70 bg-background/90 p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-foreground">{step.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">{page.prepTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{page.prepBody}</p>
          </article>
          <article className="rounded-[2rem] border border-border/70 bg-primary-soft p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">{page.afterTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{page.afterBody}</p>
          </article>
        </section>
      </div>
    </div>
  );
}
