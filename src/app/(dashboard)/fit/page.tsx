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
  CardHeader,
  CardTitle,
  CardContent,
  LoadingState,
  ErrorState,
  useToast,
} from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
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
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{messages.fit.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{messages.fit.subtitle}</p>
      </div>

      {/* Profile warning */}
      {!isLoadingProfile && !hasProfile && (
        <div className="mb-6 rounded-lg border border-warning/20 bg-warning/15 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-foreground">
                {messages.fit.profileWarning.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {messages.fit.profileWarning.description}
              </p>
              <Button
                render={<Link href={withLocalePrefix("/profile", locale)} />}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                {messages.fit.profileWarning.cta}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rider profile warning */}
      {!isLoadingProfile && hasProfile && !hasRiderProfile && (
        <div className="mb-6 rounded-lg border border-warning/20 bg-warning/15 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-foreground">
                {messages.fit.riderProfileWarning.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {messages.fit.riderProfileWarning.description}
              </p>
              <Button
                render={<Link href={withLocalePrefix("/profile", locale)} />}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                {messages.fit.riderProfileWarning.cta}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bike selection */}
      <Card variant="bordered" className="dashboard-card-surface mb-6">
        <CardHeader>
          <CardTitle>{messages.fit.savedBikes.title}</CardTitle>
        </CardHeader>
        <CardContent>
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
                      "relative w-full rounded-[var(--radius-lg)] border-2 p-4 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-accent"
                    )}
                  >
                    {/* Selection indicator */}
                    <CheckCircle2
                      className={cn(
                        "absolute top-3 right-3 h-5 w-5 transition-opacity duration-150",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />

                    <SavedBikeImage source={bike.photoUrl} selected={isSelected} />

                    <div className="mt-3">
                      <div className="pr-6 font-medium">{bike.name}</div>
                      <div className={cn("mt-1 text-sm", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                        {getBikeTypeLabel(bike.bikeType, messages)}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Add new bike card */}
              <Link
                href={withLocalePrefix("/bikes/new", locale)}
                className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-border bg-card p-4 text-center transition-colors hover:bg-accent"
              >
                <PlusCircle className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {messages.fit.savedBikes.addNewBike}
                </span>
              </Link>
            </div>
          ) : (
            /* No bikes yet */
            <div className="flex flex-col items-center gap-4 py-8 text-center">
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
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {messages.fit.savedBikes.addFirstBike}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Missing attributes warning */}
      {selectedBike && bikeNeedsAttributes && (
        <div className="mb-6 rounded-lg border border-warning/20 bg-warning/15 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-foreground">
                {messages.fit.savedBikes.missingBikeAttribute}
              </p>
              <Button
                render={
                  <Link href={withLocalePrefix(`/bikes/${selectedBike._id}/edit`, locale)} />
                }
                variant="outline"
                size="sm"
                className="mt-3"
              >
                {messages.fit.savedBikes.completeBikeSetup}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <Button
        size="lg"
        className="w-full"
        disabled={!canStart}
        isLoading={isCreating}
        onClick={handleStartSession}
      >
        {messages.fit.continueCta}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {createError && (
        <ErrorState
          className="mt-4"
          title={messages.fit.errors.startFailedTitle}
          description={createError}
        />
      )}

      {!canStart && selectedBikeId && !bikeNeedsAttributes && !hasProfile && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {messages.fit.profileRequirementHint}
        </p>
      )}
    </div>
  );
}
