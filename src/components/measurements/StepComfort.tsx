"use client";

import { useFormContext, Controller, useWatch } from "react-hook-form";
import { InfoBox } from "@/components/ui";
import { ComfortLevelBar } from "@/components/profile/ComfortLevelBar";
import { SliderQuestion } from "@/components/profile/RidingStyleCard";
import { comfortLevels } from "@/lib/validations/profile";
import { HelpCircle, Heart, Activity } from "lucide-react";

// Comfort levels: score 1 (Severe) → 5 (Comfortable), shown left to right
const comfortOptions = comfortLevels.map((l) => ({
  key: String(l.score),
  label: l.label,
}));

export function StepComfort() {
  const { control } = useFormContext();
  const selectedScore = useWatch({ control, name: "comfortScore" });

  return (
    <div className="space-y-6">

      {/* 1. Why this matters */}
      <InfoBox
        variant="primary"
        icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          Why comfort affects your bike fit
        </p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          Pain and discomfort while riding is one of the most common reasons riders
          need a bike fit. Knowing where you currently sit on the comfort scale helps
          us prioritise what to fix — whether that&apos;s saddle height, reach, or handlebar
          height — and avoid making an already painful position worse.
        </p>
      </InfoBox>

      {/* 2. How to assess */}
      <InfoBox
        variant="secondary"
        icon={<Heart className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          How to rate your comfort
        </p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          Think about your most recent rides. How does your body feel during and after
          cycling? Move the slider to the level that best describes your typical
          experience — not your worst day, not your best, but your average.
        </p>
      </InfoBox>

      {/* 3. Slider — same component as Riding Style card */}
      <Controller
        name="comfortScore"
        control={control}
        render={({ field }) => (
          <SliderQuestion
            label="How comfortable are you on your current bike?"
            options={comfortOptions}
            value={field.value != null ? String(field.value) : null}
            onChange={(v) => field.onChange(Number(v))}
          />
        )}
      />

      {/* 4. Live ComfortLevelBar preview — same card as My Profile */}
      {selectedScore && (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">
            Your comfort level
          </p>
          <ComfortLevelBar score={Number(selectedScore)} />
        </div>
      )}

      {/* 5. How this affects the fit */}
      <InfoBox
        variant="primary"
        icon={<Activity className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          How comfort shapes your bike fit
        </p>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-[color:var(--foreground)]">Discomfort or pain</p>
            <p className="text-[color:var(--muted-foreground)]">
              The fit focuses on removing the source of pain first — raising bars,
              reducing reach, or adjusting saddle height before chasing performance.
            </p>
          </div>
          <div>
            <p className="font-medium text-[color:var(--foreground)]">Comfortable</p>
            <p className="text-[color:var(--muted-foreground)]">
              With no pain to fix, the fit can optimise for efficiency and power
              within the limits of your flexibility and core stability.
            </p>
          </div>
        </div>
      </InfoBox>

    </div>
  );
}
