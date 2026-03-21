"use client";

import { Controller, useFormContext } from "react-hook-form";
import { NumberInput } from "@/components/ui";
import { validateInseamRatio } from "@/lib/validations/profile";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { AlertCircle, Info } from "lucide-react";

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
      <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
        These two measurements are essential for calculating your bike fit.
        Accurate measurements lead to better recommendations.
      </p>

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
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)]" />
              <div className="space-y-1 text-sm text-[color:var(--muted-foreground)]">
                <p className="font-medium text-[color:var(--foreground)]">
                  How to measure
                </p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Stand barefoot against a wall</li>
                  <li>Place a book flat on your head</li>
                  <li>Mark the wall and measure from floor</li>
                </ul>
              </div>
            </div>
          </div>
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
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--primary)]" />
              <div className="space-y-1 text-sm text-[color:var(--muted-foreground)]">
                <p className="font-medium text-[color:var(--foreground)]">
                  How to measure
                </p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Stand barefoot against a wall</li>
                  <li>Place a book firmly between legs like a saddle</li>
                  <li>Measure from floor to top of book</li>
                </ul>
              </div>
            </div>
          </div>
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

      {ratioWarning ? (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-[color:var(--warning)]" />
            <div>
              <p className="font-medium text-[color:var(--warning)]">
                Measurement Check
              </p>
              <p className="mt-1 text-sm text-[color:var(--foreground)]">
                {ratioWarning}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
        <h4 className="mb-3 font-medium text-[color:var(--foreground)]">
          Why these measurements matter
        </h4>
        <div className="grid gap-4 text-sm text-[color:var(--muted-foreground)] sm:grid-cols-2">
          <div>
            <p className="font-medium text-[color:var(--foreground)]">Height</p>
            <p>Used for frame size estimation and reach calculations.</p>
          </div>
          <div>
            <p className="font-medium text-[color:var(--foreground)]">Inseam</p>
            <p>Primary driver for saddle height and crank length recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
