import Link from "next/link";
import { Button } from "@/components/ui";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";

type Tier = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
};

type PricingCopy = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  title: string;
  subtitle: string;
  popular: string;
  perMonth: string;
  tiers: Tier[];
  comparisonTitle: string;
  comparisonHeaders: [string, string, string, string];
  comparisonRows: [string, string, string, string][];
  faqTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
};

const content: Record<Locale, PricingCopy> = {
  en: {
    metadata: {
      title: "Pricing - BikeFit AI Plans and Features",
      description:
        "Choose the BikeFit AI plan that fits your needs. Free plan available for individual cyclists, Pro for enthusiasts, and Premium for coaches and bike fitters.",
      keywords: [
        "bike fit pricing",
        "bike fitting cost",
        "online bike fit price",
        "cycling position calculator",
      ],
    },
    title: "Simple, Transparent Pricing",
    subtitle:
      "Start with a free fit session. Upgrade when you need more features. No hidden fees, cancel anytime.",
    popular: "Most Popular",
    perMonth: "/month",
    tiers: [
      {
        name: "Free",
        price: "0",
        description: "Perfect for trying out BikeFit AI",
        features: [
          "1 bike fit session per month",
          "Basic fit recommendations",
          "Email report export",
          "7-day session history",
          "Community support",
        ],
        cta: "Get Started",
        highlighted: false,
      },
      {
        name: "Pro",
        price: "9",
        description: "For dedicated cyclists who want the best fit",
        features: [
          "Unlimited fit sessions",
          "Advanced recommendations",
          "Pain point analysis and solutions",
          "Multiple bike profiles",
          "Unlimited session history",
          "Priority email support",
          "Export to PDF",
          "Track changes over time",
        ],
        cta: "Start Free Trial",
        highlighted: true,
      },
      {
        name: "Premium",
        price: "29",
        description: "For coaches, bike fitters, and shops",
        features: [
          "Everything in Pro",
          "Client management dashboard",
          "Branded PDF reports",
          "API access",
          "Custom integrations",
          "Team collaboration",
          "Dedicated support",
          "Training and onboarding",
        ],
        cta: "Contact Sales",
        highlighted: false,
      },
    ],
    comparisonTitle: "Compare Plans",
    comparisonHeaders: ["Feature", "Free", "Pro", "Premium"],
    comparisonRows: [
      ["Fit sessions", "1/month", "Unlimited", "Unlimited"],
      ["Bike profiles", "1", "Unlimited", "Unlimited"],
      ["Session history", "7 days", "Unlimited", "Unlimited"],
      ["Email reports", "Yes", "Yes", "Yes"],
      ["PDF export", "No", "Yes", "Branded"],
      ["Pain point analysis", "Basic", "Advanced", "Advanced"],
      ["API access", "No", "No", "Yes"],
      ["Client management", "No", "No", "Yes"],
      ["Support", "Community", "Priority", "Dedicated"],
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "How accurate are the recommendations?",
        answer:
          "Our algorithm uses proven biomechanical formulas including the LeMond/Hamley method. It is not a replacement for in-person fitting, but it provides a strong baseline for most riders.",
      },
      {
        question: "Can I use this for multiple bikes?",
        answer:
          "Yes. Pro and Premium plans support multiple bike profiles with bike-specific recommendations.",
      },
      {
        question: "What measurements do I need?",
        answer:
          "At minimum, height and inseam. Optional measurements improve recommendation quality.",
      },
      {
        question: "Is there a money-back guarantee?",
        answer:
          "Yes, paid plans include a 14-day money-back guarantee.",
      },
    ],
    ctaTitle: "Ready to Get Started?",
    ctaSubtitle: "Try BikeFit AI free and see the difference proper fit makes.",
    ctaButton: "Start Your Free Fit",
  },
  nl: {
    metadata: {
      title: "Prijzen - BikeFit AI",
      description:
        "Kies het BikeFit AI-plan dat bij je past. Start gratis, upgrade naar Pro of Premium voor extra functies.",
      keywords: ["bike fit prijzen", "bike fitting kosten", "online bike fit"],
    },
    title: "Eenvoudige, transparante prijzen",
    subtitle:
      "Start met een gratis fit-sessie. Upgrade wanneer je meer functies nodig hebt. Geen verborgen kosten.",
    popular: "Meest gekozen",
    perMonth: "/maand",
    tiers: [
      {
        name: "Free",
        price: "0",
        description: "Perfect om BikeFit AI uit te proberen",
        features: [
          "1 bike fit-sessie per maand",
          "Basis fit-aanbevelingen",
          "Rapport per e-mail",
          "7 dagen sessiegeschiedenis",
          "Community support",
        ],
        cta: "Start",
        highlighted: false,
      },
      {
        name: "Pro",
        price: "9",
        description: "Voor fanatieke fietsers die maximale fit willen",
        features: [
          "Onbeperkte fit-sessies",
          "Geavanceerde aanbevelingen",
          "Analyse van pijnpunten",
          "Meerdere fietsprofielen",
          "Onbeperkte geschiedenis",
          "Prioriteit per e-mail",
          "Export naar PDF",
          "Veranderingen door de tijd volgen",
        ],
        cta: "Start gratis proefperiode",
        highlighted: true,
      },
      {
        name: "Premium",
        price: "29",
        description: "Voor coaches, bike fitters en winkels",
        features: [
          "Alles in Pro",
          "Client management dashboard",
          "Branded PDF-rapporten",
          "API-toegang",
          "Maatwerk-integraties",
          "Team samenwerking",
          "Dedicated support",
          "Training en onboarding",
        ],
        cta: "Contact sales",
        highlighted: false,
      },
    ],
    comparisonTitle: "Vergelijk plannen",
    comparisonHeaders: ["Functie", "Free", "Pro", "Premium"],
    comparisonRows: [
      ["Fit-sessies", "1/maand", "Onbeperkt", "Onbeperkt"],
      ["Fietsprofielen", "1", "Onbeperkt", "Onbeperkt"],
      ["Sessiegeschiedenis", "7 dagen", "Onbeperkt", "Onbeperkt"],
      ["E-mailrapporten", "Ja", "Ja", "Ja"],
      ["PDF-export", "Nee", "Ja", "Branded"],
      ["Pijnpuntanalyse", "Basis", "Geavanceerd", "Geavanceerd"],
      ["API-toegang", "Nee", "Nee", "Ja"],
      ["Client management", "Nee", "Nee", "Ja"],
      ["Support", "Community", "Prioriteit", "Dedicated"],
    ],
    faqTitle: "Veelgestelde vragen",
    faqs: [
      {
        question: "Hoe nauwkeurig zijn de aanbevelingen?",
        answer:
          "Ons algoritme gebruikt bewezen biomechanische formules, waaronder LeMond/Hamley. Het vervangt geen fysieke fitting, maar biedt een sterke basis.",
      },
      {
        question: "Kan ik dit voor meerdere fietsen gebruiken?",
        answer:
          "Ja. Met Pro en Premium kun je meerdere fietsprofielen beheren.",
      },
      {
        question: "Welke metingen heb ik nodig?",
        answer:
          "Minimaal lengte en binnenbeenlengte. Extra metingen verhogen de nauwkeurigheid.",
      },
      {
        question: "Is er een geld-terug-garantie?",
        answer: "Ja, betaalde plannen hebben 14 dagen geld-terug-garantie.",
      },
    ],
    ctaTitle: "Klaar om te starten?",
    ctaSubtitle: "Probeer BikeFit AI gratis en ervaar het verschil van een goede fit.",
    ctaButton: "Start je gratis fit",
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
    alternates: buildLocaleAlternates("/pricing", locale),
  };
}

export default async function PricingPage() {
  const locale = await getRequestLocale();
  const page = content[locale];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">{page.title}</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{page.subtitle}</p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {page.tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 ${
                tier.highlighted
                  ? "bg-blue-600 text-white ring-4 ring-blue-600 scale-105"
                  : "bg-white ring-1 ring-gray-200"
              }`}
            >
              {tier.highlighted && (
                <p className="text-sm font-semibold text-blue-200 mb-4">{page.popular}</p>
              )}
              <h3 className={`text-lg font-semibold ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
                {tier.name}
              </h3>
              <p className={`mt-2 text-sm ${tier.highlighted ? "text-blue-100" : "text-gray-500"}`}>
                {tier.description}
              </p>
              <p className="mt-6">
                <span className={`text-4xl font-bold ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
                  ${tier.price}
                </span>
                <span className={`text-sm ${tier.highlighted ? "text-blue-100" : "text-gray-500"}`}>
                  {page.perMonth}
                </span>
              </p>
              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`h-5 w-5 flex-shrink-0 ${
                        tier.highlighted ? "text-blue-200" : "text-blue-600"
                      }`}
                    />
                    <span className={`text-sm ${tier.highlighted ? "text-white" : "text-gray-600"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href={withLocalePrefix("/login", locale)} className="block">
                  <Button
                    className={`w-full ${tier.highlighted ? "bg-white text-blue-600 hover:bg-blue-50" : ""}`}
                    variant={tier.highlighted ? "secondary" : "primary"}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center">{page.comparisonTitle}</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {page.comparisonHeaders.map((header, index) => (
                    <th
                      key={header}
                      className={`py-4 px-4 font-semibold ${
                        index === 0 ? "text-left" : "text-center"
                      } ${index === 2 ? "text-blue-600" : "text-gray-900"}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {page.comparisonRows.map(([feature, free, pro, premium]) => (
                  <tr key={feature}>
                    <td className="py-4 px-4 text-sm text-gray-700">{feature}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 text-center">{free}</td>
                    <td className="py-4 px-4 text-sm text-blue-600 text-center font-medium">{pro}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 text-center">{premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center">{page.faqTitle}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">{page.ctaTitle}</h2>
          <p className="mt-4 text-gray-600">{page.ctaSubtitle}</p>
          <Link href={withLocalePrefix("/login", locale)}>
            <Button size="lg" className="mt-8">
              {page.ctaButton}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
