"use client";

import { profileText } from "@/i18n/account/profileLanguage";

import { useFormContext, Controller } from "react-hook-form";
import { InfoBox } from "@/components/ui";
import { ProfileChoiceQuestion as SliderQuestion } from "@/components/account/ProfileChoiceQuestion";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { HelpCircle, Bike } from "lucide-react";
import type { WizardFormData } from "@/lib/validations/measurementWizard";

const EXPERIENCE_KEYS = ["beginner", "intermediate", "advanced"] as const;
const WEEKLY_HOURS_KEYS = ["0-3", "3-6", "6-10", "10-15", "15+"] as const;
const RIDE_DISTANCE_KEYS = ["short", "medium", "long", "ultra"] as const;
const POSITION_KEYS = ["comfort", "balanced", "performance"] as const;

export function StepRidingStyle() {
  const { control, formState: { errors } } = useFormContext<WizardFormData>();
  const hasMissingAnswers = Boolean(
    errors.experienceLevel || errors.weeklyHours || errors.typicalRideLength || errors.positionPriority
  );
  const { locale, messages } = useDashboardMessages();
  const tQ = messages.questionnaire;
  const tP = messages.profile.ridingStyle;

  const experienceOptions = EXPERIENCE_KEYS.map((k) => ({
    key: k,
    label: tQ.experienceLevel.levels[k].label,
  }));
  const weeklyHoursOptions = WEEKLY_HOURS_KEYS.map((k) => ({
    key: k,
    label: tQ.weeklyHours.options[k].label,
  }));
  const rideDistanceOptions = RIDE_DISTANCE_KEYS.map((k) => ({
    key: k,
    label: tQ.rideDistance.options[k].label,
  }));
  const positionOptions = POSITION_KEYS.map((k) => ({
    key: k,
    label: messages.fit.goals[k].label,
  }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {locale === "nl"
          ? "Beantwoord alle vier de vragen om je rijdersprofiel te voltooien."
          : "Answer all four questions to complete your rider profile."}
      </p>

      {hasMissingAnswers && (
        <p role="alert" className="rounded-lg bg-destructive-soft p-3 text-sm text-destructive-text">
          {locale === "nl"
            ? "Beantwoord alle vier de vragen over je rijstijl voordat je je profiel opslaat."
            : "Please answer all four riding-style questions before saving your profile."}
        </p>
      )}

      {/* 1. Why this matters */}
      <InfoBox
        variant="primary"
        icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          {profileText(locale, "Why your riding style shapes your fit")}
        </p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          {profileText(locale, "Your experience, training volume, typical ride length, and position goals all influence how aggressive or upright your fit should be. A casual rider doing 30 km twice a week needs a fundamentally different position to a trained rider logging 150 km endurance rides.")}
        </p>
      </InfoBox>

      {/* 2. Experience level */}
      <Controller
        name="experienceLevel"
        control={control}
        render={({ field }) => (
          <SliderQuestion
            label={tQ.experienceLevel.questionText}
            options={experienceOptions}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v)}
          />
        )}
      />

      {/* 3. Weekly hours */}
      <Controller
        name="weeklyHours"
        control={control}
        render={({ field }) => (
          <SliderQuestion
            label={tQ.weeklyHours.questionText}
            options={weeklyHoursOptions}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v)}
          />
        )}
      />

      {/* 4. Typical ride distance */}
      <Controller
        name="typicalRideLength"
        control={control}
        render={({ field }) => (
          <SliderQuestion
            label={tQ.rideDistance.questionText}
            options={rideDistanceOptions}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v)}
          />
        )}
      />

      {/* 5. Position priority */}
      <Controller
        name="positionPriority"
        control={control}
        render={({ field }) => (
          <SliderQuestion
            label={tP.positionPriorityQuestion}
            options={positionOptions}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v)}
          />
        )}
      />

      {/* 6. How this affects the fit */}
      <InfoBox
        variant="primary"
        icon={<Bike className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          {profileText(locale, "How riding style shapes your fit")}
        </p>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-[color:var(--foreground)]">{profileText(locale, "Beginner / low volume")}</p>
            <p className="text-[color:var(--muted-foreground)]">
              {profileText(locale, "More upright position, higher bars, shorter reach. Prioritises comfort and ease of use over aerodynamics.")}
            </p>
          </div>
          <div>
            <p className="font-medium text-[color:var(--foreground)]">{profileText(locale, "Advanced / high volume")}</p>
            <p className="text-[color:var(--muted-foreground)]">
              {profileText(locale, "Lower, more aerodynamic position with greater reach. Your body is conditioned to sustain the load over long distances.")}
            </p>
          </div>
        </div>
      </InfoBox>

    </div>
  );
}
