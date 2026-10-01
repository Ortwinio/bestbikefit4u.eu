"use client";
import { localizeAccountError } from "@/i18n/account/clientErrors";
import { fitAuditCopy } from "@/i18n/account/fitAudit";
import { accountBikeFitCopy } from "@/i18n/account/bikeFitCalculator";
import { bikeFitMessages } from "@/i18n/calculators/bikeFit";
import { validCalculatorState } from "@/lib/calculators/accountState";
import { calculatorMatchesBike, calculatorPrimaryGoal } from "../../../../convex/sessions/calculatorInputs";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  Button,
  LoadingState,
  useToast,
  InfoBox,
  OptionCard,
  StepCard,
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
import { getFitStartCopy } from "@/i18n/account/fitStart";
import { ArrowLeft, ArrowRight, AlertCircle, PlusCircle, Bike } from "lucide-react";
import { buildBikeRoleBias } from "../../../../convex/recommendations/bikeRoleBias";

type PrimaryGoal = "comfort" | "balanced" | "performance" | "aerodynamics";

function SavedBikeImage({ source, selected }: { source?: string; selected?: boolean }) {
  const imageUrl = useResolvedImageUrl(source);

  return (
    <span className={cn(
      "flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl",
      selected ? "bg-secondary" : "bg-muted"
    )}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl ?? "/default-bike.svg"}
        alt=""
        className="h-full w-full object-contain p-2"
      />
    </span>
  );
}

export default function NewFitSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, messages } = useDashboardMessages();
  const copy = getFitStartCopy(locale);
  const calculatorCopy = accountBikeFitCopy[locale];
  const calculatorLabels = bikeFitMessages[locale];
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
  const requestedCalculator = searchParams?.get("calculator") === "bike-fit";
  const calculatorState = useQuery(api.calculatorStates.queries.get,
    requestedCalculator ? { calculator: "bike-fit" } : "skip");
  const calculatorValues = calculatorState?.state.calculator === "bike-fit"
    && validCalculatorState(calculatorState.state) && calculatorState.state.values.source !== "missing"
    ? calculatorState.state.values : null;

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
  const effectiveRidingGoal = calculatorValues ? calculatorPrimaryGoal(calculatorValues)
    : selectedBike?.primaryGoal ?? selectedBikeRoleBias?.suggestedPrimaryGoal ?? "";
  const calculatorMatches = !calculatorValues || !selectedBike
    || calculatorMatchesBike(calculatorValues, selectedBike.bikeType);
  const calculatorReady = !requestedCalculator || Boolean(calculatorValues && calculatorMatches);
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
      calculatorReady &&
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
    if (!canStart || !effectiveBikeType || !effectiveRidingStyle || !effectiveRidingGoal) return;

    setCreateError(null);
    setIsCreating(true);
    try {
      const sessionId = await createSession({
        bikeType: effectiveBikeType,
        ridingStyle: effectiveRidingStyle as "recreational" | "fitness" | "sportive" | "racing" | "commuting" | "touring",
        primaryGoal: effectiveRidingGoal as PrimaryGoal,
        bikeId: selectedBike?._id,
        ...(requestedCalculator && calculatorState ? { calculatorStateId: calculatorState._id } : {}),
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
        localizeAccountError(reportClientError(error, {
          area: "fit",
          action: "createSession",
          userMessage: fitAuditCopy[locale].error,
          operationType: "mutation",
          metadata: {
            bikeType: effectiveBikeType,
            ridingStyle: effectiveRidingStyle,
            primaryGoal: effectiveRidingGoal,
            hasBikeId: Boolean(selectedBike?._id),
          },
        }), locale)
      );
    } finally {
      setIsCreating(false);
    }
  };

  const nextHint = isCreating
    ? copy.creating
    : requestedCalculator && !calculatorValues
      ? calculatorState === undefined ? messages.fit.loading : calculatorCopy.missing
    : !calculatorMatches
      ? calculatorCopy.mismatch
    : !hasProfile || !hasRiderProfile
      ? copy.profileHint
      : bikeNeedsAttributes || !isSelectedGoalAllowed
        ? copy.bikeHint
        : selectedBike
          ? copy.nextHint
          : copy.chooseHint;

  return (
    <div className="min-w-0 space-y-6">
      <Button variant="link" className="px-0" nativeButton={false} role="link" render={<Link href={withLocalePrefix("/dashboard", locale)} />}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        {copy.back}
      </Button>

      <header className="space-y-3 rounded-[28px] bg-[var(--bbf-lime)] p-6 text-[var(--bbf-inkt)] sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">{copy.eyebrow}</p>
        <h1 className="text-[var(--bbf-inkt)] font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{copy.title}</h1>
        <p className="max-w-2xl text-base leading-relaxed sm:text-lg">{copy.description}</p>
        {campaignActive ? (
          <div className="space-y-3 pt-2">
            <p className="font-semibold">{campaign.fitStartTitle}</p>
            <p className="max-w-2xl">{campaign.fitStartDescription}</p>
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
      </header>
      {requestedCalculator && <section className="space-y-4 rounded-3xl border border-border bg-card p-6"
        aria-labelledby="calculator-inputs-title">
        <h2 id="calculator-inputs-title" className="font-display text-2xl font-bold">{calculatorCopy.sessionTitle}</h2>
        {calculatorValues ? <>
          <p className="text-sm text-muted-foreground">{calculatorCopy.sessionHint}</p>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [calculatorLabels.height, `${calculatorValues.heightCm.toLocaleString(locale)} cm`],
              [calculatorLabels.inseam, `${calculatorValues.inseamCm.toLocaleString(locale)} cm`],
              [calculatorLabels.flexibility, `${calculatorValues.flexibility}/5`],
              [calculatorLabels.core, `${calculatorValues.core}/5`],
              [calculatorLabels.category, calculatorLabels.categories[calculatorValues.category]],
              [calculatorLabels.goal, calculatorLabels.goals[calculatorValues.ambition]],
            ].map(([label, value]) => <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-1 font-mono">{value}</dd>
            </div>)}
          </dl>
          {calculatorValues.ambition === "aero" && ["mtb", "city"].includes(calculatorValues.category)
            && <p className="text-sm text-muted-foreground">{calculatorLabels.aeroAdjusted}</p>}
          {!calculatorMatches && <p role="status" className="text-sm text-warning-text">{calculatorCopy.mismatch}</p>}
        </> : <p role="status">{calculatorState === undefined ? messages.fit.loading : calculatorCopy.missing}</p>}
        <Link className="inline-flex min-h-11 items-center text-primary underline focus-visible:focus-ring"
          href={withLocalePrefix("/tools/bike-fit", locale)}>{calculatorCopy.back}</Link>
      </section>}

      {isLoadingProfile ? <LoadingState label={messages.fit.loading} /> : (
        <>
          {(!hasProfile || !hasRiderProfile) && (
            <section role="status" className="flex flex-col gap-4 rounded-3xl bg-[var(--bbf-warning)] p-5 text-[var(--bbf-inkt)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-inherit">
                  {hasProfile ? messages.fit.riderProfileWarning.title : messages.fit.profileWarning.title}
                </h2>
                <p className="mt-2 leading-relaxed">
                  {hasProfile ? messages.fit.riderProfileWarning.description : messages.fit.profileWarning.description}
                </p>
              </div>
              <Button className="shrink-0" nativeButton={false} role="link" render={<Link href={withLocalePrefix("/profile", locale)} />}>
                {hasProfile ? messages.fit.riderProfileWarning.cta : messages.fit.profileWarning.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </section>
          )}

          <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <StepCard number={1} title={copy.chooseBike} className="min-w-0">
              {isLoadingBikes ? (
                <p role="status" className="py-8 text-muted-foreground">{messages.fit.savedBikes.loading}</p>
              ) : bikes && bikes.length > 0 ? (
                <div className="space-y-3">
                  {bikes.map((bike) => (
                    <OptionCard
                      key={bike._id}
                      selected={selectedBikeId === bike._id}
                      onClick={() => setSelectedBikeId(bike._id)}
                      aria-label={bike.name}
                      className={cn(
                        "min-h-32 rounded-[20px] [&_[data-slot=selectable-content]]:items-center",
                        selectedBikeId === bike._id && "border-primary bg-secondary text-foreground [&_svg]:text-primary"
                      )}
                    >
                      <span className="flex min-w-0 flex-wrap items-center gap-3 sm:flex-nowrap">
                        <SavedBikeImage source={bike.photoUrl} selected={selectedBikeId === bike._id} />
                        <span className="min-w-0">
                          <span className="block break-words font-display text-xl font-bold">{bike.name}</span>
                          <span className="mt-1 block text-sm text-muted-foreground">{getBikeTypeLabel(bike.bikeType, messages)}</span>
                        </span>
                      </span>
                    </OptionCard>
                  ))}
                  <Button variant="outline" className="w-full border-dashed" nativeButton={false} role="link" render={<Link href={withLocalePrefix("/bikes/new", locale)} />}>
                    <PlusCircle className="size-5" aria-hidden="true" />
                    {messages.fit.savedBikes.addNewBike}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 rounded-2xl bg-background px-4 py-8 text-center">
                  <Bike className="mx-auto size-10 text-primary" aria-hidden="true" />
                  <h3 className="font-display text-2xl font-bold">{messages.fit.savedBikes.noBikes}</h3>
                  <p className="text-muted-foreground">{messages.fit.savedBikes.noBikesHint}</p>
                  <Button className="h-auto whitespace-normal" nativeButton={false} role="link" render={<Link href={withLocalePrefix("/bikes/new", locale)} />}>
                    {messages.fit.savedBikes.addFirstBike}
                  </Button>
                </div>
              )}
            </StepCard>

            <section aria-labelledby="fit-start-context" className="min-w-0 rounded-3xl bg-[var(--bbf-inkt)] p-6 text-white sm:p-7">
              <p className="mb-2 text-sm text-[var(--bbf-op-donker)]">{copy.sessionEyebrow}</p>
              <h2 id="fit-start-context" className="break-words font-display text-3xl font-bold leading-tight text-white">{selectedBike?.name ?? copy.selectionTitle}</h2>
              {selectedBike ? (
                <>
                  <dl className="my-6 space-y-4">
                    {[
                      [copy.bikeType, getBikeTypeLabel(selectedBike.bikeType, messages)],
                      [copy.ridingStyle, messages.sessions.ridingStyle[effectiveRidingStyle as keyof typeof messages.sessions.ridingStyle] ?? copy.missingValue],
                      [copy.goal, messages.fit.goals[effectiveRidingGoal as PrimaryGoal]?.label ?? copy.missingValue],
                    ].map(([label, value]) => (
                      <div key={label} className="border-b border-white/20 pb-4 last:border-0 last:pb-0">
                        <dt className="text-sm text-[var(--bbf-op-donker)]">{label}</dt>
                        <dd className="mt-1 text-xl font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-sm leading-relaxed text-[var(--bbf-op-donker)]">{copy.contextHint}</p>
                </>
              ) : <p className="mt-5 leading-relaxed text-[var(--bbf-op-donker)]">{copy.selectionHint}</p>}
            </section>
          </div>

          {selectedBike && (bikeNeedsAttributes || !isSelectedGoalAllowed) && (
            <section role="status" className="flex flex-col gap-4 rounded-3xl bg-[var(--bbf-warning)] p-5 text-[var(--bbf-inkt)] sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold">{bikeNeedsAttributes ? messages.fit.savedBikes.missingBikeAttribute : copy.aeroWarning}</p>
              <Button className="shrink-0" nativeButton={false} role="link" render={<Link href={withLocalePrefix(`/bikes/${selectedBike._id}/edit`, locale)} />}>
                {messages.fit.savedBikes.completeBikeSetup}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </section>
          )}

          {createError && (
            <div role="alert">
              <InfoBox variant="danger" className="rounded-3xl bg-[var(--bbf-destructive)] text-[var(--bbf-inkt)]" icon={<AlertCircle className="size-5" aria-hidden="true" />}>
                <h2 className="font-display text-2xl font-bold text-inherit">{messages.fit.errors.startFailedTitle}</h2>
                <p className="mt-2">{createError}</p>
              </InfoBox>
            </div>
          )}

          <div className="flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-inherit">{copy.nextTitle}</h2>
              <p id="fit-start-next-hint" className="mt-2 text-sm text-muted-foreground" role="status">{nextHint}</p>
            </div>
            <Button size="lg" className="h-auto whitespace-normal sm:shrink-0" disabled={!canStart} isLoading={isCreating} aria-describedby="fit-start-next-hint" onClick={handleStartSession}>
              {isCreating ? copy.creating : copy.continue}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
          {!canStart && selectedBikeId && !bikeNeedsAttributes && !hasProfile && (
            <p className="text-sm text-muted-foreground">{messages.fit.profileRequirementHint}</p>
          )}
          <Button variant="link" className="px-0" nativeButton={false} role="link" render={<Link href={withLocalePrefix("/fit/how-it-works", locale)} />}>
            {copy.method}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </>
      )}
    </div>
  );
}
