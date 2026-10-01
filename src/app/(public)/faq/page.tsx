import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCommercialFaqCopy, PRODUCT_LIVE_FLAGS } from "@/config/commercial";
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { faqPresentation } from "@/i18n/marketing/faq";
import { getDutchGuideTitle } from "@/i18n/marketing/guideTitles";
import styles from "./faq.module.css";

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
          "Answers about BestBikeFit4U online bike fitting: measurements, saddle height, setback, " +
          "reach & drop, stack & reach, MTB/gravel/TT setups, pain troubleshooting, plans, exports, " +
          "and safety guardrails.",
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
              a:
                "BestBikeFit4U uses established biomechanical formulas, including LeMond/Hamley for saddle " +
                "height and KOPS-based logic for setback. For most riders, results are close to what a " +
                "professional fitter would recommend. Adding optional measurements improves accuracy " +
                "further.",
            },
            {
              q: "What measurements do I need?",
              a:
                "You need two required measurements: your height and inseam length. For improved accuracy, " +
                "we also accept optional measurements including torso length, arm length, and shoulder " +
                "width. See our measurement guide for detailed instructions.",
            },
            {
              q: "Do I need any special equipment to measure myself?",
              a:
                "You need a tape measure and a flat wall. For the inseam measurement, a hardcover book is " +
                "helpful. All measurements can be taken at home.",
            },
          ],
        },
        {
          category: "Bike Fitting",
          questions: [
            {
              q: "What types of bikes does BestBikeFit4U support?",
              a:
                "We support road bikes, gravel bikes, mountain bikes, time trial or triathlon bikes, city " +
                "or commuter bikes, and touring bikes. Each bike type uses category-specific fitting logic.",
            },
            {
              q: "Can I get a fit for multiple bikes?",
              a: commercialFaq.multipleBikeProfiles,
            },
            {
              q: "How does flexibility affect my fit?",
              a:
                "Your flexibility score adjusts bar drop, saddle height, and reach. Riders with limited " +
                "flexibility get a more upright position with less bar drop, while flexible riders can " +
                "sustain more aggressive positions.",
            },
            {
              q: "What if I have existing pain while riding?",
              a:
                "During the fit questionnaire, you can report the discomfort areas that matter most to " +
                "you. BestBikeFit4U uses that context to help you review fit-related setup factors first, " +
                "but persistent or severe pain may still require an in-person fitter or medical assessment.",
            },
          ],
        },
        {
          category: "Results and Reports",
          questions: [
            {
              q: "What do I get in a fit report?",
              a:
                "Your fit report includes saddle height, saddle setback, handlebar drop, reach, stem " +
                "length and angle, crank length, handlebar width, frame size recommendation, and a " +
                "prioritized adjustment guide.",
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
        "BestBikeFit4U uses established bike fitting methodology to give you practical, measurable " +
        "setup targets. The free calculator is a strong starting point, and Pro adds deeper " +
        "analysis, multiple bikes, and downloadable reports.",
      guideTitle: "Popular next-step guides",
      guideBody:
        "If you came here for a specific pain point or bike type, these guides are the fastest next step.",
      guideLinks: [
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
        { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain" },
        { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
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
        "Antwoorden over BestBikeFit4U online bikefitting: metingen, zadelhoogte, zadelterugstand, " +
        "reach & drop, stack & reach, MTB/gravel/TT, klachten, abonnementen, exports en " +
        "veiligheidsregels.",
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
            a:
              "BestBikeFit4U gebruikt bewezen biomechanische formules, waaronder de " +
              "LeMond/Hamley-methode voor zadelhoogte. Voor de meeste rijders zitten de uitkomsten dicht " +
              "bij een professionele fitting, zeker met extra metingen.",
          },
          {
            q: "Welke metingen heb ik nodig?",
            a:
              "Je hebt twee verplichte metingen nodig: lengte en binnenbeenlengte. Voor meer " +
              "nauwkeurigheid kun je optionele metingen toevoegen zoals torso-, arm- en schouderbreedte. " +
              "Bekijk de meetgids voor instructies.",
          },
          {
            q: "Heb ik speciale apparatuur nodig?",
            a:
              "Een meetlint en vlakke muur zijn voldoende. Voor binnenbeenlengte is een hard kaftboek " +
              "handig. Alle metingen kun je thuis uitvoeren.",
          },
        ],
      },
      {
        category: "Bikefitting",
        questions: [
          {
            q: "Welke fietstypes ondersteunt BestBikeFit4U?",
            a:
              "We ondersteunen racefietsen, gravel, mountainbike, tijdrit of triathlon, stads- en " +
              "tourfietsen. Elk type gebruikt specifieke fitlogica.",
          },
          {
            q: "Kan ik meerdere fietsen fitten?",
            a: commercialFaq.multipleBikeProfiles,
          },
          {
            q: "Hoe beïnvloedt flexibiliteit mijn fit?",
            a:
              "Je flexibiliteitsscore beïnvloedt onder meer stuurdrop, zadelhoogte en reach. Minder " +
              "flexibiliteit leidt meestal tot een rechtere en comfortabelere positie.",
          },
          {
            q: "Wat als ik nu al pijnklachten heb?",
            a:
              "Tijdens de fit-vragenlijst kun je aangeven waar je vooral ongemak ervaart. BestBikeFit4U " +
              "gebruikt die context om fitgerelateerde afstelfactoren eerst te laten controleren, maar " +
              "aanhoudende of hevige pijnklachten kunnen alsnog een fysieke fitter of medische " +
              "beoordeling vragen.",
          },
        ],
      },
      {
        category: "Resultaten en rapporten",
        questions: [
          {
            q: "Wat staat er in een fitrapport?",
            a:
              "Je fitrapport bevat zadelhoogte, zadelterugstand, stuurdrop, reach, stuurpenadvies, " +
              "cranklengte, stuurbreedte, framemaat en een prioriteitenlijst voor aanpassingen.",
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
      "BestBikeFit4U gebruikt beproefde bikefitting-methodologie om je praktische, meetbare " +
      "afstelwaarden te geven. De gratis calculator is een sterk startpunt, en Pro voegt diepere " +
      "analyse, meerdere fietsen en downloadbare rapporten toe.",
    guideTitle: "Populaire vervolggidsen",
    guideBody: "Zoek je hulp bij een specifieke klacht of discipline? Start met een van deze gidsen.",
    guideLinks: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bikefitting bij kniepijn" },
      { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
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
  const presentation = faqPresentation[locale];
  const pagePath = withLocalePrefix("/faq", locale);
  const faqJsonLd = buildFaqJsonLd(page.sections);

  return (
    <div className={styles.page}>
      <JsonLd schema={faqJsonLd} />
      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="faq-title">
          <p className={styles.eyebrow}>{presentation.eyebrow}</p>
          <h1 id="faq-title">{page.title}</h1>
          <p>{page.intro}</p>
        </section>

        <div className={styles.trust}>
          {presentation.trustPoints.map((point) => (
            <section key={point.title}>
              <h2>{point.title}</h2>
              <p>{point.description}</p>
            </section>
          ))}
        </div>

        {page.sections.map((section) => (
          <section key={section.id} aria-labelledby={`${section.id}-title`} className={styles.group}>
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            <div>
              {section.items.map((item) => (
                <details key={item.id} open className={styles.disclosure}>
                  <summary aria-controls={`${item.id}-answer`}>{item.question}</summary>
                  <p id={`${item.id}-answer`}>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <section className={styles.guides} aria-labelledby="faq-guides">
          <p className={styles.eyebrow}>{presentation.guideEyebrow}</p>
          <h2 id="faq-guides">{page.guideTitle}</h2>
          <p>{page.guideBody}</p>
          <div className={styles.guideGrid}>
            {page.guideLinks.map((link) => (
              <Link key={link.href} href={withLocalePrefix(link.href, locale)}>
                {locale === "nl" && link.href.startsWith("/guides/")
                  ? getDutchGuideTitle(link.href.slice("/guides/".length)) ?? link.label
                  : link.label}
                <span aria-hidden="true"> →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.nextStep} aria-labelledby="faq-next-step">
          <div>
            <h2 id="faq-next-step">{page.nextStepTitle}</h2>
            <p>{page.trustParagraph}</p>
          </div>
          <div className={styles.actions}>
            <Button
              role="link"
              className={styles.button}
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
              role="link"
              variant="outline"
              className={styles.button}
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

        <section className={styles.cta} aria-labelledby="faq-contact">
          <div>
            <p className={styles.eyebrow}>{presentation.contactEyebrow}</p>
            <h2 id="faq-contact">{page.ctaTitle}</h2>
            <p>{page.ctaSubtitle}</p>
            <p>{presentation.support}</p>
          </div>
          <div className={styles.actions}>
            <Button
              role="link"
              className={`${styles.button} ${styles.contactButton}`}
              render={<Link href={withLocalePrefix("/contact", locale)} />}
            >
              {page.contactButton}
            </Button>
            <Button
              role="link"
              variant="outline"
              className={styles.button}
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
          </div>
        </section>
      </div>
    </div>
  );
}
