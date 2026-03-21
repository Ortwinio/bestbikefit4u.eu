"use client";

import { Controller, useFormContext } from "react-hook-form";
import { NumberInput } from "@/components/ui";
import { Info } from "lucide-react";

export function StepAdvancedMeasurements() {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-[color:var(--primary)]" />
          <div>
            <p className="font-medium text-[color:var(--foreground)]">
              Optional but recommended
            </p>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
              These measurements improve the accuracy of reach and handlebar
              recommendations. Skip if unsure, and we&apos;ll estimate based on your
              height.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Controller
            name="torsoLengthCm"
            render={({ field }) => (
              <NumberInput
                label="Torso Length (cm)"
                tooltip="Measure from the top of your inseam reference (book) to the sternal notch (base of throat) while upright (cm). Improves reach and drop accuracy."
                step={0.1}
                min={45}
                max={75}
                placeholder="58"
                value={
                  typeof field.value === "number" && !Number.isNaN(field.value)
                    ? field.value
                    : null
                }
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.torsoLengthCm?.message as string}
                helperText="Hip bone to top of shoulder"
                unit="cm"
              />
            )}
          />
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4 text-sm text-[color:var(--muted-foreground)]">
            <p className="mb-1 font-medium text-[color:var(--foreground)]">
              How to measure
            </p>
            <p>
              Sit upright. Measure from top of hip bone (iliac crest) to top of
              shoulder (acromion).
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Controller
            name="armLengthCm"
            render={({ field }) => (
              <NumberInput
                label="Arm Length (cm)"
                tooltip="Arm extended horizontally: measure from shoulder bone (acromion) to center of clenched fist (cm). Refines cockpit length."
                step={0.1}
                min={45}
                max={75}
                placeholder="62"
                value={
                  typeof field.value === "number" && !Number.isNaN(field.value)
                    ? field.value
                    : null
                }
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.armLengthCm?.message as string}
                helperText="Shoulder to wrist"
                unit="cm"
              />
            )}
          />
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4 text-sm text-[color:var(--muted-foreground)]">
            <p className="mb-1 font-medium text-[color:var(--foreground)]">
              How to measure
            </p>
            <p>
              Arm extended slightly forward. Measure from shoulder bone to wrist
              crease.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Controller
            name="shoulderWidthCm"
            render={({ field }) => (
              <NumberInput
                label="Shoulder Width (cm)"
                tooltip="Measure bony shoulder width (acromion to acromion) in cm. Used to recommend handlebar width."
                step={0.1}
                min={30}
                max={55}
                placeholder="42"
                value={
                  typeof field.value === "number" && !Number.isNaN(field.value)
                    ? field.value
                    : null
                }
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.shoulderWidthCm?.message as string}
                helperText="For handlebar width"
                unit="cm"
              />
            )}
          />
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4 text-sm text-[color:var(--muted-foreground)]">
            <p className="mb-1 font-medium text-[color:var(--foreground)]">
              How to measure
            </p>
            <p>
              Measure from back side, outer shoulder bone to outer shoulder bone.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Controller
            name="femurLengthCm"
            render={({ field }) => (
              <NumberInput
                label="Femur Length (cm)"
                tooltip="Seated with knee at 90 deg: measure from hip bone (greater trochanter) to center of kneecap (cm). Helps refine saddle setback."
                step={0.1}
                min={35}
                max={60}
                placeholder="45"
                value={
                  typeof field.value === "number" && !Number.isNaN(field.value)
                    ? field.value
                    : null
                }
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.femurLengthCm?.message as string}
                helperText="Hip joint to knee center"
                unit="cm"
              />
            )}
          />
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4 text-sm text-[color:var(--muted-foreground)]">
            <p className="mb-1 font-medium text-[color:var(--foreground)]">
              How to measure
            </p>
            <p>
              Measure from the hip joint (greater trochanter) to the center of
              the knee while standing naturally.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
        <h4 className="mb-3 font-medium text-[color:var(--foreground)]">
          How these improve your fit
        </h4>
        <div className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
          <p>
            <span className="font-medium text-[color:var(--foreground)]">
              Torso + Arm length:
            </span>{" "}
            Together, these determine your optimal handlebar reach and stem length.
          </p>
          <p>
            <span className="font-medium text-[color:var(--foreground)]">
              Shoulder width:
            </span>{" "}
            Used to calculate handlebar width for road, gravel, and MTB.
          </p>
          <p>
            <span className="font-medium text-[color:var(--foreground)]">
              Femur length:
            </span>{" "}
            Improves saddle setback and stability confidence scoring.
          </p>
        </div>
      </div>
    </div>
  );
}
