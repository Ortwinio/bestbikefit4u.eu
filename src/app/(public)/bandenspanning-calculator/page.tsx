import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { PressureCalculatorCta } from "@/components/features/pressure/PressureCalculatorCta";
import { PressureCalculatorFaq } from "@/components/features/pressure/PressureCalculatorFaq";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import { PressureCalculatorHero } from "@/components/features/pressure/PressureCalculatorHero";
import { BRAND } from "@/config/brand";
import { getDictionary } from "@/i18n/getDictionary";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";

export const metadata: Metadata = {
  title: "Bandenspanningscalculator | BestBikeFit4U",
  description:
    "Bereken gratis de ideale bandenspanning voor jouw racefiets, gravelbike of MTB. Voer je gewicht en bandmaat in en krijg direct een advies in bar en PSI.",
  alternates: {
    canonical: "https://bestbikefit4u.eu/bandenspanning-calculator",
  },
};

export default async function BandenspanningCalculatorPage() {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const pageUrl = new URL(withLocalePrefix("/bandenspanning-calculator", locale), BRAND.siteUrl).toString();

  return (
    <div>
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
        title={dictionary.pressure.publicPage.h1}
        subtitle={dictionary.pressure.publicPage.subtitle}
        chips={dictionary.pressure.publicPage.chips}
      />
      <PressureCalculatorForm
        labels={dictionary.pressure.form}
        resultLabels={dictionary.pressure.result}
      />
      <PressureCalculatorFaq locale={locale} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <RelatedLinksSection
          title={locale === "nl" ? "Gerelateerde tools en gidsen" : "Related tools and guides"}
          links={getRelatedLinks("tire-pressure", locale)}
          locale={locale}
        />
      </div>
      <PressureCalculatorCta locale={locale} labels={dictionary.pressure.cta} />
    </div>
  );
}
