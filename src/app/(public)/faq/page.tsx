import type { Metadata } from "next";
import Link from "next/link";
import { Languages, ShieldCheck, Stethoscope } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  PublicCtaBand,
  PublicFeatureCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
} from "@/components/public";
import { getCommercialFaqCopy, PRODUCT_LIVE_FLAGS } from "@/config/commercial";
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";

type RawFAQItem = { q: string; a: string };
type RawFAQSection = { category: string; questions: RawFAQItem[] };
type FAQItem = { id: string; question: string; answer: string };
type FAQSection = { id: string; title: string; items: FAQItem[] };
type FAQLink = { href: string; label: string };

type RawFAQCopy = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  title: string;
  intro: string;
  sections: RawFAQSection[];
  trustParagraph: string;
  guideTitle: string;
  guideBody: string;
  guideLinks: FAQLink[];
  nextStepTitle: string;
  nextStepPrimaryCta: string;
  nextStepSecondaryCta: string;
  ctaTitle: string;
  ctaSubtitle: string;
  contactButton: string;
  startButton: string;
};

type FAQCopy = Omit<RawFAQCopy, "sections"> & {
  sections: FAQSection[];
};

type FAQJsonLd = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
};

const sectionShellClass =
  "rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-sm sm:p-10";

function toId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeFAQCopy(raw: RawFAQCopy): FAQCopy {
  return {
    ...raw,
    sections: raw.sections.map((section) => {
      const sectionId = toId(section.category);

      return {
        id: sectionId,
        title: section.category,
        items: section.questions.map((faq, index) => ({
          id: `${sectionId}-${index + 1}`,
          question: faq.q,
          answer: faq.a,
        })),
      };
    }),
  };
}

function buildFaqJsonLd(sections: FAQSection[]): FAQJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sections.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question" as const,
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: item.answer,
        },
      }))
    ),
  };
}

function getRawContent(locale: Locale): RawFAQCopy {
  const commercialFaq = getCommercialFaqCopy(locale);

  if (locale === "en") {
    return {
      metadata: {
        title:
          "BestBikeFit4U FAQ | Online Bike Fitting, Saddle Height, Frame Size & Pain Fixes",
        description:
          "Answers about BestBikeFit4U online bike fitting: measurements, saddle height, setback, reach & drop, stack & reach, MTB/gravel/TT setups, pain troubleshooting, plans, exports, and safety guardrails.",
        keywords: [
          "online bike fitting FAQ",
          "saddle height",
          "frame size",
          "reach and drop",
          "stack and reach",
        ],
      },
      title: "Frequently Asked Questions",
      intro: "Everything you need to know about BestBikeFit4U.",
      sections: [
        {
          category: "Getting Started",
          questions: [
            {
              q: "How accurate is BestBikeFit4U?",
              a: "BestBikeFit4U uses established biomechanical formulas, including LeMond/Hamley for saddle height and KOPS-based logic for setback. For most riders, results are close to what a professional fitter would recommend. Adding optional measurements improves accuracy further.",
            },
            {
              q: "What measurements do I need?",
              a: "You need two required measurements: your height and inseam length. For improved accuracy, we also accept optional measurements including torso length, arm length, and shoulder width. See our measurement guide for detailed instructions.",
            },
            {
              q: "Do I need any special equipment to measure myself?",
              a: "You need a tape measure and a flat wall. For the inseam measurement, a hardcover book is helpful. All measurements can be taken at home.",
            },
          ],
        },
        {
          category: "Bike Fitting",
          questions: [
            {
              q: "What types of bikes does BestBikeFit4U support?",
              a: "We support road bikes, gravel bikes, mountain bikes, time trial or triathlon bikes, city or commuter bikes, and touring bikes. Each bike type uses category-specific fitting logic.",
            },
            {
              q: "Can I get a fit for multiple bikes?",
              a: commercialFaq.multipleBikeProfiles,
            },
            {
              q: "How does flexibility affect my fit?",
              a: "Your flexibility score adjusts bar drop, saddle height, and reach. Riders with limited flexibility get a more upright position with less bar drop, while flexible riders can sustain more aggressive positions.",
            },
            {
              q: "What if I have existing pain while riding?",
              a: "During the fit questionnaire, you can report the discomfort areas that matter most to you. BestBikeFit4U uses that context to help you review fit-related setup factors first, but persistent or severe pain may still require an in-person fitter or medical assessment.",
            },
          ],
        },
        {
          category: "Results and Reports",
          questions: [
            {
              q: "What do I get in a fit report?",
              a: "Your fit report includes saddle height, saddle setback, handlebar drop, reach, stem length and angle, crank length, handlebar width, frame size recommendation, and a prioritized adjustment guide.",
            },
            {
              q: "Can I email my results?",
              a: "Yes, you can email your fit report directly from the results page.",
            },
            {
              q: "Is PDF export available?",
              a: commercialFaq.pdfReport,
            },
          ],
        },
        {
          category: "Account and Pricing",
          questions: [
            {
              q: "Is there a money-back guarantee?",
              a: PRODUCT_LIVE_FLAGS.moneyBackGuarantee
                ? "Yes, an active public money-back guarantee is listed on the pricing page."
                : "No. There is currently no public money-back guarantee claim on BestBikeFit4U.",
            },
            {
              q: "Can I change my plan later?",
              a: "Yes, you can upgrade or downgrade your plan from account settings.",
            },
          ],
        },
      ],
      trustParagraph:
        "BestBikeFit4U uses established bike fitting methodology to give you practical, measurable setup targets. The free calculator is a strong starting point, and Pro adds deeper analysis, multiple bikes, and downloadable reports.",
      guideTitle: "Popular next-step guides",
      guideBody:
        "If you came here for a specific pain point or bike type, these guides are the fastest next step.",
      guideLinks: [
        { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain" },
        { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
        { href: "/guides/mountain-bike-fit-guide", label: "Mountain Bike Fit Guide" },
      ],
      nextStepTitle: "Ready to get started?",
      nextStepPrimaryCta: "Try the Free Bike Fit Calculator",
      nextStepSecondaryCta: "Compare Free vs Pro",
      ctaTitle: "Still have questions?",
      ctaSubtitle: "Get in touch or start your free fit session.",
      contactButton: "Contact Us",
      startButton: "Start Free Fit",
    };
  }

  return {
    metadata: {
      title:
        "BestBikeFit4U FAQ | Online bikefitting, zadelhoogte, framemaat & klachten oplossen",
      description:
        "Antwoorden over BestBikeFit4U online bikefitting: metingen, zadelhoogte, zadelterugstand, reach & drop, stack & reach, MTB/gravel/TT, klachten, abonnementen, exports en veiligheidsregels.",
      keywords: [
        "online bikefitting FAQ",
        "zadelhoogte",
        "framemaat",
        "reach en drop",
        "stack en reach",
      ],
    },
    title: "Veelgestelde vragen",
    intro: "Alles wat je moet weten over BestBikeFit4U.",
    sections: [
      {
        category: "Aan de slag",
        questions: [
          {
            q: "Hoe nauwkeurig is BestBikeFit4U?",
            a: "BestBikeFit4U gebruikt bewezen biomechanische formules, waaronder de LeMond/Hamley-methode voor zadelhoogte. Voor de meeste rijders zitten de uitkomsten dicht bij een professionele fitting, zeker met extra metingen.",
          },
          {
            q: "Welke metingen heb ik nodig?",
            a: "Je hebt twee verplichte metingen nodig: lengte en binnenbeenlengte. Voor meer nauwkeurigheid kun je optionele metingen toevoegen zoals torso-, arm- en schouderbreedte. Bekijk de meetgids voor instructies.",
          },
          {
            q: "Heb ik speciale apparatuur nodig?",
            a: "Een meetlint en vlakke muur zijn voldoende. Voor binnenbeenlengte is een hard kaftboek handig. Alle metingen kun je thuis uitvoeren.",
          },
        ],
      },
      {
        category: "Bikefitting",
        questions: [
          {
            q: "Welke fietstypes ondersteunt BestBikeFit4U?",
            a: "We ondersteunen racefietsen, gravel, mountainbike, tijdrit of triathlon, stads- en tourfietsen. Elk type gebruikt specifieke fitlogica.",
          },
          {
            q: "Kan ik meerdere fietsen fitten?",
            a: commercialFaq.multipleBikeProfiles,
          },
          {
            q: "Hoe beïnvloedt flexibiliteit mijn fit?",
            a: "Je flexibiliteitsscore beïnvloedt onder meer stuurdrop, zadelhoogte en reach. Minder flexibiliteit leidt meestal tot een rechtere en comfortabelere positie.",
          },
          {
            q: "Wat als ik nu al pijnklachten heb?",
            a: "Tijdens de fit-vragenlijst kun je aangeven waar je vooral ongemak ervaart. BestBikeFit4U gebruikt die context om fitgerelateerde afstelfactoren eerst te laten controleren, maar aanhoudende of hevige pijnklachten kunnen alsnog een fysieke fitter of medische beoordeling vragen.",
          },
        ],
      },
      {
        category: "Resultaten en rapporten",
        questions: [
          {
            q: "Wat staat er in een fitrapport?",
            a: "Je fitrapport bevat zadelhoogte, zadelterugstand, stuurdrop, reach, stuurpenadvies, cranklengte, stuurbreedte, framemaat en een prioriteitenlijst voor aanpassingen.",
          },
          {
            q: "Kan ik mijn resultaten e-mailen?",
            a: "Ja, je kunt je fitrapport direct vanuit de resultatenpagina naar jezelf mailen.",
          },
          {
            q: "Is PDF-export beschikbaar?",
            a: commercialFaq.pdfReport,
          },
        ],
      },
      {
        category: "Account en prijzen",
        questions: [
          {
            q: "Is er een geld-terug-garantie?",
            a: PRODUCT_LIVE_FLAGS.moneyBackGuarantee
              ? "Ja, er staat op dit moment een publieke geld-terug-garantie op de prijzenpagina."
              : "Nee. BestBikeFit4U doet op dit moment geen publieke claim over een geld-terug-garantie.",
          },
          {
            q: "Kan ik later van plan wisselen?",
            a: "Ja, je kunt je plan op elk moment upgraden of downgraden via je accountinstellingen.",
          },
        ],
      },
    ],
    trustParagraph:
      "BestBikeFit4U gebruikt beproefde bikefitting-methodologie om je praktische, meetbare afstelwaarden te geven. De gratis calculator is een sterk startpunt, en Pro voegt diepere analyse, meerdere fietsen en downloadbare rapporten toe.",
    guideTitle: "Populaire vervolggidsen",
    guideBody: "Zoek je hulp bij een specifieke klacht of discipline? Start met een van deze gidsen.",
    guideLinks: [
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bikefitting bij kniepijn" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
      { href: "/guides/mountain-bike-fit-guide", label: "MTB fit gids" },
    ],
    nextStepTitle: "Klaar om te beginnen?",
    nextStepPrimaryCta: "Probeer de gratis bikefit-calculator",
    nextStepSecondaryCta: "Vergelijk Gratis vs Pro",
    ctaTitle: "Nog vragen?",
    ctaSubtitle: "Neem contact op of start direct je gratis fit-sessie.",
    contactButton: "Neem contact op",
    startButton: "Start gratis fit",
  };
}

function getContent(locale: Locale): FAQCopy {
  return normalizeFAQCopy(getRawContent(locale));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = getContent(locale);
  const alternates = buildLocaleAlternates("/faq", locale);

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

export default async function FAQPage() {
  const locale = await getRequestLocale();
  const page = getContent(locale);
  const pagePath = withLocalePrefix("/faq", locale);
  const faqJsonLd = buildFaqJsonLd(page.sections);
  const trustPoints =
    locale === "nl"
      ? [
          {
            title: "Antwoorden afgestemd op wat echt live staat",
            description:
              "Deze pagina verwijst naar publieke productclaims en supportroutes die aansluiten op de huidige commerciële configuratie.",
            icon: <ShieldCheck className="h-5 w-5" />,
          },
          {
            title: "Eerlijk over grenzen van online fitting",
            description:
              "We benoemen bewust waar online advies stopt en wanneer een fysieke fitter of medische beoordeling verstandiger is.",
            icon: <Stethoscope className="h-5 w-5" />,
          },
          {
            title: "Beschikbaar in Nederlands en Engels",
            description:
              "De FAQ blijft inhoudelijk bruikbaar in beide talen zodat je dezelfde kerninformatie houdt in NL en EN.",
            icon: <Languages className="h-5 w-5" />,
          },
        ]
      : [
          {
            title: "Answers aligned with what is actually live",
            description:
              "This page points to public product claims and support routes that match the current commercial configuration.",
            icon: <ShieldCheck className="h-5 w-5" />,
          },
          {
            title: "Honest about the limits of online fitting",
            description:
              "We deliberately state where online guidance stops and when an in-person fitter or medical review is the wiser next step.",
            icon: <Stethoscope className="h-5 w-5" />,
          },
          {
            title: "Available in Dutch and English",
            description:
              "The FAQ stays substantively useful in both languages so the core information remains available in NL and EN.",
            icon: <Languages className="h-5 w-5" />,
          },
        ];

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_40%,var(--background)_60%)_100%)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={locale === "nl" ? "Snel antwoord" : "Quick answers"}
          title={page.title}
          description={page.intro}
          chips={
            locale === "nl"
              ? ["NL en EN beschikbaar", "Product en support", "Publieke claims"]
              : ["Available in Dutch and English", "Product and support", "Public claims"]
          }
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow:
              locale === "nl" ? "Waarom deze FAQ betrouwbaar is" : "Why this FAQ is trustworthy",
            title:
              locale === "nl"
                ? "Duidelijke antwoorden zonder marketingruis"
                : "Clear answers without marketing noise",
            description:
              locale === "nl"
                ? "De inhoud is bedoeld om twijfel weg te nemen, niet om meer zekerheid te claimen dan online fitting kan bieden."
                : "The content is designed to remove uncertainty, not to claim more certainty than online fitting can reasonably offer.",
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

        <div className="mt-12 space-y-12">
          {page.sections.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`${section.id}-title`}
              className={sectionShellClass}
            >
              <h2 id={`${section.id}-title`} className="text-2xl font-semibold text-foreground">
                {section.title}
              </h2>
              <div className="mt-6 space-y-4">
                {section.items.map((item) => (
                  <details
                    key={item.id}
                    className="group rounded-[1.5rem] border border-border/70 bg-muted/35 p-5 shadow-sm"
                  >
                    <summary className="cursor-pointer list-none text-lg text-foreground marker:hidden">
                      <strong>{item.question}</strong>
                    </summary>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className={`mt-14 ${sectionShellClass}`}>
          <p className="leading-relaxed text-muted-foreground">{page.trustParagraph}</p>
        </section>

        <section className="mt-14 rounded-[2rem] border border-border/70 bg-muted/70 p-8 shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold text-foreground">{page.guideTitle}</h2>
          <p className="mt-2 text-muted-foreground">{page.guideBody}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {page.guideLinks.map((link) => (
              <Link
                key={link.href}
                href={withLocalePrefix(link.href, locale)}
                className="rounded-2xl border border-border/70 bg-background/90 px-4 py-3 text-sm font-medium text-primary shadow-sm transition hover:bg-secondary/70"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className={`mt-14 ${sectionShellClass} text-center`}>
          <h2 className="text-2xl font-semibold text-foreground">{page.nextStepTitle}</h2>
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="faq_bottom_primary"
                  ctaLabel={page.nextStepPrimaryCta}
                />
              }
            >
              {page.nextStepPrimaryCta}
            </Button>
            <Button
              variant="secondary"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/pricing", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="faq_bottom_secondary"
                  ctaLabel={page.nextStepSecondaryCta}
                />
              }
            >
              {page.nextStepSecondaryCta}
            </Button>
          </div>
        </section>

        <PublicCtaBand
          className="mt-16"
          eyebrow={locale === "nl" ? "Nog niet gevonden?" : "Still deciding?"}
          title={page.ctaTitle}
          description={page.ctaSubtitle}
          actions={
            <>
              <Button variant="outline" render={<Link href={withLocalePrefix("/contact", locale)} />}>
                {page.contactButton}
              </Button>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="faq_final_cta"
                    ctaLabel={page.startButton}
                  />
                }
              >
                {page.startButton}
              </Button>
            </>
          }
          aside={
            locale === "nl"
              ? "Contact, support en FAQ blijven beschikbaar in zowel Nederlands als Engels."
              : "Contact, support, and FAQ remain available in both Dutch and English."
          }
        />
      </div>
    </PublicPageShell>
  );
}
