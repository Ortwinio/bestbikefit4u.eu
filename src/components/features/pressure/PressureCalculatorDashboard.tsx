"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState } from "@/components/ui";
import { BikePressureCard } from "./BikePressureCard";
import { PressureWizard } from "./PressureWizard";

interface PressureCalculatorDashboardProps {
  initialBikeId?: string;
}

export function PressureCalculatorDashboard({
  initialBikeId,
}: PressureCalculatorDashboardProps) {
  const { locale, messages } = useDashboardMessages();
  const bikes = useQuery(api.bikes.queries.listByUser);
  const latestByBike = useQuery(api.pressureCalculations.queries.getLatestByBikeForUser);
  const [selectedBikeId, setSelectedBikeId] = useState(initialBikeId);

  const latestCalculationMap = useMemo(() => {
    type LatestCalculation = Doc<"pressureCalculations"> | null;

    if (!latestByBike) {
      return new Map<string, LatestCalculation>();
    }

    return new Map(
      latestByBike.map((entry) => [entry.bikeId, entry.latestCalculation] as const)
    );
  }, [latestByBike]);

  const handleStartCalculation = (bikeId: string) => {
    setSelectedBikeId(bikeId);
    requestAnimationFrame(() => {
      document.getElementById("pressure-wizard")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {messages.pressure.wizard.title}
        </h1>
        <p className="max-w-3xl text-sm text-gray-600">
          {messages.pressure.overview.description}
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {messages.pressure.overview.title}
            </h2>
            <p className="text-sm text-gray-600">
              {messages.pressure.overview.subtitle}
            </p>
          </div>
          {bikes && bikes.length > 0 ? (
            <Button type="button" variant="outline" onClick={() => handleStartCalculation(selectedBikeId ?? bikes[0]._id)}>
              {messages.pressure.overview.startNew}
            </Button>
          ) : null}
        </div>

        {bikes === undefined || latestByBike === undefined ? null : bikes.length === 0 ? (
          <EmptyState
            title={messages.pressure.overview.noBikesTitle}
            description={messages.pressure.overview.noBikesDescription}
            action={
              <Link href={withLocalePrefix("/bikes/new", locale)}>
                <Button>{messages.pressure.overview.noBikesCta}</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {bikes.map((bike) => (
              <BikePressureCard
                key={bike._id}
                bike={bike}
                latestCalculation={latestCalculationMap.get(bike._id) ?? null}
                onRecalculate={handleStartCalculation}
              />
            ))}
          </div>
        )}
      </section>

      <Card variant="bordered" id="pressure-wizard">
        <CardHeader>
          <CardTitle>{messages.pressure.overview.startNew}</CardTitle>
        </CardHeader>
        <CardContent>
          <PressureWizard initialBikeId={selectedBikeId} />
        </CardContent>
      </Card>
    </div>
  );
}
