import type { Metadata } from "next";
import { Droplets, FlameKindling, ShieldCheck } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  PublicCtaBand,
  PublicFeatureCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import {
  buildFaqPageSchema,
  buildHowToSchema,
  buildWebApplicationSchema,
} from "@/lib/seo/jsonLd";

const copy = {
  en: {
    metadata: {
      title: "Fuel & Hydration Planner | BestBikeFit4U",
      description:
        "Plan carbs, fluids, and sodium for long rides with a practical first-pass fueling and hydration workflow.",
      keywords: [
        "fuel hydration planner",
        "cycling nutrition planner",
        "hydration calculator",
      ],
    },
    hero: {
      eyebrow: "BestBikeFit4U calculator",
      title: "Fuel & Hydration Planner",
      description:
        "Plan a realistic fueling and hydration strategy before a long ride, event, or indoor session starts to drift into avoidable fatigue.",
      chips: ["Carbs per hour", "Sweat-rate context", "Race-day planning"],
    },
    intro: {
      eyebrow: "What this tool is for",
      title: "A safe first pass for ride fueling",
      description:
        "This page helps you think in ranges instead of guessing from habit. It is designed to make the next decision clearer, not to overpromise exact numbers for every rider.",
    },
    features: [
      {
        title: "Plan before the ride starts",
        description:
          "Use ride duration, intensity, and expected heat to choose a workable starting plan rather than reacting after fatigue already hits.",
        icon: <FlameKindling className="h-5 w-5" />,
      },
      {
        title: "Keep hydration realistic",
        description:
          "Bottle count, refill points, and sweat loss matter together. A useful plan should fit the route and the conditions you actually ride in.",
        icon: <Droplets className="h-5 w-5" />,
      },
      {
        title: "Stay cautious with assumptions",
        description:
          "Gut tolerance, climate, and training load change the answer. Conservative planning is usually more durable than chasing a single exact target.",
        icon: <ShieldCheck className="h-5 w-5" />,
      },
    ],
    sections: [
      {
        title: "Common problems riders try to solve",
        items: [
          "Running out of energy on long steady rides or during late-race fatigue.",
          "Drinking too little in heat, or too much because the plan is not tied to actual sweat loss.",
          "Pacing climbs or events too hard because fueling never matched the effort.",
        ],
      },
      {
        title: "What to check first",
        items: [
          "Estimate ride length, temperature, and intensity before changing any intake target.",
          "Check whether the goal is endurance, performance, or simply avoiding a bonk.",
          "Start from a conservative range and adjust only after you know what your gut and bottles can handle.",
        ],
      },
      {
        title: "What not to change blindly",
        items: [
          "Do not copy a pro-level intake plan without testing it at your own pace and gut tolerance.",
          "Do not push sodium or carbohydrate higher just because more sounds more scientific.",
          "Do not treat one ride's success as proof that the same plan works in every condition.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is this meant to replace a nutrition coach?",
        a: "No. It gives a practical first-pass plan and a clearer decision path. Complex cases still benefit from a coach or sports nutrition review.",
      },
      {
        q: "Should hydration always be measured in exact milliliters per hour?",
        a: "No. Sweat rate, weather, and access to bottles make ranges more useful than pretending there is one universal number.",
      },
    ],
    relatedTitle: "Related guides",
    relatedLinks: [
      { href: "/guides/cycling-fueling-basics", label: "Cycling Fueling Basics" },
      { href: "/guides/carbs-per-hour-guide", label: "Carbs per Hour Guide" },
      { href: "/guides/hydration-and-sweat-rate-guide", label: "Hydration and Sweat Rate Guide" },
      { href: "/guides/sodium-and-electrolytes-guide", label: "Sodium and Electrolytes Guide" },
    ],
    cta: {
      eyebrow: "Next step",
      title: "Turn the plan into your own workflow",
      description:
        "Start a free account to save your fit and training decisions in one place, then use the dashboard when you want more detail.",
      label: "Start Free Fit",
    },
  },
  nl: {
    metadata: {
      title: "Brandstof- en hydratatieplanner | BestBikeFit4U",
      description:
        "Plan koolhydraten, vocht en natrium voor lange ritten met een praktische eerste richting voor voeding en hydratatie.",
      keywords: [
        "voeding hydratatie planner",
        "fietsvoeding calculator",
        "hydratatie calculator",
      ],
    },
    hero: {
      eyebrow: "BestBikeFit4U calculator",
      title: "Brandstof- en hydratatieplanner",
      description:
        "Werk een realistische voedings- en hydratatiestrategie uit voordat een lange rit, wedstrijd of indoor sessie in onnodige vermoeidheid eindigt.",
      chips: ["Koolhydraten per uur", "Zweetcontext", "Wedstrijdplanning"],
    },
    intro: {
      eyebrow: "Waar deze tool voor is",
      title: "Een veilig eerste plan voor voeding onderweg",
      description:
        "Deze pagina helpt je in bandbreedtes te denken in plaats van te gokken op gewoonte. De bedoeling is om de volgende keuze duidelijker te maken, niet om voor elke rijder een exact getal te beloven.",
    },
    features: [
      {
        title: "Plan vóór je vertrekt",
        description:
          "Gebruik ritduur, intensiteit en verwachte warmte om een werkbaar startplan te kiezen voordat vermoeidheid toeslaat.",
        icon: <FlameKindling className="h-5 w-5" />,
      },
      {
        title: "Houd hydratatie realistisch",
        description:
          "Flesvolume, bevoorrading en zweetverlies horen samen. Een bruikbaar plan past bij de route en de omstandigheden waarin je echt rijdt.",
        icon: <Droplets className="h-5 w-5" />,
      },
      {
        title: "Wees voorzichtig met aannames",
        description:
          "Gut tolerance, klimaat en trainingsbelasting veranderen het antwoord. Conservatief plannen is meestal duurzamer dan een enkel exact getal najagen.",
        icon: <ShieldCheck className="h-5 w-5" />,
      },
    ],
    sections: [
      {
        title: "Veelvoorkomende problemen die rijders willen oplossen",
        items: [
          "Energie tekort op lange steady ritten of in de laatste fase van een wedstrijd.",
          "Te weinig drinken in warmte, of juist te veel omdat het plan niet aan echt zweetverlies is gekoppeld.",
          "Klimmen of wedstrijden te hard openen omdat voeding nooit op de inspanning was afgestemd.",
        ],
      },
      {
        title: "Wat je eerst controleert",
        items: [
          "Schat duur, temperatuur en intensiteit in voordat je een inname-target verandert.",
          "Controleer of het doel endurance, prestatie of simpelweg bonken voorkomen is.",
          "Begin met een conservatieve range en pas pas aan nadat je weet wat je maag en flessen aankunnen.",
        ],
      },
      {
        title: "Wat je niet blind verandert",
        items: [
          "Kopieer geen pro-plan zonder het op je eigen tempo en gut tolerance te testen.",
          "Zet koolhydraten of natrium niet hoger alleen omdat meer wetenschappelijk klinkt.",
          "Zie succes op één rit niet als bewijs dat hetzelfde plan altijd werkt.",
        ],
      },
    ],
    faqs: [
      {
        q: "Vervangt dit een sportdiëtist?",
        a: "Nee. Het geeft een praktisch eerste plan en een duidelijkere beslisroute. Complexe situaties profiteren nog steeds van een coach of sports nutrition review.",
      },
      {
        q: "Moet hydratatie altijd exact in milliliters per uur worden uitgedrukt?",
        a: "Nee. Zweetverlies, weer en flesvoorziening maken bandbreedtes bruikbaarder dan doen alsof er één universeel getal is.",
      },
    ],
    relatedTitle: "Gerelateerde gidsen",
    relatedLinks: [
      { href: "/guides/cycling-fueling-basics", label: "Basis van fietsvoeding" },
      { href: "/guides/carbs-per-hour-guide", label: "Koolhydraten per uur gids" },
      { href: "/guides/hydration-and-sweat-rate-guide", label: "Hydratatie en zweetverlies gids" },
      { href: "/guides/sodium-and-electrolytes-guide", label: "Natrium- en elektrolytengids" },
    ],
    cta: {
      eyebrow: "Volgende stap",
      title: "Zet het plan om in je eigen workflow",
      description:
        "Start een gratis account om je fit- en trainingskeuzes op één plek op te slaan en gebruik daarna het dashboard voor meer detail.",
      label: "Start gratis fit",
    },
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/calculators/fuel-hydration", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: [...page.metadata.keywords],
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function FuelHydrationPlannerPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const page = copy[locale];
  const pagePath = withLocalePrefix("/calculators/fuel-hydration", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();

  return (
    <PublicPageShell className="text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: page.metadata.title,
            description: page.metadata.description,
            url: pageUrl,
          }),
          buildHowToSchema({
            name: isNl ? "Hoe gebruik je de brandstof- en hydratatieplanner" : "How to use the fuel and hydration planner",
            description: isNl
              ? "Een eenvoudige flow om een realistisch plan voor lange ritten te maken."
              : "A short flow for building a realistic plan for longer rides.",
            steps: isNl
              ? [
                  "Schat duur, intensiteit en temperatuur in.",
                  "Bepaal je koolhydraat- en vochtbandbreedte.",
                  "Controleer of de route en de bevoorrading passen.",
                  "Test het plan conservatief op een echte rit.",
                ]
              : [
                  "Estimate duration, intensity, and temperature.",
                  "Choose your carbohydrate and hydration range.",
                  "Check whether the route and refill points fit the plan.",
                  "Test the plan conservatively on a real ride.",
                ],
          }),
          buildFaqPageSchema([...page.faqs]),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={page.hero.eyebrow}
          title={page.hero.title}
          description={page.hero.description}
          chips={[...page.hero.chips]}
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: page.intro.eyebrow,
            title: page.intro.title,
            description: page.intro.description,
          }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {page.features.map((feature) => (
              <PublicFeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </PublicSection>

        {page.sections.map((section) => (
          <PublicSection
            key={section.title}
            className="mt-10"
            header={{ title: section.title }}
          >
            <div className="grid gap-4">
              {section.items.map((item) => (
                <PublicSurfaceCard key={item} description={item} />
              ))}
            </div>
          </PublicSection>
        ))}

        <PublicSection
          className="mt-10"
          header={{ eyebrow: "FAQ", title: "FAQ" }}
        >
          <div className="grid gap-4">
            {page.faqs.map((faq) => (
              <PublicSurfaceCard key={faq.q} title={faq.q} description={faq.a} />
            ))}
          </div>
        </PublicSection>

        <RelatedLinksSection
          title={page.relatedTitle}
          links={[...page.relatedLinks]}
          locale={locale}
        />

        <PublicCtaBand
          className="mt-10"
          eyebrow={page.cta.eyebrow}
          title={page.cta.title}
          description={page.cta.description}
          actions={
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="fuel_hydration_primary_cta"
                  ctaLabel={page.cta.label}
                />
              }
            >
              {page.cta.label}
            </Button>
          }
        />
      </div>
    </PublicPageShell>
  );
}
