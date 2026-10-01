"use client";

import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { profileText } from "@/i18n/account/profileLanguage";

import { useFormContext, Controller, useWatch } from "react-hook-form";
import { InfoBox } from "@/components/ui";
import { FlexibilityScale } from "@/components/profile/FlexibilityScale";
import { SliderQuestion } from "@/components/profile/RidingStyleCard";
import { flexibilityTests } from "@/lib/validations/profile";
import { HelpCircle, Info, Activity } from "lucide-react";


export function StepFlexibility() {
  const { locale } = useDashboardMessages();
  const flexibilityOptions = flexibilityTests.map((t) => ({
    key: t.score,
    label: profileText(locale, t.label),
  }));
  const { control } = useFormContext();
  const selectedScore = useWatch({ control, name: "flexibilityScore" });

  return (
    <div className="space-y-6">

      {/* 1. Why this matters */}
      <InfoBox
        variant="primary"
        icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          {profileText(locale, "Why flexibility matters for your bike fit")}
        </p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          {profileText(locale, "Hip flexor and hamstring flexibility directly determines how far forward and how low you can comfortably ride. A rider with limited flexibility needs a more upright, relaxed position — more handlebar height and less reach. A flexible rider can sustain a lower, more aerodynamic position without back or hip strain.")}
        </p>
      </InfoBox>

      {/* 2. Test instructions */}
      <InfoBox
        variant="secondary"
        icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          {profileText(locale, "Hamstring flexibility test — how to do it")}
        </p>
        <ol className="mt-1 list-inside list-decimal space-y-1 text-[color:var(--muted-foreground)]">
          <li>{profileText(locale, "Sit on the floor with both legs straight out in front of you")}</li>
          <li>{profileText(locale, "Keep your knees flat — do not bend them")}</li>
          <li>{profileText(locale, "Sit up tall, then slowly reach forward toward your toes")}</li>
          <li>{profileText(locale, "Note how far you can comfortably reach without forcing")}</li>
          <li>{profileText(locale, "Move the slider to the result that best matches")}</li>
        </ol>
      </InfoBox>

      {/* 3. Slider — same component as Riding Style card */}
      <Controller
        name="flexibilityScore"
        control={control}
        render={({ field }) => (
          <SliderQuestion
            label={profileText(locale, "How far can you reach?")}
            options={flexibilityOptions}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v)}
          />
        )}
      />

      {/* 4. Live FlexibilityScale preview — same card as My Profile */}
      {selectedScore && (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">
            {profileText(locale, "Your flexibility result")}
          </p>
          <FlexibilityScale score={selectedScore} />
        </div>
      )}

      {/* 5. How this affects the fit */}
      <InfoBox
        variant="primary"
        icon={<Activity className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          {profileText(locale, "How this shapes your bike fit")}
        </p>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-[color:var(--foreground)]">{profileText(locale, "Low flexibility")}</p>
            <p className="text-[color:var(--muted-foreground)]">
              {profileText(locale, "More upright position, higher handlebars, shorter reach. Protects lower back and hip flexors on longer rides.")}
            </p>
          </div>
          <div>
            <p className="font-medium text-[color:var(--foreground)]">{profileText(locale, "High flexibility")}</p>
            <p className="text-[color:var(--muted-foreground)]">
              {profileText(locale, "Lower, more aggressive position possible. More handlebar drop and longer reach for aerodynamics and power.")}
            </p>
          </div>
        </div>
      </InfoBox>

    </div>
  );
}
