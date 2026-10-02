import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/request";
import { emailPreferencesCopy } from "@/i18n/account/emailPreferences";
import { EmailPreferencesClient } from "./EmailPreferencesClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: emailPreferencesCopy[await getRequestLocale()].title,
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function EmailPreferencesPage() {
  return <EmailPreferencesClient locale={await getRequestLocale()} />;
}
