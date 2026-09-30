import type { Locale } from "@/i18n/config";
import { reportErrors } from "@/i18n/account/reportErrors";

export function getPdfResponseError(status: number, locale: Locale): string {
  const copy = reportErrors[locale];
  switch (status) {
    case 401:
    case 403:
    case 404:
    case 409:
    case 429:
      return copy[status];
    default:
      return copy.fallback;
  }
}
