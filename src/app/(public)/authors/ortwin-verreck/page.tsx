import type { Metadata } from "next";
import Link from "next/link";
import { AUTHORSHIP } from "@/config/authorship";
import { BRAND } from "@/config/brand";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPersonSchema } from "@/lib/seo/jsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const alternates = buildLocaleAlternates(AUTHORSHIP.path, locale);
  const title = `${AUTHORSHIP.name} | ${BRAND.name}`;
  return {
    title, description: title, alternates,
    openGraph: { title, description: title, url: alternates.canonical, type: "profile",
      locale: locale === "nl" ? "nl_NL" : "en_US" },
  };
}

export default async function AuthorPage() {
  const locale = await getRequestLocale();
  return <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
    <JsonLd schema={buildPersonSchema(locale)} />
    <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">{AUTHORSHIP.name}</h1>
    <Link href={withLocalePrefix("/", locale)}
      className="mt-6 inline-flex min-h-11 items-center font-semibold text-primary underline focus-visible:focus-ring">
      {BRAND.name}
    </Link>
  </section>;
}
