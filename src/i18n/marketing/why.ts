import type { Locale } from "@/i18n/config";

type BenefitBlock = {
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

export const whyCopy: Record<
  Locale,
  {
    metadata: { title: string; description: string };
    hero: { eyebrow: string; title: string; paragraphs: string[] };
    quotesTitle: string;
    quotesIntro: string;
    quotesOutro: string;
    whyTitle: string;
    whyIntro: string;
    contactPoints: string[];
    whyParagraphs: string[];
    benefitsTitle: string;
    adjustmentsTitle: string;
    adjustmentsIntro: string;
    methodsIntro: string;
    considerTitle: string;
    considerIntro: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaBody: string;
    ctaLabel: string;
    benefits: BenefitBlock[];
    fitAdjustmentItems: string[];
    fitMethodItems: string[];
    considerFitItems: string[];
  }
> = {
  en: {
    metadata: {
      title: "Why a good bike fit matters | BestBikeFit4U",
      description:
        "See why a good bike fit improves comfort, control, efficiency, and " +
        "repeatability, and what a fit actually changes on the bike.",
    },
    hero: {
      eyebrow: "Why bike fit matters",
      title: "Let your bike fit you.",
      paragraphs: [
        "Most riders do not need a new bike to feel better and ride more " +
          "confidently. They need a position that matches their body, flexibility, " +
          "goals, and the terrain they ride.",
        "A proper bike fit turns vague problems into measurable adjustments in " +
          "millimeters and degrees, then confirms those changes on the bike.",
      ],
    },
    quotesTitle: "What riders notice after a proper fit",
    quotesIntro: "These are typical outcomes riders describe after getting their position " + "dialed in:",
    quotesOutro:
      "These are not cosmetic improvements. They map directly to comfort, joint " +
      "load, breathing space, stability, and repeatability.",
    whyTitle: "Why a bike fit works",
    whyIntro:
      "A bike fit is not magic. It is biomechanics and basic physics applied to " + "three contact points:",
    contactPoints: [
      "Feet (cleats, shoes, pedals)",
      "Pelvis (saddle height, setback, tilt, saddle choice)",
      "Hands and upper body (reach, drop, bar shape, hood position)",
    ],
    whyParagraphs: [
      "If one of these contact points is wrong, your body compensates. " +
        "Compensation is what creates many recurring issues: numb hands, knee pain, " +
        "hot foot, neck tightness, low-back fatigue, unstable descending, and " +
        "flat-feeling power on climbs.",
      "Small adjustments matter because the body repeats the same movement " + "thousands of times per hour.",
    ],
    benefitsTitle: "Where a good fit can help.",
    adjustmentsTitle: "What actually gets adjusted in a bike fit",
    adjustmentsIntro: "A fit typically covers:",
    methodsIntro: "Methods and principles commonly used, depending on rider and goal:",
    considerTitle: "When you should consider a fit",
    considerIntro: "A fit is worth considering if you recognize any of these:",
    ctaEyebrow: "Personal recommendations",
    ctaTitle: "Start your free bike fit today",
    ctaBody: "No guesswork. No generic tips. Review fit guidance matched to your body and " + "riding goals.",
    ctaLabel: "Start Free Fit",
    benefits: [
      {
        title: "Reduced pain and overload",
        paragraphs: [
          'Many riders start from a "tolerance-based" position. A fit reduces ' +
            "unnecessary joint stress by aligning the knee-ankle-hip chain and " +
            "stabilizing the pelvis.",
          "Typical wins:",
        ],
        bullets: [
          "Less anterior knee stress from saddle height and cleat changes",
          "Less low-back strain from correcting reach, drop, and pelvic control",
          "Fewer numb hands from better weight distribution and hood position",
        ],
      },
      {
        title: "Better power transfer without forcing an aggressive posture",
        paragraphs: [
          "Comfort and performance are not opposites. The goal is to keep you stable " +
            "so you can push power without sliding, rocking, or bracing through the " +
            "shoulders.",
          "When the pelvis is stable and the feet are supported, the pedal stroke " +
            "becomes more even and efficient.",
        ],
      },
      {
        title: "Better control and confidence",
        paragraphs: ["Handling improves when your center of mass is balanced between saddle and bars."],
        bullets: [
          "Descents with more control and less nervous steering",
          "Rough surfaces with less bouncing and more stability",
          "Long rides with less fatigue-driven wobble",
        ],
      },
      {
        title: "A position that matches your terrain",
        paragraphs: [
          "A good fit is not one fixed setup for everything. The position should " +
            "change with your riding style:",
        ],
        bullets: [
          "Mountain or technical riding: more stability and more room to move",
          "Endurance: comfort-first and sustainable reach",
          "Performance or race: more aerodynamic while keeping the hip angle workable",
          "TT or triathlon: very aero, but sensitive to saddle position, hip angle, " + "and cockpit length",
        ],
      },
      {
        title: "Clarity through repeatable numbers",
        paragraphs: ["A proper fit produces exact values in millimeters and degrees so you can:"],
        bullets: [
          "Rebuild your position after travel or maintenance",
          "Replicate it on a new frame",
          "Fine-tune for different bikes such as road, gravel, or indoor setups",
        ],
      },
    ],
    fitAdjustmentItems: [
      "Saddle height (mm)",
      "Saddle setback (mm)",
      "Saddle tilt (degrees)",
      "Handlebar reach (mm)",
      "Handlebar drop (mm)",
      "Stem length suggestion",
      "Crank length suggestion where relevant",
      "Cleat position",
      "Frame size range based on stack and reach",
    ],
    fitMethodItems: [
      "LeMond as an inseam-based starting point for saddle height",
      "Holmes as a knee-angle validation check",
      "KOPS as a reference point for knee and pedal alignment, not a one-size rule",
      "Stack and reach for frame selection and cockpit balance",
    ],
    considerFitItems: [
      "Recurring discomfort after 60 to 90 minutes",
      "Numb hands, hot foot, or saddle discomfort",
      "Knee pain, hip tightness, or back fatigue",
      "You changed shoes, cleats, saddle, cranks, or bike",
      "You are training more or returning after time off",
      "You want a more aerodynamic position without losing comfort",
    ],
  },
  nl: {
    metadata: {
      title: "Waarom een goede bike fit telt | BestBikeFit4U",
      description:
        "Bekijk waarom een goede bike fit comfort, controle, efficientie en " +
        "herhaalbaarheid verbetert en wat een fit daadwerkelijk op de fiets " +
        "verandert.",
    },
    hero: {
      eyebrow: "Waarom bike fit telt",
      title: "Laat je fiets bij je passen.",
      paragraphs: [
        "De meeste rijders hebben geen nieuwe fiets nodig om zich beter te voelen of " +
          "met meer vertrouwen te rijden. Ze hebben een positie nodig die past bij hun " +
          "lichaam, flexibiliteit, doelen en het terrein waarop ze rijden.",
        "Een goede bike fit vertaalt vage problemen naar meetbare aanpassingen in " +
          "millimeters en graden en controleert die veranderingen daarna op de fiets.",
      ],
    },
    quotesTitle: "Wat rijders merken na een goede fit",
    quotesIntro:
      "Dit zijn typische uitkomsten die rijders beschrijven nadat hun positie " + "beter is afgesteld:",
    quotesOutro:
      "Dit zijn geen cosmetische verbeteringen. Ze raken precies comfort, " +
      "gewrichtsbelasting, ademruimte, stabiliteit en herhaalbaarheid.",
    whyTitle: "Waarom een bike fit werkt",
    whyIntro:
      "Een bike fit is geen magie. Het is biomechanica en basisfysica toegepast op " + "drie contactpunten:",
    contactPoints: [
      "Voeten (schoenplaatjes, schoenen, pedalen)",
      "Bekken (zadelhoogte, setback, tilt, zadelkeuze)",
      "Handen en bovenlichaam (reach, drop, stuurvorm, remgreeppositie)",
    ],
    whyParagraphs: [
      "Als een van deze contactpunten niet klopt, gaat je lichaam compenseren. " +
        "Compensatie veroorzaakt veel terugkerende klachten zoals dove handen, " +
        "kniepijn, brandende voeten en rugvermoeidheid.",
      "Kleine aanpassingen doen ertoe omdat het lichaam dezelfde beweging " +
        "duizenden keren per uur herhaalt.",
    ],
    benefitsTitle: "Waar een goede fit bij kan helpen.",
    adjustmentsTitle: "Wat er daadwerkelijk wordt aangepast in een bike fit",
    adjustmentsIntro: "Een fit behandelt meestal:",
    methodsIntro: "Veelgebruikte methodes en principes, afhankelijk van rijder en doel:",
    considerTitle: "Wanneer een fit logisch is",
    considerIntro: "Een fit is het overwegen waard als je een of meer van deze punten herkent:",
    ctaEyebrow: "Persoonlijke aanbevelingen",
    ctaTitle: "Start vandaag je gratis bike fit",
    ctaBody:
      "Geen giswerk. Geen generieke tips. Bekijk fitbegeleiding die past bij jouw " + "lichaam en rijdoelen.",
    ctaLabel: "Start gratis fit",
    benefits: [
      {
        title: "Minder pijn en overbelasting",
        paragraphs: [
          'Veel rijders vertrekken vanuit een "tolerantiepositie". Een fit verlaagt ' +
            "onnodige gewrichtsbelasting door de knie-enkel-heuplijn beter uit te lijnen " +
            "en het bekken te stabiliseren.",
          "Typische winst:",
        ],
        bullets: [
          "Minder belasting aan de voorkant van de knie",
          "Minder lage-rugspanning door reach en drop beter te balanceren",
          "Minder dove handen door betere gewichtsverdeling",
        ],
      },
      {
        title: "Betere krachtoverdracht zonder geforceerde houding",
        paragraphs: [
          "Comfort en prestaties zijn geen tegenpolen.",
          "Als het bekken stabiel is en de voeten goed ondersteund zijn, wordt de " +
            "pedaalslag gelijkmatiger en efficienter.",
        ],
      },
      {
        title: "Meer controle en vertrouwen",
        paragraphs: [
          "Sturen voelt beter zodra het zwaartepunt evenwichtiger tussen zadel en " + "stuur ligt.",
        ],
        bullets: [
          "Afdalingen met meer controle",
          "Ruwe ondergrond met minder stuiteren",
          "Lange ritten met minder slingeren door vermoeidheid",
        ],
      },
      {
        title: "Een positie die past bij je terrein",
        paragraphs: [
          "Een goede fit is geen vaste setup voor alles. De positie moet veranderen " + "met je rijstijl:",
        ],
        bullets: [
          "Mountainbike of technisch terrein: meer stabiliteit en bewegingsruimte",
          "Endurance: comfort eerst en duurzame reach",
          "Prestatie of koers: aerodynamischer terwijl de heuphoek werkbaar blijft",
          "TT of triathlon: zeer aero, maar gevoelig voor zadelpositie en cockpitlengte",
        ],
      },
      {
        title: "Duidelijkheid door herhaalbare getallen",
        paragraphs: ["Een goede fit levert exacte waarden in millimeters en graden op zodat je:"],
        bullets: [
          "Je positie opnieuw kunt opbouwen na onderhoud of reizen",
          "Die op een nieuw frame kunt reproduceren",
          "Kunt finetunen voor verschillende fietsen zoals race, gravel of indoor",
        ],
      },
    ],
    fitAdjustmentItems: [
      "Zadelhoogte (mm)",
      "Zadelterugstand (mm)",
      "Zadeltilt (graden)",
      "Stuurreach (mm)",
      "Stuurdrop (mm)",
      "Advies voor stuurpenlengte",
      "Advies voor cranklengte waar relevant",
      "Schoenplaatjespositie",
      "Framemaatbereik op basis van stack en reach",
    ],
    fitMethodItems: [
      "LeMond als startpunt voor zadelhoogte",
      "Holmes als controle op kniehoeken",
      "KOPS als referentiepunt, niet als vaste regel",
      "Stack en reach voor framekeuze en cockpitbalans",
    ],
    considerFitItems: [
      "Terugkerend ongemak na 60 tot 90 minuten",
      "Dove handen, brandende voeten of zadelongemak",
      "Kniepijn, heupspanning of rugvermoeidheid",
      "Je veranderde schoenen, schoenplaatjes, zadel, cranks of fiets",
      "Je traint meer of komt terug na een pauze",
      "Je wilt aerodynamischer zitten zonder comfort te verliezen",
    ],
  },
};
