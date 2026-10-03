import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { EditorialShell, EditorialSection, EditorialCard } from "@/components/science/EditorialLayout";
import { BRAND } from "@/config/brand";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { authorshipMessages } from "@/i18n/marketing/authorship";
import { methodsCopy } from "@/i18n/marketing/science";
import { performanceMessages } from "@/i18n/calculators/performance";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = authorshipMessages[locale];
  const alternates = buildLocaleAlternates("/methods", locale);
  return {
    title: copy.methodsTitle, description: copy.methodsDescription, alternates,
    openGraph: { title: copy.methodsTitle, description: copy.methodsDescription, url: alternates.canonical,
      type: "website", locale: locale === "nl" ? "nl_NL" : "en_US" },
  };
}

export default async function MethodsPage() {
  const locale = await getRequestLocale();
  const copy = authorshipMessages[locale];
  const sources = performanceMessages[locale];
  const linkClass = "inline-flex min-h-11 items-center font-semibold text-primary underline focus-visible:focus-ring";
  return <EditorialShell>
    <JsonLd schema={{ "@context": "https://schema.org", "@type": "WebPage", name: copy.methodsTitle,
      description: copy.methodsDescription, inLanguage: locale,
      url: new URL(withLocalePrefix("/methods", locale), BRAND.siteUrl).href }} />
    <header className="py-12 sm:py-16">
      <h1 className="max-w-4xl font-display text-4xl font-bold sm:text-6xl">{copy.methodsTitle.split(" | ")[0]}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">{copy.intro}</p>
    </header>
    <EditorialSection header={{ title: copy.scientificTitle, description: copy.scientificBody }}>
      <ul className="space-y-6">
        {[{ text: sources.carbSource, url: sources.carbSourceUrl },
          { text: sources.fluidSource, url: sources.fluidSourceUrl }].map(source => <li key={source.url}>
          <p className="leading-relaxed">{source.text}</p>
          <a href={source.url} className={linkClass}>{copy.sourceLink}</a>
        </li>)}
      </ul>
    </EditorialSection>
    <EditorialSection header={{ title: copy.practiceTitle, description: copy.practiceBody }}>
      <div className="grid gap-5 md:grid-cols-3">
        {methodsCopy[locale].methods.map(method => <EditorialCard key={method.name}
          title={method.name} description={method.focus}>
          <p><strong>{copy.strength}:</strong> {method.strength}</p>
          <p><strong>{copy.limit}:</strong> {method.limit}</p>
        </EditorialCard>)}
      </div>
      <Link href={withLocalePrefix("/science/bike-fit-methods", locale)} className={linkClass}>
        {copy.methodsLink}
      </Link>
    </EditorialSection>
    <EditorialSection header={{ title: copy.ownTitle, description: copy.ownBody }}>
      <p className="max-w-3xl leading-relaxed">{copy.pressureRule}</p>
      <p className="mt-4 max-w-3xl leading-relaxed">{copy.limits}</p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <Link href={withLocalePrefix("/science/calculation-engine", locale)} className={linkClass}>
          {copy.engineLink}
        </Link>
        <Link href={withLocalePrefix(locale === "nl" ? "/bandenspanning-calculator" : "/tire-pressure-calculator", locale)}
          className={linkClass}>{copy.pressureLink}</Link>
      </div>
    </EditorialSection>
  </EditorialShell>;
}
