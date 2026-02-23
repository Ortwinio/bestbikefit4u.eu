import { getSitemapNodes } from "@/lib/seo/sitemap/sources";
import { buildXmlResponse, renderUrlSetXml } from "@/lib/seo/sitemap/xml";

export function GET(request: Request): Response {
  const xml = renderUrlSetXml(getSitemapNodes("pages"));
  return buildXmlResponse(request, xml);
}
