import type { Locale } from "@/i18n/config";
import { isProtectedAppPath } from "@/i18n/navigation";
import type { GuideBacklogEntry } from "./backlog";

export type GuideSection = {
  title: string;
  items: string[];
};

export type GuideFaq = {
  q: string;
  a: string;
};

export function getGuideLinkLabel(path: string, locale: Locale): string {
  const normalized = path.replace(/^\/(en|nl)/, "");

  const lookup: Record<string, { en: string; nl: string }> = {
    "/about": {
      en: "How BestBikeFit4U Works",
      nl: "Hoe BestBikeFit4U werkt",
    },
    "/science/bike-fit-methods": {
      en: "Bike Fitting Methods Explained",
      nl: "Bikefit-methodes uitgelegd",
    },
    "/science/stack-and-reach": {
      en: "Stack and Reach Explained",
      nl: "Stack en reach uitgelegd",
    },
    "/faq": { en: "FAQ", nl: "FAQ" },
    "/measurement-guide": { en: "Measurement Guide", nl: "Meetgids" },
    "/calculators/bike-fit": {
      en: "Bike Fit Calculator",
      nl: "Bike fit calculator",
    },
    "/calculators/saddle-height": {
      en: "Saddle Height Calculator",
      nl: "Zadelhoogte calculator",
    },
    "/calculators/frame-size": {
      en: "Frame Size Calculator",
      nl: "Framemaat calculator",
    },
    "/calculators/crank-length": {
      en: "Crank Length Calculator",
      nl: "Cranklengte calculator",
    },
    "/calculators/fuel-hydration": {
      en: "Fuel & Hydration Planner",
      nl: "Brandstof- en hydratatieplanner",
    },
    "/calculators/ftp-wkg": {
      en: "FTP / W/kg Calculator",
      nl: "FTP- / W/kg-calculator",
    },
    "/calculators/power-speed": {
      en: "Power / Speed Estimator",
      nl: "Power- / snelheidsschatting",
    },
    "/calculators/climb-planner": {
      en: "Climb Planner",
      nl: "Klimplanner",
    },
    "/dashboard/shoe-cleat-fit": {
      en: "Shoe / Cleat Fit Module",
      nl: "Schoen- / cleatmodule",
    },
    "/bikes/compare-fit": {
      en: "Compare Bikes",
      nl: "Fietsen vergelijken",
    },
  };

  if (lookup[normalized]) {
    return lookup[normalized][locale];
  }

  if (normalized.startsWith("/guides/")) {
    const slug = normalized.replace("/guides/", "");
    return slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return normalized;
}

export function resolveGuidePrimaryCta(path: string, locale: Locale) {
  if (isProtectedAppPath(path)) {
    return {
      href: "/login",
      label:
        locale === "nl"
          ? "Maak account aan of log in"
          : "Create account or sign in",
    };
  }

  return {
    href: path,
    label: null,
  };
}

function labels(locale: Locale) {
  if (locale === "nl") {
    return {
      intro: "Intro",
      commonProblems: "Veelvoorkomende problemen of klachten",
      likelyCauses: "Waarschijnlijke fitgerelateerde oorzaken",
      checkFirst: "Wat je eerst controleert",
      adjustCarefully: "Wat je voorzichtig kunt aanpassen",
      avoidBlindChanges: "Wat je niet blind moet veranderen",
      getHelpWhen: "Wanneer je hulp op locatie of medisch advies nodig hebt",
      faq: "FAQ",
      related: "Gerelateerde gidsen en tools",
      hubIntro: "Waar deze hub voor is",
      hubUse: "Hoe je deze hub gebruikt",
      nextStep: "Volgende stap",
      relatedDefault: "Open de volgende relevante pagina in deze gidsenbibliotheek.",
    };
  }

  return {
    intro: "Intro",
    commonProblems: "Common problems or rider symptoms",
    likelyCauses: "Likely fit-related causes",
    checkFirst: "What to check first",
    adjustCarefully: "What to adjust carefully",
    avoidBlindChanges: "What not to change blindly",
    getHelpWhen: "When to get in-person or medical help",
    faq: "FAQ",
    related: "Related guides and tools",
    hubIntro: "What this hub covers",
    hubUse: "How to use this hub",
    nextStep: "Next step",
    relatedDefault: "Open the next relevant page in this guide library.",
  };
}

export function buildHubIntro(entry: GuideBacklogEntry, locale: Locale): string[] {
  if (locale === "nl") {
    return [
      `${entry.h1} groepeert de belangrijkste pagina's in dit cluster zodat rijders sneller van een vaag probleem naar een bruikbare volgende stap kunnen gaan.`,
      `Gebruik deze hub als navigatiepagina en als inhoudelijke start: lees de samenvattingen, open de best passende child-pagina en gebruik daarna ${getGuideLinkLabel(entry.primaryCtaTarget, locale).toLowerCase()} om verder te gaan.`,
    ];
  }

  return [
    `${entry.h1} groups the most important pages in this cluster so riders can move faster from a vague problem toward a useful next step.`,
    `Use this hub as both navigation and context: scan the summaries, open the child page that best matches your question, then continue into ${getGuideLinkLabel(entry.primaryCtaTarget, locale).toLowerCase()} when you are ready to act.`,
  ];
}

export function buildLeafSections(entry: GuideBacklogEntry, locale: Locale): GuideSection[] {
  const t = labels(locale);
  const primaryTool = getGuideLinkLabel(entry.primaryCtaTarget, locale);
  const related = entry.internalLinkTargets.map((href) => getGuideLinkLabel(href, locale));

  if (locale === "nl") {
    return [
      {
        title: t.intro,
        items: [
          `${entry.pageBrief} Deze pagina helpt je de fitlogica achter dit onderwerp te begrijpen zonder te doen alsof één wijziging altijd het hele probleem oplost.`,
          `Gebruik de informatie hier om je checks te ordenen, conservatief te testen en daarna ${primaryTool.toLowerCase()} of het dashboard te gebruiken voor preciezere vervolgstappen.`,
        ],
      },
      {
        title: t.commonProblems,
        items: [
          `Rijders merken vaak dat ${entry.pageTitle.toLowerCase()} pas een duidelijk thema wordt wanneer discomfort; vermogensverlies of instabiliteit terugkeert onder vermoeidheid.`,
          "Klachten zijn vaak contextafhankelijk: duur; intensiteit; terrein en recente setupwijzigingen bepalen mee wat je voelt.",
          "Wat op één rit acceptabel lijkt kan op langere of hardere sessies alsnog een duidelijke limiter worden.",
        ],
      },
      {
        title: t.likelyCauses,
        items: [
          "Meestal speelt niet één losse maat mee maar de combinatie van support; belasting en hoe verschillende contactpunten elkaar beïnvloeden.",
          `Bij dit onderwerp zijn de meest logische vervolgstappen meestal gekoppeld aan ${related.slice(0, 2).join(" en ")}.`,
          "Ook trainingsbelasting; vermoeidheid en verwachtingsmanagement kunnen verklaren waarom een setup in theorie klopt maar in de praktijk niet werkt.",
        ],
      },
      {
        title: t.checkFirst,
        items: [
          "Controleer eerst of de basisinput klopt: metingen; symmetrie; recente materiaalwissels en of het probleem nieuw of terugkerend is.",
          "Gebruik steeds dezelfde route of context om te testen, zodat je verschil voelt op basis van de wijziging en niet door andere omstandigheden.",
          `Bekijk daarna de gerelateerde pagina's voor de eerste prioriteiten: ${related.slice(0, 3).join(", ")}.`,
        ],
      },
      {
        title: t.adjustCarefully,
        items: [
          "Werk in kleine stappen en verander bij voorkeur maar één relevante variabele tegelijk.",
          "Valideer een aanpassing op echte rijbelasting en niet alleen op stilstaand gevoel in de garage.",
          `Gebruik ${primaryTool.toLowerCase()} wanneer je van context naar een concretere eerste richtwaarde wilt gaan.`,
        ],
      },
      {
        title: t.avoidBlindChanges,
        items: [
          "Ga niet meerdere contactpunten tegelijk aanpassen als je nog niet weet welke factor het probleem echt drijft.",
          "Volg geen agressievere setup alleen omdat die sneller oogt of online vaak wordt herhaald.",
          "Negeer geen signalen die ook buiten de fiets terugkomen of duidelijk asymmetrisch worden.",
        ],
      },
      {
        title: t.getHelpWhen,
        items: [
          "Zoek een fitter op locatie wanneer meerdere fitfactoren tegelijk conflicteren of wanneer componentkeuze een groot financieel gevolg heeft.",
          "Zoek medische hulp bij scherpe; uitstralende of blijvende pijn; gevoelloosheid buiten de rit; zwelling of weefselproblemen.",
        ],
      },
    ];
  }

  return [
    {
      title: t.intro,
      items: [
        `${entry.pageBrief} This page is meant to help you understand the fit logic behind the topic without pretending that one tweak always solves the whole problem.`,
        `Use the guidance here to organize your checks, test conservatively, and then move into ${primaryTool.toLowerCase()} or the dashboard for more precise next steps.`,
      ],
    },
    {
      title: t.commonProblems,
      items: [
        `Riders usually notice that ${entry.pageTitle.toLowerCase()} becomes a real issue only when discomfort, power loss, or instability keeps returning under fatigue.`,
        "Symptoms are often context-dependent: duration, intensity, terrain, and recent setup changes all shape what the rider feels.",
        "A position that seems acceptable on one ride can still become a clear limiter on longer or harder sessions.",
      ],
    },
    {
      title: t.likelyCauses,
      items: [
        "The main driver is usually not one isolated measurement but the interaction between support, load, and how multiple contact points affect each other.",
        `For this topic, the most logical next checks usually connect back to ${related.slice(0, 2).join(" and ")}.`,
        "Training load, fatigue, and unrealistic expectations can also explain why a setup looks fine in theory but still does not work in practice.",
      ],
    },
    {
      title: t.checkFirst,
      items: [
        "Verify the baseline first: measurements, symmetry, recent equipment changes, and whether the issue is new or recurring.",
        "Use the same route or session context when testing so you feel the change itself rather than random variation.",
        `Then review the first-priority related pages: ${related.slice(0, 3).join(", ")}.`,
      ],
    },
    {
      title: t.adjustCarefully,
      items: [
        "Work in small steps and change only one relevant variable at a time whenever possible.",
        "Validate changes under real riding load rather than garage feel alone.",
        `Use ${primaryTool.toLowerCase()} when you want to move from context into a more concrete first-pass recommendation.`,
      ],
    },
    {
      title: t.avoidBlindChanges,
      items: [
        "Do not change multiple contact points at once if you still do not know which factor is driving the issue.",
        "Do not chase a more aggressive setup just because it looks faster or is repeated online.",
        "Do not ignore symptoms that persist off the bike or become clearly one-sided.",
      ],
    },
    {
      title: t.getHelpWhen,
      items: [
        "Get in-person fit help when several fit variables are conflicting at once or when component choice has meaningful cost or risk.",
        "Get medical help for sharp, radiating, or persistent pain, numbness that lasts beyond the ride, swelling, or tissue problems.",
      ],
    },
  ];
}

export function buildFaqs(entry: GuideBacklogEntry, locale: Locale): GuideFaq[] {
  const tool = getGuideLinkLabel(entry.primaryCtaTarget, locale);

  if (locale === "nl") {
    return [
      {
        q: `Is ${entry.pageTitle.toLowerCase()} altijd puur een fitprobleem?`,
        a: "Nee. Fit is vaak een belangrijke factor, maar trainingsbelasting, herstel, schoenen, terrein of medische factoren kunnen tegelijk meespelen.",
      },
      {
        q: "Wat pas ik als eerste aan?",
        a: `Begin met de grootste en best herhaalbare factor, en gebruik daarna ${tool.toLowerCase()} om een veiligere eerste richtlijn te krijgen.`,
      },
    ];
  }

  return [
    {
      q: `Is ${entry.pageTitle.toLowerCase()} always purely a fit problem?`,
      a: "No. Fit is often a major factor, but training load, recovery, shoes, terrain, or medical issues can contribute at the same time.",
    },
    {
      q: "What should I change first?",
      a: `Start with the biggest and most repeatable factor, then use ${tool.toLowerCase()} to get a safer first-pass direction.`,
    },
  ];
}

export function relatedLinkDescription(locale: Locale) {
  return labels(locale).relatedDefault;
}
