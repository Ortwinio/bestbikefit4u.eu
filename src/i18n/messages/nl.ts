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
    tools: "Tools",
    tirePressure: "Bandenspanning",
    login: "Inloggen",
    getStarted: "Starten",
    footer: {
      product: "Product",
      support: "Support",
      legal: "Juridisch",
      resources: "Bronnen",
      sitemap: "Sitemap",
      contact: "Contact",
      faq: "FAQ",
      measurementGuide: "Meetgids",
      privacy: "Privacy",
      terms: "Voorwaarden",
      science: "Wetenschap",
      calculators: "Calculators",
      tirePressure: "Bandenspanningscalculator",
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
  pressure: {
    publicPage: {
      title: "Bandenspanningscalculator | BestBikeFit4U",
      description:
        "Bereken de ideale bandenspanning voor race, gravel of MTB. Gratis, zonder account.",
      h1: "Gratis bandenspanningscalculator",
      subtitle:
        "Bereken direct de ideale bandenspanning voor race, gravel of MTB. Vul je gewicht en bandbreedte in voor direct advies.",
      chips: [
        "Gebaseerd op gewicht en bandbreedte",
        "Werkt voor race, gravel en MTB",
        "Direct resultaat",
      ] as [string, string, string],
    },
    roadPage: {
      title: "Bandenspanning Racefiets Calculator | BestBikeFit4U",
      description:
        "Bereken ideale bandenspanning voor je racefiets op basis van gewicht, bandbreedte en ondergrond.",
      h1: "Bandenspanning Racefiets",
    },
    gravelPage: {
      title: "Bandenspanning Gravelbike Calculator | BestBikeFit4U",
      description:
        "Vind de optimale bandenspanning voor je gravelbike op gemengd terrein.",
      h1: "Bandenspanning Gravelbike",
    },
    mtbPage: {
      title: "Bandenspanning MTB Calculator | BestBikeFit4U",
      description:
        "Bereken MTB bandenspanning voor trail, XC of allround mountainbike gebruik.",
      h1: "Bandenspanning MTB",
    },
    form: {
      disciplineLabel: "Fietstype",
      disciplineRoad: "Racefiets",
      disciplineGravel: "Gravelbike",
      disciplineMtb: "MTB",
      bodyWeightLabel: "Lichaamsgewicht (kg)",
      widthFrontLabel: "Bandbreedte voor (mm)",
      widthRearLabel: "Bandbreedte achter (mm)",
      tubeTypeLabel: "Type band",
      tubeTypeInnerTube: "Binnenband",
      tubeTypeLatex: "Latex",
      tubeTypeTubeless: "Tubeless",
      surfaceLabel: "Ondergrond",
      surfaceSmoothAsphalt: "Glad asfalt",
      surfaceAverageAsphalt: "Gemiddeld asfalt",
      surfaceRoughAsphalt: "Slecht asfalt",
      surfaceHardpackGravel: "Hardpack gravel",
      surfaceLooseGravel: "Losse gravel",
      surfaceTrail: "Trail",
      ridingGoalLabel: "Rijdoel",
      ridingGoalSpeed: "Snelheid",
      ridingGoalBalance: "Balans",
      ridingGoalComfort: "Comfort",
      bikeWeightLabel: "Fietsgewicht (optioneel)",
      advancedOptions: "Geavanceerde opties",
      resultPlaceholder: "Vul geldige waarden in om je aanbevolen bandenspanning te zien.",
    },
    result: {
      front: "Voor",
      rear: "Achter",
      bar: "bar",
      psi: "PSI",
      explanation: "Toelichting",
      warningsTitle: "Waarschuwingen",
      disclaimer: "Controleer altijd de maximale druk van band en velg.",
      warningMessages: {
        max_rim_pressure_exceeded:
          "De aanbevolen druk overschrijdt de maximale druk van band of velg.",
        hookless_limit_exceeded:
          "Hookless velg: maximale druk overschreden. Controleer de specificaties.",
        pressure_too_low_for_setup:
          "De druk kan te laag zijn voor deze setup. Controleer karkas en terrein.",
        front_rear_pressure_mismatch:
          "Groot verschil tussen voor- en achterdruk. Controleer je invoer.",
        inner_tube_pinch_flat_risk:
          "Lage druk met binnenband: risico op stootlek.",
        road_tire_width_unusual:
          "Ongebruikelijke bandbreedte voor een racefiets. Controleer dit.",
        gravel_tire_width_unusual:
          "Ongebruikelijke bandbreedte voor een gravelbike.",
        mtb_tire_width_unusual:
          "MTB-banden zijn meestal minimaal 45 mm breed.",
        hookless_max_pressure_unknown:
          "Hookless velg: maximale druk onbekend. Blijf op of onder 3,5 bar tenzij anders aangegeven.",
      },
      comfortScore: "Comfort",
      gripScore: "Grip",
      efficiencyScore: "Efficiëntie",
    },
    cta: {
      heading: "Wil je dit opslaan voor je fiets?",
      body:
        "Maak gratis een account aan en bewaar je ideale bandenspanning per fiets, wielset en ondergrond.",
      primaryButton: "Gratis account maken",
      secondaryButton: "Meer informatie",
      loginPrompt: "Heb je al een account?",
      loginLink: "Log in",
    },
  },
  dashboard: {
    title: "Dashboard",
    signOut: "Uitloggen",
    common: {
      back: "Terug",
      cancel: "Annuleren",
      save: "Opslaan",
      edit: "Bewerken",
      delete: "Verwijderen",
      signOut: "Uitloggen",
      toasts: {
        profileSaved: "Je profielmetingen zijn opgeslagen.",
        displayNameSaved: "Je weergavenaam is bijgewerkt.",
        fitSessionStarted: "Nieuwe fit-sessie gestart.",
        reportEmailed: "Je fit-rapport is per e-mail verzonden.",
        cookiesAccepted: "Analytics-cookies zijn ingeschakeld.",
        cookiesEssentialOnly: "Alleen essentiële cookies blijven actief.",
        bikeDeleted: "Fiets verwijderd.",
        bikeNotesSaved: "Fietsnotities opgeslagen.",
        pressureNoteSaved: "Bandenspanningsnotitie opgeslagen.",
      },
    },
    nav: {
      dashboard: "Dashboard",
      feedback: "Feedback",
      newFitSession: "Nieuwe fit-sessie",
      newBike: "Nieuwe fiets",
      bikeFitting: "Fietsafstelling",
      myBikes: "Mijn fietsgarage",
      profile: "Profiel",
      tirePressure: "Bandenspanning",
      settings: "Instellingen",
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
      myBikes: "Mijn fietsgarage",
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
    dashboardHome: {
      subtitle: "Je rijdersprofiel, fietssetup en bandenspanningsadvies op een plek.",
      riderCardTitle: "Rijdersprofiel",
      weightLabel: "Lichaamsgewicht",
      weightMissing: "Voeg toe aan profiel",
      editProfile: "Profiel bewerken",
      newFit: "Nieuwe fit",
      currentBikeTitle: "Huidige fiets",
      viewBike: "Bekijk fiets",
      noBikeTitle: "Nog geen fiets opgeslagen",
      noBikeDescription: "Voeg een fiets toe om druk- en fitcontext aan een echte setup te koppelen.",
      pressureStale: "Herberekenen aanbevolen",
      pressureWarnings: "{count} waarschuwingen in je fit- en spanningslaag",
      viewAllFits: "Alles bekijken",
    },
    fitHistory: {
      title: "Afstellingsgeschiedenis",
      subtitle: "Je afstellingssessies per fiets, nieuwste eerst.",
      emptyTitle: "Nog geen fit-sessies",
      emptyDescription:
        "Voltooi een fit-sessie om hier je fietsgeschiedenis op te bouwen.",
      emptyCta: "Start je eerste fit-sessie",
      bikeWithoutName: "Fiets zonder naam",
      noBikeLinked: "Geen fiets gekoppeld",
      noRecommendationYet: "Nog geen aanbeveling gegenereerd",
      latestSession: "Laatste sessie",
      confidence: "Vertrouwen",
      saddleHeight: "Zadelhoogte",
      handlebarDrop: "Stuurval",
      viewReport: "Bekijk rapport",
      startNewSession: "Start nieuwe fit-sessie",
      delete: {
        action: "Fit verwijderen",
        dialogTitle: "Bike fitting verwijderen?",
        dialogDescription:
          "Dit verwijdert de fit-sessie, vragenlijstantwoorden, aanbevelingen en gerelateerde validatiedata permanent.",
        confirm: "Fit verwijderen",
        success: "Bike fitting verwijderd.",
        failed: "Kon de bike fitting niet verwijderen. Probeer het opnieuw.",
      },
    },
    bikeTypes: {
      road: {
        label: "Racefiets",
        description: "Dropstuur, endurance of race geometrie",
      },
      gravel: {
        label: "Gravelbike",
        description: "Dropstuur, relaxte geometrie voor gemengd terrein",
      },
      mountain: {
        label: "Mountainbike",
        description: "Plat stuur, trail of XC geometrie",
      },
      hybrid: {
        label: "Hybride fiets",
        description: "Plat stuur, gemengd gebruik voor weg en comfort",
      },
      tt_triathlon: {
        label: "TT / Triathlon",
        description: "Aerodynamische setup voor tijdritten en triatlon",
      },
      cyclocross: {
        label: "Cyclocross fiets",
        description: "Dropstuur voor CX-parcoursen en gemengde omstandigheden",
      },
      touring: {
        label: "Toerfiets",
        description: "Stabiliteit op lange afstanden met beladen comfort",
      },
      city: {
        label: "Stads- / pendelfiets",
        description: "Rechtopzittende positie voor dagelijks comfort",
      },
    },
    bikeProfileTypes: {
      base: "Basis",
      mountain: "Berg",
      climbing: "Klimmen",
      endurance: "Uithoudingsvermogen",
      performance: "Prestatie",
      aero: "Aero",
      indoor: "Indoor",
      technical: "Technisch",
      comfort: "Comfort",
      custom: "Aangepast",
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
        usingBikeAttribute: "We gebruiken de opgeslagen fietswaarde:",
        missingBikeAttribute: "Deze fiets mist een verplichte fit-standaard.",
        completeBikeSetup: "Fietsinstellingen aanvullen",
        profilesLoading: "Fietsprofielen laden...",
        profilesTitle: "Kies een fietsprofiel",
        profilesHint: "Profielen bewaren meerdere fitcontexten voor dezelfde fiets.",
        noProfiles:
          "Nog geen opgeslagen fietsprofielen. We gebruiken deze fiets zonder opgeslagen profiel.",
        defaultBadge: "Standaard",
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
        missingRequiredMarker: "Ontbrekende verplichte antwoorden:",
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
      reportV2: {
        introTitle: "Engine-gestuurd fitrapport",
        introBody:
          "Gebruik dit rapport als praktische volgorde voor aanpassingen. Verander steeds een ding tegelijk, valideer op de fiets en noteer wat je voelt na elke rit.",
        sections: {
          profile: "Rijderprofiel",
          prioritySummary: "Prioriteitenoverzicht",
          detailedFit: "Gedetailleerde fittabel",
          adjustmentSequence: "Aanpasvolgorde",
          tirePressure: "Bandenspanning",
          validationPlan: "14-daags validatieplan",
          frameTargets: "Framedoelen",
          fitNotes: "Aanvullende fitnotities",
        },
        profileFields: {
          sessionId: "Sessie-ID",
          bikeType: "Fietstype",
          ridingStyle: "Rijstijl",
          goal: "Hoofddoel",
          algorithmVersion: "Algoritmeversie",
          engineVersion: "Engineversie",
          confidence: "Totale zekerheid",
          dataQuality: "Datakwaliteit",
          missingData: "Ontbrekende data",
        },
        dataQuality: {
          complete: "Compleet",
          partial: "Gedeeltelijk",
          banner:
            "Voor sommige aanbevelingen is extra rijder- of bandendata nodig. Controleer eerst de lijst met ontbrekende gegevens en de bandenspanningssectie.",
        },
        status: {
          ready: "Klaar om toe te passen",
          pendingData: "Wacht op data",
          optional: "Componentwissel",
        },
        table: {
          parameter: "Parameter",
          target: "Doelwaarde",
          range: "Bereik",
          current: "Huidig",
          delta: "Verschil",
          confidence: "Zekerheid",
          whyItMatters: "Waarom dit telt",
          riderValidationCue: "Wat je moet voelen",
          method: "Methode",
          feelDescription: "Gevoelsomschrijving",
          watchOuts: "Let op",
          status: "Status",
        },
        delta: {
          increase: "↑ {amount} mm vanaf huidig",
          decrease: "↓ {amount} mm vanaf huidig",
          neutral: "Op doel",
        },
        adjustmentGuideline:
          "Verander steeds een variabele tegelijk en houd individuele stappen binnen 2-5 mm voor de volgende validatierit.",
        tirePressure: {
          readyTitle: "Bandenspanningsadvies beschikbaar",
          pendingTitle: "Verplichte data ontbreekt",
          pendingDescription:
            "Gepersonaliseerde bandenspanning vereist rijdergewicht, bandensetup en ondergrondcontext. Gebruik de snelle tabel alleen als tijdelijke startwaarde.",
          quickStartTitle: "Snelle startschatting",
          quickStartNote:
            "Niet gepersonaliseerd. Respecteer altijd de maximale druk van band en velg.",
          confidence: "Zekerheid bandenspanning",
          front: "Voor",
          rear: "Achter",
          warnings: "Waarschuwingen bandenspanning",
          noWarnings: "Geen spanningswaarschuwingen in de laatste berekening.",
          inputsTitle: "Gebruikte invoer",
          inputLabels: {
            riderWeight: "Rijdergewicht",
            surface: "Ondergrond",
            goal: "Rijdoel",
          },
          missingDataLabels: {
            riderWeight: "Rijdergewicht",
            bikeWeight: "Fietsgewicht",
            tireWidth: "Gemeten bandbreedte",
            tireType: "Bandconstructie",
            surface: "Ondergrond",
            pressureWeight: "Gewicht in spanningscalculator",
          },
          surfaceValues: {
            smoothAsphalt: "Glad asfalt",
            averageAsphalt: "Gemiddeld asfalt",
            roughAsphalt: "Ruw asfalt",
            hardpackGravel: "Harde gravel",
            looseGravel: "Los gravel",
            trail: "Trail",
          },
        },
        validationPlan: {
          dayBlock: "Dagblok",
          change: "Aanpassing",
          rideDuration: "Ritduur",
          whatToScore: "Wat je scoort",
          rows: [
            {
              dayBlock: "Dagen 1-3",
              change: "Zet zadelhoogte en wen aan de basispositie.",
              rideDuration: "30-45 min",
              whatToScore: "Heupstabiliteit, kniecomfort, soepele cadans",
            },
            {
              dayBlock: "Dagen 4-7",
              change: "Bevestig zadelterugstand en zitbalans.",
              rideDuration: "45-60 min",
              whatToScore: "Druk op handen, tractie zittend, bekkenstabiliteit",
            },
            {
              dayBlock: "Dagen 8-10",
              change: "Verfijn stuurhoogte en reach.",
              rideDuration: "60-90 min",
              whatToScore: "Nekspanning, ademruimte, zachte ellebogen",
            },
            {
              dayBlock: "Dagen 11-14",
              change: "Valideer langere ritten en laatste kleine correcties.",
              rideDuration: "90+ min",
              whatToScore: "Totaalcomfort, herhaalbaarheid, vermoeidheidspatroon",
            },
          ] as Array<{
            dayBlock: string;
            change: string;
            rideDuration: string;
            whatToScore: string;
          }>,
        },
        parameters: {
          saddleHeight: {
            label: "Zadelhoogte",
            whyItMatters: "Bepaalt de timing van knie-extensie en is de belangrijkste stuurvariabele voor beenbelasting.",
            riderValidationCue: "Je trapt soepel zonder heupwieg na 15-20 minuten.",
            feelDescription: "De pedaalslag voelt rond en gecontroleerd. Je hoeft niet naar het dode punt te reiken.",
            watchOutHigh: "Te hoog kan heupwieg, hamstringbelasting en overreiken onderin geven.",
            watchOutLow: "Te laag kan knieën overbelasten en de slag benauwd laten voelen.",
            methodLabel: "LeMond-basis + Holmes-validatieband",
            measurementReference: "Hart trapas tot zadelbovenkant langs de zitbuislijn.",
            sequenceNote: "Begin hier, omdat elke cockpitaanbeveling afhangt van een stabiele zadelreferentie.",
          },
          saddleSetback: {
            label: "Zadelterugstand",
            whyItMatters: "Stuurt de zitbalans en helpt de belasting te verdelen tussen zadel, voeten en handen.",
            riderValidationCue: "Je voelt je in balans boven de fiets met stabiele tractie terwijl je zit.",
            feelDescription: "Je heupen voelen ondersteund en je handen dragen geen overmatige druk op vlak terrein.",
            watchOutHigh: "Te ver naar achter kan de voorkant lang en zwaar laten voelen.",
            watchOutLow: "Te ver naar voren kan kniebelasting en handdruk verhogen.",
            methodLabel: "KOPS-startpunt + stabiliteitscorrectie",
            measurementReference: "Horizontale afstand van het trapashart naar het zadelreferentiepunt.",
            sequenceNote: "Zet setback vast na zadelhoogte zodat de zitbalans stabiel is voor front-end werk.",
          },
          handlebarDrop: {
            label: "Stuurdrop",
            whyItMatters: "Bepaalt de balans tussen comfort en aerodynamica en hoeveel mobiliteit de houding vraagt.",
            riderValidationCue: "Je kunt zowel op de remgrepen als in de beugels rijden zonder snelle nek- of rugspanning.",
            feelDescription: "De voorkant voelt ondersteunend in plaats van beperkend, met voldoende ruimte om te ademen.",
            watchOutHigh: "Te veel drop kan nek, rug en hamstrings overbelasten.",
            watchOutLow: "Te weinig drop kan front-end support verminderen en een efficiënte houding beperken.",
            methodLabel: "Terrein- en doelcorrectie op basis van rijstijl",
            measurementReference: "Verticaal verschil tussen zadelreferentie en stuurcontacthoogte.",
            sequenceNote: "Pas drop pas aan nadat het zadel stabiel is, anders verander je twee referenties tegelijk.",
          },
          handlebarReach: {
            label: "Stuur-reach",
            whyItMatters: "Bepaalt cockpitlengte en beïnvloedt ellebooghoek, schouderbelasting en stuurcontrole.",
            riderValidationCue: "Je ellebogen blijven zacht en je kunt de remgrepen vasthouden zonder overmatige palmdruk.",
            feelDescription: "De cockpit voelt lang genoeg voor steun, maar niet zo lang dat je via de schouders moet steunen.",
            watchOutHigh: "Te lang kan de ellebogen blokkeren en hand-, nek- of schouderklachten geven.",
            watchOutLow: "Te kort kan de romp opvouwen en het sturen nerveus maken.",
            methodLabel: "Stack/reach- en contactpuntmodel",
            measurementReference: "Horizontale zadel-tot-stuur reach tussen contactpuntreferenties.",
            sequenceNote: "Zet reach na drop, omdat stackveranderingen vaak ook de ervaren lengte veranderen.",
          },
          stem: {
            label: "Stuurpen",
            whyItMatters: "Verfijnt stuurgevoel en front-end lengte zodra zadel- en stuurdoelen duidelijk zijn.",
            riderValidationCue: "Het stuurgedrag voelt rustig en je handen blijven licht tijdens normaal rijden.",
            feelDescription: "De fiets volgt natuurlijk zonder dat je je aan het stuur moet vastzetten.",
            watchOutHigh: "Een te lange stuurpen kan het sturen vertragen en reach overbelasten.",
            watchOutLow: "Een te korte stuurpen kan het sturen nerveus en krap laten voelen.",
            methodLabel: "Fijnregeling nadat het zadel vastligt",
            measurementReference: "Stuurpenlengte hart-op-hart met gemonteerde hoek.",
            sequenceNote: "Gebruik de stuurpen als verfijning, niet als eerste contactpuntcorrectie.",
          },
          crankLength: {
            label: "Cranklengte",
            whyItMatters: "Verandert hefboomwerking en gewrichtsuitslag, vooral bovenin de pedaalslag.",
            riderValidationCue: "De top van de slag voelt vrij en krachtig zonder heupbeknelling.",
            feelDescription: "Je kunt onder belasting trappen zonder bovenin de cirkel samengedrukt te voelen.",
            watchOutHigh: "Te lang kan heup- en kniecompressie bovenin vergroten.",
            watchOutLow: "Te kort kan hefboomwerking verminderen als de rijder zich slecht aanpast.",
            methodLabel: "Standaard proportionele basislijn",
            measurementReference: "Hart crank tot hart pedaalas.",
            sequenceNote: "Beoordeel cranklengte na contactpunten, omdat andere cranks vaak de zadelsetup beïnvloeden.",
          },
          handlebarWidth: {
            label: "Stuurbreedte",
            whyItMatters: "Beïnvloedt schoudercomfort, hefboomwerking en hoe open de borstkas aanvoelt.",
            riderValidationCue: "Je schouders blijven ontspannen en ademen voelt natuurlijk onder inspanning.",
            feelDescription: "De stuurbreedte voelt stabiel zonder dat je ellebogen onnatuurlijk naar binnen of buiten worden geduwd.",
            watchOutHigh: "Te breed kan schouderbelasting en luchtweerstand vergroten.",
            watchOutLow: "Te smal kan ademruimte beperken en hefboomwerking verlagen.",
            methodLabel: "Uitlijning op schouderbreedte",
            measurementReference: "Stuurbreedte hart-op-hart bij remgrepen of beugels, afhankelijk van het ontwerp.",
            sequenceNote: "Bevestig breedte na de kerncockpitmaten, omdat breedte vooral comfort en controle verfijnt.",
          },
        },
      },
      pressureInsights: {
        title: "Fit- en spanningsinzichten",
        comfort: "Comfortgerichte setup",
        balanced: "Gebalanceerde setup",
        performance: "Prestatiegerichte setup",
        stability: "Stabiliteit",
        surface: "Ondergrondmatch",
        surfaceMatched: "Bandenspanning en ondergrond lijken goed op elkaar afgestemd.",
        surfaceUnknown: "Nog geen notitie over ondergrond beschikbaar.",
        allGood: "De setup past goed bij je spanningsprofiel.",
        warningMessages: {
          pressure_high_for_gravel:
            "Je bandenspanning kan grip en comfort op gravel verminderen.",
          pressure_low_general:
            "Je bandenspanning kan stuurproblemen of snakebites veroorzaken.",
          aggressive_setup_rough_terrain:
            "Een agressieve positie plus lage druk op ruwe ondergrond kan extra discomfort geven.",
          weight_mismatch:
            "Je huidige gewicht wijkt af van het gewicht in de laatste spanningsberekening.",
          gravel_road_conflict:
            "Deze racefietssetup is gekoppeld aan een gravel-ondergrondprofiel.",
          mtb_pressure_stability:
            "Je voorbanddruk is hoog voor MTB-gebruik en kan stabiliteit verminderen.",
          performance_posture_low_pressure:
            "Een prestatiegerichte houding werkt beter met een stevigere bandenspanning op de weg.",
        } as Record<string, string>,
      },
    },
    dashboardFit: {
      noResultsYet: "Nog geen fitresultaten gekoppeld aan deze fiets.",
    },
    profile: {
      loading: "Profiel laden...",
      title: "Jouw profiel",
      photo: {
        upload: "Foto uploaden",
        error: "Upload mislukt. Probeer opnieuw.",
        fileTooLarge: "Gebruik een afbeelding kleiner dan 5 MB.",
        invalidType: "Gebruik JPG, PNG of WEBP.",
      },
      actions: {
        editMeasurements: "Metingen bewerken",
        editInline: "Bewerken",
      },
      sections: {
        bodyMeasurements: "Lichaamsmetingen",
        flexibility: "Flexibiliteit",
        coreStability: "Core-stabiliteit",
      },
      measurements: {
        summary: "Je opgeslagen lichaamsmetingen",
        height: "Lengte",
        inseam: "Binnenbeenlengte",
        weight: "Lichaamsgewicht",
        weightHelper: "Gebruikt voor bandenspanningsberekeningen.",
        weightTooltip: "Je gewicht wordt gebruikt om de optimale bandenspanning voor je fietsen te berekenen.",
        weightNotSet: "Voeg je gewicht toe om bandenspanningsberekeningen te activeren",
        torso: "Torso",
        armLength: "Armlengte",
        shoulderWidth: "Schouderbreedte",
        femurLength: "Dijbeenlengte",
        howToMeasure: "Zo meet je het:",
        saveField: "Opslaan",
        editAllButton: "Metingen bewerken",
        addOptional: "+ Optionele metingen toevoegen",
        heightSteps: [
          "Ga blootsvoets tegen een muur staan",
          "Leg een boek plat op je hoofd",
          "Markeer de muur en meet vanaf de vloer tot de markering",
        ],
        inseamSteps: [
          "Ga blootsvoets tegen een muur staan",
          "Plaats een boek stevig tussen je benen zoals een zadel",
          "Meet vanaf de vloer tot de bovenkant van het boek",
        ],
        torsoSteps: [
          "Ga rechtop op een vlakke stoel zitten",
          "Meet van je navel tot de bovenkant van het borstbeen",
        ],
        armSteps: [
          "Strek je arm recht opzij",
          "Meet van het schouderpunt tot het topje van de middelvinger",
        ],
        shoulderSteps: [
          "Ga ontspannen staan met je armen langs je lichaam",
          "Meet tussen de buitenste schouderpunten",
        ],
        femurSteps: [
          "Ga op een stoel zitten met je bovenbeen horizontaal",
          "Meet van de liesplooi tot het midden van de knie",
        ],
      },
      flexibility: {
        helper: "Hamstring-flexibiliteitsscore",
        editButton: "Score aanpassen",
        improveLink: "Hoe verbeter je je flexibiliteit",
        levelLabel: "{label} ({index}/5)",
        saveButton: "Opslaan",
        testInstructions: {
          title: "Zo voer je de test uit",
          steps: [
            "Ga op de vloer zitten met je benen recht vooruit",
            "Houd je knieën vlak op de grond",
            "Reik met beide handen naar je tenen",
            "Noteer hoe ver je comfortabel kunt reiken",
          ],
        },
        impactTitle: "Wat dit betekent voor je fit",
        impactDescription:
          "Een lagere flexibiliteitsscore leidt tot een meer rechtopstaande positie met minder stuurval. Betere flexibiliteit maakt een lagere, aerodynamischere houding mogelijk.",
      },
      coreStability: {
        helper: "Plank-houding beoordeling",
        editButton: "Opnieuw testen",
        improveLink: "Hoe verbeter je je rompstabiliteit",
        levelLabel: "{label} • {description}",
        saveButton: "Opslaan",
        testInstructions: {
          title: "Front plank-houdtest",
          steps: [
            "Ga in een plank staan op je onderarmen en tenen",
            "Houd een rechte lijn van hoofd tot hielen",
            "Laat de heupen niet zakken en trek ze niet omhoog",
            "Meet hoe lang je de positie met goede vorm vasthoudt",
            "Stop zodra je vorm verslechtert",
          ],
        },
        impactTitle: "Wat dit betekent voor je fit",
        impactDescription:
          "Bij lagere rompstabiliteit beperken we hoe ver je kunt reiken en hoe laag het stuur kan staan zonder vermoeidheid. Een sterkere core ondersteunt een langere, prestatiegerichtere houding.",
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
      recalculate: {
        dialogTitle: "Bandenspanning bijwerken?",
        dialogBody:
          "Je gewicht is gewijzigd naar {weight} kg. Wil je de aanbevolen bandenspanning voor je fietsen opnieuw laten berekenen?",
        confirmButton: "Ja, herberekenen",
        dismissButton: "Nu niet",
        successToast: "Bandenspanningsadvies bijgewerkt voor {count} fietsen.",
        calculating: "Bezig met herberekenen...",
      },
      refresh: {
        title: "Wil je je fitting- en bandenspanningsinstellingen opnieuw berekenen?",
        descriptionWithPressure:
          "Je lichaamsmetingen zijn bijgewerkt. Start een nieuwe fit-sessie om je fit-aanbevelingen te vernieuwen, of herbereken nu je bandenspanning op basis van {weight} kg.",
        descriptionFitOnly:
          "Je lichaamsmetingen zijn bijgewerkt. Start een nieuwe fit-sessie om je fit-aanbevelingen te vernieuwen.",
        fitButton: "Start nieuwe fit-sessie",
        pressureButton: "Herbereken bandenspanning",
        dismissButton: "Nu niet",
      },
      improve: {
        flexibility: {
          title: "Verbeter je flexibiliteit",
          subtitle:
            "Hamstring- en onderrugflexibiliteit bepalen hoe laag en ver naar voren je comfortabel kunt rijden.",
          whatItMeansTitle: "Wat je score betekent voor je bike fit",
          exercisesTitle: "Oefeningen om je flexibiliteit te verbeteren",
          progressTitle: "Zo volg je je vooruitgang",
          updateScoreCta: "Mijn flexibiliteitsscore bijwerken",
          backLink: "Terug naar profiel",
        },
        coreStability: {
          title: "Verbeter je rompstabiliteit",
          subtitle:
            "Rompkracht bepaalt hoe lang je een agressieve houding kunt vasthouden zonder vermoeidheid of rugklachten.",
          whatItMeansTitle: "Wat je score betekent voor je bike fit",
          exercisesTitle: "Oefeningen om je rompstabiliteit op te bouwen",
          progressTitle: "Zo volg je je vooruitgang",
          updateScoreCta: "Mijn rompstabiliteitsscore bijwerken",
          backLink: "Terug naar profiel",
        },
      },
      dangerZone: {
        title: "Gevarenzone",
        deleteAccount: "Account verwijderen",
        deleteConfirmTitle: "Account verwijderen?",
        deleteConfirmDescription:
          "Dit verwijdert permanent je profiel, fietsen, fit-sessies, aanbevelingen en alle andere gegevens. Deze actie kan niet ongedaan worden gemaakt.",
        deleteConfirmCta: "Ja, verwijder mijn account",
        cancel: "Annuleren",
        deleteFailed: "Account verwijderen mislukt. Probeer het opnieuw.",
      },
    },
    settings: {
      title: "Instellingen",
      subtitle: "Beheer je account, voorkeuren en integraties.",
      account: {
        title: "Account",
        type: "Accounttype",
        displayNameLabel: "Weergavenaam",
        displayNamePlaceholder: "Hoe je naam moet worden getoond",
        saveDisplayName: "Weergavenaam opslaan",
        displayNameSaveFailed: "Weergavenaam opslaan mislukt. Probeer het opnieuw.",
        free: "Gratis",
        pro: "Pro",
        upgrade: "Upgrade naar Pro",
        upgradeDescription:
          "Ontgrendel Strava-sync, rijkere bandenspanningsinzichten en een geavanceerdere setupworkflow.",
        upgradeCta: "Bekijk abonnementen",
      },
      preferences: {
        title: "Voorkeuren",
        language: "Taal",
        appearance: "Weergave",
        units: "Eenheden",
        metric: "Metrisch (kg, mm)",
        imperial: "Imperiaal (lbs, inch)",
        light: "Licht",
        dark: "Donker",
        system: "Systeem",
      },
      integrations: {
        title: "Integraties",
        strava: "Strava",
        stravaDescription:
          "Koppel Strava om recente ritcontext mee te nemen in bandenspanningsadvies.",
        connectStrava: "Strava koppelen",
        disconnectStrava: "Ontkoppelen",
        syncNow: "Nu synchroniseren",
        connected: "Verbonden",
        available: "Beschikbaar",
        proOnly: "Beschikbaar op Pro",
        pending: "Verbinden…",
        error: "Verbindingsfout",
        reconnect: "Strava opnieuw koppelen",
        lastSynced: "Laatste sync",
        rideStats: "{count} ritten · {km} km · Afgelopen 90 dagen",
        consent: {
          title: "Koppel je Strava-account",
          whatWeAccess: "Wat we inzien (alleen-lezen)",
          accessProfile: "Je atletenprofiel (naam, foto)",
          accessActivities:
            "Je recente activiteitensamenvattingen (afstand, duur, hoogteverschil, sporttype)",
          whatWeDoNot: "Wat we NIET inzien",
          noGps: "Je GPS-routes of kaarten",
          noNotes: "Je privénotities of -activiteiten",
          noSocial: "Je volgers, clubs of sociale data",
          noSegments: "Je segmenten of persoonlijke records",
          howWeUse: "Hoe we dit gebruiken",
          howWeUseDescription:
            "Je ritgeschiedenis helpt ons je terreinvoorkeur en rijstijl te begrijpen. Dit verbetert je bandenspanningsadvies en fietspassugesties.",
          dataNote:
            "Je data is alleen-lezen. Je kunt op elk moment ontkoppelen via Instellingen.",
          confirm: "Doorgaan naar Strava",
          cancel: "Annuleren",
        },
        disconnectConfirm: {
          title: "Strava ontkoppelen?",
          body: "Je Strava-activiteitendata wordt verwijderd van BestBikeFit4U. Je profielfoto blijft bewaard.",
          confirm: "Ontkoppelen",
          cancel: "Annuleren",
        },
        photoImport: {
          importButton: "Strava-foto gebruiken",
          confirmTitle: "Je Strava-profielfoto gebruiken?",
          confirmBody: "Dit vervangt je huidige profielfoto door die van je Strava-account.",
          confirm: "Strava-foto gebruiken",
          cancel: "Huidige behouden",
        },
        bikeImport: {
          title: "Jouw Strava-fietsen",
          description:
            "Bekijk de fietsen die Strava beschikbaar maakt, selecteer wat je lokaal wilt toevoegen en bevestig ambiguë fietstypes na de importstap.",
          loading: "Strava-fietsen laden...",
          blockedTitle: "Strava-fietsimport is geblokkeerd",
          blockedDescription:
            "De huidige backend geeft alleen Strava-verbinding en foto-sync terug. De gear-summary en import-contracten die deze flow nodig heeft zijn nog niet beschikbaar.",
          backendBlocked:
            "Ontbrekende backendondersteuning: een Strava gear-summary query, een importactie en een fiets-identificatieveld voor exacte detectie van reeds geïmporteerde fietsen.",
          parseError:
            "De opgeslagen Strava-payload kon niet worden gelezen als fietsimportdata.",
          emptyTitle: "Geen Strava-fietskandidaten beschikbaar",
          emptyDescription:
            "Er zijn geen importeerbare fietskandidaten gevonden in de huidige Strava-payload.",
          emptySelection: "Selecteer ten minste één fiets om te importeren.",
          selectionSummary: "{count} geselecteerd",
          alreadyAdded: "Al toegevoegd",
          primary: "Primair",
          typeConfirmationNeeded: "Typebevestiging",
          importButton: "Fietsen importeren",
          importButtonOne: "1 fiets importeren",
          importButtonMany: "{count} fietsen importeren",
          successOne: "{count} fiets geïmporteerd vanuit Strava.",
          successMany: "{count} fietsen geïmporteerd vanuit Strava.",
          failed: "Kon fietsen niet importeren vanuit Strava. Probeer het opnieuw.",
          resetSelection: "Selectie resetten",
          postImportHint:
            "Fietsen met een ambigu type openen na de eerste importstap een bevestigingsdialoog.",
          typeWizardTitle: "Fietstype bevestigen",
          typeWizardDescription:
            "Strava markeerde {name} als ambigu. Kies het meest passende fietstype voordat het aan je bibliotheek wordt toegevoegd.",
          typeWizardFallback: "Typedetails niet beschikbaar",
          typeWizardPrompt: "Kies het fietstype",
          typeWizardCancel: "Annuleren",
          typeWizardSave: "Opslaan en doorgaan",
        },
        callback: {
          connected: "Strava succesvol verbonden.",
          error: "Kon geen verbinding maken met Strava. Probeer het opnieuw.",
          denied: "Strava-verbinding geannuleerd.",
        },
      },
      privacy: {
        title: "Privacy",
        description:
          "Bekijk je accountdata, profielgegevens en juridische voorkeuren vanuit een plek.",
        privacyPolicy: "Privacybeleid",
        terms: "Voorwaarden",
        manageProfile: "Profiel beheren",
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
        blocked:
          "Deze fiets kan niet worden verwijderd omdat er al afstelgeschiedenis aan gekoppeld is.",
        dialogTitle: 'Fiets "{bikeName}" verwijderen?',
        dialogDescription:
          "Dit verwijdert de fiets en de direct gekoppelde wielset-, bandensetup- en bandenspanningsdata. Afstelgeschiedenis blokkeert verwijdering.",
        dialogConfirm: "Fiets verwijderen",
      },
      defaultProfile: {
        title: "Fietsprofielen",
        profileType: "Profieltype",
        empty: "Nog geen fietsprofiel beschikbaar.",
      },
      profiles: {
        climbingDescription:
          "Gericht op zittende tractie, efficiëntie bij lage snelheid en lange beklimmingen.",
      },
      sections: {
        geometry: "Geometrie",
        currentSetup: "Huidige setup",
        notes: "Notities",
        fittingHistory: "Afstellingsgeschiedenis",
      },
      cards: {
        bikeSummary: "{bikeType} opgeslagen in je fietsoverzicht.",
        bikeFit: {
          title: "Bikefitting",
          hasFitDescription:
            "Laatste fitresultaat voor deze fiets, inclusief rijstijl en fitdoel.",
          noFitDescription:
            "Er is nog geen fitresultaat opgeslagen voor deze fiets.",
          lastUpdated: "Laatst bijgewerkt",
        },
        advisedPressure: {
          title: "Geadviseerde bandenspanning",
          descriptionWithSetup:
            "Laatste spanningsadvies op basis van de actieve bandensetup: {setup}.",
          descriptionWithoutSetup:
            "Laatste opgeslagen spanningsadvies voor deze fiets.",
        },
        currentSetup: {
          title: "Huidige setup",
          description:
            "Opgeslagen cockpit- en contactpuntsetup die nu als basis voor deze fiets geldt.",
          emptyDescription:
            "Er is nog geen huidige fietssetup opgeslagen voor deze fiets.",
        },
        currentTyrePressure: {
          title: "Huidige bandenspanning",
          description:
            "De actieve wielset is {wheelset} met bandensetup {setup}.",
          emptyDescription:
            "Er is nog geen actieve wielset of bandensetup geselecteerd voor deze fiets.",
          noCurrentPressure: "Geen huidige spanning opgeslagen",
        },
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
      photo: {
        add: "Foto toevoegen",
        edit: "Foto wijzigen",
        error: "Upload mislukt.",
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
        editNotes: "Notitie bewerken",
        saveNotes: "Notitie opslaan",
        startFitForBike: "Start fit-sessie",
      },
      errors: {
        nameRequired: "Fietsnaam is verplicht.",
        typeRequired: "Fietstype is verplicht.",
        saveFailed: "Kon fiets niet opslaan. Probeer opnieuw.",
        deleteFailed: "Kon fiets niet verwijderen. Probeer opnieuw.",
      },
      delete: {
        confirm: "Deze fiets verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
        title: "Fiets verwijderen?",
        description:
          "Dit verwijdert de fiets en de direct gekoppelde wielset-, bandensetup- en bandenspanningsdata. Als de fiets al afstelgeschiedenis heeft, wordt verwijdering geblokkeerd.",
        confirmButton: "Fiets verwijderen",
      },
      sections: {
        basics: "Basisgegevens fiets",
        geometry: "Huidige geometrie (optioneel)",
        setup: "Huidige setup (optioneel)",
        notes: "Notities (optioneel)",
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
        discipline: {
          label: "Discipline",
          options: {
            road: "Racefiets",
            gravel: "Gravelbike",
            mtb: "MTB",
            tt: "Tri / TT",
          },
        },
        brand: {
          label: "Merk",
          placeholder: "bijv. Trek, Canyon, Giant",
        },
        model: {
          label: "Model",
          placeholder: "bijv. Endurace CF 7",
        },
        bikeWeightKg: {
          label: "Fietsgewicht (kg)",
          placeholder: "ca. 8",
        },
        photoUrl: {
          label: "Foto-URL",
          placeholder: "https://...",
        },
        notes: {
          label: "Mijn notities",
          placeholder:
            "Voeg persoonlijke notities toe over deze fiets, setupwijzigingen of rij-indrukken...",
          helper: "Maximaal 500 tekens.",
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
    pressure: {
      form: {
        bodyWeightLabel: "Lichaamsgewicht (kg)",
        bikeWeightLabel: "Fietsgewicht (optioneel)",
        ridingGoalLabel: "Doel",
        ridingGoalSpeed: "Snelheid",
        ridingGoalBalance: "Balans",
        ridingGoalComfort: "Comfort",
        tubeTypeInnerTube: "Binnenband",
        tubeTypeLatex: "Latex",
        tubeTypeTubeless: "Tubeless",
      },
      result: {
        front: "Voor",
        rear: "Achter",
        bar: "bar",
        psi: "PSI",
        explanation: "Toelichting",
        warningsTitle: "Waarschuwingen",
        disclaimer: "Controleer altijd de maximale druk van band en velg.",
        warningMessages: {
          max_rim_pressure_exceeded:
            "De aanbevolen druk overschrijdt de maximale druk van band of velg.",
          hookless_limit_exceeded:
            "Hookless velg: maximale druk overschreden. Controleer de specificaties.",
          pressure_too_low_for_setup:
            "De druk kan te laag zijn voor deze setup. Controleer karkas en terrein.",
          front_rear_pressure_mismatch:
            "Groot verschil tussen voor- en achterdruk. Controleer je invoer.",
          inner_tube_pinch_flat_risk:
            "Lage druk met binnenband: risico op stootlek.",
          road_tire_width_unusual:
            "Ongebruikelijke bandbreedte voor een racefiets. Controleer dit.",
          gravel_tire_width_unusual:
            "Ongebruikelijke bandbreedte voor een gravelbike.",
          mtb_tire_width_unusual:
            "MTB-banden zijn meestal minimaal 45 mm breed.",
          hookless_max_pressure_unknown:
            "Hookless velg: maximale druk onbekend. Blijf op of onder 3,5 bar tenzij anders aangegeven.",
        },
        comfortScore: "Comfort",
        gripScore: "Grip",
        efficiencyScore: "Efficiëntie",
      },
      bikeCard: {
        front: "Voor",
        rear: "Achter",
        noCalculation: "Nog geen druk berekend",
        newCalculation: "Bandenspanning berekenen",
        lastCalculated: "Laatst berekend",
      },
      bikeDetail: {
        sectionTitle: "Bandenspanning",
        activeWheelset: "Actieve wielset",
        activeTireSetup: "Actieve bandenconfiguratie",
        noWheelset: "Geen wielset opgeslagen",
        noTireSetup: "Geen bandenset",
        recommendedPressure: "Aanbevolen druk",
        currentPressure: "Huidige druk",
        noCalculation: "Nog geen druk berekend voor deze fiets.",
        profiles: "Opgeslagen presets",
        manageWheelsets: "Wielsets beheren",
        calculatePressure: "Bandenspanning berekenen",
      },
      overview: {
        title: "Laatste bandenspanning per fiets",
        subtitle: "Bekijk je laatste advies, voeg notities toe en start direct een nieuwe berekening.",
        description:
          "Je nieuwste bandenspanningsadvies blijft hier zichtbaar per fiets, zodat je setups kunt vergelijken zonder eerst de wizard te openen.",
        startNew: "Nieuwe berekening starten",
        frontPressure: "Voordruk",
        rearPressure: "Achterdruk",
        lastCalculated: "Laatst berekend",
        recalculate: "Herberekenen",
        noCalculation: "Nog geen berekening voor deze fiets. Start een advies om er een op te slaan.",
        noCalculationCta: "Advies ophalen",
        noBikesTitle: "Nog geen fietsen opgeslagen",
        noBikesDescription:
          "Voeg eerst een fiets toe om bandenspanningsadvies aan een echte setup te koppelen.",
        noBikesCta: "Fiets toevoegen",
        autoNoteWeightChange: "Gebaseerd op bijgewerkt gewicht van {weight} kg.",
        userNotes: {
          label: "Rijnotities",
          placeholder: "Wat merkte je op op de weg of trail?",
          helper: "Gebruik notities voor feedback, terreininformatie of setup-herinneringen. Maximaal 300 tekens.",
          empty: "Nog geen rijnotities.",
          editButton: "Notitie bewerken",
          saveButton: "Notitie opslaan",
        },
      },
      status: {
        optimal: "In lijn",
        slightly_high: "Iets te hoog",
        too_high: "Te hoog",
        too_low: "Te laag",
        no_measurement: "Geen meting",
      },
      wizard: {
        title: "Bandenspanning berekenen",
        stepLabels: {
          bike: "Fiets",
          wheelsetTires: "Wielset & banden",
          weightGoal: "Gewicht & doel",
          route: "Route",
          result: "Resultaat",
        },
        stepOf: "Stap {current} van {total}",
        back: "Terug",
        next: "Volgende",
        selectBike: "Selecteer een fiets",
        noBikes: "Nog geen fietsen opgeslagen.",
        addBikeLink: "Fiets toevoegen",
        continueWithoutBike: "Verder zonder opgeslagen fiets",
        selectWheelset: "Selecteer een wielset of bandenset",
        manualInput: "Handmatig invoeren",
        extraLuggageLabel: "Extra bagage (kg)",
        currentFrontLabel: "Huidige voordruk (bar, optioneel)",
        currentRearLabel: "Huidige achterdruk (bar, optioneel)",
        wetLabel: "Weer",
        wet: "Nat",
        dry: "Droog",
        surfaceLabel: "Ondergrond",
        distanceLabel: "Routeafstand (km)",
        elevationLabel: "Hoogtemeters (m)",
        offRoadLabel: "Off-road %",
        saveCalculation: "Berekening opslaan",
        saveAsPreset: "Opslaan als preset",
        presetName: "Presetnaam",
        presetUseCase: "Presetdoel",
        presetDefaultName: "Race setup",
        selectWheelsetFirst: "Selecteer eerst een wielset of voer banden handmatig in.",
        calculationSaved: "Berekening opgeslagen!",
        presetSaved: "Preset opgeslagen!",
        newCalculation: "Nieuwe berekening",
        goToMyBikes: "Naar mijn fietsen",
        currentPressureSummary: "Huidig",
        recommendedPressureSummary: "Aanbevolen",
        profileWeightMissing: "Je profiel mist lichaamsgewicht.",
        profileWeightCta: "Gewicht toevoegen",
        useCaseRace: "Race",
        useCaseEndurance: "Uithoudingsvermogen",
        useCaseWetWeather: "Nat weer",
        useCaseGravelMixed: "Gravel gemengd",
        useCaseComfort: "Comfort",
        useCaseCustom: "Aangepast",
        noPresets: "Nog geen presets opgeslagen.",
        bikeWeightRange: "Fietsgewicht moet tussen 3 en 20 kg liggen.",
        wheelsetNameRequired: "Naam van de wielset is verplicht.",
        tireNameRequired: "Naam van de bandenset is verplicht.",
        widthRange: "Bandbreedte moet tussen 18 en 80 mm liggen.",
        maxPressureRange: "Maximale druk moet tussen 3,5 en 10 bar liggen.",
        bikeSaved: "Fiets opgeslagen!",
        addWheelset: "Wielset toevoegen",
        skipToBikes: "Overslaan en naar mijn fietsen",
        wheelsetName: "Naam wielset",
        rimType: "Velgtype",
        rimWidthFront: "Interne velgbreedte voor (mm)",
        rimWidthRear: "Interne velgbreedte achter (mm)",
        tireSetupName: "Naam bandenset",
        tubeTypeLabel: "Type band",
        widthFront: "Bandbreedte voor (mm)",
        widthRear: "Bandbreedte achter (mm)",
        casingType: "Karkastype",
        optional: "Optioneel",
        casingRace: "Race / Licht",
        casingAllround: "Allround",
        casingReinforced: "Versterkt",
        maxPressure: "Max druk (bar)",
        saveWheelset: "Wielset en banden opslaan",
        skipToDone: "Nu overslaan",
        completedTitle: "Klaar! Je fiets is opgeslagen.",
        calculatePressure: "Bandenspanning berekenen",
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
