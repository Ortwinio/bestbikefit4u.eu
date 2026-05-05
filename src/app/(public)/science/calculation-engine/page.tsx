import type { Metadata } from "next";
import { Calculator, Gauge, Ruler, Sigma } from "lucide-react";
import {
  PublicHero,
  PublicIllustrationPanel,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { BRAND } from "@/config/brand";

type EngineCard = {
  title: string;
  description: string;
};

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
    sections: Array<{
      eyebrow: string;
      title: string;
      description: string;
      cards: EngineCard[];
    }>;
    linksTitle: string;
    links: Array<{ href: string; label: string }>;
  }
> = {
  en: {
    metadata: {
      title: "Bike Fit Calculation Engine | BestBikeFit4U Science",
      description:
        "See how BestBikeFit4U combines body measurements, fit methods, and rider context to calculate saddle height, reach, and next-step fit guidance.",
      keywords: [
        "bike fit calculation engine",
        "bike fitting calculations",
        "saddle height formula",
        "online bike fit method",
      ],
    },
    hero: {
      eyebrow: "Science",
      title: "How the Bike Fit Calculation Engine Works",
      description:
        "The calculation engine turns body measurements, bike category, and fit priorities into practical setup guidance. The goal is not one perfect formula, but a reliable decision path toward better saddle height, reach, and cockpit balance.",
      chips: ["Body measurements", "Fit methods", "Context-aware output"],
      caption:
        "Measurements become useful only when the engine translates them into real adjustment priorities.",
      labels: ["Saddle baseline", "Reach logic", "Practical next step"],
    },
    sections: [
      {
        eyebrow: "Inputs",
        title: "What the engine looks at first",
        description:
          "The calculator starts with measurable rider dimensions, then adds fit context so the output stays practical instead of theoretical.",
        cards: [
          {
            title: "Body measurements",
            description:
              "Height, inseam, torso, arm length, and shoulder width establish the first geometry baseline.",
          },
          {
            title: "Riding context",
            description:
              "Road, gravel, MTB, triathlon, and comfort-vs-performance intent change which output ranges are realistic.",
          },
          {
            title: "Constraint checks",
            description:
              "Pain history, flexibility, and stability help prevent aggressive recommendations that a rider cannot sustain.",
          },
        ],
      },
      {
        eyebrow: "Output logic",
        title: "Why the result is more than one number",
        description:
          "Saddle height is only the start. The engine connects that baseline to reach, support, and the most useful next adjustment.",
        cards: [
          {
            title: "Saddle height baseline",
            description:
              "Formula-driven saddle height creates the first mechanical reference for efficient pedaling and pelvic stability.",
          },
          {
            title: "Reach and stack translation",
            description:
              "Cockpit recommendations use torso and arm proportions so frame size and cockpit decisions stay linked.",
          },
          {
            title: "Next-step prioritization",
            description:
              "The engine points riders toward the next relevant page, calculator, or guide instead of leaving them with a static output.",
          },
        ],
      },
    ],
    linksTitle: "Related calculators and science pages",
    links: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/measurement-guide", label: "Measurement Guide" },
      { href: "/science/bike-fit-methods", label: "Bike Fitting Methods Explained" },
      { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
      { href: "/about", label: "How BestBikeFit4U Works" },
    ],
  },
  nl: {
    metadata: {
      title: "Bikefit berekeningsengine | BestBikeFit4U Science",
      description:
        "Bekijk hoe BestBikeFit4U lichaamsmaten, fitmethodes en rijcontext combineert om zadelhoogte, reach en praktische vervolgstappen te berekenen.",
      keywords: [
        "bikefit berekeningen",
        "fiets afstellen met berekeningen",
        "zadelhoogte formule",
        "bikefitting methode online",
      ],
    },
    hero: {
      eyebrow: "Wetenschap",
      title: "Hoe de bikefit berekeningsengine werkt",
      description:
        "De berekeningsengine vertaalt lichaamsmaten, fietstype en fitprioriteiten naar praktische afstelbegeleiding. Het doel is niet één perfecte formule, maar een betrouwbare beslisroute naar betere zadelhoogte, reach en cockpitbalans.",
      chips: ["Lichaamsmaten", "Fitmethodes", "Contextafhankelijke output"],
      caption:
        "Metingen worden pas waardevol wanneer de engine ze omzet in echte afstelprioriteiten.",
      labels: ["Zadelbasis", "Reach-logica", "Praktische vervolgstap"],
    },
    sections: [
      {
        eyebrow: "Input",
        title: "Waar de engine eerst naar kijkt",
        description:
          "De calculator start met meetbare lichaamsmaten en voegt daarna fitcontext toe, zodat de uitkomst praktisch blijft in plaats van puur theoretisch.",
        cards: [
          {
            title: "Lichaamsmaten",
            description:
              "Lengte, binnenbeenlengte, romplengte, armlengte en schouderbreedte vormen de eerste geometrische basis.",
          },
          {
            title: "Rijcontext",
            description:
              "Race, gravel, MTB, triathlon en comfort-versus-prestatie bepalen welke uitkomsten realistisch zijn.",
          },
          {
            title: "Beperkingen",
            description:
              "Pijnhistorie, flexibiliteit en stabiliteit voorkomen aanbevelingen die te agressief zijn om vol te houden.",
          },
        ],
      },
      {
        eyebrow: "Uitkomstlogica",
        title: "Waarom de uitkomst meer is dan één getal",
        description:
          "Zadelhoogte is alleen het begin. De engine verbindt die basis met reach, ondersteuning en de meest nuttige volgende aanpassing.",
        cards: [
          {
            title: "Basis voor zadelhoogte",
            description:
              "Formulegedreven zadelhoogte levert de eerste mechanische referentie voor efficiënt trappen en bekkenstabiliteit.",
          },
          {
            title: "Vertaling naar reach en stack",
            description:
              "Cockpitaanbevelingen gebruiken romp- en armverhoudingen zodat framemaat en cockpitkeuzes samen blijven hangen.",
          },
          {
            title: "Prioriteit voor de volgende stap",
            description:
              "De engine stuurt je door naar de volgende relevante pagina, calculator of gids in plaats van je met alleen een statische output achter te laten.",
          },
        ],
      },
    ],
    linksTitle: "Gerelateerde calculators en science-pagina's",
    links: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/measurement-guide", label: "Meetgids" },
      { href: "/science/bike-fit-methods", label: "Bikefit-methodes uitgelegd" },
      { href: "/science/stack-and-reach", label: "Stack en reach gids" },
      { href: "/about", label: "Hoe BestBikeFit4U werkt" },
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
  const pageUrl = new URL(
    withLocalePrefix("/science/calculation-engine", locale),
    BRAND.siteUrl
  ).toString();
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
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_18%,var(--background)_82%)_100%)] text-foreground">
      <JsonLd schema={articleJsonLd} />

      <PublicHero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        description={page.hero.description}
        chips={page.hero.chips}
        illustration={
          <PublicIllustrationPanel caption={page.hero.caption}>
            <div className="grid w-full gap-3">
              {page.hero.labels.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/85 px-4 py-3 text-sm font-medium text-[color:var(--foreground)]"
                >
                  <Calculator className="h-4 w-4 text-[color:var(--primary)]" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </PublicIllustrationPanel>
        }
      />

      {page.sections.map((section, index) => (
        <PublicSection
          key={section.title}
          className={index === 0 ? "pt-0" : undefined}
          header={{
            eyebrow: section.eyebrow,
            title: section.title,
            description: section.description,
          }}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {section.cards.map((card, cardIndex) => {
              const Icon = [Ruler, Sigma, Gauge][cardIndex] ?? Calculator;
              return (
                <PublicSurfaceCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  leading={<Icon aria-hidden="true" className="h-5 w-5" />}
                />
              );
            })}
          </div>
        </PublicSection>
      ))}

      <RelatedLinksSection title={page.linksTitle} links={page.links} locale={locale} />
    </PublicPageShell>
  );
}
