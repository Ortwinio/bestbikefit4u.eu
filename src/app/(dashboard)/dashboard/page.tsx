"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingState,
} from "@/components/ui";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { FlexibilityScale } from "@/components/profile/FlexibilityScale";
import { CoreStabilityBar } from "@/components/profile/CoreStabilityBar";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikeTypeLabel } from "@/lib/bikes";
import {
  getEffectiveDisplayName,
  getEffectiveProfileImageSource,
} from "@/lib/userIdentity";
import { ArrowRight, Gauge, Plus } from "lucide-react";

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

function formatDate(timestamp: number, locale: string) {
  return new Date(timestamp).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type BikeSummary = ReturnType<typeof useQuery<typeof api.bikes.queries.listSummariesByUser>>;
type BikeRow = NonNullable<BikeSummary>[number];

type SessionEntry = {
  session: Doc<"fitSessions">;
  bike: Doc<"bikes"> | null;
  recommendation: Doc<"recommendations"> | null;
};

function BikeGarageRow({
  bike,
  latestFit,
  locale,
  messages,
}: {
  bike: BikeRow;
  latestFit: SessionEntry | null;
  locale: Locale;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
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
          <CardTitle>{messages.fitHistory.latestSession}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {latestFit && latestFit.recommendation ? (
            <>
              <div className={`rounded-[var(--radius-md)] px-4 py-4 ${dashboardTileClassName}`}>
                <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  {messages.nav.bikeFitting}
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {fitName ?? messages.fitHistory.latestSession}
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
                  {latestFit.recommendation.confidenceScore}%
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

export default function DashboardPage() {
  const { locale, messages } = useDashboardMessages();
  const profile = useQuery(api.profiles.queries.getMyProfile);
  const user = useQuery(api.users.queries.getCurrentUser);
  const bikes = useQuery(api.bikes.queries.listSummariesByUser);
  const sessionsWithBikes = useQuery(api.sessions.queries.getAllSessionsWithBikes);

  const isLoading =
    profile === undefined ||
    user === undefined ||
    bikes === undefined ||
    sessionsWithBikes === undefined;

  const displayName = getEffectiveDisplayName(user, messages.userMenu.fallbackUserName);
  const profileImageSource = getEffectiveProfileImageSource(user);
  const dashboardCardClassName = "dashboard-card-surface";
  const dashboardTileClassName =
    "bg-[color:color-mix(in_oklch,var(--secondary)_88%,black_4%)]";

  const latestFitByBike = useMemo(() => {
    const map = new Map<string, SessionEntry>();

    for (const entry of sessionsWithBikes ?? []) {
      if (!entry.bike?._id || !entry.recommendation) {
        continue;
      }
      if (!map.has(entry.bike._id)) {
        map.set(entry.bike._id, entry as SessionEntry);
      }
    }

    return map;
  }, [sessionsWithBikes]);

  if (isLoading) {
    return <LoadingState label={messages.layout.loading} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{messages.home.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{messages.dashboardHome.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={withLocalePrefix("/bikes/new", locale)}>
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              {messages.nav.newBike}
            </Button>
          </Link>
          <Link href={withLocalePrefix("/fit", locale)}>
            <Button>
              <Plus className="h-4 w-4" />
              {messages.home.newFitCta}
            </Button>
          </Link>
        </div>
      </div>

      <Card variant="bordered" className={dashboardCardClassName}>
        <CardHeader>
          <CardTitle>{messages.dashboardHome.riderCardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <ProfilePhotoUpload source={profileImageSource} size="hero" />
            <div>
              <p className="text-lg font-semibold text-gray-900">{displayName}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <div className="ml-auto rounded-full bg-[color:var(--primary)] px-3 py-1 text-xs font-semibold text-[color:var(--primary-foreground)]">
              {user?.tier === "pro" || user?.tier === "premium"
                ? messages.settings.account.pro
                : messages.settings.account.free}
            </div>
          </div>

          {profile ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className={`rounded-[var(--radius-md)] px-4 py-3 ${dashboardTileClassName}`}>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {messages.profile.measurements.height}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{profile.heightCm} cm</p>
                </div>
                <div className={`rounded-[var(--radius-md)] px-4 py-3 ${dashboardTileClassName}`}>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {messages.profile.measurements.inseam}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{profile.inseamCm} cm</p>
                </div>
                <div className={`rounded-[var(--radius-md)] px-4 py-3 ${dashboardTileClassName}`}>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {messages.dashboardHome.weightLabel}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {profile.weightKg ? `${profile.weightKg} kg` : messages.dashboardHome.weightMissing}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className={`rounded-[var(--radius-md)] px-4 py-4 ${dashboardTileClassName}`}>
                  <p className="mb-3 text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {messages.profile.sections.flexibility}
                  </p>
                  <FlexibilityScale score={profile.flexibilityScore} />
                </div>
                <div className={`rounded-[var(--radius-md)] px-4 py-4 ${dashboardTileClassName}`}>
                  <p className="mb-3 text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {messages.profile.sections.coreStability}
                  </p>
                  <CoreStabilityBar score={profile.coreStabilityScore} />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {messages.home.profileWarning.description}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link href={withLocalePrefix("/profile", locale)}>
              <Button variant="outline">{messages.dashboardHome.editProfile}</Button>
            </Link>
            <Link href={withLocalePrefix("/fit", locale)}>
              <Button variant="secondary">{messages.dashboardHome.newFit}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{messages.bikes.title}</h2>
            <p className="text-sm text-gray-600">{messages.bikes.subtitle}</p>
          </div>
          <Link
            href={withLocalePrefix("/bikes", locale)}
            className="inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            {messages.nav.myBikes}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {bikes.length === 0 ? (
          <Card variant="bordered" className={dashboardCardClassName}>
            <CardContent className="pt-6">
              <EmptyState
                title={messages.dashboardHome.noBikeTitle}
                description={messages.dashboardHome.noBikeDescription}
                action={
                  <Link href={withLocalePrefix("/bikes/new", locale)}>
                    <Button>{messages.bikes.actions.addBike}</Button>
                  </Link>
                }
                className="border-0 p-0 shadow-none"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bikes.map((bike) => (
              <BikeGarageRow
                key={bike._id}
                bike={bike}
                latestFit={latestFitByBike.get(bike._id) ?? null}
                locale={locale}
                messages={messages}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
