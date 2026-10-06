import type { Locale } from "@/i18n/config";

export const calculatorExamples = {
  nl: {
    label: "voorbeeld",
    height: "Voorbeeld voor iemand van {height} cm · schuif naar jouw maat",
    values: "Voorbeeld met {values} · schuif naar jouw waarden",
  },
  en: {
    label: "example",
    height: "Example for someone {height} cm tall · slide to your height",
    values: "Example with {values} · slide to your values",
  },
} as const;

export function calculatorExampleLine(locale: Locale, values: string[]) {
  return calculatorExamples[locale].values.replace("{values}", new Intl.ListFormat(locale, {
    style: "short", type: "conjunction",
  }).format(values));
}
