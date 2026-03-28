"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { pressureUseCaseLabel, tubeTypeLabel } from "./shared";
import { PressureStatusBadge } from "./PressureStatusBadge";

interface BikePressureSectionProps {
  bikeId: Id<"bikes">;
}

export function BikePressureSection({ bikeId }: BikePressureSectionProps) {
  const { locale, messages } = useDashboardMessages();
  const wheelsets = useQuery(api.wheelsets.queries.listForBike, { bikeId });
  const latestCalc = useQuery(api.pressureCalculations.queries.getLatestForBike, { bikeId });
  const profiles = useQuery(api.pressureProfiles.queries.listForBike, { bikeId });
  const staleState = useQuery(api.pressureCalculations.queries.isBikePressureStale, { bikeId });
  const latestRecommendation = useQuery(api.recommendations.queries.getLatestByBike, { bikeId });

  const activeWheelset = wheelsets?.find((wheelset) => wheelset.isActive) ?? wheelsets?.[0];
  const tireSetups = useQuery(
    api.tireSetups.queries.listForWheelset,
    activeWheelset ? { wheelsetId: activeWheelset._id } : "skip"
  );
  const activeTireSetup =
    tireSetups?.find((tireSetup) => tireSetup.isActive) ?? tireSetups?.[0];

  return (
    <section
      id="pressure-section"
      className="overflow-hidden rounded-[var(--radius-2xl)] border border-[color:var(--border)] bg-[color:var(--card)]"
    >
      <div className="border-b border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--secondary)_68%,var(--background)_32%),color-mix(in_oklch,var(--card)_88%,var(--primary)_12%))] px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              {messages.pressure.bikeDetail.sectionTitle}
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-[color:var(--foreground)]">
              {messages.pressure.bikeDetail.sectionTitle}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
              {messages.pressure.overview.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              render={
                <Link href={withLocalePrefix(`/pressure-calculator?bikeId=${bikeId}`, locale)} />
              }
            >
              {messages.pressure.bikeDetail.calculatePressure}
            </Button>
            <Button
              variant="outline"
              render={<Link href={withLocalePrefix(`/bikes/${bikeId}/edit`, locale)} />}
            >
              {messages.pressure.bikeDetail.manageWheelsets}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/82 px-4 py-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
              <Gauge className="h-4 w-4" />
              {messages.pressure.bikeDetail.activeWheelset}
            </p>
            <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
              {activeWheelset?.name ?? messages.pressure.bikeDetail.noWheelset}
            </p>
            {activeTireSetup ? (
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                {activeTireSetup.widthFrontMm}mm / {activeTireSetup.widthRearMm}mm •{" "}
                {tubeTypeLabel(activeTireSetup.tubeType, locale)}
              </p>
            ) : null}
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/82 px-4 py-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
              <ShieldCheck className="h-4 w-4" />
              {messages.pressure.bikeDetail.activeTireSetup}
            </p>
            <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
              {activeTireSetup?.name ?? messages.pressure.bikeDetail.noTireSetup}
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/82 px-4 py-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
              <Sparkles className="h-4 w-4" />
              {messages.pressure.bikeDetail.recommendedPressure}
            </p>
            <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
              {latestCalc
                ? `${latestCalc.recommendedFrontBar} / ${latestCalc.recommendedRearBar} ${messages.pressure.result.bar}`
                : messages.pressure.bikeDetail.noCalculation}
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/82 px-4 py-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
              <ArrowRight className="h-4 w-4" />
              {messages.pressure.bikeCard.lastCalculated}
            </p>
            <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
              {latestCalc
                ? new Date(latestCalc.createdAt).toLocaleDateString(
                    locale === "nl" ? "nl-NL" : "en-US"
                  )
                : "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {staleState?.isStale ? (
          <div className="mb-3 rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--warning)_32%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--warning)_8%)] px-4 py-3 text-sm text-[color:var(--warning-foreground)]">
            {messages.dashboardHome.pressureStale}
          </div>
        ) : null}

        {latestRecommendation?.pressureInsights?.warnings.length ? (
          <div className="mb-6 rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--warning)_32%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--warning)_8%)] px-4 py-3 text-sm text-[color:var(--warning-foreground)]">
            {messages.dashboardHome.pressureWarnings.replace(
              "{count}",
              String(latestRecommendation.pressureInsights.warnings.length)
            )}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--secondary)]/20 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
              {messages.pressure.bikeDetail.recommendedPressure}
            </h3>
            {latestCalc ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/85 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">
                      {messages.pressure.result.front}
                    </p>
                    <PressureStatusBadge
                      currentBar={latestCalc.currentFrontBar}
                      recommendedBar={latestCalc.recommendedFrontBar}
                      labels={messages.pressure.status}
                    />
                  </div>
                  <p className="mt-3 text-xl font-semibold text-[color:var(--foreground)]">
                    {latestCalc.recommendedFrontBar} {messages.pressure.result.bar}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {latestCalc.recommendedFrontPsi} {messages.pressure.result.psi}
                  </p>
                </div>

                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/85 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">
                      {messages.pressure.result.rear}
                    </p>
                    <PressureStatusBadge
                      currentBar={latestCalc.currentRearBar}
                      recommendedBar={latestCalc.recommendedRearBar}
                      labels={messages.pressure.status}
                    />
                  </div>
                  <p className="mt-3 text-xl font-semibold text-[color:var(--foreground)]">
                    {latestCalc.recommendedRearBar} {messages.pressure.result.bar}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {latestCalc.recommendedRearPsi} {messages.pressure.result.psi}
                  </p>
                </div>

                {(latestCalc.currentFrontBar !== undefined || latestCalc.currentRearBar !== undefined) ? (
                  <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/85 p-4 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                      {messages.pressure.bikeDetail.currentPressure}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[color:var(--foreground)]">
                      {latestCalc.currentFrontBar ?? "-"} / {latestCalc.currentRearBar ?? "-"}{" "}
                      {messages.pressure.result.bar}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
                {messages.pressure.bikeDetail.noCalculation}
              </p>
            )}
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--secondary)]/20 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
              {messages.pressure.bikeDetail.profiles}
            </h3>
            {profiles && profiles.length > 0 ? (
              <div className="mt-4 space-y-3">
                {profiles.map((profile) => (
                  <div
                    key={profile._id}
                    className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/85 p-4"
                  >
                    <p className="font-medium text-[color:var(--foreground)]">{profile.name}</p>
                    <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                      {pressureUseCaseLabel(profile.useCase, locale)}
                    </p>
                    <p className="mt-3 text-sm font-medium text-[color:var(--foreground)]">
                      {profile.recommendedFrontBar} / {profile.recommendedRearBar}{" "}
                      {messages.pressure.result.bar}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
                {messages.pressure.wizard.noPresets}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
