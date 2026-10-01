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
  buildLatestFitByBike,
} from "@/components/bikes/BikeGarageOverview";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { DashboardHomeProfileIndicators } from "@/components/dashboard/DashboardHomeProfileIndicators";
import { DashboardReportBike } from "@/components/dashboard/DashboardReportBike";
import { DashboardCalculatorQuickLinks } from "@/components/dashboard/DashboardCalculatorQuickLinks";
import { getDashboardReportCopy } from "@/i18n/account/dashboardReport";
import garageStyles from "@/components/dashboard/DashboardBikeGarage.module.css";
import numberStyles from "@/components/dashboard/DashboardNumbers.module.css";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import {
  getEffectiveDisplayName,
  getEffectiveProfileImageSource,
} from "@/lib/userIdentity";
import { ArrowRight, Plus, User, Bike } from "lucide-react";

export default function DashboardPage() {
  const { locale, messages } = useDashboardMessages();
  const copy = getDashboardReportCopy(locale);
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
    <div className={`${numberStyles.scope} min-w-0 space-y-6`}>
      <DashboardMessageSurface showBanners={false} showModal={false} />

      <header className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-sm text-muted-foreground">
            {messages.dashboardHome.welcomeBack}
          </p>
          <h1 className="break-words font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-[2.75rem]">
            {displayName}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            {messages.dashboardHome.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 xl:max-w-md xl:justify-end">
          <Button
            nativeButton={false}
            render={<Link href={withLocalePrefix("/fit", locale)} />}
          >
            {messages.dashboardHome.startFit}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={withLocalePrefix("/bikes/new", locale)} />}
          >
            <Plus className="h-4 w-4" />
            {messages.nav.newBike}
          </Button>
          <ProfilePhotoUpload source={profileImageSource} size="settings" />
        </div>
      </header>

      <DashboardCalculatorQuickLinks locale={locale} />

      {/* Rider profile card */}
      <Card variant="bordered" className="gap-5 rounded-3xl p-5 shadow-none sm:p-7">
        <SectionHeader
          icon={<User className="h-5 w-5 text-[color:var(--color-primary)]" />}
          title={messages.dashboardHome.riderCardTitle}
          border={false}
          className="flex-wrap p-0 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold"
          action={
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={withLocalePrefix("/profile", locale)} />}
            >
              {messages.dashboardHome.editProfile}
            </Button>
          }
        />
        <CardContent className="gap-5">
          {profile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MeasurementTile
                  label={messages.profile.measurements.height}
                  value={profile.heightCm}
                  unit="cm"
                  className="rounded-2xl border-0 bg-background p-3 [&_dd]:text-2xl"
                />
                <MeasurementTile
                  label={messages.profile.measurements.inseam}
                  value={profile.inseamCm}
                  unit="cm"
                  className="rounded-2xl border-0 bg-background p-3 [&_dd]:text-2xl"
                />
                <MeasurementTile
                  label={messages.dashboardHome.weightLabel}
                  value={profile.weightKg ?? undefined}
                  unit="kg"
                  className="rounded-2xl border-0 bg-background p-3 [&_dd]:text-2xl"
                />
                <div className="rounded-2xl border border-dashed border-border p-3">
                  <p className="text-sm text-muted-foreground">{copy.extra}</p>
                  <p className="mt-2 font-semibold">
                    {[profile.torsoLengthCm, profile.armLengthCm, profile.shoulderWidthCm, profile.femurLengthCm]
                      .every((value) => value != null) ? copy.complete : copy.missing}
                  </p>
                </div>
                {profile.weightKg == null ? (
                  <div className="rounded-2xl bg-background p-3">
                    <p className="text-sm text-muted-foreground">{messages.dashboardHome.weightLabel}</p>
                    <Button variant="link" className="mt-1 h-auto min-h-11 whitespace-normal px-0 text-left" nativeButton={false} render={<Link href={withLocalePrefix("/profile", locale)} />}>
                      {messages.dashboardHome.weightMissing}
                    </Button>
                  </div>
                ) : null}
              </div>
              <DashboardHomeProfileIndicators profile={profile} locale={locale} messages={messages} />
              {[profile.torsoLengthCm, profile.armLengthCm, profile.shoulderWidthCm, profile.femurLengthCm]
                .some((value) => value == null) && <div className="rounded-2xl bg-accent p-4 text-accent-foreground">
                <p className="font-semibold">{copy.improve}</p>
                <p className="mt-1 text-sm">{copy.improveBody}</p>
              </div>}
            </div>
          ) : (
            <InfoBox
              variant="warning"
              icon={<User className="mt-0.5 h-4 w-4 text-[color:var(--color-warning)]" />}
              className="text-sm"
            >
              <p className="font-medium">{messages.home.profileWarning.title}</p>
              <p className="mt-1 text-[color:var(--color-muted-foreground)]">
                {messages.home.profileWarning.description}
              </p>
            </InfoBox>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="link"
              className="px-0"
              nativeButton={false}
              render={<Link href={withLocalePrefix("/fit", locale)} />}
            >
              {messages.dashboardHome.newFit}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bikes section */}
      <section className="min-w-0 space-y-4" aria-label={messages.bikes.title}>
          <SectionHeader
            icon={<Bike className="h-5 w-5 text-[color:var(--color-primary)]" />}
            title={messages.bikes.title}
            border={false}
            className="flex-wrap p-0 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold"
            action={
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href={withLocalePrefix("/bikes", locale)} />}
              >
                {messages.nav.myBikes}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            }
          />
            {bikes.length === 0 ? (
              <EmptyState
                title={messages.dashboardHome.noBikeTitle}
                description={messages.dashboardHome.noBikeDescription}
                action={
                  <Button
                    nativeButton={false}
                    render={<Link href={withLocalePrefix("/bikes/new", locale)} />}
                  >
                    {messages.bikes.actions.addBike}
                  </Button>
                }
                className="rounded-3xl border border-border bg-card px-5 py-12 shadow-none"
              />
            ) : (
              <div className="space-y-4">
                {bikes.map((bike) => (
                  <article key={bike._id} aria-label={bike.name} className={garageStyles.row}>
                    <DashboardReportBike
                    bike={bike}
                    latestFit={latestFitByBike.get(bike._id) ?? null}
                  />
                  </article>
                ))}
              </div>
            )}
      </section>
    </div>
  );
}
