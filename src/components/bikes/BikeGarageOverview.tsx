"use client";

import Link from "next/link";
import type { Doc } from "../../../convex/_generated/dataModel";
import { Button, Card, CardContent, EmptyState, SectionHeader, MeasurementTile, InfoBox, StatRow } from "@/components/ui";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikeTypeLabel } from "@/lib/bikes";
import { getDashboardPressureCalculatorPath } from "@/lib/pressureRoutes";
import { Mountain, Gauge, Bike, Activity, Ruler, AlertCircle, ArrowRight } from "lucide-react";
import { FitReportActionGroup } from "@/components/reports";

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
  const fitName = latestFit?.session.ridingStyle
    ? messages.sessions.ridingStyle[latestFit.session.ridingStyle]
    : null;
  const goalLabel = latestFit?.session.primaryGoal
    ? messages.fit.goals[latestFit.session.primaryGoal].label
    : null;

  const rec = latestFit?.recommendation ?? null;
  const hasClimbingProfile = Boolean(rec?.climbingCalculatedFit);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(0,0.95fr)]">
      {/* Card 1: Bike info */}
      <Card variant="bordered" className="dashboard-card-surface h-full">
        <SectionHeader
          icon={<Bike className="h-5 w-5 text-[color:var(--primary)]" />}
          title={bike.name}
        />
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
            <MeasurementTile
              label={messages.fit.sections.ridingStyle}
              value={bike.ridingStyle ? messages.sessions.ridingStyle[bike.ridingStyle] : "-"}
            />
            <MeasurementTile
              label={messages.fit.sections.primaryGoal}
              value={bike.primaryGoal ? messages.fit.goals[bike.primaryGoal].label : "-"}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={withLocalePrefix(`/bikes/${bike._id}`, locale)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {messages.dashboardHome.viewBike}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
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
        <SectionHeader
          icon={<Activity className="h-5 w-5 text-[color:var(--primary)]" />}
          title={messages.bikeGarage.bikeUsageTitle}
        />
        <CardContent className="space-y-4">
          {latestFit && rec ? (() => {
            const r = latestFit.responses ?? {};
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
                      <MeasurementTile
                        label={messages.fit.sections.ridingStyle}
                        value={fitName}
                      />
                    )}
                    {goalLabel && (
                      <MeasurementTile
                        label={messages.fit.sections.primaryGoal}
                        value={goalLabel}
                      />
                    )}
                  </div>
                )}

                {/* Rider profile data from questionnaire */}
                <dl className="divide-y divide-[color:var(--border)]">
                  <StatRow label={messages.profile.ridingStyle.experienceLevel} value={experienceLabel} />
                  <StatRow label={messages.profile.ridingStyle.weeklyHours} value={weeklyHoursLabel} />
                  <StatRow label={messages.profile.ridingStyle.typicalRide} value={rideLengthLabel} />
                  <StatRow label={messages.profile.ridingStyle.positionPriority} value={positionLabel} />
                  <StatRow label={messages.bikeGarage.typeOfRiding} value={roadRidingLabel ?? terrainLabel} />
                </dl>

                {/* Climbing */}
                {wantsClimbing && climbingLabel && (
                  <InfoBox variant="primary" icon={<Mountain className="h-4 w-4 text-[color:var(--primary)]" />}>
                    {climbingLabel}
                  </InfoBox>
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
                  <FitReportActionGroup
                    sessionId={latestFit.session._id}
                    pagePath={withLocalePrefix("/dashboard", locale)}
                  />
                  <Link
                    href={withLocalePrefix(`/fit?bikeId=${bike._id}`, locale)}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    {messages.bikeGarage.recalculateFit}
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
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
        <SectionHeader
          icon={<Ruler className="h-5 w-5 text-[color:var(--primary)]" />}
          title={messages.bikeGarage.fitAdviseTitle}
        />
        <CardContent className="space-y-4">
          {rec ? (
            <>
              {/* Fit profile */}
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <MeasurementTile
                    label={messages.fitHistory.saddleHeight}
                    value={rec.calculatedFit.saddleHeightMm}
                    unit="mm"
                  />
                  <MeasurementTile
                    label={messages.fitHistory.handlebarDrop}
                    value={rec.calculatedFit.handlebarDropMm != null ? Math.round(rec.calculatedFit.handlebarDropMm) : null}
                    unit="mm"
                  />
                  <MeasurementTile
                    label={messages.fitHistory.handlebarReach}
                    value={rec.calculatedFit.handlebarReachMm != null ? Math.round(rec.calculatedFit.handlebarReachMm) : null}
                    unit="mm"
                  />
                </div>

                {/* Climbing profile */}
                {hasClimbingProfile && rec.climbingCalculatedFit ? (
                  <InfoBox variant="success" icon={<Mountain className="h-4 w-4 text-[color:var(--success)]" />}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2">
                      {messages.bikeGarage.climbingProfileIncluded}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <MeasurementTile
                        label={messages.fitHistory.saddleHeight}
                        value={rec.climbingCalculatedFit.saddleHeightMm}
                        unit="mm"
                      />
                      <MeasurementTile
                        label={messages.fitHistory.handlebarDrop}
                        value={rec.climbingCalculatedFit.handlebarDropMm != null ? Math.round(rec.climbingCalculatedFit.handlebarDropMm) : null}
                        unit="mm"
                      />
                      <MeasurementTile
                        label={messages.fitHistory.handlebarReach}
                        value={rec.climbingCalculatedFit.handlebarReachMm != null ? Math.round(rec.climbingCalculatedFit.handlebarReachMm) : null}
                        unit="mm"
                      />
                    </div>
                  </InfoBox>
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
                      <div className="rounded-[var(--radius-md)] px-3 py-3 bg-[color:var(--surface-secondary)]">
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
                      <div className="rounded-[var(--radius-md)] px-3 py-3 bg-[color:var(--surface-secondary)]">
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
                      <InfoBox variant="warning" icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}>
                        {messages.dashboardHome.pressureStale}
                      </InfoBox>
                    ) : null}
                    <Link
                      href={withLocalePrefix(
                        getDashboardPressureCalculatorPath(bike._id),
                        locale
                      )}
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      {messages.bikeGarage.recalculatePressure}
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {messages.pressure.overview.noCalculation}
                    </p>
                    <Link
                      href={withLocalePrefix(
                        getDashboardPressureCalculatorPath(bike._id),
                        locale
                      )}
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      {messages.pressure.overview.noCalculationCta}
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
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
