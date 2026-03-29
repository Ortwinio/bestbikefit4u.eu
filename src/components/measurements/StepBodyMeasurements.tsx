"use client";

import { Controller, useFormContext } from "react-hook-form";
import { InfoBox } from "@/components/ui";
import { validateInseamRatio } from "@/lib/validations/profile";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { AlertCircle, Info, Ruler, HelpCircle } from "lucide-react";
import { cn } from "@/utils/cn";

// Continuous numeric slider styled identically to SliderQuestion in RidingStyleCard
function NumberSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  error,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  error?: string;
}) {
  const hasValue = typeof value === "number" && !Number.isNaN(value);
  const fillPercent = hasValue ? ((value - min) / (max - min)) * 100 : 0;

  // Same fill-width formula as SliderQuestion (px-1 container = 4px each side = 8px total)
  const fillWidth = hasValue
    ? `calc(${fillPercent}% * (100% - 8px) / 100 + ${fillPercent > 0 ? "4px" : "0px"})`
    : "0px";

  // Thumb center aligns with fill end: left-1 offset + fillPercent of (100% - 8px)
  const thumbLeft = `calc(4px + ${fillPercent}% * (100% - 8px) / 100)`;

  return (
    <div className="space-y-2">
      {/* Label + current value badge */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hasValue && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {value} {unit}
          </span>
        )}
      </div>

      {/* Track area — same h-10, px-1 as SliderQuestion */}
      <div className="relative h-10">
        {/* Track background */}
        <div className="pointer-events-none absolute inset-x-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/15" />

        {/* Fill — same formula as SliderQuestion */}
        {hasValue && (
          <div
            className="pointer-events-none absolute left-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-150 ease-out"
            style={{ width: fillWidth }}
          />
        )}

        {/* Custom thumb — identical to SliderQuestion active dot */}
        {hasValue && (
          <div
            className="pointer-events-none absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-primary shadow-md transition-[left] duration-150 ease-out"
            style={{ left: thumbLeft }}
          />
        )}

        {/* Native range input (transparent overlay, handles all interaction) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hasValue ? value : min}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "absolute inset-0 w-full cursor-pointer opacity-0",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          )}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={hasValue ? value : undefined}
          aria-valuetext={hasValue ? `${value} ${unit}` : undefined}
        />
      </div>

      {/* Min / max labels */}
      <div className="flex justify-between px-1 text-xs text-muted-foreground">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function StepBodyMeasurements() {
  const {
    watch,
    formState: { errors },
  } = useFormContext();
  const { messages } = useDashboardMessages();

  const heightCm = watch("heightCm");
  const inseamCm = watch("inseamCm");

  const ratioWarning =
    heightCm && inseamCm ? validateInseamRatio(heightCm, inseamCm) : null;

  return (
    <div className="space-y-6">
      <InfoBox
        variant="primary"
        icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">Why we need your measurements</p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          Your height and inseam are the two most important inputs for a bike fit.
          Height sets the overall frame size and reach, while inseam is the primary driver
          for saddle height — the single most impactful adjustment for comfort and power.
          Without accurate measurements, every recommendation is just an estimate.
        </p>
      </InfoBox>

      {/* Height */}
      <div className="space-y-2">
        <Controller
          name="heightCm"
          render={({ field }) => (
            <NumberSlider
              label="Height"
              min={130}
              max={210}
              step={1}
              unit="cm"
              value={
                typeof field.value === "number" && !Number.isNaN(field.value)
                  ? field.value
                  : undefined
              }
              onChange={(v) => { field.onChange(v); field.onBlur(); }}
              error={errors.heightCm?.message as string}
            />
          )}
        />
        <InfoBox
          variant="secondary"
          icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}
        >
          <p className="font-medium text-[color:var(--foreground)]">How to measure your height</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
            <li>Stand barefoot against a wall</li>
            <li>Place a book flat on top of your head, touching the wall</li>
            <li>Mark the wall and measure from the floor to the mark</li>
          </ul>
        </InfoBox>
      </div>

      {/* Inseam */}
      <div className="space-y-2">
        <Controller
          name="inseamCm"
          render={({ field }) => (
            <NumberSlider
              label="Inseam"
              min={55}
              max={105}
              step={1}
              unit="cm"
              value={
                typeof field.value === "number" && !Number.isNaN(field.value)
                  ? field.value
                  : undefined
              }
              onChange={(v) => { field.onChange(v); field.onBlur(); }}
              error={errors.inseamCm?.message as string}
            />
          )}
        />
        <InfoBox
          variant="secondary"
          icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}
        >
          <p className="font-medium text-[color:var(--foreground)]">How to measure your inseam</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
            <li>Stand barefoot with feet 10–15 cm apart</li>
            <li>Press a hardcover book firmly up between your legs, simulating a saddle</li>
            <li>Measure from the floor to the top of the book spine</li>
          </ul>
        </InfoBox>
      </div>

      {/* Weight (optional) */}
      <div className="space-y-2">
        <Controller
          name="weightKg"
          render={({ field }) => (
            <NumberSlider
              label={`${messages.profile.measurements.weight} (optional)`}
              min={30}
              max={200}
              step={1}
              unit="kg"
              value={
                typeof field.value === "number" && !Number.isNaN(field.value)
                  ? field.value
                  : undefined
              }
              onChange={(v) => { field.onChange(v); field.onBlur(); }}
              error={errors.weightKg?.message as string}
            />
          )}
        />
        <p className="text-xs text-muted-foreground">{messages.profile.measurements.weightHelper}</p>
      </div>

      {ratioWarning && (
        <InfoBox
          variant="warning"
          icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}
        >
          <p className="font-medium">Measurement check</p>
          <p className="mt-1 text-[color:var(--muted-foreground)]">{ratioWarning}</p>
        </InfoBox>
      )}

      <InfoBox
        variant="primary"
        icon={<Ruler className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">How these measurements shape your fit</p>
        <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-[color:var(--foreground)]">Height</p>
            <p className="text-[color:var(--muted-foreground)]">
              Sets the overall frame size range and forms the baseline for reach,
              stack, and handlebar position calculations.
            </p>
          </div>
          <div>
            <p className="font-medium text-[color:var(--foreground)]">Inseam</p>
            <p className="text-[color:var(--muted-foreground)]">
              The primary driver for saddle height — the most critical fit variable.
              Also informs crank length and cleat position.
            </p>
          </div>
          <div>
            <p className="font-medium text-[color:var(--foreground)]">Weight (optional)</p>
            <p className="text-[color:var(--muted-foreground)]">
              Used to calculate BMI and refine tyre pressure recommendations.
              Does not affect saddle height or reach calculations.
            </p>
          </div>
        </div>
      </InfoBox>
    </div>
  );
}
