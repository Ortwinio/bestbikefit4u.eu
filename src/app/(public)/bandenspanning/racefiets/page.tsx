import type { Metadata } from "next";
import { PressureCalculatorFaq } from "@/components/features/pressure/PressureCalculatorFaq";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import { getDictionary } from "@/i18n/getDictionary";
import { buildLocaleAlternates } from "@/i18n/metadata";
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

  return (
    <div className="bg-background text-foreground">
      <PressureCalculatorForm
        locale={locale}
        defaultDiscipline="road"
        copy={dictionary.tirePressureCalculator}
        labels={dictionary.pressure.form}
        resultLabels={dictionary.pressure.result}
      />
      <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-8 xl:px-16">
        <PressureCalculatorFaq locale={locale} />
      </div>
    </div>
  );
}
