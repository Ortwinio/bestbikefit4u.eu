import type { Locale } from "@/i18n/config";

export function getGuideToolAnchor(locale: Locale, toolLabel: string): string {
  return locale === "nl" ? `Gebruik de ${toolLabel}` : `Use the ${toolLabel}`;
}
