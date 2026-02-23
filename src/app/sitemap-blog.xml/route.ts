import { BLOG_SITEMAP_CACHE_CONTROL } from "@/lib/seo/sitemap/config";
import { getSitemapNodes } from "@/lib/seo/sitemap/sources";
import { buildXmlResponse, renderUrlSetXml } from "@/lib/seo/sitemap/xml";

export function GET(request: Request): Response {
  const xml = renderUrlSetXml(getSitemapNodes("blog"));
  return buildXmlResponse(request, xml, {
    cacheControl: BLOG_SITEMAP_CACHE_CONTROL,
  });
}
