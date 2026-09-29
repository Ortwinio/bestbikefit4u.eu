"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AdjustOrder, Button, Gauge, LoadingState, OptionCard } from "@/components/ui";
import { BikePressureCard } from "@/components/features/pressure/BikePressureCard";
import { PressureWizard } from "@/components/features/pressure/PressureWizard";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { toolsPressureMessages } from "@/i18n/account/toolsPressure";

export function PressureDashboardClient({ initialBikeId }: { initialBikeId?: string }) {
  const { locale } = useDashboardMessages();
  const copy = toolsPressureMessages[locale];
  const bikes = useQuery(api.bikes.queries.listByUser);
  const latestByBike = useQuery(api.pressureCalculations.queries.getLatestByBikeForUser);
  const [selectedBikeId, setSelectedBikeId] = useState(initialBikeId);
  const wizard = useRef<HTMLElement>(null);
  const isLoading = bikes === undefined || latestByBike === undefined;
  const saved = latestByBike?.find((entry) => entry.bikeId === selectedBikeId)?.latestCalculation;
  const gaugeMax = Math.max(10, saved?.recommendedFrontBar ?? 0, saved?.recommendedRearBar ?? 0);

  function start(bikeId?: string) {
    setSelectedBikeId(bikeId);
    requestAnimationFrame(() => wizard.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] min-w-0 space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-bold tracking-[0.08em] text-primary uppercase">{copy.eyebrow}</p>
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {copy.title}
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{copy.description}</p>
      </header>

      {isLoading ? (
        <section
          aria-label={copy.loading}
          aria-busy="true"
          className="rounded-3xl border border-border bg-card p-6"
        >
          <LoadingState label={copy.loading} />
          <p className="text-center text-sm text-muted-foreground">{copy.loadingDetail}</p>
        </section>
      ) : (
        <>
          {bikes.length === 0 ? (
            <section className="rounded-3xl bg-[var(--bbf-lime)] p-6 text-[var(--bbf-inkt)] sm:p-8">
              <h2 className="font-display text-2xl font-bold text-[var(--bbf-inkt)]">{copy.emptyTitle}</h2>
              <p className="mt-3 max-w-2xl leading-relaxed">{copy.emptyDescription}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  role="link"
                  nativeButton={false}
                  render={<Link href={withLocalePrefix("/bikes/new", locale)} />}
                >
                  {copy.addBike}
                </Button>
                <Button variant="outline" onClick={() => start()}>
                  {copy.withoutBike}
                </Button>
              </div>
            </section>
          ) : (
            <section
              aria-labelledby="pressure-bikes"
              className="rounded-3xl border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="pressure-bikes" className="font-display text-2xl font-bold">
                  {copy.bikes}
                </h2>
                <Link
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline"
                  href={withLocalePrefix("/bikes", locale)}
                >
                  {copy.garage}
                </Link>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {bikes.map((bike) => (
                  <OptionCard
                    key={bike._id}
                    label={bike.name}
                    description={[bike.brand, bike.model].filter(Boolean).join(" ") || undefined}
                    selected={selectedBikeId === bike._id}
                    onClick={() => start(bike._id)}
                  />
                ))}
              </div>
              <Button className="mt-4" variant="ghost" onClick={() => start()}>
                {copy.withoutBike}
              </Button>
            </section>
          )}

          <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
            <section
              id="pressure-wizard"
              ref={wizard}
              aria-labelledby="pressure-calculator-heading"
              className="min-w-0 scroll-mt-24 rounded-3xl border border-border bg-card p-5 sm:p-7"
            >
              <h2 id="pressure-calculator-heading" className="font-display text-2xl font-bold">
                {copy.calculator}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {copy.calculatorDescription}
              </p>
              <div
                className={
                  "mt-6 min-w-0 [&_.border]:border-border [&_.border-dashed]:border-border " +
                  "[&_.border-b]:border-border"
                }
              >
                <PressureWizard initialBikeId={selectedBikeId} />
              </div>
            </section>
            <aside className="min-w-0 space-y-4">
              {saved && (
                <section aria-label={copy.savedForBike} className="space-y-3">
                  <h2 className="font-display text-xl font-bold">{copy.savedForBike}</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-3xl bg-[var(--bbf-lime)] p-3 text-[var(--bbf-inkt)]">
                      <Gauge
                        label={copy.front}
                        value={saved.recommendedFrontBar}
                        max={gaugeMax}
                        unit="bar"
                        locale={locale}
                        className="text-[var(--bbf-inkt)] [&_.text-muted-foreground]:text-[var(--bbf-tekst)]"
                      />
                    </div>
                    <div className="rounded-3xl bg-[var(--bbf-inkt)] p-3 text-[var(--bbf-wit)]">
                      <Gauge
                        label={copy.rear}
                        value={saved.recommendedRearBar}
                        max={gaugeMax}
                        unit="bar"
                        locale={locale}
                        className={
                          "text-[var(--bbf-wit)] [&_.text-muted-foreground]:text-[var(--bbf-op-donker)] " +
                          "[&_path:nth-child(2)]:stroke-[var(--bbf-lime)]"
                        }
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{copy.gaugeNote}</p>
                </section>
              )}

              <section className="rounded-3xl bg-[var(--bbf-inkt)] p-6 text-[var(--bbf-wit)]">
                <h2 className="font-display text-2xl font-bold text-[var(--bbf-wit)]">{copy.limits}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--bbf-op-donker)]">
                  {copy.limitsDescription}
                </p>
              </section>
              <AdjustOrder title={copy.next} steps={copy.steps.map((title) => ({ title }))} />
            </aside>
          </div>

          {bikes.length > 0 && (
            <section aria-labelledby="pressure-saved" className="space-y-4">
              <h2 id="pressure-saved" className="font-display text-3xl font-bold">
                {copy.saved}
              </h2>
              <p className="text-sm text-muted-foreground">{copy.savedDescription}</p>
              <div
                className={
                  "grid min-w-0 gap-4 xl:grid-cols-2 [&_.border]:border-border " +
                  "[&_.border-b]:border-border [&_[data-slot=card]]:bg-card"
                }
              >
                {bikes.map((bike) => (
                  <BikePressureCard
                    key={bike._id}
                    bike={bike}
                    latestCalculation={
                      latestByBike.find((entry) => entry.bikeId === bike._id)?.latestCalculation ?? null
                    }
                    onRecalculate={start}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
