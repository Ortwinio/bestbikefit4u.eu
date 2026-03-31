import type { Metadata } from "next";
import { PressureCalculatorCta } from "@/components/features/pressure/PressureCalculatorCta";
import { PressureCalculatorFaq } from "@/components/features/pressure/PressureCalculatorFaq";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import { PressureCalculatorHero } from "@/components/features/pressure/PressureCalculatorHero";
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
    <div>
      <PressureCalculatorHero
        locale={locale}
        title={dictionary.pressure.mtbPage.h1}
        subtitle={dictionary.pressure.publicPage.subtitle}
        chips={dictionary.pressure.publicPage.chips}
      />
      <PressureCalculatorForm
        defaultDiscipline="mtb"
        labels={dictionary.pressure.form}
        resultLabels={dictionary.pressure.result}
      />
      <PressureCalculatorFaq locale={locale} />
      <PressureCalculatorCta
        locale={locale}
        pagePath={pagePath}
        labels={dictionary.pressure.cta}
      />
    </div>
  );
}
