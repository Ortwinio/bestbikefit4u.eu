import type { BikeType } from "@/lib/bikes";
import {
  collapseWhitespace,
  createParsedField,
  extractBikeTypeCandidate,
  extractBrandCandidate,
  extractModelCandidate,
  normalizeAdvertTitle,
} from "./normalize";
import type {
  MarktplaatsFetchOptions,
  MarktplaatsParseResult,
  ParsedField,
  ParsedMarktplaatsAdvert,
} from "./types";

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_BYTES = 750_000;
const ALLOWED_HOSTNAMES = new Set([
  "marktplaats.nl",
  "www.marktplaats.nl",
  "m.marktplaats.nl",
]);

function createFailure(
  code: Extract<MarktplaatsParseResult, { ok: false }>["error"]["code"],
  message: string,
  retryable: boolean,
  status?: number
): Extract<MarktplaatsParseResult, { ok: false }> {
  return {
    ok: false,
    error: { code, message, retryable, status },
  };
}

type JsonLdNode = Record<string, unknown>;

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? collapseWhitespace(value) : ""))
        .filter(Boolean)
    )
  );
}

function stripTags(value: string): string {
  return collapseWhitespace(value.replace(/<[^>]+>/g, " "));
}

function extractTagContent(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match?.[1] ? collapseWhitespace(stripTags(match[1])) : null;
}

function extractAttribute(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match?.[1] ? collapseWhitespace(match[1]) : null;
}

function extractAllAttributes(html: string, pattern: RegExp): string[] {
  return uniqueStrings(Array.from(html.matchAll(pattern), (match) => match[1] ?? null));
}

function extractJsonLdNodes(html: string): JsonLdNode[] {
  const blocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    (match) => match[1]
  );

  const nodes: JsonLdNode[] = [];
  for (const block of blocks) {
    const payload = block.trim();
    if (!payload) {
      continue;
    }

    try {
      const parsed = JSON.parse(payload) as unknown;
      collectJsonLdNodes(parsed, nodes);
    } catch {
      continue;
    }
  }

  return nodes;
}

function collectJsonLdNodes(value: unknown, target: JsonLdNode[]): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectJsonLdNodes(entry, target));
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const node = value as JsonLdNode;
  if ("@graph" in node && Array.isArray(node["@graph"])) {
    collectJsonLdNodes(node["@graph"], target);
  }

  target.push(node);
}

function findListingNode(nodes: JsonLdNode[]): JsonLdNode | null {
  return (
    nodes.find((node) => {
      const typeValue = node["@type"];
      if (typeof typeValue === "string") {
        return /product|offer|vehicle|listing/i.test(typeValue);
      }

      return Array.isArray(typeValue)
        ? typeValue.some((entry) => typeof entry === "string" && /product|offer|vehicle|listing/i.test(entry))
        : false;
    }) ?? null
  );
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? collapseWhitespace(value) : null;
}

function getNestedString(node: JsonLdNode, key: string): string | null {
  if (!(key in node)) {
    return null;
  }

  const value = node[key];
  if (typeof value === "string") {
    return collapseWhitespace(value);
  }

  if (value && typeof value === "object" && "name" in value) {
    return getString((value as Record<string, unknown>).name);
  }

  return null;
}

function extractCanonicalUrl(html: string, listingNode: JsonLdNode | null): string | null {
  return (
    getString(listingNode?.url) ??
    extractAttribute(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ??
    extractAttribute(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)
  );
}

function extractAdvertTitle(html: string, listingNode: JsonLdNode | null): string | null {
  return (
    getNestedString(listingNode ?? {}, "name") ??
    getNestedString(listingNode ?? {}, "headline") ??
    extractAttribute(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ??
    extractTagContent(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ??
    extractTagContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
  );
}

function extractDescription(html: string, listingNode: JsonLdNode | null): string {
  const description =
    getNestedString(listingNode ?? {}, "description") ??
    extractAttribute(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ??
    extractTagContent(
      html,
      /<(?:div|section|article)[^>]+(?:data-testid|class)=["'][^"']*(?:description|Description)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section|article)>/i
    ) ??
    "";

  return collapseWhitespace(description);
}

function extractImageUrls(html: string, listingNode: JsonLdNode | null): string[] {
  const jsonLdImages = listingNode?.image;
  const imageCandidates: Array<string | null | undefined> = [];

  if (typeof jsonLdImages === "string") {
    imageCandidates.push(jsonLdImages);
  } else if (Array.isArray(jsonLdImages)) {
    for (const entry of jsonLdImages) {
      if (typeof entry === "string") {
        imageCandidates.push(entry);
        continue;
      }

      if (entry && typeof entry === "object") {
        imageCandidates.push(
          getString((entry as Record<string, unknown>).url) ??
            getString((entry as Record<string, unknown>).contentUrl)
        );
      }
    }
  }

  imageCandidates.push(
    extractAttribute(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
  );

  imageCandidates.push(
    ...extractAllAttributes(
      html,
      /<(?:img|source)[^>]+(?:src|srcset)=["']([^"']*(?:marktplaats|mp-images|images)[^"']*)["']/gi
    ).map((entry) => entry.split(/\s+/)[0] ?? entry)
  );

  return uniqueStrings(imageCandidates).filter((entry) => /^https?:\/\//i.test(entry));
}

function toAbsoluteUrl(candidate: string, baseUrl: string): string | null {
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return null;
  }
}

export function normalizeMarktplaatsUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      return null;
    }

    if (!ALLOWED_HOSTNAMES.has(url.hostname.toLowerCase())) {
      return null;
    }

    if (!url.pathname.startsWith("/v/")) {
      return null;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function buildBrandField(
  listingNode: JsonLdNode | null,
  normalizedTitle: string
): ParsedField<string> {
  const structuredBrand = getNestedString(listingNode ?? {}, "brand");
  if (structuredBrand) {
    return createParsedField(structuredBrand, "high", "structured_data", [
      "Brand came directly from structured data.",
    ]);
  }

  return extractBrandCandidate(normalizedTitle);
}

function buildModelField(
  listingNode: JsonLdNode | null,
  normalizedTitle: string,
  brandField: ParsedField<string>
): ParsedField<string> {
  const structuredModel = getString(listingNode?.model);
  if (structuredModel) {
    return createParsedField(structuredModel, "high", "structured_data", [
      "Model came directly from structured data.",
    ]);
  }

  return extractModelCandidate(normalizedTitle, brandField);
}

function buildBikeTypeField(
  listingNode: JsonLdNode | null,
  normalizedTitle: string,
  description: string
): ParsedField<BikeType> {
  const structuredCategory =
    getString(listingNode?.category) ??
    getNestedString(listingNode ?? {}, "additionalType") ??
    "";

  const structuredCandidate = extractBikeTypeCandidate(structuredCategory, structuredCategory);
  if (structuredCandidate.value && structuredCandidate.confidence !== "none") {
    return {
      ...structuredCandidate,
      confidence: "high",
      source: "structured_data",
      needsReview: false,
      reasons: ["Bike type keyword found in structured data category."],
    };
  }

  return extractBikeTypeCandidate(normalizedTitle, description);
}

function buildAdvert(
  sourceUrl: string,
  canonicalUrl: string,
  advertTitle: string,
  description: string,
  imageUrls: string[],
  listingNode: JsonLdNode | null
): ParsedMarktplaatsAdvert {
  const normalizedTitle = normalizeAdvertTitle(advertTitle);
  const brandField = buildBrandField(listingNode, normalizedTitle);
  const modelField = buildModelField(listingNode, normalizedTitle, brandField);
  const bikeTypeField = buildBikeTypeField(listingNode, normalizedTitle, description);

  return {
    sourceName: "marktplaats",
    sourceUrl,
    canonicalUrl,
    advertTitle: normalizedTitle,
    description,
    imageUrls,
    candidateBrand: brandField,
    candidateModel: modelField,
    candidateBikeType: bikeTypeField,
  };
}

export function parseMarktplaatsAdvertHtml(
  sourceUrl: string,
  html: string
): MarktplaatsParseResult {
  const normalizedSourceUrl = normalizeMarktplaatsUrl(sourceUrl);
  if (!normalizedSourceUrl) {
    return createFailure(
      "unsupported_url",
      "Only secure Marktplaats advert URLs are supported.",
      false
    );
  }

  const listingNodes = extractJsonLdNodes(html);
  const listingNode = findListingNode(listingNodes);
  const advertTitle = extractAdvertTitle(html, listingNode);

  if (!advertTitle) {
    return createFailure(
      "missing_advert_title",
      "The page did not expose a stable advert title.",
      false
    );
  }

  const canonicalUrlRaw = extractCanonicalUrl(html, listingNode);
  if (!listingNode && !canonicalUrlRaw) {
    return createFailure(
      "not_an_advert",
      "The page did not expose structured advert data or canonical advert metadata.",
      false
    );
  }

  const canonicalCandidate = canonicalUrlRaw ?? normalizedSourceUrl;
  const canonicalUrl = toAbsoluteUrl(canonicalCandidate, normalizedSourceUrl);
  if (!canonicalUrl || !normalizeMarktplaatsUrl(canonicalUrl)) {
    return createFailure(
      "not_an_advert",
      "The page did not expose a valid Marktplaats advert canonical URL.",
      false
    );
  }

  const description = extractDescription(html, listingNode);
  const imageUrls = extractImageUrls(html, listingNode).map(
    (entry) => toAbsoluteUrl(entry, canonicalUrl) ?? entry
  );

  return {
    ok: true,
    advert: buildAdvert(
      normalizedSourceUrl,
      canonicalUrl,
      advertTitle,
      description,
      imageUrls,
      listingNode
    ),
  };
}

export async function fetchMarktplaatsAdvert(
  sourceUrl: string,
  options: MarktplaatsFetchOptions = {}
): Promise<MarktplaatsParseResult> {
  const normalizedSourceUrl = normalizeMarktplaatsUrl(sourceUrl);
  if (!normalizedSourceUrl) {
    return createFailure(
      "unsupported_url",
      "Only secure Marktplaats advert URLs are supported.",
      false
    );
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

  let response: Response;
  try {
    response = await fetchImpl(normalizedSourceUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "BestBikeFit4U Marktplaats Import/1.0",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    return createFailure(
      "fetch_failed",
      error instanceof Error ? error.message : "Failed to fetch Marktplaats advert.",
      true
    );
  }

  if (!response.ok) {
    return createFailure(
      "unexpected_status",
      `Marktplaats advert fetch failed with status ${response.status}.`,
      response.status >= 500,
      response.status
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!/html/i.test(contentType)) {
    return createFailure(
      "non_html_response",
      "Marktplaats advert fetch did not return HTML content.",
      false
    );
  }

  const contentLength = Number(response.headers.get("content-length") ?? "");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return createFailure(
      "response_too_large",
      "Marktplaats advert response exceeded the parser size limit.",
      false
    );
  }

  const body = await response.text();
  if (Buffer.byteLength(body, "utf8") > maxBytes) {
    return createFailure(
      "response_too_large",
      "Marktplaats advert response exceeded the parser size limit.",
      false
    );
  }

  return parseMarktplaatsAdvertHtml(normalizedSourceUrl, body);
}
