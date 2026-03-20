"use client";

import Link from "next/link";
import type { Doc } from "../../../convex/_generated/dataModel";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState } from "@/components/ui";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikeTypeLabel } from "@/lib/bikes";
import { Gauge } from "lucide-react";

type DashboardMessages = ReturnType<typeof useDashboardMessages>["messages"];

export type BikeSummaryRow = {
  _id: string;
  name: string;
  photoUrl?: string;
  brand?: string;
  model?: string;
  bikeType: Doc<"bikes">["bikeType"];
  ridingStyle?: Doc<"bikes">["ridingStyle"];
  primaryGoal?: Doc<"bikes">["primaryGoal"];
  advisedPressureSummary: {
    createdAt: number;
    recommendedFrontBar: number;
    recommendedRearBar: number;
    recommendedFrontPsi: number;
    recommendedRearPsi: number;
    currentFrontBar?: number;
    currentRearBar?: number;
  } | null;
  pressureStateSummary: {
    isStale: boolean;
    hasCurrentPressure: boolean;
  };
};

export type BikeSessionEntry = {
  session: Doc<"fitSessions">;
  bike: Doc<"bikes"> | null;
  recommendation: Doc<"recommendations"> | null;
};

function BikeImage({
  source,
  alt,
}: {
  source?: string;
  alt: string;
}) {
  const imageUrl = useResolvedImageUrl(source);

  if (!imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/default-bike.svg"
        alt=""
        className="aspect-video w-full rounded-[var(--radius-lg)] object-cover"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={alt}
      className="aspect-video w-full rounded-[var(--radius-lg)] object-cover"
    />
  );
}

function formatDate(timestamp: number, locale: Locale) {
  return new Date(timestamp).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatConfidence(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildLatestFitByBike(
  sessionsWithBikes: BikeSessionEntry[] | undefined
) {
  const map = new Map<string, BikeSessionEntry>();

  for (const entry of sessionsWithBikes ?? []) {
    if (!entry.bike?._id || !entry.recommendation) {
      continue;
    }
    if (!map.has(entry.bike._id)) {
      map.set(entry.bike._id, entry);
    }
  }

  return map;
}

export function BikeGarageRow({
  bike,
  latestFit,
  locale,
  messages,
}: {
  bike: BikeSummaryRow;
  latestFit: BikeSessionEntry | null;
  locale: Locale;
  messages: DashboardMessages;
}) {
  const dashboardTileClassName =
    "bg-[color:color-mix(in_oklch,var(--secondary)_88%,black_4%)]";

  const fitName = latestFit?.session.ridingStyle
    ? messages.sessions.ridingStyle[latestFit.session.ridingStyle]
    : null;
  const goalLabel = latestFit?.session.primaryGoal
    ? messages.fit.goals[latestFit.session.primaryGoal].label
    : null;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(0,0.95fr)]">
      <Card variant="bordered" className="dashboard-card-surface h-full">
        <CardHeader>
          <CardTitle>{bike.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BikeImage source={bike.photoUrl} alt={bike.name} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {[bike.brand, bike.model].filter(Boolean).join(" ") ||
                getBikeTypeLabel(bike.bikeType, messages)}
            </p>
            <p className="text-sm text-gray-600">
              {getBikeTypeLabel(bike.bikeType, messages)}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`rounded-[var(--radius-md)] px-4 py-3 ${dashboardTileClassName}`}>
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {messages.fit.sections.ridingStyle}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {bike.ridingStyle ? messages.sessions.ridingStyle[bike.ridingStyle] : "-"}
              </p>
            </div>
            <div className={`rounded-[var(--radius-md)] px-4 py-3 ${dashboardTileClassName}`}>
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {messages.fit.sections.primaryGoal}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {bike.primaryGoal ? messages.fit.goals[bike.primaryGoal].label : "-"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={withLocalePrefix(`/bikes/${bike._id}`, locale)}>
              <Button variant="outline">{messages.dashboardHome.viewBike}</Button>
            </Link>
            <Link href={withLocalePrefix(`/fit?bikeId=${bike._id}`, locale)}>
              <Button>{messages.bikeForm.actions.startFitForBike}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card variant="bordered" className="dashboard-card-surface h-full">
        <CardHeader>
          <CardTitle>{messages.nav.bikeFitting}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {latestFit && latestFit.recommendation ? (
            <>
              <div className={`rounded-[var(--radius-md)] px-4 py-4 ${dashboardTileClassName}`}>
                <p className="text-lg font-semibold text-gray-900">
                  {fitName ?? messages.nav.bikeFitting}
                </p>
                {goalLabel ? (
                  <p className="mt-1 text-sm text-gray-600">{goalLabel}</p>
                ) : null}
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  {formatDate(
                    latestFit.session.completedAt ?? latestFit.session.createdAt,
                    locale
                  )}
                </p>
                <p>
                  {messages.fitHistory.saddleHeight}:{" "}
                  {latestFit.recommendation.calculatedFit.saddleHeightMm} mm
                </p>
                <p>
                  {messages.fitHistory.confidence}:{" "}
                  {formatConfidence(latestFit.recommendation.confidenceScore)}%
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={withLocalePrefix(`/fit/${latestFit.session._id}/results`, locale)}
                >
                  <Button>{messages.fitHistory.viewReport}</Button>
                </Link>
                <Link href={withLocalePrefix(`/fit?bikeId=${bike._id}`, locale)}>
                  <Button variant="outline">{messages.fitHistory.startNewSession}</Button>
                </Link>
              </div>
            </>
          ) : (
            <EmptyState
              title={messages.fitHistory.emptyTitle}
              description={messages.fitHistory.noRecommendationYet}
              action={
                <Link href={withLocalePrefix(`/fit?bikeId=${bike._id}`, locale)}>
                  <Button>{messages.fitHistory.startNewSession}</Button>
                </Link>
              }
              className="border-0 p-0 shadow-none"
            />
          )}
        </CardContent>
      </Card>

      <Card variant="bordered" className="dashboard-card-surface h-full">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{messages.pressure.bikeDetail.sectionTitle}</CardTitle>
            <Gauge className="h-5 w-5 text-gray-500" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bike.advisedPressureSummary ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={`rounded-[var(--radius-md)] px-4 py-4 ${dashboardTileClassName}`}>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {messages.pressure.overview.frontPressure}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {bike.advisedPressureSummary.recommendedFrontBar} {messages.pressure.result.bar}
                  </p>
                </div>
                <div className={`rounded-[var(--radius-md)] px-4 py-4 ${dashboardTileClassName}`}>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {messages.pressure.overview.rearPressure}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {bike.advisedPressureSummary.recommendedRearBar} {messages.pressure.result.bar}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {messages.pressure.overview.lastCalculated}:{" "}
                {formatDate(bike.advisedPressureSummary.createdAt, locale)}
              </p>
              {bike.pressureStateSummary.isStale ? (
                <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  {messages.dashboardHome.pressureStale}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={withLocalePrefix(`/pressure-calculator?bikeId=${bike._id}`, locale)}
                >
                  <Button variant={bike.pressureStateSummary.isStale ? "primary" : "outline"}>
                    {messages.pressure.overview.recalculate}
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <EmptyState
              title={messages.pressure.bikeCard.noCalculation}
              description={messages.pressure.overview.noCalculation}
              action={
                <Link
                  href={withLocalePrefix(`/pressure-calculator?bikeId=${bike._id}`, locale)}
                >
                  <Button>{messages.pressure.overview.noCalculationCta}</Button>
                </Link>
              }
              className="border-0 p-0 shadow-none"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
