import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { BRAND } from "@/config/brand";

const titles = {
  dashboard: "Je fietsoverzicht",
  profile: "Je fietsersprofiel",
  fit: "Je fietsafstelling",
  "fit-history": "Je afstellingsgeschiedenis",
  settings: "Je instellingen",
  feedback: "Je feedback",
};

export function getAccountMetadata(locale: Locale, page: keyof typeof titles): Metadata {
  if (locale !== "nl") return {};
  const title = `${titles[page]} | ${BRAND.name}`;
  const description = "Fietsafstelling voor comfort, een goede houding en betere prestaties.";
  return {
    title,
    description,
    openGraph: {
      title, description,
      images: [{ url: BRAND.assets.socialImage, width: 1200, height: 630, alt: BRAND.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [BRAND.assets.socialImage] },
  };
}
