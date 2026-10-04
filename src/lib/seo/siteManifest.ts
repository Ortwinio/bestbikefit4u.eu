import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";
import type { Locale } from "@/i18n/config";
import { getSiteMetadataCopy } from "@/i18n/marketing/siteMetadata";
import { withLocalePrefix } from "@/i18n/navigation";

export function buildSiteManifest(locale: Locale): MetadataRoute.Manifest {
  return {
    id: "/",
    name: BRAND.name,
    short_name: BRAND.name,
    description: getSiteMetadataCopy(locale).description,
    lang: locale,
    start_url: withLocalePrefix("/", locale),
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5F8F3",
    theme_color: "#0F2420",
    icons: [
      { src: BRAND.assets.appIcon192, sizes: "192x192", type: "image/png" },
      { src: BRAND.assets.appIconPng, sizes: "512x512", type: "image/png" },
      { src: BRAND.assets.appIconMaskable, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
