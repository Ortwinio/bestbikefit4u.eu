"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useMutation, useQuery } from "convex/react";
import { Activity, AlertCircle, ArrowRight, Dumbbell, Edit2, HeartPulse, Info, PencilLine, Ruler } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { MeasurementWizard, type WizardFormData } from "@/components/measurements";
import { NumberSlider, ReadOnlyNumberSlider } from "@/components/measurements/NumberSlider";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  InfoBox,
  LoadingState,
  Selectable,
  useToast,
} from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { ComfortLevelBar, getComfortMeta } from "@/components/profile/ComfortLevelBar";
import { CoreStabilityBar, getCoreStabilityMeta } from "@/components/profile/CoreStabilityBar";
import { FlexibilityScale, getFlexibilityMeta } from "@/components/profile/FlexibilityScale";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { RidingStyleCard, SliderQuestion, ReadOnlySlider, type RiderProfileData } from "@/components/profile/RidingStyleCard";
import { reportClientError } from "@/lib/telemetry";
import {
  comfortLevels,
  coreStabilityTests,
  deriveComfortScore,
  flexibilityTests,
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
  hasPain?: string;
  painSeverity?: number;
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
    comfortScore: deriveComfortScore(profile.hasPain, profile.painSeverity),
    experienceLevel: profile.experienceLevel as WizardFormData["experienceLevel"],
    weeklyHours: profile.weeklyHours as WizardFormData["weeklyHours"],
    typicalRideLength: profile.typicalRideLength as WizardFormData["typicalRideLength"],
    positionPriority: profile.positionPriority as WizardFormData["positionPriority"],
  };
}

/** Map a wizard comfort score (1–5) back to hasPain + painSeverity for storage */
function comfortScoreToFields(score: number): { hasPain: "yes" | "no"; painSeverity?: number } {
  if (score >= 5) return { hasPain: "no" };
  if (score === 4) return { hasPain: "yes", painSeverity: 1 };
  if (score === 3) return { hasPain: "yes", painSeverity: 2 };
  if (score === 2) return { hasPain: "yes", painSeverity: 4 };
  return { hasPain: "yes", painSeverity: 5 };
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
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--muted)]/30 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">{t.label}</p>
        <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{t.noWeight}</p>
      </div>
    );
  }

  const bmi = weightKg / ((heightCm / 100) ** 2);
  const bmiRounded = Math.round(bmi * 10) / 10;

  const MIN_BMI = 15;
  const MAX_BMI = 40;
  const percent = Math.max(0, Math.min(100, ((bmi - MIN_BMI) / (MAX_BMI - MIN_BMI)) * 100));

  let category: string;
  let categoryColor: string;
  let categoryBg: string;
  if (bmi < 18.5) {
    category = t.underweight;
    categoryColor = "text-[color:var(--color-warning)]";
    categoryBg = "bg-[color:var(--color-warning)]/15";
  } else if (bmi < 25) {
    category = t.normal;
    categoryColor = "text-[color:var(--color-success)]";
    categoryBg = "bg-[color:var(--color-success)]/15";
  } else if (bmi < 30) {
    category = t.overweight;
    categoryColor = "text-[color:var(--color-warning)]";
    categoryBg = "bg-[color:var(--color-warning)]/15";
  } else {
    category = t.obese;
    categoryColor = "text-[color:var(--color-danger)]";
    categoryBg = "bg-[color:var(--color-danger)]/15";
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--muted)]/30 px-4 py-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">{t.label}</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[color:var(--foreground)]">{bmiRounded}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryBg} ${categoryColor}`}>
            {category}
          </span>
        </div>
      </div>
      {/* Gradient track */}
      <div className="relative h-3 overflow-visible rounded-full bg-gradient-to-r from-[color:var(--color-warning)] via-[color:var(--color-success)] via-60% to-[color:var(--color-danger)]">
        {/* Marker */}
        <div
          className="absolute top-1/2 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--foreground)] ring-2 ring-[color:var(--background)] shadow-md"
          style={{ left: `${percent}%` }}
        />
      </div>
      {/* Scale labels */}
      <div className="mt-1.5 flex justify-between text-xs text-[color:var(--muted-foreground)]">
        <span>15</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>40</span>
      </div>
    </div>
  );
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
  locale,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}: {
  profile: ProfileData;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
  locale: Locale;
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

  // Deviation warnings (>20% from height-based prediction)
  const inseamWarning = useMemo(() => {
    if (!values.heightCm || !values.inseamCm) return null;
    const pred = Math.round(values.heightCm * 0.47);
    if (Math.abs(values.inseamCm - pred) / pred > 0.2) {
      const dir = values.inseamCm > pred ? "longer" : "shorter";
      return `${values.inseamCm} cm is more than 20% ${dir} than expected for your height (${pred} cm) — double-check your measurement.`;
    }
    return null;
  }, [values.heightCm, values.inseamCm]);

  const weightWarning = useMemo(() => {
    if (!values.heightCm || !values.weightKg) return null;
    const pred = Math.round(22 * Math.pow(values.heightCm / 100, 2));
    if (Math.abs(values.weightKg - pred) / pred > 0.2) {
      const dir = values.weightKg > pred ? "heavier" : "lighter";
      return `${values.weightKg} kg is more than 20% ${dir} than expected for your height (${pred} kg) — verify the value is correct.`;
    }
    return null;
  }, [values.heightCm, values.weightKg]);

  const set = (key: keyof MeasurementValues) => (v: number) =>
    setValues((cur) => ({ ...cur, [key]: v }));

  const hasAdvanced =
    profile.torsoLengthCm != null ||
    profile.armLengthCm != null ||
    profile.shoulderWidthCm != null ||
    profile.femurLengthCm != null;

  return (
    <div className="space-y-4">
      <BMISlider
        heightCm={values.heightCm ?? null}
        weightKg={values.weightKg ?? null}
        messages={messages}
      />

      {!isEditing ? (
        <div className="space-y-3">
          <ReadOnlyNumberSlider
            label={messages.profile.measurements.height}
            value={profile.heightCm}
            min={130}
            max={210}
            unit="cm"
          />
          <ReadOnlyNumberSlider
            label={messages.profile.measurements.inseam}
            value={profile.inseamCm}
            min={55}
            max={105}
            unit="cm"
          />
          <ReadOnlyNumberSlider
            label={messages.profile.measurements.weight}
            value={profile.weightKg}
            min={30}
            max={200}
            unit="kg"
          />

          {hasAdvanced && (
            <>
              <p className="pt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Advanced measurements
              </p>
              {profile.torsoLengthCm != null && (
                <ReadOnlyNumberSlider
                  label={messages.profile.measurements.torso}
                  value={profile.torsoLengthCm}
                  min={45}
                  max={75}
                  unit="cm"
                />
              )}
              {profile.armLengthCm != null && (
                <ReadOnlyNumberSlider
                  label={messages.profile.measurements.armLength}
                  value={profile.armLengthCm}
                  min={45}
                  max={75}
                  unit="cm"
                />
              )}
              {profile.shoulderWidthCm != null && (
                <ReadOnlyNumberSlider
                  label={messages.profile.measurements.shoulderWidth}
                  value={profile.shoulderWidthCm}
                  min={30}
                  max={55}
                  unit="cm"
                />
              )}
              {profile.femurLengthCm != null && (
                <ReadOnlyNumberSlider
                  label={messages.profile.measurements.femurLength}
                  value={profile.femurLengthCm}
                  min={35}
                  max={60}
                  unit="cm"
                />
              )}
            </>
          )}

          <p className="pt-1 text-sm leading-6 text-muted-foreground">
            {messages.profile.measurements.impactDescription}
          </p>
          <Link
            href={withLocalePrefix("/profile/improve/body-measurements", locale)}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            {messages.profile.measurements.improveLink}
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <NumberSlider
            label={messages.profile.measurements.height}
            min={130}
            max={210}
            step={1}
            unit="cm"
            value={values.heightCm ?? undefined}
            onChange={set("heightCm")}
          />

          <NumberSlider
            label={messages.profile.measurements.inseam}
            min={55}
            max={105}
            step={1}
            unit="cm"
            value={values.inseamCm ?? undefined}
            onChange={set("inseamCm")}
          />
          {inseamWarning && (
            <InfoBox variant="warning" icon={<AlertCircle className="h-4 w-4 text-warning" />}>
              <p className="text-sm text-warning-foreground">{inseamWarning}</p>
            </InfoBox>
          )}

          <NumberSlider
            label={`${messages.profile.measurements.weight} (optional)`}
            min={30}
            max={200}
            step={1}
            unit="kg"
            value={values.weightKg ?? undefined}
            onChange={set("weightKg")}
          />
          {weightWarning && (
            <InfoBox variant="warning" icon={<AlertCircle className="h-4 w-4 text-warning" />}>
              <p className="text-sm text-warning-foreground">{weightWarning}</p>
            </InfoBox>
          )}

          <p className="pt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Advanced measurements (optional)
          </p>

          <NumberSlider
            label={messages.profile.measurements.torso}
            min={45}
            max={75}
            step={1}
            unit="cm"
            value={values.torsoLengthCm ?? undefined}
            onChange={set("torsoLengthCm")}
          />
          <NumberSlider
            label={messages.profile.measurements.armLength}
            min={45}
            max={75}
            step={1}
            unit="cm"
            value={values.armLengthCm ?? undefined}
            onChange={set("armLengthCm")}
          />
          <NumberSlider
            label={messages.profile.measurements.shoulderWidth}
            min={30}
            max={55}
            step={1}
            unit="cm"
            value={values.shoulderWidthCm ?? undefined}
            onChange={set("shoulderWidthCm")}
          />
          <NumberSlider
            label={messages.profile.measurements.femurLength}
            min={35}
            max={60}
            step={1}
            unit="cm"
            value={values.femurLengthCm ?? undefined}
            onChange={set("femurLengthCm")}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              {messages.common.cancel}
            </Button>
            <Button
              size="sm"
              onClick={() => void handleSave()}
              isLoading={isSaving}
              disabled={values.heightCm === null || values.inseamCm === null}
            >
              {messages.profile.measurements.saveField}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const PAIN_AREA_KEYS = ["knee_front", "knee_back", "lower_back", "neck", "hands", "saddle", "feet"];

function initAreaSeverities(
  painAreaSeverities: Record<string, number> | undefined,
  painAreas: string[] | undefined,
  painSeverity: number | undefined
): Record<string, number> {
  if (painAreaSeverities) return { ...painAreaSeverities };
  // Backward compat: spread existing overall severity onto each selected area
  const result: Record<string, number> = {};
  PAIN_AREA_KEYS.forEach((k) => { result[k] = 0; });
  if (painAreas && painSeverity) {
    painAreas.forEach((k) => { result[k] = painSeverity; });
  }
  return result;
}

function ComfortCard({
  hasPain,
  painSeverity,
  painAreas,
  painAreaSeverities,
  locale,
  messages,
  editing,
  onStartEdit,
  onCancel,
  onSave,
}: {
  hasPain: string | undefined;
  painSeverity: number | undefined;
  painAreas: string[] | undefined;
  painAreaSeverities: Record<string, number> | undefined;
  locale: Locale;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
  editing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: (painAreaSeverities: Record<string, number>) => Promise<void>;
}) {
  const score = deriveComfortScore(hasPain, painSeverity);
  const [draftAreaSeverities, setDraftAreaSeverities] = useState<Record<string, number>>(() =>
    initAreaSeverities(painAreaSeverities, painAreas, painSeverity)
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setDraftAreaSeverities(initAreaSeverities(painAreaSeverities, painAreas, painSeverity));
    }
  }, [editing, painAreaSeverities, painAreas, painSeverity]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(draftAreaSeverities);
    } finally {
      setIsSaving(false);
    }
  };

  const t = messages.profile.comfort;
  const sl = t.severityLevels;
  const severityOptions = [
    { key: "0", label: sl.none },
    { key: "1", label: sl.mild },
    { key: "2", label: sl.noticeable },
    { key: "3", label: sl.significant },
    { key: "4", label: sl.severe },
    { key: "5", label: sl.verySevere },
  ];
  const severityViewOptions = severityOptions.slice(1); // no "None" in view

  // Derive which areas have discomfort for view state
  const currentAreaSeverities = initAreaSeverities(painAreaSeverities, painAreas, painSeverity);
  const activeAreas = PAIN_AREA_KEYS.filter((k) => (currentAreaSeverities[k] ?? 0) > 0);

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader className="border-b border-[color:var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-[color:var(--primary)]" />
            <CardTitle>{messages.profile.sections.comfort}</CardTitle>
          </div>
          {!editing ? (
            <Button variant="primary-soft" size="sm" onClick={onStartEdit}>
              <Edit2 className="h-4 w-4" />
              {t.editButton}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing ? (
          <>
            <ComfortLevelBar score={score} />
            {activeAreas.length > 0 ? (
              <div className="space-y-4">
                {activeAreas.map((area) => {
                  const areaData =
                    messages.questionnaire.painAreas.areas[
                      area as keyof typeof messages.questionnaire.painAreas.areas
                    ];
                  const severity = currentAreaSeverities[area] ?? 0;
                  return (
                    <ReadOnlySlider
                      key={area}
                      label={areaData?.label ?? area}
                      options={severityViewOptions}
                      value={String(severity)}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">{t.noPain}</p>
            )}
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {t.impactDescription}
            </p>
            <Link
              href={withLocalePrefix("/profile/improve/comfort", locale)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {t.improveLink}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-[color:var(--muted-foreground)]">{t.editInstructions}</p>
            <div className="space-y-5">
              {PAIN_AREA_KEYS.map((area) => {
                const areaData =
                  messages.questionnaire.painAreas.areas[
                    area as keyof typeof messages.questionnaire.painAreas.areas
                  ];
                return (
                  <SliderQuestion
                    key={area}
                    label={areaData?.label ?? area}
                    options={severityOptions}
                    value={String(draftAreaSeverities[area] ?? 0)}
                    onChange={(v) =>
                      setDraftAreaSeverities((prev) => ({ ...prev, [area]: Number(v) }))
                    }
                  />
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                {messages.common.cancel}
              </Button>
              <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
                {t.saveButton}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
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
      <CardHeader className="border-b border-[color:var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[color:var(--primary)]" />
            <CardTitle>{messages.profile.sections.flexibility}</CardTitle>
          </div>
          {!editing ? (
            <Button variant="primary-soft" size="sm" onClick={onStartEdit}>
              <Edit2 className="h-4 w-4" />
              {messages.profile.flexibility.editButton}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing ? (
          <>
            <FlexibilityScale score={score} />
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {messages.profile.flexibility.impactDescription}
            </p>
            <Link href={withLocalePrefix("/profile/improve/flexibility", locale)} className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
              {messages.profile.flexibility.improveLink}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
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
      <CardHeader className="border-b border-[color:var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-[color:var(--primary)]" />
            <CardTitle>{messages.profile.sections.coreStability}</CardTitle>
          </div>
          {!editing ? (
            <Button variant="primary-soft" size="sm" onClick={onStartEdit}>
              <Edit2 className="h-4 w-4" />
              {messages.profile.coreStability.editButton}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing ? (
          <>
            <CoreStabilityBar score={score} />
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {messages.profile.coreStability.impactDescription}
            </p>
            <Link href={withLocalePrefix("/profile/improve/core-stability", locale)} className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
              {messages.profile.coreStability.improveLink}
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
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
      </CardContent>
    </Card>
  );
}

function ProfileSummary({
  profile,
  fullProfile,
  locale,
  fitHref,
  messages,
  displayName,
  profileImageSource,
  editingMeasurements,
  editingFlexibility,
  editingCoreStability,
  editingComfort,
  editingRidingStyle,
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
  onStartComfortEdit,
  onCancelComfortEdit,
  onSaveComfort,
  onStartRidingStyleEdit,
  onCancelRidingStyleEdit,
  onSaveRidingStyle,
}: {
  profile: ProfileData;
  fullProfile: import("../../../../convex/_generated/dataModel").Doc<"profiles">;
  locale: Locale;
  fitHref: string;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
  displayName: string;
  profileImageSource?: string;
  editingMeasurements: boolean;
  editingFlexibility: boolean;
  editingCoreStability: boolean;
  editingComfort: boolean;
  editingRidingStyle: boolean;
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
  onStartComfortEdit: () => void;
  onCancelComfortEdit: () => void;
  onSaveComfort: (painAreaSeverities: Record<string, number>) => Promise<void>;
  onStartRidingStyleEdit: () => void;
  onCancelRidingStyleEdit: () => void;
  onSaveRidingStyle: (data: RiderProfileData) => Promise<void>;
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

      <Card variant="bordered" className="overflow-hidden p-0">
          <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-primary to-primary/75 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
              <Image
                src="/profile-complete.png"
                alt=""
                width={64}
                height={64}
                className="h-14 w-14 flex-shrink-0 object-contain drop-shadow-lg"
                priority
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
                  {messages.profile.status.title}
                </p>
                <p className="text-sm font-semibold leading-snug text-primary-foreground">
                  {messages.profile.status.description.split(".")[0]}.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="w-full font-semibold shadow-md sm:w-auto sm:flex-shrink-0"
              {...linkButtonProps(fitHref)}
            >
              {messages.profile.status.startFitCta}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Card variant="bordered" className="dashboard-card-surface xl:row-span-2">
          <CardHeader className="border-b border-[color:var(--border)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-[color:var(--primary)]" />
                <CardTitle>{messages.profile.sections.bodyMeasurements}</CardTitle>
              </div>
              {!editingMeasurements ? (
                <Button variant="primary-soft" size="sm" onClick={onStartMeasurementsEdit}>
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
              locale={locale}
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

        <ComfortCard
          hasPain={fullProfile.hasPain}
          painSeverity={fullProfile.painSeverity}
          painAreas={fullProfile.painAreas}
          painAreaSeverities={fullProfile.painAreaSeverities}
          locale={locale}
          messages={messages}
          editing={editingComfort}
          onStartEdit={onStartComfortEdit}
          onCancel={onCancelComfortEdit}
          onSave={onSaveComfort}
        />

        <RidingStyleCard
          profile={fullProfile}
          messages={messages}
          editing={editingRidingStyle}
          onStartEdit={onStartRidingStyleEdit}
          onCancel={onCancelRidingStyleEdit}
          onSave={onSaveRidingStyle}
        />

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
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [pendingRefreshWeight, setPendingRefreshWeight] = useState<number | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingMeasurements, setEditingMeasurements] = useState(false);
  const [editingFlexibility, setEditingFlexibility] = useState(false);
  const [editingCoreStability, setEditingCoreStability] = useState(false);
  const [editingComfort, setEditingComfort] = useState(false);
  const [editingRidingStyle, setEditingRidingStyle] = useState(false);

  const profileData = useQuery(api.profiles.queries.getMyProfile);
  const recalculableBikeCount = useQuery(
    api.pressureCalculations.queries.getRecalculableBikeCount
  );
  const user = useQuery(api.users.queries.getCurrentUser);

  const upsertProfile = useMutation(api.profiles.mutations.upsert);
  const updateMeasurements = useMutation(api.profiles.mutations.updateMeasurements);
  const updateAssessment = useMutation(api.profiles.mutations.updateAssessment);
  const updateRiderProfile = useMutation(api.profiles.mutations.updateRiderProfile);
  const updateComfort = useMutation(api.profiles.mutations.updateComfort);
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

      const comfortFields = data.comfortScore != null
        ? comfortScoreToFields(data.comfortScore)
        : {};

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

  const handleSaveComfort = async (painAreaSeverities: Record<string, number>) => {
    const painAreas = Object.entries(painAreaSeverities)
      .filter(([, v]) => v > 0)
      .map(([k]) => k);
    const hasPain: "yes" | "no" = painAreas.length > 0 ? "yes" : "no";
    const maxSeverity = painAreas.length > 0
      ? Math.max(...painAreas.map((k) => painAreaSeverities[k]))
      : undefined;
    try {
      await updateComfort({ hasPain, painAreas, painSeverity: maxSeverity, painAreaSeverities });
      setEditingComfort(false);
      toast.success({ description: messages.common.toasts.profileSaved });
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "profile",
          action: "updateComfort",
          operationType: "mutation",
        }),
      });
    }
  };

  const handleSaveRidingStyle = async (data: RiderProfileData) => {
    try {
      await updateRiderProfile({
        ...data,
        // Pain fields are now owned by ComfortCard; preserve existing values
        hasPain: profileData?.hasPain ?? "no",
        painAreas: profileData?.painAreas ?? [],
        painSeverity: profileData?.painSeverity,
      });
      setEditingRidingStyle(false);
      toast.success({ description: messages.common.toasts.profileSaved });
    } catch (error) {
      toast.error({
        description: reportClientError(error, {
          area: "profile",
          action: "updateRiderProfile",
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
        fullProfile={profileData}
        locale={locale}
        fitHref={withLocalePrefix("/fit", locale)}
        messages={messages}
        onEditWizard={() => setIsEditing(true)}
        displayName={displayName}
        profileImageSource={profileImageSource}
        editingMeasurements={editingMeasurements}
        editingFlexibility={editingFlexibility}
        editingCoreStability={editingCoreStability}
        editingComfort={editingComfort}
        editingRidingStyle={editingRidingStyle}
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
        onStartComfortEdit={() => setEditingComfort(true)}
        onCancelComfortEdit={() => setEditingComfort(false)}
        onSaveComfort={handleSaveComfort}
        onStartRidingStyleEdit={() => setEditingRidingStyle(true)}
        onCancelRidingStyleEdit={() => setEditingRidingStyle(false)}
        onSaveRidingStyle={handleSaveRidingStyle}
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
