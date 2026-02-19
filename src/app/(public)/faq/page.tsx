import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import type { Locale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";

type FAQItem = { q: string; a: string };
type FAQSection = { category: string; questions: FAQItem[] };
type FAQLink = { href: string; label: string };

type FAQCopy = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  title: string;
  subtitle: string;
  sections: FAQSection[];
  guideTitle: string;
  guideBody: string;
  guideLinks: FAQLink[];
  ctaTitle: string;
  ctaSubtitle: string;
  contactButton: string;
  startButton: string;
};

const content: Record<Locale, FAQCopy> = {
  en: {
    metadata: {
      title: "FAQ - BestBikeFit4U",
      description:
        "Frequently asked questions about BestBikeFit4U. Learn how our bike fitting works, what affects accuracy, and what you get in your fit report.",
      keywords: [
        "bike fit FAQ",
        "bike fitting questions",
        "BestBikeFit4U help",
        "cycling fit accuracy",
      ],
    },
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about BestBikeFit4U.",
    sections: [
      {
        category: "Getting Started",
        questions: [
          {
            q: "How accurate is BestBikeFit4U?",
            a: "BestBikeFit4U uses established biomechanical formulas, including LeMond/Hamley for saddle height and KOPS-based logic for setback. For most riders, results are close to what a professional fitter would recommend. Adding optional measurements (torso, arm length, shoulder width) improves accuracy further.",
          },
          {
            q: "What measurements do I need?",
            a: "You need two required measurements: your height and inseam length. For improved accuracy, we also accept optional measurements including torso length, arm length, and shoulder width. See our measurement guide for detailed instructions on how to take each measurement.",
          },
          {
            q: "Do I need any special equipment to measure myself?",
            a: "You need a tape measure and a flat wall. For the inseam measurement, a hardcover book is helpful. All measurements can be taken at home; see our measurement guide for step-by-step instructions.",
          },
        ],
      },
      {
        category: "Bike Fitting",
        questions: [
          {
            q: "What types of bikes does BestBikeFit4U support?",
            a: "We support road bikes (endurance and race geometry), gravel bikes, mountain bikes (XC, trail, enduro), time trial/triathlon bikes, city/commuter bikes, and touring bikes. Each bike type uses category-specific multipliers and offset tables.",
          },
          {
            q: "Can I get a fit for multiple bikes?",
            a: "Yes. With a Pro or Premium plan, you can create unlimited bike profiles and run separate fit sessions for each. Each session considers the specific bike type and your goals for that bike.",
          },
          {
            q: "How does flexibility affect my fit?",
            a: "Your flexibility score adjusts bar drop, saddle height, and reach. Riders with limited flexibility get a more upright position with less bar drop, while flexible riders can sustain more aggressive positions.",
          },
          {
            q: "What if I have existing pain while riding?",
            a: "During the fit questionnaire, you can report pain points (knees, back, hands, neck, etc.). Our algorithm factors these in and provides specific solutions, such as saddle-height changes for knee pain and cockpit changes for hand numbness.",
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
            a: "PDF export is being rolled out. You can already email your results and review previous sessions from your dashboard.",
          },
        ],
      },
      {
        category: "Account and Pricing",
        questions: [
          {
            q: "Is there a money-back guarantee?",
            a: "Yes, we offer a 30-day money-back guarantee on paid plans.",
          },
          {
            q: "Can I change my plan later?",
            a: "Yes, you can upgrade or downgrade your plan from account settings.",
          },
        ],
      },
    ],
    guideTitle: "Popular next-step guides",
    guideBody:
      "If you came here for a specific pain point or bike type, these guides are the fastest next step.",
    guideLinks: [
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
      { href: "/guides/mountain-bike-fit-guide", label: "Mountain Bike Fit Guide" },
    ],
    ctaTitle: "Still have questions?",
    ctaSubtitle: "Get in touch or start your free fit session.",
    contactButton: "Contact Us",
    startButton: "Start Free Fit",
  },
  nl: {
    metadata: {
      title: "FAQ - BestBikeFit4U",
      description:
        "Veelgestelde vragen over BestBikeFit4U. Lees hoe onze bikefitting werkt, hoe nauwkeurig de uitkomsten zijn en wat je krijgt in je fitrapport.",
      keywords: ["bikefitting FAQ", "bikefitting vragen", "BestBikeFit4U hulp"],
    },
    title: "Veelgestelde vragen",
    subtitle: "Alles wat je moet weten over BestBikeFit4U.",
    sections: [
      {
        category: "Aan de slag",
        questions: [
          {
            q: "Hoe nauwkeurig is BestBikeFit4U?",
            a: "BestBikeFit4U gebruikt bewezen biomechanische formules, waaronder de LeMond/Hamley-methode voor zadelhoogte. Voor de meeste rijders zitten de uitkomsten dicht bij een professionele fitting, zeker met extra metingen zoals torso-, arm- en schouderbreedte.",
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
            a: "We ondersteunen racefietsen, gravel, mountainbike, tijdrit/triathlon, stads- en tourfietsen. Elk type gebruikt specifieke correctiefactoren.",
          },
          {
            q: "Kan ik meerdere fietsen fitten?",
            a: "Ja. Met Pro of Premium kun je meerdere fietsprofielen toevoegen en per fiets een aparte fit-sessie uitvoeren.",
          },
          {
            q: "Hoe beinvloedt flexibiliteit mijn fit?",
            a: "Je flexibiliteitsscore beinvloedt onder meer stuurdrop, zadelhoogte en reach. Minder flexibiliteit leidt meestal tot een rechtere en comfortabelere positie.",
          },
          {
            q: "Wat als ik nu al pijnklachten heb?",
            a: "Tijdens de vragenlijst kun je pijnpunten aangeven (knie, rug, handen, nek, enz.). Het algoritme verwerkt deze signalen en geeft gerichte aanpassingen.",
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
            a: "PDF-export wordt uitgerold. Je kunt je resultaten nu al e-mailen en eerdere sessies in je dashboard bekijken.",
          },
        ],
      },
      {
        category: "Account en prijzen",
        questions: [
          {
            q: "Is er een geld-terug-garantie?",
            a: "Ja, op betaalde plannen geldt een 30-dagen geld-terug-garantie.",
          },
          {
            q: "Kan ik later van plan wisselen?",
            a: "Ja, je kunt je plan op elk moment upgraden of downgraden via je accountinstellingen.",
          },
        ],
      },
    ],
    guideTitle: "Populaire vervolggidsen",
    guideBody:
      "Zoek je hulp bij een specifieke klacht of discipline? Start met een van deze gidsen.",
    guideLinks: [
      { href: "/guides/bike-fitting-for-knee-pain", label: "Bikefitting bij kniepijn" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
      { href: "/guides/mountain-bike-fit-guide", label: "MTB fit gids" },
    ],
    ctaTitle: "Nog vragen?",
    ctaSubtitle: "Neem contact op of start direct je gratis fit-sessie.",
    contactButton: "Neem contact op",
    startButton: "Start gratis fit",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = content[locale];

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
    },
    alternates: buildLocaleAlternates("/faq", locale),
  };
}

export default async function FAQPage() {
  const locale = await getRequestLocale();
  const page = content[locale];
  const pagePath = withLocalePrefix("/faq", locale);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">{page.title}</h1>
        <p className="mt-4 text-xl text-gray-600">{page.subtitle}</p>

        <div className="mt-12 space-y-12">
          {page.sections.map((section) => (
            <section key={section.category}>
              <h2 className="text-2xl font-semibold text-gray-900">{section.category}</h2>
              <dl className="mt-6 space-y-6">
                {section.questions.map((faq) => (
                  <div key={faq.q} className="rounded-lg border border-gray-200 p-6">
                    <dt className="text-lg font-medium text-gray-900">{faq.q}</dt>
                    <dd className="mt-2 text-gray-600">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <section className="mt-14 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-2xl font-semibold text-gray-900">{page.guideTitle}</h2>
          <p className="mt-2 text-gray-600">{page.guideBody}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {page.guideLinks.map((link) => (
              <Link
                key={link.href}
                href={withLocalePrefix(link.href, locale)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-2xl bg-blue-50 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">{page.ctaTitle}</h2>
          <p className="mt-2 text-gray-600">{page.ctaSubtitle}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href={withLocalePrefix("/contact", locale)}>
              <Button variant="outline">{page.contactButton}</Button>
            </Link>
            <TrackedCtaLink
              href={withLocalePrefix("/login", locale)}
              locale={locale}
              pagePath={pagePath}
              section="faq_final_cta"
              ctaLabel={page.startButton}
            >
              <Button>{page.startButton}</Button>
            </TrackedCtaLink>
          </div>
        </div>
      </div>
    </div>
  );
}
