import { getSitemapNodes } from "@/lib/seo/sitemap/sources";
import { normalizeLastmod, toAbsoluteUrl } from "@/lib/seo/sitemap/normalize";
import type { SitemapUrlNode } from "@/lib/seo/sitemap/types";
import { withLocalePrefix } from "@/i18n/navigation";
import { listPublishedGuideRecords } from "@/lib/guides/content";
import {
  buildXmlHeadResponse,
  buildXmlResponse,
  renderUrlSetXml,
} from "@/lib/seo/sitemap/xml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 3600;

function buildGuideNode(path: string, lastmod: string): SitemapUrlNode[] {
  const enPath = withLocalePrefix(path, "en");
  const nlPath = withLocalePrefix(path, "nl");
  const alternates: SitemapUrlNode["alternates"] = [
    { hreflang: "en", href: toAbsoluteUrl(enPath) },
    { hreflang: "nl", href: toAbsoluteUrl(nlPath) },
    { hreflang: "x-default", href: toAbsoluteUrl(enPath) },
  ];

  return [enPath, nlPath].map((localizedPath) => ({
    loc: toAbsoluteUrl(localizedPath),
    lastmod,
    changefreq: "monthly",
    priority: path === "/guides" ? 0.8 : 0.7,
    alternates,
  }));
}

async function buildPayload() {
  const nodes = [...getSitemapNodes("guides")];
  const publishedGuides = await listPublishedGuideRecords();
  const merged = new Map<string, SitemapUrlNode>(
    nodes.map((node) => [node.loc, node])
  );

  for (const guide of publishedGuides) {
    const lastmod = normalizeLastmod(
      new Date(
        guide.lastUpdatedAt ?? guide.publishedAt ?? guide.updatedAt ?? guide.createdAt
      ).toISOString()
    );

    for (const node of buildGuideNode(guide.path, lastmod)) {
      merged.set(node.loc, node);
    }
  }

  const mergedNodes = [...merged.values()].sort((a, b) => a.loc.localeCompare(b.loc));
  return {
    lastModified: mergedNodes.map((node) => node.lastmod).sort().at(-1),
    xml: renderUrlSetXml(mergedNodes),
  };
}

export async function GET(request: Request): Promise<Response> {
  const { xml, lastModified } = await buildPayload();
  return buildXmlResponse(request, xml, { lastModified });
}

export async function HEAD(request: Request): Promise<Response> {
  const { xml, lastModified } = await buildPayload();
  return buildXmlHeadResponse(request, xml, { lastModified });
}
