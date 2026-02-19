import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/trpc/",
          "/dashboard",
          "/en/dashboard",
          "/nl/dashboard",
          "/en/login",
          "/nl/login",
        ],
      },
    ],
    sitemap: `${BRAND.siteUrl}/sitemap.xml`,
    host: BRAND.host,
  };
}
