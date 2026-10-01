import { isLocale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/request";
import { buildSiteManifest } from "@/lib/seo/siteManifest";

export async function GET(request: Request) {
  const requestedLocale = new URL(request.url).searchParams.get("locale");
  const locale = isLocale(requestedLocale) ? requestedLocale : await getRequestLocale();
  return Response.json(buildSiteManifest(locale), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "private, no-store" },
  });
}
