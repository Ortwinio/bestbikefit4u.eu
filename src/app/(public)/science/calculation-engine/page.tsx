import type { Metadata } from "next";
import { Calculator, ShieldCheck, SlidersHorizontal } from "lucide-react";
import {
  PublicHero,
  PublicIllustrationPanel,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { BRAND } from "@/config/brand";

const copy: Record<
  Locale,
  {
    metadata: { title: string; description: string; keywords: string[] };
    hero: {
      eyebrow: string;
      title: string;
      description: string;
      chips: string[];
      caption: string;
      labels: string[];
    };
    section: { eyebrow: string; title: string; description: string };
    cards: Array<{ title: string; description: string }>;
    linksTitle: string;
    links: Array<{ href: string; label: string }>;
  }
> = {
  en: {
    metadata: {
      title: "Bike Fit Calculation Engine | BestBikeFit4U Science",
      description:
        "Detailed explanation of the BestBikeFit4U calculation engine: input validation, saddle height, reach, bar drop, and frame target logic.",
      keywords: [
        "bike fit calculation engine",
        "cycling fit algorithm",
        "saddle height calculation",
        "stack reach algorithm",
      ],
    },
    hero: {
      eyebrow: "Science",
      title: "Calculation Engine",
      description:
        "The BestBikeFit4U engine combines validated measurement rules with proven bike-fit equations to produce actionable setup recommendations.",
      chips: ["Input validation", "Geometry outputs", "Safety guardrails"],
      caption: "The engine reduces raw rider input into repeatable setup targets.",
      labels: ["Measurements in", "Fit targets out", "Guardrails applied"],
    },
    section: {
      eyebrow: "Pipeline",
      title: "How the engine works",
      description:
        "Each layer narrows uncertainty: first clean the input, then calculate fit values, then translate those values into practical setup guidance.",
    },
    cards: [
      {
        title: "1. Input Validation",
        description:
          "Required measurements are checked against hard limits before the fit calculation begins.",
      },
      {
        title: "2. Core Geometry Outputs",
        description:
          "The engine calculates crank length, saddle height, setback, drop, and reach from inseam, category, flexibility, core stability, and ambition profile.",
      },
      {
        title: "3. Frame Targets",
        description:
          "Stack and reach targets are derived from saddle and cockpit coordinates, then translated into realistic stem and spacer combinations.",
      },
      {
        title: "4. Safety Guardrails",
        description:
          "Warnings flag aggressive drop, out-of-range reach, and risky saddle heights so riders can apply changes more conservatively.",
      },
    ],
    linksTitle: "Related guides",
    links: [
      { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
      { href: "/science/bike-fit-methods", label: "Bike Fit Methods Comparison" },
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/calculators/frame-size", label: "Frame Size Calculator" },
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain" },
      { href: "/guides/triathlon-bike-fit-guide", label: "Triathlon Bike Fit Guide" },
    ],
  },
  nl: {
    metadata: {
      title: "Bikefit-calculatiemotor | BestBikeFit4U Science",
      description:
        "Uitleg van de BestBikeFit4U-calculatiemotor: inputvalidatie, zadelhoogte, reach, stuurdrop en framedoellogica.",
      keywords: [
        "bikefit calculatiemotor",
        "fiets fit algoritme",
        "zadelhoogte berekening",
        "stack reach algoritme",
      ],
    },
    hero: {
      eyebrow: "Wetenschap",
      title: "Calculatiemotor",
      description:
        "De BestBikeFit4U-motor combineert gevalideerde meetregels met bewezen bikefit-formules om bruikbare afsteladviezen te geven.",
      chips: ["Inputvalidatie", "Geometrie-uitkomsten", "Veiligheidsgrenzen"],
      caption:
        "De motor vertaalt ruwe rijdersinput naar herhaalbare afsteldoelen.",
      labels: ["Metingen erin", "Fitdoelen eruit", "Guardrails toegepast"],
    },
    section: {
      eyebrow: "Pipeline",
      title: "Hoe de motor werkt",
      description:
        "Elke laag verkleint de onzekerheid: eerst de input opschonen, dan fitwaarden berekenen en die waarden daarna vertalen naar praktische setupbegeleiding.",
    },
    cards: [
      {
        title: "1. Inputvalidatie",
        description:
          "Verplichte metingen worden eerst gecontroleerd op harde grenzen voordat de fitberekening begint.",
      },
      {
        title: "2. Kernuitkomsten van de geometrie",
        description:
          "De motor berekent cranklengte, zadelhoogte, setback, drop en reach op basis van binnenbeenlengte, categorie, flexibiliteit, core-stabiliteit en ambitieprofiel.",
      },
      {
        title: "3. Framedoelen",
        description:
          "Stack- en reachdoelen worden afgeleid uit zadel- en cockpitcoordinaten en daarna vertaald naar realistische combinaties van stuurpen en spacers.",
      },
      {
        title: "4. Veiligheidsgrenzen",
        description:
          "Waarschuwingen markeren agressieve drop, reach buiten bereik en risicovolle zadelhoogtes zodat rijders conservatiever kunnen aanpassen.",
      },
    ],
    linksTitle: "Gerelateerde gidsen",
    links: [
      { href: "/science/stack-and-reach", label: "Stack en reach gids" },
      { href: "/science/bike-fit-methods", label: "Vergelijking van bikefit-methodes" },
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/calculators/frame-size", label: "Framemaat calculator" },
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bikefitting bij kniepijn" },
      { href: "/guides/triathlon-bike-fit-guide", label: "Triathlon fit gids" },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/science/calculation-engine", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "article",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function CalculationEnginePage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const pageUrl = new URL(withLocalePrefix("/science/calculation-engine", locale), BRAND.siteUrl).toString();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.metadata.title,
    description: page.metadata.description,
    author: {
      "@type": "Organization",
      name: "BestBikeFit4U",
    },
    mainEntityOfPage: pageUrl,
  };

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_24%,var(--background)_76%)_100%)] text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <PublicHero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        description={page.hero.description}
        chips={page.hero.chips}
        illustration={
          <PublicIllustrationPanel caption={page.hero.caption} className="w-full">
            <div className="grid w-full gap-3">
              {[
                { icon: <Calculator className="h-5 w-5" />, label: page.hero.labels[0] },
                { icon: <SlidersHorizontal className="h-5 w-5" />, label: page.hero.labels[1] },
                { icon: <ShieldCheck className="h-5 w-5" />, label: page.hero.labels[2] },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-[color:var(--primary)]">
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--foreground)]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </PublicIllustrationPanel>
        }
      />

      <PublicSection
        header={{
          eyebrow: page.section.eyebrow,
          title: page.section.title,
          description: page.section.description,
        }}
      >
        <div className="grid gap-5">
          {page.cards.map((card, index) => {
            const icon =
              index === 0 || index === 3 ? (
                <ShieldCheck className="h-5 w-5" />
              ) : index === 1 ? (
                <Calculator className="h-5 w-5" />
              ) : (
                <SlidersHorizontal className="h-5 w-5" />
              );

            return (
              <PublicSurfaceCard
                key={card.title}
                title={card.title}
                description={card.description}
                leading={icon}
              />
            );
          })}
        </div>
      </PublicSection>

      <RelatedLinksSection title={page.linksTitle} links={page.links} locale={locale} />
    </PublicPageShell>
  );
}
