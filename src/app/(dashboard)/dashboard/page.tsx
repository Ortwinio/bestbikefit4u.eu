"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  InfoBox,
  LoadingState,
  SectionHeader,
  MeasurementTile,
} from "@/components/ui";
import { DashboardMessageSurface } from "@/components/dashboard-messages";
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
import { ArrowRight, Plus, User, Bike, Activity, Dumbbell } from "lucide-react";

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
      <DashboardMessageSurface showBanners={false} showModal={false} />

      <Card variant="bordered" className="dashboard-hero-surface overflow-hidden">
        <CardContent className="px-6 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-4">
              <ProfilePhotoUpload source={profileImageSource} size="hero" />
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                  {messages.dashboardHome.welcomeBack}
                </p>
                <h1 className="text-2xl font-semibold text-[color:var(--foreground)] sm:text-3xl">
                  {displayName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {messages.dashboardHome.subtitle}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="sm"
                render={<Link href={withLocalePrefix("/fit", locale)} />}
              >
                {messages.dashboardHome.startFit}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={withLocalePrefix("/bikes/new", locale)} />}
              >
                <Plus className="h-4 w-4" />
                {messages.nav.newBike}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rider profile card */}
      <Card variant="bordered" className={dashboardCardClassName}>
        <SectionHeader
          icon={<User className="h-5 w-5 text-[color:var(--primary)]" />}
          title={messages.dashboardHome.riderCardTitle}
          action={
            <Button
              variant="outline"
              size="sm"
              render={<Link href={withLocalePrefix("/profile", locale)} />}
            >
              {messages.dashboardHome.editProfile}
            </Button>
          }
        />
        <CardContent className="space-y-5 pt-5">
          {profile ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <MeasurementTile
                  label={messages.profile.measurements.height}
                  value={profile.heightCm}
                  unit="cm"
                />
                <MeasurementTile
                  label={messages.profile.measurements.inseam}
                  value={profile.inseamCm}
                  unit="cm"
                />
                <MeasurementTile
                  label={messages.dashboardHome.weightLabel}
                  value={profile.weightKg ?? undefined}
                  unit="kg"
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="dashboard-card-surface-muted rounded-[var(--radius-xl)] border px-4 py-4">
                  <SectionHeader
                    icon={<Activity className="h-4 w-4 text-[color:var(--primary)]" />}
                    title={messages.profile.sections.flexibility}
                    border={false}
                    className="px-0 py-0 pb-3"
                  />
                  <FlexibilityScale score={profile.flexibilityScore} />
                </div>
                <div className="dashboard-card-surface-muted rounded-[var(--radius-xl)] border px-4 py-4">
                  <SectionHeader
                    icon={<Dumbbell className="h-4 w-4 text-[color:var(--primary)]" />}
                    title={messages.profile.sections.coreStability}
                    border={false}
                    className="px-0 py-0 pb-3"
                  />
                  <CoreStabilityBar score={profile.coreStabilityScore} />
                </div>
              </div>
            </div>
          ) : (
            <InfoBox
              variant="warning"
              icon={<User className="mt-0.5 h-4 w-4 text-[color:var(--warning)]" />}
              className="text-sm"
            >
              <p className="font-medium">{messages.home.profileWarning.title}</p>
              <p className="mt-1 text-[color:var(--muted-foreground)]">
                {messages.home.profileWarning.description}
              </p>
            </InfoBox>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              render={<Link href={withLocalePrefix("/fit", locale)} />}
            >
              {messages.dashboardHome.newFit}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bikes section */}
      <section className="space-y-4">
        <Card variant="bordered" className={dashboardCardClassName}>
          <SectionHeader
            icon={<Bike className="h-5 w-5 text-[color:var(--primary)]" />}
            title={messages.bikes.title}
            action={
              <Button
                variant="outline"
                size="sm"
                render={<Link href={withLocalePrefix("/bikes", locale)} />}
              >
                {messages.nav.myBikes}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            }
          />
          <CardContent className="pt-5">
            {bikes.length === 0 ? (
              <EmptyState
                title={messages.dashboardHome.noBikeTitle}
                description={messages.dashboardHome.noBikeDescription}
                action={
                  <Button
                    size="sm"
                    render={<Link href={withLocalePrefix("/bikes/new", locale)} />}
                  >
                    {messages.bikes.actions.addBike}
                  </Button>
                }
                className="border-0 p-0 shadow-none"
              />
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
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
