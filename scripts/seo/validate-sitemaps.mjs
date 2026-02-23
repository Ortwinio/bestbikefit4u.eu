#!/usr/bin/env node

const baseUrl = process.env.SITEMAP_BASE_URL ?? process.env.BASE_URL ?? "http://127.0.0.1:3000";
const sitemapIndexPath = "/sitemap.xml";
const expectedSitemapPaths = [
  "/sitemap-pages.xml",
  "/sitemap-calculators.xml",
  "/sitemap-guides.xml",
  "/sitemap-blog.xml",
];

const disallowedUrlPathPrefixes = [
  "/api/",
  "/trpc/",
  "/dashboard",
  "/en/dashboard",
  "/nl/dashboard",
  "/fit",
  "/en/fit",
  "/nl/fit",
  "/bikes",
  "/en/bikes",
  "/nl/bikes",
  "/profile",
  "/en/profile",
  "/nl/profile",
  "/login",
  "/en/login",
  "/nl/login",
];

let hasFailure = false;

function fail(message) {
  hasFailure = true;
  console.error(`[seo:sitemaps] FAIL: ${message}`);
}

function ok(message) {
  console.log(`[seo:sitemaps] OK: ${message}`);
}

function toAbsoluteUrl(pathname) {
  return new URL(pathname, baseUrl).toString();
}

async function fetchXml(pathname) {
  const url = toAbsoluteUrl(pathname);
  const response = await fetch(url, { redirect: "manual" });
  if (response.status !== 200) {
    fail(`${pathname} returned status ${response.status} (expected 200).`);
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("xml")) {
    fail(`${pathname} has content-type "${contentType}" (expected XML).`);
  }

  const payload = await response.text();
  if (!payload.startsWith("<?xml")) {
    fail(`${pathname} does not start with an XML declaration.`);
  }

  return { pathname, url, payload };
}

function extractBlocks(xml, tagName) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "g");
  return [...xml.matchAll(regex)].map((match) => match[1] ?? "");
}

function extractFirstLoc(block) {
  const match = block.match(/<loc>([^<]+)<\/loc>/);
  return match?.[1] ?? null;
}

function parseAlternateLinks(urlBlock) {
  const regex =
    /<xhtml:link[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"[^>]*\/>/g;
  return [...urlBlock.matchAll(regex)].map((match) => ({
    hreflang: match[1],
    href: match[2],
  }));
}

function parsePathname(urlValue) {
  try {
    return new URL(urlValue).pathname;
  } catch {
    return null;
  }
}

function isBlockedPath(pathname) {
  return disallowedUrlPathPrefixes.some((prefix) => {
    if (prefix.endsWith("/")) {
      return pathname.startsWith(prefix);
    }

    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

function validateUrlQuality(urlValue, sourcePathname) {
  let parsed;
  try {
    parsed = new URL(urlValue);
  } catch {
    fail(`${sourcePathname} contains invalid absolute URL: ${urlValue}`);
    return;
  }

  if (parsed.search || parsed.hash) {
    fail(`${sourcePathname} contains non-canonical URL with query/hash: ${urlValue}`);
  }

  if (parsed.pathname !== parsed.pathname.toLowerCase()) {
    fail(`${sourcePathname} contains uppercase path segment: ${urlValue}`);
  }

  if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
    fail(`${sourcePathname} contains trailing slash in non-root path: ${urlValue}`);
  }

  if (isBlockedPath(parsed.pathname)) {
    fail(`${sourcePathname} contains blocked/private URL: ${urlValue}`);
  }

  if (baseUrl.startsWith("https://") && parsed.protocol !== "https:") {
    fail(`${sourcePathname} contains non-HTTPS URL while base is HTTPS: ${urlValue}`);
  }
}

function validateSitemapIndex(indexPayload) {
  if (!indexPayload.includes("<sitemapindex")) {
    fail("sitemap index payload is missing <sitemapindex> root node.");
  }

  if (!indexPayload.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    fail("sitemap index payload is missing the sitemap XML namespace.");
  }

  const sitemapBlocks = extractBlocks(indexPayload, "sitemap");
  const locs = sitemapBlocks
    .map((block) => extractFirstLoc(block))
    .filter((value) => typeof value === "string");

  const expectedLocs = expectedSitemapPaths.map((path) => toAbsoluteUrl(path));
  for (const expected of expectedLocs) {
    if (!locs.includes(expected)) {
      fail(`sitemap index is missing child sitemap URL: ${expected}`);
    }
  }
}

function validateUrlSet(pathname, payload) {
  if (!payload.includes("<urlset")) {
    fail(`${pathname} is missing <urlset> root node.`);
    return;
  }

  if (!payload.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    fail(`${pathname} is missing sitemap namespace.`);
  }

  if (!payload.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')) {
    fail(`${pathname} is missing xhtml namespace.`);
  }

  const urlBlocks = extractBlocks(payload, "url");
  if (urlBlocks.length >= 50000) {
    fail(`${pathname} exceeds sitemap URL count limit (>= 50,000).`);
  }

  const sizeInBytes = Buffer.byteLength(payload, "utf8");
  const sizeLimit = 50 * 1024 * 1024;
  if (sizeInBytes >= sizeLimit) {
    fail(`${pathname} exceeds sitemap size limit (>= 50MB).`);
  }

  const blockByLoc = new Map();
  for (const block of urlBlocks) {
    const loc = extractFirstLoc(block);
    if (!loc) {
      fail(`${pathname} contains <url> block without <loc>.`);
      continue;
    }

    validateUrlQuality(loc, pathname);

    if (blockByLoc.has(loc)) {
      fail(`${pathname} contains duplicate <loc>: ${loc}`);
    }

    const alternates = parseAlternateLinks(block);
    if (alternates.length > 0 && !alternates.some((item) => item.hreflang === "x-default")) {
      fail(`${pathname} URL is missing x-default alternate: ${loc}`);
    }

    blockByLoc.set(loc, {
      loc,
      alternates,
      hasLastmod: block.includes("<lastmod>"),
    });
  }

  for (const { loc, alternates, hasLastmod } of blockByLoc.values()) {
    if (!hasLastmod) {
      fail(`${pathname} URL is missing <lastmod>: ${loc}`);
    }

    for (const alternate of alternates) {
      validateUrlQuality(alternate.href, pathname);
      if (alternate.hreflang === "x-default") {
        continue;
      }

      if (!blockByLoc.has(alternate.href)) {
        fail(
          `${pathname} alternate href does not exist as a sitemap URL (${alternate.hreflang}): ${alternate.href}`
        );
        continue;
      }

      const target = blockByLoc.get(alternate.href);
      const isReciprocal = target.alternates.some(
        (targetAlternate) => targetAlternate.href === loc
      );
      if (!isReciprocal) {
        fail(`${pathname} hreflang is not reciprocal between ${loc} and ${alternate.href}`);
      }
    }
  }
}

async function main() {
  ok(`Validating sitemap endpoints against ${baseUrl}`);

  const indexResponse = await fetchXml(sitemapIndexPath);
  if (!indexResponse) {
    process.exit(1);
  }

  validateSitemapIndex(indexResponse.payload);

  for (const childPath of expectedSitemapPaths) {
    const childResponse = await fetchXml(childPath);
    if (!childResponse) {
      continue;
    }

    validateUrlSet(childPath, childResponse.payload);
  }

  if (hasFailure) {
    process.exit(1);
  }

  ok("All sitemap checks passed.");
}

main().catch((error) => {
  console.error("[seo:sitemaps] FAIL: unexpected validation error.");
  console.error(error);
  process.exit(1);
});
