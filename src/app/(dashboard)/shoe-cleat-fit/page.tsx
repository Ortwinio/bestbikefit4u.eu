"use client";

import Link from "next/link";
import { ArrowRight, Footprints, ShieldCheck, Sparkles } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export default function ShoeCleatFitPage() {
  const { locale } = useDashboardMessages();
  const isNl = locale === "nl";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {isNl ? "Dashboard" : "Dashboard"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {isNl ? "Schoen- en cleatfit" : "Shoe & Cleat Fit"}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {isNl
            ? "Gebruik deze module om voetvorm, schoenkeuze en cleatpositie systematisch te beoordelen. Dit is hogere-precisie fitwerk, dus het hoort in de dashboardflow."
            : "Use this module to review foot shape, shoe choice, and cleat position in a structured way. This is higher-precision fit work, so it belongs inside the dashboard flow."}
        </p>
      </div>

      <Card variant="bordered" className="dashboard-hero-surface overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
              <Sparkles className="h-4 w-4 text-[color:var(--primary)]" />
              {isNl ? "Workflow met hoge waarde en hogere nauwkeurigheid" : "High-value, high-accuracy workflow"}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
                {isNl
                  ? "Begin bij de voet, niet bij een snelle veronderstelling"
                  : "Start with the foot, not with a quick assumption"}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
                {isNl
                  ? "Schoenvolume, voetbreedte, asymmetrie en cleatrotatie beïnvloeden elkaar. Kleine fouten hier voelen vaak direct aan knie, voet of heup, dus een gestructureerde workflow is belangrijker dan losse tweaks."
                  : "Shoe volume, foot width, asymmetry, and cleat rotation affect each other. Small errors here often show up immediately in the knee, foot, or hip, so a structured workflow matters more than isolated tweaks."}
              </p>
            </div>
          </div>

          <Card variant="bordered" className="dashboard-card-surface-muted">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[color:var(--primary-soft)] p-3 text-[color:var(--primary)]">
                  <Footprints className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    {isNl ? "Wat je hier doet" : "What this page does"}
                  </p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {isNl
                      ? "Begrijp welke schoen- en cleatkeuzes het meeste effect hebben voordat je gaat finetunen."
                      : "Understand which shoe and cleat choices matter most before you fine-tune."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)]/70 px-4 py-3 text-sm text-[color:var(--foreground)]">
                <ShieldCheck className="h-5 w-5 text-[color:var(--primary)]" />
                {isNl
                  ? "Verander cleats conservatief en toets veranderingen altijd op echte ritbelasting."
                  : "Change cleats conservatively and always validate changes under real ride load."}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="bordered" className="dashboard-card-surface">
          <CardContent className="space-y-3 p-5">
            <h3 className="text-base font-semibold text-[color:var(--foreground)]">
              {isNl ? "Veelvoorkomende signalen" : "Common signals"}
            </h3>
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {isNl
                ? "Dove tenen, brandende voeten, terugkerende knieklachten en een instabiel gevoel in de trapbeweging wijzen vaak op een schoen- of cleatissue."
                : "Numb toes, hot feet, recurring knee pain, and an unstable feel at the pedal stroke often point to a shoe or cleat issue."}
            </p>
          </CardContent>
        </Card>
        <Card variant="bordered" className="dashboard-card-surface">
          <CardContent className="space-y-3 p-5">
            <h3 className="text-base font-semibold text-[color:var(--foreground)]">
              {isNl ? "Wat je eerst checkt" : "What to check first"}
            </h3>
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {isNl
                ? "Meet voetlengte en -breedte, controleer schoenvolume en kijk pas daarna naar rotatie, setback en steun."
                : "Measure foot length and width, check shoe volume, and only then look at rotation, setback, and support."}
            </p>
          </CardContent>
        </Card>
        <Card variant="bordered" className="dashboard-card-surface">
          <CardContent className="space-y-3 p-5">
            <h3 className="text-base font-semibold text-[color:var(--foreground)]">
              {isNl ? "Wanneer extra hulp beter is" : "When extra help is better"}
            </h3>
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {isNl
                ? "Bij aanhoudende gevoelloosheid, duidelijke asymmetrie of voetproblemen buiten het fietsen is lokale of medische beoordeling verstandiger."
                : "Persistent numbness, clear asymmetry, or foot issues beyond riding deserve in-person or medical review."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href={withLocalePrefix("/dashboard/fit", locale)} />}>
          {isNl ? "Open fit-workflow" : "Open fit workflow"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
