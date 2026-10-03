import type { Locale } from "@/i18n/config";

const copy = {
  nl: { loading: "Profielscore laden…", open: "Open Mijn profiel" },
  en: { loading: "Loading profile score…", open: "Open My profile" },
};

export const getProfileStrengthCopy = (locale: Locale) => copy[locale];
