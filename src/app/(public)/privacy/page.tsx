import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";

type Section = { title: string; body?: string; bullets?: string[]; subsections?: { title: string; body: string }[] };

type PrivacyCopy = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  title: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  sections: Section[];
  contactText: string;
};

const content: Record<Locale, PrivacyCopy> = {
  en: {
    metadata: {
      title: "Privacy Policy - BestBikeFit4U",
      description: "Learn how BestBikeFit4U collects, uses, and protects your personal data.",
      keywords: ["privacy policy", "data protection", "BestBikeFit4U privacy"],
    },
    title: "Privacy Policy",
    lastUpdatedLabel: "Last updated",
    lastUpdatedDate: "February 15, 2026",
    sections: [
      {
        title: "1. Information We Collect",
        subsections: [
          {
            title: "Account Information",
            body: "When you create an account, we collect your email address for authentication. We use passwordless login and do not store passwords.",
          },
          {
            title: "Body Measurements",
            body: "To generate fit recommendations, we store measurements you provide, such as height, inseam, and optional dimensions.",
          },
          {
            title: "Fit Session Data",
            body: "We store riding preferences, questionnaire answers, recommendations, and session history to provide and improve the service.",
          },
        ],
      },
      {
        title: "2. How We Use Your Information",
        bullets: [
          "Generate personalized bike fit recommendations",
          "Send requested fit reports by email",
          "Maintain session history and bike profiles",
          "Improve algorithm quality",
          "Communicate important service updates",
        ],
      },
      {
        title: "3. Third-Party Services",
        subsections: [
          {
            title: "Convex (Database)",
            body: "We use Convex for secure data storage and application backend functionality.",
          },
          {
            title: "Resend (Email)",
            body: "We use Resend to deliver verification codes and requested reports by email.",
          },
        ],
      },
      {
        title: "4. Data Retention",
        body: "We retain account and fit-session data while your account is active. You can request deletion of your account and associated data at any time.",
      },
      {
        title: "5. Cookies",
        body: "We use essential cookies for authentication, session management, and language preference. We do not use advertising trackers.",
      },
      {
        title: "6. Your Rights",
        bullets: [
          "Access your personal data",
          "Correct inaccurate information",
          "Request account deletion",
          "Request portable export of your data",
        ],
      },
      {
        title: "7. Security",
        body: "We use technical and organizational safeguards including HTTPS, input validation, and runtime protection controls.",
      },
      {
        title: "8. Contact",
        body: "For privacy-related questions, contact us at support@bestbikefit4u.eu.",
      },
    ],
    contactText: "support@bestbikefit4u.eu",
  },
  nl: {
    metadata: {
      title: "Privacyverklaring - BestBikeFit4U",
      description: "Lees hoe BestBikeFit4U jouw persoonsgegevens verzamelt, gebruikt en beschermt.",
      keywords: ["privacyverklaring", "gegevensbescherming", "BestBikeFit4U privacy"],
    },
    title: "Privacyverklaring",
    lastUpdatedLabel: "Laatst bijgewerkt",
    lastUpdatedDate: "15 februari 2026",
    sections: [
      {
        title: "1. Welke gegevens we verzamelen",
        subsections: [
          {
            title: "Accountgegevens",
            body: "Bij het aanmaken van een account verzamelen we je e-mailadres voor authenticatie. We gebruiken passwordless login en slaan geen wachtwoorden op.",
          },
          {
            title: "Lichaamsmetingen",
            body: "Voor fit-aanbevelingen slaan we door jou ingevoerde metingen op, zoals lengte, binnenbeenlengte en optionele waarden.",
          },
          {
            title: "Fit-sessiegegevens",
            body: "We bewaren rijvoorkeuren, antwoorden uit vragenlijsten, aanbevelingen en sessiegeschiedenis om de dienst te leveren en te verbeteren.",
          },
        ],
      },
      {
        title: "2. Hoe we je gegevens gebruiken",
        bullets: [
          "Persoonlijke bike fit-aanbevelingen genereren",
          "Aangevraagde fit-rapporten per e-mail verzenden",
          "Sessiegeschiedenis en fietsprofielen beheren",
          "Kwaliteit van het algoritme verbeteren",
          "Belangrijke service-updates communiceren",
        ],
      },
      {
        title: "3. Externe diensten",
        subsections: [
          {
            title: "Convex (database)",
            body: "We gebruiken Convex voor veilige opslag en backend-functionaliteit.",
          },
          {
            title: "Resend (e-mail)",
            body: "We gebruiken Resend voor verificatiecodes en aangevraagde rapporten via e-mail.",
          },
        ],
      },
      {
        title: "4. Bewaartermijnen",
        body: "We bewaren account- en fit-sessiegegevens zolang je account actief is. Je kunt op elk moment verwijdering van je account en data aanvragen.",
      },
      {
        title: "5. Cookies",
        body: "We gebruiken alleen essentiële cookies voor authenticatie, sessiebeheer en taalvoorkeur. We gebruiken geen advertentietrackers.",
      },
      {
        title: "6. Jouw rechten",
        bullets: [
          "Inzage in je persoonsgegevens",
          "Correctie van onjuiste gegevens",
          "Verwijdering van account en data aanvragen",
          "Export van je data in machineleesbaar formaat",
        ],
      },
      {
        title: "7. Beveiliging",
        body: "We nemen technische en organisatorische maatregelen, waaronder HTTPS, invoervalidatie en runtime-beveiliging.",
      },
      {
        title: "8. Contact",
        body: "Voor privacyvragen kun je contact opnemen via support@bestbikefit4u.eu.",
      },
    ],
    contactText: "support@bestbikefit4u.eu",
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
    alternates: buildLocaleAlternates("/privacy", locale),
  };
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  const page = content[locale];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">{page.title}</h1>
        <p className="mt-4 text-sm text-gray-500">
          {page.lastUpdatedLabel}: {page.lastUpdatedDate}
        </p>

        <div className="mt-12 space-y-8 text-gray-600">
          {page.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>

              {section.body ? <p className="mt-4">{section.body}</p> : null}

              {section.subsections ? (
                <div className="mt-4 space-y-4">
                  {section.subsections.map((sub) => (
                    <div key={sub.title}>
                      <h3 className="font-medium text-gray-900">{sub.title}</h3>
                      <p className="mt-1">{sub.body}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {section.bullets ? (
                <ul className="mt-4 list-disc space-y-2 pl-6">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
