import { CalculatorAnswerSection, ContentDisclosure } from "@/components/calculators/CalculatorAnswerSection";
import { getEquipmentAnswer } from "@/lib/seo/calculatorAnswers/equipment";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { PressureCalculatorFaq, getPressureCalculatorFaqContent } from "@/components/features/pressure/PressureCalculatorFaq";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import { BRAND } from "@/config/brand";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { getPublicCalculatorRouteEntry } from "@/lib/public-calculators";
import { buildFaqPageSchema, buildCalculatorPageSchemas } from "@/lib/seo/jsonLd";
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
        schema={[
          ...buildCalculatorPageSchemas({
            name: locale === "nl" ? "Bandenspanning calculator" : "Tire Pressure Calculator",
            description:
              locale === "nl"
                ? "Gratis calculator voor racefiets, gravelbike en MTB bandenspanning."
                : "Free calculator for road, gravel, and MTB tire pressure.",
            url: pageUrl,
            locale,
          }),
          buildFaqPageSchema(getPressureCalculatorFaqContent(locale).items),
        ]}
      />
      <PressureCalculatorForm
        locale={locale}
        copy={dictionary.tirePressureCalculator}
        labels={dictionary.pressure.form}
        resultLabels={dictionary.pressure.result}
      />
      <CalculatorAnswerSection id="tire-pressure" locale={locale} content={getEquipmentAnswer("tire-pressure", locale)} />
      <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-8 xl:px-16">
        <ContentDisclosure title={getPressureCalculatorFaqContent(locale).title}>
          <PressureCalculatorFaq locale={locale} />
        </ContentDisclosure>
        <div className="mx-auto mt-10 max-w-4xl px-4 sm:px-6 lg:px-8">
          <ContentDisclosure title={dictionary.tirePressureCalculator.related}>
          <RelatedLinksSection
            title={dictionary.tirePressureCalculator.related}
            links={getRelatedLinks("tire-pressure", locale).slice(0, 3)}
            locale={locale}
          />
          </ContentDisclosure>
        </div>

      </div>
    </div>
  );
}
