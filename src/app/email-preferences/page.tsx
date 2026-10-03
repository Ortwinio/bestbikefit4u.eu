import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { emailPreferencesCopy } from "@/i18n/account/emailPreferences";
import { EmailPreferencesClient } from "./EmailPreferencesClient";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: emailPreferencesCopy[locale].title,
    alternates: { canonical: buildLocaleAlternates("/email-preferences", locale).canonical },
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function EmailPreferencesPage() {
  return <EmailPreferencesClient locale={await getRequestLocale()} />;
}
