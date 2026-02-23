import { getSitemapIndexNodes } from "@/lib/seo/sitemap/sources";
import { buildXmlResponse, renderSitemapIndexXml } from "@/lib/seo/sitemap/xml";

export function GET(request: Request): Response {
  const xml = renderSitemapIndexXml(getSitemapIndexNodes());
  return buildXmlResponse(request, xml);
}
