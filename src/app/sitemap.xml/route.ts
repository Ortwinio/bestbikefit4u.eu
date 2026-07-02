import { getSitemapIndexNodesWithDynamicBlog } from "@/lib/seo/sitemap/sources";
import {
  buildXmlHeadResponse,
  buildXmlResponse,
  renderSitemapIndexXml,
} from "@/lib/seo/sitemap/xml";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 3600;

async function buildPayload() {
  const nodes = await getSitemapIndexNodesWithDynamicBlog();
  return {
    lastModified: nodes.map((node) => node.lastmod).sort().at(-1),
    xml: renderSitemapIndexXml(nodes),
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
