import type { Locale } from "@/i18n/config";

const siteMetadata = {
  nl: {
    description: "Nauwkeurige fietsafstelling voor comfort, een goede houding en prestaties.",
    appTitle: "BikeFitBoost op je beginscherm",
    appDescription: "Zet BikeFitBoost op je beginscherm. Open snel je dashboard en fietsafstelling.",
  },
  en: {
    description: "Precision bike fitting for comfort, alignment, and performance.",
    appTitle: "BikeFitBoost",
    appDescription: "Precision bike fitting for comfort, alignment, and performance.",
  },
};

export const getSiteMetadataCopy = (locale: Locale) => siteMetadata[locale];
