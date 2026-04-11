import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { PublicPageShell } from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { PressureCalculatorCta } from "@/components/features/pressure/PressureCalculatorCta";
import { PressureCalculatorFaq } from "@/components/features/pressure/PressureCalculatorFaq";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import { PressureCalculatorHero } from "@/components/features/pressure/PressureCalculatorHero";
import { BRAND } from "@/config/brand";
import { getDictionary } from "@/i18n/getDictionary";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getPublicCalculatorRouteEntry } from "@/lib/public-calculators";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";

function getLocalizedPressureCalculatorPath(locale: "en" | "nl") {
  const routeEntry = getPublicCalculatorRouteEntry("tire-pressure");
  return withLocalePrefix(routeEntry.localizedPaths[locale], locale);
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const routeEntry = getPublicCalculatorRouteEntry("tire-pressure");
  const localizedPath = routeEntry.localizedPaths[locale];
  const alternates = buildLocaleAlternates(localizedPath, locale);

  return {
    title: dictionary.pressure.publicPage.title,
    description: dictionary.pressure.publicPage.description,
    openGraph: {
      title: dictionary.pressure.publicPage.title,
      description: dictionary.pressure.publicPage.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export async function PressureCalculatorPageContent() {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const pagePath = getLocalizedPressureCalculatorPath(locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_26%,var(--background)_74%)_100%)]">
      <JsonLd
        schema={buildWebApplicationSchema({
          name: locale === "nl" ? "Bandenspanning calculator" : "Tire Pressure Calculator",
          description:
            locale === "nl"
              ? "Gratis calculator voor racefiets, gravelbike en MTB bandenspanning."
              : "Free calculator for road, gravel, and MTB tire pressure.",
          url: pageUrl,
        })}
      />
      <PressureCalculatorHero
        locale={locale}
        title={dictionary.pressure.publicPage.h1}
        subtitle={dictionary.pressure.publicPage.subtitle}
        chips={dictionary.pressure.publicPage.chips}
      />
      <PressureCalculatorForm
        locale={locale}
        labels={dictionary.pressure.form}
        resultLabels={dictionary.pressure.result}
      />
      <PressureCalculatorFaq locale={locale} />
      <div className="mx-auto mt-10 max-w-4xl px-4 sm:px-6 lg:px-8">
        <RelatedLinksSection
          title={locale === "nl" ? "Gerelateerde tools en gidsen" : "Related tools and guides"}
          links={getRelatedLinks("tire-pressure", locale)}
          locale={locale}
        />
      </div>
      <PressureCalculatorCta
        locale={locale}
        pagePath={pagePath}
        labels={dictionary.pressure.cta}
      />
    </PublicPageShell>
  );
}

export default async function BandenspanningCalculatorPage() {
  const locale = await getRequestLocale();

  if (locale !== "nl") {
    permanentRedirect(getLocalizedPressureCalculatorPath("en"));
  }

  return <PressureCalculatorPageContent />;
}
