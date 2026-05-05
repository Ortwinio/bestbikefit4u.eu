import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getDictionary } from "@/i18n/getDictionary";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { getPublicCalculatorRouteEntry } from "@/lib/public-calculators";
import { PressureCalculatorPageContent } from "./PressureCalculatorPageContent";

function getLocalizedPressureCalculatorPath(locale: "en" | "nl") {
  const routeEntry = getPublicCalculatorRouteEntry("tire-pressure");
  return withLocalePrefix(routeEntry.localizedPaths[locale], locale);
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const routeEntry = getPublicCalculatorRouteEntry("tire-pressure");
  const localizedPath = routeEntry.localizedPaths[locale];
  const alternates = buildLocaleAlternates(localizedPath, locale);

  return {
    title: dictionary.pressure.publicPage.title,
    description: dictionary.pressure.publicPage.description,
    openGraph: {
      title: dictionary.pressure.publicPage.title,
      description: dictionary.pressure.publicPage.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function BandenspanningCalculatorPage() {
  const locale = await getRequestLocale();

  if (locale !== "nl") {
    permanentRedirect(getLocalizedPressureCalculatorPath("en"));
  }

  return <PressureCalculatorPageContent locale={locale} />;
}
