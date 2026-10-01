import type { Locale } from "@/i18n/config";

const siteMetadata = {
  nl: {
    description: "Nauwkeurige fietsafstelling voor comfort, een goede houding en prestaties.",
    appTitle: "BestBikeFit4U op je beginscherm",
    appDescription: "Zet BestBikeFit4U op je beginscherm. Open snel je dashboard en fietsafstelling.",
  },
  en: {
    description: "Precision bike fitting for comfort, alignment, and performance.",
    appTitle: "BestBikeFit4U",
    appDescription: "Precision bike fitting for comfort, alignment, and performance.",
  },
};

export const getSiteMetadataCopy = (locale: Locale) => siteMetadata[locale];
