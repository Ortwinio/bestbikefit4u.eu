import { BRAND } from "@/config/brand";
import type en from "./en";

const nl = {
  common: {
    language: "Taal",
    english: "Engels",
    dutch: "Nederlands",
  },
  nav: {
    brand: BRAND.name,
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
      guides: "Gidsen",
      allRightsReserved: "Alle rechten voorbehouden.",
    },
  },
  home: {
    metadata: {
      title: `${BRAND.name} - Online bikefitting voor comfort en prestaties`,
      description:
        "Verminder fietsklachten, verbeter je efficientie en fiets langer met persoonlijke bikefitting-aanbevelingen op basis van je metingen en doelen.",
      openGraphTitle: `${BRAND.name} - Online bikefitting voor comfort en prestaties`,
      openGraphDescription:
        "Minder klachten en betere prestaties met een persoonlijk bikefitting-plan.",
      keywords: [
        "bike fit",
        "bike fitting",
        "bike fitting knieklachten",
        "bike fitting comfort",
        "zadelhoogte calculator",
        "fietsmaat calculator",
        "fietspositie",
        "bike fit calculator",
        "online bike fitting",
      ],
    },
    hero: {
      title: "Fiets langer.",
      titleAccent: "Met minder klachten en meer controle.",
      description:
        "Start je gratis bikefitting en krijg concrete afstelwaarden om comfortabeler, efficienter en met meer vertrouwen te fietsen.",
      primaryCta: "Start gratis bikefitting",
      secondaryCta: "Bekijk hoe het werkt",
    },
    howItWorks: {
      title: "Hoe het werkt",
      subtitle: "In drie eenvoudige stappen naar een concreet fit-plan",
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
    reasonsToStart: {
      title: "Waarom nu starten met bikefitting?",
      subtitle:
        "Veel fietsers wachten te lang. Kleine aanpassingen nu kunnen maanden aan klachten schelen.",
      items: [
        {
          title: "Minder terugkerende pijnklachten",
          description:
            "Pak knie-, onderrug-, nek-, hand- en zadelklachten gericht aan met positie-aanpassingen.",
        },
        {
          title: "Meer vermogen met minder verspilling",
          description:
            "Stem zadelhoogte, reach en cockpit beter af zodat je efficienter en stabieler trapt.",
        },
        {
          title: "Meer comfort op lange ritten",
          description:
            "Een betere gewichtsverdeling en houding maken lange ritten rustiger en minder vermoeiend.",
        },
        {
          title: "Kleinere kans op overbelasting",
          description:
            "Voorkom dat je maandenlang rijdt in een houding die niet past bij jouw mobiliteit en core-stabiliteit.",
        },
        {
          title: "Meer controle en vertrouwen",
          description:
            "Een gebalanceerde positie geeft meer controle op klimmen, dalen en technisch terrein.",
        },
      ],
    },
    features: {
      title: "Wat je krijgt in je fit-plan",
      subtitle:
        "Heldere aanbevelingen die je zelf kunt toepassen of met je lokale fietsenmaker",
      items: [
        {
          title: "Nauwkeurige metingen",
          description:
            "Voer je lichaamsmetingen in en ontvang berekeningen op basis van bewezen LeMond/Hamley-methoden.",
        },
        {
          title: "Doelgerichte afstelling",
          description:
            "Je fit past zich aan op comfort, uithoudingsvermogen, prestaties of aerodynamica.",
        },
        {
          title: "Uitgebreide rapporten",
          description:
            "Je ontvangt duidelijke afstelwaarden voor zadelhoogte, reach, stuurpenlengte en meer.",
        },
        {
          title: "Voor elk type fiets",
          description:
            "Race, gravel, mountainbike of stadsfiets - ons algoritme past zich aan jouw discipline aan.",
        },
        {
          title: "Klachtgerichte aanpassingen",
          description:
            "Geef aan waar je klachten ervaart en krijg gerichte aanpassingen om eerst te testen.",
        },
        {
          title: "Wetenschappelijk onderbouwd",
          description:
            "Gebouwd op tientallen jaren bikefitting-onderzoek en biomechanische principes.",
        },
      ],
    },
    trustSection: {
      title: "Geen giswerk, maar onderbouwde keuzes",
      subtitle:
        "Elke aanbeveling is gebaseerd op duidelijke logica en praktische grenzen",
      items: [
        {
          title: "Bewezen methodiek",
          description:
            "Adviezen zijn gebaseerd op bekende bikefitting-formules met correcties voor jouw situatie.",
        },
        {
          title: "Praktisch toepasbaar advies",
          description:
            "Je krijgt een prioriteitenlijst, zodat je weet wat je eerst moet aanpassen en waarom.",
        },
        {
          title: "Eerlijke grenzen",
          description:
            "Bij complexe klachten of blessures is een fysieke fit of medische beoordeling soms nodig.",
        },
      ],
    },
    recommendationSection: {
      title: "Je rapport bevat de afstelwaarden die echt tellen",
      description:
        "Werk met concrete doelwaarden om comfortabeler, consistenter en sneller te fietsen.",
      items: [
        "Zadelhoogte met aanpassingsmarge",
        "Zadelterugstand (voor/achter positie)",
        "Stuurdrop en reach",
        "Stuurpenlengte en -hoek",
        "Optimalisatie van cranklengte",
        "Stuurbreedte",
        "Doelwaarden voor frame stack en reach",
        "Aanbevolen framemaat",
      ],
      cardTitle: "Klaar om klachten te verminderen en sterker te fietsen?",
      cardDescription:
        "Start gratis en ontvang binnen enkele minuten persoonlijke afstelwaarden.",
      cardCta: "Start gratis fit",
    },
    cta: {
      title: "Start vandaag met je gratis bikefitting",
      description:
        "Geen giswerk en geen algemene tips, maar afstelwaarden die passen bij jouw lichaam en doelen.",
      button: "Start gratis fit",
    },
  },
  auth: {
    signInTitle: `Log in bij ${BRAND.name}`,
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
