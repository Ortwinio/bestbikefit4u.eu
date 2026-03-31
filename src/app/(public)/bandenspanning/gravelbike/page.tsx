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
  const alternates = buildLocaleAlternates("/bandenspanning/gravelbike", locale);

  return {
    title: dictionary.pressure.gravelPage.title,
    description: dictionary.pressure.gravelPage.description,
    openGraph: {
      title: dictionary.pressure.gravelPage.title,
      description: dictionary.pressure.gravelPage.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function BandenspanningGravelbikePage() {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const pagePath = withLocalePrefix("/bandenspanning/gravelbike", locale);

  return (
    <div>
      <PressureCalculatorHero
        locale={locale}
        title={dictionary.pressure.gravelPage.h1}
        subtitle={dictionary.pressure.publicPage.subtitle}
        chips={dictionary.pressure.publicPage.chips}
      />
      <PressureCalculatorForm
        defaultDiscipline="gravel"
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
