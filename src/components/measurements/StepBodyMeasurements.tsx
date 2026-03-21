"use client";

import { Controller, useFormContext } from "react-hook-form";
import { NumberInput } from "@/components/ui";
import { Field } from "@/components/ui/Field";
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
      <p className="text-gray-600">
        These two measurements are essential for calculating your bike fit.
        Accurate measurements lead to better recommendations.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Height */}
        <div>
          <Controller
            name="heightCm"
            render={({ field }) => (
              <NumberInput
                label="Height (cm)"
                tooltip="Stand barefoot against a wall. Measure floor to top of head (cm). Used for initial frame-size and reach estimates (typical 130-210 cm)."
                step={0.1}
                min={0}
                placeholder="175"
                value={typeof field.value === "number" && !Number.isNaN(field.value) ? field.value : null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.heightCm?.message as string}
                unit="cm"
              />
            )}
          />
          <Field.Root className="mt-2">
            <Field.Description className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <div>
                  <p className="font-medium">How to measure:</p>
                  <ul className="mt-1 list-disc list-inside text-blue-700">
                    <li>Stand barefoot against a wall</li>
                    <li>Place a book flat on your head</li>
                    <li>Mark the wall and measure from floor</li>
                  </ul>
                </div>
              </div>
            </Field.Description>
          </Field.Root>
        </div>

        {/* Inseam */}
        <div>
          <Controller
            name="inseamCm"
            render={({ field }) => (
              <NumberInput
                label="Inseam (cm)"
                tooltip="Barefoot inseam: feet 10-15 cm apart, press a book firmly into the crotch, measure floor to book top (cm). Primary input for saddle height (typical 55-105 cm)."
                step={0.1}
                min={0}
                placeholder="82"
                value={typeof field.value === "number" && !Number.isNaN(field.value) ? field.value : null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.inseamCm?.message as string}
                unit="cm"
              />
            )}
          />
          <Field.Root className="mt-2">
            <Field.Description className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <div>
                  <p className="font-medium">How to measure:</p>
                  <ul className="mt-1 list-disc list-inside text-blue-700">
                    <li>Stand barefoot against a wall</li>
                    <li>Place a book firmly between legs (like a saddle)</li>
                    <li>Measure from floor to top of book</li>
                  </ul>
                </div>
              </div>
            </Field.Description>
          </Field.Root>
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
              value={typeof field.value === "number" && !Number.isNaN(field.value) ? field.value : null}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.weightKg?.message as string}
              helperText={messages.profile.measurements.weightHelper}
              unit="kg"
            />
          )}
        />
      </div>

      {/* Ratio Warning */}
      {ratioWarning && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                Measurement Check
              </p>
              <p className="text-sm text-yellow-700 mt-1">{ratioWarning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Guide */}
      <Field.Root className="mt-6 rounded-lg bg-gray-50 p-4">
        <Field.Description>
          <h4 className="mb-3 font-medium text-gray-900">
            Why these measurements matter
          </h4>
          <div className="grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
            <div>
              <p className="font-medium text-gray-700">Height</p>
              <p>Used for frame size estimation and reach calculations.</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Inseam</p>
              <p>
                Primary driver for saddle height and crank length recommendations.
              </p>
            </div>
          </div>
        </Field.Description>
      </Field.Root>
    </div>
  );
}
