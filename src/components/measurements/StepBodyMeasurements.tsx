"use client";

import { Controller, useFormContext } from "react-hook-form";
import { NumberInput, InfoBox } from "@/components/ui";
import { validateInseamRatio } from "@/lib/validations/profile";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { AlertCircle, Info, Ruler, HelpCircle } from "lucide-react";

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

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Controller
            name="heightCm"
            render={({ field }) => (
              <NumberInput
                label="Height (cm)"
                tooltip="Stand barefoot against a wall. Measure floor to top of head (cm). Used for initial frame-size and reach estimates (typical 130-210 cm)."
                step={0.1}
                min={130}
                max={210}
                placeholder="175"
                value={
                  typeof field.value === "number" && !Number.isNaN(field.value)
                    ? field.value
                    : null
                }
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.heightCm?.message as string}
                unit="cm"
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

        <div className="space-y-2">
          <Controller
            name="inseamCm"
            render={({ field }) => (
              <NumberInput
                label="Inseam (cm)"
                tooltip="Barefoot inseam: feet 10-15 cm apart, press a book firmly into the crotch, measure floor to book top (cm). Primary input for saddle height (typical 55-105 cm)."
                step={0.1}
                min={55}
                max={105}
                placeholder="82"
                value={
                  typeof field.value === "number" && !Number.isNaN(field.value)
                    ? field.value
                    : null
                }
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.inseamCm?.message as string}
                unit="cm"
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
      </div>

      <div className="max-w-sm">
        <Controller
          name="weightKg"
          render={({ field }) => (
            <NumberInput
              label={messages.profile.measurements.weight}
              step={0.5}
              min={30}
              max={200}
              placeholder="75"
              value={
                typeof field.value === "number" && !Number.isNaN(field.value)
                  ? field.value
                  : null
              }
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.weightKg?.message as string}
              helperText={messages.profile.measurements.weightHelper}
              unit="kg"
            />
          )}
        />
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
