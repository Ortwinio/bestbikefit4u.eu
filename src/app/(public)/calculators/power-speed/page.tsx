import type { Metadata } from "next";
import { Gauge, Route, ShieldCheck } from "lucide-react";
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
      title: "Power / Speed Estimator | BestBikeFit4U",
      description:
        "Estimate speed from power with terrain, drag, and rider context in mind instead of treating watts as a shortcut.",
      keywords: ["power speed estimator", "cycling speed calculator", "power to speed"],
    },
    hero: {
      eyebrow: "BestBikeFit4U calculator",
      title: "Power / Speed Estimator",
      description:
        "Estimate how power translates into speed on a given course, then use the result as a practical pacing reference rather than a promise.",
      chips: ["Power to speed", "Course context", "Pacing reference"],
    },
    intro: {
      eyebrow: "What this tool is for",
      title: "Translate watts into course reality",
      description:
        "Speed is shaped by more than power. This page keeps gradient, drag, and rider context visible so the result stays useful rather than falsely precise.",
    },
    features: [
      {
        title: "Context over shortcuts",
        description:
          "A raw watt number does not tell you enough. Course profile, wind, and position change the answer in real riding conditions.",
        icon: <Route className="h-5 w-5" />,
      },
      {
        title: "Keep uncertainty visible",
        description:
          "The estimator is best treated as a range and a conversation starter, not a substitute for testing or race experience.",
        icon: <ShieldCheck className="h-5 w-5" />,
      },
      {
        title: "Useful for pacing decisions",
        description:
          "Once speed expectations are clearer, it becomes easier to plan climbs, time trials, and long steady efforts with fewer surprises.",
        icon: <Gauge className="h-5 w-5" />,
      },
    ],
    sections: [
      {
        title: "Common problems riders try to solve",
        items: [
          "Estimating whether a target power actually translates into the speed they expect.",
          "Comparing efforts on flat and hilly terrain without adjusting for drag and gradient.",
          "Setting pacing goals without understanding how much position and route shape the outcome.",
        ],
      },
      {
        title: "What to check first",
        items: [
          "Check the course profile before trusting a speed estimate.",
          "Make sure the power input reflects the effort you can actually hold for the event length.",
          "Use the result as a pace guide, not as a guarantee of finish time.",
        ],
      },
      {
        title: "What not to change blindly",
        items: [
          "Do not assume a small watt increase always produces the same speed gain everywhere.",
          "Do not ignore aerodynamics and rolling resistance when comparing outputs.",
          "Do not treat a single speed estimate as a substitute for race-specific testing.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why is speed harder to estimate than power?",
        a: "Because speed is affected by gradient, wind, surface, position, and mass as well as power.",
      },
      {
        q: "Can this be used for time trial pacing?",
        a: "Yes, as a first-pass reference. For a serious event plan, use the dashboard and real course testing as the next step.",
      },
    ],
    relatedTitle: "Related guides",
    relatedLinks: [
      { href: "/guides/ftp-explained", label: "FTP Explained" },
      { href: "/guides/wkg-and-power-zones-guide", label: "W/kg and Power Zones Guide" },
      { href: "/guides/power-to-speed-guide", label: "Power-to-Speed Guide" },
      { href: "/guides/climb-time-and-event-pacing-guide", label: "Climb Time and Event Pacing Guide" },
    ],
    cta: {
      eyebrow: "Next step",
      title: "Use the dashboard when you want more precision",
      description:
        "Start a free account to keep your estimates together and move into the guided workflow when you want deeper context.",
      label: "Start Free Fit",
    },
  },
  nl: {
    metadata: {
      title: "Power- / snelheidsschatting | BestBikeFit4U",
      description:
        "Schat snelheid op basis van vermogen met terrein, luchtweerstand en rijdercontext meegewogen in plaats van watts als shortcut te zien.",
      keywords: ["power speed estimator", "snelheid calculator", "vermogen naar snelheid"],
    },
    hero: {
      eyebrow: "BestBikeFit4U calculator",
      title: "Power- / snelheidsschatting",
      description:
        "Schat hoe vermogen zich vertaalt naar snelheid op een bepaald parcours en gebruik dat als praktisch pacingreferentiepunt in plaats van als belofte.",
      chips: ["Vermogen naar snelheid", "Parcourscontext", "Pacingreferentie"],
    },
    intro: {
      eyebrow: "Waar deze tool voor is",
      title: "Zet watts om naar parcoursrealiteit",
      description:
        "Snelheid hangt van meer af dan vermogen. Deze pagina houdt klimpercentage, luchtweerstand en rijdercontext zichtbaar zodat de uitkomst bruikbaar blijft in plaats van schijnnauwkeurig.",
    },
    features: [
      {
        title: "Context boven shortcuts",
        description:
          "Een ruwe wattwaarde zegt niet genoeg. Parcours, wind en positie veranderen het antwoord in echte rijomstandigheden.",
        icon: <Route className="h-5 w-5" />,
      },
      {
        title: "Houd onzekerheid zichtbaar",
        description:
          "De schatter werkt het best als bandbreedte en gesprekshulp, niet als vervanging van testen of wedstrijdervaring.",
        icon: <ShieldCheck className="h-5 w-5" />,
      },
      {
        title: "Nuttig voor pacingkeuzes",
        description:
          "Als snelheidsverwachtingen duidelijker zijn, wordt het makkelijker om klimmen, tijdritten en steady efforts beter te plannen.",
        icon: <Gauge className="h-5 w-5" />,
      },
    ],
    sections: [
      {
        title: "Veelvoorkomende problemen die rijders proberen op te lossen",
        items: [
          "Inschatten of een target power echt de verwachte snelheid oplevert.",
          "Vergelijken van vlakke en heuvelachtige inspanningen zonder drag en klimpercentage mee te nemen.",
          "Pacingdoelen bepalen zonder te begrijpen hoeveel positie en route het resultaat sturen.",
        ],
      },
      {
        title: "Wat je eerst controleert",
        items: [
          "Controleer het parcoursprofiel voordat je een snelheidsschatting vertrouwt.",
          "Zorg dat de power-input past bij de inspanning die je voor die afstand echt kunt volhouden.",
          "Gebruik de uitkomst als pacinghulp, niet als garantie voor een finishtijd.",
        ],
      },
      {
        title: "Wat je niet blind verandert",
        items: [
          "Ga er niet van uit dat een kleine wattstijging overal dezelfde snelheidswinst geeft.",
          "Negeer aerodynamica en rolweerstand niet wanneer je uitkomsten vergelijkt.",
          "Zie een enkele snelheidsschatting niet als vervanging voor tests op wedstrijdniveau.",
        ],
      },
    ],
    faqs: [
      {
        q: "Waarom is snelheid lastiger in te schatten dan vermogen?",
        a: "Omdat snelheid niet alleen door vermogen wordt bepaald maar ook door klimpercentage, wind, ondergrond, houding en massa.",
      },
      {
        q: "Kan dit voor een tijdrit worden gebruikt?",
        a: "Ja, als eerste referentie. Voor een serieuze wedstrijdaanpak gebruik je daarna het dashboard en tests op echt parcours.",
      },
    ],
    relatedTitle: "Gerelateerde gidsen",
    relatedLinks: [
      { href: "/guides/ftp-explained", label: "FTP uitgelegd" },
      { href: "/guides/wkg-and-power-zones-guide", label: "W/kg- en powerzonesgids" },
      { href: "/guides/power-to-speed-guide", label: "Power-naar-snelheidsgids" },
      { href: "/guides/climb-time-and-event-pacing-guide", label: "Klimtijd- en eventpacinggids" },
    ],
    cta: {
      eyebrow: "Volgende stap",
      title: "Gebruik het dashboard als je meer precisie wilt",
      description:
        "Start een gratis account om je schattingen samen te bewaren en stap daarna over naar de begeleide workflow voor meer context.",
      label: "Start gratis fit",
    },
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/calculators/power-speed", locale);

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

export default async function PowerSpeedEstimatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const page = copy[locale];
  const pagePath = withLocalePrefix("/calculators/power-speed", locale);
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
            name: isNl ? "Hoe gebruik je de power- / snelheidsschatting" : "How to use the power / speed estimator",
            description: isNl
              ? "Een korte flow om vermogen te vertalen naar bruikbare snelheidscontext."
              : "A short flow for translating power into usable speed context.",
            steps: isNl
              ? [
                  "Controleer je power-invoer en parcoursprofiel.",
                  "Bekijk hoe stijging, wind en positie de uitkomst beïnvloeden.",
                  "Gebruik de schatting als pacingreferentie.",
                  "Test het plan opnieuw op echt parcours.",
                ]
              : [
                  "Check your power input and course profile.",
                  "Review how gradient, wind, and position affect the result.",
                  "Use the estimate as a pacing reference.",
                  "Test the plan again on a real course.",
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

        <PublicSection className="mt-10" header={{ eyebrow: "FAQ", title: "FAQ" }}>
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
                  section="power_speed_primary_cta"
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
