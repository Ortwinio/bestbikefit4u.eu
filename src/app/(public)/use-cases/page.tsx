import { redirect } from "next/navigation";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";

export default async function UseCasesIndexPage() {
  const locale = await getRequestLocale();
  redirect(withLocalePrefix("/guides", locale));
}
