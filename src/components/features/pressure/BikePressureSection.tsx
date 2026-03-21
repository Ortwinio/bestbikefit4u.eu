"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
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
      className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[color:var(--foreground)]">
            {messages.pressure.bikeDetail.sectionTitle}
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            {messages.pressure.bikeDetail.activeWheelset}:{" "}
            {activeWheelset?.name ?? messages.pressure.bikeDetail.noWheelset}
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            {messages.pressure.bikeDetail.activeTireSetup}:{" "}
            {activeTireSetup?.name ?? messages.pressure.bikeDetail.noTireSetup}
          </p>
          {activeTireSetup ? (
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
              {activeTireSetup.widthFrontMm}mm / {activeTireSetup.widthRearMm}mm •{" "}
              {tubeTypeLabel(activeTireSetup.tubeType, locale)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={withLocalePrefix(`/pressure-calculator?bikeId=${bikeId}`, locale)}
            className="rounded-[var(--radius-md)] bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] hover:brightness-110"
          >
            {messages.pressure.bikeDetail.calculatePressure}
          </Link>
          <Link
            href={withLocalePrefix(`/bikes/${bikeId}/edit`, locale)}
            className="rounded-[var(--radius-md)] border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:bg-[color:var(--accent)]"
          >
            {messages.pressure.bikeDetail.manageWheelsets}
          </Link>
        </div>
      </div>

      {staleState?.isStale ? (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[color:color-mix(in_oklch,var(--warning)_32%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--warning)_8%)] px-4 py-3 text-sm text-[color:var(--warning-foreground)]">
          {messages.dashboardHome.pressureStale}
        </div>
      ) : null}

      {latestRecommendation?.pressureInsights?.warnings.length ? (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[color:color-mix(in_oklch,var(--warning)_32%,var(--border))] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--warning)_8%)] px-4 py-3 text-sm text-[color:var(--warning-foreground)]">
          {messages.dashboardHome.pressureWarnings.replace(
            "{count}",
            String(latestRecommendation.pressureInsights.warnings.length)
          )}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
            {messages.pressure.bikeDetail.recommendedPressure}
          </h3>
          {latestCalc ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[color:var(--foreground)]">
                  {messages.pressure.result.front}: {latestCalc.recommendedFrontBar}{" "}
                  {messages.pressure.result.bar} ({latestCalc.recommendedFrontPsi}{" "}
                  {messages.pressure.result.psi})
                </p>
                <PressureStatusBadge
                  currentBar={latestCalc.currentFrontBar}
                  recommendedBar={latestCalc.recommendedFrontBar}
                  labels={messages.pressure.status}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[color:var(--foreground)]">
                  {messages.pressure.result.rear}: {latestCalc.recommendedRearBar}{" "}
                  {messages.pressure.result.bar} ({latestCalc.recommendedRearPsi}{" "}
                  {messages.pressure.result.psi})
                </p>
                <PressureStatusBadge
                  currentBar={latestCalc.currentRearBar}
                  recommendedBar={latestCalc.recommendedRearBar}
                  labels={messages.pressure.status}
                />
              </div>
              {(latestCalc.currentFrontBar !== undefined || latestCalc.currentRearBar !== undefined) && (
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  {messages.pressure.bikeDetail.currentPressure}:{" "}
                  {latestCalc.currentFrontBar ?? "-"} / {latestCalc.currentRearBar ?? "-"}{" "}
                  {messages.pressure.result.bar}
                </p>
              )}
              <p className="text-sm text-[color:var(--muted-foreground)]">
                {messages.pressure.bikeCard.lastCalculated}:{" "}
                {new Date(latestCalc.createdAt).toLocaleDateString(
                  locale === "nl" ? "nl-NL" : "en-US"
                )}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
              {messages.pressure.bikeDetail.noCalculation}
            </p>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
            {messages.pressure.bikeDetail.profiles}
          </h3>
          {profiles && profiles.length > 0 ? (
            <div className="mt-3 space-y-3">
              {profiles.map((profile) => (
                <div
                  key={profile._id}
                  className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-3"
                >
                  <p className="font-medium text-[color:var(--foreground)]">{profile.name}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {pressureUseCaseLabel(profile.useCase, locale)}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {profile.recommendedFrontBar} / {profile.recommendedRearBar}{" "}
                    {messages.pressure.result.bar}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
              {messages.pressure.wizard.noPresets}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
