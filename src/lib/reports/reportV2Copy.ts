import en from "@/i18n/messages/en";
import nl from "@/i18n/messages/nl";
import type { Locale } from "@/i18n/config";

export type ReportV2Copy = (typeof en)["dashboard"]["results"]["reportV2"];

const copyByLocale: Record<Locale, ReportV2Copy> = {
  en: en.dashboard.results.reportV2,
  nl: nl.dashboard.results.reportV2,
};

export function getReportV2Copy(locale: Locale | null | undefined): ReportV2Copy {
  return copyByLocale[locale ?? "en"] ?? copyByLocale.en;
}

