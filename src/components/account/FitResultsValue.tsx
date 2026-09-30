import type { Locale } from "@/i18n/config";

export function formatFitResultsNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    useGrouping: false,
    maximumFractionDigits: 20,
  }).format(value);
}

export function FitResultsValue({ value, locale }: { value: string | number; locale: Locale }) {
  if (typeof value === "number") {
    return <span className="font-mono">{formatFitResultsNumber(value, locale)}</span>;
  }
  return <>{value.split(/(\d+(?:\.\d+)?)/).map((part, index) =>
    /^\d+(?:\.\d+)?$/.test(part)
      ? <span key={index} className="font-mono">{formatFitResultsNumber(Number(part), locale)}</span>
      : <span key={index}>{part}</span>
  )}</>;
}
