"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useMutation, useQuery } from "convex/react";
import { Activity, ArrowRight, Dumbbell, Edit2, Info, PencilLine, Ruler } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { MeasurementWizard, type WizardFormData } from "@/components/measurements";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  NumberInput,
  Selectable,
  useToast,
} from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { CoreStabilityBar, getCoreStabilityMeta } from "@/components/profile/CoreStabilityBar";
import { FlexibilityScale, getFlexibilityMeta } from "@/components/profile/FlexibilityScale";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { reportClientError } from "@/lib/telemetry";
import {
  coreStabilityTests,
  flexibilityTests,
  validateInseamRatio,
} from "@/lib/validations/profile";
import {
  getEffectiveDisplayName,
  getEffectiveProfileImageSource,
} from "@/lib/userIdentity";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import type { Locale } from "@/i18n/config";

type FlexibilityScore = (typeof flexibilityTests)[number]["score"];
type MeasurementValues = Pick<
  ProfileData,
  | "heightCm"
  | "inseamCm"
  | "weightKg"
  | "torsoLengthCm"
  | "armLengthCm"
  | "shoulderWidthCm"
  | "femurLengthCm"
>;

interface ProfileData {
  heightCm: number;
  inseamCm: number;
  weightKg?: number;
  torsoLengthCm?: number;
  armLengthCm?: number;
  femurLengthCm?: number;
  shoulderWidthCm?: number;
  flexibilityScore: FlexibilityScore;
  coreStabilityScore: number;
}

type MeasurementConfig = {
  key: keyof MeasurementValues;
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
  value?: number;
  steps: string[];
};

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
  };
}

function MeasurementInfoBox({
  title,
  steps,
}: {
  title: string;
  steps: string[];
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_88%,var(--background)_12%)] p-3 text-sm">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)]" />
        <div>
          <p className="font-medium text-[color:var(--foreground)]">{title}</p>
          <ul className="mt-1 space-y-1 text-[color:var(--muted-foreground)]">
            {steps.map((step) => (
              <li key={step}>• {step}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function BodyMeasurementsEditor({
  profile,
  messages,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}: {
  profile: ProfileData;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (values: MeasurementValues) => Promise<void>;
}) {
  const [values, setValues] = useState<{
    [K in keyof MeasurementValues]: number | null;
  }>({
    heightCm: profile.heightCm,
    inseamCm: profile.inseamCm,
    weightKg: profile.weightKg ?? null,
    torsoLengthCm: profile.torsoLengthCm ?? null,
    armLengthCm: profile.armLengthCm ?? null,
    shoulderWidthCm: profile.shoulderWidthCm ?? null,
    femurLengthCm: profile.femurLengthCm ?? null,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues({
      heightCm: profile.heightCm,
      inseamCm: profile.inseamCm,
      weightKg: profile.weightKg ?? null,
      torsoLengthCm: profile.torsoLengthCm ?? null,
      armLengthCm: profile.armLengthCm ?? null,
      shoulderWidthCm: profile.shoulderWidthCm ?? null,
      femurLengthCm: profile.femurLengthCm ?? null,
    });
  }, [
    isEditing,
    profile.armLengthCm,
    profile.femurLengthCm,
    profile.heightCm,
    profile.inseamCm,
    profile.shoulderWidthCm,
    profile.torsoLengthCm,
    profile.weightKg,
  ]);

  const handleSave = async () => {
    if (values.heightCm === null || values.inseamCm === null) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        heightCm: values.heightCm,
        inseamCm: values.inseamCm,
        weightKg: values.weightKg ?? undefined,
        torsoLengthCm: values.torsoLengthCm ?? undefined,
        armLengthCm: values.armLengthCm ?? undefined,
        shoulderWidthCm: values.shoulderWidthCm ?? undefined,
        femurLengthCm: values.femurLengthCm ?? undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const ratioWarning =
    values.heightCm && values.inseamCm
      ? validateInseamRatio(values.heightCm, values.inseamCm)
      : null;

  const configs: MeasurementConfig[] = [
    {
      key: "heightCm",
      label: messages.profile.measurements.height,
      unit: "cm",
      min: 130,
      max: 210,
      value: profile.heightCm,
      steps: messages.profile.measurements.heightSteps,
    },
    {
      key: "inseamCm",
      label: messages.profile.measurements.inseam,
      unit: "cm",
      min: 55,
      max: 105,
      value: profile.inseamCm,
      steps: messages.profile.measurements.inseamSteps,
    },
    {
      key: "weightKg",
      label: messages.profile.measurements.weight,
      unit: "kg",
      min: 30,
      max: 200,
      value: profile.weightKg,
      steps: [],
    },
    {
      key: "torsoLengthCm",
      label: messages.profile.measurements.torso,
      unit: "cm",
      min: 45,
      max: 75,
      value: profile.torsoLengthCm,
      steps: messages.profile.measurements.torsoSteps,
    },
    {
      key: "armLengthCm",
      label: messages.profile.measurements.armLength,
      unit: "cm",
      min: 45,
      max: 75,
      value: profile.armLengthCm,
      steps: messages.profile.measurements.armSteps,
    },
    {
      key: "shoulderWidthCm",
      label: messages.profile.measurements.shoulderWidth,
      unit: "cm",
      min: 30,
      max: 55,
      value: profile.shoulderWidthCm,
      steps: messages.profile.measurements.shoulderSteps,
    },
    {
      key: "femurLengthCm",
      label: messages.profile.measurements.femurLength,
      unit: "cm",
      min: 35,
      max: 60,
      value: profile.femurLengthCm,
      steps: messages.profile.measurements.femurSteps,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[color:var(--muted-foreground)]">
            {messages.profile.measurements.summary}
          </p>
        </div>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <PencilLine className="h-4 w-4" />
            {messages.profile.actions.editInline}
          </Button>
        ) : null}
      </div>

      {!isEditing ? (
        <dl className="space-y-3">
          {configs.map((config) =>
            config.value !== undefined ? (
              <div key={config.key} className="flex justify-between gap-3">
                <dt className="text-[color:var(--muted-foreground)]">{config.label}</dt>
                <dd className="font-medium text-[color:var(--foreground)]">
                  {config.value} {config.unit}
                </dd>
              </div>
            ) : null
          )}
          {profile.weightKg === undefined ? (
            <p className="text-sm italic text-[color:var(--muted-foreground)]">
              {messages.profile.measurements.weightNotSet}
            </p>
          ) : null}
        </dl>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {configs.map((config) => (
              <NumberInput
                key={config.key}
                label={config.label}
                tooltip={
                  config.key === "weightKg"
                    ? messages.profile.measurements.weightTooltip
                    : undefined
                }
                helperText={
                  config.key === "weightKg"
                    ? messages.profile.measurements.weightHelper
                    : undefined
                }
                min={config.min}
                max={config.max}
                step={config.key === "weightKg" ? 0.5 : 0.5}
                value={values[config.key] ?? null}
                onChange={(nextValue) =>
                  setValues((current) => ({ ...current, [config.key]: nextValue }))
                }
                unit={config.unit}
              />
            ))}
          </div>

          {ratioWarning ? (
            <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)] px-4 py-3 text-sm text-[color:var(--warning-foreground)]">
              {ratioWarning}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {configs
              .filter((config) => config.steps.length > 0)
              .map((config) => (
                <MeasurementInfoBox
                  key={config.key}
                  title={`${messages.profile.measurements.howToMeasure} ${config.label}`}
                  steps={config.steps}
                />
              ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              {messages.common.cancel}
            </Button>
            <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
              {messages.profile.measurements.saveField}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FlexibilityCard({
  score,
  locale,
  messages,
  editing,
  onStartEdit,
  onCancel,
  onSave,
}: {
  score: FlexibilityScore;
  locale: Locale;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
  editing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: (score: FlexibilityScore) => Promise<void>;
}) {
  const [draftScore, setDraftScore] = useState<FlexibilityScore>(score);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftScore(score);
  }, [score, editing]);

  const meta = getFlexibilityMeta(score);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(draftScore);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-[color:var(--primary)]" />
          <CardTitle>{messages.profile.sections.flexibility}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing ? (
          <>
            <FlexibilityScale score={score} />
            <details className="rounded-[var(--radius-lg)] bg-[color:var(--secondary)] p-3">
              <summary className="cursor-pointer text-sm font-medium text-[color:var(--foreground)]">
                {messages.profile.flexibility.impactTitle}
              </summary>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {messages.profile.flexibility.impactDescription}
              </p>
            </details>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={onStartEdit}>
                <Edit2 className="h-4 w-4" />
                {messages.profile.flexibility.editButton}
              </Button>
              <Link href={withLocalePrefix("/profile/improve/flexibility", locale)} className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--primary)] hover:opacity-80">
                {messages.profile.flexibility.improveLink}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <MeasurementInfoBox
              title={messages.profile.flexibility.testInstructions.title}
              steps={messages.profile.flexibility.testInstructions.steps}
            />
            <RadioGroup<FlexibilityScore>
              aria-label={messages.profile.sections.flexibility}
              className="grid gap-3"
              value={draftScore}
              onValueChange={(next) => setDraftScore(next)}
            >
              {flexibilityTests.map((test) => {
                const optionMeta = getFlexibilityMeta(test.score);
                return (
                  <Selectable
                    key={test.score}
                    mode="radio"
                    value={test.score}
                    variant="card"
                    label={test.label}
                    badge={
                      <span className="rounded-full bg-[color:var(--secondary)] px-2 py-0.5 text-xs text-[color:var(--secondary-foreground)]">
                        {optionMeta.index}/5
                      </span>
                    }
                    description={test.description}
                  />
                );
              })}
            </RadioGroup>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                {messages.common.cancel}
              </Button>
              <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
                {messages.profile.flexibility.saveButton}
              </Button>
            </div>
          </>
        )}
        {!editing ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">
            {messages.profile.flexibility.levelLabel
              .replace("{label}", meta.label)
              .replace("{index}", String(meta.index))}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CoreStabilityCard({
  score,
  locale,
  messages,
  editing,
  onStartEdit,
  onCancel,
  onSave,
}: {
  score: number;
  locale: Locale;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
  editing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: (score: number) => Promise<void>;
}) {
  const [draftScore, setDraftScore] = useState(score);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftScore(score);
  }, [score, editing]);

  const meta = getCoreStabilityMeta(score);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(draftScore);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-[color:var(--primary)]" />
          <CardTitle>{messages.profile.sections.coreStability}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing ? (
          <>
            <CoreStabilityBar score={score} />
            <details className="rounded-[var(--radius-lg)] bg-[color:var(--secondary)] p-3">
              <summary className="cursor-pointer text-sm font-medium text-[color:var(--foreground)]">
                {messages.profile.coreStability.impactTitle}
              </summary>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {messages.profile.coreStability.impactDescription}
              </p>
            </details>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={onStartEdit}>
                <Edit2 className="h-4 w-4" />
                {messages.profile.coreStability.editButton}
              </Button>
              <Link href={withLocalePrefix("/profile/improve/core-stability", locale)} className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--primary)] hover:opacity-80">
                {messages.profile.coreStability.improveLink}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <MeasurementInfoBox
              title={messages.profile.coreStability.testInstructions.title}
              steps={messages.profile.coreStability.testInstructions.steps}
            />
            <RadioGroup<number>
              aria-label={messages.profile.sections.coreStability}
              className="grid gap-3"
              value={draftScore}
              onValueChange={(next) => setDraftScore(next)}
            >
              {coreStabilityTests.map((test) => (
                <Selectable
                  key={test.score}
                  mode="radio"
                  value={test.score}
                  variant="card"
                  label={test.label}
                  description={test.description}
                  trailing={
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--secondary)] text-lg font-bold text-[color:var(--secondary-foreground)]">
                      {test.score}
                    </div>
                  }
                />
              ))}
            </RadioGroup>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                {messages.common.cancel}
              </Button>
              <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
                {messages.profile.coreStability.saveButton}
              </Button>
            </div>
          </>
        )}
        {!editing ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">
            {messages.profile.coreStability.levelLabel
              .replace("{label}", meta.label)
              .replace("{description}", meta.description)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ProfileSummary({
  profile,
  locale,
  fitHref,
  messages,
  displayName,
  profileImageSource,
  editingMeasurements,
  editingFlexibility,
  editingCoreStability,
  onEditWizard,
  onStartMeasurementsEdit,
  onCancelMeasurementsEdit,
  onSaveMeasurements,
  onStartFlexibilityEdit,
  onCancelFlexibilityEdit,
  onSaveFlexibility,
  onStartCoreStabilityEdit,
  onCancelCoreStabilityEdit,
  onSaveCoreStability,
}: {
  profile: ProfileData;
  locale: Locale;
  fitHref: string;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
  displayName: string;
  profileImageSource?: string;
  editingMeasurements: boolean;
  editingFlexibility: boolean;
  editingCoreStability: boolean;
  onEditWizard: () => void;
  onStartMeasurementsEdit: () => void;
  onCancelMeasurementsEdit: () => void;
  onSaveMeasurements: (values: MeasurementValues) => Promise<void>;
  onStartFlexibilityEdit: () => void;
  onCancelFlexibilityEdit: () => void;
  onSaveFlexibility: (score: FlexibilityScore) => Promise<void>;
  onStartCoreStabilityEdit: () => void;
  onCancelCoreStabilityEdit: () => void;
  onSaveCoreStability: (score: number) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <ProfilePhotoUpload source={profileImageSource} size="settings" />
          <div>
            <h1 className="text-2xl font-bold text-[color:var(--foreground)]">
              {messages.profile.title}
            </h1>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{displayName}</p>
          </div>
        </div>
        <Button onClick={onEditWizard}>
          <Edit2 className="mr-2 h-4 w-4" />
          {messages.profile.actions.editMeasurements}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Card variant="bordered" className="dashboard-card-surface xl:row-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-[color:var(--primary)]" />
                <CardTitle>{messages.profile.sections.bodyMeasurements}</CardTitle>
              </div>
              {!editingMeasurements ? (
                <Button variant="ghost" size="sm" onClick={onStartMeasurementsEdit}>
                  <PencilLine className="h-4 w-4" />
                  {messages.profile.measurements.editAllButton}
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <BodyMeasurementsEditor
              profile={profile}
              messages={messages}
              isEditing={editingMeasurements}
              onEdit={onStartMeasurementsEdit}
              onCancel={onCancelMeasurementsEdit}
              onSave={onSaveMeasurements}
            />
          </CardContent>
        </Card>

        <FlexibilityCard
          score={profile.flexibilityScore}
          locale={locale}
          messages={messages}
          editing={editingFlexibility}
          onStartEdit={onStartFlexibilityEdit}
          onCancel={onCancelFlexibilityEdit}
          onSave={onSaveFlexibility}
        />

        <CoreStabilityCard
          score={profile.coreStabilityScore}
          locale={locale}
          messages={messages}
          editing={editingCoreStability}
          onStartEdit={onStartCoreStabilityEdit}
          onCancel={onCancelCoreStabilityEdit}
          onSave={onSaveCoreStability}
        />
      </div>

      <Card variant="bordered" className="dashboard-card-surface">
        <CardHeader>
          <CardTitle>{messages.profile.status.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[color:var(--muted-foreground)]">{messages.profile.status.description}</p>
          <div className="mt-4">
            <Button variant="primary" {...linkButtonProps(fitHref)}>
              {messages.profile.status.startFitCta}
            </Button>
          </div>
        </CardContent>
      </Card>
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
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [pendingRefreshWeight, setPendingRefreshWeight] = useState<number | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingMeasurements, setEditingMeasurements] = useState(false);
  const [editingFlexibility, setEditingFlexibility] = useState(false);
  const [editingCoreStability, setEditingCoreStability] = useState(false);

  const profileData = useQuery(api.profiles.queries.getMyProfile);
  const recalculableBikeCount = useQuery(
    api.pressureCalculations.queries.getRecalculableBikeCount
  );
  const user = useQuery(api.users.queries.getCurrentUser);

  const upsertProfile = useMutation(api.profiles.mutations.upsert);
  const updateMeasurements = useMutation(api.profiles.mutations.updateMeasurements);
  const updateAssessment = useMutation(api.profiles.mutations.updateAssessment);
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

  useEffect(() => {
    const editTarget = searchParams?.get("edit");
    if (editTarget === "flexibility") {
      setEditingFlexibility(true);
      setEditingCoreStability(false);
    } else if (editTarget === "core") {
      setEditingCoreStability(true);
      setEditingFlexibility(false);
    }
  }, [searchParams]);

  const openRefreshDialog = (nextWeightKg?: number) => {
    setPendingRefreshWeight(nextWeightKg ?? null);
    setShowRefreshDialog(true);
  };

  const finishProfileSave = () => {
    setShowRefreshDialog(false);
    setPendingRefreshWeight(null);
    setIsEditing(false);
    setEditingMeasurements(false);
    toast.success({ description: messages.common.toasts.profileSaved });
  };

  const handleSaveProfile = async (data: WizardFormData) => {
    setSaveError(null);
    try {
      const previousWeight = profileData?.weightKg;

      await upsertProfile({
        heightCm: data.heightCm,
        inseamCm: data.inseamCm,
        weightKg: data.weightKg,
        torsoLengthCm: data.torsoLengthCm,
        armLengthCm: data.armLengthCm,
        femurLengthCm: data.femurLengthCm,
        shoulderWidthCm: data.shoulderWidthCm,
        flexibilityScore: data.flexibilityScore,
        coreStabilityScore: data.coreStabilityScore,
      });

      setIsEditing(false);
      if (previousWeight !== data.weightKg) {
        openRefreshDialog(data.weightKg);
      } else {
        toast.success({ description: messages.common.toasts.profileSaved });
      }
    } catch (error) {
      setSaveError(
        reportClientError(error, {
          area: "profile",
          action: "upsertProfile",
          operationType: "mutation",
        })
      );
    }
  };

  const handleSaveMeasurements = async (values: MeasurementValues) => {
    if (!profileData) {
      return;
    }

    const hasChanges =
      profileData.heightCm !== values.heightCm ||
      profileData.inseamCm !== values.inseamCm ||
      (profileData.weightKg ?? undefined) !== (values.weightKg ?? undefined) ||
      (profileData.torsoLengthCm ?? undefined) !== (values.torsoLengthCm ?? undefined) ||
      (profileData.armLengthCm ?? undefined) !== (values.armLengthCm ?? undefined) ||
      (profileData.shoulderWidthCm ?? undefined) !==
        (values.shoulderWidthCm ?? undefined) ||
      (profileData.femurLengthCm ?? undefined) !== (values.femurLengthCm ?? undefined);

    if (!hasChanges) {
      setEditingMeasurements(false);
      return;
    }

    try {
      await updateMeasurements(values);
      const weightChanged =
        (profileData.weightKg ?? undefined) !== (values.weightKg ?? undefined);
      if (weightChanged && values.weightKg !== undefined) {
        openRefreshDialog(values.weightKg);
      } else {
        setEditingMeasurements(false);
        toast.success({ description: messages.common.toasts.profileSaved });
      }
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "profile",
          action: "updateMeasurements",
          operationType: "mutation",
        }),
      });
    }
  };

  const handleSaveFlexibility = async (nextFlexibilityScore: FlexibilityScore) => {
    if (!profileData) return;
    try {
      await updateAssessment({
        flexibilityScore: nextFlexibilityScore,
        coreStabilityScore: profileData.coreStabilityScore,
      });
      setEditingFlexibility(false);
      toast.success({ description: messages.common.toasts.profileSaved });
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "profile",
          action: "updateFlexibility",
          operationType: "mutation",
        }),
      });
    }
  };

  const handleSaveCoreStability = async (nextCoreStabilityScore: number) => {
    if (!profileData) return;
    try {
      await updateAssessment({
        flexibilityScore: profileData.flexibilityScore,
        coreStabilityScore: nextCoreStabilityScore,
      });
      setEditingCoreStability(false);
      toast.success({ description: messages.common.toasts.profileSaved });
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "profile",
          action: "updateCoreStability",
          operationType: "mutation",
        }),
      });
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
      setEditingMeasurements(false);
      toast.success({
        description: messages.profile.recalculate.successToast.replace(
          "{count}",
          String(result.recalculatedCount)
        ),
      });
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "profile",
          action: "recalculatePressure",
          operationType: "mutation",
        }),
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

  if (profileData === undefined && !isEditing) {
    return <LoadingState label={messages.profile.loading} />;
  }

  if (!profileData || isEditing) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[color:var(--foreground)]">
            {profileData
              ? messages.profile.edit.title
              : messages.profile.onboarding.title}
          </h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">
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
          onComplete={handleSaveProfile}
          defaultValues={profileData ? getDefaultValues(profileData) : undefined}
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
      <ProfileSummary
        profile={profileData}
        locale={locale}
        fitHref={withLocalePrefix("/fit", locale)}
        messages={messages}
        onEditWizard={() => setIsEditing(true)}
        displayName={displayName}
        profileImageSource={profileImageSource}
        editingMeasurements={editingMeasurements}
        editingFlexibility={editingFlexibility}
        editingCoreStability={editingCoreStability}
        onStartMeasurementsEdit={() => setEditingMeasurements(true)}
        onCancelMeasurementsEdit={() => setEditingMeasurements(false)}
        onSaveMeasurements={handleSaveMeasurements}
        onStartFlexibilityEdit={() => {
          setEditingFlexibility(true);
          setEditingCoreStability(false);
        }}
        onCancelFlexibilityEdit={() => setEditingFlexibility(false)}
        onSaveFlexibility={handleSaveFlexibility}
        onStartCoreStabilityEdit={() => {
          setEditingCoreStability(true);
          setEditingFlexibility(false);
        }}
        onCancelCoreStabilityEdit={() => setEditingCoreStability(false)}
        onSaveCoreStability={handleSaveCoreStability}
      />
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
                    setEditingMeasurements(false);
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
