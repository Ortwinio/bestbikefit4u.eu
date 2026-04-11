import type { Metadata } from "next";
import { Activity, Gauge, ShieldCheck } from "lucide-react";
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
      title: "FTP / W/kg Calculator | BestBikeFit4U",
      description:
        "Translate threshold power into W/kg and use it to compare climbing context, pacing, and performance goals.",
      keywords: ["FTP calculator", "W/kg calculator", "cycling threshold power"],
    },
    hero: {
      eyebrow: "BestBikeFit4U calculator",
      title: "FTP / W/kg Calculator",
      description:
        "Convert threshold power into a clearer performance context, then use that context to make pacing and climbing decisions.",
      chips: ["FTP context", "W/kg", "Pacing decisions"],
    },
    intro: {
      eyebrow: "What this tool is for",
      title: "A practical way to read threshold power",
      description:
        "FTP is useful, but only if you understand what it can and cannot tell you. This page turns that number into a safer first-pass context for training and climbing.",
    },
    features: [
      {
        title: "Compare power in context",
        description:
          "W/kg matters most when gradient and body mass shape the outcome. That makes climbs and event pacing easier to interpret.",
        icon: <Gauge className="h-5 w-5" />,
      },
      {
        title: "Keep the assumptions visible",
        description:
          "A threshold number is only as good as the test behind it. This page keeps the limits clear so riders do not overread the result.",
        icon: <ShieldCheck className="h-5 w-5" />,
      },
      {
        title: "Connect training and pacing",
        description:
          "The value of FTP is not just a label. It helps you decide how hard to start, hold, and finish a climb or event.",
        icon: <Activity className="h-5 w-5" />,
      },
    ],
    sections: [
      {
        title: "Common problems riders try to solve",
        items: [
          "Unsure whether a threshold number actually matches the climbing or pacing goal in front of them.",
          "Comparing riders by raw watts without accounting for body mass and terrain.",
          "Starting climbs too hard because pacing was never tied back to a realistic threshold baseline.",
        ],
      },
      {
        title: "What to check first",
        items: [
          "Check how FTP was tested before you trust the number.",
          "Use body mass and terrain together instead of treating watts as a full answer.",
          "Ask whether the goal is training context, climb pacing, or an event-specific strategy.",
        ],
      },
      {
        title: "What not to change blindly",
        items: [
          "Do not assume a higher FTP always means better pacing or climbing performance.",
          "Do not treat W/kg as a full story without considering aerodynamics, course profile, and fatigue.",
          "Do not copy a pacing plan from a different rider profile without testing it yourself.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is FTP the same as race power?",
        a: "Not exactly. FTP is a useful threshold reference, but race execution also depends on duration, terrain, and how well you pace fatigue.",
      },
      {
        q: "Why does W/kg matter more on climbs than on flats?",
        a: "Because gravity dominates uphill. On flatter roads, aerodynamics and speed management matter more than threshold alone.",
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
      title: "Bring the number into the dashboard",
      description:
        "Start a free account to keep the result alongside your ride setup, then use the dashboard when you want more detail and follow-up.",
      label: "Start Free Fit",
    },
  },
  nl: {
    metadata: {
      title: "FTP- / W/kg-calculator | BestBikeFit4U",
      description:
        "Vertaal drempelvermogen naar W/kg en gebruik het om klimcontext, pacing en prestatiedoelen beter te vergelijken.",
      keywords: ["FTP calculator", "W/kg calculator", "drempelvermogen fietsen"],
    },
    hero: {
      eyebrow: "BestBikeFit4U calculator",
      title: "FTP- / W/kg-calculator",
      description:
        "Zet drempelvermogen om in duidelijkere prestatiecontext en gebruik die context om pacing- en klimkeuzes beter te maken.",
      chips: ["FTP-context", "W/kg", "Pacing-keuzes"],
    },
    intro: {
      eyebrow: "Waar deze tool voor is",
      title: "Een praktische manier om drempelvermogen te lezen",
      description:
        "FTP is nuttig, maar alleen als je weet wat het wel en niet zegt. Deze pagina zet dat getal om in een veilig eerste contextbeeld voor training en klimmen.",
    },
    features: [
      {
        title: "Vergelijk vermogen in context",
        description:
          "W/kg is vooral belangrijk wanneer klimpercentage en lichaamsmassa samen het resultaat bepalen. Dat maakt klim- en eventpacing beter leesbaar.",
        icon: <Gauge className="h-5 w-5" />,
      },
      {
        title: "Houd de aannames zichtbaar",
        description:
          "Een drempelgetal is slechts zo goed als de test die eraan voorafging. Deze pagina houdt de grenzen duidelijk zodat je de uitkomst niet overschat.",
        icon: <ShieldCheck className="h-5 w-5" />,
      },
      {
        title: "Koppel training aan pacing",
        description:
          "De waarde van FTP is niet alleen een label. Het helpt je bepalen hoe hard je een klim of event moet openen, vasthouden en afronden.",
        icon: <Activity className="h-5 w-5" />,
      },
    ],
    sections: [
      {
        title: "Veelvoorkomende problemen die rijders proberen op te lossen",
        items: [
          "Onzeker of een drempelgetal echt past bij het klim- of pacingdoel voor de rit.",
          "Rijders vergelijken op ruwe watts zonder lichaamsmassa of terrein mee te nemen.",
          "Klimmen te hard openen omdat pacing nooit aan een realistische drempelbasis was gekoppeld.",
        ],
      },
      {
        title: "Wat je eerst controleert",
        items: [
          "Controleer hoe FTP is getest voordat je het getal vertrouwt.",
          "Gebruik lichaamsmassa en terrein samen in plaats van watts als volledig antwoord te zien.",
          "Bepaal of het doel trainingscontext, klimpacing of eventstrategie is.",
        ],
      },
      {
        title: "Wat je niet blind verandert",
        items: [
          "Ga er niet van uit dat een hogere FTP automatisch betere pacing of klimprestaties betekent.",
          "Zie W/kg niet als een compleet verhaal zonder aerodynamica, parcours en vermoeidheid mee te nemen.",
          "Kopieer een pacingplan van een andere rijder niet zonder het zelf te testen.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is FTP hetzelfde als racevermogen?",
        a: "Niet precies. FTP is een bruikbare drempelreferentie, maar wedstrijduitvoering hangt ook af van duur, terrein en hoe goed je vermoeidheid doseert.",
      },
      {
        q: "Waarom is W/kg belangrijker op klimmen dan op vlakke wegen?",
        a: "Omdat zwaartekracht bergop domineert. Op vlakke wegen zijn aerodynamica en snelheidsbeheer belangrijker dan drempel alleen.",
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
      title: "Breng het getal naar het dashboard",
      description:
        "Start een gratis account om de uitkomst naast je setup te bewaren en gebruik daarna het dashboard voor meer detail en opvolging.",
      label: "Start gratis fit",
    },
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/calculators/ftp-wkg", locale);

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

export default async function FtpWkgCalculatorPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const page = copy[locale];
  const pagePath = withLocalePrefix("/calculators/ftp-wkg", locale);
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
            name: isNl ? "Hoe gebruik je de FTP- / W/kg-calculator" : "How to use the FTP / W/kg calculator",
            description: isNl
              ? "Een korte flow om FTP om te zetten naar bruikbare klim- en pacingcontext."
              : "A short flow for turning FTP into usable climb and pacing context.",
            steps: isNl
              ? [
                  "Controleer hoe je FTP is bepaald.",
                  "Lees W/kg samen met lichaamsmassa en terrein.",
                  "Bepaal of je pacing, training of klimcontext wilt beoordelen.",
                  "Gebruik de uitkomst als eerste referentie en test het in de praktijk.",
                ]
              : [
                  "Check how your FTP was established.",
                  "Read W/kg together with body mass and terrain.",
                  "Decide whether you want pacing, training, or climb context.",
                  "Use the result as a first reference and test it in practice.",
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
                  section="ftp_wkg_primary_cta"
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
