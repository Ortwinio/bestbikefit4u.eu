import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: "BestBikeFit4U",
    description: "Precision bike fitting for comfort, alignment, and performance.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5F8F3",
    theme_color: "#0F2420",
    icons: [
      {
        src: BRAND.assets.appIcon192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: BRAND.assets.appIconPng,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: BRAND.assets.appIconMaskable,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
