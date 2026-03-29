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
        src: "/logo/bestbikefit4u_mark.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo/bestbikefit4u_icon_app.png",
        sizes: "1024x1024",
        type: "image/png",
      },
      {
        src: "/logo/bestbikefit4u_mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
