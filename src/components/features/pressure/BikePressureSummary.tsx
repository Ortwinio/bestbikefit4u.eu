"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { PressureStatusBadge } from "./PressureStatusBadge";

interface BikePressureSummaryProps {
  bikeId: Id<"bikes">;
}

export function BikePressureSummary({ bikeId }: BikePressureSummaryProps) {
  const { locale, messages } = useDashboardMessages();
  const latestCalc = useQuery(api.pressureCalculations.queries.getLatestForBike, {
    bikeId,
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      {latestCalc ? (
        <>
          <div className="grid gap-2 text-sm text-gray-700">
            <p>
              {messages.pressure.bikeCard.front} {latestCalc.recommendedFrontBar} {messages.pressure.result.bar}
            </p>
            <p>
              {messages.pressure.bikeCard.rear} {latestCalc.recommendedRearBar} {messages.pressure.result.bar}
            </p>
          </div>
          <div className="mt-3">
            <PressureStatusBadge
              currentBar={latestCalc.currentFrontBar}
              recommendedBar={latestCalc.recommendedFrontBar}
              labels={messages.pressure.status}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-600">{messages.pressure.bikeCard.noCalculation}</p>
      )}

      <Link
        href={withLocalePrefix(`/pressure-calculator?bikeId=${bikeId}`, locale)}
        className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
      >
        {messages.pressure.bikeCard.newCalculation}
      </Link>
    </div>
  );
}
