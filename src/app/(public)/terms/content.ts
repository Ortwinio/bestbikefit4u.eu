import type { Locale } from "@/i18n/config";
import type { LegalCopy } from "../privacy/LegalPage";
import { getSubscriptionTermsCopy } from "@/config/commercial";
type TermsCopy = LegalCopy;

export function getContent(locale: Locale): TermsCopy {
  if (locale === "en") {
    return {
      metadata: {
        title: "Terms of Service - BikeFitBoost",
        description: "Read the terms and conditions for using BikeFitBoost.",
        keywords: ["terms of service", "terms and conditions", "BikeFitBoost terms"],
      },
      title: "Terms of Service",
      lastUpdatedLabel: "Last updated",
      lastUpdatedDate: "February 15, 2026",
      sections: [
        {
          title: "1. Acceptance of Terms",
          body: "By accessing or using BikeFitBoost, you agree to these Terms of Service.",
        },
        {
          title: "2. Description of Service",
          body:
            "BikeFitBoost provides algorithm-based bike fitting recommendations based on user " +
            "measurements and preferences.",
        },
        {
          title: "3. Important Disclaimer",
          warningTitle: "BikeFitBoost is not a substitute for an in-person professional bike fit.",
          warningBody:
            "Recommendations depend on the quality of your measurements. Riders with injuries, " +
            "chronic pain, or significant asymmetry should consult a qualified fitter or medical " +
            "professional.",
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
          body: getSubscriptionTermsCopy(locale),
        },
        {
          title: "7. Limitation of Liability",
          body:
            "To the maximum extent permitted by law, BikeFitBoost is not liable for indirect or " +
            "consequential damages arising from use of the service. You are responsible for " +
            "implementing fit changes gradually and safely.",
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
          body: "For questions about these terms, contact support@bikefitboost.com.",
        },
      ],
    };
  }

  return {
    metadata: {
      title: "Gebruiksvoorwaarden - BikeFitBoost",
      description: "Lees de voorwaarden voor het gebruik van BikeFitBoost.",
      keywords: ["gebruiksvoorwaarden", "voorwaarden", "BikeFitBoost terms"],
    },
    title: "Gebruiksvoorwaarden",
    lastUpdatedLabel: "Laatst bijgewerkt",
    lastUpdatedDate: "15 februari 2026",
    sections: [
      {
        title: "1. Acceptatie van voorwaarden",
        body: "Door BikeFitBoost te gebruiken ga je akkoord met deze gebruiksvoorwaarden.",
      },
      {
        title: "2. Beschrijving van de dienst",
        body:
          "BikeFitBoost biedt algoritme-gedreven bike fitting aanbevelingen op basis van jouw " +
          "metingen en voorkeuren.",
      },
      {
        title: "3. Belangrijke disclaimer",
        warningTitle: "BikeFitBoost vervangt geen professionele fysieke bike fitting.",
        warningBody:
          "Aanbevelingen hangen af van de nauwkeurigheid van je metingen. Bij blessures, " +
          "chronische pijn of duidelijke asymmetrie raden we professionele begeleiding aan.",
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
        body: getSubscriptionTermsCopy(locale),
      },
      {
        title: "7. Beperking van aansprakelijkheid",
        body:
          "Voor zover wettelijk toegestaan is BikeFitBoost niet aansprakelijk voor indirecte " +
          "of gevolgschade. Je blijft zelf verantwoordelijk voor het veilig doorvoeren van " +
          "aanpassingen.",
      },
      {
        title: "8. Intellectueel eigendom",
        body: "Inhoud, ontwerp en algoritmes van de dienst zijn beschermd intellectueel eigendom.",
      },
      {
        title: "9. Wijzigingen van voorwaarden",
        body:
          "We kunnen deze voorwaarden aanpassen. Door de dienst te blijven gebruiken, ga je " +
          "akkoord met de nieuwe versie.",
      },
      {
        title: "10. Contact",
        body: "Voor vragen over deze voorwaarden: support@bikefitboost.com.",
      },
    ],
  };
}
