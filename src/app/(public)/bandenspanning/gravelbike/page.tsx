import type { Metadata } from "next";
import { PressureCalculatorCta } from "@/components/features/pressure/PressureCalculatorCta";
import { PressureCalculatorFaq } from "@/components/features/pressure/PressureCalculatorFaq";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import { PressureCalculatorHero } from "@/components/features/pressure/PressureCalculatorHero";
import { getDictionary } from "@/i18n/getDictionary";
import { getRequestLocale } from "@/i18n/request";

export const metadata: Metadata = {
  title: "Bandenspanning Gravelbike Calculator | BestBikeFit4U",
  description:
    "Bereken de ideale bandenspanning voor jouw gravelbike op basis van gewicht, bandbreedte en terrein. Gratis, direct resultaat.",
  alternates: { canonical: "https://bestbikefit4u.eu/bandenspanning/gravelbike" },
};

export default async function BandenspanningGravelbikePage() {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);

  return (
    <div>
      <PressureCalculatorHero
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
      <PressureCalculatorCta locale={locale} labels={dictionary.pressure.cta} />
    </div>
  );
}
