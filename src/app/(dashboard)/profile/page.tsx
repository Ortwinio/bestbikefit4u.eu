"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Activity, ArrowRight, Dumbbell, Edit2, Info, PencilLine, Ruler, User } from "lucide-react";
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
type EditableMeasurementKey =
  | "heightCm"
  | "inseamCm"
  | "torsoLengthCm"
  | "armLengthCm"
  | "shoulderWidthCm"
  | "femurLengthCm";
type OptionalMeasurementKey =
  | "torsoLengthCm"
  | "armLengthCm"
  | "shoulderWidthCm"
  | "femurLengthCm";

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
  key: EditableMeasurementKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
  value?: number;
  steps: string[];
};

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
    <div className="rounded-[var(--radius-lg)] bg-blue-50 p-3 text-sm">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <div>
          <p className="font-medium text-blue-800">{title}</p>
          <ul className="mt-1 space-y-1 text-blue-700">
            {steps.map((step) => (
              <li key={step}>• {step}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function WeightEditor({
  currentWeightKg,
  messages,
  onSave,
}: {
  currentWeightKg?: number;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
  onSave: (newWeightKg: number) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<number | null>(currentWeightKg ?? null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(currentWeightKg ?? null);
  }, [currentWeightKg]);

  const handleSave = async () => {
    if (value === null) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[color:var(--foreground)]">
            {messages.profile.measurements.weight}
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            {currentWeightKg
              ? `${currentWeightKg} kg`
              : messages.profile.measurements.weightNotSet}
          </p>
        </div>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <PencilLine className="h-4 w-4" />
            {messages.profile.actions.editInline}
          </Button>
        ) : null}
      </div>

      {isEditing ? (
        <div className="mt-4 space-y-3">
          <NumberInput
            label={messages.profile.measurements.weight}
            tooltip={messages.profile.measurements.weightTooltip}
            helperText={messages.profile.measurements.weightHelper}
            min={30}
            max={200}
            step={0.5}
            value={value}
            onChange={setValue}
            unit="kg"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setValue(currentWeightKg ?? null);
                setIsEditing(false);
              }}
            >
              {messages.common.cancel}
            </Button>
            <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
              {messages.profile.measurements.saveField}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MeasurementRowEditor({
  config,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  messages,
}: {
  config: MeasurementConfig;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (value: number) => Promise<void>;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
}) {
  const [draftValue, setDraftValue] = useState<number | null>(config.value ?? null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftValue(config.value ?? null);
  }, [config.value, isEditing]);

  const handleSave = async () => {
    if (draftValue === null) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(draftValue);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded-[var(--radius-lg)] border border-[color:var(--border)] px-4 py-3">
      {!isEditing ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[color:var(--muted-foreground)]">{config.label}</p>
            <p className="font-medium text-[color:var(--foreground)]">
              {config.value !== undefined ? `${config.value} ${config.unit}` : "—"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <PencilLine className="h-4 w-4" />
            {messages.profile.actions.editInline}
          </Button>
        </div>
      ) : (
        <>
          <NumberInput
            label={config.label}
            min={config.min}
            max={config.max}
            step={config.step ?? 0.5}
            value={draftValue}
            onChange={setDraftValue}
            unit={config.unit}
          />
          <MeasurementInfoBox
            title={messages.profile.measurements.howToMeasure}
            steps={config.steps}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              {messages.common.cancel}
            </Button>
            <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
              {messages.profile.measurements.saveField}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function OptionalMeasurementsEditor({
  profile,
  open,
  onClose,
  onSave,
  messages,
}: {
  profile: ProfileData;
  open: boolean;
  onClose: () => void;
  onSave: (values: Partial<Record<OptionalMeasurementKey, number>>) => Promise<void>;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
}) {
  const [values, setValues] = useState<Record<OptionalMeasurementKey, number | null>>({
    torsoLengthCm: profile.torsoLengthCm ?? null,
    armLengthCm: profile.armLengthCm ?? null,
    shoulderWidthCm: profile.shoulderWidthCm ?? null,
    femurLengthCm: profile.femurLengthCm ?? null,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues({
      torsoLengthCm: profile.torsoLengthCm ?? null,
      armLengthCm: profile.armLengthCm ?? null,
      shoulderWidthCm: profile.shoulderWidthCm ?? null,
      femurLengthCm: profile.femurLengthCm ?? null,
    });
  }, [profile.armLengthCm, profile.femurLengthCm, profile.shoulderWidthCm, profile.torsoLengthCm, open]);

  if (!open) {
    return null;
  }

  const configs: Array<MeasurementConfig & { key: OptionalMeasurementKey }> = [
    {
      key: "torsoLengthCm",
      label: messages.profile.measurements.torso,
      unit: "cm",
      min: 45,
      max: 75,
      value: values.torsoLengthCm ?? undefined,
      steps: messages.profile.measurements.torsoSteps,
    },
    {
      key: "armLengthCm",
      label: messages.profile.measurements.armLength,
      unit: "cm",
      min: 45,
      max: 75,
      value: values.armLengthCm ?? undefined,
      steps: messages.profile.measurements.armSteps,
    },
    {
      key: "shoulderWidthCm",
      label: messages.profile.measurements.shoulderWidth,
      unit: "cm",
      min: 30,
      max: 55,
      value: values.shoulderWidthCm ?? undefined,
      steps: messages.profile.measurements.shoulderSteps,
    },
    {
      key: "femurLengthCm",
      label: messages.profile.measurements.femurLength,
      unit: "cm",
      min: 35,
      max: 60,
      value: values.femurLengthCm ?? undefined,
      steps: messages.profile.measurements.femurSteps,
    },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        torsoLengthCm: values.torsoLengthCm ?? undefined,
        armLengthCm: values.armLengthCm ?? undefined,
        shoulderWidthCm: values.shoulderWidthCm ?? undefined,
        femurLengthCm: values.femurLengthCm ?? undefined,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
      <div className="grid gap-4 md:grid-cols-2">
        {configs.map((config) => (
          <div key={config.key} className="space-y-3">
            <NumberInput
              label={config.label}
              min={config.min}
              max={config.max}
              step={0.5}
              value={values[config.key]}
              onChange={(nextValue) =>
                setValues((current) => ({ ...current, [config.key]: nextValue }))
              }
              unit={config.unit}
            />
            <MeasurementInfoBox
              title={messages.profile.measurements.howToMeasure}
              steps={config.steps}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          {messages.common.cancel}
        </Button>
        <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
          {messages.profile.measurements.saveField}
        </Button>
      </div>
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
    <Card variant="bordered">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
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
              <Link
                href={withLocalePrefix("/profile/improve/flexibility", locale)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
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
            <div className="grid gap-3">
              {flexibilityTests.map((test) => {
                const optionMeta = getFlexibilityMeta(test.score);
                return (
                  <Selectable
                    key={test.score}
                    selected={draftScore === test.score}
                    onClick={() => setDraftScore(test.score)}
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
            </div>
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
    <Card variant="bordered">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-purple-600" />
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
              <Link
                href={withLocalePrefix("/profile/improve/core-stability", locale)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
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
            <div className="grid gap-3">
              {coreStabilityTests.map((test) => (
                <Selectable
                  key={test.score}
                  selected={draftScore === test.score}
                  onClick={() => setDraftScore(test.score)}
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
            </div>
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
  activeMeasurementEditor,
  showOptionalMeasurements,
  editingFlexibility,
  editingCoreStability,
  onEditWizard,
  onMeasurementEdit,
  onMeasurementCancel,
  onMeasurementSave,
  onWeightSave,
  onShowOptionalMeasurements,
  onHideOptionalMeasurements,
  onOptionalMeasurementsSave,
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
  activeMeasurementEditor: EditableMeasurementKey | null;
  showOptionalMeasurements: boolean;
  editingFlexibility: boolean;
  editingCoreStability: boolean;
  onEditWizard: () => void;
  onMeasurementEdit: (key: EditableMeasurementKey) => void;
  onMeasurementCancel: () => void;
  onMeasurementSave: (key: EditableMeasurementKey, value: number) => Promise<void>;
  onWeightSave: (weightKg: number) => Promise<void>;
  onShowOptionalMeasurements: () => void;
  onHideOptionalMeasurements: () => void;
  onOptionalMeasurementsSave: (
    values: Partial<Record<OptionalMeasurementKey, number>>
  ) => Promise<void>;
  onStartFlexibilityEdit: () => void;
  onCancelFlexibilityEdit: () => void;
  onSaveFlexibility: (score: FlexibilityScore) => Promise<void>;
  onStartCoreStabilityEdit: () => void;
  onCancelCoreStabilityEdit: () => void;
  onSaveCoreStability: (score: number) => Promise<void>;
}) {
  const ratioWarning = validateInseamRatio(profile.heightCm, profile.inseamCm);

  const measurementConfigs: MeasurementConfig[] = [
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

  const visibleConfigs = measurementConfigs.filter(
    (config) =>
      config.key === "heightCm" ||
      config.key === "inseamCm" ||
      config.value !== undefined ||
      activeMeasurementEditor === config.key
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <ProfilePhotoUpload source={profileImageSource} size="settings" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {messages.profile.title}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{displayName}</p>
          </div>
        </div>
        <Button onClick={onEditWizard}>
          <Edit2 className="mr-2 h-4 w-4" />
          {messages.profile.actions.editMeasurements}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Card variant="bordered" className="xl:row-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-blue-600" />
              <CardTitle>{messages.profile.sections.bodyMeasurements}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {visibleConfigs.map((config) => (
                <MeasurementRowEditor
                  key={config.key}
                  config={config}
                  isEditing={activeMeasurementEditor === config.key}
                  onEdit={() => onMeasurementEdit(config.key)}
                  onCancel={onMeasurementCancel}
                  onSave={(value) => onMeasurementSave(config.key, value)}
                  messages={messages}
                />
              ))}
            </div>

            {ratioWarning ? (
              <div className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {ratioWarning}
              </div>
            ) : null}

            <WeightEditor
              currentWeightKg={profile.weightKg}
              messages={messages}
              onSave={onWeightSave}
            />

            <div className="space-y-3">
              {!showOptionalMeasurements ? (
                <button
                  type="button"
                  onClick={onShowOptionalMeasurements}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  {messages.profile.measurements.addOptional}
                </button>
              ) : null}
              <OptionalMeasurementsEditor
                profile={profile}
                open={showOptionalMeasurements}
                onClose={onHideOptionalMeasurements}
                onSave={onOptionalMeasurementsSave}
                messages={messages}
              />
            </div>
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

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>{messages.profile.status.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{messages.profile.status.description}</p>
          <div className="mt-4">
            <Link href={fitHref}>
              <Button>{messages.profile.status.startFitCta}</Button>
            </Link>
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
  const [showRecalculateDialog, setShowRecalculateDialog] = useState(false);
  const [pendingNewWeight, setPendingNewWeight] = useState<number | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeMeasurementEditor, setActiveMeasurementEditor] =
    useState<EditableMeasurementKey | null>(null);
  const [showOptionalMeasurements, setShowOptionalMeasurements] = useState(false);
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

  const handlePostWeightSave = (previousWeight: number | undefined, newWeight: number) => {
    const weightChanged =
      previousWeight === undefined || Math.abs(newWeight - previousWeight) >= 0.5;

    if (weightChanged && (recalculableBikeCount ?? 0) > 0) {
      setPendingNewWeight(newWeight);
      setShowRecalculateDialog(true);
      return;
    }

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
      if (data.weightKg !== undefined) {
        handlePostWeightSave(previousWeight, data.weightKg);
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

  const handleWeightSave = async (newWeightKg: number) => {
    try {
      await updateMeasurements({ weightKg: newWeightKg });
      handlePostWeightSave(profileData?.weightKg, newWeightKg);
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "profile",
          action: "updateWeight",
          operationType: "mutation",
        }),
      });
    }
  };

  const handleMeasurementSave = async (
    key: EditableMeasurementKey,
    value: number
  ) => {
    try {
      await updateMeasurements({ [key]: value });
      setActiveMeasurementEditor(null);
      toast.success({ description: messages.common.toasts.profileSaved });
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "profile",
          action: `update_${key}`,
          operationType: "mutation",
        }),
      });
    }
  };

  const handleOptionalMeasurementsSave = async (
    values: Partial<Record<OptionalMeasurementKey, number>>
  ) => {
    try {
      await updateMeasurements(values);
      toast.success({ description: messages.common.toasts.profileSaved });
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "profile",
          action: "updateOptionalMeasurements",
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

  const handleDismissRecalculate = () => {
    setShowRecalculateDialog(false);
    setPendingNewWeight(null);
    setIsEditing(false);
    toast.success({ description: messages.common.toasts.profileSaved });
  };

  const handleRecalculate = async () => {
    if (pendingNewWeight === null) {
      return;
    }

    setIsRecalculating(true);
    try {
      const result = await recalculatePressureForAllBikes({
        newWeightKg: pendingNewWeight,
        autoNoteSource: `weight_change_${pendingNewWeight}kg`,
      });
      setShowRecalculateDialog(false);
      setPendingNewWeight(null);
      setIsEditing(false);
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
          <h1 className="text-2xl font-bold text-gray-900">
            {profileData
              ? messages.profile.edit.title
              : messages.profile.onboarding.title}
          </h1>
          <p className="mt-2 text-gray-600">
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
        activeMeasurementEditor={activeMeasurementEditor}
        showOptionalMeasurements={showOptionalMeasurements}
        editingFlexibility={editingFlexibility}
        editingCoreStability={editingCoreStability}
        onMeasurementEdit={(key) => {
          setActiveMeasurementEditor(key);
          setShowOptionalMeasurements(false);
        }}
        onMeasurementCancel={() => setActiveMeasurementEditor(null)}
        onMeasurementSave={handleMeasurementSave}
        onWeightSave={handleWeightSave}
        onShowOptionalMeasurements={() => {
          setActiveMeasurementEditor(null);
          setShowOptionalMeasurements(true);
        }}
        onHideOptionalMeasurements={() => setShowOptionalMeasurements(false)}
        onOptionalMeasurementsSave={handleOptionalMeasurementsSave}
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
        open={showRecalculateDialog}
        title={messages.profile.recalculate.dialogTitle}
        description={messages.profile.recalculate.dialogBody.replace(
          "{weight}",
          pendingNewWeight?.toString() ?? ""
        )}
        onClose={handleDismissRecalculate}
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleDismissRecalculate}>
            {messages.profile.recalculate.dismissButton}
          </Button>
          <Button type="button" onClick={handleRecalculate} isLoading={isRecalculating}>
            {isRecalculating
              ? messages.profile.recalculate.calculating
              : messages.profile.recalculate.confirmButton}
          </Button>
        </div>
      </AccessibleDialog>
    </>
  );
}
