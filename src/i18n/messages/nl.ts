import type en from "./en";

const nl = {
  common: {
    language: "Taal",
    english: "Engels",
    dutch: "Nederlands",
  },
  nav: {
    brand: "BikeFit AI",
    howItWorks: "Hoe het werkt",
    pricing: "Prijzen",
    login: "Inloggen",
    getStarted: "Starten",
    footer: {
      product: "Product",
      support: "Support",
      legal: "Juridisch",
      resources: "Bronnen",
      contact: "Contact",
      faq: "FAQ",
      measurementGuide: "Meetgids",
      privacy: "Privacy",
      terms: "Voorwaarden",
      science: "Wetenschap",
      calculators: "Calculators",
      allRightsReserved: "Alle rechten voorbehouden.",
    },
  },
  home: {
    metadata: {
      title: "BikeFit AI - Persoonlijke bike fitting aanbevelingen",
      description:
        "Ontvang persoonlijke bike fitting aanbevelingen op basis van je lichaamsmetingen, rijstijl en doelen. Gratis online bike fit calculator met bewezen biomechanische formules.",
      openGraphTitle: "BikeFit AI - Persoonlijke bike fitting aanbevelingen",
      openGraphDescription:
        "Ontvang persoonlijke bike fitting aanbevelingen op basis van je lichaamsmetingen. Gratis online bike fit calculator.",
      keywords: [
        "bike fit",
        "bike fitting",
        "zadelhoogte calculator",
        "fietsmaat calculator",
        "fietspositie",
        "bike fit calculator",
        "online bike fitting",
      ],
    },
    hero: {
      title: "Optimaliseer je bike fit",
      titleAccent: "Met precisie",
      description:
        "Ontvang persoonlijke bike fitting aanbevelingen op basis van je lichaamsmetingen, rijstijl en doelen. Ons algoritme gebruikt bewezen biomechanische formules om je optimale positie te berekenen.",
      primaryCta: "Start je gratis fit",
      secondaryCta: "Hoe het werkt",
    },
    howItWorks: {
      title: "Hoe het werkt",
      subtitle: "Drie eenvoudige stappen naar je perfecte bike fit",
      steps: [
        {
          title: "Vul je metingen in",
          description:
            "Geef je lichaamsmetingen door, zoals lengte, binnenbeenlengte en armlengte, en vul een flexibiliteitscheck in.",
        },
        {
          title: "Beantwoord vragen",
          description:
            "Vertel ons over je rijstijl, doelen, trainingsuren per week en eventuele pijnklachten op de fiets.",
        },
        {
          title: "Ontvang je fit-rapport",
          description:
            "Krijg gedetailleerde aanbevelingen voor zadelhoogte, reach, stuurpositie, cranklengte en meer.",
        },
      ],
    },
    features: {
      title: "Waarom kiezen voor BikeFit AI?",
      subtitle:
        "Professionele fit-aanbevelingen, toegankelijk voor iedere fietser",
      items: [
        {
          title: "Nauwkeurige metingen",
          description:
            "Voer je lichaamsmetingen in en ontvang berekeningen op basis van bewezen LeMond/Hamley-methoden.",
        },
        {
          title: "Doelgerichte fitting",
          description:
            "Of je nu comfort, prestaties of aerodynamica belangrijk vindt, wij optimaliseren je positie.",
        },
        {
          title: "Uitgebreide rapporten",
          description:
            "Ontvang complete aanbevelingen voor onder andere zadelhoogte, reach en stuurpenlengte.",
        },
        {
          title: "Voor elk type fiets",
          description:
            "Race, gravel, mountainbike of stadsfiets - ons algoritme past zich aan jouw discipline aan.",
        },
        {
          title: "Oplossingen voor klachten",
          description:
            "Meld waar je ongemak ervaart en krijg gerichte aanpassingen om je problemen te verhelpen.",
        },
        {
          title: "Wetenschappelijk onderbouwd",
          description:
            "Gebouwd op tientallen jaren bike fitting onderzoek en biomechanische principes.",
        },
      ],
    },
    recommendationSection: {
      title: "Uitgebreide fit-aanbevelingen",
      description:
        "Ons algoritme berekent alle belangrijke metingen die je nodig hebt om je positie op de fiets te optimaliseren.",
      items: [
        "Zadelhoogte met aanpassingsmarge",
        "Zadel setback (voor/achter positie)",
        "Stuurdrop en reach",
        "Stuurpenlengte en -hoek",
        "Optimalisatie van cranklengte",
        "Stuurbreedte",
        "Doelwaarden voor frame stack en reach",
        "Aanbevolen framemaat",
      ],
      cardTitle: "Klaar om je fit te optimaliseren?",
      cardDescription:
        "Sluit je aan bij fietsers die hun comfort en prestaties hebben verbeterd met data-gedreven bike fitting.",
      cardCta: "Start gratis",
    },
    cta: {
      title: "Klaar om beter te fietsen?",
      description:
        "Start met een gratis fit-sessie en ervaar het verschil dat een goede positie maakt.",
      button: "Start gratis",
    },
  },
  auth: {
    signInTitle: "Log in bij BikeFit AI",
    sendCode: "Verstuur inlogcode",
  },
  dashboard: {
    title: "Dashboard",
    signOut: "Uitloggen",
  },
  errors: {
    notFoundTitle: "Pagina niet gevonden",
    backHome: "Ga naar home",
  },
} as const satisfies typeof en;

export default nl;
