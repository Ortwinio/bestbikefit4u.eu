import { DEFAULT_LOCALE, type Locale } from "./config";
import en from "./messages/en";
import nl from "./messages/nl";

export type DashboardMessages = (typeof en)["dashboard"];
export type LanguageSwitchLabels = Pick<
  (typeof en)["common"],
  "language" | "english" | "dutch"
>;

const dashboardByLocale: Record<Locale, DashboardMessages> = {
  en: en.dashboard,
  nl: nl.dashboard,
};

const languageSwitchByLocale: Record<Locale, LanguageSwitchLabels> = {
  en: en.common,
  nl: nl.common,
};

export function getDashboardMessages(
  locale: Locale | null | undefined
): DashboardMessages {
  if (!locale) {
    return dashboardByLocale[DEFAULT_LOCALE];
  }

  return dashboardByLocale[locale] ?? dashboardByLocale[DEFAULT_LOCALE];
}

export function getLanguageSwitchLabels(
  locale: Locale | null | undefined
): LanguageSwitchLabels {
  if (!locale) {
    return languageSwitchByLocale[DEFAULT_LOCALE];
  }

  return languageSwitchByLocale[locale] ?? languageSwitchByLocale[DEFAULT_LOCALE];
}

export function formatMessage(
  template: string,
  values: Record<string, string | number>
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replaceAll(`{${key}}`, String(value)),
    template
  );
}
