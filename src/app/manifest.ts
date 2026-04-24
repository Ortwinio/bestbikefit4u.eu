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
    background_color: "#ffffff",
    theme_color: "#089BE9",
    icons: [
      {
        src: BRAND.assets.appIconPng,
        sizes: "1024x1024",
        type: "image/png",
      },
      {
        src: BRAND.assets.appIconPng,
        sizes: "1024x1024",
        type: "image/png",
      },
      {
        src: BRAND.assets.appIconSvg,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
