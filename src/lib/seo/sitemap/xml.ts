import { createHash } from "node:crypto";
import { DEFAULT_SITEMAP_CACHE_CONTROL } from "./config";
import type { SitemapIndexNode, SitemapUrlNode } from "./types";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function renderAlternates(node: SitemapUrlNode): string {
  return node.alternates
    .map(
      (alternate) =>
        `<xhtml:link rel="alternate" hreflang="${escapeXml(
          alternate.hreflang
        )}" href="${escapeXml(alternate.href)}"/>`
    )
    .join("");
}

export function renderUrlSetXml(nodes: SitemapUrlNode[]): string {
  const urlEntries = nodes
    .map((node) => {
      const lastmod = `<lastmod>${escapeXml(node.lastmod)}</lastmod>`;
      const changefreq = node.changefreq
        ? `<changefreq>${escapeXml(node.changefreq)}</changefreq>`
        : "";
      const priority =
        typeof node.priority === "number"
          ? `<priority>${node.priority.toFixed(1)}</priority>`
          : "";
      const alternates = renderAlternates(node);

      return `<url><loc>${escapeXml(node.loc)}</loc>${alternates}${lastmod}${changefreq}${priority}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urlEntries}</urlset>`;
}

export function renderSitemapIndexXml(nodes: SitemapIndexNode[]): string {
  const sitemapEntries = nodes
    .map(
      (node) =>
        `<sitemap><loc>${escapeXml(node.loc)}</loc><lastmod>${escapeXml(
          node.lastmod
        )}</lastmod></sitemap>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}</sitemapindex>`;
}

function buildEtag(payload: string): string {
  const digest = createHash("sha1").update(payload).digest("hex");
  return `"${digest}"`;
}

type XmlResponseOptions = {
  cacheControl?: string;
};

export function buildXmlResponse(
  request: Request,
  payload: string,
  options: XmlResponseOptions = {}
): Response {
  const etag = buildEtag(payload);
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": options.cacheControl ?? DEFAULT_SITEMAP_CACHE_CONTROL,
      },
    });
  }

  return new Response(payload, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": options.cacheControl ?? DEFAULT_SITEMAP_CACHE_CONTROL,
      ETag: etag,
    },
  });
}
