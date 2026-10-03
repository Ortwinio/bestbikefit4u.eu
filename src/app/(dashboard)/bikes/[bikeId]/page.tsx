"use client";

import { BikeProfilePanel } from "@/components/bikes/BikeProfilePanel";
import { bikeProfileMessages } from "@/i18n/account/bikeProfile";
import { DeleteBikeAction } from "@/components/bikes/DeleteBikeAction";

import { use, useEffect, useRef, useState } from "react";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, Copy, Gauge, Route, Ruler, Target } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { BikeFitPreview } from "@/components/bikes/BikeFitPreview";
import { getBikesCopy } from "@/i18n/account/bikes";
import { BikeDescriptionEditor } from "@/components/bikes/BikeDescriptionEditor";
import { BikeFitHistorySection } from "@/components/bikes/BikeFitHistorySection";
import { BikeSettingsEditor } from "@/components/bikes/BikeSettingsEditor";
import { BikePhotoGallery } from "@/components/bikes/BikePhotoGallery";
import { BikeWheelsetManager } from "@/components/bikes/BikeWheelsetManager";
import { BikePressureSection } from "@/components/features/pressure/BikePressureSection";
import { BikeGearingCard } from "./BikeGearingCard";
import { GeometryLinkCard, type GeometryLinkState } from "./GeometryLinkCard";
import { SignedInFitFollowUpCard } from "./SignedInFitFollowUpCard";
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
import { getBikeLanguageMessages } from "@/i18n/account/bikesLanguage";
import { getBikeTypeLabel } from "@/lib/bikes";

export default function BikeDetailPage({ params }: { params: Promise<{ bikeId: string }> }) {
  const { bikeId } = use(params);
  const { locale, messages: baseMessages } = useDashboardMessages();
  const messages = getBikeLanguageMessages(locale, baseMessages);
  const profileCopy = bikeProfileMessages[locale];
  const toast = useToast();
  const logMarketingEvent = useMarketingEventLogger();
  const geometryViewTrackedRef = useRef<string | null>(null);

  const [deletion, setDeletion] = useState<{
    pending: boolean;
    detail: FunctionReturnType<typeof api.bikes.queries.getDetail>;
  } | null>(null);
  const liveBikeDetail = useQuery(api.bikes.queries.getDetail,
    deletion?.pending ? "skip" : { bikeId: bikeId as Id<"bikes"> });
  const bikeDetail = liveBikeDetail === undefined ? deletion?.detail : liveBikeDetail;
  const ensureDefaultBikeProfile = useMutation(api.bikeProfiles.mutations.ensureDefaultForBike);
  const ensurePassportIdForBike = useMutation(api.bikes.mutations.ensurePassportIdForBike);
  const bike = bikeDetail?.bike ?? null;
  const bikeProfiles = bikeDetail?.bikeProfiles;
  const linkedGeometry = bikeDetail?.linkedGeometry ?? null;
  const geometryLinkState: GeometryLinkState =
    bikeDetail?.geometryLinkState === "linked" || bikeDetail?.geometryLinkState === "missing_record"
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
    if (deletion?.pending || !bike || bikeProfiles === undefined) {
      return;
    }

    const hasDefaultProfile = bikeProfiles.some((profile) => profile.isDefault);
    const hasClimbingProfile = bikeProfiles.some((profile) => profile.profileType === "climbing");

    if (!hasDefaultProfile || (shouldHaveClimbingProfile && !hasClimbingProfile)) {
      void ensureDefaultBikeProfile({ bikeId: bike._id });
    }
    const ensuredBikePassportId =
      "bikePassportId" in bike ? ((bike as { bikePassportId?: string }).bikePassportId ?? null) : null;

    if (!ensuredBikePassportId) {
      void ensurePassportIdForBike({ bikeId: bike._id });
    }
  }, [bike, bikeProfiles, deletion?.pending, ensureDefaultBikeProfile, ensurePassportIdForBike, shouldHaveClimbingProfile]);

  useEffect(() => {
    if (!bike) {
      return;
    }

    const eventType =
      geometryLinkState === "linked" ? "bike_geometry_card_viewed" : "bike_geometry_unlinked_state_viewed";
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

  if (bike === null || !bikeDetail) {
    return (
      <EmptyState
        title={messages.bikeForm.edit.notFound.title}
        description={messages.bikeForm.edit.notFound.description}
        action={<Button render={<Link href={withLocalePrefix("/bikes", locale)} />}>
          {getBikesCopy(locale).back}
        </Button>}
      />
    );
  }

  const ridingStyleLabel = bike.ridingStyle ? messages.fit.ridingStyles[bike.ridingStyle].label : "-";
  const primaryGoalLabel = bike.primaryGoal ? messages.fit.goals[bike.primaryGoal].label : "-";
  const defaultBikeProfile = bikeProfiles?.find((profile) => profile.isDefault) ?? bikeProfiles?.[0];
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
    [bike.brand, bike.model].filter(Boolean).join(" ") || messages.bikes.identity.emptyBrandModel;
  const hasFit = Boolean(recommendation);
  const hasPressureSetup = Boolean(activeWheelset && activeTireSetup);
  const bikePassportId =
    typeof (bike as { bikePassportId?: unknown }).bikePassportId === "string"
      ? ((bike as { bikePassportId?: string }).bikePassportId ?? null)
      : null;
  const publicFitEnabled =
    typeof (bike as { publicFitEnabled?: unknown }).publicFitEnabled === "boolean"
      ? ((bike as { publicFitEnabled?: boolean }).publicFitEnabled ?? false)
      : false;
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Button variant="outline" render={<Link href={withLocalePrefix("/bikes", locale)} />}>
        {getBikesCopy(locale).back}
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {bike.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{bikeSubtitle}</p>
        </div>

        <DeleteBikeAction
          bikeId={bike._id}
          bikeName={bike.name}
          onPendingChange={(pending) => setDeletion({ pending, detail: bikeDetail })}
        />
      </div>

      <nav aria-label={profileCopy.profileNav}
        className="flex flex-wrap gap-2 rounded-3xl border border-border bg-card p-2">
        {[
          { href: "/profile", label: profileCopy.profileLink },
          { href: "/profile/advice", label: profileCopy.adviceLink },
          { href: "/bikes", label: profileCopy.bikesLink, current: true },
        ].map((item) => <Link key={item.href} href={withLocalePrefix(item.href, locale)}
          aria-current={item.current ? "page" : undefined}
          className={"inline-flex min-h-11 items-center rounded-full px-4 py-2 font-semibold focus-visible:focus-ring "
            + (item.current ? "bg-foreground text-background" : "text-foreground")}>
          {item.label}
        </Link>)}
      </nav>
      <BikeProfilePanel key={bike._id} bikeId={bike._id} locale={locale} detail={bikeDetail} />

      <details className="rounded-3xl border border-border bg-card p-4 sm:p-6">
        <summary className="min-h-11 cursor-pointer font-display text-xl font-bold focus-visible:focus-ring">
          {profileCopy.detailExtrasLabel}
        </summary>
        <div className="mt-4 space-y-6">
          <Card variant="bordered" className="bg-card overflow-hidden">
            <CardContent className="grid gap-6 p-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)]">
              <div className="space-y-5 bg-primary-soft px-6 py-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {getBikeTypeLabel(bike.bikeType, messages)}
                  </span>
                  {hasFit ? (
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">
                      {messages.bikes.identity.fitBadge}
                    </span>
                  ) : null}
                  {hasPressureSetup ? (
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">
                      {messages.bikes.identity.pressureBadge}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {messages.bikes.title}
                  </p>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">{bike.name}</h2>
                  <p className="text-base text-muted-foreground">{bikeSubtitle}</p>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    {messages.bikes.cards.bikeSummary.replace(
                      "{bikeType}",
                      getBikeTypeLabel(bike.bikeType, messages),
                    )}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2 rounded-[var(--radius-lg)] border border-border bg-background/80 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {messages.bikes.identity.passportLabel}
                        </p>
                        <p className="mt-2 font-mono text-lg font-semibold text-foreground">
                          {bikePassportId ?? messages.bikes.identity.passportMissing}
                        </p>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
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
                  <div className="rounded-[var(--radius-lg)] border border-border bg-background/80 p-4">
                    <p
                      className={
                        "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] " +
                        "text-muted-foreground"
                      }
                    >
                      <Route className="h-4 w-4" />
                      {messages.fit.sections.ridingStyle}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{ridingStyleLabel}</p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] border border-border bg-background/80 p-4">
                    <p
                      className={
                        "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] " +
                        "text-muted-foreground"
                      }
                    >
                      <Target className="h-4 w-4" />
                      {messages.fit.sections.primaryGoal}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{primaryGoalLabel}</p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] border border-border bg-background/80 p-4">
                    <p
                      className={
                        "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] " +
                        "text-muted-foreground"
                      }
                    >
                      <Gauge className="h-4 w-4" />
                      {messages.pressure.bikeDetail.activeWheelset}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {activeWheelset?.name ?? messages.pressure.bikeDetail.noWheelset}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-lg)] border border-border bg-background/80 p-4">
                    <p
                      className={
                        "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] " +
                        "text-muted-foreground"
                      }
                    >
                      <Ruler className="h-4 w-4" />
                      {messages.pressure.bikeDetail.activeTireSetup}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {activeTireSetup?.name ?? messages.pressure.bikeDetail.noTireSetup}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-6 py-6">
                <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/25 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {messages.results.title}
                  </p>
                  {recommendation ? (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {messages.results.algorithmVersionLabel}:{" "}
                        <span className="font-semibold text-foreground">{recommendation.algorithmVersion}</span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link href={withLocalePrefix(`/fit/${recommendation.sessionId}/results`, locale)} />
                        }
                      >
                        {messages.home.recentSessions.actions.viewResults}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">{messages.dashboardFit.noResultsYet}</p>
                  )}
                </div>

                <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/25 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {messages.bikes.defaultProfile.title}
                  </p>
                  <div className="mt-3 space-y-3 text-sm text-foreground">
                    {bikeProfiles && bikeProfiles.length > 0 ? (
                      bikeProfiles.map((profile) => (
                        <div
                          key={profile._id}
                          className="rounded-[var(--radius-md)] border border-border bg-background/80 p-3"
                        >
                          <p className="font-medium text-foreground">
                            {bikeProfileName(profile)}
                            {profile.isDefault ? (
                              <span
                                className={"ml-2 rounded-full bg-secondary px-2 py-1 " +
                                "text-xs font-semibold text-secondary-foreground"}>
                                {messages.fit.savedBikes.defaultBadge}
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {messages.bikes.defaultProfile.profileType}:{" "}
                            {messages.bikeProfileTypes[profile.profileType]}
                          </p>
                          {bikeProfileDescription(profile.profileType) ? (
                            <p className="mt-1 text-muted-foreground">
                              {bikeProfileDescription(profile.profileType)}
                            </p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{messages.bikes.defaultProfile.empty}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {recommendation?.calculatedFit ? (
            <BikeFitPreview
              key={recommendation._id}
              saddleHeightMm={bike.currentSetup?.saddleHeightMm}
              target={recommendation.calculatedFit}
            />
          ) : null}

          {publicFitEnabled ? (
            <SignedInFitFollowUpCard
              locale={locale}
              copy={{
                title: messages.bikes.publicFit.followUpTitle,
                description: messages.bikes.publicFit.followUpDescription,
                profileCta: messages.bikes.publicFit.followUpProfileCta,
                fitCta: messages.bikes.publicFit.followUpFitCta,
              }}
              onCtaClick={(targetPath, ctaLabel) => {
                logMarketingEvent({
                  eventType: "bike_public_fit_signup_cta_clicked",
                  locale,
                  pagePath: withLocalePrefix(`/bikes/${bike._id}`, locale),
                  section: "bike_public_fit_signed_in_follow_up",
                  ctaLabel,
                  ctaTargetPath: targetPath,
                  sourceTag: bike.publicFitSnapshot?.geometryQuality ?? "none",
                });
              }}
            />
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <Card variant="bordered" className="bg-card">
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
                bike={{
                  bikeType: bike.bikeType,
                  ridingStyle: bike.ridingStyle,
                  primaryGoal: bike.primaryGoal,
                  brand: bike.brand,
                  model: bike.model,
                  bikeWeightKg: bike.bikeWeightKg,
                  currentGeometry: bike.currentGeometry,
                }}
                editHref={withLocalePrefix(`/bikes/${bike._id}/edit#bike-geometry-library`, locale)}
                messages={messages}
              />

              <BikeGearingCard
                bikeId={String(bike._id)}
                gearing={
                  (bike as { gearing?: unknown }).gearing as
                    | {
                        drivetrainType?: "1x" | "2x";
                        chainrings?: number[];
                        cassetteTeeth?: number[];
                        wheelCircumferenceMm?: number;
                        crankLengthMm?: number;
                        groupsetName?: string;
                        derailleurMaxCog?: number;
                        completeness?: "missing" | "partial" | "complete" | "validated";
                      }
                    | null
                    | undefined
                }
                locale={locale}
              />

              <Card variant="bordered" className="bg-card">
                <CardHeader>
                  <CardTitle>{messages.bikes.descriptionCard.title}</CardTitle>
                  <CardDescription>{messages.bikes.descriptionCard.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <BikeDescriptionEditor
                    key={bike._id}
                    bikeId={bike._id}
                    initialDescription={bike.description}
                    initialSource={bike.descriptionSource}
                  />
                </CardContent>
              </Card>

              <Card variant="bordered" className="bg-card">
                <CardHeader>
                  <CardTitle>{messages.bikes.wheelsetManager.title}</CardTitle>
                  <CardDescription>{messages.bikes.wheelsetManager.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <BikeWheelsetManager key={bike._id} bikeId={bike._id} wheelsets={bikeDetail.wheelsets} />
                </CardContent>
              </Card>
            </div>
          </div>

          {!deletion?.pending && <BikeSettingsEditor key={bike._id} bike={bike} embedded />}

          {!deletion?.pending && <BikeFitHistorySection bikeId={bike._id} />}

          {!deletion?.pending && <BikePressureSection bikeId={bike._id} />}
        </div>
      </details>
    </div>
  );
}
