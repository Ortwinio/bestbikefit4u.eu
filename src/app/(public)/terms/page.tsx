import type { Metadata } from "next";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { LegalPage } from "../privacy/LegalPage";
import { getContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = getContent(locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
    },
    alternates: buildLocaleAlternates("/terms", locale),
  };
}

export default async function TermsPage() {
  const locale = await getRequestLocale();
  return <LegalPage kind="terms" locale={locale} page={getContent(locale)} />;
}
