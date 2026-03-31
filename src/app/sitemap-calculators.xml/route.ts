import { getSitemapNodes } from "@/lib/seo/sitemap/sources";
import { buildXmlResponse, renderUrlSetXml } from "@/lib/seo/sitemap/xml";

export const runtime = "nodejs";

export function GET(request: Request): Response {
  const xml = renderUrlSetXml(getSitemapNodes("calculators"));
  return buildXmlResponse(request, xml);
}
