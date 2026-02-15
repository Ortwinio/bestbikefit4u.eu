import "server-only";

import { DEFAULT_LOCALE, type Locale, normalizeLocale } from "./config";
import type en from "./messages/en";

export type Messages = typeof en;

const dictionaryLoaders: Record<Locale, () => Promise<Messages>> = {
  en: async () => (await import("./messages/en")).default,
  nl: async () => (await import("./messages/nl")).default,
};

export async function getDictionary(locale: Locale): Promise<Messages> {
  return dictionaryLoaders[locale]();
}

export async function getDictionaryForLocale(
  localeValue: string | null | undefined
): Promise<Messages> {
  const locale = normalizeLocale(localeValue) ?? DEFAULT_LOCALE;
  return getDictionary(locale);
}
