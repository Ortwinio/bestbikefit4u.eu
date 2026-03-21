"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingState,
} from "@/components/ui";
import {
  BikeGarageRow,
  buildLatestFitByBike,
} from "@/components/bikes/BikeGarageOverview";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { FlexibilityScale } from "@/components/profile/FlexibilityScale";
import { CoreStabilityBar } from "@/components/profile/CoreStabilityBar";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import {
  getEffectiveDisplayName,
  getEffectiveProfileImageSource,
} from "@/lib/userIdentity";
import { ArrowRight, Plus } from "lucide-react";

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
  const dashboardTileClassName = "bg-surface-secondary";

  const latestFitByBike = useMemo(
    () =>
      buildLatestFitByBike(
        sessionsWithBikes as Parameters<typeof buildLatestFitByBike>[0]
      ),
    [sessionsWithBikes]
  );

  if (isLoading) {
    return <LoadingState label={messages.layout.loading} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{messages.home.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{messages.dashboardHome.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={withLocalePrefix("/bikes/new", locale)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            <Plus className="h-4 w-4" />
            {messages.nav.newBike}
          </Link>
          <Button
            variant="primary"
            render={<Link href={withLocalePrefix("/fit", locale)} />}
          >
            <Plus className="h-4 w-4" />
            {messages.home.newFitCta}
          </Button>
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
              <p className="text-lg font-semibold text-foreground">{displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="ml-auto rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {user?.tier === "pro" || user?.tier === "premium"
                ? messages.settings.account.pro
                : messages.settings.account.free}
            </div>
          </div>

          {profile ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className={`rounded-[var(--radius-md)] px-4 py-3 ${dashboardTileClassName}`}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {messages.profile.measurements.height}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{profile.heightCm} cm</p>
                </div>
                <div className={`rounded-[var(--radius-md)] px-4 py-3 ${dashboardTileClassName}`}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {messages.profile.measurements.inseam}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{profile.inseamCm} cm</p>
                </div>
                <div className={`rounded-[var(--radius-md)] px-4 py-3 ${dashboardTileClassName}`}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {messages.dashboardHome.weightLabel}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {profile.weightKg ? `${profile.weightKg} kg` : messages.dashboardHome.weightMissing}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className={`rounded-[var(--radius-md)] px-4 py-4 ${dashboardTileClassName}`}>
                  <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                    {messages.profile.sections.flexibility}
                  </p>
                  <FlexibilityScale score={profile.flexibilityScore} />
                </div>
                <div className={`rounded-[var(--radius-md)] px-4 py-4 ${dashboardTileClassName}`}>
                  <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                    {messages.profile.sections.coreStability}
                  </p>
                  <CoreStabilityBar score={profile.coreStabilityScore} />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[var(--radius-md)] border border-warning/20 bg-warning/15 px-4 py-3 text-sm text-foreground">
              {messages.home.profileWarning.description}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href={withLocalePrefix("/profile", locale)}
              className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
            >
              {messages.dashboardHome.editProfile}
            </Link>
            <Button
              variant="primary"
              render={<Link href={withLocalePrefix("/fit", locale)} />}
            >
              {messages.dashboardHome.newFit}
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{messages.bikes.title}</h2>
            <p className="text-sm text-muted-foreground">{messages.bikes.subtitle}</p>
          </div>
          <Link
            href={withLocalePrefix("/bikes", locale)}
            className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
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
                  <Button
                    render={<Link href={withLocalePrefix("/bikes/new", locale)} />}
                  >
                    {messages.bikes.actions.addBike}
                  </Button>
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
