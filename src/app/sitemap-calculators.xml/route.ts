import { getSitemapNodes } from "@/lib/seo/sitemap/sources";
import {
  buildXmlHeadResponse,
  latestSitemapLastmod,
  buildXmlResponse,
  renderUrlSetXml,
} from "@/lib/seo/sitemap/xml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 3600;

function buildPayload() {
  const nodes = getSitemapNodes("calculators");
  return {
    lastModified: latestSitemapLastmod(nodes),
    xml: renderUrlSetXml(nodes),
  };
}

export function GET(request: Request): Response {
  const { xml, lastModified } = buildPayload();
  return buildXmlResponse(request, xml, { lastModified });
}

export function HEAD(request: Request): Response {
  const { xml, lastModified } = buildPayload();
  return buildXmlHeadResponse(request, xml, { lastModified });
}
