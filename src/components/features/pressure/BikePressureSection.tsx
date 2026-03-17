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

  const activeWheelset = wheelsets?.find((wheelset) => wheelset.isActive) ?? wheelsets?.[0];
  const tireSetups = useQuery(
    api.tireSetups.queries.listForWheelset,
    activeWheelset ? { wheelsetId: activeWheelset._id } : "skip"
  );
  const activeTireSetup =
    tireSetups?.find((tireSetup) => tireSetup.isActive) ?? tireSetups?.[0];

  return (
    <section id="pressure-section" className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {messages.pressure.bikeDetail.sectionTitle}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {messages.pressure.bikeDetail.activeWheelset}:{" "}
            {activeWheelset?.name ?? messages.pressure.bikeDetail.noWheelset}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {messages.pressure.bikeDetail.activeTireSetup}:{" "}
            {activeTireSetup?.name ?? messages.pressure.bikeDetail.noTireSetup}
          </p>
          {activeTireSetup ? (
            <p className="mt-1 text-sm text-gray-600">
              {activeTireSetup.widthFrontMm}mm / {activeTireSetup.widthRearMm}mm •{" "}
              {tubeTypeLabel(activeTireSetup.tubeType, locale)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={withLocalePrefix(`/pressure-calculator?bikeId=${bikeId}`, locale)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {messages.pressure.bikeDetail.calculatePressure}
          </Link>
          <Link
            href={withLocalePrefix(`/bikes/${bikeId}/edit`, locale)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {messages.pressure.bikeDetail.manageWheelsets}
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
        <div className="rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">
            {messages.pressure.bikeDetail.recommendedPressure}
          </h3>
          {latestCalc ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-700">
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
                <p className="text-sm text-gray-700">
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
                <p className="text-sm text-gray-600">
                  {messages.pressure.bikeDetail.currentPressure}:{" "}
                  {latestCalc.currentFrontBar ?? "-"} / {latestCalc.currentRearBar ?? "-"}{" "}
                  {messages.pressure.result.bar}
                </p>
              )}
              <p className="text-sm text-gray-500">
                {messages.pressure.bikeCard.lastCalculated}:{" "}
                {new Date(latestCalc.createdAt).toLocaleDateString(
                  locale === "nl" ? "nl-NL" : "en-US"
                )}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600">
              {messages.pressure.bikeDetail.noCalculation}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">
            {messages.pressure.bikeDetail.profiles}
          </h3>
          {profiles && profiles.length > 0 ? (
            <div className="mt-3 space-y-3">
              {profiles.map((profile) => (
                <div key={profile._id} className="rounded-lg bg-gray-50 p-3">
                  <p className="font-medium text-gray-900">{profile.name}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {pressureUseCaseLabel(profile.useCase, locale)}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {profile.recommendedFrontBar} / {profile.recommendedRearBar}{" "}
                    {messages.pressure.result.bar}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600">
              {messages.pressure.wizard.noPresets}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
