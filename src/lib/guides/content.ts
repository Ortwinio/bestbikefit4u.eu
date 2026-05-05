import "server-only";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { Locale } from "@/i18n/config";
import { isProtectedAppPath } from "@/i18n/navigation";
import {
  getGuideChildren,
  getGuideEntryBySlug,
  type GuideBacklogEntry,
} from "./backlog";
import { getGuideContent } from "./guide-content";
import { getGuideQuickAnswer } from "./quick-answers";

export { getGuideContent } from "./guide-content";

export type GuideSection = {
  title: string;
  type?: "cards" | "steps" | "prose" | "table";
  items: string[];
  tableHeaders?: string[];
  tableRows?: string[][];
};

export type GuideFaq = {
  q: string;
  a: string;
};

export type GuideQuickAnswer = {
  keyTakeaway: string;
  commonMistake: string;
  payAttention: string;
};

type GuideRecord = Doc<"guidePages">;
type RedirectRecord = Doc<"redirects">;

export type GuidePageData = {
  source: "db" | "fallback";
  dbGuide: GuideRecord | null;
  entry: GuideBacklogEntry;
  childPages: GuideBacklogEntry[];
  isHub: boolean;
  faqs: GuideFaq[];
  leafSections: GuideSection[];
  quickAnswer: GuideQuickAnswer;
  hubQuickAnswer: GuideQuickAnswer;
};

const GUIDE_INTERNAL_LINK_OVERRIDES: Partial<Record<string, string[]>> = {
  guides: ["/calculators/bike-fit", "/calculators/saddle-height", "/pain", "/science/stack-and-reach"],
  "bike-fitting-for-knee-pain": [
    "/calculators/saddle-height",
    "/calculators/bike-fit",
    "/measurement-guide",
    "/guides/bike-fitting-for-lower-back-pain",
  ],
  "bike-fitting-for-lower-back-pain": [
    "/science/stack-and-reach",
    "/calculators/frame-size",
    "/calculators/bike-fit",
    "/guides/road-bike-fit-guide",
  ],
  "road-bike-fit-guide": [
    "/calculators/bike-fit",
    "/calculators/frame-size",
    "/science/stack-and-reach",
    "/calculators/saddle-height",
  ],
  "gravel-bike-fit-guide": [
    "/calculators/bike-fit",
    "/calculators/saddle-height",
    "/guides/road-bike-fit-guide",
    "/guides/mountain-bike-fit-guide",
  ],
  "mountain-bike-fit-guide": [
    "/calculators/bike-fit",
    "/calculators/crank-length",
    "/guides/gravel-bike-fit-guide",
    "/guides/road-bike-fit-guide",
  ],
  "triathlon-bike-fit-guide": [
    "/calculators/bike-fit",
    "/science/stack-and-reach",
    "/calculators/frame-size",
    "/guides/road-bike-fit-guide",
  ],
};

function stripLocalePrefix(path: string): string {
  return path.replace(/^\/(en|nl)(?=\/|$)/, "") || "/";
}

function normalizeGuidePath(path: string): string {
  const normalized = stripLocalePrefix(path).trim();
  if (!normalized) {
    return "/";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function localizeBilingualValue(
  value: { en: string; nl: string } | undefined,
  locale: Locale
): string | undefined {
  return value?.[locale];
}

function buildGuideEntryFromDb(
  slug: string,
  locale: Locale,
  dbGuide: GuideRecord,
  fallbackEntry?: GuideBacklogEntry
): GuideBacklogEntry {
  return {
    order: fallbackEntry?.order ?? 0,
    cluster: dbGuide.cluster || fallbackEntry?.cluster || "Guides",
    status: dbGuide.status,
    path: normalizeGuidePath(dbGuide.path || fallbackEntry?.path || `/guides/${slug}`),
    slug: dbGuide.slug || fallbackEntry?.slug || slug,
    pageTitle:
      localizeBilingualValue(dbGuide.pageTitle, locale) ??
      fallbackEntry?.pageTitle ??
      slug,
    metaTitle:
      localizeBilingualValue(dbGuide.metaTitle, locale) ??
      fallbackEntry?.metaTitle ??
      slug,
    h1:
      localizeBilingualValue(dbGuide.h1, locale) ??
      fallbackEntry?.h1 ??
      slug,
    pageBrief:
      localizeBilingualValue(dbGuide.pageBrief, locale) ??
      fallbackEntry?.pageBrief ??
      "",
    primaryCtaLabel:
      localizeBilingualValue(dbGuide.primaryCtaLabel, locale) ??
      fallbackEntry?.primaryCtaLabel ??
      (locale === "nl" ? "Open volgende stap" : "Open next step"),
    primaryCtaTarget:
      normalizeGuidePath(
        dbGuide.primaryCtaTarget || fallbackEntry?.primaryCtaTarget || "/guides"
      ),
    internalLinkTargets:
      GUIDE_INTERNAL_LINK_OVERRIDES[slug] ??
      dbGuide.relatedGuidePaths?.map(normalizeGuidePath) ??
      fallbackEntry?.internalLinkTargets ??
      [],
    notes: fallbackEntry?.notes ?? "",
  };
}

function buildDbQuickAnswer(
  dbGuide: GuideRecord,
  locale: Locale
): GuideQuickAnswer | null {
  if (!dbGuide.quickAnswer) {
    return null;
  }

  return {
    keyTakeaway: dbGuide.quickAnswer.keyTakeaway[locale],
    commonMistake: dbGuide.quickAnswer.commonMistake[locale],
    payAttention: dbGuide.quickAnswer.payAttention[locale],
  };
}

export async function getPublishedGuideRecord(
  slug: string
): Promise<GuideRecord | null> {
  try {
    return (await fetchQuery(api.guides.queries.getPublishedGuide, {
      slug,
    })) as GuideRecord | null;
  } catch {
    return null;
  }
}

export async function listPublishedGuideRecords(): Promise<GuideRecord[]> {
  try {
    return (await fetchQuery(
      api.guides.queries.listPublishedGuides,
      {}
    )) as GuideRecord[];
  } catch {
    return [];
  }
}

export async function listPublicGuideRedirectRecords(): Promise<RedirectRecord[]> {
  try {
    return (await fetchQuery(
      api.guides.queries.listPublicRedirects,
      {}
    )) as RedirectRecord[];
  } catch {
    return [];
  }
}

export async function getDraftGuideRecord(
  id: string
): Promise<GuideRecord | null> {
  try {
    const token = await convexAuthNextjsToken();
    if (!token) {
      return null;
    }

    return (await fetchQuery(
      api.guides.queries.getDraftGuide,
      { id: id as Id<"guidePages"> },
      { token }
    )) as GuideRecord | null;
  } catch {
    return null;
  }
}

export async function getGuidePageData(
  slug: string,
  locale: Locale,
  draftGuideId?: string
): Promise<GuidePageData | null> {
  const fallbackEntry = getGuideEntryBySlug(slug, locale);
  const draftGuide = draftGuideId ? await getDraftGuideRecord(draftGuideId) : null;
  const dbGuide =
    draftGuide && draftGuide.slug === slug
      ? draftGuide
      : await getPublishedGuideRecord(slug);

  if (!dbGuide && !fallbackEntry) {
    return null;
  }

  const entry = dbGuide
    ? buildGuideEntryFromDb(slug, locale, dbGuide, fallbackEntry)
    : fallbackEntry;

  if (!entry) {
    return null;
  }

  const childPages = getGuideChildren(entry.slug, locale);
  const isHub = childPages.length > 0;
  const dbQuickAnswer = dbGuide ? buildDbQuickAnswer(dbGuide, locale) : null;
  const faqs = dbGuide?.faqs?.[locale] ?? buildFaqs(entry, locale);
  const leafSections = dbGuide?.body?.[locale] ?? buildLeafSections(entry, locale);
  const quickAnswer = dbQuickAnswer ?? buildQuickAnswer(entry, locale);
  const hubQuickAnswer =
    dbQuickAnswer ?? buildHubQuickAnswer(entry, locale, childPages.length);

  return {
    source: dbGuide ? "db" : "fallback",
    dbGuide,
    entry,
    childPages,
    isHub,
    faqs,
    leafSections,
    quickAnswer,
    hubQuickAnswer,
  };
}

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
    "/guides": { en: "Bike Fitting Guides", nl: "Bikefitting gidsen" },
    "/pain": {
      en: "Bike Fit for Common Pain Points",
      nl: "Bikefit bij veelvoorkomende klachten",
    },
    "/how-it-works": { en: "How BestBikeFit4U Works", nl: "Hoe BestBikeFit4U werkt" },
    "/why-bikefit-matters": {
      en: "Why Bike Fit Matters",
      nl: "Waarom bike fit telt",
    },
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

export function buildHubQuickAnswer(
  entry: GuideBacklogEntry,
  locale: Locale,
  childCount: number
): GuideQuickAnswer {
  const authoredQuickAnswer = getGuideQuickAnswer(entry.slug, locale);

  if (authoredQuickAnswer) {
    return authoredQuickAnswer;
  }

  const primaryTool = getGuideLinkLabel(entry.primaryCtaTarget, locale).toLowerCase();

  if (locale === "nl") {
    return {
      keyTakeaway: `${entry.pageBrief} Gebruik deze hub om sneller van onderwerpselectie naar een bruikbare volgende stap te gaan.`,
      commonMistake:
        "Meteen de eerste child-pagina openen zonder eerst te bepalen of je vraag vooral over klachten, discipline, setup of aankoopkeuze gaat.",
      payAttention: `Rijders die tussen meerdere subonderwerpen twijfelen of ${childCount} gerelateerde pagina's willen terugbrengen tot de best passende startpagina en tool, zoals ${primaryTool}.`,
    };
  }

  return {
    keyTakeaway: `${entry.pageBrief} Use this hub to move faster from topic selection to a useful next step.`,
    commonMistake:
      "Opening the first child page immediately instead of deciding whether your question is mainly about symptoms, discipline, setup, or a buying decision.",
    payAttention: `Riders choosing between multiple subtopics or narrowing ${childCount} related pages down to the right starting page and tool, such as ${primaryTool}.`,
  };
}

export function buildLeafSections(entry: GuideBacklogEntry, locale: Locale): GuideSection[] {
  const guideContent = getGuideContent(entry.slug);
  if (guideContent) {
    const localized = guideContent[locale];
    return [
      {
        title: labels(locale).intro,
        items: localized.intro,
      },
      ...localized.sections,
    ];
  }

  const t = labels(locale);
  const primaryTool = getGuideLinkLabel(entry.primaryCtaTarget, locale);
  const related = entry.internalLinkTargets.map((href) => getGuideLinkLabel(href, locale));

  if (isNutritionCluster(entry.cluster) || isPowerCluster(entry.cluster)) {
    if (locale === "nl") {
      return [
        {
          title: t.intro,
          items: [
            `${entry.pageBrief} Deze pagina geeft je praktische richtlijnen die je direct kunt toepassen.`,
            `Gebruik deze gids als context en ga daarna verder met ${primaryTool.toLowerCase()} voor specifieke getallen.`,
          ],
        },
        {
          title: "Kernconcepten",
          items: [
            "Focus op consistente gewoonten boven perfecte precisie — fietsers verbeteren het meest wanneer ze handelen op goede-genoeg richtlijnen.",
            `De belangrijkste variabelen hangen samen met ${related.slice(0, 2).join(" en ")} — begin daar voor je naar randgevallen kijkt.`,
            "Kleine verbeteringen consequent toegepast werken beter dan eenmalige optimalisaties.",
          ],
        },
        {
          title: "Hoe je deze gids gebruikt",
          items: [
            "Lees de gids om de redenering achter de getallen te begrijpen.",
            "Test je aanpak op een normale trainingsrit voordat je hem in belangrijke sessies toepast.",
            `Gebruik ${primaryTool.toLowerCase()} voor gepersonaliseerde startwaarden.`,
          ],
        },
      ];
    }

    return [
      {
        title: t.intro,
        items: [
          `${entry.pageBrief} This page gives you practical guidance to apply immediately, without unnecessary complexity.`,
          `Use this guide as context, then continue into ${primaryTool.toLowerCase()} to get specific numbers.`,
        ],
      },
      {
        title: "Key concepts",
        items: [
          "Focus on consistent habits over perfect precision — riders improve most when they act on good-enough guidance rather than waiting for perfect data.",
          `The main variables here are linked to ${related.slice(0, 2).join(" and ")} — start there before exploring edge cases.`,
          "Small improvements applied consistently outperform one-time optimizations.",
        ],
      },
      {
        title: "How to use this guide",
        items: [
          "Read the guide to understand the reasoning behind the numbers.",
          "Test your approach on a regular training ride before applying it in important sessions.",
          `Use ${primaryTool.toLowerCase()} to get personalised starting values.`,
        ],
      },
    ];
  }

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

function isNutritionCluster(cluster: string): boolean {
  return cluster.toLowerCase().includes("nutrition");
}

function isPowerCluster(cluster: string): boolean {
  const lower = cluster.toLowerCase();
  return lower.includes("power") || lower.includes("ftp") || lower.includes("pacing");
}

export function buildQuickAnswer(
  entry: GuideBacklogEntry,
  locale: Locale
): GuideQuickAnswer {
  const authoredQuickAnswer = getGuideQuickAnswer(entry.slug, locale);

  if (authoredQuickAnswer) {
    return authoredQuickAnswer;
  }

  const guideContent = getGuideContent(entry.slug);
  const keyTakeaway =
    guideContent?.[locale].intro[0] ??
    (locale === "nl"
      ? `${entry.pageBrief} Begin met de grootste, best meetbare variabele.`
      : `${entry.pageBrief} Start with the biggest, most measurable variable first.`);

  if (isNutritionCluster(entry.cluster)) {
    return locale === "nl"
      ? {
          keyTakeaway,
          commonMistake: "Geavanceerde voedingsschema's najagen voordat basisgewoonten en innamemomenten consistent zijn.",
          payAttention:
            "Rijders die langer dan 90 minuten trainen, warm weer verwachten of snel energiedips krijgen.",
        }
      : {
          keyTakeaway,
          commonMistake:
            "Chasing advanced fueling numbers before basic habits and intake timing are consistent.",
          payAttention:
            "Riders doing sessions over 90 minutes, training in heat, or regularly hitting energy dips.",
        };
  }

  if (isPowerCluster(entry.cluster)) {
    return locale === "nl"
      ? {
          keyTakeaway,
          commonMistake: "Eén FTP- of W/kg-getal behandelen alsof het pacing, training en race-uitvoering volledig verklaart.",
          payAttention:
            "Rijders die pacing plannen, trainingen structureren of klimdoelen realistisch willen inschatten.",
        }
      : {
          keyTakeaway,
          commonMistake:
            "Treating one FTP or W/kg number as if it fully explains pacing, training, and race execution.",
          payAttention:
            "Riders planning pacing, structuring training, or estimating climb goals realistically.",
        };
  }

  if (entry.cluster.toLowerCase().includes("ride")) {
    return locale === "nl"
      ? {
          keyTakeaway,
          commonMistake:
            "Een houding van een andere discipline kopiëren zonder rekening te houden met terrein, duur en controle.",
          payAttention:
            "Rijders die van discipline wisselen of comfort, controle en snelheid anders moeten balanceren.",
        }
      : {
          keyTakeaway,
          commonMistake:
            "Copying a position from another discipline without adjusting for terrain, duration, and control demands.",
          payAttention:
            "Riders switching disciplines or balancing comfort, control, and speed in a different context.",
        };
  }

  if (
    entry.cluster.toLowerCase().includes("shoe") ||
    entry.cluster.toLowerCase().includes("geometry")
  ) {
    return locale === "nl"
      ? {
          keyTakeaway,
          commonMistake:
            "Schoenen, cleats of framematen beoordelen op gevoel alleen, zonder eerst de basismaat of referentiecijfers te controleren.",
          payAttention:
            "Rijders met hotspots, numbness, aankoopkeuzes of vergelijkingen tussen twee fietsen.",
        }
      : {
          keyTakeaway,
          commonMistake:
            "Judging shoes, cleats, or frame size by feel alone before checking the underlying measurements and reference numbers.",
          payAttention:
            "Riders dealing with hotspots, numbness, purchase decisions, or comparisons between two bikes.",
        };
  }

  if (entry.cluster.toLowerCase().includes("setup")) {
    return locale === "nl"
      ? {
          keyTakeaway,
          commonMistake:
            "Eén setupwaarde groot veranderen zonder te controleren hoe zadel, reach en houding elkaar beïnvloeden.",
          payAttention:
            "Rijders die zelf aanpassingen doen en willen weten welke volgorde en stapgrootte logisch is.",
        }
      : {
          keyTakeaway,
          commonMistake:
            "Making a large change to one setup number without checking how saddle position, reach, and posture interact.",
          payAttention:
            "Riders adjusting their own bike and needing a clear order of operations plus sensible step size.",
        };
  }

  return locale === "nl"
    ? {
        keyTakeaway,
        commonMistake:
          "Te veel tegelijk aanpassen in plaats van eerst de grootste, meest herhaalbare factor te testen.",
        payAttention:
          "Rijders met terugkerend discomfort, prestatieverlies of een nieuwe setup die onder vermoeidheid uit elkaar valt.",
      }
    : {
        keyTakeaway,
        commonMistake:
          "Changing too many variables at once instead of testing the biggest, most repeatable factor first.",
        payAttention:
          "Riders with recurring discomfort, performance loss, or a new setup that falls apart under fatigue.",
      };
}

export function buildFaqs(entry: GuideBacklogEntry, locale: Locale): GuideFaq[] {
  const guideContent = getGuideContent(entry.slug);
  if (guideContent && guideContent[locale].faqs.length > 0) {
    return guideContent[locale].faqs;
  }

  const tool = getGuideLinkLabel(entry.primaryCtaTarget, locale);

  if (isNutritionCluster(entry.cluster)) {
    if (locale === "nl") {
      return [
        {
          q: "Hoe weet ik hoeveel ik op de fiets moet eten?",
          a: "Gebruik een eenvoudige vuistregel: zorg voor brandstof bij ritten langer dan 60-90 minuten. Gebruik de calculator voor een bereik op basis van jouw gewicht en inspanningsniveau.",
        },
        {
          q: "Moet ik voeding oefenen in training?",
          a: "Ja. Test je race-voedingsstrategie nooit voor het eerst tijdens een wedstrijd.",
        },
      ];
    }
    return [
      {
        q: "How do I know how much to eat on the bike?",
        a: "Start with a simple rule: fuel for rides over 60-90 minutes. Use the calculator to get a range based on your weight and effort level.",
      },
      {
        q: "Should I practice nutrition in training?",
        a: "Yes. Race-day fueling strategies should not be trialled for the first time in an event.",
      },
    ];
  }

  if (isPowerCluster(entry.cluster)) {
    if (locale === "nl") {
      return [
        {
          q: "Heb ik een vermogensmeter nodig voor deze gidsen?",
          a: "Nee. De gidsen leggen de concepten helder uit zonder vermogensdata. Een vermogensmeter helpt bij precisie, maar is niet vereist.",
        },
        {
          q: "Hoe vaak moet ik FTP hertesten?",
          a: "Elke 4-8 weken tijdens een trainingsblok, of na een langere pauze of fitnesswisseling.",
        },
      ];
    }
    return [
      {
        q: "Do I need a power meter to use these guides?",
        a: "No. The guides explain the concepts clearly without requiring power data. A power meter helps with precision but is not required.",
      },
      {
        q: "How often should I retest FTP?",
        a: "Every 4-8 weeks during a training block, or after a significant break or fitness change.",
      },
    ];
  }

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

export function relatedLinkDescription(locale: Locale, path?: string) {
  const normalized = path ? path.replace(/^\/(en|nl)/, "") : "";

  if (locale === "nl") {
    const map: Record<string, string> = {
      "/calculators/bike-fit":
        "Gebruik de hoofdcalculator wanneer je van context naar een complete eerste bikefit wilt gaan.",
      "/calculators/saddle-height":
        "Gebruik deze calculator als zadelhoogte afstellen je logische eerste meetbare stap is.",
      "/calculators/frame-size":
        "Controleer eerst framelogica en reach als de hele cockpit of fietsmaat twijfelachtig voelt.",
      "/science/stack-and-reach":
        "Bekijk stack en reach wanneer cockpitlengte of framevergelijking de echte limiter zijn.",
      "/science/bike-fit-methods":
        "Gebruik deze science-pagina als je de methode achter de fitaanbeveling wilt begrijpen.",
      "/measurement-guide":
        "Meet eerst nauwkeuriger voordat je verdere fitconclusies trekt uit de tool- of gidsuitkomst.",
      "/guides/road-bike-fit-guide":
        "Verbind zadelhoogte, reach en cockpitkeuzes in één praktische racefiets-fitgids.",
      "/guides/bike-fitting-for-knee-pain":
        "Gebruik deze klachtgids wanneer kniebelasting of zadelhoogte je eerste verdachte blijft.",
      "/guides/bike-fitting-for-lower-back-pain":
        "Gebruik deze gids wanneer reach, drop of bekkenstabiliteit rugklachten beter verklaren dan pure vermoeidheid.",
      "/pain":
        "Gebruik de klachtenhub als je eerst wilt bepalen welke fitfactor bij jouw discomfort prioriteit verdient.",
    };

    return map[normalized] ?? labels(locale).relatedDefault;
  }

  const map: Record<string, string> = {
    "/calculators/bike-fit":
      "Use the main calculator when you want to turn context into one connected first-pass bike-fit baseline.",
    "/calculators/saddle-height":
      "Use this calculator when setting saddle height is the clearest first measurable step.",
    "/calculators/frame-size":
      "Check frame logic and reach first when the whole bike size or cockpit feels suspect.",
    "/science/stack-and-reach":
      "Use stack and reach when cockpit length or frame comparison is the real limiter.",
    "/science/bike-fit-methods":
      "Open the science page when you want the method behind the fit recommendation, not just the output.",
    "/measurement-guide":
      "Measure more carefully first before you trust the tool or guide output too far.",
    "/guides/road-bike-fit-guide":
      "Connect saddle height, reach, and cockpit choices inside one practical road-bike fit guide.",
    "/guides/bike-fitting-for-knee-pain":
      "Use this symptom guide when knee loading or saddle height still looks like the first suspect.",
    "/guides/bike-fitting-for-lower-back-pain":
      "Use this guide when reach, drop, or pelvic stability explain the issue better than general fatigue.",
    "/pain":
      "Use the symptom hub when you first need to decide which fit factor deserves priority.",
  };

  return map[normalized] ?? labels(locale).relatedDefault;
}
