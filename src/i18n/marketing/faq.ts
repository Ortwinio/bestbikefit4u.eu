import type { Locale } from "@/i18n/config";

export const pricingFaq = {
  nl: {
    accuracy: "Je advies gebruikt bekende bikefitmethodes, waaronder LeMond/Hamley voor zadelhoogte. " +
      "Het is een startpunt dat je op de fiets test. Extra metingen geven meer context.",
    multipleBikes: "In een gratis account bewaar je 1 fiets. Met een jaarabonnement (€21,50 per jaar) " +
      "stel je al je fietsen af en vergelijk je ze. Je krijgt 2 cadeaumetingen per abonnementsjaar.",
    pdf: "Ja. De PDF van je laatste rapport is beschikbaar in elk account, ook gratis. Met een losse meting " +
      "(€13,50) of jaarabonnement (€21,50 per jaar) bevat je rapport ook het volledige stappenplan.",
    personal: {
      q: "Wat is het jaarabonnement met persoonlijke bikefit?",
      a: "Je krijgt alles van het jaarabonnement plus één persoonlijke bikefit-afspraak. " +
        "Neem contact met ons op om de locatie, duur en afspraakvoorwaarden te bespreken. " +
        "De afspraak is eenmalig. Na het eerste jaar (€234,50) " +
        "verlengt het als gewoon jaarabonnement voor €21,50 per jaar. Je kunt altijd online opzeggen. " +
        "Heb je al een losse meting gekocht of een jaarabonnement? Dan kun je ook alleen een afspraak kopen " +
        "voor €209,50.",
    },
    change: "Binnen zes maanden na aankoop van een losse meting of het verzilveren van een cadeau kost je " +
      "eerste jaarabonnement €9,50. Daarna betaal je €21,50 per jaar. De korting wordt automatisch toegepast " +
      "als je in aanmerking komt. Opzeggen kan online via Instellingen.",
    next: "De gratis calculator geeft je praktische afstelwaarden als startpunt.",
    compare: "Bekijk prijzen",
  },
  en: {
    accuracy: "Your advice uses established bike-fit methods, including LeMond/Hamley for saddle height. " +
      "It is a starting point to test on your bike. Extra measurements add context.",
    multipleBikes: "A free account stores 1 bike. An annual plan (€21.50 per year) lets you fit and compare " +
      "all your bikes. You get 2 gift measurements per subscription year.",
    pdf: "Yes. The PDF of your latest report is available with every account, including free accounts. A single fit " +
      "(€13.50) or annual plan (€21.50 per year) also includes the full adjustment plan in your report.",
    personal: {
      q: "What is the annual plan with a personal bike fit?",
      a: "You get everything in the annual plan plus one personal bike-fit appointment. " +
        "Contact us to discuss the location, duration and appointment terms. " +
        "The appointment is a one-off. After the first year (€234.50), " +
        "it renews as a regular annual plan for €21.50 per year. You can cancel online. " +
        "If you have bought a single measurement or have an annual plan, you can also buy just an appointment " +
        "for €209.50.",
    },
    change: "Within six months of buying a single measurement or redeeming a gift, your first annual plan " +
      "costs €9.50, then €21.50 per year. The discount is applied automatically if you are eligible. " +
      "You can cancel online in Settings.",
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
