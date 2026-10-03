"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { AutosaveStatus, useAutosave } from "@/components/ui";
import { autosaveMessages } from "@/i18n/account/autosave";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import {
  advancedMeasurementsSchema, bodyMeasurementsSchema, coreStabilitySchema, flexibilitySchema,
} from "@/lib/validations/profile";
import { ProfileDirectFields, type ProfileDirectValues, type ProfileFieldGroup } from "./ProfileDirectFields";

function changedValues<Value extends object>(next: Value, previous: Partial<Value>): Partial<Value> {
  return Object.fromEntries(
    Object.entries(next).filter(([key, value]) => value !== previous[key as keyof Value]),
  ) as Partial<Value>;
}


export function ProfileAutosaveEditor({ profile, onWeightSaved, target, bodySummary, refinementsLocked = false }: {
  profile: Doc<"profiles">;
  onWeightSaved: (weight: number) => void;
  target?: string | null;
  bodySummary?: (values: ProfileDirectValues) => ReactNode;
  refinementsLocked?: boolean;
}) {
  const { locale } = useDashboardMessages();
  const copy = autosaveMessages[locale];
  const updateMeasurements = useMutation(api.profiles.mutations.updateMeasurements);
  const updateAssessment = useMutation(api.profiles.mutations.updateAssessment);
  const updateComfort = useMutation(api.profiles.mutations.updateComfort);
  const updateRider = useMutation(api.profiles.mutations.updatePreferences);
  const [values, setValues] = useState<ProfileDirectValues>(() => ({
    ...profile,
    painAreaSeverities: profile.painAreaSeverities ?? Object.fromEntries(
      (profile.painAreas ?? []).map((area) => [area, profile.painSeverity ?? 1]),
    ),
  }));
  const savedMeasurements = useRef(values);
  const savedExtra = useRef(values);
  const savedPreferences = useRef(values);
  const body = useAutosave({
    value: { heightCm: values.heightCm, inseamCm: values.inseamCm, weightKg: values.weightKg },
    debounceMs: 500,
    validate: (next) => {
      const patch = changedValues(next, savedMeasurements.current);
      return bodyMeasurementsSchema.partial().safeParse(patch).success
        && (patch.weightKg === undefined || (Number.isFinite(patch.weightKg)
          && patch.weightKg >= 30 && patch.weightKg <= 200)) ? null : copy.invalid;
    },
    onSave: async (next) => {
      const patch = changedValues(next, savedMeasurements.current);
      await updateMeasurements(patch);
      savedMeasurements.current = { ...savedMeasurements.current, ...next };
      if (patch.weightKg !== undefined) onWeightSaved(patch.weightKg);
    },
  });
  const extra = useAutosave({
    value: { torsoLengthCm: values.torsoLengthCm, armLengthCm: values.armLengthCm,
      shoulderWidthCm: values.shoulderWidthCm, femurLengthCm: values.femurLengthCm },
    debounceMs: 500,
    validate: (next) => advancedMeasurementsSchema.safeParse(changedValues(next, savedExtra.current)).success
      ? null : copy.invalid,
    onSave: async (next) => {
      await updateMeasurements(changedValues(next, savedExtra.current));
      savedExtra.current = { ...savedExtra.current, ...next };
    },
  });
  const assessment = useAutosave({
    value: { flexibilityScore: values.flexibilityScore, coreStabilityScore: values.coreStabilityScore },
    debounceMs: 500,
    validate: (next) => flexibilitySchema.safeParse(next).success && coreStabilitySchema.safeParse(next).success
      ? null : copy.invalid,
    onSave: async (next) => {
      await updateAssessment({
        ...flexibilitySchema.parse(next), ...coreStabilitySchema.parse(next),
      });
    },
  });
  const riding = useAutosave({
    value: {
      experienceLevel: values.experienceLevel, weeklyHours: values.weeklyHours,
      typicalRideLength: values.typicalRideLength, positionPriority: values.positionPriority,
    },
    debounceMs: 500,
    onSave: async (next) => {
      await updateRider(changedValues(next, savedPreferences.current));
      savedPreferences.current = { ...savedPreferences.current, ...next };
    },
  });
  const comfort = useAutosave({
    value: values.painAreaSeverities,
    debounceMs: 500,
    validate: (next) => Object.values(next).every((value) => Number.isInteger(value) && value >= 0 && value <= 5)
      ? null : copy.invalid,
    onSave: async (next) => {
      const painAreas = Object.keys(next).filter((area) => next[area] > 0);
      await updateComfort({
        hasPain: painAreas.length ? "yes" : "no",
        painAreas,
        painSeverity: painAreas.length ? Math.max(...painAreas.map((area) => next[area])) : undefined,
        painAreaSeverities: next,
      });
    },
  });
  useEffect(() => {
    if (!target) return;
    const group = target === "measurements" ? "body" : target;
    const heading = document.getElementById(`profile-${group}-title`);
    heading?.setAttribute("tabindex", "-1");
    heading?.focus();
    heading?.scrollIntoView?.({ block: "start" });
  }, [target]);
  const groups = { body, extra, flexibility: assessment, core: assessment, comfort, riding };
  const status = Object.fromEntries(Object.entries(groups).map(([group, autosave]) => [group,
    <AutosaveStatus key={group} {...autosave} messages={copy} onRetry={autosave.retry} />,
  ]));
  const commit = Object.fromEntries(Object.entries(groups).map(([group, autosave]) => [group, autosave.flush]));
  const change = (_group: ProfileFieldGroup, patch: Partial<ProfileDirectValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  };
  return <ProfileDirectFields values={values} onChange={change} status={status} commit={commit}
    bodySummary={bodySummary?.(values)} refinementsLocked={refinementsLocked} />;
}
