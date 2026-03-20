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
  Selectable,
  useToast,
} from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import {
  getBikeTypeLabel,
  getBikeTypeOptions,
  isAeroCompatibleBikeType,
  type BikeType,
} from "@/lib/bikes";
import { reportClientError } from "@/lib/telemetry";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Bike, ArrowRight, AlertCircle } from "lucide-react";

type RidingStyle =
  | "recreational"
  | "fitness"
  | "sportive"
  | "racing"
  | "commuting"
  | "touring";
type PrimaryGoal = "comfort" | "balanced" | "performance" | "aerodynamics";

export default function NewFitSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();
  const pagePath = withLocalePrefix("/fit", locale);
  const logMarketingEvent = useMarketingEventLogger();
  const hasTrackedFitViewRef = useRef(false);
  const [bikeType, setBikeType] = useState<BikeType | "">("");
  const [selectedBikeId, setSelectedBikeId] = useState<Id<"bikes"> | null>(null);
  const [selectedBikeProfileId, setSelectedBikeProfileId] = useState<
    Id<"bikeProfiles"> | null
  >(null);
  const [ridingStyle, setRidingStyle] = useState<RidingStyle | "">("");
  const [ridingGoal, setRidingGoal] = useState<PrimaryGoal | "">("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const profile = useQuery(api.profiles.queries.getMyProfile);
  const bikes = useQuery(api.bikes.queries.listByUser);
  const bikeProfiles = useQuery(
    api.bikeProfiles.queries.listByBike,
    selectedBikeId ? { bikeId: selectedBikeId } : "skip"
  );
  const createSession = useMutation(api.sessions.mutations.create);
  const requestedBikeId = searchParams?.get("bikeId") ?? null;

  const hasProfile = profile !== undefined && profile !== null;
  const isLoadingProfile = profile === undefined;
  const isLoadingBikes = bikes === undefined;
  const isLoadingBikeProfiles = selectedBikeId !== null && bikeProfiles === undefined;
  const selectedBike = bikes?.find((bike) => bike._id === selectedBikeId) || null;
  const effectiveBikeType = selectedBike?.bikeType ?? bikeType;
  const effectiveRidingStyle = selectedBike?.ridingStyle ?? ridingStyle;
  const effectiveRidingGoal = selectedBike?.primaryGoal ?? ridingGoal;
  const bikeNeedsAttributes =
    Boolean(selectedBike) &&
    (!selectedBike?.ridingStyle || !selectedBike?.primaryGoal);
  const isSelectedGoalAllowed =
    effectiveRidingGoal !== "aerodynamics" ||
    isAeroCompatibleBikeType(effectiveBikeType);

  const canStart =
    effectiveBikeType &&
    effectiveRidingStyle &&
    effectiveRidingGoal &&
    !bikeNeedsAttributes &&
    isSelectedGoalAllowed &&
    hasProfile &&
    !isCreating;
  const ridingStyles = [
    {
      value: "recreational" as const,
      label: messages.fit.ridingStyles.recreational.label,
      description: messages.fit.ridingStyles.recreational.description,
    },
    {
      value: "fitness" as const,
      label: messages.fit.ridingStyles.fitness.label,
      description: messages.fit.ridingStyles.fitness.description,
    },
    {
      value: "sportive" as const,
      label: messages.fit.ridingStyles.sportive.label,
      description: messages.fit.ridingStyles.sportive.description,
    },
    {
      value: "racing" as const,
      label: messages.fit.ridingStyles.racing.label,
      description: messages.fit.ridingStyles.racing.description,
    },
    {
      value: "commuting" as const,
      label: messages.fit.ridingStyles.commuting.label,
      description: messages.fit.ridingStyles.commuting.description,
    },
    {
      value: "touring" as const,
      label: messages.fit.ridingStyles.touring.label,
      description: messages.fit.ridingStyles.touring.description,
    },
  ];
  const ridingGoals = [
    {
      value: "comfort" as const,
      label: messages.fit.goals.comfort.label,
      description: messages.fit.goals.comfort.description,
    },
    {
      value: "balanced" as const,
      label: messages.fit.goals.balanced.label,
      description: messages.fit.goals.balanced.description,
    },
    {
      value: "performance" as const,
      label: messages.fit.goals.performance.label,
      description: messages.fit.goals.performance.description,
    },
    {
      value: "aerodynamics" as const,
      label: messages.fit.goals.aerodynamics.label,
      description: messages.fit.goals.aerodynamics.description,
    },
  ];

  useEffect(() => {
    if (hasTrackedFitViewRef.current) {
      return;
    }
    hasTrackedFitViewRef.current = true;
    logMarketingEvent({
      eventType: "funnel_fit_view",
      locale,
      pagePath,
      section: "fit_start_page",
    });
  }, [locale, logMarketingEvent, pagePath]);

  useEffect(() => {
    if (!requestedBikeId || !bikes || selectedBikeId) {
      return;
    }

    const requestedBike = bikes.find((bike) => bike._id === requestedBikeId);
    if (!requestedBike) {
      return;
    }

    setSelectedBikeId(requestedBike._id);
    setSelectedBikeProfileId(null);
    setBikeType(requestedBike.bikeType);
  }, [bikes, requestedBikeId, selectedBikeId]);

  useEffect(() => {
    if (!selectedBikeId || bikeProfiles === undefined) {
      return;
    }

    if (!bikeProfiles || bikeProfiles.length === 0) {
      setSelectedBikeProfileId(null);
      return;
    }

    const hasCurrentSelection = bikeProfiles.some(
      (bikeProfile) => bikeProfile._id === selectedBikeProfileId
    );
    if (hasCurrentSelection) {
      return;
    }

    const defaultProfile =
      bikeProfiles.find((bikeProfile) => bikeProfile.isDefault) ?? bikeProfiles[0];
    setSelectedBikeProfileId(defaultProfile?._id ?? null);
  }, [bikeProfiles, selectedBikeId, selectedBikeProfileId]);

  const profileTypeLabel = (profileType: string) => {
    return (
      (messages.bikeProfileTypes as Record<string, string>)[profileType] ??
      profileType
    );
  };

  const handleSelectBike = (bikeId: Id<"bikes">, selectedType: BikeType) => {
    setSelectedBikeId(bikeId);
    setSelectedBikeProfileId(null);
    setBikeType(selectedType);
  };

  const handleUseCustomBikeType = () => {
    setSelectedBikeId(null);
    setSelectedBikeProfileId(null);
  };

  const handleStartSession = async () => {
    if (
      !effectiveBikeType ||
      !effectiveRidingStyle ||
      !effectiveRidingGoal ||
      bikeNeedsAttributes ||
      !isSelectedGoalAllowed
    ) {
      return;
    }

    setCreateError(null);
    setIsCreating(true);
    try {
      const sessionId = await createSession({
        bikeType: effectiveBikeType,
        ridingStyle: effectiveRidingStyle,
        primaryGoal: effectiveRidingGoal,
        bikeId: selectedBike?._id,
        bikeProfileId: selectedBikeProfileId ?? undefined,
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{messages.fit.title}</h1>
        <p className="text-gray-600 mt-2">
          {messages.fit.subtitle}
        </p>
      </div>

      {!isLoadingProfile && !hasProfile && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                {messages.fit.profileWarning.title}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {messages.fit.profileWarning.description}
              </p>
              <Link href={withLocalePrefix("/profile", locale)}>
                <Button variant="outline" size="sm" className="mt-3">
                  {messages.fit.profileWarning.cta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {isLoadingBikes && (
        <div className="mb-6 rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-sm text-[color:var(--muted-foreground)]">
          {messages.fit.savedBikes.loading}
        </div>
      )}

      {bikes && bikes.length > 0 && (
        <Card variant="bordered" className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{messages.fit.savedBikes.title}</CardTitle>
              {selectedBikeId && (
                <Button variant="outline" size="sm" onClick={handleUseCustomBikeType}>
                  {messages.fit.savedBikes.useCustomType}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {bikes.map((bike) => (
                <Selectable
                  key={bike._id}
                  onClick={() => handleSelectBike(bike._id, bike.bikeType)}
                  selected={selectedBikeId === bike._id}
                  variant="card"
                  label={bike.name}
                  description={getBikeTypeLabel(bike.bikeType, messages)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-blue-600" />
            <CardTitle>{messages.fit.sections.bikeType}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {selectedBike ? (
            <div className="rounded-lg border border-[color:var(--primary)] bg-[color:color-mix(in_oklch,var(--card)_86%,var(--primary)_14%)] p-4 text-sm text-[color:var(--foreground)]">
              {messages.fit.savedBikes.usingBike}{" "}
              <span className="font-semibold">{selectedBike.name}</span> (
              {getBikeTypeLabel(selectedBike.bikeType, messages)}).
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {getBikeTypeOptions(messages).map((type) => (
                <Selectable
                  key={type.value}
                  onClick={() => setBikeType(type.value)}
                  selected={bikeType === type.value}
                  variant="card"
                  label={type.label}
                  description={type.description}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBike ? (
        <Card variant="bordered" className="mb-6">
          <CardHeader>
            <CardTitle>{messages.fit.savedBikes.profilesTitle}</CardTitle>
            <p className="text-sm text-gray-500">
              {messages.fit.savedBikes.profilesHint}
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingBikeProfiles ? (
              <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-sm text-[color:var(--muted-foreground)]">
                {messages.fit.savedBikes.profilesLoading}
              </div>
            ) : bikeProfiles && bikeProfiles.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {bikeProfiles.map((bikeProfile) => (
                  <Selectable
                    key={bikeProfile._id}
                    onClick={() => setSelectedBikeProfileId(bikeProfile._id)}
                    selected={selectedBikeProfileId === bikeProfile._id}
                    variant="card"
                    label={bikeProfile.name}
                    description={profileTypeLabel(bikeProfile.profileType)}
                    badge={
                      bikeProfile.isDefault ? (
                        <span className="rounded-full bg-[color:var(--secondary)] px-2 py-1 text-xs font-semibold text-[color:var(--secondary-foreground)]">
                          {messages.fit.savedBikes.defaultBadge}
                        </span>
                      ) : null
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-sm text-[color:var(--muted-foreground)]">
                {messages.fit.savedBikes.noProfiles}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <CardTitle>{messages.fit.sections.ridingStyle}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedBike ? (
            <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-sm text-[color:var(--foreground)]">
              {selectedBike.ridingStyle ? (
                <>
                  {messages.fit.savedBikes.usingBikeAttribute}{" "}
                  <span className="font-semibold">
                    {messages.fit.ridingStyles[selectedBike.ridingStyle].label}
                  </span>
                  .
                </>
              ) : (
                <>
                  {messages.fit.savedBikes.missingBikeAttribute}{" "}
                  <Link
                    href={withLocalePrefix(`/bikes/${selectedBike._id}/edit`, locale)}
                    className="font-semibold text-blue-700 hover:text-blue-800"
                  >
                    {messages.fit.savedBikes.completeBikeSetup}
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ridingStyles.map((style) => (
                <Selectable
                  key={style.value}
                  onClick={() => setRidingStyle(style.value)}
                  selected={ridingStyle === style.value}
                  variant="card"
                  label={style.label}
                  description={style.description}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <CardTitle>{messages.fit.sections.primaryGoal}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedBike ? (
            <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-sm text-[color:var(--foreground)]">
              {selectedBike.primaryGoal ? (
                <>
                  {messages.fit.savedBikes.usingBikeAttribute}{" "}
                  <span className="font-semibold">
                    {messages.fit.goals[selectedBike.primaryGoal].label}
                  </span>
                  .
                </>
              ) : (
                <>
                  {messages.fit.savedBikes.missingBikeAttribute}{" "}
                  <Link
                    href={withLocalePrefix(`/bikes/${selectedBike._id}/edit`, locale)}
                    className="font-semibold text-blue-700 hover:text-blue-800"
                  >
                    {messages.fit.savedBikes.completeBikeSetup}
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {ridingGoals
                .filter(
                  (goal) =>
                    goal.value !== "aerodynamics" ||
                    isAeroCompatibleBikeType(effectiveBikeType)
                )
                .map((goal) => (
                <Selectable
                  key={goal.value}
                  onClick={() => setRidingGoal(goal.value)}
                  selected={ridingGoal === goal.value}
                  variant="card"
                  label={goal.label}
                  description={goal.description}
                />
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!canStart}
          isLoading={isCreating}
          onClick={handleStartSession}
        >
          {messages.fit.continueCta}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {createError ? (
        <ErrorState
          className="mt-2"
          title={messages.fit.errors.startFailedTitle}
          description={createError}
        />
      ) : null}

      {!canStart && effectiveBikeType && effectiveRidingStyle && effectiveRidingGoal && !hasProfile && (
        <p className="text-sm text-gray-500 text-right mt-2">
          {messages.fit.profileRequirementHint}
        </p>
      )}
    </div>
  );
}
