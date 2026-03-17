"use client";

import { useMemo, useState } from "react";
import { calculateBasicPressure, type PressureOutput, type RidingGoal, type Surface, type ValidationError, validatePressureInput } from "@/lib/pressure-engine";
import { PressureResultCard } from "./PressureResultCard";
import type { PressureResultLabels } from "./shared";

interface PressureCalculatorFormProps {
  defaultDiscipline?: "road" | "gravel" | "mtb";
  labels: {
    disciplineLabel: string;
    disciplineRoad: string;
    disciplineGravel: string;
    disciplineMtb: string;
    bodyWeightLabel: string;
    widthFrontLabel: string;
    widthRearLabel: string;
    tubeTypeLabel: string;
    tubeTypeInnerTube: string;
    tubeTypeLatex: string;
    tubeTypeTubeless: string;
    surfaceLabel: string;
    surfaceSmoothAsphalt: string;
    surfaceAverageAsphalt: string;
    surfaceRoughAsphalt: string;
    surfaceHardpackGravel: string;
    surfaceLooseGravel: string;
    surfaceTrail: string;
    ridingGoalLabel: string;
    ridingGoalSpeed: string;
    ridingGoalBalance: string;
    ridingGoalComfort: string;
    bikeWeightLabel: string;
    advancedOptions: string;
    resultPlaceholder: string;
  };
  resultLabels: PressureResultLabels;
}

const SURFACE_OPTIONS: Surface[] = [
  "smooth_asphalt",
  "average_asphalt",
  "rough_asphalt",
  "hardpack_gravel",
  "loose_gravel",
  "trail",
];

const GOAL_OPTIONS: RidingGoal[] = ["speed", "balance", "comfort"];
const TUBE_OPTIONS = ["inner_tube", "latex_tube", "tubeless"] as const;

function findError(errors: ValidationError[], field: string): string | undefined {
  return errors.find((error) => error.field === field)?.message;
}

export function PressureCalculatorForm({
  defaultDiscipline,
  labels,
  resultLabels,
}: PressureCalculatorFormProps) {
  const [discipline, setDiscipline] = useState<"road" | "gravel" | "mtb">(
    defaultDiscipline ?? "road"
  );
  const [bodyWeightKg, setBodyWeightKg] = useState<number>(75);
  const [widthFrontMm, setWidthFrontMm] = useState<number>(28);
  const [manualWidthRearMm, setManualWidthRearMm] = useState<number>(28);
  const [tubeType, setTubeType] = useState<"inner_tube" | "latex_tube" | "tubeless">("tubeless");
  const [surface, setSurface] = useState<Surface>("average_asphalt");
  const [ridingGoal, setRidingGoal] = useState<RidingGoal | undefined>(undefined);
  const [bikeWeightKg, setBikeWeightKg] = useState<number | undefined>(undefined);
  const [hasManualRearWidth, setHasManualRearWidth] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const widthRearMm = hasManualRearWidth ? manualWidthRearMm : widthFrontMm;

  const errors: ValidationError[] = useMemo(
    () =>
      validatePressureInput({
        bodyWeightKg,
        widthFrontMm,
        widthRearMm,
        discipline,
        tubeType,
        surface,
        bikeWeightKg,
        ridingGoal,
      }),
    [bikeWeightKg, bodyWeightKg, discipline, ridingGoal, surface, tubeType, widthFrontMm, widthRearMm]
  );

  const result: PressureOutput | null = useMemo(() => {
    if (errors.length > 0) {
      return null;
    }

    return calculateBasicPressure({
      discipline,
      bodyWeightKg,
      widthFrontMm,
      widthRearMm,
      tubeType,
      surface,
      ridingGoal,
      bikeWeightKg,
    });
  }, [bikeWeightKg, bodyWeightKg, discipline, errors, ridingGoal, surface, tubeType, widthFrontMm, widthRearMm]);

  const disciplineButtons: Array<{ value: "road" | "gravel" | "mtb"; label: string }> = [
    { value: "road", label: labels.disciplineRoad },
    { value: "gravel", label: labels.disciplineGravel },
    { value: "mtb", label: labels.disciplineMtb },
  ];

  const surfaceLabels: Record<Surface, string> = {
    smooth_asphalt: labels.surfaceSmoothAsphalt,
    average_asphalt: labels.surfaceAverageAsphalt,
    rough_asphalt: labels.surfaceRoughAsphalt,
    hardpack_gravel: labels.surfaceHardpackGravel,
    loose_gravel: labels.surfaceLooseGravel,
    trail: labels.surfaceTrail,
  };

  const tubeLabels = {
    inner_tube: labels.tubeTypeInnerTube,
    latex_tube: labels.tubeTypeLatex,
    tubeless: labels.tubeTypeTubeless,
  } as const;

  const goalLabels = {
    speed: labels.ridingGoalSpeed,
    balance: labels.ridingGoalBalance,
    comfort: labels.ridingGoalComfort,
  } as const;

  return (
    <section className="py-14">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700">{labels.disciplineLabel}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {disciplineButtons.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDiscipline(option.value)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      discipline === option.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>{labels.bodyWeightLabel}</span>
                <span>{bodyWeightKg} kg</span>
              </div>
              <input
                type="range"
                min={35}
                max={160}
                step={1}
                value={bodyWeightKg}
                onChange={(event) => setBodyWeightKg(Number(event.target.value))}
                className="mt-3 w-full"
              />
              {findError(errors, "bodyWeightKg") ? (
                <p className="mt-1 text-sm text-red-600">{findError(errors, "bodyWeightKg")}</p>
              ) : null}
            </label>

            <label className="block">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>{labels.widthFrontLabel}</span>
                <span>{widthFrontMm} mm</span>
              </div>
              <input
                type="range"
                min={18}
                max={80}
                step={1}
                value={widthFrontMm}
                onChange={(event) => setWidthFrontMm(Number(event.target.value))}
                className="mt-3 w-full"
              />
              {findError(errors, "widthFrontMm") ? (
                <p className="mt-1 text-sm text-red-600">{findError(errors, "widthFrontMm")}</p>
              ) : null}
            </label>

            <label className="block">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>{labels.widthRearLabel}</span>
                <span>{widthRearMm} mm</span>
              </div>
              <input
                type="range"
                min={18}
                max={80}
                step={1}
                value={widthRearMm}
                onChange={(event) => {
                  setHasManualRearWidth(true);
                  setManualWidthRearMm(Number(event.target.value));
                }}
                className="mt-3 w-full"
              />
              {findError(errors, "widthRearMm") ? (
                <p className="mt-1 text-sm text-red-600">{findError(errors, "widthRearMm")}</p>
              ) : null}
            </label>

            <div>
              <p className="text-sm font-medium text-gray-700">{labels.tubeTypeLabel}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {TUBE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTubeType(option)}
                    className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      tubeType === option
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tubeLabels[option]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">{labels.surfaceLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SURFACE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSurface(option)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      surface === option
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {surfaceLabels[option]}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <button
                type="button"
                onClick={() => setShowAdvanced((current) => !current)}
                className="flex w-full items-center justify-between text-left text-sm font-semibold text-gray-900"
              >
                <span>{labels.advancedOptions}</span>
                <span>{showAdvanced ? "−" : "+"}</span>
              </button>

              {showAdvanced ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{labels.ridingGoalLabel}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {GOAL_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setRidingGoal((current) => (current === option ? undefined : option))
                          }
                          className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                            ridingGoal === option
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {goalLabels[option]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">{labels.bikeWeightLabel}</span>
                    <input
                      type="number"
                      min={3}
                      max={20}
                      step={0.1}
                      placeholder="ca. 8"
                      value={bikeWeightKg ?? ""}
                      onChange={(event) =>
                        setBikeWeightKg(
                          event.target.value ? Number(event.target.value) : undefined
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    />
                    {findError(errors, "bikeWeightKg") ? (
                      <p className="mt-1 text-sm text-red-600">{findError(errors, "bikeWeightKg")}</p>
                    ) : null}
                  </label>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {result ? (
            <PressureResultCard result={result} labels={resultLabels} />
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
              {labels.resultPlaceholder}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
