import { permanentRedirect } from "next/navigation";
import {
  PressureCalculatorPageContent,
  generateMetadata,
} from "../bandenspanning-calculator/page";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { getPublicCalculatorRouteEntry } from "@/lib/public-calculators";

export { generateMetadata };

export default async function TirePressureCalculatorPage() {
  const locale = await getRequestLocale();

  if (locale !== "en") {
    const routeEntry = getPublicCalculatorRouteEntry("tire-pressure");
    permanentRedirect(withLocalePrefix(routeEntry.localizedPaths.nl, "nl"));
  }

  return <PressureCalculatorPageContent />;
}
