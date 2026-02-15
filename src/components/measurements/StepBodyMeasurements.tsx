"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui";
import { validateInseamRatio } from "@/lib/validations/profile";
import { AlertCircle, Info } from "lucide-react";

export function StepBodyMeasurements() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

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
          <Input
            label="Height (cm)"
            tooltip="Stand barefoot against a wall. Measure floor to top of head (cm). Used for initial frame-size and reach estimates (typical 130-210 cm)."
            type="number"
            step="0.1"
            placeholder="175"
            {...register("heightCm", { valueAsNumber: true })}
            error={errors.heightCm?.message as string}
          />
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">How to measure:</p>
                <ul className="mt-1 list-disc list-inside text-blue-700">
                  <li>Stand barefoot against a wall</li>
                  <li>Place a book flat on your head</li>
                  <li>Mark the wall and measure from floor</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Inseam */}
        <div>
          <Input
            label="Inseam (cm)"
            tooltip="Barefoot inseam: feet 10-15 cm apart, press a book firmly into the crotch, measure floor to book top (cm). Primary input for saddle height (typical 55-105 cm)."
            type="number"
            step="0.1"
            placeholder="82"
            {...register("inseamCm", { valueAsNumber: true })}
            error={errors.inseamCm?.message as string}
          />
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">How to measure:</p>
                <ul className="mt-1 list-disc list-inside text-blue-700">
                  <li>Stand barefoot against a wall</li>
                  <li>Place a book firmly between legs (like a saddle)</li>
                  <li>Measure from floor to top of book</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">
          Why these measurements matter
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 text-sm text-gray-600">
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
      </div>
    </div>
  );
}
