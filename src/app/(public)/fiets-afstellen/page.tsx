import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  CheckCircle2,
  ChevronRight,
  Compass,
  Gauge,
  Info,
  Ruler,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  PublicBreadcrumbs,
  PublicCtaBand,
  PublicFeatureCard,
  PublicHero,
  PublicInfoPanel,
  PublicPageShell,
  PublicSection,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND } from "@/config/brand";
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import type { MarketingEventType } from "@/lib/analytics/marketing";
import {
  buildArticleSchema,
  buildBreadcrumbListSchema,
  buildFaqPageSchema,
} from "@/lib/seo/jsonLd";

type AnchorItem = {
  id: string;
  label: string;
};

type SectionStep = {
  title: string;
  body: string;
};

type FaqItem = {
  q: string;
  a: string;
};

type PageCopy = {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  eyebrow: string;
  title: string;
  intro: string;
  chips: readonly string[];
  anchorTitle: string;
  anchors: AnchorItem[];
  primaryCta: string;
  secondaryCta: string;
  sections: {
    start: {
      eyebrow: string;
      title: string;
      description: string;
      body: string[];
      steps: SectionStep[];
    };
    order: {
      eyebrow: string;
      title: string;
      description: string;
      items: string[];
    };
    saddleHeight: {
      eyebrow: string;
      title: string;
      description: string;
      body: string[];
      highSignals: string[];
      lowSignals: string[];
      inlineCta: string;
    };
    saddlePosition: {
      eyebrow: string;
      title: string;
      description: string;
      body: string[];
      warningTitle: string;
      warningBody: string;
    };
    cockpit: {
      eyebrow: string;
      title: string;
      description: string;
      body: string[];
      signs: string[];
    };
    reachDrop: {
      eyebrow: string;
      title: string;
      description: string;
      body: string[];
      inlineCta: string;
    };
    cleats: {
      eyebrow: string;
      title: string;
      description: string;
      body: string[];
      bullets: string[];
    };
    context: {
      eyebrow: string;
      title: string;
      description: string;
      body: string[];
    };
    fitChoice: {
      eyebrow: string;
      title: string;
      description: string;
      cards: Array<{ title: string; points: string[] }>;
      primaryCta: string;
      secondaryCta: string;
    };
    safety: {
      eyebrow: string;
      title: string;
      body: string;
      bullets: string[];
    };
    faq: {
      eyebrow: string;
      title: string;
      description: string;
      items: FaqItem[];
    };
    bottomCta: {
      eyebrow: string;
      title: string;
      description: string;
      primaryCta: string;
      secondaryCta: string;
    };
  };
};

const pageCopy: Record<Locale, PageCopy> = {
  nl: {
    metadata: {
      title: "Fiets afstellen: zadelhoogte, stuur, reach en bikefitting | BestBikeFit4U",
      description:
        "Leer je fiets praktisch afstellen: zadelhoogte, stuurpositie, reach, stuurdrop en schoenplaatjes. Gebruik daarna de gratis bike fit calculator voor een persoonlijk startpunt.",
      keywords: [
        "fiets afstellen",
        "racefiets afstellen",
        "zadelhoogte afstellen",
        "stuur afstellen racefiets",
        "schoenplaatjes afstellen",
        "reach racefiets",
        "stuurdrop",
        "fietspositie verbeteren",
        "bikefitting",
      ],
    },
    eyebrow: "Praktische bikefitting",
    title: "Fiets afstellen: praktische gids voor een betere fietspositie",
    intro:
      "Je fiets goed afstellen begint niet met losse trucjes, maar met de juiste volgorde. Veel fietsers veranderen tegelijk hun zadel, stuur en schoenplaatjes. Daarna voelt de positie anders, maar is niet meer duidelijk welke aanpassing echt hielp. Op deze pagina lees je hoe je stap voor stap je fiets afstelt, waar je veilig begint en wanneer een calculator of completere bikefitting slimmer is dan verder gokken.",
    chips: ["Zadelhoogte", "Reach", "Stuurdrop", "Schoenplaatjes", "Bikefitting"],
    anchorTitle: "Ga direct naar",
    anchors: [
      { id: "waar-begin-je", label: "Waar begin je?" },
      { id: "afstelvolgorde", label: "Afstelvolgorde" },
      { id: "zadelhoogte-afstellen", label: "Zadelhoogte" },
      { id: "stuur-afstellen-racefiets", label: "Stuur afstellen" },
      { id: "reach-en-stuurdrop", label: "Reach en drop" },
      { id: "schoenplaatjes-afstellen", label: "Schoenplaatjes" },
      { id: "zelf-afstellen-of-bikefitting", label: "Zelf afstellen of bikefitting" },
      { id: "faq", label: "FAQ" },
    ],
    primaryCta: "Open de gratis bike fit calculator",
    secondaryCta: "Bereken eerst je zadelhoogte",
    sections: {
      start: {
        eyebrow: "Eerst structuur",
        title: "Waar begin je met fiets afstellen?",
        description:
          "Fiets afstellen is geen verzameling losse tweaks. Eerst de grote biomechanische hefboompunten, daarna pas de details.",
        body: [
          "Als je je fiets wilt afstellen, begin dan niet bij het stuur en ook niet bij je schoenplaatjes. In de meeste gevallen begin je met de basis van je trapbeweging en bekkencontrole. Dat betekent: eerst zadelhoogte, daarna zadelpositie, daarna pas de cockpit.",
          "De reden is simpel. Je zadel bepaalt hoe je heupen, knieën en enkels bewegen. Als die basis niet klopt, ga je elders compenseren. Dan lijkt het alsof je stuur te ver staat of alsof je plaatjes verkeerd staan, terwijl het echte probleem eerder in je zadelpositie zit.",
          "Een goede afstelvolgorde voorkomt ruis. Je weet beter wat een verandering doet en je verkleint de kans dat je van het ene probleem in het andere valt.",
        ],
        steps: [
          {
            title: "Waarom de afstelvolgorde belangrijk is",
            body: "Een hogere zadelstand verandert je bekkenpositie, en die verandert weer hoe lang je reach aanvoelt. Daarom geeft willekeurig tweaken vaak meer verwarring dan richting.",
          },
          {
            title: "Welke contactpunten het meest beïnvloeden",
            body: "De grootste hefboom zit meestal in zadelhoogte, zadelterugstand, cockpitlengte en stuurhoogte. Schoenplaatjes zijn belangrijk, maar komen meestal later in het proces.",
          },
          {
            title: "Wat je beter niet tegelijk verandert",
            body: "Verander niet tegelijk zadelhoogte én zadelterugstand, of stuurhoogte én stuurpenlengte. Werk in kleine stappen en test telkens eerst één hoofdaanpassing.",
          },
        ],
      },
      order: {
        eyebrow: "Werk van groot naar klein",
        title: "Fiets afstellen in de juiste volgorde",
        description:
          "Voor de meeste fietsers is dit de veiligste en meest logische afstelvolgorde.",
        items: [
          "Zadelhoogte afstellen",
          "Zadelterugstand en zadelkanteling controleren",
          "Reach racefiets beoordelen",
          "Stuurhoogte en stuurdrop afstellen",
          "Stuur afstellen racefiets: hood-positie en rotatie",
          "Schoenplaatjes afstellen",
        ],
      },
      saddleHeight: {
        eyebrow: "Eerste hefboom",
        title: "Zadelhoogte afstellen zonder te gokken",
        description:
          "Zadelhoogte is meestal het eerste contactpunt dat je moet controleren. Niet omdat het alles oplost, maar omdat een fout hier bijna altijd doorwerkt in de rest van je positie.",
        body: [
          "Een goede zadelhoogte geeft je een rustige trapbeweging, voldoende knie-extensie zonder overreiken en een stabieler bekken.",
          "Een te hoog zadel ziet er soms sportief uit, maar is biomechanisch niet automatisch beter. Een te laag zadel voelt soms veiliger, maar kan efficiëntie en comfort beperken.",
          "Zadelhoogte is een startpunt, geen magisch exact getal. Het doel is een bruikbare eerste richting die je daarna op de fiets valideert.",
        ],
        highSignals: [
          "heupen wiegen op het zadel",
          "je moet onderin de pedaalslag naar je tenen wijzen",
          "instabiliteit in het bekken",
          "meer spanning achter de knie of in de hamstrings",
        ],
        lowSignals: [
          "veel kniebuiging",
          "zwaar gevoel in de bovenbenen",
          "compact trapgevoel",
          "minder vrije extensie",
        ],
        inlineCta: "Bereken je zadelhoogte als veilig startpunt",
      },
      saddlePosition: {
        eyebrow: "Daarna positie op het zadel",
        title: "Zadelterugstand en zadelkanteling controleren",
        description:
          "Na zadelhoogte komt de vraag of je goed boven de fiets zit. Dat gaat niet alleen over comfort, maar ook over krachtverdeling en hoeveel druk je op handen en schouders krijgt.",
        body: [
          "Zadelterugstand beïnvloedt de relatie tussen heup en pedaal, hoeveel druk je op je handen krijgt en hoe lang de cockpit aanvoelt.",
          "Zadelkanteling moet meestal subtiel worden behandeld. Grote hoeken zijn zelden een structurele oplossing. Te veel neus omlaag laat je naar voren schuiven; te veel neus omhoog verhoogt vaak ongewenste druk.",
        ],
        warningTitle: "Veelgemaakte fout",
        warningBody:
          "Een zadel ver naar voren of achteren schuiven om een cockpitprobleem op te lossen geeft vaak nieuwe compensaties in bekken, armen of lage rug.",
      },
      cockpit: {
        eyebrow: "Cockpitbalans",
        title: "Stuur afstellen racefiets",
        description:
          "Veel fietsers denken dat hun stuur verkeerd staat, terwijl het echte probleem eerder in de totale cockpitbalans zit. Toch is hier veel comfortwinst te halen, vooral op een racefiets.",
        body: [
          "Stuurhoogte, hood-positie, stuurrotatie en breedte zijn geen onafhankelijke keuzes. Comfort en controle zijn belangrijker dan optisch laag zitten.",
          "Pas nadat zadelhoogte en zadelpositie in grote lijnen kloppen, heeft het zin om stuurdetails te verfijnen.",
        ],
        signs: [
          "veel druk op handen",
          "nek- of schouderspanning",
          "moeite om lang op de hoods te blijven",
          "instabiel bekken",
          "het gevoel dat je jezelf naar het stuur moet trekken",
        ],
      },
      reachDrop: {
        eyebrow: "Lengte en hoogte",
        title: "Reach racefiets en stuurdrop",
        description:
          "Reach en drop bepalen hoeveel lengte en hoogteverschil je duurzaam kunt dragen zonder dat je vorm uit elkaar valt.",
        body: [
          "Reach is niet alleen de afstand tot het stuur. In de praktijk gaat het om hoeveel lengte je romp, schouders en armen duurzaam kunnen dragen zonder spanning, compensatie of verlies van controle.",
          "Stuurdrop is het hoogteverschil tussen zadel en stuur. Dat verschil beïnvloedt rompbelasting, ademruimte en hoe agressief je positie werkelijk is.",
          "Meer drop is alleen logisch als je mobiliteit, core-stabiliteit en belastbaarheid dat ondersteunen. Agressiever is niet automatisch sneller of beter.",
        ],
        inlineCta: "Bekijk je eerste reach- en drop-richting",
      },
      cleats: {
        eyebrow: "Laatste schakel",
        title: "Schoenplaatjes afstellen en waarom dit niet los staat van de rest",
        description:
          "Schoenplaatjes zijn belangrijk voor voetsturing en drukverdeling, maar ze lossen geen verkeerde basispositie op.",
        body: [
          "Schoenplaatjes beïnvloeden waar je druk onder de voet voelt, hoeveel rotatie je knie toestaat en hoe stabiel je voet over de pedaalslag blijft.",
          "Veel fietsers beginnen hier te vroeg. Als zadelhoogte, zadelpositie of cockpit niet kloppen, kunnen plaatjes onmogelijk alles corrigeren.",
        ],
        bullets: [
          "maak geen grote wijzigingen ineens",
          "verander links en rechts niet zonder duidelijke reden",
          "gebruik plaatjes niet als compensatie voor een verkeerde zadel- of cockpitpositie",
        ],
      },
      context: {
        eyebrow: "Niet elke racefietspositie hoeft diep te zijn",
        title: "Racefiets afstellen is niet hetzelfde als elke fiets afstellen",
        description:
          "Een racefiets afstellen vraagt om andere keuzes dan een ontspannen recreatieve positie, maar ook binnen racefietsen is er geen standaardhouding die voor iedereen logisch is.",
        body: [
          "Een endurance-rijder heeft vaak baat bij iets minder reach en minder drop. Een meer prestatiegerichte rijder kan soms meer dragen, maar alleen als belastbaarheid, mobiliteit en core-stabiliteit dat ondersteunen.",
          "De beste positie is de positie die je duurzaam kunt rijden, controleren en herhalen. Niet de positie die er op papier het agressiefst uitziet.",
        ],
      },
      fitChoice: {
        eyebrow: "Praktische vervolgstap",
        title: "Zelf fiets afstellen of toch bikefitting?",
        description:
          "Zelf afstellen is zinvol zolang je weet wat het doel is. Een calculator is slim als je richting zoekt. Een begeleide workflow is logischer als meerdere variabelen tegelijk twijfel oproepen.",
        cards: [
          {
            title: "Zelf afstellen",
            points: [
              "goed voor eerste oriëntatie",
              "werkt alleen goed met kleine stappen",
              "minder geschikt bij meerdere klachten tegelijk",
            ],
          },
          {
            title: "Gratis calculator",
            points: [
              "praktisch startpunt voor zadelhoogte, reach en drop",
              "helpt grotere fouten uitsluiten",
              "snelle publieke intake zonder schijnzekerheid",
            ],
          },
          {
            title: "Dashboard / vervolgstap",
            points: [
              "resultaten opslaan",
              "meerdere fietsen beheren",
              "latere verfijning en opvolging mogelijk maken",
            ],
          },
        ],
        primaryCta: "Start met de gratis bike fit calculator",
        secondaryCta: "Sla je resultaten op in je dashboard",
      },
      safety: {
        eyebrow: "Veiligheid",
        title: "Veiligheid en grenzen van zelf afstellen",
        body:
          "Gebruik online richtlijnen altijd als startpunt, niet als absolute waarheid. Kleine stappen zijn bijna altijd verstandiger dan grote correcties ineens.",
        bullets: [
          "verander niet meerdere contactpunten tegelijk",
          "werk met kleine stappen",
          "forceer geen agressieve houding die je niet duurzaam kunt dragen",
          "test altijd op de fiets onder normale belasting",
          "bij aanhoudende of scherpe pijn is medische beoordeling belangrijker dan verder experimenteren",
        ],
      },
      faq: {
        eyebrow: "Veelgestelde vragen",
        title: "Veelgestelde vragen over fiets afstellen",
        description:
          "Dit zijn de vragen die het vaakst terugkomen wanneer fietsers hun positie zelf willen verbeteren.",
        items: [
          {
            q: "Hoe stel ik mijn fiets af als ik geen professionele bikefitting heb gedaan?",
            a: "Begin met de grote contactpunten: zadelhoogte, zadelpositie, reach en drop. Werk in kleine stappen en verander niet meerdere dingen tegelijk. Gebruik een calculator als startpunt in plaats van volledig op gevoel te werken.",
          },
          {
            q: "Waar moet ik beginnen met fiets afstellen?",
            a: "Meestal begin je met zadelhoogte. Daarna kijk je naar zadelterugstand, dan naar reach en stuurdrop. Schoenplaatjes komen meestal later.",
          },
          {
            q: "Hoe weet ik of mijn zadel te hoog staat?",
            a: "Veelvoorkomende signalen zijn heupwiegelen, teenpunten onderin de pedaalslag, instabiliteit op het zadel en spanning achter de knie of in de hamstrings.",
          },
          {
            q: "Hoe weet ik of mijn zadel te laag staat?",
            a: "Een te laag zadel geeft vaak veel kniebuiging, snel zware bovenbenen en een compact trapgevoel zonder vrije extensie.",
          },
          {
            q: "Wat betekent reach op een racefiets?",
            a: "Reach gaat praktisch over hoeveel cockpitlengte je duurzaam kunt dragen zonder spanning, compensatie of verlies van controle. Het is meer dan alleen een framemaat of een los getal.",
          },
          {
            q: "Hoeveel stuurdrop is verstandig?",
            a: "Er is geen universele juiste drop. Wat logisch is, hangt af van mobiliteit, core-stabiliteit, rijdoel en belastbaarheid. Meer drop is niet automatisch beter.",
          },
          {
            q: "Moet ik eerst mijn stuur of mijn zadel afstellen?",
            a: "Bijna altijd eerst het zadel. Als de basis onder je bekken niet klopt, kun je de cockpit niet goed beoordelen.",
          },
          {
            q: "Wanneer moet ik schoenplaatjes afstellen?",
            a: "Pas nadat de grotere contactpunten redelijk kloppen. Plaatjes kunnen belangrijk zijn, maar lossen een verkeerde zadelhoogte of te lange reach niet op.",
          },
          {
            q: "Kan ik mijn racefiets zelf goed afstellen?",
            a: "Tot op zekere hoogte wel. Voor een eerste orde van grootte is dat haalbaar. Voor complexe klachten of fijnere optimalisatie is een begeleide workflow vaak beter.",
          },
          {
            q: "Wanneer heb ik meer nodig dan alleen zelf afstellen?",
            a: "Als klachten blijven terugkomen, meerdere dingen tegelijk verkeerd aanvoelen, of als je ondanks kleine aanpassingen geen stabiel resultaat krijgt, dan heb je meestal meer aan een completere bikefitting-aanpak.",
          },
        ],
      },
      bottomCta: {
        eyebrow: "Volgende stap",
        title: "Wil je niet blijven gokken?",
        description:
          "Gebruik eerst de gratis bike fit calculator voor een praktische eerste richting in zadelhoogte, reach en drop. Sla daarna je resultaten op en verfijn je setup verder in je dashboard.",
        primaryCta: "Open de gratis bike fit calculator",
        secondaryCta: "Sla je resultaten op in je dashboard",
      },
    },
  },
  en: {
    metadata: {
      title: "Bike setup: saddle height, handlebar reach and bike fitting | BestBikeFit4U",
      description:
        "Learn how to set up your bike in a practical order: saddle height, reach, drop, cockpit and cleats. Then use the free bike fit calculator for a personal starting point.",
      keywords: [
        "bike setup",
        "road bike setup",
        "saddle height setup",
        "road bike handlebar setup",
        "cleat setup",
        "road bike reach",
        "bar drop",
        "improve bike position",
        "bike fitting",
      ],
    },
    eyebrow: "Practical bike fitting",
    title: "Bike setup: a practical guide to a better riding position",
    intro:
      "A good bike setup does not start with random tweaks. It starts with the right order. Many riders change saddle, cockpit, and cleats at the same time and then lose track of what actually helped. This page explains a safer sequence, where to begin, and when a calculator or a fuller bike-fitting workflow is smarter than guessing.",
    chips: ["Saddle height", "Reach", "Bar drop", "Cleats", "Bike fitting"],
    anchorTitle: "Jump to",
    anchors: [
      { id: "where-to-start", label: "Where to start" },
      { id: "setup-order", label: "Setup order" },
      { id: "saddle-height", label: "Saddle height" },
      { id: "road-handlebar-setup", label: "Handlebar setup" },
      { id: "reach-and-drop", label: "Reach and drop" },
      { id: "cleat-setup", label: "Cleats" },
      { id: "self-setup-or-bike-fitting", label: "Self setup or bike fitting" },
      { id: "faq", label: "FAQ" },
    ],
    primaryCta: "Open the free bike fit calculator",
    secondaryCta: "Start with saddle height",
    sections: {
      start: {
        eyebrow: "Start with structure",
        title: "Where should you start with bike setup?",
        description:
          "Bike setup is not a pile of isolated tweaks. First the big biomechanical levers, then the smaller refinements.",
        body: [
          "Do not start with the handlebar and do not start with your cleats. In most cases, you start with the basics of pedaling and pelvic control: saddle height first, then saddle position, then the cockpit.",
          "Your saddle position influences how your hips, knees, and ankles move. If that base is wrong, the rest of the bike will feel misleading.",
          "A clear sequence reduces noise. You understand what each change does and you are less likely to trade one problem for another.",
        ],
        steps: [
          {
            title: "Why the order matters",
            body: "A higher saddle changes pelvic position, and pelvic position changes how long your reach feels. Random tweaking often creates confusion, not clarity.",
          },
          {
            title: "Which contact points matter most",
            body: "The biggest levers are usually saddle height, saddle setback, cockpit length, and handlebar height. Cleats matter, but usually later.",
          },
          {
            title: "What not to change at once",
            body: "Do not change saddle height and setback together, or handlebar height and stem length together. Make one meaningful change at a time.",
          },
        ],
      },
      order: {
        eyebrow: "Work from big to small",
        title: "Bike setup in the right order",
        description: "For most riders, this is the safest and most logical sequence.",
        items: [
          "Adjust saddle height",
          "Check saddle setback and tilt",
          "Assess road-bike reach",
          "Adjust handlebar height and drop",
          "Fine-tune road-bike handlebar setup: hood position and rotation",
          "Adjust cleats",
        ],
      },
      saddleHeight: {
        eyebrow: "First major lever",
        title: "Set saddle height without guessing",
        description:
          "Saddle height is often the first thing to check because errors here usually spill into the rest of your position.",
        body: [
          "A good saddle height gives you a calmer pedal stroke, enough knee extension without overreaching, and a more stable pelvis.",
          "A saddle that is too high can look sporty without being sustainable. A saddle that is too low can feel safer while limiting comfort and efficiency.",
          "Think of saddle height as a starting range, not a magic number.",
        ],
        highSignals: [
          "hips rocking on the saddle",
          "pointing your toes at the bottom of the pedal stroke",
          "pelvic instability",
          "extra tension behind the knee or in the hamstrings",
        ],
        lowSignals: [
          "too much knee bend",
          "heavy-feeling quadriceps",
          "a cramped pedal stroke",
          "less free extension",
        ],
        inlineCta: "Use the saddle-height calculator",
      },
      saddlePosition: {
        eyebrow: "Then position on the saddle",
        title: "Check saddle setback and tilt",
        description:
          "After saddle height, the next question is whether you sit in the right place over the bike.",
        body: [
          "Saddle setback affects hip-to-pedal relationship, hand pressure, and how long the cockpit feels.",
          "Saddle tilt usually needs subtle treatment. Large angles are rarely a true long-term fix.",
        ],
        warningTitle: "Common mistake",
        warningBody:
          "Moving the saddle far forward or back to solve a cockpit problem often creates fresh compensation elsewhere.",
      },
      cockpit: {
        eyebrow: "Cockpit balance",
        title: "Road-bike handlebar setup",
        description:
          "Many riders think the handlebar is the problem when the real issue is the overall cockpit balance.",
        body: [
          "Bar height, hood position, rotation, and width are not independent decisions. Comfort and control matter more than looking low and aggressive.",
          "Only after saddle height and saddle position make sense does it become worthwhile to refine cockpit details.",
        ],
        signs: [
          "too much pressure on the hands",
          "neck or shoulder tension",
          "difficulty staying on the hoods for long",
          "pelvic instability",
          "feeling like you have to pull yourself toward the bar",
        ],
      },
      reachDrop: {
        eyebrow: "Length and height",
        title: "Road-bike reach and bar drop",
        description:
          "Reach and drop determine how much length and height difference you can sustain without your form falling apart.",
        body: [
          "Reach is not just the distance to the handlebar. In practice, it is about how much cockpit length your trunk, shoulders, and arms can carry sustainably.",
          "Bar drop is the height difference between saddle and handlebar. It affects trunk load, breathing room, and how aggressive the position really is.",
          "More drop only makes sense if your mobility, core stability, and durability support it.",
        ],
        inlineCta: "See your first reach and drop direction",
      },
      cleats: {
        eyebrow: "Last link in the chain",
        title: "Cleat setup and why it does not stand alone",
        description:
          "Cleats matter for foot guidance and pressure distribution, but they do not fix a flawed base position.",
        body: [
          "Cleats influence where you feel pressure under the foot, how much rotation the knee tolerates, and how stable the foot stays through the pedal stroke.",
          "Many riders start here too early. If saddle height, saddle position, or cockpit are wrong, cleats cannot solve everything.",
        ],
        bullets: [
          "avoid large changes at once",
          "do not change left and right without a clear reason",
          "do not use cleats to compensate for a wrong saddle or cockpit position",
        ],
      },
      context: {
        eyebrow: "Not every road position should be deep",
        title: "Road-bike setup is still context-dependent",
        description:
          "Road-bike setup asks for different choices than a relaxed recreational position, but even among road riders there is no one standard posture that fits everyone.",
        body: [
          "An endurance rider often benefits from slightly less reach and less drop. A more performance-oriented rider may tolerate more, but only if durability, mobility, and core stability support it.",
          "The best position is the one you can ride, control, and repeat sustainably.",
        ],
      },
      fitChoice: {
        eyebrow: "Practical next step",
        title: "Self-setup or bike fitting?",
        description:
          "Self-setup is useful as long as the goal is clear. A calculator is smart when you need direction. A guided workflow becomes more valuable when several variables are interacting.",
        cards: [
          {
            title: "Self setup",
            points: [
              "good for first orientation",
              "works only with small changes",
              "less suitable when several pain points overlap",
            ],
          },
          {
            title: "Free calculator",
            points: [
              "practical starting point for saddle height, reach, and drop",
              "helps rule out bigger mistakes",
              "fast public intake without fake precision",
            ],
          },
          {
            title: "Dashboard / next step",
            points: [
              "save results",
              "manage more than one bike",
              "refine and revisit the setup later",
            ],
          },
        ],
        primaryCta: "Start with the free bike fit calculator",
        secondaryCta: "Save your results in the dashboard",
      },
      safety: {
        eyebrow: "Safety",
        title: "Safety and limits of self-setup",
        body:
          "Use online guidance as a starting point, not as absolute truth. Small steps are usually smarter than big corrections.",
        bullets: [
          "do not change multiple contact points at once",
          "work in small steps",
          "do not force an aggressive position you cannot sustain",
          "always test changes on the bike under normal load",
          "persistent or sharp pain deserves medical review more than more tweaking",
        ],
      },
      faq: {
        eyebrow: "Frequently asked questions",
        title: "Frequently asked questions about bike setup",
        description:
          "These are the questions riders ask most often when they want to improve their position themselves.",
        items: [
          {
            q: "How should I set up my bike if I have not had a professional fitting?",
            a: "Start with the big contact points: saddle height, saddle position, reach, and drop. Work in small steps and avoid changing multiple variables at once.",
          },
          {
            q: "Where should I start with bike setup?",
            a: "Usually with saddle height. Then look at saddle setback, then reach and bar drop. Cleats typically come later.",
          },
          {
            q: "How do I know if my saddle is too high?",
            a: "Common signs include hip rocking, toe pointing at the bottom of the stroke, instability on the saddle, and tension behind the knee or in the hamstrings.",
          },
          {
            q: "How do I know if my saddle is too low?",
            a: "A saddle that is too low often creates too much knee bend, heavy quads, and a cramped feeling in the pedal stroke.",
          },
          {
            q: "What does reach mean on a road bike?",
            a: "In practice, reach is about how much cockpit length you can sustain without tension, compensation, or loss of control.",
          },
          {
            q: "How much bar drop is sensible?",
            a: "There is no universal correct number. What makes sense depends on mobility, core stability, riding goal, and durability.",
          },
          {
            q: "Should I adjust the handlebar or the saddle first?",
            a: "Almost always the saddle first. If the base under your pelvis is wrong, you cannot judge the cockpit well.",
          },
          {
            q: "When should I adjust cleats?",
            a: "After the larger contact points are reasonably close. Cleats matter, but they do not solve a wrong saddle height or overly long reach.",
          },
          {
            q: "Can I set up my road bike well by myself?",
            a: "Up to a point, yes. A first-pass estimate is realistic. For complex pain patterns or finer optimization, a guided workflow is usually better.",
          },
          {
            q: "When do I need more than self-setup?",
            a: "If pain keeps returning, several things feel wrong at once, or small changes never produce a stable result, you usually need a fuller bike-fitting approach.",
          },
        ],
      },
      bottomCta: {
        eyebrow: "Next step",
        title: "Ready to stop guessing?",
        description:
          "Use the free bike fit calculator for a practical first direction in saddle height, reach, and drop. Then save your results and refine your setup in the dashboard.",
        primaryCta: "Open the free bike fit calculator",
        secondaryCta: "Save your results in the dashboard",
      },
    },
  },
};

const featureIcons = [Bike, Gauge, Compass] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = pageCopy[locale];
  const alternates = buildLocaleAlternates("/fiets-afstellen", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "article",
      url: alternates.canonical,
    },
    alternates,
  };
}

function AnchorNav({ title, items }: { title: string; items: AnchorItem[] }) {
  return (
    <div className="mt-6 rounded-[var(--radius-2xl)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
        {title}
      </p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`#${item.id}`}
            className="whitespace-nowrap rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] transition-colors hover:border-[color:color-mix(in_oklch,var(--primary)_18%,var(--border))] hover:bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--background)_90%)] hover:text-[color:var(--primary)]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--background)] p-4 shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-sm font-semibold text-[color:var(--foreground)]">
            <span>{item.q}</span>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--muted-foreground)] transition-transform group-open:rotate-90" />
          </summary>
          <p className="mt-3 pr-6 text-sm leading-6 text-[color:var(--muted-foreground)]">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}

export default async function BikeSetupPage() {
  const locale = await getRequestLocale();
  const page = pageCopy[locale];
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/fiets-afstellen", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const pageViewEvent = "bike_setup_page_view" as MarketingEventType;

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_26%,var(--background)_74%)_100%)] text-foreground">
      <TrackMarketingEventOnView
        eventType={pageViewEvent}
        locale={locale}
        pagePath={pagePath}
        section="fiets_afstellen"
      />
      <JsonLd
        schema={[
          buildBreadcrumbListSchema([
            { name: isNl ? "Home" : "Home", item: new URL(withLocalePrefix("/", locale), BRAND.siteUrl).toString() },
            { name: page.title, item: pageUrl },
          ]),
          buildArticleSchema({
            headline: page.title,
            description: page.metadata.description,
            url: pageUrl,
            inLanguage: locale,
          }),
          buildFaqPageSchema(page.sections.faq.items),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <PublicBreadcrumbs
          items={[
            { label: isNl ? "Home" : "Home", href: withLocalePrefix("/", locale) },
            { label: page.title },
          ]}
        />

        <PublicHero
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.intro}
          chips={page.chips}
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="fiets_afstellen_hero_primary"
                    ctaLabel={page.primaryCta}
                  />
                }
              >
                {page.primaryCta}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/saddle-height", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="fiets_afstellen_hero_secondary"
                    ctaLabel={page.secondaryCta}
                  />
                }
              >
                {page.secondaryCta}
              </Button>
            </>
          }
        />

        <AnchorNav title={page.anchorTitle} items={page.anchors} />

        <PublicSection
          id={isNl ? "waar-begin-je" : "where-to-start"}
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.start.eyebrow,
            title: page.sections.start.title,
            description: page.sections.start.description,
          }}
        >
          <div className="space-y-4 text-sm leading-7 text-[color:var(--muted-foreground)] sm:text-base">
            {page.sections.start.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {page.sections.start.steps.map((step, index) => {
              const Icon = featureIcons[index] ?? Wrench;
              return (
                <PublicFeatureCard
                  key={step.title}
                  icon={<Icon className="h-5 w-5" />}
                  title={step.title}
                  description={step.body}
                />
              );
            })}
          </div>

          <PublicInfoPanel
            className="mt-6"
            tone="primary"
            icon={<Info />}
            title={isNl ? "Belangrijk" : "Important"}
          >
            {isNl
              ? "Werk van groot naar klein: eerst trapbeweging en bekkencontrole, daarna cockpitbalans, daarna pas detailafstelling."
              : "Work from big to small: first pedaling and pelvic control, then cockpit balance, then the finer details."}
          </PublicInfoPanel>
        </PublicSection>

        <PublicSection
          id={isNl ? "afstelvolgorde" : "setup-order"}
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.order.eyebrow,
            title: page.sections.order.title,
            description: page.sections.order.description,
          }}
        >
          <ol className="grid gap-4 md:grid-cols-2">
            {page.sections.order.items.map((item, index) => (
              <li
                key={item}
                className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--background)] p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
                  {item}
                </p>
              </li>
            ))}
          </ol>
        </PublicSection>

        <PublicSection
          id={isNl ? "zadelhoogte-afstellen" : "saddle-height"}
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.saddleHeight.eyebrow,
            title: page.sections.saddleHeight.title,
            description: page.sections.saddleHeight.description,
          }}
        >
          <div className="space-y-4 text-sm leading-7 text-[color:var(--muted-foreground)] sm:text-base">
            {page.sections.saddleHeight.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[var(--radius-xl)] border border-[color:color-mix(in_oklch,var(--danger)_18%,var(--border))] bg-[color:color-mix(in_oklch,var(--danger)_8%,var(--card)_92%)] p-4">
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                {isNl ? "Signalen dat je zadel te hoog staat" : "Signs your saddle is too high"}
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {page.sections.saddleHeight.highSignals.map((signal) => (
                  <li key={signal} className="flex gap-2">
                    <span className="mt-1 text-[color:var(--danger)]">•</span>
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[color:color-mix(in_oklch,var(--success)_18%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_8%,var(--card)_92%)] p-4">
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                {isNl ? "Signalen dat je zadel te laag staat" : "Signs your saddle is too low"}
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {page.sections.saddleHeight.lowSignals.map((signal) => (
                  <li key={signal} className="flex gap-2">
                    <span className="mt-1 text-[color:var(--success)]">•</span>
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/saddle-height", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="fiets_afstellen_saddle_height_cta"
                  ctaLabel={page.sections.saddleHeight.inlineCta}
                />
              }
            >
              {page.sections.saddleHeight.inlineCta}
            </Button>
          </div>
        </PublicSection>

        <PublicSection
          id="zadelpositie"
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.saddlePosition.eyebrow,
            title: page.sections.saddlePosition.title,
            description: page.sections.saddlePosition.description,
          }}
        >
          <div className="space-y-4 text-sm leading-7 text-[color:var(--muted-foreground)] sm:text-base">
            {page.sections.saddlePosition.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <PublicInfoPanel
            className="mt-6"
            tone="warning"
            icon={<AlertTriangle />}
            title={page.sections.saddlePosition.warningTitle}
          >
            {page.sections.saddlePosition.warningBody}
          </PublicInfoPanel>
        </PublicSection>

        <PublicSection
          id={isNl ? "stuur-afstellen-racefiets" : "road-handlebar-setup"}
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.cockpit.eyebrow,
            title: page.sections.cockpit.title,
            description: page.sections.cockpit.description,
          }}
        >
          <div className="space-y-4 text-sm leading-7 text-[color:var(--muted-foreground)] sm:text-base">
            {page.sections.cockpit.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_84%,var(--background)_16%)] p-4">
            <h3 className="text-base font-semibold text-[color:var(--foreground)]">
              {isNl ? "Signalen dat je cockpit te lang of te laag is" : "Signs your cockpit is too long or too low"}
            </h3>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {page.sections.cockpit.signs.map((sign) => (
                <li key={sign} className="flex gap-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                  <span className="mt-1 text-[color:var(--primary)]">•</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>
        </PublicSection>

        <PublicSection
          id={isNl ? "reach-en-stuurdrop" : "reach-and-drop"}
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.reachDrop.eyebrow,
            title: page.sections.reachDrop.title,
            description: page.sections.reachDrop.description,
          }}
        >
          <div className="space-y-4 text-sm leading-7 text-[color:var(--muted-foreground)] sm:text-base">
            {page.sections.reachDrop.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              {isNl ? "Wil je de relatie tussen framevorm en cockpit nog scherper begrijpen? Bekijk dan de " : "If you want to understand the frame-to-cockpit relationship in more detail, see the "}
              <Link
                href={withLocalePrefix("/science/stack-and-reach", locale)}
                className="font-medium text-[color:var(--primary)] underline-offset-4 hover:underline"
              >
                {isNl ? "stack en reach-pagina" : "stack and reach page"}
              </Link>
              .
            </p>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="fiets_afstellen_reach_drop_cta"
                  ctaLabel={page.sections.reachDrop.inlineCta}
                />
              }
            >
              {page.sections.reachDrop.inlineCta}
            </Button>
          </div>
        </PublicSection>

        <PublicSection
          id={isNl ? "schoenplaatjes-afstellen" : "cleat-setup"}
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.cleats.eyebrow,
            title: page.sections.cleats.title,
            description: page.sections.cleats.description,
          }}
        >
          <div className="space-y-4 text-sm leading-7 text-[color:var(--muted-foreground)] sm:text-base">
            {page.sections.cleats.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <ul className="mt-6 space-y-2 rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--background)] p-4 text-sm leading-6 text-[color:var(--muted-foreground)]">
            {page.sections.cleats.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="mt-1 text-[color:var(--primary)]">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </PublicSection>

        <PublicSection
          id="racefiets-afstellen"
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.context.eyebrow,
            title: page.sections.context.title,
            description: page.sections.context.description,
          }}
        >
          <div className="space-y-4 text-sm leading-7 text-[color:var(--muted-foreground)] sm:text-base">
            {page.sections.context.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              {isNl ? "Wil je eerst begrijpen hoe de methode achter deze keuzes werkt? Lees dan meer op " : "If you want to understand the method behind these choices first, read more on "}
              <Link
                href={withLocalePrefix("/science/bike-fit-methods", locale)}
                className="font-medium text-[color:var(--primary)] underline-offset-4 hover:underline"
              >
                {isNl ? "deze bikefitting-methodespagina" : "this bike-fitting methods page"}
              </Link>
              .
            </p>
          </div>
        </PublicSection>

        <PublicSection
          id={isNl ? "zelf-afstellen-of-bikefitting" : "self-setup-or-bike-fitting"}
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.fitChoice.eyebrow,
            title: page.sections.fitChoice.title,
            description: page.sections.fitChoice.description,
          }}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {page.sections.fitChoice.cards.map((card) => (
              <div
                key={card.title}
                className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--background)] p-4 shadow-sm"
              >
                <h3 className="text-base font-semibold text-[color:var(--foreground)]">{card.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {card.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[color:var(--primary)]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="fiets_afstellen_fit_choice_primary"
                  ctaLabel={page.sections.fitChoice.primaryCta}
                />
              }
            >
              {page.sections.fitChoice.primaryCta}
            </Button>
            <Button
              variant="outline"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="fiets_afstellen_fit_choice_secondary"
                  ctaLabel={page.sections.fitChoice.secondaryCta}
                />
              }
            >
              {page.sections.fitChoice.secondaryCta}
            </Button>
          </div>
        </PublicSection>

        <PublicSection
          id="veiligheid"
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.safety.eyebrow,
            title: page.sections.safety.title,
            description: page.sections.safety.body,
          }}
        >
          <PublicInfoPanel tone="warning" icon={<ShieldCheck />} title={page.sections.safety.title}>
            <ul className="space-y-2">
              {page.sections.safety.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-1 text-[color:var(--warning)]">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </PublicInfoPanel>
        </PublicSection>

        <PublicSection
          id="faq"
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.faq.eyebrow,
            title: page.sections.faq.title,
            description: page.sections.faq.description,
          }}
        >
          <FaqList items={page.sections.faq.items} />
        </PublicSection>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href={withLocalePrefix("/guides", locale)}
            className="group rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm transition-colors hover:border-[color:color-mix(in_oklch,var(--primary)_18%,var(--border))] hover:bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card)_92%)]"
          >
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              {isNl ? "Verder lezen in de gidsenbibliotheek" : "Continue in the guides library"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
              {isNl
                ? "Lees verder over kniepijn, lage rugklachten, racefietspositie en andere setupvragen."
                : "Read more about knee pain, low-back discomfort, road-bike position, and other setup topics."}
            </p>
          </Link>
          <Link
            href={withLocalePrefix("/measurement-guide", locale)}
            className="group rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm transition-colors hover:border-[color:color-mix(in_oklch,var(--primary)_18%,var(--border))] hover:bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card)_92%)]"
          >
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              {isNl ? "Controleer eerst je meetmethode" : "Check your measurement method first"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
              {isNl
                ? "Gebruik de meetgids als je onzeker bent over binnenbeenlengte, framelogica of basisinput."
                : "Use the measurement guide if you are unsure about inseam, frame logic, or your base inputs."}
            </p>
          </Link>
        </div>

        <PublicCtaBand
          className="mt-10"
          eyebrow={page.sections.bottomCta.eyebrow}
          title={page.sections.bottomCta.title}
          description={page.sections.bottomCta.description}
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="fiets_afstellen_bottom_primary"
                    ctaLabel={page.sections.bottomCta.primaryCta}
                  />
                }
              >
                {page.sections.bottomCta.primaryCta}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="fiets_afstellen_bottom_secondary"
                    ctaLabel={page.sections.bottomCta.secondaryCta}
                  />
                }
              >
                {page.sections.bottomCta.secondaryCta}
              </Button>
            </>
          }
          aside={
            <div className="space-y-1">
              <p>
                {isNl
                  ? "Wil je ook zadelhoogte, reach en drop per fiets bewaren?"
                  : "Want to save saddle height, reach, and drop per bike?"}
              </p>
              <p className="font-medium text-[color:var(--foreground)]">
                {isNl
                  ? "Begin publiek, verfijn daarna in je account."
                  : "Start publicly, then refine it inside your account."}
              </p>
            </div>
          }
        />

        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link
            href={withLocalePrefix("/calculators/frame-size", locale)}
            className="inline-flex items-center gap-1 text-[color:var(--primary)] transition-colors hover:text-[color:color-mix(in_oklch,var(--primary)_88%,black_12%)]"
          >
            <Ruler className="h-4 w-4" />
            {isNl ? "Framemaat calculator" : "Frame size calculator"}
          </Link>
          <Link
            href={withLocalePrefix("/calculators/crank-length", locale)}
            className="inline-flex items-center gap-1 text-[color:var(--primary)] transition-colors hover:text-[color:color-mix(in_oklch,var(--primary)_88%,black_12%)]"
          >
            <ArrowRight className="h-4 w-4" />
            {isNl ? "Cranklengte calculator" : "Crank length calculator"}
          </Link>
          <Link
            href={withLocalePrefix("/how-it-works", locale)}
            className="inline-flex items-center gap-1 text-[color:var(--primary)] transition-colors hover:text-[color:color-mix(in_oklch,var(--primary)_88%,black_12%)]"
          >
            <Wrench className="h-4 w-4" />
            {isNl ? "Hoe het werkt" : "How it works"}
          </Link>
        </div>
      </div>
    </PublicPageShell>
  );
}
