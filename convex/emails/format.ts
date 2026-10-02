import type { EmailLocale } from "./i18n";

const intlLocale = { nl: "nl-NL", en: "en-GB" } as const;

export function formatNumber(value: number, locale: EmailLocale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    maximumFractionDigits: 2,
  }).format(value);
}

/** UTC makes dates stable across Convex workers and local preview environments. */
export function formatDate(epochMs: number, locale: EmailLocale): string {
  const parts = new Intl.DateTimeFormat(intlLocale[locale], {
    day: locale === "nl" ? "2-digit" : "numeric",
    month: locale === "nl" ? "2-digit" : "short",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(epochMs);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)?.value;
  return [part("day"), part("month"), part("year")].join(locale === "nl" ? "-" : " ");
}

export function formatPrice(amount: number, locale: EmailLocale): string {
  const parts = new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).formatToParts(amount);
  // The fixed email copy uses a compact euro prefix in both languages.
  const currency = parts.find((part) => part.type === "currency")?.value ?? "€";
  const value = parts.filter((part) => part.type !== "currency" && part.type !== "literal")
    .map((part) => part.value).join("");
  return `${currency}${value} per ${locale === "nl" ? "maand" : "month"}`;
}
