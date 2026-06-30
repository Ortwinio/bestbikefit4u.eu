import { PublicPageShell } from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { PressureCalculatorCta } from "@/components/features/pressure/PressureCalculatorCta";
import { PressureCalculatorFaq } from "@/components/features/pressure/PressureCalculatorFaq";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import { PressureCalculatorHero } from "@/components/features/pressure/PressureCalculatorHero";
import { RatingBadge } from "@/components/public";
import { BRAND } from "@/config/brand";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { getPublicCalculatorRouteEntry } from "@/lib/public-calculators";
import { CALCULATOR_AGGREGATE_RATING, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { withLocalePrefix } from "@/i18n/navigation";

function getLocalizedPressureCalculatorPath(locale: Locale) {
  const routeEntry = getPublicCalculatorRouteEntry("tire-pressure");
  return withLocalePrefix(routeEntry.localizedPaths[locale], locale);
}

export async function PressureCalculatorPageContent({
  locale,
}: {
  locale: Locale;
}) {
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
          aggregateRating: CALCULATOR_AGGREGATE_RATING,
        })}
      />
      <PressureCalculatorHero
        locale={locale}
        title={dictionary.pressure.publicPage.h1}
        subtitle={dictionary.pressure.publicPage.subtitle}
        chips={dictionary.pressure.publicPage.chips}
      />
      <div className="mx-auto mt-4 max-w-4xl px-4 sm:px-6 lg:px-8">
        <RatingBadge rating="4.8" count={locale === "nl" ? "380+ rijders" : "380+ riders"} />
      </div>
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
