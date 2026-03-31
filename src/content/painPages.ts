import type { Locale } from "@/i18n/config";

export type PainPageCopy = {
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  categoryLabel: string;
  title: string;
  intro: string;
  symptomTitle: string;
  symptomBullets: string[];
  fitTitle: string;
  fitBullets: string[];
  riderChecklistTitle: string;
  riderChecklist: string[];
  faqTitle: string;
  faqs: Array<{ q: string; a: string }>;
  relatedTitle: string;
  relatedLinks: Array<{ href: string; label: string }>;
  primaryCta: string;
  secondaryCta: string;
};

export type PainPageDefinition = {
  slug: string;
  painArea: "knee" | "back" | "neck" | "hands" | "saddle";
  en: PainPageCopy;
  nl: PainPageCopy;
};

export const PAIN_PAGES: PainPageDefinition[] = [
  {
    slug: "knee-pain-cycling",
    painArea: "knee",
    en: {
      seoTitle: "Bike Fit for Knee Pain While Cycling | BestBikeFit4U",
      seoDescription: "Reduce front or back knee pain on the bike by checking saddle height, setback, cleat position, and workload progression.",
      keywords: ["bike fit knee pain", "cycling knee pain setup", "saddle height knee pain"],
      categoryLabel: "Pain point",
      title: "Bike Fit for Knee Pain While Cycling",
      intro: "Recurring knee pain is often a fit problem before it is a training problem. The fastest wins usually come from saddle height, saddle setback, cleat position, and workload pacing.",
      symptomTitle: "What riders usually notice",
      symptomBullets: [
        "Pain at the front of the knee after steady efforts",
        "Pain behind the knee when the saddle feels too high",
        "Discomfort that shows up more on climbs or low cadence riding",
      ],
      fitTitle: "What to check first",
      fitBullets: [
        "Check saddle height before changing anything else",
        "Review saddle setback and cleat fore-aft together",
        "Make changes in small steps and test on the same route",
      ],
      riderChecklistTitle: "Before you adjust",
      riderChecklist: [
        "Note whether the pain is in the front or back of the knee",
        "Compare when it appears: flats, climbing, hard efforts, or long rides",
        "Keep one baseline ride for before/after validation",
      ],
      faqTitle: "FAQ",
      faqs: [
        { q: "Can saddle height really cause knee pain?", a: "Yes. Even a small saddle-height error can overload the knee repeatedly over hundreds of pedal strokes." },
        { q: "Should I change cleats before saddle position?", a: "Usually start with saddle height and setback, then validate cleat position if symptoms remain." },
      ],
      relatedTitle: "Related next steps",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
        { href: "/case-study", label: "Join a pain case study" },
      ],
      primaryCta: "Start free fit",
      secondaryCta: "Join case study",
    },
    nl: {
      seoTitle: "Bikefit bij kniepijn tijdens fietsen | BestBikeFit4U",
      seoDescription: "Verminder kniepijn op de fiets door zadelhoogte, setback, schoenplaatjes en belasting slim te controleren.",
      keywords: ["bikefit kniepijn", "kniepijn fietsen afstelling", "zadelhoogte kniepijn"],
      categoryLabel: "Klacht",
      title: "Bikefit bij kniepijn tijdens fietsen",
      intro: "Terugkerende kniepijn is vaak eerst een fitprobleem en pas daarna een trainingsprobleem. De snelste winst zit meestal in zadelhoogte, zadelterugstand, schoenplaatjes en belasting.",
      symptomTitle: "Wat rijders meestal merken",
      symptomBullets: [
        "Pijn aan de voorkant van de knie bij langere blokken",
        "Pijn achter de knie wanneer het zadel te hoog voelt",
        "Meer klachten op klimmen of bij lage cadans",
      ],
      fitTitle: "Wat je eerst controleert",
      fitBullets: [
        "Controleer zadelhoogte voordat je andere dingen verandert",
        "Bekijk zadelterugstand en schoenplaatjes samen",
        "Pas alleen kleine stappen toe en test op dezelfde rit",
      ],
      riderChecklistTitle: "Voordat je gaat aanpassen",
      riderChecklist: [
        "Noteer of de pijn voor of achter de knie zit",
        "Bekijk wanneer de pijn optreedt: vlak, klim, hard rijden of lange rit",
        "Gebruik één vaste testrit voor voor/na vergelijking",
      ],
      faqTitle: "FAQ",
      faqs: [
        { q: "Kan zadelhoogte echt kniepijn veroorzaken?", a: "Ja. Zelfs een kleine fout in zadelhoogte kan de knie elke pedaalomwenteling opnieuw belasten." },
        { q: "Moet ik eerst mijn schoenplaatjes veranderen?", a: "Begin meestal met zadelhoogte en setback en controleer schoenplaatjes als klachten blijven." },
      ],
      relatedTitle: "Gerelateerde vervolgstappen",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
        { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
        { href: "/case-study", label: "Doe mee aan een pijn-case-study" },
      ],
      primaryCta: "Start gratis fit",
      secondaryCta: "Doe mee aan case study",
    },
  },
  {
    slug: "lower-back-pain-cycling",
    painArea: "back",
    en: {
      seoTitle: "Bike Fit for Lower Back Pain | BestBikeFit4U",
      seoDescription: "Reduce lower-back pain on the bike by reviewing reach, bar drop, pelvic support, and ride intensity.",
      keywords: ["bike fit lower back pain", "cycling back pain position", "reach and drop lower back pain"],
      categoryLabel: "Pain point",
      title: "Bike Fit for Lower Back Pain",
      intro: "Lower-back pain often comes from a position your mobility and core support cannot hold for long enough. Reach, bar drop, and pelvic stability usually matter more than riders expect.",
      symptomTitle: "What riders usually notice",
      symptomBullets: [
        "Back tightness after 30 to 90 minutes",
        "Pain when trying to stay low on the bars",
        "Relief when sitting up or moving hands frequently",
      ],
      fitTitle: "What to check first",
      fitBullets: [
        "Check whether reach is too long before replacing multiple parts",
        "Reduce unnecessary bar drop when flexibility is limited",
        "Stabilize saddle support before lowering the front end again",
      ],
      riderChecklistTitle: "Before you adjust",
      riderChecklist: [
        "Compare outdoor discomfort with indoor trainer discomfort",
        "Note whether pain is worse in the hoods, drops, or aero position",
        "Track fatigue separately from sharp pain",
      ],
      faqTitle: "FAQ",
      faqs: [
        { q: "Does lower-back pain always mean the bars are too low?", a: "No. Reach, pelvic support, and how you brace the torso can matter just as much." },
        { q: "Should I raise the bars immediately?", a: "Only after checking saddle support and reach, otherwise you can hide the root cause instead of solving it." },
      ],
      relatedTitle: "Related next steps",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/profile/improve/core-stability", label: "Core stability guide" },
        { href: "/case-study", label: "Join a pain case study" },
      ],
      primaryCta: "Start free fit",
      secondaryCta: "Join case study",
    },
    nl: {
      seoTitle: "Bikefit bij lage rugklachten | BestBikeFit4U",
      seoDescription: "Verminder lage rugklachten op de fiets door reach, stuurdrop, bekkenondersteuning en belasting te beoordelen.",
      keywords: ["bikefit lage rugklachten", "rugpijn fietsen positie", "reach drop rugpijn"],
      categoryLabel: "Klacht",
      title: "Bikefit bij lage rugklachten",
      intro: "Lage rugklachten ontstaan vaak door een positie die je mobiliteit en core-ondersteuning niet lang genoeg kunnen vasthouden. Reach, stuurdrop en bekkenstabiliteit zijn meestal bepalender dan gedacht.",
      symptomTitle: "Wat rijders meestal merken",
      symptomBullets: [
        "Strakke of vermoeide rug na 30 tot 90 minuten",
        "Meer klachten wanneer je laag op het stuur zit",
        "Tijdelijke verlichting zodra je rechter gaat zitten",
      ],
      fitTitle: "Wat je eerst controleert",
      fitBullets: [
        "Controleer of reach te lang is voordat je veel onderdelen vervangt",
        "Verminder onnodige stuurdrop bij beperkte mobiliteit",
        "Stabiliseer zadelondersteuning voordat je de voorkant weer verlaagt",
      ],
      riderChecklistTitle: "Voordat je gaat aanpassen",
      riderChecklist: [
        "Vergelijk klachten buiten met klachten op de trainer",
        "Noteer of pijn erger is op de remgrepen, in de beugels of aero",
        "Houd vermoeidheid en scherpe pijn apart bij",
      ],
      faqTitle: "FAQ",
      faqs: [
        { q: "Betekent lage rugpijn altijd dat het stuur te laag staat?", a: "Nee. Reach, bekkenondersteuning en rompstabiliteit zijn net zo belangrijk." },
        { q: "Moet ik het stuur direct hoger zetten?", a: "Pas nadat je zadelondersteuning en reach hebt bekeken, anders maskeer je mogelijk de echte oorzaak." },
      ],
      relatedTitle: "Gerelateerde vervolgstappen",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
        { href: "/profile/improve/core-stability", label: "Core stability gids" },
        { href: "/case-study", label: "Doe mee aan een pijn-case-study" },
      ],
      primaryCta: "Start gratis fit",
      secondaryCta: "Doe mee aan case study",
    },
  },
  {
    slug: "neck-pain-cycling",
    painArea: "neck",
    en: {
      seoTitle: "Bike Fit for Neck Pain While Riding | BestBikeFit4U",
      seoDescription: "Review bar drop, reach, hood position, and head posture when neck pain shows up during cycling.",
      keywords: ["bike fit neck pain", "cycling neck pain", "bar drop neck pain"],
      categoryLabel: "Pain point",
      title: "Bike Fit for Neck Pain While Riding",
      intro: "Neck pain is usually a posture load problem, not just a flexibility problem. Riders often get better results by reducing unnecessary strain at the front end and improving support through the torso.",
      symptomTitle: "What riders usually notice",
      symptomBullets: [
        "Pain at the base of the neck when looking ahead",
        "Neck tightness on longer rides or rough surfaces",
        "Frequent need to shrug or reset the shoulders",
      ],
      fitTitle: "What to check first",
      fitBullets: [
        "Review how low and how far the bars actually are",
        "Check hood rotation and wrist position",
        "Reduce front-end aggression if the posture cannot be sustained",
      ],
      riderChecklistTitle: "Before you adjust",
      riderChecklist: [
        "Note whether the problem is worse in the drops or on the hoods",
        "See if the pain is worse outdoors than indoors",
        "Track whether shoulder tension appears before the neck pain",
      ],
      faqTitle: "FAQ",
      faqs: [
        { q: "Is neck pain always caused by weak flexibility?", a: "No. Front-end length, drop, and how you support your upper body can matter more." },
        { q: "Should I shorten the stem first?", a: "Not always. Check bar drop and hood setup too, because several small factors can stack together." },
      ],
      relatedTitle: "Related next steps",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
        { href: "/case-study", label: "Join a pain case study" },
      ],
      primaryCta: "Start free fit",
      secondaryCta: "Join case study",
    },
    nl: {
      seoTitle: "Bikefit bij nekpijn tijdens fietsen | BestBikeFit4U",
      seoDescription: "Beoordeel stuurdrop, reach, remgreeppositie en hoofdhouding wanneer nekpijn tijdens fietsen terugkomt.",
      keywords: ["bikefit nekpijn", "nekpijn fietsen", "stuurdrop nekpijn"],
      categoryLabel: "Klacht",
      title: "Bikefit bij nekpijn tijdens fietsen",
      intro: "Nekpijn is meestal een houdingsbelasting, niet alleen een flexibiliteitsprobleem. Vaak verbeteren klachten sneller door de voorkant minder belastend te maken en de romp beter te laten ondersteunen.",
      symptomTitle: "Wat rijders meestal merken",
      symptomBullets: [
        "Pijn onderaan de nek wanneer je vooruit kijkt",
        "Nekspanning op langere ritten of ruwe ondergrond",
        "Regelmatig de schouders moeten ophalen of resetten",
      ],
      fitTitle: "Wat je eerst controleert",
      fitBullets: [
        "Bekijk hoe laag en hoe ver het stuur echt staat",
        "Controleer rotatie van de remgrepen en polspositie",
        "Maak de voorkant minder agressief als je de houding niet kunt vasthouden",
      ],
      riderChecklistTitle: "Voordat je gaat aanpassen",
      riderChecklist: [
        "Let op of klachten erger zijn in de beugels of op de grepen",
        "Vergelijk buitenritten met de trainer",
        "Bekijk of schouderspanning al eerder optreedt dan nekpijn",
      ],
      faqTitle: "FAQ",
      faqs: [
        { q: "Komt nekpijn altijd door slechte flexibiliteit?", a: "Nee. Lengte en drop van de voorkant en hoe je bovenlichaam wordt ondersteund zijn vaak belangrijker." },
        { q: "Moet ik eerst de stuurpen verkorten?", a: "Niet altijd. Controleer ook stuurdrop en remgreeppositie, want meerdere kleine factoren kunnen samen klachten geven." },
      ],
      relatedTitle: "Gerelateerde vervolgstappen",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
        { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
        { href: "/case-study", label: "Doe mee aan een pijn-case-study" },
      ],
      primaryCta: "Start gratis fit",
      secondaryCta: "Doe mee aan case study",
    },
  },
  {
    slug: "hand-numbness-cycling",
    painArea: "hands",
    en: {
      seoTitle: "Bike Fit for Hand Numbness and Pressure | BestBikeFit4U",
      seoDescription: "Hand numbness often comes from too much front-end load. Review reach, bar drop, hood setup, and support through the saddle.",
      keywords: ["bike fit hand numbness", "cycling hand pain", "too much weight on bars"],
      categoryLabel: "Pain point",
      title: "Bike Fit for Hand Numbness and Pressure",
      intro: "Hand numbness is usually a load-distribution problem. When too much weight moves onto the bars, your hands become the warning system.",
      symptomTitle: "What riders usually notice",
      symptomBullets: [
        "Numbness in fingers on longer rides",
        "Pressure or pain in the palm",
        "Relief only when changing hand position repeatedly",
      ],
      fitTitle: "What to check first",
      fitBullets: [
        "Check whether reach is pushing too much load forward",
        "Review hood angle and wrist extension",
        "Make sure saddle support is stable before changing cockpit parts",
      ],
      riderChecklistTitle: "Before you adjust",
      riderChecklist: [
        "Note if numbness is equal in both hands",
        "See whether it appears faster on rough roads",
        "Track whether the issue improves when you sit more upright",
      ],
      faqTitle: "FAQ",
      faqs: [
        { q: "Do padded gloves solve hand numbness?", a: "They can help with comfort, but they usually do not fix the underlying load-distribution issue." },
        { q: "Should I raise the bars immediately?", a: "Only after checking reach and saddle support. Raising bars without context can help, but not always for the right reason." },
      ],
      relatedTitle: "Related next steps",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
        { href: "/case-study", label: "Join a pain case study" },
      ],
      primaryCta: "Start free fit",
      secondaryCta: "Join case study",
    },
    nl: {
      seoTitle: "Bikefit bij dove handen en druk op de handen | BestBikeFit4U",
      seoDescription: "Dove handen komen vaak door te veel belasting op de voorkant. Controleer reach, stuurdrop, remgreeppositie en zadelondersteuning.",
      keywords: ["bikefit dove handen", "handpijn fietsen", "te veel gewicht op het stuur"],
      categoryLabel: "Klacht",
      title: "Bikefit bij dove handen en druk op de handen",
      intro: "Dove handen zijn meestal een probleem van gewichtsverdeling. Als te veel belasting naar het stuur verschuift, worden je handen het alarmsignaal.",
      symptomTitle: "Wat rijders meestal merken",
      symptomBullets: [
        "Tintelende of dove vingers op langere ritten",
        "Druk of pijn in de handpalm",
        "Alleen verlichting door vaak van handpositie te wisselen",
      ],
      fitTitle: "Wat je eerst controleert",
      fitBullets: [
        "Bekijk of reach te veel gewicht naar voren brengt",
        "Controleer remgreephoek en polspositie",
        "Zorg eerst voor stabiele zadelondersteuning voordat je cockpitdelen wijzigt",
      ],
      riderChecklistTitle: "Voordat je gaat aanpassen",
      riderChecklist: [
        "Noteer of beide handen evenveel klachten geven",
        "Bekijk of het sneller optreedt op ruwe wegen",
        "Let op of het beter wordt wanneer je rechter gaat zitten",
      ],
      faqTitle: "FAQ",
      faqs: [
        { q: "Helpen dikke handschoenen tegen dove handen?", a: "Ze kunnen comfort verbeteren, maar lossen meestal niet de echte oorzaak in de gewichtsverdeling op." },
        { q: "Moet ik direct het stuur hoger zetten?", a: "Pas nadat je reach en zadelondersteuning hebt bekeken. Een hogere voorkant helpt soms, maar niet altijd om de juiste reden." },
      ],
      relatedTitle: "Gerelateerde vervolgstappen",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
        { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
        { href: "/case-study", label: "Doe mee aan een pijn-case-study" },
      ],
      primaryCta: "Start gratis fit",
      secondaryCta: "Doe mee aan case study",
    },
  },
  {
    slug: "saddle-discomfort-cycling",
    painArea: "saddle",
    en: {
      seoTitle: "Bike Fit for Saddle Discomfort | BestBikeFit4U",
      seoDescription: "Saddle discomfort often improves when height, setback, support, and weight distribution are corrected together.",
      keywords: ["bike fit saddle discomfort", "saddle pain cycling", "bike fit saddle support"],
      categoryLabel: "Pain point",
      title: "Bike Fit for Saddle Discomfort",
      intro: "Saddle discomfort is rarely solved by a saddle swap alone. Height, setback, and weight distribution usually decide whether a saddle works or not.",
      symptomTitle: "What riders usually notice",
      symptomBullets: [
        "Pressure that builds over longer steady rides",
        "Need to shift position constantly",
        "Front-end pressure changes when saddle comfort gets worse",
      ],
      fitTitle: "What to check first",
      fitBullets: [
        "Check whether saddle height is destabilizing pelvic support",
        "Review saddle setback before replacing components",
        "Balance load between saddle, feet, and hands instead of chasing one contact point",
      ],
      riderChecklistTitle: "Before you adjust",
      riderChecklist: [
        "Note whether discomfort is pressure, numbness, or chafing",
        "Track when it appears on the ride timeline",
        "Keep tire pressure and bib choice consistent during testing",
      ],
      faqTitle: "FAQ",
      faqs: [
        { q: "Does saddle discomfort always mean I need a different saddle?", a: "No. Many saddle problems improve when fit and load distribution are corrected first." },
        { q: "Should I lower the saddle when it feels unstable?", a: "Sometimes, but only after checking how setback and overall support interact." },
      ],
      relatedTitle: "Related next steps",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
        { href: "/case-study", label: "Join a pain case study" },
      ],
      primaryCta: "Start free fit",
      secondaryCta: "Join case study",
    },
    nl: {
      seoTitle: "Bikefit bij zadelongemak | BestBikeFit4U",
      seoDescription: "Zadelongemak verbetert vaak wanneer hoogte, setback, ondersteuning en gewichtsverdeling samen worden gecorrigeerd.",
      keywords: ["bikefit zadelongemak", "zadelpijn fietsen", "zadelondersteuning bikefit"],
      categoryLabel: "Klacht",
      title: "Bikefit bij zadelongemak",
      intro: "Zadelongemak los je zelden alleen met een ander zadel op. Hoogte, setback en gewichtsverdeling bepalen meestal of een zadel werkt.",
      symptomTitle: "Wat rijders meestal merken",
      symptomBullets: [
        "Druk die toeneemt op langere rustige ritten",
        "Steeds van houding moeten wisselen",
        "Meer druk op de voorkant wanneer zadelcomfort afneemt",
      ],
      fitTitle: "Wat je eerst controleert",
      fitBullets: [
        "Controleer of zadelhoogte de bekkenondersteuning instabiel maakt",
        "Bekijk setback voordat je onderdelen vervangt",
        "Verdeel belasting over zadel, voeten en handen in plaats van één contactpunt te fixeren",
      ],
      riderChecklistTitle: "Voordat je gaat aanpassen",
      riderChecklist: [
        "Noteer of het druk, gevoelloosheid of schuren is",
        "Houd bij wanneer het tijdens de rit begint",
        "Houd bandenspanning en kleding gelijk tijdens testen",
      ],
      faqTitle: "FAQ",
      faqs: [
        { q: "Betekent zadelongemak altijd dat ik een ander zadel nodig heb?", a: "Nee. Veel zadelproblemen verbeteren eerst door fit en gewichtsverdeling te corrigeren." },
        { q: "Moet ik het zadel lager zetten als het instabiel voelt?", a: "Soms wel, maar pas nadat je ook setback en totale ondersteuning hebt bekeken." },
      ],
      relatedTitle: "Gerelateerde vervolgstappen",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
        { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
        { href: "/case-study", label: "Doe mee aan een pijn-case-study" },
      ],
      primaryCta: "Start gratis fit",
      secondaryCta: "Doe mee aan case study",
    },
  },
] as const;

export const PAIN_PAGE_SLUGS = PAIN_PAGES.map((page) => page.slug);

export function getPainPageBySlug(slug: string) {
  return PAIN_PAGES.find((page) => page.slug === slug) ?? null;
}

export function getPainPageCopy(page: PainPageDefinition, locale: Locale) {
  return locale === "nl" ? page.nl : page.en;
}
