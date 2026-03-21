"use client";

import { Controller, useFormContext } from "react-hook-form";
import { NumberInput } from "@/components/ui";
import { Field } from "@/components/ui/Field";
import { Info } from "lucide-react";

export function StepAdvancedMeasurements() {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Optional but recommended</p>
            <p className="text-sm text-blue-700 mt-1">
              These measurements improve the accuracy of reach and handlebar
              recommendations. Skip if unsure—we&apos;ll estimate based on your
              height.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Torso Length */}
        <div>
          <Controller
            name="torsoLengthCm"
            render={({ field }) => (
              <NumberInput
                label="Torso Length (cm)"
                tooltip="Measure from the top of your inseam reference (book) to the sternal notch (base of throat) while upright (cm). Improves reach and drop accuracy."
                step={0.1}
                min={0}
                placeholder="58"
                value={typeof field.value === "number" && !Number.isNaN(field.value) ? field.value : null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.torsoLengthCm?.message as string}
                helperText="Hip bone to top of shoulder"
                unit="cm"
              />
            )}
          />
          <Field.Root className="mt-2">
            <Field.Description className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">How to measure:</p>
              <p>
                Sit upright. Measure from top of hip bone (iliac crest) to top of
                shoulder (acromion).
              </p>
            </Field.Description>
          </Field.Root>
        </div>

        {/* Arm Length */}
        <div>
          <Controller
            name="armLengthCm"
            render={({ field }) => (
              <NumberInput
                label="Arm Length (cm)"
                tooltip="Arm extended horizontally: measure from shoulder bone (acromion) to center of clenched fist (cm). Refines cockpit length."
                step={0.1}
                min={0}
                placeholder="62"
                value={typeof field.value === "number" && !Number.isNaN(field.value) ? field.value : null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.armLengthCm?.message as string}
                helperText="Shoulder to wrist"
                unit="cm"
              />
            )}
          />
          <Field.Root className="mt-2">
            <Field.Description className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">How to measure:</p>
              <p>
                Arm extended slightly forward. Measure from shoulder bone to wrist
                crease.
              </p>
            </Field.Description>
          </Field.Root>
        </div>

        {/* Shoulder Width */}
        <div>
          <Controller
            name="shoulderWidthCm"
            render={({ field }) => (
              <NumberInput
                label="Shoulder Width (cm)"
                tooltip="Measure bony shoulder width (acromion to acromion) in cm. Used to recommend handlebar width."
                step={0.1}
                min={0}
                placeholder="42"
                value={typeof field.value === "number" && !Number.isNaN(field.value) ? field.value : null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.shoulderWidthCm?.message as string}
                helperText="For handlebar width"
                unit="cm"
              />
            )}
          />
          <Field.Root className="mt-2">
            <Field.Description className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">How to measure:</p>
              <p>
                Measure from back side, outer shoulder bone to outer shoulder bone.
              </p>
            </Field.Description>
          </Field.Root>
        </div>

        {/* Femur Length */}
        <div>
          <Controller
            name="femurLengthCm"
            render={({ field }) => (
              <NumberInput
                label="Femur Length (cm)"
                tooltip="Seated with knee at 90 deg: measure from hip bone (greater trochanter) to center of kneecap (cm). Helps refine saddle setback."
                step={0.1}
                min={0}
                placeholder="45"
                value={typeof field.value === "number" && !Number.isNaN(field.value) ? field.value : null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.femurLengthCm?.message as string}
                helperText="Hip joint to knee center"
                unit="cm"
              />
            )}
          />
          <Field.Root className="mt-2">
            <Field.Description className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">How to measure:</p>
              <p>
                Measure from the hip joint (greater trochanter) to the center of
                the knee while standing naturally.
              </p>
            </Field.Description>
          </Field.Root>
        </div>
      </div>

      {/* Impact explanation */}
      <Field.Root className="mt-6 rounded-lg bg-gray-50 p-4">
        <Field.Description>
          <h4 className="mb-3 font-medium text-gray-900">
            How these improve your fit
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-700">Torso + Arm length:</span>{" "}
              Together, these determine your optimal handlebar reach and stem length.
            </p>
            <p>
              <span className="font-medium text-gray-700">Shoulder width:</span>{" "}
              Used to calculate handlebar width for road, gravel, and MTB.
            </p>
            <p>
              <span className="font-medium text-gray-700">Femur length:</span>{" "}
              Improves saddle setback and stability confidence scoring.
            </p>
          </div>
        </Field.Description>
      </Field.Root>
    </div>
  );
}
