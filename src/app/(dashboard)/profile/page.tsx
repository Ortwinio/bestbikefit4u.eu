"use client";

import { profileText } from "@/i18n/account/profileLanguage";
import { hasFitMeasurements } from "../../../../shared/profileFitReadiness";
import { isPaidAccessEnforced } from "../../../../shared/pricing/flags";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { MeasurementWizard, type WizardFormData } from "@/components/measurements";
import {
  AccessibleDialog,
  Button,
  Card,
  ErrorState,
  LoadingState,
  useToast,
} from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { ProfileAutosaveEditor } from "@/components/profile/ProfileAutosaveEditor";
import { ProfileProvenance } from "@/components/profile/ProfileProvenance";
import { ProfileSectionTabs } from "@/components/profile/ProfileSectionTabs";
import { getProfileProvenanceCopy } from "@/i18n/account/profileProvenance";
import { localizeAccountError } from "@/i18n/account/clientErrors";
import { reportClientError } from "@/lib/telemetry";
import { toPercentBucket } from "@/lib/uiPercent";
import {
  deriveComfortScore,
  comfortScoreToFields,
  flexibilityTests,
} from "@/lib/validations/profile";
import {
  getEffectiveDisplayName,
  getEffectiveProfileImageSource,
} from "@/lib/userIdentity";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type FlexibilityScore = (typeof flexibilityTests)[number]["score"];

interface ProfileData {
  heightCm?: number;
  inseamCm?: number;
  weightKg?: number;
  torsoLengthCm?: number;
  armLengthCm?: number;
  femurLengthCm?: number;
  shoulderWidthCm?: number;
  flexibilityScore?: FlexibilityScore;
  coreStabilityScore?: number;
  hasPain?: string;
  painSeverity?: number;
  painAreas?: string[];
  experienceLevel?: string;
  weeklyHours?: string;
  typicalRideLength?: string;
  positionPriority?: string;
}

function linkButtonProps(href: string) {
  return {
    render: <Link href={href} />,
    nativeButton: false as const,
  };
}

function getDefaultValues(profile: ProfileData): Partial<WizardFormData> {
  return {
    heightCm: profile.heightCm,
    inseamCm: profile.inseamCm,
    weightKg: profile.weightKg,
    torsoLengthCm: profile.torsoLengthCm,
    armLengthCm: profile.armLengthCm,
    femurLengthCm: profile.femurLengthCm,
    shoulderWidthCm: profile.shoulderWidthCm,
    flexibilityScore: profile.flexibilityScore,
    coreStabilityScore: profile.coreStabilityScore,
    comfortScore: profile.hasPain === undefined ? undefined : deriveComfortScore(profile.hasPain, profile.painSeverity),
    painAreas: profile.painAreas ?? [],
    experienceLevel: profile.experienceLevel as WizardFormData["experienceLevel"],
    weeklyHours: profile.weeklyHours as WizardFormData["weeklyHours"],
    typicalRideLength: profile.typicalRideLength as WizardFormData["typicalRideLength"],
    positionPriority: profile.positionPriority as WizardFormData["positionPriority"],
  };
}


function BMISlider({
  heightCm,
  weightKg,
  messages,
}: {
  heightCm: number | null;
  weightKg: number | null;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
}) {
  const t = messages.profile.bmi;

  if (!heightCm || !weightKg) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-muted)]/30 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted-foreground)]">{t.label}</p>
        <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">{t.noWeight}</p>
      </div>
    );
  }

  const bmi = weightKg / ((heightCm / 100) ** 2);
  const bmiRounded = Math.round(bmi * 10) / 10;

  const MIN_BMI = 15;
  const MAX_BMI = 40;
  const percent = Math.max(0, Math.min(100, ((bmi - MIN_BMI) / (MAX_BMI - MIN_BMI)) * 100));
  const percentBucket = toPercentBucket(percent);

  let category: string;
  let categoryColor: string;
  let categoryBg: string;
  if (bmi < 18.5) {
    category = t.underweight;
    categoryColor = "text-foreground";
    categoryBg = "bg-[color:var(--color-warning)]/15";
  } else if (bmi < 25) {
    category = t.normal;
    categoryColor = "text-foreground";
    categoryBg = "bg-[color:var(--color-success)]/15";
  } else if (bmi < 30) {
    category = t.overweight;
    categoryColor = "text-foreground";
    categoryBg = "bg-[color:var(--color-warning)]/15";
  } else {
    category = t.obese;
    categoryColor = "text-foreground";
    categoryBg = "bg-[color:var(--color-danger)]/15";
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-muted)]/30 px-4 py-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-muted-foreground)]">{t.label}</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xl font-medium text-[color:var(--color-foreground)]">{bmiRounded}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryBg} ${categoryColor}`}>
            {category}
          </span>
        </div>
      </div>
      <div className="relative h-3 rounded-full bg-[var(--bbf-rand)]">
        {/* Marker */}
        <div
          className="csp-fill-left absolute top-1/2 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--color-foreground)] ring-2 ring-[color:var(--color-background)] shadow-md"
          data-left-pct={percentBucket}
        />
      </div>
      {/* Scale labels */}
      <div className="mt-1.5 flex justify-between font-mono text-xs text-[color:var(--color-muted-foreground)]">
        <span>15</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>40</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { locale, messages } = useDashboardMessages();
  const searchParams = useSearchParams();
  const pagePath = withLocalePrefix("/profile", locale);
  const logMarketingEvent = useMarketingEventLogger();
  const hasTrackedProfileViewRef = useRef(false);
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [showDirectEditor, setShowDirectEditor] = useState(() => Boolean(searchParams?.get("edit")));
  const provenanceCopy = getProfileProvenanceCopy(locale);
  const access = useQuery(api.pricing.queries.getAccess, isPaidAccessEnforced() ? {} : "skip");
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [pendingRefreshWeight, setPendingRefreshWeight] = useState<number | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const profileData = useQuery(api.profiles.queries.getMyProfile);
  const profileProvenance = useQuery(api.profiles.queries.getMyProvenance, {});
  const recalculableBikeCount = useQuery(
    api.pressureCalculations.queries.getRecalculableBikeCount
  );
  const user = useQuery(api.users.queries.getCurrentUser);

  const upsertProfile = useMutation(api.profiles.mutations.upsert);
  const recalculatePressureForAllBikes = useMutation(
    api.pressureCalculations.mutations.recalculatePressureForAllBikes
  );

  useEffect(() => {
    if (hasTrackedProfileViewRef.current || profileData === undefined) {
      return;
    }
    hasTrackedProfileViewRef.current = true;
    logMarketingEvent({
      eventType: "funnel_profile_view",
      locale,
      pagePath,
      section: "profile_page",
    });
  }, [locale, logMarketingEvent, pagePath, profileData]);


  const openRefreshDialog = (nextWeightKg?: number) => {
    setPendingRefreshWeight(nextWeightKg ?? null);
    setShowRefreshDialog(true);
  };

  const finishProfileSave = () => {
    setShowRefreshDialog(false);
    setPendingRefreshWeight(null);
    setIsEditing(false);
    toast.success({ description: messages.common.toasts.profileSaved });
  };

  const handleSaveProfile = async (data: WizardFormData) => {
    setSaveError(null);
    try {
      const previousWeight = profileData?.weightKg;

      const comfortFields = data.comfortScore != null
        ? comfortScoreToFields(data.comfortScore, data.painAreas ?? [])
        : {};

      await upsertProfile({
        measurementKinds: data.measurementKinds,
        heightCm: data.heightCm,
        inseamCm: data.inseamCm,
        weightKg: data.weightKg,
        torsoLengthCm: data.torsoLengthCm,
        armLengthCm: data.armLengthCm,
        femurLengthCm: data.femurLengthCm,
        shoulderWidthCm: data.shoulderWidthCm,
        flexibilityScore: data.flexibilityScore,
        coreStabilityScore: data.coreStabilityScore,
        ...comfortFields,
        experienceLevel: data.experienceLevel,
        weeklyHours: data.weeklyHours,
        typicalRideLength: data.typicalRideLength,
        positionPriority: data.positionPriority,
      });

      setIsEditing(false);
      if (previousWeight !== data.weightKg) {
        openRefreshDialog(data.weightKg);
      } else {
        toast.success({ description: messages.common.toasts.profileSaved });
      }
    } catch (error) {
      setSaveError(
        localizeAccountError(reportClientError(error, {
          area: "profile",
          action: "upsertProfile",
          operationType: "mutation",
          userMessage: profileText(locale, "Something went wrong. Please try again."),
        }), locale)
      );
    }
  };

  const handleRecalculate = async () => {
    if (pendingRefreshWeight === null) {
      return;
    }

    setIsRecalculating(true);
    try {
      const result = await recalculatePressureForAllBikes({
        newWeightKg: pendingRefreshWeight,
        autoNoteSource: `weight_change_${pendingRefreshWeight}kg`,
      });
      setShowRefreshDialog(false);
      setPendingRefreshWeight(null);
      setIsEditing(false);
      toast.success({
        description: messages.profile.recalculate.successToast.replace(
          "{count}",
          String(result.recalculatedCount)
        ),
      });
    } catch (error) {
      toast.error({
        description: localizeAccountError(reportClientError(error, {
          area: "profile",
          action: "recalculatePressure",
          operationType: "mutation",
          userMessage: profileText(locale, "Something went wrong. Please try again."),
        }), locale),
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  const displayName = useMemo(
    () => getEffectiveDisplayName(user, messages.userMenu.fallbackUserName),
    [messages.userMenu.fallbackUserName, user]
  );
  const profileImageSource = useMemo(
    () => getEffectiveProfileImageSource(user),
    [user]
  );

  if (profileData === undefined || (profileData !== null && profileProvenance === undefined)) {
    return <LoadingState label={messages.profile.loading} />;
  }

  if (!profileData || isEditing) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight text-[color:var(--color-foreground)] sm:text-5xl">
            {profileData
              ? messages.profile.edit.title
              : messages.profile.onboarding.title}
          </h1>
          <p className="mt-2 text-[color:var(--color-muted-foreground)]">
            {profileData
              ? messages.profile.edit.description
              : messages.profile.onboarding.description}
          </p>
        </div>
        {saveError ? (
          <ErrorState
            className="mb-6"
            title={messages.profile.errors.saveFailedTitle}
            description={saveError}
          />
        ) : null}
        <MeasurementWizard
          refinementsLocked={isPaidAccessEnforced() && !access?.fullProfile}
          onComplete={handleSaveProfile}
          defaultValues={profileData ? { ...getDefaultValues(profileData), measurementKinds:
            Object.fromEntries(["heightCm", "inseamCm", "weightKg", "torsoLengthCm", "armLengthCm",
              "femurLengthCm", "shoulderWidthCm"].map(field => [field,
                profileProvenance?.observations.find(entry => entry.field === field)?.kind === "measured"
                  ? "measured" : "estimated"])) } : undefined}
        />
        {profileData ? (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setSaveError(null);
                setIsEditing(false);
              }}
            >
              {messages.common.cancel}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-4">
          <ProfilePhotoUpload source={profileImageSource} size="settings" />
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{messages.profile.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{displayName}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ProfileSectionTabs locale={locale} active="data" />
          <Button variant="outline" onClick={() => setIsEditing(true)}>{provenanceCopy.wizard}</Button>
        </div>
        <ProfileProvenance profile={profileData} locale={locale} onWeightSaved={openRefreshDialog} onEditDetails={() => setShowDirectEditor(true)} />
        <Card variant="bordered" className="rounded-3xl bg-[var(--bbf-lime)] text-[var(--bbf-inkt)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--bbf-inkt)]">{hasFitMeasurements(profileData) ? messages.profile.status.title : messages.fit.riderProfileWarning.title}</h2>
              <p className="mt-2">{hasFitMeasurements(profileData) ? messages.profile.status.description : messages.fit.riderProfileWarning.description}</p>
            </div>
            {hasFitMeasurements(profileData) ? <Button variant="primary" {...linkButtonProps(withLocalePrefix("/fit", locale))}>
              {messages.profile.status.startFitCta}<ArrowRight className="ml-1.5 h-4 w-4" />
            </Button> : <Button variant="primary" onClick={() => setIsEditing(true)}>
              {messages.fit.riderProfileWarning.cta}<ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>}
          </div>
        </Card>
        <section className="space-y-4">
          <Button variant="outline" aria-expanded={showDirectEditor} aria-controls="profile-direct-editor" onClick={() => setShowDirectEditor(!showDirectEditor)}>{showDirectEditor ? provenanceCopy.hideEditor : provenanceCopy.directEdit}</Button>
          <p className="text-sm text-muted-foreground">{provenanceCopy.directHint}</p>
          <div id="profile-direct-editor" hidden={!showDirectEditor}>
            <ProfileAutosaveEditor key={profileData._id} profile={profileData} onWeightSaved={openRefreshDialog}
              refinementsLocked={isPaidAccessEnforced() && !access?.fullProfile}
              target={searchParams?.get("edit")}
              bodySummary={(values) => <BMISlider heightCm={values.heightCm ?? null} weightKg={values.weightKg ?? null}
                messages={messages} />} />
          </div>
        </section>
      </div>
      <AccessibleDialog
        open={showRefreshDialog}
        title={messages.profile.refresh.title}
        description={
          pendingRefreshWeight !== null && (recalculableBikeCount ?? 0) > 0
            ? messages.profile.refresh.descriptionWithPressure.replace(
                "{weight}",
                String(pendingRefreshWeight)
              )
            : messages.profile.refresh.descriptionFitOnly
        }
        onClose={finishProfileSave}
      >
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" onClick={finishProfileSave}>
            {messages.profile.refresh.dismissButton}
          </Button>
          <Button
            variant="outline"
            {...{
              render: (
                <Link
                  href={withLocalePrefix("/fit", locale)}
                  onClick={() => {
                    setShowRefreshDialog(false);
                    setPendingRefreshWeight(null);
                    setIsEditing(false);
                  }}
                />
              ),
              nativeButton: false as const,
            }}
          >
            {messages.profile.refresh.fitButton}
          </Button>
          {pendingRefreshWeight !== null && (recalculableBikeCount ?? 0) > 0 ? (
            <Button type="button" onClick={handleRecalculate} isLoading={isRecalculating}>
              {isRecalculating
                ? messages.profile.recalculate.calculating
                : messages.profile.refresh.pressureButton}
            </Button>
          ) : null}
        </div>
      </AccessibleDialog>
    </>
  );
}
