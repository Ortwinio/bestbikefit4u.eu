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
  const alternates = buildLocaleAlternates("/bandenspanning/racefiets", locale);

  return {
    title: dictionary.pressure.roadPage.title,
    description: dictionary.pressure.roadPage.description,
    openGraph: {
      title: dictionary.pressure.roadPage.title,
      description: dictionary.pressure.roadPage.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function BandenspanningRacefietsPage() {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const pagePath = withLocalePrefix("/bandenspanning/racefiets", locale);

  return (
    <div>
      <PressureCalculatorHero
        locale={locale}
        title={dictionary.pressure.roadPage.h1}
        subtitle={dictionary.pressure.publicPage.subtitle}
        chips={dictionary.pressure.publicPage.chips}
      />
      <PressureCalculatorForm
        defaultDiscipline="road"
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
