"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AutosaveField, Card, CardContent, CardHeader } from "@/components/ui";
import { NumberSlider } from "@/components/measurements/NumberSlider";
import { ProfileAssessmentSlider, ProfileChoiceQuestion } from "@/components/account/ProfileChoiceQuestion";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { profileText } from "@/i18n/account/profileLanguage";
import {
  profileAutosaveCopy, profileMeasurementInstructions, profileMeasurementWarning,
} from "@/i18n/account/profileAutosave";
import { flexibilityTests, coreStabilityTests } from "@/lib/validations/profile";
import type { RiderProfileData } from "./RidingStyleCard";

export type ProfileFieldGroup = "body" | "extra" | "flexibility" | "core" | "comfort" | "riding";

export type ProfileDirectValues = Partial<RiderProfileData> & {
  heightCm?: number;
  inseamCm?: number;
  weightKg?: number;
  torsoLengthCm?: number;
  armLengthCm?: number;
  shoulderWidthCm?: number;
  femurLengthCm?: number;
  flexibilityScore?: (typeof flexibilityTests)[number]["score"];
  coreStabilityScore?: number;
  painAreaSeverities: Record<string, number>;
};

type Props = {
  values: ProfileDirectValues;
  onChange: (group: ProfileFieldGroup, patch: Partial<ProfileDirectValues>) => void;
  status?: Partial<Record<ProfileFieldGroup, ReactNode>>;
  errors?: Partial<Record<keyof ProfileDirectValues, string>>;
  commit?: Partial<Record<ProfileFieldGroup, () => unknown>>;
  bodySummary?: ReactNode;
};

const bodyFields = [
  { key: "heightCm", label: "height", min: 130, max: 210, unit: "cm" },
  { key: "inseamCm", label: "inseam", min: 55, max: 105, unit: "cm" },
  { key: "weightKg", label: "weight", min: 30, max: 200, unit: "kg" },
] as const;
const extraFields = [
  { key: "torsoLengthCm", label: "torso", min: 45, max: 75, unit: "cm" },
  { key: "armLengthCm", label: "armLength", min: 45, max: 75, unit: "cm" },
  { key: "shoulderWidthCm", label: "shoulderWidth", min: 30, max: 55, unit: "cm" },
  { key: "femurLengthCm", label: "femurLength", min: 35, max: 60, unit: "cm" },
] as const;

export function ProfileDirectFields({ values, onChange, status = {}, errors = {}, commit = {}, bodySummary }: Props) {
  const { locale, messages } = useDashboardMessages();
  const copy = profileAutosaveCopy[locale];
  const profile = messages.profile;
  const questionnaire = messages.questionnaire;
  const severity = profile.comfort.severityLevels;
  const severityOptions = [severity.none, severity.mild, severity.noticeable,
    severity.significant, severity.severe, severity.verySevere]
    .map((label, index) => ({ key: String(index), label }));

  const section = (group: ProfileFieldGroup, title: string, children: ReactNode) => (
    <Card variant="bordered" className="min-w-0" key={group}>
      <CardHeader><h2 id={`profile-${group}-title`} className="font-display text-xl font-bold">
        {title}</h2></CardHeader>
      <CardContent className="space-y-5" aria-labelledby={`profile-${group}-title`}>
        <AutosaveField flush={commit[group] ?? (() => undefined)} commitOn="release" className="space-y-5">
          {children}
          {status[group]}
        </AutosaveField>
      </CardContent>
    </Card>
  );

  const measurements = (group: "body" | "extra") => (group === "body" ? bodyFields : extraFields).map((field) => (
    <div key={field.key} className="min-w-0 [&_[data-range-pct]]:whitespace-nowrap">
      <NumberSlider label={profile.measurements[field.label]}
        value={values[field.key]} min={field.min} max={field.max} unit={field.unit}
        error={errors[field.key]} onChange={(value) => onChange(group, { [field.key]: value })} />
      {field.key !== "weightKg" && <details className="mt-2 rounded-xl border border-border px-3">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm text-primary focus-visible:focus-ring">
          {profile.measurements.howToMeasure}
        </summary>
        <ul className="list-disc space-y-1 pb-3 pl-4 text-sm text-muted-foreground">
          {profileMeasurementInstructions[field.key].map((step) => <li key={step}>{profileText(locale, step)}</li>)}
        </ul>
      </details>}
    </div>
  ));

  const choices = <Field extends keyof RiderProfileData>(
    field: Field, label: string, options: { key: RiderProfileData[Field]; label: string }[],
  ) => (
    <div className="space-y-2">
      <ProfileChoiceQuestion label={label} value={values[field] ?? null} options={options}
        onChange={(value) => onChange("riding", { [field]: value })} />
      {errors[field] && <p role="alert" className="text-sm text-destructive-text">{errors[field]}</p>}
    </div>
  );

  return <div className="space-y-6">
    <p className="text-muted-foreground">{copy.guidance}</p>
    <div className="grid gap-6 lg:grid-cols-2">
      {section("body", profile.sections.bodyMeasurements, <>
        {measurements("body")}
        {values.heightCm && (["inseam", "weight"] as const).map((field) => {
          const value = field === "inseam" ? values.inseamCm : values.weightKg;
          const warning = value ? profileMeasurementWarning(locale, field, values.heightCm!, value) : null;
          return warning ? <p key={field} className="rounded-xl bg-warning-soft p-3 text-sm text-warning-text">
            {warning}</p> : null;
        })}
        {bodySummary}
        <Link className="inline-flex min-h-11 items-center text-primary underline"
          href={withLocalePrefix("/profile/improve/body-measurements", locale)}>{profile.measurements.improveLink}</Link>
      </>)}
      {section("extra", copy.extra, measurements("extra"))}
      {section("flexibility", profile.sections.flexibility, <>
        <ProfileAssessmentSlider label={profile.sections.flexibility} value={values.flexibilityScore ?? null}
          options={flexibilityTests.map((test) => ({ key: test.score, label: profileText(locale, test.label) }))}
          onChange={(value) => onChange("flexibility", {
            flexibilityScore: value as ProfileDirectValues["flexibilityScore"],
          })} />
        {errors.flexibilityScore && <p role="alert" className="text-sm text-destructive-text">
          {errors.flexibilityScore}</p>}
        <Link className="inline-flex min-h-11 items-center text-primary underline"
          href={withLocalePrefix("/profile/improve/flexibility", locale)}>{copy.flexibilityGuide}</Link>
      </>)}
      {section("core", profile.sections.coreStability, <>
        <ProfileAssessmentSlider label={profile.sections.coreStability}
          value={values.coreStabilityScore == null ? null : String(values.coreStabilityScore)}
          options={coreStabilityTests.map((test) => ({ key: String(test.score), label: profileText(locale, test.label) }))}
          onChange={(value) => onChange("core", { coreStabilityScore: Number(value) })} />
        {errors.coreStabilityScore && <p role="alert" className="text-sm text-destructive-text">
          {errors.coreStabilityScore}</p>}
        <Link className="inline-flex min-h-11 items-center text-primary underline"
          href={withLocalePrefix("/profile/improve/core-stability", locale)}>{copy.coreGuide}</Link>
      </>)}
    </div>
    {section("comfort", profile.sections.comfort, <div className="grid gap-6 lg:grid-cols-2">
      {Object.entries(questionnaire.painAreas.areas).map(([area, details]) => (
        <ProfileAssessmentSlider key={area} label={details.label} options={severityOptions}
          value={String(values.painAreaSeverities[area] ?? 0)}
          onChange={(value) => onChange("comfort", {
            painAreaSeverities: { ...values.painAreaSeverities, [area]: Number(value) },
          })} />
      ))}
      {errors.painAreaSeverities && <p role="alert" className="text-sm text-destructive-text">
        {errors.painAreaSeverities}</p>}
      <Link className="inline-flex min-h-11 items-center text-primary underline lg:col-span-2"
        href={withLocalePrefix("/profile/improve/comfort", locale)}>{profile.comfort.improveLink}</Link>
    </div>)}
    {section("riding", profile.ridingStyle.title, <div className="grid gap-6 lg:grid-cols-2">
      {choices("experienceLevel", questionnaire.experienceLevel.questionText,
        (["beginner", "intermediate", "advanced"] as const)
          .map((key) => ({ key, label: questionnaire.experienceLevel.levels[key].label })))}
      {choices("weeklyHours", questionnaire.weeklyHours.questionText,
        (["0-3", "3-6", "6-10", "10-15", "15+"] as const)
          .map((key) => ({ key, label: questionnaire.weeklyHours.options[key].label })))}
      {choices("typicalRideLength", questionnaire.rideDistance.questionText,
        (["short", "medium", "long", "ultra"] as const)
          .map((key) => ({ key, label: questionnaire.rideDistance.options[key].label })))}
      {choices("positionPriority", profile.ridingStyle.positionPriority,
        (["comfort", "balanced", "performance"] as const)
          .map((key) => ({ key, label: messages.fit.goals[key].label })))}
    </div>)}
  </div>;
}
