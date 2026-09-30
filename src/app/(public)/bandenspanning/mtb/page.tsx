import type { Metadata } from "next";
import { PressureCalculatorCta } from "@/components/features/pressure/PressureCalculatorCta";
import { PressureCalculatorFaq } from "@/components/features/pressure/PressureCalculatorFaq";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import { getDictionary } from "@/i18n/getDictionary";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const alternates = buildLocaleAlternates("/bandenspanning/mtb", locale);

  return {
    title: dictionary.pressure.mtbPage.title,
    description: dictionary.pressure.mtbPage.description,
    openGraph: {
      title: dictionary.pressure.mtbPage.title,
      description: dictionary.pressure.mtbPage.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function BandenspanningMtbPage() {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const pagePath = withLocalePrefix("/bandenspanning/mtb", locale);

  return (
    <div className="bg-background text-foreground">
      <PressureCalculatorForm
        locale={locale}
        defaultDiscipline="mtb"
        copy={dictionary.tirePressureCalculator}
        labels={dictionary.pressure.form}
        resultLabels={dictionary.pressure.result}
      />
      <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-8 xl:px-16">
        <PressureCalculatorFaq locale={locale} />
        <PressureCalculatorCta
          locale={locale}
          pagePath={pagePath}
          labels={dictionary.pressure.cta}
        />
      </div>
    </div>
  );
}
