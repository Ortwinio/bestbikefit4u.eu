"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, LoadingState } from "@/components/ui";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikeTypeLabel } from "@/lib/bikes";
import {
  getEffectiveDisplayName,
  getEffectiveProfileImageSource,
} from "@/lib/userIdentity";
import { ArrowRight, Plus } from "lucide-react";

function CurrentBikeImage({ storageId }: { storageId?: string }) {
  const imageUrl = useResolvedImageUrl(storageId);

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
    <img src={imageUrl} alt="" className="aspect-video w-full rounded-[var(--radius-lg)] object-cover" />
  );
}

export default function DashboardPage() {
  const { locale, messages } = useDashboardMessages();
  const sessions = useQuery(api.sessions.queries.listByUser);
  const profile = useQuery(api.profiles.queries.getMyProfile);
  const user = useQuery(api.users.queries.getCurrentUser);
  const currentBike = useQuery(api.bikes.queries.getCurrentBike);
  const latestPressure = useQuery(
    api.pressureCalculations.queries.getLatestForBike,
    currentBike ? { bikeId: currentBike._id } : "skip"
  );
  const pressureStale = useQuery(
    api.pressureCalculations.queries.isBikePressureStale,
    currentBike ? { bikeId: currentBike._id } : "skip"
  );
  const latestRecommendation = useQuery(
    api.recommendations.queries.getLatestByBike,
    currentBike ? { bikeId: currentBike._id } : "skip"
  );

  const isLoading = sessions === undefined || profile === undefined || user === undefined;
  const completedSessions =
    sessions?.filter((session) => session.status === "completed").length ?? 0;
  const lastSession = sessions?.[0];
  const displayName = getEffectiveDisplayName(user, messages.userMenu.fallbackUserName);
  const profileImageSource = getEffectiveProfileImageSource(user);

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
        <Link href={withLocalePrefix("/fit", locale)}>
          <Button>
            <Plus className="h-4 w-4" />
            {messages.home.newFitCta}
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>{messages.dashboardHome.riderCardTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <ProfilePhotoUpload source={profileImageSource} size="hero" />
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {displayName}
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <div className="ml-auto rounded-full bg-[color:var(--primary)] px-3 py-1 text-xs font-semibold text-[color:var(--primary-foreground)]">
                {user?.tier === "pro" || user?.tier === "premium"
                  ? messages.settings.account.pro
                  : messages.settings.account.free}
              </div>
            </div>

            {profile ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[var(--radius-md)] bg-[color:var(--secondary)] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {messages.profile.measurements.height}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{profile.heightCm} cm</p>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[color:var(--secondary)] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {messages.profile.measurements.inseam}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{profile.inseamCm} cm</p>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[color:var(--secondary)] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
                    {messages.dashboardHome.weightLabel}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {profile.weightKg ? `${profile.weightKg} kg` : messages.dashboardHome.weightMissing}
                  </p>
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

        <div className="grid gap-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>{messages.dashboardHome.currentBikeTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentBike ? (
                <>
                  <CurrentBikeImage storageId={currentBike.photoUrl} />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{currentBike.name}</p>
                    <p className="text-sm text-gray-600">
                      {[currentBike.brand, currentBike.model].filter(Boolean).join(" ") ||
                        getBikeTypeLabel(currentBike.bikeType, messages)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={withLocalePrefix(`/bikes/${currentBike._id}`, locale)}>
                      <Button variant="outline">{messages.dashboardHome.viewBike}</Button>
                    </Link>
                    <Link href={withLocalePrefix(`/bikes/${currentBike._id}/edit`, locale)}>
                      <Button variant="secondary">{messages.common.edit}</Button>
                    </Link>
                  </div>
                </>
              ) : (
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
              )}
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>{messages.pressure.bikeDetail.sectionTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentBike && latestPressure ? (
                <>
                  <p className="text-sm text-gray-700">
                    {messages.pressure.bikeCard.front} {latestPressure.recommendedFrontBar} {messages.pressure.result.bar}
                  </p>
                  <p className="text-sm text-gray-700">
                    {messages.pressure.bikeCard.rear} {latestPressure.recommendedRearBar} {messages.pressure.result.bar}
                  </p>
                  <p className="text-sm text-gray-500">
                    {messages.pressure.bikeCard.lastCalculated}:{" "}
                    {new Date(latestPressure.createdAt).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-US")}
                  </p>
                  {pressureStale?.isStale ? (
                    <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                      {messages.dashboardHome.pressureStale}
                    </div>
                  ) : null}
                  {latestRecommendation?.pressureInsights?.warnings.length ? (
                    <p className="text-sm text-amber-800">
                      {messages.dashboardHome.pressureWarnings.replace(
                        "{count}",
                        String(latestRecommendation.pressureInsights.warnings.length)
                      )}
                    </p>
                  ) : null}
                  <Link href={withLocalePrefix(`/pressure-calculator?bikeId=${currentBike._id}`, locale)}>
                    <Button variant={pressureStale?.isStale ? "primary" : "outline"}>
                      {messages.pressure.bikeCard.newCalculation}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">{messages.pressure.bikeCard.noCalculation}</p>
                  <Link href={withLocalePrefix("/pressure-calculator", locale)}>
                    <Button variant="outline">{messages.pressure.bikeCard.newCalculation}</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{sessions?.length ?? 0}</div>
            <p className="text-sm text-gray-500">{messages.home.stats.totalSessions}</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{completedSessions}</div>
            <p className="text-sm text-gray-500">{messages.home.stats.completedFits}</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {lastSession?.completedAt
                ? new Date(lastSession.completedAt).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-US")
                : "-"}
            </div>
            <p className="text-sm text-gray-500">{messages.home.stats.lastFitDate}</p>
          </CardContent>
        </Card>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>{messages.home.recentSessions.title}</CardTitle>
            <Link
              href={withLocalePrefix("/fit", locale)}
              className="inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              {messages.dashboardHome.viewAllFits}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!sessions || sessions.length === 0 ? (
            <EmptyState
              title={messages.home.recentSessions.emptyTitle}
              description={messages.home.recentSessions.emptyDescription}
              action={
                <Link href={withLocalePrefix("/fit", locale)}>
                  <Button>{messages.home.recentSessions.emptyCta}</Button>
                </Link>
              }
              className="border-0 p-0 shadow-none"
            />
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 3).map((session) => {
                const href =
                  session.status === "completed"
                    ? `/fit/${session._id}/results`
                    : `/fit/${session._id}/questionnaire`;
                return (
                  <Link
                    key={session._id}
                    href={withLocalePrefix(href, locale)}
                    className="flex items-center justify-between rounded-[var(--radius-md)] border border-[color:var(--border)] px-4 py-3 hover:bg-[color:var(--accent)]"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{session.primaryGoal}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.createdAt).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-US")}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-blue-700">
                      {session.status === "completed"
                        ? messages.home.recentSessions.actions.viewResults
                        : messages.home.recentSessions.actions.continue}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
