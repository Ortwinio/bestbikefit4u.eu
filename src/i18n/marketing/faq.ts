import type { Locale } from "@/i18n/config";

export const pricingFaq = {
  nl: {
    accuracy: "Je advies gebruikt bekende bikefitmethodes, waaronder LeMond/Hamley voor zadelhoogte. " +
      "Het is een startpunt dat je op de fiets test. Extra metingen geven meer context.",
    multipleBikes: "In een gratis account bewaar je 1 fiets. Met een jaarabonnement (€24,50 het eerste jaar, " +
      "daarna €19,50 per jaar) stel je al je fietsen af en vergelijk je ze.",
    pdf: "Ja. De PDF van je laatste rapport is beschikbaar in elk account, ook gratis. Met een losse meting " +
      "(€13,50) of jaarabonnement (€24,50 het eerste jaar) bevat je rapport ook het volledige stappenplan.",
    personal: {
      q: "Wat is het jaarabonnement met persoonlijke bikefit?",
      a: "Je krijgt alles van het jaarabonnement plus één persoonlijke bikefit-afspraak van [DUUR AFSPRAAK] " +
        "bij een fitter in [LOCATIE]. Je fitter start met jouw profiel en metingen. Na betaling plan je de afspraak " +
        "zelf via de agenda. Verzetten of annuleren gaat volgens aparte voorwaarden: " +
        "[VOORWAARDEN AFSPRAAK — juridisch toetsen]. De afspraak is eenmalig. Na het eerste jaar (€234,50) " +
        "verlengt het als gewoon jaarabonnement voor €19,50 per jaar. Je kunt altijd online opzeggen.",
    },
    change: "Na een losse meting stap je in op het jaarabonnement voor €13,50 het eerste jaar, daarna €19,50 " +
      "per jaar. Opzeggen kan online via Instellingen. Afrekenen via Stripe is nog niet beschikbaar.",
    next: "De gratis calculator geeft je praktische afstelwaarden als startpunt.",
    compare: "Bekijk prijzen",
  },
  en: {
    accuracy: "Your advice uses established bike-fit methods, including LeMond/Hamley for saddle height. " +
      "It is a starting point to test on your bike. Extra measurements add context.",
    multipleBikes: "A free account stores 1 bike. An annual plan (€24.50 for the first year, then €19.50 per year) " +
      "lets you fit and compare all your bikes.",
    pdf: "Yes. The PDF of your latest report is available with every account, including free accounts. A single fit " +
      "(€13.50) or annual plan (€24.50 for the first year) also includes the full adjustment plan in your report.",
    personal: {
      q: "What is the annual plan with a personal bike fit?",
      a: "You get everything in the annual plan plus one personal bike-fit appointment of [DUUR AFSPRAAK] " +
        "with a fitter in [LOCATIE]. Your fitter starts with your profile and measurements. After payment, " +
        "you book through the calendar. Rescheduling or cancelling follows separate terms: " +
        "[VOORWAARDEN AFSPRAAK — juridisch toetsen]. The appointment is a one-off. After the first year (€234.50), " +
        "it renews as a regular annual plan for €19.50 per year. You can cancel online.",
    },
    change: "After a single fit, your first annual plan costs €13.50, then €19.50 per year. You can cancel online " +
      "in Settings. Stripe checkout is not available yet.",
    next: "The free calculator gives you practical setup values as a starting point.",
    compare: "View pricing",
  },
} satisfies Record<Locale, {
  accuracy: string; multipleBikes: string; pdf: string; personal: { q: string; a: string };
  change: string; next: string; compare: string;
}>;

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
