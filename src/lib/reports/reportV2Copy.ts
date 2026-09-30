import en from "@/i18n/messages/en";
import nl from "@/i18n/messages/nl";
import type { Locale } from "@/i18n/config";

export type ReportV2Copy = (typeof en)["dashboard"]["results"]["reportV2"];

const copyByLocale: Record<Locale, ReportV2Copy> = {
  en: en.dashboard.results.reportV2,
  nl: nl.dashboard.results.reportV2,
};

export function getReportV2Copy(locale: Locale | null | undefined): ReportV2Copy {
  return copyByLocale[locale ?? "en"] ?? copyByLocale.en;
}

export const PDF_SUMMARY_COPY = {
  en: {
    forRider: "Fit report for",
    bike: "Bike",
    date: "Date",
    goal: "Goal",
    session: "Session",
    diagramAlt: "Bicycle side view: A saddle height, B saddle setback, C handlebar drop, D handlebar reach",
    reference: "Base data on page 2 · measuring guide on page 6",
    confidence: "Advice confidence",
    confidenceBody: "Based on the completeness and plausibility of your data.",
    priorities: "Adjust these points first",
    prioritiesBody: "Change one thing at a time. Test small changes on easy rides.",
  },
  nl: {
    forRider: "Fitrapport voor",
    bike: "Fiets",
    date: "Datum",
    goal: "Doel",
    session: "Sessie",
    diagramAlt: "Fiets in zijaanzicht: A zadelhoogte, B zadelterugstand, C stuurdrop, D stuurreach",
    reference: "Basisgegevens op pagina 2 · meetuitleg op pagina 6",
    confidence: "Zekerheid van het advies",
    confidenceBody: "Op basis van volledigheid en aannemelijkheid van je gegevens.",
    priorities: "Pas eerst deze punten aan",
    prioritiesBody: "Eén ding tegelijk. Test kleine veranderingen op rustige ritten.",
  },
};

export const PDF_BASE_DATA_COPY = {
  en: {
    section: "Your base data",
    title: "What your advice is based on",
    intro:
      "These are the rider and bike details available for this report. If anything is incorrect, " +
      "update your profile in your dashboard and start a new fit.",
    rider: "Rider",
    coreStability: "Core stability",
    painAreas: "Reported discomfort",
    currentFrameSize: "Current frame size",
    painAreaLabels: {
      knee_front: "Front of knee", knee_back: "Back of knee", lower_back: "Lower back", neck: "Neck",
      hands: "Hands", saddle: "Saddle area", feet: "Feet", knees: "Knees", shoulders: "Shoulders",
      sit_bones: "Sit bones",
    },
    extraMeasurements: "Extra measurements",
    notProvided: "Not entered",
    bike: "Bike",
    howYouRide: "How you ride",
    improveTitle: "Make your advice more precise",
    improveBody:
      "Complete your missing torso, arm and shoulder measurements in your profile. " +
      "Use the measurement guide, then start a new fit with the updated details.",
  },
  nl: {
    section: "Je basisgegevens",
    title: "Waar je advies op rust",
    intro:
      "Dit zijn de rijder- en fietsgegevens die voor dit rapport beschikbaar zijn. Klopt er iets niet? " +
      "Pas je profiel aan in je dashboard en start een nieuwe fit.",
    rider: "Rijder",
    coreStability: "Rompstabiliteit",
    painAreas: "Gemeld ongemak",
    currentFrameSize: "Huidige framemaat",
    painAreaLabels: {
      knee_front: "Voorkant knie", knee_back: "Achterkant knie", lower_back: "Onderrug", neck: "Nek",
      hands: "Handen", saddle: "Zadelgebied", feet: "Voeten", knees: "Knieën", shoulders: "Schouders",
      sit_bones: "Zitbotten",
    },
    extraMeasurements: "Extra maten",
    notProvided: "Niet ingevuld",
    bike: "Fiets",
    howYouRide: "Hoe je fietst",
    improveTitle: "Maak je advies nog scherper",
    improveBody:
      "Vul je ontbrekende romp-, arm- en schoudermaten in je profiel in. " +
      "Gebruik de meetgids en start daarna een nieuwe fit met de bijgewerkte gegevens.",
  },
};

export const PDF_FIT_VALUES_COPY = {
  nl: {
    title: "Je afstelwaarden",
    intro:
      "Meet je fiets zoals op pagina 6 en schrijf je huidige waarde in de kolom Nu. " +
      "Een testmarge staat alleen bij waarden waarvoor die beschikbaar is.",
    margin: "Testmarge",
    target: "Doel",
    now: "Nu",
    component: "Onderdeel",
    drawing: "Zie tekening op pagina 1",
    fillIn: "Zelf invullen",
    unavailable: "Nog geen afstelwaarden beschikbaar.",
    stemAngle: "Stuurpenhoek",
    stemNote: "Hoek uit je aanbeveling. Controleer de mogelijkheden van je stuurpen.",
    stemDrawing: "Schematische stuurpenhoek",
    frame: "Framerichting",
    frameNote: "Vergelijk merken op stack en reach.",
    frameDrawing: "Frame met stack en reach",
    stack: "Stack",
    reach: "Reach",
    topTube: "Effectieve bovenbuis",
    why: {
      saddleHeight: "Kniebelasting en trapritme",
      saddleSetback: "Stabiel bekken en kniebeweging",
      handlebarDrop: "Houding, nek- en rugbelasting",
      handlebarReach: "Schouders en handdruk",
      stem: "Verfijn pas na je zadel",
      crankLength: "Ruimte voor heup en knie",
      handlebarWidth: "Ademruimte en schouders",
    },
  },
  en: {
    title: "Your fit values",
    intro:
      "Measure your bike as shown on page 6 and write your current value in the Now column. " +
      "A test range is shown only where one is available.",
    margin: "Test range",
    target: "Target",
    now: "Now",
    component: "Component",
    drawing: "See drawing on page 1",
    fillIn: "Fill in by hand",
    unavailable: "No fit values are available yet.",
    stemAngle: "Stem angle",
    stemNote: "Angle from your recommendation. Check the adjustment options of your stem.",
    stemDrawing: "Schematic stem angle",
    frame: "Frame guidance",
    frameNote: "Compare brands using stack and reach.",
    frameDrawing: "Frame with stack and reach",
    stack: "Stack",
    reach: "Reach",
    topTube: "Effective top tube",
    why: {
      saddleHeight: "Knee loading and pedalling rhythm",
      saddleSetback: "Pelvic stability and knee movement",
      handlebarDrop: "Posture, neck and back loading",
      handlebarReach: "Shoulders and hand pressure",
      stem: "Refine after setting the saddle",
      crankLength: "Room for hips and knees",
      handlebarWidth: "Breathing room and shoulders",
    },
  },
} as const;

export const PDF_SHELL_COPY = {
  nl: {
    footerLabel: "Fitrapport",
    title: "Persoonlijk fitrapport",
    sections: [
      "Persoonlijk fitrapport",
      "Je basisgegevens",
      "Je afstelwaarden",
      "Je bandenspanning",
      "Je plan voor 14 dagen",
      "Zo meet en controleer je",
    ],
  },
  en: {
    footerLabel: "Fit report",
    title: "Personal fit report",
    sections: [
      "Personal fit report",
      "Your base data",
      "Your fit values",
      "Your tire pressure",
      "Your 14-day plan",
      "How to measure and check",
    ],
  },
};

export const PDF_PLAN_COPY = {
  en: {
    section: "Adjust & test",
    title: "Your plan for 14 days",
    intro: "Work in small steps of 2–5 mm. Test each adjustment on easy rides before moving on.",
    day: "Day",
    phases: [
      {
        range: "1–3",
        title: "Establish a baseline",
        body: "Check the tire guidance on page 4. Make one change and note how it feels.",
      },
      {
        range: "4–7",
        title: "Test and refine",
        body: "Watch knee comfort, saddle pressure and a smooth pedalling rhythm.",
      },
      {
        range: "8–14",
        title: "Validate on longer rides",
        body: "Watch pelvic stability and comfort as you gradually extend your rides.",
      },
    ],
    feelTitle: "What you feel helps you adjust",
    feelCaption: "Symptoms and trial adjustments",
    feel: "You feel",
    try: "Try",
    symptoms: [
      { feeling: "Pain at the front of the knee", action: "Saddle 3–5 mm higher" },
      { feeling: "Tension behind the knee", action: "Saddle 3–5 mm lower" },
      { feeling: "Numb hands or neck tension", action: "Bars 10 mm higher or reach 10 mm shorter" },
    ],
    caution:
      "These are trial adjustments, not a diagnosis. " +
      "Stop if pain persists and consult a qualified fitter or clinician.",
    logTitle: "Ride log",
    logHint: "Print and complete after each ride",
    logCaption: "Ride log to complete by hand",
    change: "Adjustment",
    distance: "Km",
    pain: "Pain 0–10",
    comment: "Notes",
    notesTitle: "Notes from your fit",
    moreNotes: "Read the full fit notes in your dashboard.",
  },
  nl: {
    section: "Aanpassen & testen",
    title: "Je plan voor 14 dagen",
    intro:
      "Werk in kleine stappen van 2–5 mm. Test elke aanpassing eerst op rustige ritten voordat je verder gaat.",
    day: "Dag",
    phases: [
      {
        range: "1–3",
        title: "Leg je startpunt vast",
        body: "Bekijk ook het bandenadvies op pagina 4. Verander één punt en noteer hoe het voelt.",
      },
      {
        range: "4–7",
        title: "Test en verfijn",
        body: "Let op het gevoel in je knieën, de druk op je zadel en een soepele trapbeweging.",
      },
      {
        range: "8–14",
        title: "Test op langere ritten",
        body: "Let op de stabiliteit van je bekken en je comfort terwijl je je ritten rustig verlengt.",
      },
    ],
    feelTitle: "Wat je voelt, helpt je bijsturen",
    feelCaption: "Klachten en testaanpassingen",
    feel: "Je voelt",
    try: "Probeer",
    symptoms: [
      { feeling: "Pijn vóór in de knie", action: "Zadel 3–5 mm hoger" },
      { feeling: "Spanning achter de knie", action: "Zadel 3–5 mm lager" },
      { feeling: "Dove handen of nekspanning", action: "Stuur 10 mm hoger of reach 10 mm korter" },
    ],
    caution:
      "Dit zijn testaanpassingen, geen diagnose. Stop bij aanhoudende pijn en raadpleeg " +
      "een gekwalificeerde fitter of zorgverlener.",
    logTitle: "Rittenlogboek",
    logHint: "Print uit en vul in na elke rit",
    logCaption: "Rittenlogboek om in te vullen",
    change: "Aanpassing",
    distance: "Km",
    pain: "Pijn 0–10",
    comment: "Opmerking",
    notesTitle: "Notities bij je fit",
    moreNotes: "Lees de volledige fitnotities in je dashboard.",
  },
};

export const PDF_TIRES_COPY = {
  en: {
    title: "Your tire pressure",
    intro: "A starting point for your bike. Check cold tires before your ride and refine one tire at a time.",
    illustration: "Floor pump with a pressure gauge beside a bicycle wheel",
    pending: "Personal pressure guidance is not available yet",
    pendingBody:
      "Complete your weight, tire setup and surface details in the pressure calculator before using a target.",
    missing: "Details still needed",
    surfaceTitle: "Your recorded surface",
    recorded: "Recorded setup",
    measured: "Measured",
    fillIn: "Fill in by hand",
    tableHint: "Write down what your gauge shows",
    tableNote: "These values apply to the recorded setup. Recalculate before changing the tires or surface.",
    scale: "Display scale, not a tire or rim limit.",
    warningsNotice: "Read all pressure warnings in your dashboard before using these values.",
    warningsCount: "Warnings: {count}",
    ridingGoals: { speed: "Speed", comfort: "Comfort", balance: "Balance" },
    testTitle: "How to test",
    steps: [
      "Check the tire and rim limits first. Use the same pressure gauge each time.",
      "Ride a familiar loop and notice the front tire’s grip and comfort first.",
      "Change one tire at a time, in steps of 0.1 bar, within the tire and rim limits.",
    ],
    maximum: "Check the maximum",
    maximumBody:
      "Never exceed the pressure limit specified for your tire or rim. Follow the lower limit and the manufacturer’s " +
      "compatibility instructions, especially with hookless rims.",
  },
  nl: {
    title: "Je bandenspanning",
    intro: "Een startpunt voor je fiets. Controleer koude banden vóór de rit en verfijn één band tegelijk.",
    illustration: "Staande fietspomp met manometer naast een fietswiel",
    pending: "Persoonlijk drukadvies is nog niet beschikbaar",
    pendingBody:
      "Vul je gewicht, bandgegevens en ondergrond aan in de bandenspanningscalculator " +
      "vóór je een richtwaarde gebruikt.",
    missing: "Deze gegevens ontbreken nog",
    surfaceTitle: "Je vastgelegde ondergrond",
    recorded: "Vastgelegde setup",
    measured: "Gemeten",
    fillIn: "Zelf invullen",
    tableHint: "Schrijf op wat je meter aangeeft",
    tableNote:
      "Deze waarden gelden voor de vastgelegde setup. Bereken opnieuw als je banden of ondergrond veranderen.",
    scale: "Weergaveschaal, geen band- of velglimiet.",
    warningsNotice: "Lees alle drukwaarschuwingen in je dashboard vóór je deze waarden gebruikt.",
    warningsCount: "Waarschuwingen: {count}",
    ridingGoals: { speed: "Snelheid", comfort: "Comfort", balance: "Balans" },
    testTitle: "Zo test je",
    steps: [
      "Controleer eerst de band- en velglimieten. Meet altijd met dezelfde meter.",
      "Rij een vast rondje en let eerst op grip en comfort van de voorband.",
      "Verander één band tegelijk, 0,1 bar per keer, binnen de band- en velglimieten.",
    ],
    maximum: "Check het maximum",
    maximumBody:
      "Ga nooit boven de maximale druk die voor je band of velg is opgegeven. Houd de laagste limiet aan en volg " +
      "de compatibiliteitsinstructies van de fabrikant, vooral bij haakloze (hookless) velgen.",
  },
};
export const PDF_MEASUREMENT_COPY = {
  en: {
    title: "How to measure your setup",
    intro:
      "Use the same reference points every time. This lets you compare changes and restore your previous setup.",
    toolsLabel: "You need:",
    tools: "tape measure, spirit level, plumb line and a pencil.",
    illustration: "Tape measure, pencil, book and spirit level",
    methods: {
      saddleHeight: "From the bottom-bracket center to the top of the saddle, along the seat-tube line.",
      saddleSetback: "Horizontally, from the vertical line through the bottom-bracket center to the saddle nose.",
      handlebarDrop:
        "The height difference between the top of the saddle and your fixed reference point on the handlebar.",
      handlebarReach: "Horizontal saddle-to-handlebar reach between contact-point references.",
    },
    equipment: {
      saddleHeight: "Tape measure and spirit level",
      saddleSetback: "Plumb line",
      handlebarDrop: "Tape measure and spirit level",
      handlebarReach: "Tape measure and plumb line",
    },
    pressureTitle: "Checking tire pressure",
    pressureBody:
      "Measure cold tires before your ride, using the same gauge each time. Review your pressure details on page 4.",
    disclaimerTitle: "Guidance, not a medical assessment",
    disclaimerBody:
      "Treat these values as a starting point. Confidence depends on the completeness and plausibility of your data. " +
      "Make small adjustments and assess each change on the bike. Stop and consult a qualified fitter or healthcare " +
      "professional if pain persists.",
    checklistTitle: "Ready after 14 days?",
    checklist: [
      "No new discomfort",
      "Values checked against the test ranges",
      "Ride log completed",
      "New values saved in your account",
    ],
    guide: "More detail in the measurement guide:",
    update: "Update your measurements in your account.",
  },
  nl: {
    title: "Zo meet je je afstelling",
    intro:
      "Gebruik steeds dezelfde meetpunten. Zo kun je aanpassingen vergelijken en je afstelling later terugzetten.",
    toolsLabel: "Nodig:",
    tools: "meetlint, waterpas, schietlood en een potlood.",
    illustration: "Meetlint, potlood, boek en waterpas",
    methods: {
      saddleHeight: "Van het midden van de trapas tot de bovenkant van het zadel, langs de lijn van de zitbuis.",
      saddleSetback: "Horizontaal, van de loodlijn door het midden van de trapas tot de zadelneus.",
      handlebarDrop: "Het hoogteverschil tussen de bovenkant van het zadel en je vaste meetpunt op het stuur.",
      handlebarReach: "Horizontale afstand tussen het zadelreferentiepunt en het contactpunt op het stuur.",
    },
    equipment: {
      saddleHeight: "Meetlint en waterpas",
      saddleSetback: "Schietlood",
      handlebarDrop: "Meetlint en waterpas",
      handlebarReach: "Meetlint en schietlood",
    },
    pressureTitle: "Bandenspanning controleren",
    pressureBody:
      "Meet koud, vóór de rit, altijd met dezelfde drukmeter. Bekijk je bandenspanningsgegevens op pagina 4.",
    disclaimerTitle: "Advies, geen medische beoordeling",
    disclaimerBody:
      "Lees je waarden als een startpunt. De zekerheid van het advies hangt af van hoe volledig en aannemelijk je " +
      "gegevens zijn. Pas aan in kleine stappen en beoordeel elke verandering op de fiets. Stop en raadpleeg een " +
      "gekwalificeerde fitter of zorgverlener als pijn aanhoudt.",
    checklistTitle: "Klaar na 14 dagen?",
    checklist: [
      "Geen nieuwe klachten",
      "Waarden naast de testmarges gelegd",
      "Rittenlogboek ingevuld",
      "Nieuwe waarden in je account gezet",
    ],
    guide: "Meer uitleg in de meetgids:",
    update: "Werk je waarden bij in je account.",
  },
};
