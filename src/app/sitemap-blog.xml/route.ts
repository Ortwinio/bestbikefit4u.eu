import { BLOG_SITEMAP_CACHE_CONTROL } from "@/lib/seo/sitemap/config";
import { getBlogSitemapNodes } from "@/lib/seo/sitemap/sources";
import {
  buildXmlHeadResponse,
  buildXmlResponse,
  renderUrlSetXml,
} from "@/lib/seo/sitemap/xml";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 900;

async function buildPayload() {
  const nodes = await getBlogSitemapNodes();
  return {
    lastModified: nodes.map((node) => node.lastmod).sort().at(-1),
    xml: renderUrlSetXml(nodes),
  };
}

export async function GET(request: Request): Promise<Response> {
  const { xml, lastModified } = await buildPayload();
  return buildXmlResponse(request, xml, {
    cacheControl: BLOG_SITEMAP_CACHE_CONTROL,
    lastModified,
  });
}

export async function HEAD(request: Request): Promise<Response> {
  const { xml, lastModified } = await buildPayload();
  return buildXmlHeadResponse(request, xml, {
    cacheControl: BLOG_SITEMAP_CACHE_CONTROL,
    lastModified,
  });
}
