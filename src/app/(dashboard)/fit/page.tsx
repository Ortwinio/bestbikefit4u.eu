"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  Button,
  Card,
  CardContent,
  LoadingState,
  useToast,
  SectionHeader,
  InfoBox,
} from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { CampaignCtaGroup } from "@/components/campaign/CampaignCtaGroup";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import {
  CONSUMER_CAMPAIGN_CONFIG,
  getConsumerCampaignCopy,
  isConsumerCampaignActive,
} from "@/config/commercial";
import {
  getBikeTypeLabel,
  isAeroCompatibleBikeType,
} from "@/lib/bikes";
import { isRiderProfileComplete } from "@/lib/profile";
import { reportClientError } from "@/lib/telemetry";
import { cn } from "@/utils/cn";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { ArrowRight, AlertCircle, PlusCircle, Bike, CheckCircle2 } from "lucide-react";
import { buildBikeRoleBias } from "../../../../convex/recommendations/bikeRoleBias";

type PrimaryGoal = "comfort" | "balanced" | "performance" | "aerodynamics";

function SavedBikeImage({ source, selected }: { source?: string; selected?: boolean }) {
  const imageUrl = useResolvedImageUrl(source);

  return (
    <div className={cn(
      "flex aspect-video w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)]",
      selected ? "bg-primary-foreground/10" : "bg-muted"
    )}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl ?? "/default-bike.svg"}
        alt=""
        className="h-full w-full object-contain p-2"
      />
    </div>
  );
}

export default function NewFitSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();
  const pagePath = withLocalePrefix("/fit", locale);
  const logMarketingEvent = useMarketingEventLogger();
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const hasTrackedFitViewRef = useRef(false);
  const [selectedBikeId, setSelectedBikeId] = useState<Id<"bikes"> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const profile = useQuery(api.profiles.queries.getMyProfile);
  const bikes = useQuery(api.bikes.queries.listByUser);
  const createSession = useMutation(api.sessions.mutations.create);
  const requestedBikeId = searchParams?.get("bikeId") ?? null;

  const hasProfile = profile !== undefined && profile !== null;
  const hasRiderProfile = isRiderProfileComplete(profile);
  const isLoadingProfile = profile === undefined;
  const isLoadingBikes = bikes === undefined;
  const selectedBike = bikes?.find((bike) => bike._id === selectedBikeId) || null;
  const selectedBikeRoleBias = selectedBike
    ? buildBikeRoleBias({
        bikeName: selectedBike.name,
        bikeType: selectedBike.bikeType,
        discipline: selectedBike.discipline,
        ridingStyle: selectedBike.ridingStyle,
        primaryGoal: selectedBike.primaryGoal,
      })
    : null;
  const effectiveBikeType = selectedBike?.bikeType ?? "";
  const effectiveRidingStyle =
    selectedBike?.ridingStyle ?? selectedBikeRoleBias?.suggestedRidingStyle ?? "";
  const effectiveRidingGoal =
    selectedBike?.primaryGoal ?? selectedBikeRoleBias?.suggestedPrimaryGoal ?? "";
  const bikeNeedsAttributes =
    Boolean(selectedBike) && (!effectiveRidingStyle || !effectiveRidingGoal);
  const isSelectedGoalAllowed =
    effectiveRidingGoal !== "aerodynamics" ||
    isAeroCompatibleBikeType(effectiveBikeType);

  const canStart = Boolean(
    selectedBikeId &&
      effectiveBikeType &&
      !bikeNeedsAttributes &&
      isSelectedGoalAllowed &&
      hasProfile &&
      hasRiderProfile &&
      !isCreating
  );

  useEffect(() => {
    if (hasTrackedFitViewRef.current) return;
    hasTrackedFitViewRef.current = true;
    logMarketingEvent({
      eventType: "funnel_fit_view",
      locale,
      pagePath,
      section: "fit_start_page",
    });
  }, [locale, logMarketingEvent, pagePath]);

  useEffect(() => {
    if (!requestedBikeId || !bikes || selectedBikeId) return;
    const requestedBike = bikes.find((bike) => bike._id === requestedBikeId);
    if (!requestedBike) return;
    setSelectedBikeId(requestedBike._id);
  }, [bikes, requestedBikeId, selectedBikeId]);

  const handleStartSession = async () => {
    if (!effectiveBikeType || !effectiveRidingStyle || !effectiveRidingGoal || bikeNeedsAttributes || !isSelectedGoalAllowed) return;

    setCreateError(null);
    setIsCreating(true);
    try {
      const sessionId = await createSession({
        bikeType: effectiveBikeType,
        ridingStyle: effectiveRidingStyle as "recreational" | "fitness" | "sportive" | "racing" | "commuting" | "touring",
        primaryGoal: effectiveRidingGoal as PrimaryGoal,
        bikeId: selectedBike?._id,
      });
      if (campaignActive) {
        logMarketingEvent({
          eventType: "free_fit_started_during_campaign",
          locale,
          pagePath,
          section: "fit_start_page",
          ctaLabel: campaign.startFreeCta,
        });
      }
      toast.success({ description: messages.common.toasts.fitSessionStarted });
      router.push(withLocalePrefix(`/fit/${sessionId}/questionnaire`, locale));
    } catch (error) {
      setCreateError(
        reportClientError(error, {
          area: "fit",
          action: "createSession",
          operationType: "mutation",
          metadata: {
            bikeType: effectiveBikeType,
            ridingStyle: effectiveRidingStyle,
            primaryGoal: effectiveRidingGoal,
            hasBikeId: Boolean(selectedBike?._id),
          },
        })
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoadingProfile) {
    return <LoadingState label={messages.fit.loading} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card variant="bordered" className="dashboard-hero-surface overflow-hidden">
        <CardContent className="space-y-5 px-6 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              {campaignActive ? (
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                  {campaign.fitStartTitle}
                </p>
              ) : null}
              <h1 className="text-2xl font-semibold text-[color:var(--foreground)] sm:text-3xl">
                {messages.fit.title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
                {messages.fit.subtitle}
              </p>
              {campaignActive ? (
                <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {campaign.fitStartDescription}
                </p>
              ) : null}
            </div>
            {campaignActive ? (
              <div className="shrink-0">
                <CampaignCtaGroup
                  locale={locale}
                  pagePath={pagePath}
                  startHref={withLocalePrefix("/fit", locale)}
                  startSection="dashboard_fit_campaign_start"
                  donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
                  donateSection="dashboard_fit_campaign_donate"
                  startLabel={campaign.continueFreeCta}
                  buttonSize="sm"
                  className="w-full sm:w-auto"
                />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Profile warning */}
      {!isLoadingProfile && !hasProfile && (
        <InfoBox
          variant="warning"
          icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}
          className="mb-0"
        >
          <p className="font-medium">{messages.fit.profileWarning.title}</p>
          <p className="mt-1 text-[color:var(--muted-foreground)]">
            {messages.fit.profileWarning.description}
          </p>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              render={<Link href={withLocalePrefix("/profile", locale)} />}
            >
              {messages.fit.profileWarning.cta}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Button>
          </div>
        </InfoBox>
      )}

      {/* Rider profile warning */}
      {!isLoadingProfile && hasProfile && !hasRiderProfile && (
        <InfoBox
          variant="warning"
          icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}
          className="mb-0"
        >
          <p className="font-medium">{messages.fit.riderProfileWarning.title}</p>
          <p className="mt-1 text-[color:var(--muted-foreground)]">
            {messages.fit.riderProfileWarning.description}
          </p>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              render={<Link href={withLocalePrefix("/profile", locale)} />}
            >
              {messages.fit.riderProfileWarning.cta}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Button>
          </div>
        </InfoBox>
      )}

      {/* Bike selection */}
      <Card variant="bordered" className="dashboard-card-surface">
        <SectionHeader
          icon={<Bike className="h-5 w-5 text-[color:var(--primary)]" />}
          title={messages.fit.savedBikes.title}
        />
        <CardContent className="pt-5">
          {isLoadingBikes ? (
            <p className="text-sm text-muted-foreground">{messages.fit.savedBikes.loading}</p>
          ) : bikes && bikes.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {bikes.map((bike) => {
                const isSelected = selectedBikeId === bike._id;
                return (
                  <button
                    key={bike._id}
                    type="button"
                    onClick={() => {
                      setSelectedBikeId(bike._id);
                    }}
                    className={cn(
                      "relative w-full rounded-[var(--radius-xl)] border p-4 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                      isSelected
                        ? "border-[color:var(--primary)] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card)_90%)] text-[color:var(--foreground)] shadow-sm"
                        : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-secondary)]"
                    )}
                  >
                    {/* Selection indicator */}
                    <CheckCircle2
                      className={cn(
                        "absolute top-3 right-3 h-5 w-5 transition-opacity duration-150",
                        isSelected ? "opacity-100 text-[color:var(--primary)]" : "opacity-0"
                      )}
                    />

                    <SavedBikeImage source={bike.photoUrl} selected={isSelected} />

                    <div className="mt-3">
                      <div className="pr-6 font-medium">{bike.name}</div>
                      <div
                        className={cn(
                          "mt-1 text-sm",
                          isSelected ? "text-[color:var(--muted-foreground)]" : "text-muted-foreground"
                        )}
                      >
                        {getBikeTypeLabel(bike.bikeType, messages)}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Add new bike card */}
              <Link
                href={withLocalePrefix("/bikes/new", locale)}
                className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-dashed border-[color:var(--border)] bg-[color:var(--card)] p-4 text-center transition-colors hover:bg-[color:var(--surface-secondary)]"
              >
                <PlusCircle className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {messages.fit.savedBikes.addNewBike}
                </span>
              </Link>
            </div>
          ) : (
            /* No bikes yet */
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--surface-secondary)] px-6 py-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Bike className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{messages.fit.savedBikes.noBikes}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{messages.fit.savedBikes.noBikesHint}</p>
                </div>
                <Button
                  render={<Link href={withLocalePrefix("/bikes/new", locale)} />}
                  variant="outline"
                  size="sm"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {messages.fit.savedBikes.addFirstBike}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Missing attributes warning */}
      {selectedBike && bikeNeedsAttributes && (
        <InfoBox
          variant="warning"
          icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}
          className="mb-0"
        >
          <p className="font-medium">{messages.fit.savedBikes.missingBikeAttribute}</p>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              render={<Link href={withLocalePrefix(`/bikes/${selectedBike._id}/edit`, locale)} />}
            >
              {messages.fit.savedBikes.completeBikeSetup}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Button>
          </div>
        </InfoBox>
      )}

      {/* CTA */}
      <Button
        size="lg"
        className="w-full shadow-sm"
        disabled={!canStart}
        isLoading={isCreating}
        onClick={handleStartSession}
      >
        {messages.fit.continueCta}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {createError && (
        <InfoBox
          variant="danger"
          icon={<AlertCircle className="h-4 w-4 text-[color:var(--danger)]" />}
          className="mt-4"
        >
          <p className="font-medium">{messages.fit.errors.startFailedTitle}</p>
          <p className="mt-1 text-[color:var(--muted-foreground)]">{createError}</p>
        </InfoBox>
      )}

      {!canStart && selectedBikeId && !bikeNeedsAttributes && !hasProfile && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {messages.fit.profileRequirementHint}
        </p>
      )}
    </div>
  );
}
