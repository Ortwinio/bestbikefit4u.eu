import { redirect } from "next/navigation";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";

export default async function CalculationEnginePage() {
  const locale = await getRequestLocale();
  redirect(withLocalePrefix("/about", locale));
}
