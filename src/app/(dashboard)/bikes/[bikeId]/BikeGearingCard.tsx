"use client";

import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  calculateGearMath,
  deriveBikeGearingCompleteness,
  type BikeGearingRecord,
} from "@/lib/gearing-engine";

export function BikeGearingCard({
  locale,
  bikeId,
  gearing,
}: {
  locale: "en" | "nl";
  bikeId: string;
  gearing?: BikeGearingRecord | null;
}) {
  const isNl = locale === "nl";
  const completeness = deriveBikeGearingCompleteness(gearing);

  let summary:
    | ReturnType<typeof calculateGearMath>
    | null = null;

  if (
    gearing?.drivetrainType &&
    gearing.chainrings &&
    gearing.cassetteTeeth &&
    gearing.wheelCircumferenceMm
  ) {
    try {
      summary = calculateGearMath({
        drivetrainType: gearing.drivetrainType,
        chainrings: gearing.chainrings,
        cassetteTeeth: gearing.cassetteTeeth,
        wheelCircumferenceMm: gearing.wheelCircumferenceMm,
        cadenceRpm: 85,
        crankLengthMm: gearing.crankLengthMm,
      });
    } catch {
      summary = null;
    }
  }

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader>
        <CardTitle>{isNl ? "Versnelling" : "Gearing"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric
                label={isNl ? "Lichtste versnelling" : "Lowest gear"}
                value={`${summary.easiestGear.frontChainringTeeth} x ${summary.easiestGear.rearCogTeeth}`}
              />
              <Metric
                label={isNl ? "Zwaarste versnelling" : "Highest gear"}
                value={`${summary.hardestGear.frontChainringTeeth} x ${summary.hardestGear.rearCogTeeth}`}
              />
              <Metric
                label={isNl ? "Ratio laagste versnelling" : "Lowest ratio"}
                value={summary.easiestGear.ratio.toFixed(2)}
              />
              <Metric
                label={isNl ? "Snelheid bij 85 rpm" : "Speed at 85 rpm"}
                value={`${(summary.easiestGear.speedKmhAtCadence ?? 0).toFixed(1)} km/h`}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                render={<Link href={withLocalePrefix(`/gearing?bikeId=${bikeId}`, locale)} />}
              >
                <ArrowUpDown className="h-4 w-4" />
                {isNl ? "Open gearing calculator" : "Open gearing calculator"}
              </Button>
              <Button
                variant="outline"
                render={<Link href={withLocalePrefix(`/bikes/${bikeId}/edit`, locale)} />}
              >
                {isNl ? "Bewerk gearing" : "Edit gearing"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/25 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {completeness === "missing"
                  ? isNl
                    ? "Nog geen gearing opgeslagen"
                    : "No gearing saved yet"
                  : isNl
                    ? "Gearing nog onvolledig"
                    : "Gearing still incomplete"}
              </p>
              <p className="mt-1">
                {isNl
                  ? "Vul kettingbladen, cassette en wielomtrek in om deze fiets direct in de gearing calculator te gebruiken."
                  : "Add chainrings, cassette, and wheel circumference to use this bike directly in the gearing calculator."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                render={<Link href={withLocalePrefix(`/bikes/${bikeId}/edit`, locale)} />}
              >
                {isNl ? "Voeg gearing toe" : "Add gearing"}
              </Button>
              <Button
                variant="outline"
                render={<Link href={withLocalePrefix(`/gearing?bikeId=${bikeId}`, locale)} />}
              >
                {isNl ? "Open calculator" : "Open calculator"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--background)] p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
