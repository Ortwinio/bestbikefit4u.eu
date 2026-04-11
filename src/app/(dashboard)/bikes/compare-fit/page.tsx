"use client";

import Link from "next/link";
import { ArrowRight, Bike, ShieldCheck, Split } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export default function CompareBikeFitPage() {
  const { locale } = useDashboardMessages();
  const isNl = locale === "nl";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {isNl ? "Dashboard" : "Dashboard"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {isNl ? "Fietsen vergelijken" : "Compare Bikes"}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {isNl
            ? "Gebruik deze pagina om twee fietsen op fit te vergelijken voordat je definitief kiest. Stack, reach, cockpit en aanpasbaarheid horen samen beoordeeld te worden."
            : "Use this page to compare two bikes for fit before you make a final choice. Stack, reach, cockpit, and adjustability should be judged together."}
        </p>
      </div>

      <Card variant="bordered" className="dashboard-hero-surface overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
              <Split className="h-4 w-4 text-[color:var(--primary)]" />
              {isNl ? "Workflow voor vergelijking van twee fietsen" : "Two-bike comparison workflow"}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
                {isNl
                  ? "Vergelijk de fiets die je hebt met de fiets die je overweegt"
                  : "Compare the bike you already have with the bike you are considering"}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
                {isNl
                  ? "Een goede vergelijking kijkt verder dan framemaat alleen. Voor fit is het verschil tussen stack, reach, stuurhoogte en cockpitaanpasbaarheid meestal belangrijker dan het label op de buis."
                  : "A good comparison looks beyond frame size alone. For fit, the difference between stack, reach, bar height, and cockpit adjustability matters more than the label on the tube."}
              </p>
            </div>
          </div>

          <Card variant="bordered" className="dashboard-card-surface-muted">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[color:var(--primary-soft)] p-3 text-[color:var(--primary)]">
                  <Bike className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    {isNl ? "Wat je hier wint" : "What you gain"}
                  </p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {isNl
                      ? "Sneller zien welke fiets het beste bij jouw positie, rijdoel en aanpassingsruimte past."
                      : "A faster way to see which bike best matches your position, riding goal, and adjustment room."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/70 px-4 py-3 text-sm text-[color:var(--foreground)]">
                <ShieldCheck className="h-5 w-5 text-[color:var(--primary)]" />
                {isNl
                  ? "Vergelijk op fitlogica, niet op marketinglabels of een enkele maat."
                  : "Compare on fit logic, not on marketing labels or a single size number."}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="bordered" className="dashboard-card-surface">
          <CardContent className="space-y-3 p-5">
            <h3 className="text-base font-semibold text-[color:var(--foreground)]">
              {isNl ? "Waar je op let" : "What to watch"}
            </h3>
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {isNl
                ? "Stack en reach bepalen het uitgangspunt. Daarna zijn stuurpen, spacers, stuurbreedte en zadelpositie de echte toets."
                : "Stack and reach set the starting point. Stem length, spacers, bar width, and saddle position are the real checks after that."}
            </p>
          </CardContent>
        </Card>
        <Card variant="bordered" className="dashboard-card-surface">
          <CardContent className="space-y-3 p-5">
            <h3 className="text-base font-semibold text-[color:var(--foreground)]">
              {isNl ? "Wat je eerst bepaalt" : "What to decide first"}
            </h3>
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {isNl
                ? "Past de fiets op paper en in de cockpitaanpassing, of wordt de gewenste positie meteen een compromis?"
                : "Does the bike work on paper and in cockpit adjustment, or does the desired position become a compromise immediately?"}
            </p>
          </CardContent>
        </Card>
        <Card variant="bordered" className="dashboard-card-surface">
          <CardContent className="space-y-3 p-5">
            <h3 className="text-base font-semibold text-[color:var(--foreground)]">
              {isNl ? "Wanneer extra hulp verstandig is" : "When extra help is wise"}
            </h3>
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {isNl
                ? "Als je keuze draait om grote investeringen of een complexe fit, is een volledige dashboardbeoordeling meestal slimmer dan losse aannames."
                : "If your decision involves a large purchase or a complex fit, a full dashboard review is usually smarter than isolated assumptions."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href={withLocalePrefix("/dashboard/bikes", locale)} />}>
          {isNl ? "Open fietsengarage" : "Open bike garage"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
