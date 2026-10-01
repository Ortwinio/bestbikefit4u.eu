import { permanentRedirect } from "next/navigation";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";

export default async function RetiredBikeImportPage() {
  permanentRedirect(withLocalePrefix("/bikes/new", await getRequestLocale()));
}
