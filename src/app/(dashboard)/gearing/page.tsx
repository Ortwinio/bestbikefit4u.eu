"use client";

import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { toolsGearingMessages } from "@/i18n/account/toolsGearing";
import { GearingCalculatorForm } from "./GearingCalculatorForm";

export default function DashboardGearingPage() {
  const { locale } = useDashboardMessages();
  const copy = toolsGearingMessages[locale === "nl" ? "nl" : "en"];
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.eyebrow}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
        <p className="max-w-3xl text-muted-foreground">{copy.intro}</p>
      </header>
      <GearingCalculatorForm />
    </div>
  );
}
