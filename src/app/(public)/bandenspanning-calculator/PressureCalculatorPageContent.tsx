import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { PressureCalculatorCta } from "@/components/features/pressure/PressureCalculatorCta";
import { PressureCalculatorFaq } from "@/components/features/pressure/PressureCalculatorFaq";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
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

export async function PressureCalculatorPageContent({ locale }: { locale: Locale }) {
  const dictionary = await getDictionary(locale);
  const pagePath = getLocalizedPressureCalculatorPath(locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();

  return (
    <div className="bg-background text-foreground">
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
      <PressureCalculatorForm
        locale={locale}
        copy={dictionary.tirePressureCalculator}
        labels={dictionary.pressure.form}
        resultLabels={dictionary.pressure.result}
      />
      <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-8 xl:px-16">
        <PressureCalculatorFaq locale={locale} />
        <div className="mx-auto mt-10 max-w-4xl px-4 sm:px-6 lg:px-8">
          <RelatedLinksSection
            title={dictionary.tirePressureCalculator.related}
            links={getRelatedLinks("tire-pressure", locale)}
            locale={locale}
          />
        </div>
        <PressureCalculatorCta
          locale={locale}
          pagePath={pagePath}
          labels={dictionary.pressure.cta}
        />
      </div>
    </div>
  );
}
