import type { Metadata } from "next";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { LegalPage } from "../privacy/LegalPage";
import { content } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = content[locale];

  const alternates = buildLocaleAlternates("/privacy", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  return <LegalPage kind="privacy" locale={locale} page={content[locale]} />;
}
