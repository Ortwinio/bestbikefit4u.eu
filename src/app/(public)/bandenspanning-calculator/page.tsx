import type { Metadata } from "next";
import { PressureCalculatorCta } from "@/components/features/pressure/PressureCalculatorCta";
import { PressureCalculatorFaq } from "@/components/features/pressure/PressureCalculatorFaq";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import { PressureCalculatorHero } from "@/components/features/pressure/PressureCalculatorHero";
import { getDictionary } from "@/i18n/getDictionary";
import { getRequestLocale } from "@/i18n/request";

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

  return (
    <div>
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
      <PressureCalculatorCta locale={locale} labels={dictionary.pressure.cta} />
    </div>
  );
}
