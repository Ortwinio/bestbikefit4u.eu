"use client";

import { useRef, useEffect, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { InfoBox } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { AlertCircle, Info, Ruler, HelpCircle } from "lucide-react";
import { cn } from "@/utils/cn";

// Predicted values based on height
function predictedInseam(heightCm: number) {
  return Math.round(heightCm * 0.47); // ~47% of height is average inseam for cyclists
}

function predictedWeight(heightCm: number) {
  return Math.round(22 * Math.pow(heightCm / 100, 2)); // BMI 22 midpoint
}

function deviation(actual: number, predicted: number) {
  return Math.abs(actual - predicted) / predicted;
}

// Continuous numeric slider — same visual style as SliderQuestion in RidingStyleCard
function NumberSlider({
  label,
  value,
  onChange,
  onUserInteract,
  min,
  max,
  step = 1,
  unit,
  error,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  onUserInteract?: () => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  error?: string;
}) {
  const hasValue = typeof value === "number" && !Number.isNaN(value);
  // Unitless 0–1 fraction — valid multiplier in CSS calc()
  const pct = hasValue ? (value - min) / (max - min) : 0;

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

      {/* Track area: 12px inset each side so thumb stays inside bounds */}
      <div className="relative h-10">
        {/* Track background */}
        <div className="pointer-events-none absolute inset-x-3 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/15" />

        {/* Fill — width: unitless_fraction * (100% - 24px), valid CSS calc */}
        {hasValue && (
          <div
            className="pointer-events-none absolute left-3 top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary"
            style={{ width: `calc(${pct} * (100% - 24px))` }}
          />
        )}

        {/* Custom thumb — same style as SliderQuestion active dot */}
        {hasValue && (
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 size-6",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-full border-4 border-background bg-primary shadow-md"
            )}
            style={{ left: `calc(12px + ${pct} * (100% - 24px))` }}
          />
        )}

        {/* Native range input — transparent, covers full area, handles all interaction */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hasValue ? value : min}
          onMouseDown={onUserInteract}
          onTouchStart={onUserInteract}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
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
    setValue,
    formState: { errors },
  } = useFormContext();
  const { messages } = useDashboardMessages();

  const heightCm = watch("heightCm") as number | undefined;
  const inseamCm = watch("inseamCm") as number | undefined;
  const weightKg = watch("weightKg") as number | undefined;

  // Track whether the user has manually moved inseam/weight sliders
  const userEditedInseam = useRef(false);
  const userEditedWeight = useRef(false);

  // When height changes, auto-update inseam and weight if not yet manually set
  useEffect(() => {
    if (!heightCm) return;
    if (!userEditedInseam.current) {
      setValue("inseamCm", predictedInseam(heightCm), { shouldValidate: true });
    }
    if (!userEditedWeight.current) {
      setValue("weightKg", predictedWeight(heightCm), { shouldValidate: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heightCm]);

  // Warnings: show when value deviates >20% from expected for the given height
  const inseamWarning = useMemo(() => {
    if (!heightCm || !inseamCm) return null;
    const pred = predictedInseam(heightCm);
    if (deviation(inseamCm, pred) > 0.2) {
      const dir = inseamCm > pred ? "longer" : "shorter";
      return `Your inseam (${inseamCm} cm) is more than 20% ${dir} than expected for your height. Expected around ${pred} cm — please double-check your measurement.`;
    }
    return null;
  }, [heightCm, inseamCm]);

  const weightWarning = useMemo(() => {
    if (!heightCm || !weightKg) return null;
    const pred = predictedWeight(heightCm);
    if (deviation(weightKg, pred) > 0.2) {
      const dir = weightKg > pred ? "heavier" : "lighter";
      return `Your weight (${weightKg} kg) is more than 20% ${dir} than expected for your height. Expected around ${pred} kg — please verify the value is correct.`;
    }
    return null;
  }, [heightCm, weightKg]);

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
              onChange={(v) => {
                field.onChange(v);
                field.onBlur();
              }}
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
              onChange={(v) => {
                field.onChange(v);
                field.onBlur();
              }}
              onUserInteract={() => {
                userEditedInseam.current = true;
              }}
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
        {inseamWarning && (
          <InfoBox
            variant="warning"
            icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}
          >
            <p className="font-medium">Check your inseam</p>
            <p className="mt-1 text-[color:var(--muted-foreground)]">{inseamWarning}</p>
          </InfoBox>
        )}
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
              onChange={(v) => {
                field.onChange(v);
                field.onBlur();
              }}
              onUserInteract={() => {
                userEditedWeight.current = true;
              }}
              error={errors.weightKg?.message as string}
            />
          )}
        />
        <p className="text-xs text-muted-foreground">{messages.profile.measurements.weightHelper}</p>
        {weightWarning && (
          <InfoBox
            variant="warning"
            icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}
          >
            <p className="font-medium">Check your weight</p>
            <p className="mt-1 text-[color:var(--muted-foreground)]">{weightWarning}</p>
          </InfoBox>
        )}
      </div>

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
