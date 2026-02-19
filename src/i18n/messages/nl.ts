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
    common: {
      back: "Terug",
      cancel: "Annuleren",
      edit: "Bewerken",
      delete: "Verwijderen",
      signOut: "Uitloggen",
    },
    nav: {
      dashboard: "Dashboard",
      newFitSession: "Nieuwe fit-sessie",
      myBikes: "Mijn fietsen",
      profile: "Profiel",
    },
    layout: {
      loading: "Dashboard laden...",
      mobileMenu: {
        closeAria: "Dashboardmenu sluiten",
        openAria: "Dashboardmenu openen",
        overlayCloseAria: "Dashboardmenu-overlay sluiten",
      },
      sections: {
        dashboard: "Dashboard",
        website: "Website",
      },
      website: {
        home: "Home",
        howItWorks: "Hoe het werkt",
        pricing: "Prijzen",
      },
    },
    userMenu: {
      dashboard: "Dashboard",
      newFitSession: "Nieuwe fit-sessie",
      myBikes: "Mijn fietsen",
      profileSettings: "Profielinstellingen",
      fallbackUserName: "Gebruiker",
    },
    sessions: {
      status: {
        completed: "Voltooid",
        inProgress: "Bezig",
        processing: "Verwerken",
        archived: "Gearchiveerd",
      },
      ridingStyle: {
        recreational: "Recreatief",
        fitness: "Fitness",
        sportive: "Sportief",
        racing: "Wedstrijd",
        commuting: "Woon-werk",
        touring: "Toeren",
      },
    },
    home: {
      title: "Dashboard",
      newFitCta: "Nieuwe fit-sessie",
      profileWarning: {
        title: "Vul eerst je profiel in om te starten",
        description: "Voer je lichaamsmetingen in om bikefit-berekeningen te activeren.",
        cta: "Profiel invullen",
      },
      stats: {
        totalSessions: "Totaal sessies",
        completedFits: "Voltooide fits",
        lastFitDate: "Datum laatste fit",
      },
      recentSessions: {
        title: "Recente fit-sessies",
        loading: "Sessies laden...",
        emptyTitle: "Nog geen fit-sessies",
        emptyDescription: "Je bent nog niet gestart met een fit-sessie.",
        emptyCta: "Start je eerste fit",
        fitSuffix: "Fit",
        actions: {
          viewResults: "Bekijk resultaten",
          continue: "Ga verder",
          view: "Bekijken",
        },
      },
    },
    fit: {
      loading: "Fit-instellingen laden...",
      title: "Start nieuwe fit-sessie",
      subtitle:
        "Kies je fiets en rijdoelen om gepersonaliseerde afsteladviezen te krijgen.",
      profileWarning: {
        title: "Vul eerst je profiel in",
        description:
          "Je moet eerst je lichaamsmetingen invullen voordat je een fit-sessie start.",
        cta: "Ga naar profiel",
      },
      savedBikes: {
        loading: "Opgeslagen fietsen laden...",
        title: "Kies een opgeslagen fiets (optioneel)",
        useCustomType: "Gebruik aangepast fietstype",
        usingBike: "Opgeslagen fiets gebruiken",
      },
      sections: {
        bikeType: "Welk type fiets?",
        ridingStyle: "Hoe fiets je meestal?",
        primaryGoal: "Wat is je belangrijkste doel?",
      },
      continueCta: "Ga door naar vragen",
      profileRequirementHint: "Vul je profiel in om verder te gaan",
      errors: {
        startFailedTitle: "Kon fit-sessie niet starten",
      },
      ridingStyles: {
        recreational: {
          label: "Recreatief",
          description: "Ontspannen ritten voor plezier en ontspanning",
        },
        fitness: {
          label: "Fitness",
          description: "Regelmatig fietsen met focus op gezondheid",
        },
        sportive: {
          label: "Sportief",
          description: "Lange afstanden en georganiseerde tochten",
        },
        racing: {
          label: "Wedstrijd",
          description: "Competitief fietsen en tijdritten",
        },
        commuting: {
          label: "Woon-werk",
          description: "Dagelijks vervoer van en naar werk",
        },
        touring: {
          label: "Toeren",
          description: "Lange ritten met bagage en uithoudingsvermogen",
        },
      },
      goals: {
        comfort: {
          label: "Comfort",
          description: "Ontspannen positie, minimale belasting",
        },
        balanced: {
          label: "Gebalanceerd",
          description: "Mix van comfort en efficiëntie",
        },
        performance: {
          label: "Prestatie",
          description: "Meer agressieve, krachtgerichte positie",
        },
        aerodynamics: {
          label: "Aero",
          description: "Meest agressieve, aerodynamische positie (Race/TT)",
        },
      },
    },
    questionnaire: {
      loading: "Vragenlijst laden...",
      title: "Vertel ons over je rijstijl",
      subtitle:
        "Beantwoord deze vragen zodat we je bikefit-aanbevelingen kunnen personaliseren.",
      sessionNotFound: {
        title: "Sessie niet gevonden",
        description:
          "De fit-sessie die je zoekt bestaat niet of is gearchiveerd.",
        cta: "Start nieuwe sessie",
      },
      emptyTitle: "Geen vragenlijst-items beschikbaar",
      emptyDescription: "Probeer het over een ogenblik opnieuw.",
      missingRequired: {
        header: "Verplichte vragen die nog een antwoord nodig hebben:",
      },
      actions: {
        previous: "Vorige",
        skip: "Overslaan",
        complete: "Voltooien",
        next: "Volgende",
      },
      errors: {
        completeStepTitle: "We konden deze stap niet voltooien",
        missingRequiredMarker: "Missing required responses:",
      },
      progress: {
        label: "Voortgang",
        minutesLeft: "~{minutes} min resterend",
        percentComplete: "{percent}% voltooid",
        questionOf: "Vraag {current} van {total}",
      },
      a11y: {
        singleChoiceLegend: "Kies één optie",
      },
      multiChoice: {
        legend: "Selecteer alles wat van toepassing is",
      },
      numeric: {
        label: "Je numerieke antwoord",
        tooltip:
          "Voer alleen een getal in (zonder eenheid). Gebruik de aangegeven eenheid in het label (cm/mm/graden).",
        placeholder: "Voer een getal in",
        range: "Bereik: {min} - {max}{unit}",
        errors: {
          invalidNumber: "Voer een geldig getal in",
          min: "Waarde moet minimaal {min}{unit} zijn",
          max: "Waarde moet maximaal {max}{unit} zijn",
        },
      },
      text: {
        label: "Je geschreven antwoord",
        tooltip:
          "Schrijf een kort en specifiek antwoord. Voeg relevante details toe zoals fietstype, wekelijkse uren en eventuele klachten.",
        placeholder: "Typ hier je antwoord...",
      },
    },
    results: {
      loading: "Fit-resultaten laden...",
      backToDashboard: "Terug naar dashboard",
      title: "Jouw bikefit-aanbevelingen",
      subtitle:
        "Op basis van je metingen en rijvoorkeuren zijn dit je gepersonaliseerde bikefit-instellingen.",
      algorithmVersionLabel: "Algoritmeversie",
      sessionNotFound: {
        title: "Sessie niet gevonden",
        description: "De fit-sessie die je zoekt bestaat niet.",
        cta: "Ga naar dashboard",
      },
      questionnaireIncomplete: {
        title: "Vragenlijst niet voltooid",
        description:
          "Rond eerst je vragenlijst af, dan kunnen we je fit-aanbeveling genereren.",
        cta: "Ga verder met vragenlijst",
      },
      processing: {
        title: "Je fit wordt berekend",
        description:
          "We analyseren je metingen en voorkeuren om gepersonaliseerde aanbevelingen te maken...",
        retryCta: "Opnieuw proberen",
        generateNowCta: "Nu genereren",
      },
      emailDialog: {
        title: "Rapport e-mailen",
        sentTitle: "E-mail verzonden",
        description:
          "Stuur je bikefit-aanbevelingen naar je e-mail voor later gebruik.",
        sentDescription: "Controleer je inbox voor je bikefit-rapport.",
        emailLabel: "E-mailadres",
        emailTooltip:
          "Voer het e-mailadres in waarop je dit rapport wilt ontvangen.",
        emailPlaceholder: "jij@example.com",
        sendCta: "Rapport verzenden",
        errors: {
          sendTitle: "Verzenden van rapport mislukt",
        },
      },
      actions: {
        emailReport: "Rapport e-mailen",
        downloadPdf: "PDF downloaden",
        startNewFit: "Start nieuwe fit-sessie",
      },
      errors: {
        pdfGenerateFailed: "Genereren van PDF-rapport mislukt.",
        downloadTitle: "Downloaden van PDF mislukt",
      },
    },
    profile: {
      loading: "Profiel laden...",
      title: "Jouw profiel",
      actions: {
        editMeasurements: "Metingen bewerken",
      },
      sections: {
        bodyMeasurements: "Lichaamsmetingen",
        flexibility: "Flexibiliteit",
        coreStability: "Core-stabiliteit",
      },
      measurements: {
        height: "Lengte",
        inseam: "Binnenbeenlengte",
        torso: "Torso",
        armLength: "Armlengte",
        shoulderWidth: "Schouderbreedte",
        femurLength: "Dijbeenlengte",
      },
      flexibility: {
        helper: "Hamstring-flexibiliteitsscore",
      },
      coreStability: {
        helper: "Plank-houding beoordeling",
      },
      status: {
        title: "Profielstatus",
        description:
          "Je profiel is compleet. Je kunt nu een fit-sessie starten om gepersonaliseerde bikefit-aanbevelingen te krijgen.",
        startFitCta: "Start nieuwe fit-sessie",
      },
      edit: {
        title: "Bewerk je metingen",
        description:
          "Werk je lichaamsmetingen bij voor nauwkeurigere fit-aanbevelingen.",
      },
      onboarding: {
        title: "Vul je profiel in",
        description:
          "Voer je lichaamsmetingen in om gepersonaliseerde bikefit-aanbevelingen te krijgen.",
      },
      errors: {
        saveFailedTitle: "Profiel opslaan mislukt",
      },
    },
    bikes: {
      loading: "Fietsen laden...",
      title: "Mijn fietsen",
      subtitle: "Sla je fietsen op om fit-sessies aan echte setups te koppelen.",
      actions: {
        addBike: "Fiets toevoegen",
      },
      empty: {
        title: "Nog geen fietsen toegevoegd",
        description:
          "Sla je eerste fiets op om fit-sessies door de tijd te vergelijken.",
        cta: "Voeg je eerste fiets toe",
      },
      delete: {
        confirm: 'Fiets "{bikeName}" verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
        failed: "Kon fiets niet verwijderen. Probeer opnieuw.",
      },
      sections: {
        geometry: "Geometrie",
        currentSetup: "Huidige setup",
      },
      fields: {
        stack: "Stack",
        reach: "Reach",
        sta: "STA",
        hta: "HTA",
        frameSize: "Framemaat",
        saddle: "Zadel",
        setback: "Setback",
        stem: "Stuurpen",
        bar: "Stuur",
        crank: "Crank",
      },
    },
    bikeForm: {
      new: {
        title: "Nieuwe fiets toevoegen",
        description:
          "Sla je fietsgeometrie en huidige setup op voor betere fit-vergelijkingen.",
      },
      edit: {
        loading: "Fiets laden...",
        title: "Fiets bewerken",
        description: "Werk fietsdetails en huidige setupwaarden bij.",
        notFound: {
          title: "Fiets niet gevonden",
          description:
            "Deze fiets bestaat niet of je hebt er geen toegang toe.",
        },
      },
      actions: {
        save: "Fiets opslaan",
        saveChanges: "Wijzigingen opslaan",
        deleteBike: "Fiets verwijderen",
      },
      errors: {
        nameRequired: "Fietsnaam is verplicht.",
        typeRequired: "Fietstype is verplicht.",
        saveFailed: "Kon fiets niet opslaan. Probeer opnieuw.",
        deleteFailed: "Kon fiets niet verwijderen. Probeer opnieuw.",
      },
      delete: {
        confirm: "Deze fiets verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
      },
      sections: {
        basics: "Basisgegevens fiets",
        geometry: "Huidige geometrie (optioneel)",
        setup: "Huidige setup (optioneel)",
      },
      fields: {
        name: {
          label: "Fietsnaam",
          tooltip:
            "Een label voor deze fiets (bijv. Canyon Endurace 2023). Hiermee houd je meerdere fits bij.",
          placeholder: "bijv. Canyon Endurace",
        },
        type: {
          label: "Fietstype",
          tooltip:
            "Kies het exacte type fiets dat je wilt fitten. Dit beïnvloedt houdingsdoelen en veiligheidsgrenzen.",
          placeholder: "Kies fietstype",
          staticLabel: "Fietstype:",
        },
        geometry: {
          stack: {
            label: "Stack (mm)",
            tooltip:
              "Verticale afstand van hart trapas tot bovenzijde balhoofdbuis (mm). Te vinden in de geometriechart van de fabrikant.",
          },
          reach: {
            label: "Reach (mm)",
            tooltip:
              "Horizontale afstand van hart trapas tot bovenzijde balhoofdbuis (mm). Te vinden in de geometriechart van de fabrikant.",
          },
          seatTubeAngle: {
            label: "Zitbuishoek (graden)",
            tooltip:
              "Hoek van de zitbuis (graden). Gebruik de fabrikantgegevens. Beïnvloedt de zadelpositie voor dezelfde zadelhoogte.",
          },
          headTubeAngle: {
            label: "Balhoofdhoek (graden)",
            tooltip:
              "Hoek van de balhoofdbuis (graden). Beïnvloedt stuurgedrag en stabiliteit.",
          },
          frameSize: {
            label: "Framemaat",
            tooltip:
              "Voer de maat in zoals het merk die aangeeft (bijv. 54, 56, M, L). Bij twijfel zijn stack/reach nauwkeuriger.",
            placeholder: "bijv. 54",
          },
        },
        setup: {
          saddleHeight: {
            label: "Zadelhoogte (mm)",
            tooltip:
              "Meet van hart trapas tot bovenkant zadel langs de zitbuislijn (mm).",
          },
          saddleSetback: {
            label: "Zadelterugstand (mm)",
            tooltip:
              "Meet de horizontale afstand van hart trapas tot zadelpunt (mm).",
          },
          stemLength: {
            label: "Stuurpenlengte (mm)",
            tooltip:
              "Lengte die op de stuurpen staat (mm), hart-op-hart.",
          },
          stemAngle: {
            label: "Stuurpenhoek (graden)",
            tooltip:
              "Hoek die op de stuurpen staat (graden). Omdraaien van de stuurpen verandert het teken.",
          },
          handlebarWidth: {
            label: "Stuurbreedte (mm)",
            tooltip:
              "Breedte gemeten hart-op-hart bij de shifters (mm).",
          },
          crankLength: {
            label: "Cranklengte (mm)",
            tooltip:
              "Lengte die op de crankarm staat (mm).",
          },
        },
      },
    },
    errors: {
      generic: {
        title: "Er ging iets mis",
        description:
          "Er is een fout opgetreden bij het laden van deze pagina. Probeer opnieuw.",
        errorIdLabel: "Fout-ID:",
        retry: "Probeer opnieuw",
        goDashboard: "Ga naar dashboard",
      },
    },
  },
  errors: {
    notFoundTitle: "Pagina niet gevonden",
    backHome: "Ga naar home",
  },
} as const satisfies typeof en;

export default nl;
