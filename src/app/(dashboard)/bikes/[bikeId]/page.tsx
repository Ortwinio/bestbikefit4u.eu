"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { BikeDescriptionEditor } from "@/components/bikes/BikeDescriptionEditor";
import { BikeFitHistorySection } from "@/components/bikes/BikeFitHistorySection";
import { BikeNotesEditor } from "@/components/bikes/BikeNotesEditor";
import { BikePhotoGallery } from "@/components/bikes/BikePhotoGallery";
import { BikeWheelsetManager } from "@/components/bikes/BikeWheelsetManager";
import { BikePressureSection } from "@/components/features/pressure/BikePressureSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingState,
} from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikeTypeLabel } from "@/lib/bikes";

export default function BikeDetailPage({
  params,
}: {
  params: Promise<{ bikeId: string }>;
}) {
  const { bikeId } = use(params);
  const { locale, messages } = useDashboardMessages();

  const bikeDetail = useQuery(api.bikes.queries.getDetail, {
    bikeId: bikeId as Id<"bikes">,
  });
  const ensureDefaultBikeProfile = useMutation(
    api.bikeProfiles.mutations.ensureDefaultForBike
  );
  const bike = bikeDetail?.bike ?? null;
  const bikeProfiles = bikeDetail?.bikeProfiles;
  const activeWheelset = bikeDetail?.activeWheelset ?? null;
  const activeTireSetup = bikeDetail?.activeTireSetup ?? null;
  const recommendation = bikeDetail?.latestRecommendation ?? null;
  const shouldHaveClimbingProfile = [
    "road",
    "gravel",
    "mountain",
    "cyclocross",
    "touring",
    "tt_triathlon",
  ].includes(bike?.bikeType ?? "");

  useEffect(() => {
    if (!bike || bikeProfiles === undefined) {
      return;
    }

    const hasDefaultProfile = bikeProfiles.some((profile) => profile.isDefault);
    const hasClimbingProfile = bikeProfiles.some(
      (profile) => profile.profileType === "climbing"
    );

    if (!hasDefaultProfile || (shouldHaveClimbingProfile && !hasClimbingProfile)) {
      void ensureDefaultBikeProfile({ bikeId: bike._id });
    }
  }, [bike, bikeProfiles, ensureDefaultBikeProfile, shouldHaveClimbingProfile]);

  if (bikeDetail === undefined) {
    return <LoadingState label={messages.bikeForm.edit.loading} />;
  }

  if (bike === null) {
    return (
      <EmptyState
        title={messages.bikeForm.edit.notFound.title}
        description={messages.bikeForm.edit.notFound.description}
      />
    );
  }

  const ridingStyleLabel = bike.ridingStyle
    ? messages.fit.ridingStyles[bike.ridingStyle].label
    : "-";
  const primaryGoalLabel = bike.primaryGoal
    ? messages.fit.goals[bike.primaryGoal].label
    : "-";
  const defaultBikeProfile =
    bikeProfiles?.find((profile) => profile.isDefault) ?? bikeProfiles?.[0];
  const defaultBikeProfileDescription = bike.ridingStyle
    ? messages.fit.ridingStyles[bike.ridingStyle].description
    : null;
  const bikeProfileName = (profile: NonNullable<typeof bikeProfiles>[number]) => {
    if (profile.isDefault && bike.ridingStyle) {
      return messages.fit.ridingStyles[bike.ridingStyle].label;
    }
    if (profile.profileType === "climbing") {
      return messages.bikeProfileTypes.climbing;
    }
    return profile.name;
  };
  const bikeProfileDescription = (profileType: string) => {
    if (profileType === "climbing") {
      return messages.bikes.profiles.climbingDescription;
    }
    if (profileType === defaultBikeProfile?.profileType && defaultBikeProfileDescription) {
      return defaultBikeProfileDescription;
    }
    return null;
  };
  const bikeSubtitle =
    [bike.brand, bike.model].filter(Boolean).join(" ") ||
    messages.bikes.identity.emptyBrandModel;
  const hasFit = Boolean(recommendation);
  const hasPressureSetup = Boolean(activeWheelset && activeTireSetup);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--foreground)]">{bike.name}</h1>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            {bikeSubtitle}
          </p>
        </div>
        <Link
          href={withLocalePrefix(`/bikes/${bike._id}/edit`, locale)}
          className="rounded-[var(--radius-md)] border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:bg-[color:var(--accent)]"
        >
          {messages.common.edit}
        </Link>
      </div>

      <Card variant="bordered" className="dashboard-card-surface">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[color:var(--secondary)] px-3 py-1 text-xs font-semibold text-[color:var(--secondary-foreground)]">
                {getBikeTypeLabel(bike.bikeType, messages)}
              </span>
              {hasFit ? (
                <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
                  {messages.bikes.identity.fitBadge}
                </span>
              ) : null}
              {hasPressureSetup ? (
                <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
                  {messages.bikes.identity.pressureBadge}
                </span>
              ) : null}
            </div>
            <p className="max-w-2xl text-sm text-[color:var(--muted-foreground)]">
              {messages.bikes.cards.bikeSummary.replace(
                "{bikeType}",
                getBikeTypeLabel(bike.bikeType, messages)
              )}
            </p>
          </div>
          <div className="grid gap-2 text-sm text-[color:var(--foreground)] sm:grid-cols-2">
            <p>{messages.fit.sections.ridingStyle}: {ridingStyleLabel}</p>
            <p>{messages.fit.sections.primaryGoal}: {primaryGoalLabel}</p>
            <p>{messages.pressure.bikeDetail.activeWheelset}: {activeWheelset?.name ?? messages.pressure.bikeDetail.noWheelset}</p>
            <p>{messages.pressure.bikeDetail.activeTireSetup}: {activeTireSetup?.name ?? messages.pressure.bikeDetail.noTireSetup}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{messages.bikes.gallery.title}</CardTitle>
            <CardDescription>{messages.bikes.gallery.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <BikePhotoGallery bikeId={bike._id} photos={bikeDetail.photos} />
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card variant="bordered" className="dashboard-card-surface">
            <CardHeader>
              <CardTitle>{messages.bikes.descriptionCard.title}</CardTitle>
              <CardDescription>{messages.bikes.descriptionCard.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <BikeDescriptionEditor
                bikeId={bike._id}
                initialDescription={bike.description}
                initialSource={bike.descriptionSource}
              />
            </CardContent>
          </Card>

          <Card variant="bordered" className="dashboard-card-surface">
            <CardHeader>
              <CardTitle>{messages.bikes.sections.geometry}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-[color:var(--foreground)] sm:grid-cols-2">
              <p>{messages.bikeForm.fields.type.staticLabel} {getBikeTypeLabel(bike.bikeType, messages)}</p>
              <p>{messages.fit.sections.ridingStyle}: {ridingStyleLabel}</p>
              <p>{messages.fit.sections.primaryGoal}: {primaryGoalLabel}</p>
              <p>{messages.bikeForm.fields.brand.label}: {bike.brand ?? "-"}</p>
              <p>{messages.bikeForm.fields.model.label}: {bike.model ?? "-"}</p>
              <p>{messages.bikeForm.fields.bikeWeightKg.label}: {bike.bikeWeightKg ?? "-"}</p>
              <p>{messages.bikes.fields.stack}: {bike.currentGeometry?.stackMm ?? "-"}</p>
              <p>{messages.bikes.fields.reach}: {bike.currentGeometry?.reachMm ?? "-"}</p>
              <p>{messages.bikes.fields.frameSize}: {bike.currentGeometry?.frameSize ?? "-"}</p>
            </CardContent>
          </Card>

          <Card variant="bordered" className="dashboard-card-surface">
            <CardHeader>
              <CardTitle>{messages.bikes.wheelsetManager.title}</CardTitle>
              <CardDescription>{messages.bikes.wheelsetManager.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <BikeWheelsetManager bikeId={bike._id} wheelsets={bikeDetail.wheelsets} />
            </CardContent>
          </Card>

          <Card variant="bordered" className="dashboard-card-surface">
            <CardHeader>
              <CardTitle>{messages.results.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[color:var(--foreground)]">
              {recommendation ? (
                <>
                  <p>{messages.results.algorithmVersionLabel}: {recommendation.algorithmVersion}</p>
                  <p>
                    <Link
                      href={withLocalePrefix(`/fit/${recommendation.sessionId}/results`, locale)}
                      className="font-semibold text-[color:var(--primary)] hover:opacity-80"
                    >
                      {messages.home.recentSessions.actions.viewResults}
                    </Link>
                  </p>
                </>
              ) : (
                <p>{messages.dashboardFit.noResultsYet}</p>
              )}
            </CardContent>
          </Card>

          <Card variant="bordered" className="dashboard-card-surface">
            <CardHeader>
              <CardTitle>{messages.bikes.defaultProfile.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--foreground)]">
              {bikeProfiles && bikeProfiles.length > 0 ? (
                bikeProfiles.map((profile) => (
                  <div
                    key={profile._id}
                    className="rounded-lg border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-3"
                  >
                    <p className="font-medium text-[color:var(--foreground)]">
                      {bikeProfileName(profile)}
                      {profile.isDefault ? (
                        <span className="ml-2 rounded-full bg-[color:var(--secondary)] px-2 py-1 text-xs font-semibold text-[color:var(--secondary-foreground)]">
                          {messages.fit.savedBikes.defaultBadge}
                        </span>
                      ) : null}
                    </p>
                    <p>
                      {messages.bikes.defaultProfile.profileType}:{" "}
                      {messages.bikeProfileTypes[profile.profileType]}
                    </p>
                    {bikeProfileDescription(profile.profileType) ? (
                      <p>{bikeProfileDescription(profile.profileType)}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p>{messages.bikes.defaultProfile.empty}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card variant="bordered" className="dashboard-card-surface">
        <CardHeader>
          <CardTitle>{messages.bikes.sections.notes}</CardTitle>
        </CardHeader>
        <CardContent>
          <BikeNotesEditor bikeId={bike._id} initialNotes={bike.notes} />
        </CardContent>
      </Card>

      <BikeFitHistorySection bikeId={bike._id} />

      <BikePressureSection bikeId={bike._id} />
    </div>
  );
}
