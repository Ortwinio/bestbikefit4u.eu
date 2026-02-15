"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui";
import { Info } from "lucide-react";

export function StepAdvancedMeasurements() {
  const {
    register,
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
          <Input
            label="Torso Length (cm)"
            tooltip="Measure from the top of your inseam reference (book) to the sternal notch (base of throat) while upright (cm). Improves reach and drop accuracy."
            type="number"
            step="0.1"
            placeholder="58"
            {...register("torsoLengthCm", { valueAsNumber: true })}
            error={errors.torsoLengthCm?.message as string}
            helperText="Hip bone to top of shoulder"
          />
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">How to measure:</p>
            <p>
              Sit upright. Measure from top of hip bone (iliac crest) to top of
              shoulder (acromion).
            </p>
          </div>
        </div>

        {/* Arm Length */}
        <div>
          <Input
            label="Arm Length (cm)"
            tooltip="Arm extended horizontally: measure from shoulder bone (acromion) to center of clenched fist (cm). Refines cockpit length."
            type="number"
            step="0.1"
            placeholder="62"
            {...register("armLengthCm", { valueAsNumber: true })}
            error={errors.armLengthCm?.message as string}
            helperText="Shoulder to wrist"
          />
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">How to measure:</p>
            <p>
              Arm extended slightly forward. Measure from shoulder bone to wrist
              crease.
            </p>
          </div>
        </div>

        {/* Shoulder Width */}
        <div>
          <Input
            label="Shoulder Width (cm)"
            tooltip="Measure bony shoulder width (acromion to acromion) in cm. Used to recommend handlebar width."
            type="number"
            step="0.1"
            placeholder="42"
            {...register("shoulderWidthCm", { valueAsNumber: true })}
            error={errors.shoulderWidthCm?.message as string}
            helperText="For handlebar width"
          />
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">How to measure:</p>
            <p>
              Measure from back side, outer shoulder bone to outer shoulder bone.
            </p>
          </div>
        </div>

        {/* Femur Length */}
        <div>
          <Input
            label="Femur Length (cm)"
            tooltip="Seated with knee at 90 deg: measure from hip bone (greater trochanter) to center of kneecap (cm). Helps refine saddle setback."
            type="number"
            step="0.1"
            placeholder="45"
            {...register("femurLengthCm", { valueAsNumber: true })}
            error={errors.femurLengthCm?.message as string}
            helperText="Hip joint to knee center"
          />
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">How to measure:</p>
            <p>
              Measure from the hip joint (greater trochanter) to the center of
              the knee while standing naturally.
            </p>
          </div>
        </div>
      </div>

      {/* Impact explanation */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">
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
      </div>
    </div>
  );
}
