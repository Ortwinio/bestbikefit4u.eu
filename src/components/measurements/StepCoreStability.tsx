"use client";

import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { profileText } from "@/i18n/account/profileLanguage";

import { useFormContext, Controller, useWatch } from "react-hook-form";
import { InfoBox } from "@/components/ui";
import { CoreStabilityBar } from "@/components/profile/CoreStabilityBar";
import { SliderQuestion } from "@/components/profile/RidingStyleCard";
import { coreStabilityTests } from "@/lib/validations/profile";
import { HelpCircle, Timer, Dumbbell } from "lucide-react";


export function StepCoreStability() {
  const { locale } = useDashboardMessages();
  const coreOptions = coreStabilityTests.map((t) => ({
    key: String(t.score),
    label: profileText(locale, t.label),
  }));
  const { control } = useFormContext();
  const selectedScore = useWatch({ control, name: "coreStabilityScore" });

  return (
    <div className="space-y-6">

      {/* 1. Why this matters */}
      <InfoBox
        variant="primary"
        icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          {profileText(locale, "Why core stability determines your riding position")}
        </p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          {profileText(locale, "Your core muscles hold your torso steady on the bike. A weak core shifts weight onto the hands and shoulders, causing neck and wrist pain. A strong core lets you sustain a lower, more aerodynamic position for longer.")}
        </p>
      </InfoBox>

      {/* 2. Test instructions */}
      <InfoBox
        variant="secondary"
        icon={<Timer className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          {profileText(locale, "Front plank hold test — how to do it")}
        </p>
        <ol className="mt-1 list-inside list-decimal space-y-1 text-[color:var(--muted-foreground)]">
          <li>{profileText(locale, "Get into a front plank — forearms on the floor, toes on the floor")}</li>
          <li>{profileText(locale, "Keep a straight line from head through heels — no sagging hips")}</li>
          <li>{profileText(locale, "Start a timer and hold with perfect form")}</li>
          <li>{profileText(locale, "Stop when your form breaks down, then move the slider to your result")}</li>
        </ol>
      </InfoBox>

      {/* 3. Slider — same component as Riding Style card */}
      <Controller
        name="coreStabilityScore"
        control={control}
        render={({ field }) => (
          <SliderQuestion
            label={profileText(locale, "How long can you hold a plank with perfect form?")}
            options={coreOptions}
            value={field.value != null ? String(field.value) : null}
            onChange={(v) => field.onChange(Number(v))}
          />
        )}
      />

      {/* 4. Live CoreStabilityBar preview — same card as My Profile */}
      {selectedScore && (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">
            {profileText(locale, "Your core stability result")}
          </p>
          <CoreStabilityBar score={Number(selectedScore)} />
        </div>
      )}

      {/* 5. How this affects the fit */}
      <InfoBox
        variant="primary"
        icon={<Dumbbell className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          {profileText(locale, "How this shapes your bike fit")}
        </p>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-[color:var(--foreground)]">{profileText(locale, "Low stability (1–2)")}</p>
            <p className="text-[color:var(--muted-foreground)]">
              {profileText(locale, "We limit reach and handlebar drop to reduce shoulder and neck load.")}
            </p>
          </div>
          <div>
            <p className="font-medium text-[color:var(--foreground)]">{profileText(locale, "Good stability (4–5)")}</p>
            <p className="text-[color:var(--muted-foreground)]">
              {profileText(locale, "Greater reach and lower bars are viable without pain or fatigue.")}
            </p>
          </div>
        </div>
      </InfoBox>

    </div>
  );
}
