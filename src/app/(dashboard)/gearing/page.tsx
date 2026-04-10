"use client";

import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { GearingCalculatorForm } from "./GearingCalculatorForm";

export default function DashboardGearingPage() {
  const { locale } = useDashboardMessages();
  const isNl = locale === "nl";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {isNl ? "Dashboard" : "Dashboard"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {isNl ? "Versnellingscalculator" : "Gearing Calculator"}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {isNl
            ? "Bekijk wat je huidige of geplande gearing betekent voor een echte klim, met bike-prefill en een duidelijk advies voor de volgende stap."
            : "See what your current or planned gearing means for a real climb, with bike prefill and a clear recommendation for the next step."}
        </p>
      </div>

      <GearingCalculatorForm />
    </div>
  );
}
