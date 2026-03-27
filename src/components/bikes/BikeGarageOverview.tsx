"use client";

import Link from "next/link";
import type { Doc } from "../../../convex/_generated/dataModel";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState } from "@/components/ui";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikeTypeLabel } from "@/lib/bikes";
import { Mountain, Gauge } from "lucide-react";

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
  responses: Record<string, string | number | string[]>;
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

function linkButtonProps(href: string) {
  return {
    render: <Link href={href} />,
    nativeButton: false as const,
  };
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

// Label lookups for questionnaire response values
const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
const WEEKLY_HOURS_LABELS: Record<string, string> = {
  "0-3": "0–3 hrs/week",
  "3-6": "3–6 hrs/week",
  "6-10": "6–10 hrs/week",
  "10-15": "10–15 hrs/week",
  "15+": "15+ hrs/week",
};
const RIDE_LENGTH_LABELS: Record<string, string> = {
  short: "Short (<30 km)",
  medium: "Medium (30–80 km)",
  long: "Long (80–150 km)",
  ultra: "Ultra (150+ km)",
};
const POSITION_PRIORITY_LABELS: Record<string, string> = {
  comfort: "Maximum comfort",
  balanced: "Balanced",
  performance: "Performance",
};
const ROAD_RIDING_LABELS: Record<string, string> = {
  casual: "Casual / fitness",
  group: "Group rides",
  training: "Structured training",
  racing: "Racing",
  tt: "Time trial / triathlon",
};
const MTB_TERRAIN_LABELS: Record<string, string> = {
  asphalt: "Asphalt only",
  paved: "Paved + light gravel",
  xc: "Cross-country",
  trail: "Trail",
  enduro: "Enduro",
  dh: "Downhill / bike park",
};
const PAIN_AREA_LABELS: Record<string, string> = {
  knee_front: "Front of knee",
  knee_back: "Back of knee",
  lower_back: "Lower back",
  neck: "Neck / shoulders",
  hands: "Hands",
  saddle: "Saddle area",
  feet: "Feet",
};
const CLIMBING_LABELS: Record<string, string> = {
  rarely: "Rarely climbs",
  occasional: "Occasional climbs",
  regular: "Regular climbing",
  climbing_focused: "Climbing-focused",
};

function resolveLabel(map: Record<string, string>, value: string | undefined): string | null {
  if (!value) return null;
  return map[value] ?? null;
}

function FitStatTile({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`rounded-[var(--radius-md)] px-3 py-3 ${className}`}>
      <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">{value}</p>
    </div>
  );
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
  const actionLinkClassName =
    "inline-flex items-center text-sm font-semibold text-[color:var(--primary)] hover:opacity-80";

  const fitName = latestFit?.session.ridingStyle
    ? messages.sessions.ridingStyle[latestFit.session.ridingStyle]
    : null;
  const goalLabel = latestFit?.session.primaryGoal
    ? messages.fit.goals[latestFit.session.primaryGoal].label
    : null;

  const rec = latestFit?.recommendation ?? null;
  const hasClimbingProfile = Boolean(rec?.climbingCalculatedFit);
  const fitDate = latestFit
    ? formatDate(
        latestFit.session.completedAt ?? latestFit.session.createdAt,
        locale
      )
    : null;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(0,0.95fr)]">
      {/* Card 1: Bike info */}
      <Card variant="bordered" className="dashboard-card-surface h-full">
        <CardHeader>
          <CardTitle>{bike.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BikeImage source={bike.photoUrl} alt={bike.name} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-[color:var(--foreground)]">
              {[bike.brand, bike.model].filter(Boolean).join(" ") ||
                getBikeTypeLabel(bike.bikeType, messages)}
            </p>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              {getBikeTypeLabel(bike.bikeType, messages)}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`rounded-[var(--radius-md)] px-4 py-3 ${dashboardTileClassName}`}>
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {messages.fit.sections.ridingStyle}
              </p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">
                {bike.ridingStyle ? messages.sessions.ridingStyle[bike.ridingStyle] : "-"}
              </p>
            </div>
            <div className={`rounded-[var(--radius-md)] px-4 py-3 ${dashboardTileClassName}`}>
              <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                {messages.fit.sections.primaryGoal}
              </p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">
                {bike.primaryGoal ? messages.fit.goals[bike.primaryGoal].label : "-"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={withLocalePrefix(`/bikes/${bike._id}`, locale)}
              className={actionLinkClassName}
            >
              {messages.dashboardHome.viewBike}
            </Link>
            <Button
              variant="primary"
              {...linkButtonProps(withLocalePrefix(`/fit?bikeId=${bike._id}`, locale))}
            >
              {messages.bikeForm.actions.startFitForBike}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Bike usage */}
      <Card variant="bordered" className="dashboard-card-surface h-full">
        <CardHeader>
          <CardTitle>{messages.bikeGarage.bikeUsageTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {latestFit && rec ? (() => {
            const r = latestFit.responses;
            const experienceLabel = resolveLabel(EXPERIENCE_LABELS, r.experience_level as string);
            const weeklyHoursLabel = resolveLabel(WEEKLY_HOURS_LABELS, r.weekly_hours as string);
            const rideLengthLabel = resolveLabel(RIDE_LENGTH_LABELS, r.typical_ride_length as string);
            const positionLabel = resolveLabel(POSITION_PRIORITY_LABELS, r.position_priority as string);
            const roadRidingLabel = resolveLabel(ROAD_RIDING_LABELS, r.road_riding_type as string);
            const terrainLabel = resolveLabel(MTB_TERRAIN_LABELS, r.mtb_terrain as string);
            const hasPain = r.has_pain === "yes";
            const painAreas = Array.isArray(r.pain_areas) ? r.pain_areas as string[] : [];
            const climbingLabel = resolveLabel(CLIMBING_LABELS, r.climbing_importance as string);
            const wantsClimbing = r.wants_climbing_profile === "yes";

            return (
              <>
                {/* Riding style & goal */}
                {(fitName || goalLabel) && (
                  <div className="grid gap-2 grid-cols-2">
                    {fitName && (
                      <div className={`rounded-[var(--radius-md)] px-3 py-3 ${dashboardTileClassName}`}>
                        <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                          {messages.fit.sections.ridingStyle}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">{fitName}</p>
                      </div>
                    )}
                    {goalLabel && (
                      <div className={`rounded-[var(--radius-md)] px-3 py-3 ${dashboardTileClassName}`}>
                        <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                          {messages.fit.sections.primaryGoal}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">{goalLabel}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Rider profile data from questionnaire */}
                <div className="space-y-1.5">
                  {[
                    { label: messages.profile.ridingStyle.experienceLevel, value: experienceLabel },
                    { label: messages.profile.ridingStyle.weeklyHours, value: weeklyHoursLabel },
                    { label: messages.profile.ridingStyle.typicalRide, value: rideLengthLabel },
                    { label: messages.profile.ridingStyle.positionPriority, value: positionLabel },
                    { label: messages.bikeGarage.typeOfRiding, value: roadRidingLabel ?? terrainLabel },
                  ]
                    .filter(({ value }) => value)
                    .map(({ label, value }) => (
                      <div key={label} className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="text-[color:var(--muted-foreground)]">{label}</span>
                        <span className="font-medium text-[color:var(--foreground)] text-right">{value}</span>
                      </div>
                    ))}
                </div>

                {/* Climbing */}
                {wantsClimbing && climbingLabel && (
                  <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--primary)]/20 bg-[color:var(--primary)]/5 px-3 py-2">
                    <Mountain className="h-3.5 w-3.5 shrink-0 text-[color:var(--primary)]" />
                    <span className="text-sm text-[color:var(--foreground)]">{climbingLabel}</span>
                  </div>
                )}

                {/* Pain / discomfort */}
                {hasPain && painAreas.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                      {messages.bikeGarage.reportedDiscomfort}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {painAreas.map((area) => (
                        <span
                          key={area}
                          className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-300"
                        >
                          {PAIN_AREA_LABELS[area] ?? area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  <Link
                    href={withLocalePrefix(`/fit/${latestFit.session._id}/results`, locale)}
                    className={actionLinkClassName}
                  >
                    {messages.fitHistory.viewReport}
                  </Link>
                  <Link
                    href={withLocalePrefix(`/fit?bikeId=${bike._id}`, locale)}
                    className={actionLinkClassName}
                  >
                    {messages.bikeGarage.recalculateFit}
                  </Link>
                </div>
              </>
            );
          })() : (
            <EmptyState
              title={messages.bikeGarage.noFitYet}
              description={messages.bikeGarage.noFitDescription}
              action={
                <Button {...linkButtonProps(withLocalePrefix(`/fit?bikeId=${bike._id}`, locale))}>
                  {messages.fitHistory.startNewSession}
                </Button>
              }
              className="border-0 p-0 shadow-none"
            />
          )}
        </CardContent>
      </Card>

      {/* Card 3: Bikefitting advice */}
      <Card variant="bordered" className="dashboard-card-surface h-full">
        <CardHeader>
          <CardTitle>{messages.bikeGarage.fitAdviseTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rec ? (
            <>
              {/* Fit profile */}
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <FitStatTile
                    label={messages.fitHistory.saddleHeight}
                    value={`${rec.calculatedFit.saddleHeightMm} mm`}
                    className={dashboardTileClassName}
                  />
                  <FitStatTile
                    label={messages.fitHistory.handlebarDrop}
                    value={`${rec.calculatedFit.handlebarDropMm} mm`}
                    className={dashboardTileClassName}
                  />
                  <FitStatTile
                    label={messages.fitHistory.handlebarReach}
                    value={`${rec.calculatedFit.handlebarReachMm} mm`}
                    className={dashboardTileClassName}
                  />
                </div>

                {/* Climbing profile */}
                {hasClimbingProfile && rec.climbingCalculatedFit ? (
                  <div className="rounded-[var(--radius-md)] border border-[color:var(--primary)]/20 bg-[color:var(--primary)]/5 px-3 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Mountain className="h-3.5 w-3.5 text-[color:var(--primary)]" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--primary)]">
                        {messages.bikeGarage.climbingProfileIncluded}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <FitStatTile
                        label={messages.fitHistory.saddleHeight}
                        value={`${rec.climbingCalculatedFit.saddleHeightMm} mm`}
                        className="bg-[color:var(--primary)]/10"
                      />
                      <FitStatTile
                        label={messages.fitHistory.handlebarDrop}
                        value={`${rec.climbingCalculatedFit.handlebarDropMm} mm`}
                        className="bg-[color:var(--primary)]/10"
                      />
                      <FitStatTile
                        label={messages.fitHistory.handlebarReach}
                        value={`${rec.climbingCalculatedFit.handlebarReachMm} mm`}
                        className="bg-[color:var(--primary)]/10"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Divider */}
              <div className="border-t border-[color:var(--border)]" />

              {/* Tyre pressure */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-[color:var(--muted-foreground)]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {messages.bikeGarage.tirePressureTitle}
                  </p>
                </div>

                {bike.advisedPressureSummary ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`rounded-[var(--radius-md)] px-3 py-3 ${dashboardTileClassName}`}>
                        <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                          {messages.pressure.overview.frontPressure}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">
                          {bike.advisedPressureSummary.recommendedFrontBar}{" "}
                          {messages.pressure.result.bar}
                        </p>
                        {bike.advisedPressureSummary.currentFrontBar != null ? (
                          <p className="mt-0.5 text-xs text-[color:var(--muted-foreground)]">
                            {messages.bikeGarage.currentMeasurement}:{" "}
                            {bike.advisedPressureSummary.currentFrontBar}{" "}
                            {messages.pressure.result.bar}
                          </p>
                        ) : null}
                      </div>
                      <div className={`rounded-[var(--radius-md)] px-3 py-3 ${dashboardTileClassName}`}>
                        <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                          {messages.pressure.overview.rearPressure}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">
                          {bike.advisedPressureSummary.recommendedRearBar}{" "}
                          {messages.pressure.result.bar}
                        </p>
                        {bike.advisedPressureSummary.currentRearBar != null ? (
                          <p className="mt-0.5 text-xs text-[color:var(--muted-foreground)]">
                            {messages.bikeGarage.currentMeasurement}:{" "}
                            {bike.advisedPressureSummary.currentRearBar}{" "}
                            {messages.pressure.result.bar}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {bike.pressureStateSummary.isStale ? (
                      <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-300">
                        {messages.dashboardHome.pressureStale}
                      </div>
                    ) : null}
                    <Link
                      href={withLocalePrefix(`/pressure-calculator?bikeId=${bike._id}`, locale)}
                      className={actionLinkClassName}
                    >
                      {messages.bikeGarage.recalculatePressure}
                    </Link>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {messages.pressure.overview.noCalculation}
                    </p>
                    <Link
                      href={withLocalePrefix(`/pressure-calculator?bikeId=${bike._id}`, locale)}
                      className={actionLinkClassName}
                    >
                      {messages.pressure.overview.noCalculationCta}
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <EmptyState
              title={messages.bikeGarage.noFitYet}
              description={messages.bikeGarage.noFitDescription}
              action={
                <Button
                  {...linkButtonProps(
                    withLocalePrefix(`/fit?bikeId=${bike._id}`, locale)
                  )}
                >
                  {messages.fitHistory.startNewSession}
                </Button>
              }
              className="border-0 p-0 shadow-none"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
