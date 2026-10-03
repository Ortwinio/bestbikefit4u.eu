import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { advicePageCopy } from "@/i18n/account/advicePage";
import { AdvicePageClient } from "./AdvicePageClient";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = advicePageCopy[locale];
  return { title: copy.title, description: copy.description, robots: { index: false, follow: false },
    alternates: { canonical: `${BRAND.siteUrl}${withLocalePrefix("/profile/advice", locale)}` },
    openGraph: { title: copy.title, description: copy.description } };
}

export default async function AdvicePage() {
  return <AdvicePageClient locale={await getRequestLocale()} />;
}
