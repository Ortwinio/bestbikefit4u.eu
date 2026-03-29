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

      {/* Gradient hero / welcome card */}
      <div className="rounded-[var(--radius-xl)] bg-gradient-to-br from-primary to-primary/75 p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <ProfilePhotoUpload source={profileImageSource} size="hero" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
              {messages.dashboardHome.welcomeBack}
            </p>
            <p className="text-xl font-bold text-primary-foreground">{displayName}</p>
            <p className="mt-0.5 text-sm text-primary-foreground/75">
              {messages.dashboardHome.subtitle}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={withLocalePrefix("/fit", locale)} />}
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            {messages.dashboardHome.startFit}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Link
            href={withLocalePrefix("/bikes/new", locale)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary-foreground/10 px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Plus className="h-4 w-4" />
            {messages.nav.newBike}
          </Link>
        </div>
      </div>

      {/* Rider profile card */}
      <Card variant="bordered" className={dashboardCardClassName}>
        <SectionHeader
          icon={<User className="h-5 w-5 text-[color:var(--primary)]" />}
          title={messages.dashboardHome.riderCardTitle}
          action={
            <Link
              href={withLocalePrefix("/profile", locale)}
              className="inline-flex items-center rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              {messages.dashboardHome.editProfile}
            </Link>
          }
        />
        <CardContent className="space-y-4 pt-4">
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
                <div className="rounded-[var(--radius-md)] bg-[color:var(--surface-secondary)] px-4 py-4">
                  <SectionHeader
                    icon={<Activity className="h-4 w-4 text-[color:var(--primary)]" />}
                    title={messages.profile.sections.flexibility}
                    border={false}
                    className="px-0 py-0 pb-3"
                  />
                  <FlexibilityScale score={profile.flexibilityScore} />
                </div>
                <div className="rounded-[var(--radius-md)] bg-[color:var(--surface-secondary)] px-4 py-4">
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
            <div className="rounded-[var(--radius-md)] border border-warning/20 bg-warning/15 px-4 py-3 text-sm text-foreground">
              {messages.home.profileWarning.description}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="font-semibold shadow-sm"
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
              <Link
                href={withLocalePrefix("/bikes", locale)}
                className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                {messages.nav.myBikes}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <CardContent className="pt-4">
            {bikes.length === 0 ? (
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
