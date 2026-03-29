"use client";

import { Controller, useFormContext } from "react-hook-form";
import { NumberInput, InfoBox } from "@/components/ui";
import { Info, HelpCircle, Sparkles } from "lucide-react";

export function StepAdvancedMeasurements() {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <InfoBox
        variant="primary"
        icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          Optional — but worth it
        </p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          These measurements are not required, but each one refines a different part of your fit.
          Torso and arm length determine handlebar reach. Shoulder width influences
          handlebar width. Femur length fine-tunes saddle setback. The more you provide,
          the more personalised the recommendation.
        </p>
      </InfoBox>

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
          <InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
            <p className="font-medium text-[color:var(--foreground)]">How to measure torso length</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
              <li>Sit upright on a firm chair, back straight</li>
              <li>Measure from the seat surface to the bony bump at the base of your neck (C7 vertebra)</li>
              <li>Typical range: 45–75 cm</li>
            </ul>
            <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
              <span className="font-medium">Affects:</span> handlebar reach and stack
            </p>
          </InfoBox>
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
          <InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
            <p className="font-medium text-[color:var(--foreground)]">How to measure arm length</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
              <li>Stand with arm relaxed at your side</li>
              <li>Measure from the bony shoulder tip (acromion) to the middle finger tip</li>
              <li>Typical range: 45–75 cm</li>
            </ul>
            <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
              <span className="font-medium">Affects:</span> handlebar reach and stem length
            </p>
          </InfoBox>
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
          <InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
            <p className="font-medium text-[color:var(--foreground)]">How to measure shoulder width</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
              <li>Stand relaxed with arms at sides</li>
              <li>Measure between the outermost bony points of both shoulders (acromion to acromion)</li>
              <li>Typical range: 30–55 cm</li>
            </ul>
            <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
              <span className="font-medium">Affects:</span> handlebar width recommendation
            </p>
          </InfoBox>
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
          <InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
            <p className="font-medium text-[color:var(--foreground)]">How to measure femur length</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
              <li>Sit on a hard surface with your thigh horizontal</li>
              <li>Measure from the bony hip point (greater trochanter) to the outside of the knee</li>
              <li>Typical range: 35–60 cm</li>
            </ul>
            <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
              <span className="font-medium">Affects:</span> saddle setback and fore-aft position
            </p>
          </InfoBox>
        </div>
      </div>

      <InfoBox
        variant="primary"
        icon={<Sparkles className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">How advanced measurements improve your fit</p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          A basic fit uses height and inseam only. Adding torso and arm length lets us
          calculate reach precisely, rather than estimating it from height alone. Shoulder
          width gives a starting point for handlebar width. Femur length refines saddle
          setback. Each additional measurement reduces the range of uncertainty in the final numbers.
        </p>
      </InfoBox>
    </div>
  );
}
