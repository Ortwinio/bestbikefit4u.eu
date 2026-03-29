import type { BikeType } from "@/lib/bikes";
import type {
  MarktplaatsFieldConfidence,
  MarktplaatsFieldSource,
  ParsedField,
} from "./types";

const KNOWN_BRANDS = [
  "batavus",
  "bianchi",
  "bmc",
  "cannondale",
  "canyon",
  "cervelo",
  "colnago",
  "cube",
  "gazelle",
  "giant",
  "koga",
  "lapierre",
  "liv",
  "merida",
  "orbea",
  "pinarello",
  "ridley",
  "sensa",
  "specialized",
  "scott",
  "trek",
  "wilier",
  "cube agree",
  "cube attain",
  "vanmoof",
  "focus",
  "felt",
  "bianchi",
  "look",
  "rose",
  "stevens",
  "bh",
  "ghost",
  "cube nuroad",
  "cervélo",
  "simplon",
  "storck",
  "argon 18",
  "isaac",
  "bianchi",
  "eddy merckx",
  "jan janssen",
  "trek domane",
  "trek emonda",
  "trek madone",
  "specialized tarmac",
  "specialized allez",
  "specialized roubaix",
  "specialized diverge",
  "canyon aeroad",
  "canyon endurace",
  "canyon ultimate",
  "canyon grail",
  "canyon grizl",
  "cannondale supersix",
  "cannondale synapse",
  "giant tcr",
  "giant defy",
  "giant propel",
  "cervelo p",
  "cervelo s",
  "cervelo r",
] as const;

const KNOWN_BRAND_TOKENS = Array.from(
  new Set(
    KNOWN_BRANDS.map((entry) => entry.split(" ")[0]).filter((entry) => entry.length > 1)
  )
).sort((left, right) => right.length - left.length);

const MODEL_STOPWORDS = new Set([
  "te",
  "koop",
  "nieuw",
  "nieuwe",
  "gebruikte",
  "occasion",
  "maat",
  "size",
  "inch",
  "cm",
  "carbon",
  "alu",
  "aluminium",
  "disc",
  "schijfrem",
  "shimano",
  "sram",
  "ultegra",
  "105",
  "di2",
  "axs",
  "fiets",
  "bike",
  "herenfiets",
  "damesfiets",
  "racefiets",
  "gravelbike",
  "tijdritfiets",
  "triathlonfiets",
  "mtb",
  "mountainbike",
  "hybride",
  "hybrid",
  "tourfiets",
  "stadsfiets",
  "maatje",
  "framemaat",
  "zeer",
  "mooie",
  "zgan",
  "zo",
  "goed",
  "als",
  "splinternieuw",
]);

const TITLE_NOISE_PATTERNS = [
  /\bz\.?g\.?a\.?n\.?\b/gi,
  /\bzo goed als nieuw\b/gi,
  /\bte koop\b/gi,
  /\bnieuw\b/gi,
  /\bhele mooie\b/gi,
  /\btopstaat\b/gi,
  /\bmaat\s*[a-z0-9]+\b/gi,
  /\bmaat\s*\d{2,3}\b/gi,
  /\bsize\s*[a-z0-9]+\b/gi,
  /\bframemaat\s*\d{2,3}\b/gi,
  /\b(?:19|20)\d{2}\b/g,
];

const BIKE_TYPE_PATTERNS: Array<{
  bikeType: BikeType;
  confidence: MarktplaatsFieldConfidence;
  source: MarktplaatsFieldSource;
  patterns: RegExp[];
}> = [
  {
    bikeType: "tt_triathlon",
    confidence: "high",
    source: "title_normalization",
    patterns: [/\btijdritfiets\b/i, /\btri(?:athlon)?\b/i, /\btt\b/i],
  },
  {
    bikeType: "gravel",
    confidence: "high",
    source: "title_normalization",
    patterns: [/\bgravel(?:bike)?\b/i, /\bgravel fiets\b/i],
  },
  {
    bikeType: "cyclocross",
    confidence: "high",
    source: "title_normalization",
    patterns: [/\bcyclocross\b/i, /\bcrossfiets\b/i, /\bcx\b/i],
  },
  {
    bikeType: "mountain",
    confidence: "high",
    source: "title_normalization",
    patterns: [/\bmtb\b/i, /\bmountainbike\b/i, /\benduro\b/i, /\btrailbike\b/i, /\bxc\b/i],
  },
  {
    bikeType: "road",
    confidence: "high",
    source: "title_normalization",
    patterns: [
      /\bracefiets\b/i,
      /\bkoersfiets\b/i,
      /\bwielrenfiets\b/i,
      /\broad bike\b/i,
      /\brace\b/i,
    ],
  },
  {
    bikeType: "hybrid",
    confidence: "high",
    source: "title_normalization",
    patterns: [/\bhybride\b/i, /\bhybrid\b/i],
  },
  {
    bikeType: "touring",
    confidence: "high",
    source: "title_normalization",
    patterns: [/\btourfiets\b/i, /\btrekking\b/i, /\btouring\b/i],
  },
  {
    bikeType: "city",
    confidence: "high",
    source: "title_normalization",
    patterns: [/\bstadsfiets\b/i, /\btransportfiets\b/i, /\bomafiets\b/i, /\bcommuter\b/i],
  },
];

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

export function collapseWhitespace(value: string): string {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

export function normalizeAdvertTitle(rawTitle: string): string {
  let title = collapseWhitespace(rawTitle)
    .replace(/\s*\|\s*Marktplaats.*$/i, "")
    .replace(/\s*-\s*Marktplaats.*$/i, "");

  for (const pattern of TITLE_NOISE_PATTERNS) {
    title = title.replace(pattern, " ");
  }

  return collapseWhitespace(title.replace(/[|•]+/g, " "));
}

function normalizeLookupValue(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function extractBikeTypeCandidate(
  title: string,
  description: string
): ParsedField<BikeType> {
  const haystack = normalizeLookupValue(`${title} ${description}`);
  const titleOnly = normalizeLookupValue(title);
  const titleMatches: Array<{ bikeType: BikeType; source: MarktplaatsFieldSource }> = [];
  const matches: Array<{ bikeType: BikeType; source: MarktplaatsFieldSource }> = [];

  for (const entry of BIKE_TYPE_PATTERNS) {
    if (entry.patterns.some((pattern) => pattern.test(titleOnly))) {
      titleMatches.push({ bikeType: entry.bikeType, source: entry.source });
    }

    if (entry.patterns.some((pattern) => pattern.test(haystack))) {
      matches.push({ bikeType: entry.bikeType, source: "description_keywords" });
    }
  }

  if (titleMatches.length === 1) {
    return {
      value: titleMatches[0].bikeType,
      confidence: "high",
      source: titleMatches[0].source,
      needsReview: false,
      reasons: ["Explicit bike-type keyword found in advert title."],
    };
  }

  if (titleMatches.length > 1) {
    return {
      value: null,
      confidence: "low",
      source: "title_normalization",
      needsReview: true,
      reasons: ["Conflicting bike-type keywords were found in the advert title."],
    };
  }

  if (matches.length === 1) {
    return {
      value: matches[0].bikeType,
      confidence: "medium",
      source: matches[0].source,
      needsReview: true,
      reasons: ["Bike type inferred from secondary keywords, not a clean title match."],
    };
  }

  if (matches.length > 1) {
    return {
      value: null,
      confidence: "low",
      source: "description_keywords",
      needsReview: true,
      reasons: ["Multiple bike-type keyword families were detected."],
    };
  }

  return {
    value: null,
    confidence: "none",
    source: "none",
    needsReview: true,
    reasons: ["No stable bike-type keyword was found."],
  };
}

export function extractBrandCandidate(title: string): ParsedField<string> {
  const normalizedTitle = normalizeLookupValue(title);

  for (const brand of KNOWN_BRAND_TOKENS) {
    if (normalizedTitle.startsWith(`${brand} `) || normalizedTitle === brand) {
      return {
        value: titleCase(brand),
        confidence: "high",
        source: "title_normalization",
        needsReview: false,
        reasons: ["Advert title starts with a known bike brand."],
      };
    }
  }

  const brandHits = KNOWN_BRAND_TOKENS.filter(
    (brand) => normalizedTitle.includes(` ${brand} `) || normalizedTitle.endsWith(` ${brand}`)
  );

  if (brandHits.length === 1) {
    return {
      value: titleCase(brandHits[0]),
      confidence: "medium",
      source: "title_normalization",
      needsReview: true,
      reasons: ["Known bike brand found in title, but not in leading brand position."],
    };
  }

  if (brandHits.length > 1) {
    return {
      value: null,
      confidence: "low",
      source: "title_normalization",
      needsReview: true,
      reasons: ["Multiple known brands appear in the advert title."],
    };
  }

  return {
    value: null,
    confidence: "none",
    source: "none",
    needsReview: true,
    reasons: ["No known brand was found in a stable position."],
  };
}

export function extractModelCandidate(
  title: string,
  brandField: ParsedField<string>
): ParsedField<string> {
  if (!brandField.value) {
    return {
      value: null,
      confidence: "none",
      source: "none",
      needsReview: true,
      reasons: ["Model extraction requires a stable brand candidate first."],
    };
  }

  const normalizedTitle = normalizeAdvertTitle(title);
  const escapedBrand = brandField.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const remainder = collapseWhitespace(
    normalizedTitle.replace(new RegExp(`^${escapedBrand}\\b`, "i"), "")
  );

  if (!remainder) {
    return {
      value: null,
      confidence: "low",
      source: "title_normalization",
      needsReview: true,
      reasons: ["Brand was found, but no model-like remainder was left in the title."],
    };
  }

  const tokens = remainder
    .split(/\s+/)
    .map((token) => token.replace(/^[^a-z0-9]+|[^a-z0-9+.-]+$/gi, ""))
    .filter(Boolean);

  const keptTokens: string[] = [];

  for (const token of tokens) {
    const lookup = normalizeLookupValue(token);
    if (!lookup || MODEL_STOPWORDS.has(lookup)) {
      continue;
    }

    if (/^\d{2,3}(?:cm|mm)?$/i.test(token)) {
      continue;
    }

    keptTokens.push(token);
    if (keptTokens.length === 4) {
      break;
    }
  }

  if (keptTokens.length === 0) {
    return {
      value: null,
      confidence: "low",
      source: "title_normalization",
      needsReview: true,
      reasons: ["Only size or component noise remained after removing the brand."],
    };
  }

  const model = keptTokens.join(" ");
  const confidence: MarktplaatsFieldConfidence =
    brandField.confidence === "high" && keptTokens.length <= 3 ? "medium" : "low";

  return {
    value: model,
    confidence,
    source: "title_normalization",
    needsReview: true,
    reasons: [
      confidence === "medium"
        ? "Model was derived from the cleaned title remainder after the brand."
        : "Model candidate is noisy and should be reviewed before save.",
    ],
  };
}

export function createParsedField<T>(
  value: T | null,
  confidence: MarktplaatsFieldConfidence,
  source: MarktplaatsFieldSource,
  reasons: string[]
): ParsedField<T> {
  return {
    value,
    confidence,
    source,
    needsReview: confidence !== "high",
    reasons,
  };
}
