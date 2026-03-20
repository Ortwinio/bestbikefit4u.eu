"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { BikeFitHistorySection } from "@/components/bikes/BikeFitHistorySection";
import { BikeNotesEditor } from "@/components/bikes/BikeNotesEditor";
import { BikePhotoUpload } from "@/components/bikes/BikePhotoUpload";
import { BikePressureSection } from "@/components/features/pressure/BikePressureSection";
import { Card, CardContent, CardHeader, CardTitle, EmptyState, LoadingState } from "@/components/ui";
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

  const bike = useQuery(api.bikes.queries.getById, {
    bikeId: bikeId as Id<"bikes">,
  });
  const ensureDefaultBikeProfile = useMutation(
    api.bikeProfiles.mutations.ensureDefaultForBike
  );
  const bikeProfiles = useQuery(
    api.bikeProfiles.queries.listByBike,
    bike ? { bikeId: bike._id } : "skip"
  );
  const wheelsets = useQuery(
    api.wheelsets.queries.listForBike,
    bike ? { bikeId: bike._id } : "skip"
  );
  const recommendation = useQuery(
    api.recommendations.queries.getLatestByBike,
    bike ? { bikeId: bike._id } : "skip"
  );

  const activeWheelset =
    wheelsets?.find((wheelset: (typeof wheelsets)[number]) => wheelset.isActive) ??
    wheelsets?.[0];
  const tireSetups = useQuery(
    api.tireSetups.queries.listForWheelset,
    activeWheelset ? { wheelsetId: activeWheelset._id } : "skip"
  );
  const activeTireSetup =
    tireSetups?.find((tireSetup: (typeof tireSetups)[number]) => tireSetup.isActive) ??
    tireSetups?.[0];
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

  if (bike === undefined) {
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{bike.name}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {[bike.brand, bike.model].filter(Boolean).join(" ") || getBikeTypeLabel(bike.bikeType, messages)}
          </p>
        </div>
        <Link
          href={withLocalePrefix(`/bikes/${bike._id}/edit`, locale)}
          className="rounded-[var(--radius-md)] border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:bg-[color:var(--accent)]"
        >
          {messages.common.edit}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <BikePhotoUpload bikeId={bike._id} currentPhotoStorageId={bike.photoUrl} />

        <div className="grid gap-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>{messages.bikes.sections.geometry}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
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

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>{messages.pressure.bikeDetail.activeTireSetup}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>{messages.pressure.bikeDetail.activeWheelset}: {activeWheelset?.name ?? messages.pressure.bikeDetail.noWheelset}</p>
              <p>{messages.pressure.bikeDetail.activeTireSetup}: {activeTireSetup?.name ?? messages.pressure.bikeDetail.noTireSetup}</p>
              {activeTireSetup ? (
                <p>
                  {activeTireSetup.widthFrontMm} / {activeTireSetup.widthRearMm} mm
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>{messages.results.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              {recommendation ? (
                <>
                  <p>{messages.results.algorithmVersionLabel}: {recommendation.algorithmVersion}</p>
                  <p>
                    <Link
                      href={withLocalePrefix(`/fit/${recommendation.sessionId}/results`, locale)}
                      className="font-semibold text-blue-700 hover:text-blue-800"
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

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>{messages.bikes.defaultProfile.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              {bikeProfiles && bikeProfiles.length > 0 ? (
                bikeProfiles.map((profile) => (
                  <div
                    key={profile._id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <p className="font-medium text-gray-900">
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

      <Card variant="bordered">
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
