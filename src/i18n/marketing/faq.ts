import type { Locale } from "@/i18n/config";

type FAQPresentation = {
  metadataTitle: string;
  eyebrow: string;
  trustPoints: { title: string; description: string }[];
  guideEyebrow: string;
  contactEyebrow: string;
  support: string;
};

export const faqPresentation = {
  nl: {
    metadataTitle: "Veelgestelde vragen over bikefit | BikeFitBoost",
    eyebrow: "Snel antwoord",
    trustPoints: [
      {
        title: "Praktisch & actueel",
        description: "Antwoorden over de functies en hulp die je kunt gebruiken.",
      },
      {
        title: "Eerlijk over grenzen",
        description: "We benoemen wanneer een fitter ter plaatse of zorgverlener verstandiger is.",
      },
      {
        title: "In jouw taal",
        description: "Ondersteuning en uitleg zijn beschikbaar in Nederlands en Engels.",
      },
    ],
    guideEyebrow: "Lees gericht verder",
    contactEyebrow: "Nog niet gevonden?",
    support: "We helpen je in het Nederlands en Engels.",
  },
  en: {
    metadataTitle: "Bike Fitting FAQ | BikeFitBoost",
    eyebrow: "Quick answers",
    trustPoints: [
      {
        title: "Practical & current",
        description: "Answers about the features and help available to you.",
      },
      {
        title: "Honest about limits",
        description: "We explain when an in-person fitter or healthcare professional is the wiser choice.",
      },
      {
        title: "In your language",
        description: "Support and guidance are available in Dutch and English.",
      },
    ],
    guideEyebrow: "Find your next step",
    contactEyebrow: "Still have questions?",
    support: "We can help you in Dutch and English.",
  },
} satisfies Record<Locale, FAQPresentation>;
