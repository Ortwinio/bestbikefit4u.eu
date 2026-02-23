import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";
import {
  ROBOTS_DISALLOW_PATHS,
  SITEMAP_INDEX_PATH,
} from "@/lib/seo/sitemap/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...ROBOTS_DISALLOW_PATHS],
      },
    ],
    sitemap: `${BRAND.siteUrl}${SITEMAP_INDEX_PATH}`,
    host: BRAND.host,
  };
}
