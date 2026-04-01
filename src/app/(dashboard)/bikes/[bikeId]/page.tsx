"use client";

import { use, useEffect, useRef } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, Copy, Gauge, Route, Ruler, Target } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { BikeDescriptionEditor } from "@/components/bikes/BikeDescriptionEditor";
import { BikeFitHistorySection } from "@/components/bikes/BikeFitHistorySection";
import { BikeNotesEditor } from "@/components/bikes/BikeNotesEditor";
import { BikePhotoGallery } from "@/components/bikes/BikePhotoGallery";
import { BikeWheelsetManager } from "@/components/bikes/BikeWheelsetManager";
import { BikePressureSection } from "@/components/features/pressure/BikePressureSection";
import { GeometryLinkCard, type GeometryLinkState } from "./GeometryLinkCard";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingState,
  useToast,
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
  const toast = useToast();
  const logMarketingEvent = useMarketingEventLogger();
  const geometryViewTrackedRef = useRef<string | null>(null);

  const bikeDetail = useQuery(api.bikes.queries.getDetail, {
    bikeId: bikeId as Id<"bikes">,
  });
  const ensureDefaultBikeProfile = useMutation(
    api.bikeProfiles.mutations.ensureDefaultForBike
  );
  const ensurePassportIdForBike = useMutation(
    api.bikes.mutations.ensurePassportIdForBike
  );
  const bike = bikeDetail?.bike ?? null;
  const bikeProfiles = bikeDetail?.bikeProfiles;
  const linkedGeometry = bikeDetail?.linkedGeometry ?? null;
  const geometryLinkState: GeometryLinkState =
    bikeDetail?.geometryLinkState === "linked" ||
    bikeDetail?.geometryLinkState === "missing_record"
      ? bikeDetail.geometryLinkState
      : "unlinked";
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
    const ensuredBikePassportId =
      "bikePassportId" in bike
        ? ((bike as { bikePassportId?: string }).bikePassportId ?? null)
        : null;

    if (!ensuredBikePassportId) {
      void ensurePassportIdForBike({ bikeId: bike._id });
    }
  }, [
    bike,
    bikeProfiles,
    ensureDefaultBikeProfile,
    ensurePassportIdForBike,
    shouldHaveClimbingProfile,
  ]);

  useEffect(() => {
    if (!bike) {
      return;
    }

    const eventType =
      geometryLinkState === "linked"
        ? "bike_geometry_card_viewed"
        : "bike_geometry_unlinked_state_viewed";
    const trackingKey = `${bike._id}:${geometryLinkState}`;
    if (geometryViewTrackedRef.current === trackingKey) {
      return;
    }
    geometryViewTrackedRef.current = trackingKey;

    logMarketingEvent({
      eventType,
      locale,
      pagePath: withLocalePrefix(`/bikes/${bike._id}`, locale),
      section: "bike_detail_geometry_reference",
      sourceTag: geometryLinkState,
    });
  }, [bike, geometryLinkState, locale, logMarketingEvent]);

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
  const bikePassportId =
    typeof (bike as { bikePassportId?: unknown }).bikePassportId === "string"
      ? ((bike as { bikePassportId?: string }).bikePassportId ?? null)
      : null;
  const geometryItems = [
    {
      label: messages.bikeForm.fields.type.staticLabel,
      value: getBikeTypeLabel(bike.bikeType, messages),
    },
    {
      label: messages.fit.sections.ridingStyle,
      value: ridingStyleLabel,
    },
    {
      label: messages.fit.sections.primaryGoal,
      value: primaryGoalLabel,
    },
    {
      label: messages.bikeForm.fields.brand.label,
      value: bike.brand ?? "-",
    },
    {
      label: messages.bikeForm.fields.model.label,
      value: bike.model ?? "-",
    },
    {
      label: messages.bikeForm.fields.bikeWeightKg.label,
      value: bike.bikeWeightKg ?? "-",
    },
    {
      label: messages.bikes.fields.stack,
      value: bike.currentGeometry?.stackMm ?? "-",
    },
    {
      label: messages.bikes.fields.reach,
      value: bike.currentGeometry?.reachMm ?? "-",
    },
    {
      label: messages.bikes.fields.frameSize,
      value: bike.currentGeometry?.frameSize ?? "-",
    },
  ];
  const savedGeometryDescription =
    locale === "nl"
      ? "Dit zijn de opgeslagen fietsvelden en eventuele handmatig ingevoerde geometriewaarden op deze fiets."
      : "These are the saved bike fields and any manually entered geometry values on this bike.";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--foreground)]">{bike.name}</h1>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            {bikeSubtitle}
          </p>
        </div>
        <Button
          variant="outline"
          render={<Link href={withLocalePrefix(`/bikes/${bike._id}/edit`, locale)} />}
        >
          {messages.common.edit}
        </Button>
      </div>

      <Card variant="bordered" className="dashboard-card-surface overflow-hidden">
        <CardContent className="grid gap-6 p-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)]">
          <div className="space-y-5 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--secondary)_72%,var(--background)_28%),color-mix(in_oklch,var(--card)_88%,var(--primary)_12%))] px-6 py-6">
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
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                {messages.bikes.title}
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)]">
                {bike.name}
              </h2>
              <p className="text-base text-[color:var(--muted-foreground)]">{bikeSubtitle}</p>
              <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
                {messages.bikes.cards.bikeSummary.replace(
                  "{bikeType}",
                  getBikeTypeLabel(bike.bikeType, messages)
                )}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                      {messages.bikes.identity.passportLabel}
                    </p>
                    <p className="mt-2 font-mono text-lg font-semibold text-[color:var(--foreground)]">
                      {bikePassportId ?? messages.bikes.identity.passportMissing}
                    </p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
                      {messages.bikes.identity.passportDescription}
                    </p>
                  </div>
                  {bikePassportId ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(bikePassportId);
                          toast.success({
                            description: messages.bikes.identity.passportCopied,
                          });
                        } catch {
                          toast.error({
                            description: messages.bikes.identity.passportCopyFailed,
                          });
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      {messages.bikes.identity.passportCopyAction}
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                  <Route className="h-4 w-4" />
                  {messages.fit.sections.ridingStyle}
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  {ridingStyleLabel}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                  <Target className="h-4 w-4" />
                  {messages.fit.sections.primaryGoal}
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  {primaryGoalLabel}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                  <Gauge className="h-4 w-4" />
                  {messages.pressure.bikeDetail.activeWheelset}
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  {activeWheelset?.name ?? messages.pressure.bikeDetail.noWheelset}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--background)]/80 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                  <Ruler className="h-4 w-4" />
                  {messages.pressure.bikeDetail.activeTireSetup}
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  {activeTireSetup?.name ?? messages.pressure.bikeDetail.noTireSetup}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 py-6">
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/25 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                {messages.results.title}
              </p>
              {recommendation ? (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {messages.results.algorithmVersionLabel}:{" "}
                    <span className="font-semibold text-[color:var(--foreground)]">
                      {recommendation.algorithmVersion}
                    </span>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        href={withLocalePrefix(
                          `/fit/${recommendation.sessionId}/results`,
                          locale
                        )}
                      />
                    }
                  >
                    {messages.home.recentSessions.actions.viewResults}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
                  {messages.dashboardFit.noResultsYet}
                </p>
              )}
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/25 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                {messages.bikes.defaultProfile.title}
              </p>
              <div className="mt-3 space-y-3 text-sm text-[color:var(--foreground)]">
                {bikeProfiles && bikeProfiles.length > 0 ? (
                  bikeProfiles.map((profile) => (
                    <div
                      key={profile._id}
                      className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--background)]/80 p-3"
                    >
                      <p className="font-medium text-[color:var(--foreground)]">
                        {bikeProfileName(profile)}
                        {profile.isDefault ? (
                          <span className="ml-2 rounded-full bg-[color:var(--secondary)] px-2 py-1 text-xs font-semibold text-[color:var(--secondary-foreground)]">
                            {messages.fit.savedBikes.defaultBadge}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-[color:var(--muted-foreground)]">
                        {messages.bikes.defaultProfile.profileType}:{" "}
                        {messages.bikeProfileTypes[profile.profileType]}
                      </p>
                      {bikeProfileDescription(profile.profileType) ? (
                        <p className="mt-1 text-[color:var(--muted-foreground)]">
                          {bikeProfileDescription(profile.profileType)}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-[color:var(--muted-foreground)]">
                    {messages.bikes.defaultProfile.empty}
                  </p>
                )}
              </div>
            </div>
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
            <BikePhotoGallery bikeId={bike._id} bikeName={bike.name} photos={bikeDetail.photos} />
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <GeometryLinkCard
            locale={locale}
            state={geometryLinkState}
            linkedGeometry={linkedGeometry}
          />

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
              <CardDescription>{savedGeometryDescription}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {geometryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/25 px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[color:var(--foreground)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card variant="bordered" className="dashboard-card-surface">
            <CardHeader>
              <CardTitle>{messages.bikes.sections.notes}</CardTitle>
            </CardHeader>
            <CardContent>
              <BikeNotesEditor bikeId={bike._id} initialNotes={bike.notes} />
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

        </div>
      </div>

      <BikeFitHistorySection bikeId={bike._id} />

      <BikePressureSection bikeId={bike._id} />
    </div>
  );
}
