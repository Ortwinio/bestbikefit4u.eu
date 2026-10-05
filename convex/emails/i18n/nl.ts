/** Literal customer copy from plans/emails-bilingual/SPEC.md, section 5. */
export const nl = {
  common: {
    greeting: "Hoi {firstName},",
    genericGreeting: "Hoi,",
    signoff: "Fijne rit,",
    team: "Team BikeFitBoost",
    unsubscribe: "Afmelden",
    preferences: "E-mailvoorkeuren",
    labels: {
      saddleHeight: "Zadelhoogte",
      setback: "Terugstand zadel",
      drop: "Drop",
      stemShort: "Stuurpen",
      stem: "Stuurpen (lengte · hoek)",
      crankLength: "Cranklengte",
      handlebarWidth: "Stuurbreedte",
      stack: "Stack",
      reach: "Reach",
      topTube: "Effectieve bovenbuis",
    },
    footer: {
      transactional: "Je ontvangt deze mail vanwege je aanvraag bij BikeFitBoost.",
      service: "Je ontvangt deze mail omdat je een account hebt bij BikeFitBoost.",
      internal: "Interne melding over een nieuw praktijkverhaal.",
    },
    reply: "Vragen? Beantwoord deze mail, een echt mens leest mee.",
  },
  loginCode: {
    subject: "{code} is je BikeFitBoost-inlogcode",
    preheader: "15 minuten geldig. Je fietsen staan klaar.",
    heading: "Je inlogcode",
    body: "Hij is 15 minuten geldig. Je fietsen en fitwaarden staan voor je klaar.",
    small: "Niet aangevraagd? Negeer deze mail, er gebeurt niets.",
  },
  resultsSummary: {
    subject: "Je fit is klaar: zadel op {saddleHeight} mm",
    preheader: "Plus wat je als eerste aanpast.",
    eyebrow: "JE FIT IS KLAAR",
    heading: "Je startpunt staat klaar",
    caption: "zadelhoogte",
    range: "testmarge {min}–{max} mm",
    intro: "dit zijn je belangrijkste waarden voor je {bike}:",
    introWithoutBike: "dit zijn je belangrijkste waarden:",
    body: "In je rapport vind je de rest én je stappenplan: wat je eerst aanpast en hoe je het " +
      "test. Eén ding tegelijk, en je voelt het verschil binnen een paar ritten.",
    button: "Bekijk mijn stappenplan",
  },
  fitReport: {
    subject: "Je fitrapport: framemaat {frameSize}",
    preheader: "Al je maten op een rij, handig voor je fietsenmaker.",
    eyebrow: "JE FITRAPPORT",
    heading: "Framemaat {frameSize}",
    confidence: "We zijn {confidence}% zeker van deze maat",
    intro: "hier is je fitrapport. Bewaar het, of stuur het door naar je fietsenmaker.",
    valuesHeading: "Je afstelwaarden",
    geometryHeading: "Framegeometrie",
    tipsHeading: "Tips voor jou",
    button: "Open mijn stappenplan",
    version: "Berekend met versie {version}",
    subjectWithoutFrame: "Je fitrapport",
    headingWithoutFrame: "Je fitrapport",
  },
  fitPassWelcome: {
    subject: "Je volledige toegang is actief. Dit kun je nu",
    preheader: "Je PDF, je stappenplan en al je fietsen.",
    eyebrow: "BEDANKT, {firstName}",
    eyebrowWithoutName: "BEDANKT",
    heading: "Je volledige toegang is actief",
    benefits: [
      {
        title: "Je rapport als PDF:",
        text: "om te printen of mee te nemen naar je fietsenmaker.",
      },
      {
        title: "Je complete stappenplan:",
        text: "elke aanpassing in de juiste volgorde, met hoe je hem test.",
      },
      {
        title: "Onbeperkt fietsen en fit-sessies:",
        text: "ook een eigen afstelling voor je tweede fiets.",
      },
    ],
    button: "Download mijn PDF",
  },
  caseStudyLead: {
    subject: "Nieuwe aanmelding voor een praktijkverhaal: {name}",
    preheader: "Nieuwe aanmelding voor een praktijkverhaal",
    heading: "Nieuwe aanmelding voor een praktijkverhaal",
    labels: {
      name: "Naam",
      email: "E-mail",
      ridingGoal: "Ervaring",
      painSummary: "Samenvatting",
      sourcePath: "Bron",
      createdAt: "Ingediend",
    },
  },
  caseStudyConfirmation: {
    subject: "Bedankt! We mailen je over je verhaal",
    preheader: "Binnen een paar dagen 3 tot 5 korte vragen.",
    heading: "Bedankt voor je verhaal",
    intro: "leuk dat je je verhaal wilt delen. Zo werkt het:",
    benefits: [
      "Binnen een paar dagen mailen we je 3 tot 5 korte vragen.",
      "Alles gaat per mail: geen bellen, geen video.",
      "We publiceren niets zonder jouw aparte toestemming.",
    ],
    tip: "Tip: zet je huidige afstelling in de app, dan heb je je voor- en na-waarden meteen bij " +
      "de hand.",
    button: "Bekijk mijn afstelling",
    small: "We gebruiken je gegevens alleen hiervoor. Stoppen kan altijd: beantwoord deze mail.",
  },
  fitReminder: {
    subject: "Je fit in 10 minuten, met alleen een meetlint",
    preheader: "Je zadelhoogte en framemaat in millimeters.",
    eyebrow: "JE ACCOUNT STAAT KLAAR",
    heading: "Je fit nog niet. Dat kost 10 minuten",
    intro: "meer dan dit heb je niet nodig:",
    requirements: [
      "Je lengte (in centimeters, zonder schoenen)",
      "Je binnenbeenlengte (een meetlint en een boek zijn genoeg).",
    ],
    benefitsHeading: "Wat je ervoor terugkrijgt:",
    benefits: [
      "Je zadelhoogte, met een testmarge",
      "Je stuurpositie: reach en drop",
      "De juiste stuurpenlengte",
      "Je framemaat",
    ],
    button: "Start mijn fit",
  },
  upgradeNudge: {
    subject: "Je fit op papier, en voor al je fietsen",
    preheader: "Jaarabonnement: €21,50 per jaar, inclusief 2 cadeaumetingen per jaar.",
    heading: "Haal meer uit je fit",
    intro: "je fitwaarden staan klaar. Met een jaarabonnement krijg je er dit bij:",
    benefits: [
      {
        title: "Een PDF van je rapport",
        text: "(om mee te nemen naar je fietsenmaker)",
      },
      {
        title: "Al je fietsen",
        text: "(een eigen afstelling voor je racefiets én je gravelbike)",
      },
      {
        title: "Je rapport in je inbox",
        text: "(wanneer je maar wilt).",
      },
    ],
    cancel: "opzeggen kan altijd",
    price: "€21,50 per jaar · 2 cadeaumetingen per jaar · opzeggen kan altijd",
    button: "Bekijk het jaarabonnement",
  },
  winback: {
    subject: "Klopt je fit nog?",
    preheader: "Nieuwe fiets of een paar kilo verschil? Check het in 5 minuten.",
    eyebrow: "EVEN CHECKEN",
    heading: "Klopt je fit nog?",
    intro: "een nieuwe fiets, nieuwe schoenen of een paar kilo verschil verandert je ideale houding " +
      "vaak meer dan je denkt.",
    valuesHeading: "Je vorige waarden",
    recorded: "Vastgelegd op {date} voor je {bike}.",
    recordedWithoutBike: "Vastgelegd op {date}.",
    body: "Een nieuwe sessie laat in 5 minuten zien of ze nog kloppen.",
    button: "Check mijn waarden",
    recordedWithoutDate: "Voor je {bike}.",
  },
  proExplainer: {
    subject: "Zo haal je het meeste uit je fitwaarden",
    preheader: "Drie waarden, drie tips. Twee minuten lezen.",
    heading: "Zo haal je het meeste uit je fitwaarden",
    intro: "drie tips bij je belangrijkste waarden:",
    tips: [
      "Zadelhoogte is je startpunt. Rijd er een paar ritten mee voordat je verder bijstelt.",
      "Terugstand bepaalt waar je knie boven het pedaal staat, afgestemd op je rijstijl.",
      "Drop maakt je sneller (meer) of comfortabeler (minder), afgestemd op jouw doel.",
    ],
    body: "Voelt iets na een paar ritten nog niet goed? Je stappenplan zegt wat je dan probeert.",
    button: "Bekijk mijn fitwaarden",
    illustrationAlt: "Pentekening van stack en reach op een fiets",
  },
  day1Tips: {
    subject: "3 tips voor een fit die echt klopt",
    preheader: "Nauwkeuriger meten in 5 minuten, plus je fit altijd op zak.",
    heading: "3 tips voor een fit die echt klopt",
    intro: "hoe preciezer je meet, hoe beter je advies. Met deze drie tips haal je het meeste uit " +
      "BikeFitBoost:",
    tips: [
      {
        title: "Meet op blote voeten.",
        text: "Zet een boek tussen je benen, strak tegen de muur, en meet van de vloer tot de " +
          "bovenkant. Meet twee keer: een paar millimeter scheelt al in je zadelhoogte.",
      },
      {
        title: "Wees eerlijk over je lenigheid.",
        text: "Kom je niet bij je tenen? Vul dat gewoon in. Dan krijg je een houding die je ook na 100 " +
          "km nog prettig vindt.",
      },
      {
        title: "Pas één ding tegelijk aan.",
        text: "Stappen van 2 tot 5 mm, en test elke aanpassing een paar ritten. Zo weet je precies wat " +
          "werkt.",
      },
    ],
    button: "Start mijn fit",
    buttonExisting: "Bekijk mijn fit",
    appEyebrow: "TIP",
    appHeading: "Zet BikeFitBoost op je telefoon.",
    appBody: "Je waarden altijd bij de hand: in de schuur met de inbussleutel in je hand, of bij de " +
      "pomp voor je rit. Geen App Store nodig, en het neemt bijna geen ruimte in.",
    chips: [
      "Je afstelwaarden",
      "Je bandenspanning",
      "Je stappenplan",
    ],
    iphone: [
      "Open bikefitboost.com in Safari",
      "Tik op het deelicoon",
      "Kies Zet op beginscherm",
    ],
    android: [
      "Open bikefitboost.com in Chrome",
      "Tik op de drie puntjes",
      "Kies App installeren",
    ],
    illustrationAlt: "Pentekening van een meetlint en een boek",
  },
  day7CheckIn: {
    subject: "Hoe rijdt je nieuwe zadelhoogte?",
    preheader: "In 30 seconden: vul je check-in in.",
    eyebrow: "Je 14-dagenplan · dag 7",
    progressLabel: "Dag 7 van 14",
    heading: "Hoe rijdt je nieuwe zadelhoogte?",
    intro: "een week geleden stelde je je fiets af. Met je check-in zie je meteen of je op koers zit en wat je als volgende aanpast.",
    question: "Hoe voelen je knieën sinds de aanpassing?",
    answers: { better: "Beter", same: "Hetzelfde", worse: "Minder goed" },
    hint: "Eén tik opent je check-in met je antwoord al ingevuld.",
    button: "Doe mijn check-in",
  },
  day14Evaluation: {
    subject: "Twee weken verder: tijd voor je evaluatie",
    preheader: "Bekijk je voortgang en zet je nieuwe waarden vast.",
    eyebrow: "Je 14-dagenplan · afgerond",
    progressLabel: "Dag 14 van 14 · afgerond",
    heading: "Twee weken verder",
    intro: "je 14-dagenplan zit erop. Bekijk hoe je comfort is veranderd en sla je definitieve waarden op.",
    button: "Bekijk mijn voortgang",
    illustrationAlt: "Pentekening van een racefietsband",
    tipTitle: "Nog één ding:",
    tip: "bereken ook meteen je ideale bandenspanning. Die past bij je gewicht, bandbreedte en wegdek.",
  },
} as const;

type Widen<T> = T extends string
  ? string
  : { [K in keyof T]: Widen<T[K]> };
export type EmailCopy = Widen<typeof nl>;
