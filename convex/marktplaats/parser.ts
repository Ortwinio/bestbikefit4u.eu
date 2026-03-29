const MARKTPLAATS_HOST_SUFFIXES = [".marktplaats.nl", ".marktplaats.com"] as const;

export type ParsedBikeType =
  | "road"
  | "gravel"
  | "mountain"
  | "hybrid"
  | "tt_triathlon"
  | "cyclocross"
  | "touring"
  | "city";

export type FieldConfidence = "high" | "medium" | "low";

export type ParsedField<T> = {
  value?: T;
  confidence: FieldConfidence;
  needsReview: boolean;
};

export type MarktplaatsParsedAdvert = {
  sourceUrl: string;
  canonicalUrl: string;
  advertTitle?: string;
  description?: string;
  rawDescription?: string;
  imageUrls: string[];
  candidateBrand: ParsedField<string>;
  candidateModel: ParsedField<string>;
  candidateBikeType: ParsedField<ParsedBikeType>;
  derivedSignals: {
    sizeMentions: string[];
    componentMentions: string[];
    conditionMentions: string[];
    maintenanceMentions: string[];
    previewWarnings: string[];
  };
};

const BRAND_ALIASES = [
  "Ridley",
  "Specialized",
  "Trek",
  "Canyon",
  "Giant",
  "Bianchi",
  "Cervelo",
  "Cannondale",
  "Scott",
  "Cube",
  "Orbea",
  "Pinarello",
  "Colnago",
  "BMC",
  "Merida",
  "Wilier",
  "Lapierre",
  "Argon 18",
  "Sensa",
  "Gazelle",
  "Koga",
  "Van Nicholas",
  "Batavus",
  "Focus",
  "Rose",
  "Corratec",
  "Look",
  "Factor",
  "Felt",
  "Storck",
  "Liv",
  "Santa Cruz",
  "Yeti",
  "Cotic",
  "Surly",
  "Riese & Muller",
] as const;

const BIKE_TYPE_KEYWORDS: Array<{
  bikeType: ParsedBikeType;
  tokens: string[];
  confidence: FieldConfidence;
}> = [
  { bikeType: "tt_triathlon", tokens: ["tijdritfiets", "triathlon", "triatlon", "tt bike"], confidence: "high" },
  { bikeType: "road", tokens: ["racefiets", "road bike", "wielrenfiets"], confidence: "high" },
  { bikeType: "gravel", tokens: ["gravel"], confidence: "high" },
  { bikeType: "mountain", tokens: ["mountainbike", "mtb", "hardtail", "full suspension"], confidence: "high" },
  { bikeType: "cyclocross", tokens: ["cyclocross", "crossfiets", "cx"], confidence: "high" },
  { bikeType: "touring", tokens: ["tourfiets", "randonneur", "bikepacking"], confidence: "medium" },
  { bikeType: "city", tokens: ["stadsfiets", "citybike"], confidence: "medium" },
  { bikeType: "hybrid", tokens: ["hybride", "fitness bike"], confidence: "medium" },
];

const COMPONENT_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Shimano Di2", pattern: /\bdi2\b/i },
  { label: "Shimano Ultegra", pattern: /\bultegra\b/i },
  { label: "Shimano Dura-Ace", pattern: /\bdura[-\s]?ace\b/i },
  { label: "Shimano 105", pattern: /\b105\b/i },
  { label: "SRAM Red", pattern: /\bsram\s+red\b/i },
  { label: "SRAM Force", pattern: /\bsram\s+force\b/i },
  { label: "SRAM Rival", pattern: /\bsram\s+rival\b/i },
  { label: "Carbon frame", pattern: /\bcarbon(?:nen)?\s+(?:frame|fiets|cockpit|wielen?)\b/i },
  { label: "Disc brakes", pattern: /\bdisc\b|\bschijfrem(?:men)?\b/i },
  { label: "Powermeter", pattern: /\bpowermeter\b|\bvermogensmeter\b/i },
  { label: "Wheelset included", pattern: /\bextra\s+wielset\b|\bwielset\b/i },
];

const CONDITION_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Very good condition", pattern: /\bzo goed als nieuw\b|\buitstekende staat\b/i },
  { label: "Good condition", pattern: /\bgoede staat\b|\bnette staat\b/i },
  { label: "Used bike", pattern: /\bgebruikssporen\b|\bgebruikte?\b/i },
  { label: "Damage mentioned", pattern: /\bschade\b|\bkras(?:je|jes|sen)?\b|\bdeuk(?:je|jes)?\b/i },
  { label: "Needs attention", pattern: /\bopknapper\b|\bmoet nagekeken\b|\bprojectfiets\b/i },
];

const MAINTENANCE_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Maintenance history included", pattern: /\bonderhoudshistorie\b|\bonderhoudsboekje\b/i },
  { label: "Recently serviced", pattern: /\brecent(?:elijk)?\s+onderhoud(?:en)?\b|\bpas onderhouden\b|\bservicebeurt\b/i },
  { label: "New chain", pattern: /\bnieuwe?\s+ketting\b/i },
  { label: "New cassette", pattern: /\bnieuwe?\s+cassette\b/i },
  { label: "New tires", pattern: /\bnieuwe?\s+banden\b/i },
];

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function uniqueNormalizedMatches(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalizeMarktplaatsImageUrl(url: string): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return trimmed;
}

export function isSupportedMarktplaatsHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return (
    normalized === "marktplaats.nl" ||
    normalized === "www.marktplaats.nl" ||
    MARKTPLAATS_HOST_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
  );
}

export function normalizeMarktplaatsUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl.trim());
  if (!isSupportedMarktplaatsHost(parsed.hostname)) {
    throw new Error("Only Marktplaats URLs are supported.");
  }
  parsed.hash = "";
  return parsed.toString();
}

function extractMetaContent(html: string, key: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtmlEntities(match[1].trim());
    }
  }

  return undefined;
}

function extractCanonicalUrl(html: string): string | undefined {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i) ??
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : undefined;
}

function extractTitleTag(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? stripHtml(match[1]) : undefined;
}

function extractJsonLdBlocks(html: string): unknown[] {
  const matches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const blocks: unknown[] = [];

  for (const match of matches) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      continue;
    }
  }

  return blocks;
}

function flattenJsonLd(items: unknown[]): Record<string, unknown>[] {
  const flattened: Record<string, unknown>[] = [];

  for (const item of items) {
    if (!item) continue;
    if (Array.isArray(item)) {
      flattened.push(...flattenJsonLd(item));
      continue;
    }
    if (typeof item === "object") {
      const record = item as Record<string, unknown>;
      flattened.push(record);
      if (Array.isArray(record["@graph"])) {
        flattened.push(...flattenJsonLd(record["@graph"]));
      }
    }
  }

  return flattened;
}

function extractJsonLdImageUrls(blocks: Record<string, unknown>[]): string[] {
  const images: string[] = [];
  for (const block of blocks) {
    const image = block.image;
    if (typeof image === "string") {
      images.push(image);
    } else if (Array.isArray(image)) {
      for (const item of image) {
        if (typeof item === "string") {
          images.push(item);
        } else if (item && typeof item === "object") {
          const candidate =
            typeof (item as { url?: unknown }).url === "string"
              ? (item as { url: string }).url
              : typeof (item as { contentUrl?: unknown }).contentUrl === "string"
                ? (item as { contentUrl: string }).contentUrl
                : undefined;
          if (candidate) {
            images.push(candidate);
          }
        }
      }
    } else if (image && typeof image === "object") {
      const candidate =
        typeof (image as { url?: unknown }).url === "string"
          ? (image as { url: string }).url
          : typeof (image as { contentUrl?: unknown }).contentUrl === "string"
            ? (image as { contentUrl: string }).contentUrl
            : undefined;
      if (candidate) {
        images.push(candidate);
      }
    }
  }
  return images;
}

function extractOgImages(html: string): string[] {
  return [...html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => decodeHtmlEntities(match[1].trim()));
}

function extractDescription(html: string, jsonLdBlocks: Record<string, unknown>[]): string | undefined {
  const candidates: string[] = [];

  for (const block of jsonLdBlocks) {
    if (typeof block.description === "string" && block.description.trim()) {
      candidates.push(stripHtml(block.description));
    }
  }

  const meta =
    extractMetaContent(html, "og:description") ??
    extractMetaContent(html, "description");
  if (meta) {
    candidates.push(meta);
  }

  return candidates.sort((left, right) => right.length - left.length)[0];
}

function extractDescriptionFromStructuredMarkup(html: string): string | undefined {
  const selectors = [
    /<div[^>]+data-testid=["']description["'][^>]*>([\s\S]*?)<\/div>/i,
    /<section[^>]+data-testid=["']description["'][^>]*>([\s\S]*?)<\/section>/i,
    /<div[^>]+class=["'][^"']*Description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const selector of selectors) {
    const match = html.match(selector);
    const text = match?.[1] ? stripHtml(match[1]) : undefined;
    if (text && text.length > 40) {
      return text;
    }
  }

  return undefined;
}

function extractSizeMentions(input: string): string[] {
  const matches = [
    ...input.matchAll(/\bmaat\s+([xsml]{1,3}|\d{2,3}(?:[.,]\d)?(?:\s?cm)?)\b/gi),
    ...input.matchAll(/\bframe(?:maat)?\s+([xsml]{1,3}|\d{2,3}(?:[.,]\d)?(?:\s?cm)?)\b/gi),
    ...input.matchAll(/\b(\d{2,3})\s?cm\b/gi),
  ].map((match) => match[0]);

  return uniqueNormalizedMatches(matches).slice(0, 6);
}

function extractSignalMentions(
  input: string,
  patterns: Array<{ label: string; pattern: RegExp }>
): string[] {
  return patterns
    .filter(({ pattern }) => pattern.test(input))
    .map(({ label }) => label);
}

function buildPreviewWarnings(input: {
  advertTitle?: string;
  description?: string;
  imageUrls: string[];
  candidateBrand: ParsedField<string>;
  candidateModel: ParsedField<string>;
  candidateBikeType: ParsedField<ParsedBikeType>;
  sizeMentions: string[];
}): string[] {
  const warnings: string[] = [];

  if (!input.description || input.description.length < 80) {
    warnings.push("limited_description");
  }
  if (input.imageUrls.length === 0) {
    warnings.push("no_images_found");
  }
  if (!input.advertTitle) {
    warnings.push("missing_advert_title");
  }
  if (input.candidateBrand.confidence !== "high") {
    warnings.push("brand_needs_review");
  }
  if (input.candidateModel.confidence !== "high") {
    warnings.push("model_needs_review");
  }
  if (input.candidateBikeType.confidence !== "high") {
    warnings.push("bike_type_needs_review");
  }
  if (input.sizeMentions.length === 0) {
    warnings.push("no_size_mention_found");
  }

  return warnings;
}

function normalizeTitleForMatching(title: string): string {
  return title
    .replace(/\s+/g, " ")
    .replace(/[|•]/g, " ")
    .replace(/\bmaat\b.*$/i, "")
    .replace(/\bframe\b.*$/i, "")
    .trim();
}

function deriveBrand(title: string): ParsedField<string> {
  const normalized = title.toLowerCase();
  const exact = BRAND_ALIASES.find((brand) => normalized.includes(brand.toLowerCase()));
  if (exact) {
    return { value: exact, confidence: "high", needsReview: false };
  }

  const leading = normalizeTitleForMatching(title)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");

  if (leading.length >= 3) {
    return { value: leading, confidence: "low", needsReview: true };
  }

  return { confidence: "low", needsReview: true };
}

function deriveModel(title: string, brand?: string): ParsedField<string> {
  const cleaned = normalizeTitleForMatching(title);
  const withoutBrand = brand
    ? cleaned.replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "")
    : cleaned;
  const candidate = withoutBrand
    .replace(/\b(maat|frame|di2|ultegra|dura ace|sram|11 speed|12 speed)\b.*$/i, "")
    .trim();

  if (candidate.length >= 2 && candidate.length <= 60) {
    return {
      value: candidate,
      confidence: brand ? "medium" : "low",
      needsReview: true,
    };
  }

  return { confidence: "low", needsReview: true };
}

function deriveBikeType(title: string, description?: string): ParsedField<ParsedBikeType> {
  const haystack = `${title} ${description ?? ""}`.toLowerCase();
  for (const keywordSet of BIKE_TYPE_KEYWORDS) {
    if (keywordSet.tokens.some((token) => haystack.includes(token))) {
      return {
        value: keywordSet.bikeType,
        confidence: keywordSet.confidence,
        needsReview: keywordSet.confidence !== "high",
      };
    }
  }

  return { confidence: "low", needsReview: true };
}

export function parseMarktplaatsAdvert(params: {
  sourceUrl: string;
  html: string;
}): MarktplaatsParsedAdvert {
  const sourceUrl = normalizeMarktplaatsUrl(params.sourceUrl);
  const jsonLd = flattenJsonLd(extractJsonLdBlocks(params.html));

  const advertTitle =
    extractMetaContent(params.html, "og:title") ??
    jsonLd.find((block) => typeof block.name === "string")?.name?.toString() ??
    extractTitleTag(params.html);

  const canonicalUrl = normalizeMarktplaatsUrl(
    extractCanonicalUrl(params.html) ??
      extractMetaContent(params.html, "og:url") ??
      sourceUrl
  );

  const description =
    extractDescriptionFromStructuredMarkup(params.html) ??
    extractDescription(params.html, jsonLd);
  const imageUrls = uniqueStrings(
    [...extractJsonLdImageUrls(jsonLd), ...extractOgImages(params.html)]
      .map(normalizeMarktplaatsImageUrl)
      .filter((value): value is string => Boolean(value))
  )
    .filter((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && isSupportedMarktplaatsHost(parsed.hostname);
      } catch {
        return false;
      }
    })
    .slice(0, 8);

  const safeTitle = advertTitle?.trim() ?? "";
  const candidateBrand = deriveBrand(safeTitle);
  const candidateModel = deriveModel(safeTitle, candidateBrand.value);
  const candidateBikeType = deriveBikeType(safeTitle, description);
  const rawDescription = description?.trim() || undefined;
  const signalInput = `${safeTitle}\n${rawDescription ?? ""}`;
  const sizeMentions = extractSizeMentions(signalInput);
  const componentMentions = extractSignalMentions(signalInput, COMPONENT_PATTERNS);
  const conditionMentions = extractSignalMentions(signalInput, CONDITION_PATTERNS);
  const maintenanceMentions = extractSignalMentions(signalInput, MAINTENANCE_PATTERNS);
  const previewWarnings = buildPreviewWarnings({
    advertTitle: safeTitle || undefined,
    description: rawDescription,
    imageUrls,
    candidateBrand,
    candidateModel,
    candidateBikeType,
    sizeMentions,
  });

  return {
    sourceUrl,
    canonicalUrl,
    advertTitle: safeTitle || undefined,
    description: rawDescription,
    rawDescription,
    imageUrls,
    candidateBrand,
    candidateModel,
    candidateBikeType,
    derivedSignals: {
      sizeMentions,
      componentMentions,
      conditionMentions,
      maintenanceMentions,
      previewWarnings,
    },
  };
}
