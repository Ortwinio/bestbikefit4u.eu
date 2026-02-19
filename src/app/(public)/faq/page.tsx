import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";

type FAQItem = { q: string; a: string };
type FAQSection = { category: string; questions: FAQItem[] };

type FAQCopy = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  title: string;
  subtitle: string;
  sections: FAQSection[];
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
        "Frequently asked questions about BestBikeFit4U. Learn about our bike fitting process, measurement accuracy, and how to get the best results.",
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
            a: "BestBikeFit4U uses established biomechanical formulas including the LeMond/Hamley method for saddle height and KOPS for setback. Our calculations are within 5mm of what a professional fitter would recommend for most riders. Providing optional measurements (torso, arm length, shoulder width) improves accuracy further.",
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
            a: "Your report includes saddle height, saddle setback, handlebar drop, reach, stem length and angle, crank length, handlebar width, cleat position, frame size recommendation, and a prioritized adjustment guide.",
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
    ctaTitle: "Still have questions?",
    ctaSubtitle: "Get in touch or start your free fit session.",
    contactButton: "Contact Us",
    startButton: "Start Your Free Fit",
  },
  nl: {
    metadata: {
      title: "FAQ - BestBikeFit4U",
      description:
        "Veelgestelde vragen over BestBikeFit4U. Lees meer over ons bike fitting proces, meetnauwkeurigheid en hoe je de beste resultaten krijgt.",
      keywords: ["bike fit FAQ", "bike fitting vragen", "BestBikeFit4U hulp"],
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
        category: "Bike fitting",
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
            a: "Je flexibiliteitsscore beinvloedt onder meer bar drop, zadelhoogte en reach. Minder flexibel betekent doorgaans een rechtere, comfortabelere positie.",
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
            q: "Wat staat er in een fit-rapport?",
            a: "Het rapport bevat zadelhoogte, setback, bar drop, reach, stuurpenadvies, cranklengte, stuurbreedte, framemaat en een prioriteitenlijst voor aanpassingen.",
          },
          {
            q: "Kan ik mijn resultaten e-mailen?",
            a: "Ja, je kunt je fit-rapport direct vanuit de resultatenpagina naar jezelf mailen.",
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
    ctaTitle: "Nog vragen?",
    ctaSubtitle: "Neem contact op of start direct je gratis fit-sessie.",
    contactButton: "Neem contact op",
    startButton: "Start je gratis fit",
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

        <div className="mt-16 rounded-2xl bg-blue-50 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">{page.ctaTitle}</h2>
          <p className="mt-2 text-gray-600">{page.ctaSubtitle}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href={withLocalePrefix("/contact", locale)}>
              <Button variant="outline">{page.contactButton}</Button>
            </Link>
            <Link href={withLocalePrefix("/login", locale)}>
              <Button>{page.startButton}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
