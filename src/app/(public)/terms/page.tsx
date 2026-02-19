import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";

type TermsSection = {
  title: string;
  body?: string;
  bullets?: string[];
  warningTitle?: string;
  warningBody?: string;
};

type TermsCopy = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  title: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  sections: TermsSection[];
};

const content: Record<Locale, TermsCopy> = {
  en: {
    metadata: {
      title: "Terms of Service - BestBikeFit4U",
      description: "Read the terms and conditions for using BestBikeFit4U.",
      keywords: ["terms of service", "terms and conditions", "BestBikeFit4U terms"],
    },
    title: "Terms of Service",
    lastUpdatedLabel: "Last updated",
    lastUpdatedDate: "February 15, 2026",
    sections: [
      {
        title: "1. Acceptance of Terms",
        body: "By accessing or using BestBikeFit4U, you agree to these Terms of Service.",
      },
      {
        title: "2. Description of Service",
        body: "BestBikeFit4U provides algorithm-based bike fitting recommendations based on user measurements and preferences.",
      },
      {
        title: "3. Important Disclaimer",
        warningTitle: "BestBikeFit4U is not a substitute for an in-person professional bike fit.",
        warningBody:
          "Recommendations depend on the quality of your measurements. Riders with injuries, chronic pain, or significant asymmetry should consult a qualified fitter or medical professional.",
      },
      {
        title: "4. User Accounts",
        bullets: [
          "You must provide a valid email address.",
          "You are responsible for your account security.",
          "Do not share accounts.",
          "We may suspend accounts that violate these terms.",
        ],
      },
      {
        title: "5. Acceptable Use",
        bullets: [
          "Do not use the service for unlawful purposes.",
          "Do not attempt unauthorized access.",
          "Do not scrape or automate without consent.",
          "Do not disrupt service integrity or performance.",
        ],
      },
      {
        title: "6. Subscription Plans",
        body: "BestBikeFit4U offers Free, Pro, and Premium plans. Paid plans are billed monthly and can be cancelled at any time.",
      },
      {
        title: "7. Limitation of Liability",
        body: "To the maximum extent permitted by law, BestBikeFit4U is not liable for indirect or consequential damages arising from use of the service. You are responsible for implementing fit changes gradually and safely.",
      },
      {
        title: "8. Intellectual Property",
        body: "Service content, design, and algorithms are protected intellectual property.",
      },
      {
        title: "9. Changes to Terms",
        body: "We may update these terms. Continued use after updates means you accept the revised terms.",
      },
      {
        title: "10. Contact",
        body: "For questions about these terms, contact support@bestbikefit4u.eu.",
      },
    ],
  },
  nl: {
    metadata: {
      title: "Gebruiksvoorwaarden - BestBikeFit4U",
      description: "Lees de voorwaarden voor het gebruik van BestBikeFit4U.",
      keywords: ["gebruiksvoorwaarden", "voorwaarden", "BestBikeFit4U terms"],
    },
    title: "Gebruiksvoorwaarden",
    lastUpdatedLabel: "Laatst bijgewerkt",
    lastUpdatedDate: "15 februari 2026",
    sections: [
      {
        title: "1. Acceptatie van voorwaarden",
        body: "Door BestBikeFit4U te gebruiken ga je akkoord met deze gebruiksvoorwaarden.",
      },
      {
        title: "2. Beschrijving van de dienst",
        body: "BestBikeFit4U biedt algoritme-gedreven bike fitting aanbevelingen op basis van jouw metingen en voorkeuren.",
      },
      {
        title: "3. Belangrijke disclaimer",
        warningTitle: "BestBikeFit4U vervangt geen professionele fysieke bike fitting.",
        warningBody:
          "Aanbevelingen hangen af van de nauwkeurigheid van je metingen. Bij blessures, chronische pijn of duidelijke asymmetrie raden we professionele begeleiding aan.",
      },
      {
        title: "4. Gebruikersaccounts",
        bullets: [
          "Je moet een geldig e-mailadres gebruiken.",
          "Je bent verantwoordelijk voor de beveiliging van je account.",
          "Het delen van accounts is niet toegestaan.",
          "We kunnen accounts blokkeren bij overtreding van deze voorwaarden.",
        ],
      },
      {
        title: "5. Toegestaan gebruik",
        bullets: [
          "Gebruik de dienst niet voor onwettige doeleinden.",
          "Probeer geen ongeautoriseerde toegang te krijgen.",
          "Automatisering/scraping zonder toestemming is niet toegestaan.",
          "Verstoor de dienst niet.",
        ],
      },
      {
        title: "6. Abonnementsplannen",
        body: "BestBikeFit4U biedt Free, Pro en Premium. Betaalde plannen worden maandelijks gefactureerd en kunnen op elk moment worden opgezegd.",
      },
      {
        title: "7. Beperking van aansprakelijkheid",
        body: "Voor zover wettelijk toegestaan is BestBikeFit4U niet aansprakelijk voor indirecte of gevolgschade. Je blijft zelf verantwoordelijk voor het veilig doorvoeren van aanpassingen.",
      },
      {
        title: "8. Intellectueel eigendom",
        body: "Inhoud, ontwerp en algoritmes van de dienst zijn beschermd intellectueel eigendom.",
      },
      {
        title: "9. Wijzigingen van voorwaarden",
        body: "We kunnen deze voorwaarden aanpassen. Door de dienst te blijven gebruiken, ga je akkoord met de nieuwe versie.",
      },
      {
        title: "10. Contact",
        body: "Voor vragen over deze voorwaarden: support@bestbikefit4u.eu.",
      },
    ],
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
    alternates: buildLocaleAlternates("/terms", locale),
  };
}

export default async function TermsPage() {
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

              {section.warningTitle ? (
                <div className="mt-4 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
                  <p className="font-medium text-yellow-800">{section.warningTitle}</p>
                  {section.warningBody ? <p className="mt-2 text-yellow-700">{section.warningBody}</p> : null}
                </div>
              ) : null}

              {section.body ? <p className="mt-4">{section.body}</p> : null}

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
