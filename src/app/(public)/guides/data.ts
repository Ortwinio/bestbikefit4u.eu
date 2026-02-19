import type { Locale } from "@/i18n/config";

export type GuideFaq = { q: string; a: string };

export type GuideLink = { href: string; label: string };

export type GuideCopy = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  cardTitle: string;
  cardDescription: string;
  h1: string;
  intro: string;
  takeawaysTitle: string;
  takeaways: string[];
  adjustmentsTitle: string;
  adjustments: string[];
  faqTitle: string;
  faqs: GuideFaq[];
  relatedTitle: string;
  relatedLinks: GuideLink[];
  primaryCta: string;
  secondaryCta: string;
};

export type Guide = {
  slug: string;
  cluster: "pain" | "discipline";
  en: GuideCopy;
  nl: GuideCopy;
};

export const GUIDES: Guide[] = [
  {
    slug: "bike-fitting-for-knee-pain",
    cluster: "pain",
    en: {
      seoTitle: "Bike Fitting for Knee Pain | BestBikeFit4U",
      seoDescription:
        "Learn practical bike fitting adjustments for knee pain and use a structured process to test saddle height, setback, and cleat-related setup changes.",
      seoKeywords: [
        "bike fitting for knee pain",
        "knee pain cycling fit",
        "saddle height knee pain",
      ],
      cardTitle: "Bike Fitting for Knee Pain",
      cardDescription:
        "Fix common knee pain causes with step-by-step setup checks.",
      h1: "Bike Fitting for Knee Pain",
      intro:
        "Most cycling knee pain comes from setup mismatch, not training alone. Start with conservative, measurable changes and evaluate one variable at a time.",
      takeawaysTitle: "What usually causes knee pain",
      takeaways: [
        "Saddle too high or too low",
        "Saddle setback too far forward or backward",
        "Reach too long causing unstable pelvis",
        "Rapid workload increases without position adaptation",
      ],
      adjustmentsTitle: "Practical adjustment order",
      adjustments: [
        "Set saddle height to your fit report target",
        "Re-check saddle setback and pedaling line",
        "Shorten cockpit if you slide forward under load",
        "Test each change for 2-3 rides before making another",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Can bike fitting solve all knee pain?",
          a: "No. If pain persists or is severe, involve a medical professional. Bike fitting can remove common mechanical triggers.",
        },
        {
          q: "What should I change first?",
          a: "Start with saddle height. It has the strongest impact on knee loading patterns for most riders.",
        },
      ],
      relatedTitle: "Related resources",
      relatedLinks: [
        { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
        { href: "/faq", label: "Bike Fitting FAQ" },
        { href: "/guides/bike-fitting-for-lower-back-pain", label: "Bike Fitting for Lower Back Pain" },
      ],
      primaryCta: "Start Free Fit",
      secondaryCta: "How It Works",
    },
    nl: {
      seoTitle: "Bikefitting bij kniepijn | BestBikeFit4U",
      seoDescription:
        "Lees welke bikefitting-aanpassingen vaak helpen bij kniepijn en test zadelhoogte, zadelterugstand en houding stap voor stap.",
      seoKeywords: [
        "bikefitting kniepijn",
        "kniepijn fietsen afstelling",
        "zadelhoogte kniepijn",
      ],
      cardTitle: "Bikefitting bij kniepijn",
      cardDescription:
        "Pak veelvoorkomende oorzaken van kniepijn gericht aan.",
      h1: "Bikefitting bij kniepijn",
      intro:
        "Kniepijn op de fiets komt vaak door een mismatch in afstelling, niet alleen door trainingsbelasting. Werk met kleine, meetbare aanpassingen.",
      takeawaysTitle: "Veelvoorkomende oorzaken",
      takeaways: [
        "Zadel te hoog of te laag",
        "Zadelterugstand te ver naar voren of achteren",
        "Te lange reach met instabiel bekken",
        "Te snelle trainingsopbouw zonder positie-aanpassing",
      ],
      adjustmentsTitle: "Praktische volgorde van aanpassingen",
      adjustments: [
        "Zet zadelhoogte op de doelwaarde uit je fitrapport",
        "Controleer daarna zadelterugstand",
        "Verkort de cockpit als je naar voren schuift tijdens belasting",
        "Test elke wijziging 2-3 ritten voordat je verder aanpast",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Lost bikefitting alle kniepijn op?",
          a: "Nee. Blijvende of hevige pijn vraagt ook om medische beoordeling. Bikefitting helpt vooral mechanische oorzaken te verminderen.",
        },
        {
          q: "Wat pas ik het eerst aan?",
          a: "Begin met zadelhoogte. Die heeft bij de meeste fietsers de grootste invloed op kniebelasting.",
        },
      ],
      relatedTitle: "Gerelateerde bronnen",
      relatedLinks: [
        { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
        { href: "/faq", label: "Bikefitting FAQ" },
        { href: "/guides/bike-fitting-for-lower-back-pain", label: "Bikefitting bij lage rugklachten" },
      ],
      primaryCta: "Start gratis fit",
      secondaryCta: "Hoe het werkt",
    },
  },
  {
    slug: "bike-fitting-for-lower-back-pain",
    cluster: "pain",
    en: {
      seoTitle: "Bike Fitting for Lower Back Pain | BestBikeFit4U",
      seoDescription:
        "Reduce lower back discomfort on the bike by improving cockpit length, drop, and pelvic stability with a structured fit process.",
      seoKeywords: [
        "bike fitting lower back pain",
        "cycling back pain fit",
        "bike reach lower back",
      ],
      cardTitle: "Bike Fitting for Lower Back Pain",
      cardDescription:
        "Use fit changes to lower stress on your lower back.",
      h1: "Bike Fitting for Lower Back Pain",
      intro:
        "Lower-back discomfort often appears when reach and drop exceed what your mobility and core control can support. Position balance matters more than aggressive setup.",
      takeawaysTitle: "Common back-pain triggers",
      takeaways: [
        "Cockpit too long for your torso and mobility",
        "Excessive bar drop",
        "Saddle tilt or setback mismatch",
        "Insufficient adaptation to a new aggressive position",
      ],
      adjustmentsTitle: "Practical adjustment order",
      adjustments: [
        "Reduce drop and/or shorten reach slightly",
        "Confirm saddle setback and neutral tilt",
        "Prioritize pelvic stability before aero posture",
        "Rebuild intensity after position changes",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Should I always raise my handlebars?",
          a: "Not always. A full fit review is better than one isolated change because saddle position and reach interact with bar height.",
        },
        {
          q: "How quickly should pain improve?",
          a: "Minor discomfort often improves within a few rides. Persistent pain should be assessed by a professional fitter or clinician.",
        },
      ],
      relatedTitle: "Related resources",
      relatedLinks: [
        { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
        { href: "/about", label: "How BestBikeFit4U Works" },
        { href: "/guides/bike-fitting-for-knee-pain", label: "Bike Fitting for Knee Pain" },
      ],
      primaryCta: "Start Free Fit",
      secondaryCta: "See Fit Methods",
    },
    nl: {
      seoTitle: "Bikefitting bij lage rugklachten | BestBikeFit4U",
      seoDescription:
        "Verminder lage rugklachten op de fiets door reach, stuurdrop en bekkenstabiliteit gericht af te stemmen.",
      seoKeywords: [
        "bikefitting lage rugklachten",
        "rugpijn fietsen afstelling",
        "reach stuurdrop rug",
      ],
      cardTitle: "Bikefitting bij lage rugklachten",
      cardDescription:
        "Verminder rugbelasting met gerichte afstelkeuzes.",
      h1: "Bikefitting bij lage rugklachten",
      intro:
        "Lage rugklachten ontstaan vaak wanneer reach en stuurdrop niet passen bij je mobiliteit en core-stabiliteit. Een gebalanceerde positie werkt beter dan een te agressieve houding.",
      takeawaysTitle: "Veelvoorkomende triggers",
      takeaways: [
        "Cockpit te lang voor jouw romp en mobiliteit",
        "Te veel stuurdrop",
        "Onjuiste zadelkanteling of zadelterugstand",
        "Te snelle overgang naar een agressieve houding",
      ],
      adjustmentsTitle: "Praktische volgorde van aanpassingen",
      adjustments: [
        "Verlaag de drop en/of verkort reach licht",
        "Controleer zadelterugstand en neutrale zadelhoek",
        "Kies eerst voor bekkenstabiliteit, dan pas voor aerodynamica",
        "Bouw trainingsintensiteit opnieuw op na aanpassingen",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Moet ik mijn stuur altijd hoger zetten?",
          a: "Niet altijd. Zadelpositie, reach en stuurhoogte beinvloeden elkaar. Kijk naar het complete plaatje.",
        },
        {
          q: "Hoe snel moet ik verbetering voelen?",
          a: "Lichte klachten verbeteren vaak binnen enkele ritten. Blijvende klachten vragen om een fitter of medische beoordeling.",
        },
      ],
      relatedTitle: "Gerelateerde bronnen",
      relatedLinks: [
        { href: "/science/stack-and-reach", label: "Stack en reach gids" },
        { href: "/about", label: "Hoe BestBikeFit4U werkt" },
        { href: "/guides/bike-fitting-for-knee-pain", label: "Bikefitting bij kniepijn" },
      ],
      primaryCta: "Start gratis fit",
      secondaryCta: "Bekijk fitmethodes",
    },
  },
  {
    slug: "road-bike-fit-guide",
    cluster: "discipline",
    en: {
      seoTitle: "Road Bike Fit Guide | BestBikeFit4U",
      seoDescription:
        "Road bike fitting guide for comfort and performance: saddle height, reach, drop, and practical adaptation for endurance or race goals.",
      seoKeywords: ["road bike fit guide", "road bike position", "endurance vs race fit"],
      cardTitle: "Road Bike Fit Guide",
      cardDescription:
        "Balance comfort and speed for endurance or race setups.",
      h1: "Road Bike Fit Guide",
      intro:
        "Road-bike fit is a tradeoff between sustainable comfort and aerodynamic speed. The best setup is the one you can hold under fatigue, not just in a static pose.",
      takeawaysTitle: "Road-bike fit priorities",
      takeaways: [
        "Stable pelvis and neutral saddle support",
        "Reach that supports relaxed shoulders",
        "Drop level matched to flexibility",
        "Goal-specific posture for endurance or race",
      ],
      adjustmentsTitle: "Practical setup checks",
      adjustments: [
        "Set saddle first, cockpit second",
        "Confirm hoods position before changing stem",
        "Use realistic ride durations for testing",
        "Adjust one parameter at a time",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Should race riders always use aggressive drop?",
          a: "No. If the position is not sustainable, power and control drop. Choose the most aero posture you can hold consistently.",
        },
        {
          q: "How different should endurance setup be?",
          a: "Usually slightly shorter reach and less drop, while keeping efficient pedaling and stable front-end control.",
        },
      ],
      relatedTitle: "Related resources",
      relatedLinks: [
        { href: "/calculators/frame-size", label: "Frame Size Calculator" },
        { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
        { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
      ],
      primaryCta: "Start Free Fit",
      secondaryCta: "Compare Fit Methods",
    },
    nl: {
      seoTitle: "Racefiets fit gids | BestBikeFit4U",
      seoDescription:
        "Praktische racefiets-bikefitting voor comfort en prestaties: zadelhoogte, reach, stuurdrop en verschil tussen endurance en racefocus.",
      seoKeywords: ["racefiets bikefitting", "racefiets positie", "endurance vs race fit"],
      cardTitle: "Racefiets fit gids",
      cardDescription:
        "Vind de balans tussen comfort en snelheid op de weg.",
      h1: "Racefiets fit gids",
      intro:
        "Een goede racefiets-fit is de balans tussen duurzaam comfort en aerodynamische snelheid. De beste positie is de houding die je onder vermoeidheid kunt vasthouden.",
      takeawaysTitle: "Belangrijkste aandachtspunten",
      takeaways: [
        "Stabiel bekken en neutrale zadelondersteuning",
        "Reach die ontspannen schouders mogelijk maakt",
        "Drop afgestemd op flexibiliteit",
        "Doelgerichte houding voor endurance of race",
      ],
      adjustmentsTitle: "Praktische checks",
      adjustments: [
        "Stel eerst zadel af, daarna de cockpit",
        "Controleer remgreeppositie voor stuurpenwissel",
        "Test op realistische ritduur",
        "Pas telkens slechts een parameter aan",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Moet een wedstrijdrijder altijd veel drop rijden?",
          a: "Nee. Als de houding niet houdbaar is, daalt je vermogen en controle. Kies de meest aero positie die je consequent aankunt.",
        },
        {
          q: "Hoeveel verschilt een endurance-opstelling?",
          a: "Meestal iets kortere reach en minder drop, met behoud van efficient trappen en stabiele stuurcontrole.",
        },
      ],
      relatedTitle: "Gerelateerde bronnen",
      relatedLinks: [
        { href: "/calculators/frame-size", label: "Framemaat calculator" },
        { href: "/science/stack-and-reach", label: "Stack en reach gids" },
        { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
      ],
      primaryCta: "Start gratis fit",
      secondaryCta: "Vergelijk fitmethodes",
    },
  },
  {
    slug: "gravel-bike-fit-guide",
    cluster: "discipline",
    en: {
      seoTitle: "Gravel Bike Fit Guide | BestBikeFit4U",
      seoDescription:
        "Gravel bike fitting guide for control, comfort, and long mixed-surface rides with practical setup priorities.",
      seoKeywords: ["gravel bike fit", "gravel bike position", "gravel bike comfort"],
      cardTitle: "Gravel Bike Fit Guide",
      cardDescription:
        "Optimize comfort and handling on mixed terrain.",
      h1: "Gravel Bike Fit Guide",
      intro:
        "Gravel fit needs more control and compliance than a pure road race setup. Your position should absorb terrain without overloading hands, neck, or lower back.",
      takeawaysTitle: "Gravel-fit priorities",
      takeaways: [
        "Stable steering under vibration",
        "Comfortable weight distribution for long rides",
        "Sustainable hand and neck load",
        "Efficient seated and standing transitions",
      ],
      adjustmentsTitle: "Practical setup checks",
      adjustments: [
        "Bias toward control over extreme aero",
        "Verify bar width and hood angle for stability",
        "Moderate drop for rough-surface tolerance",
        "Test fit with real tire pressure and terrain",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Should gravel fit be more upright than road?",
          a: "Usually yes, but degree depends on flexibility, terrain, and event duration.",
        },
        {
          q: "Does handlebar width matter more on gravel?",
          a: "Often yes. Correct width improves leverage and confidence on loose surfaces.",
        },
      ],
      relatedTitle: "Related resources",
      relatedLinks: [
        { href: "/calculators/crank-length", label: "Crank Length Calculator" },
        { href: "/science/bike-fit-methods", label: "Bike Fit Methods" },
        { href: "/guides/mountain-bike-fit-guide", label: "Mountain Bike Fit Guide" },
      ],
      primaryCta: "Start Free Fit",
      secondaryCta: "Open Calculators",
    },
    nl: {
      seoTitle: "Gravel fit gids | BestBikeFit4U",
      seoDescription:
        "Praktische gravel-bikefitting voor meer controle, comfort en duurzame prestaties op gemengd terrein.",
      seoKeywords: ["gravel bikefitting", "gravel positie", "gravel comfort"],
      cardTitle: "Gravel fit gids",
      cardDescription:
        "Optimaliseer comfort en controle op gemengd terrein.",
      h1: "Gravel fit gids",
      intro:
        "Een gravel-fit vraagt meestal meer controle en demping dan een pure racefietsopstelling. Je positie moet terrein opvangen zonder extra belasting op handen, nek en onderrug.",
      takeawaysTitle: "Belangrijkste gravel-prioriteiten",
      takeaways: [
        "Stabiel sturen onder trillingen",
        "Comfortabele gewichtsverdeling op lange ritten",
        "Duurzame belasting van handen en nek",
        "Efficiente overgang tussen zitten en staan",
      ],
      adjustmentsTitle: "Praktische checks",
      adjustments: [
        "Kies eerder voor controle dan extreme aerodynamica",
        "Controleer stuurbreedte en remgreephoek voor stabiliteit",
        "Houd drop gematigd voor ruwer terrein",
        "Test met realistische bandendruk en ondergrond",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Moet een gravel-fit rechter zijn dan op de racefiets?",
          a: "Meestal wel, maar de exacte mate hangt af van flexibiliteit, terrein en ritduur.",
        },
        {
          q: "Is stuurbreedte extra belangrijk bij gravel?",
          a: "Vaak wel. De juiste breedte geeft meer hefboom en vertrouwen op losse ondergrond.",
        },
      ],
      relatedTitle: "Gerelateerde bronnen",
      relatedLinks: [
        { href: "/calculators/crank-length", label: "Cranklengte calculator" },
        { href: "/science/bike-fit-methods", label: "Bikefit methodes" },
        { href: "/guides/mountain-bike-fit-guide", label: "MTB fit gids" },
      ],
      primaryCta: "Start gratis fit",
      secondaryCta: "Open calculators",
    },
  },
  {
    slug: "mountain-bike-fit-guide",
    cluster: "discipline",
    en: {
      seoTitle: "Mountain Bike Fit Guide | BestBikeFit4U",
      seoDescription:
        "Mountain bike fitting guide for control, climbing efficiency, and descending confidence with practical setup priorities.",
      seoKeywords: ["mountain bike fit", "MTB bike fitting", "mtb position"],
      cardTitle: "Mountain Bike Fit Guide",
      cardDescription:
        "Build confidence for climbs, descents, and technical terrain.",
      h1: "Mountain Bike Fit Guide",
      intro:
        "MTB fit must support dynamic movement, not just seated pedaling. Control, balance, and confidence on technical terrain are core outcomes.",
      takeawaysTitle: "MTB-fit priorities",
      takeaways: [
        "Balanced standing position",
        "Efficient seated climbing posture",
        "Predictable front-end control",
        "Reduced hand fatigue on rough trails",
      ],
      adjustmentsTitle: "Practical setup checks",
      adjustments: [
        "Validate saddle height for seated traction climbs",
        "Set cockpit for control before chasing speed",
        "Check lever angle and hand position comfort",
        "Test on your real trail profile",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Is MTB fit very different from road fit?",
          a: "Yes. MTB requires more movement freedom and control-focused cockpit choices.",
        },
        {
          q: "What should I optimize first for trail riding?",
          a: "Start with control and comfort, then fine-tune efficiency once handling is stable.",
        },
      ],
      relatedTitle: "Related resources",
      relatedLinks: [
        { href: "/calculators/frame-size", label: "Frame Size Calculator" },
        { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
        { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
      ],
      primaryCta: "Start Free Fit",
      secondaryCta: "Read Science",
    },
    nl: {
      seoTitle: "MTB fit gids | BestBikeFit4U",
      seoDescription:
        "Praktische MTB-bikefitting voor meer controle, efficiente klimmen en vertrouwen op technische afdalingen.",
      seoKeywords: ["MTB bikefitting", "mountainbike fit", "MTB positie"],
      cardTitle: "MTB fit gids",
      cardDescription:
        "Meer vertrouwen op klimmen, dalen en technisch terrein.",
      h1: "MTB fit gids",
      intro:
        "MTB-fit draait om dynamische controle, niet alleen om zittend trappen. Balans en vertrouwen op technisch terrein zijn cruciaal.",
      takeawaysTitle: "Belangrijkste MTB-prioriteiten",
      takeaways: [
        "Gebalanceerde staande positie",
        "Efficiente zithouding voor klimmen",
        "Voorspelbare stuurcontrole",
        "Minder handvermoeidheid op ruig terrein",
      ],
      adjustmentsTitle: "Praktische checks",
      adjustments: [
        "Controleer zadelhoogte voor klimtractie",
        "Stel cockpit eerst af op controle",
        "Controleer remgreephoek en handcomfort",
        "Test op je eigen trailprofiel",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Verschilt MTB-fit sterk van racefiets-fit?",
          a: "Ja. MTB vraagt meer bewegingsvrijheid en cockpitkeuzes die controle vooropzetten.",
        },
        {
          q: "Wat optimaliseer ik eerst voor trails?",
          a: "Begin met controle en comfort. Optimaliseer daarna pas verder voor efficiency.",
        },
      ],
      relatedTitle: "Gerelateerde bronnen",
      relatedLinks: [
        { href: "/calculators/frame-size", label: "Framemaat calculator" },
        { href: "/science/stack-and-reach", label: "Stack en reach gids" },
        { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
      ],
      primaryCta: "Start gratis fit",
      secondaryCta: "Lees wetenschap",
    },
  },
  {
    slug: "triathlon-bike-fit-guide",
    cluster: "discipline",
    en: {
      seoTitle: "Triathlon Bike Fit Guide | BestBikeFit4U",
      seoDescription:
        "Triathlon bike fitting guide for aerodynamic position that remains sustainable for race distance and run performance.",
      seoKeywords: ["triathlon bike fit", "TT bike fit", "aero position triathlon"],
      cardTitle: "Triathlon Bike Fit Guide",
      cardDescription:
        "Balance aero speed with sustainable race comfort.",
      h1: "Triathlon Bike Fit Guide",
      intro:
        "Triathlon fit is not only about lower drag. The position must be sustainable for your event distance and should not compromise your run excessively.",
      takeawaysTitle: "Triathlon-fit priorities",
      takeaways: [
        "Stable aero posture at target power",
        "Hip angle compatible with your mobility",
        "Sustainable neck and shoulder loading",
        "Transition-friendly setup for run performance",
      ],
      adjustmentsTitle: "Practical setup checks",
      adjustments: [
        "Set saddle and hip support before front-end drop",
        "Adjust extensions for relaxed shoulder position",
        "Validate position at race-intensity intervals",
        "Tune for sustainability before maximum aggression",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Should triathletes always maximize aero drop?",
          a: "No. If the position is unstable or unsustainable, race performance suffers despite theoretical aero gains.",
        },
        {
          q: "How do I know if fit hurts my run?",
          a: "Track post-bike run quality. Excessive hip closure or discomfort often shows up early in transition pace.",
        },
      ],
      relatedTitle: "Related resources",
      relatedLinks: [
        { href: "/science/calculation-engine", label: "Calculation Engine" },
        { href: "/about", label: "How BestBikeFit4U Works" },
        { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      ],
      primaryCta: "Start Free Fit",
      secondaryCta: "Open FAQ",
    },
    nl: {
      seoTitle: "Triathlon fit gids | BestBikeFit4U",
      seoDescription:
        "Praktische triathlon-bikefitting voor een aerodynamische maar duurzame houding die ook je loopprestatie ondersteunt.",
      seoKeywords: ["triathlon bikefitting", "TT fit", "aero houding triathlon"],
      cardTitle: "Triathlon fit gids",
      cardDescription:
        "Combineer aerodynamica met duurzame racecomfort.",
      h1: "Triathlon fit gids",
      intro:
        "Een triathlon-fit draait niet alleen om minimale luchtweerstand. Je houding moet houdbaar zijn voor de raceafstand en je looponderdeel ondersteunen.",
      takeawaysTitle: "Belangrijkste triathlon-prioriteiten",
      takeaways: [
        "Stabiele aero-houding op doelvermogen",
        "Heuphoek passend bij jouw mobiliteit",
        "Duurzame belasting van nek en schouders",
        "Opstelling die overgang naar lopen ondersteunt",
      ],
      adjustmentsTitle: "Praktische checks",
      adjustments: [
        "Stel zadel en heupondersteuning eerst af",
        "Pas extensions aan voor ontspannen schouderpositie",
        "Valideer houding op wedstrijdspecifieke intervallen",
        "Kies eerst houdbaarheid, daarna maximale agressie",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Moet een triatleet altijd maximale aero-drop rijden?",
          a: "Nee. Een instabiele of niet-houdbare houding schaadt je raceprestatie, ook als de positie theoretisch aerodynamischer is.",
        },
        {
          q: "Hoe merk ik dat mijn fit mijn looponderdeel belemmert?",
          a: "Volg je loopkwaliteit direct na de fiets. Te veel heupsluiting of ongemak zie je vaak snel in je overgangstempo.",
        },
      ],
      relatedTitle: "Gerelateerde bronnen",
      relatedLinks: [
        { href: "/science/calculation-engine", label: "Calculation engine" },
        { href: "/about", label: "Hoe BestBikeFit4U werkt" },
        { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      ],
      primaryCta: "Start gratis fit",
      secondaryCta: "Open FAQ",
    },
  },
];

export const GUIDE_SLUGS = GUIDES.map((guide) => guide.slug);

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function getGuideCopy(guide: Guide, locale: Locale): GuideCopy {
  return locale === "nl" ? guide.nl : guide.en;
}

export function getGuideClusterLabel(cluster: Guide["cluster"], locale: Locale): string {
  if (cluster === "pain") {
    return locale === "nl" ? "Klachtgerichte bikefitting" : "Pain-focused bike fitting";
  }

  return locale === "nl" ? "Bikefitting per discipline" : "Bike fitting by discipline";
}
