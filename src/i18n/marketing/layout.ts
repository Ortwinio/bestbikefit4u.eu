import type { Locale } from "@/i18n/config";

const messages = {
  nl: {
    calculators: "Calculators", guides: "Gidsen", start: "Start gratis bike fit",
    navigation: "Hoofdmenu", openMenu: "Open navigatiemenu", closeMenu: "Sluit navigatiemenu",
    menuDescription: "Navigatie en je account.",
    tagline: "Praktische calculators, fitbegeleiding en hulp bij het afstellen.",
    language: "Taal", dutch: "Nederlands", english: "Engels",
    breadcrumb: "Kruimelpad",
    support: "Hulp", passportCheck: "Fietspaspoort controleren", faq: "Veelgestelde vragen",
  },
  en: {
    calculators: "Calculators", guides: "Guides", start: "Start free bike fit",
    navigation: "Main navigation", openMenu: "Open navigation menu", closeMenu: "Close navigation menu",
    menuDescription: "Site navigation and your account.",
    tagline: "Practical calculators, fit guidance and help with your setup.",
    language: "Language", dutch: "Dutch", english: "English",
    breadcrumb: "Breadcrumb",
    support: "Support", passportCheck: "Bike passport check", faq: "FAQ",
  },
} as const;

export function getMarketingLayoutMessages(locale: Locale) {
  return messages[locale];
}
