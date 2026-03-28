"use client";

import { useMemo, useState } from "react";
import { Button, NumberInput, Selectable, Slider } from "@/components/ui";
import { Field } from "@/components/ui/Field";
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
        <div className="rounded-[calc(var(--radius-lg)+8px)] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
              Inputs
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
              Build your pressure baseline
            </h2>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              Start with the essentials first. Advanced options are there when you want to refine the recommendation further.
            </p>
          </div>

          <div className="mt-6 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4 text-sm text-[color:var(--muted-foreground)]">
            Rider weight, tire width, surface, and tube type drive the biggest changes. Use riding goal and bike weight only when you want a finer adjustment.
          </div>

          <div className="space-y-6">
            <Field.Root className="space-y-3">
              <Field.Label className="text-sm font-medium text-[color:var(--foreground)]">
                {labels.disciplineLabel}
              </Field.Label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {disciplineButtons.map((option) => (
                  <Selectable
                    key={option.value}
                    onClick={() => setDiscipline(option.value)}
                    selected={discipline === option.value}
                    variant="segment"
                  >
                    {option.label}
                  </Selectable>
                ))}
              </div>
            </Field.Root>

            <Slider
              label={labels.bodyWeightLabel}
              min={35}
              max={160}
              step={1}
              value={bodyWeightKg}
              onChange={setBodyWeightKg}
              valueLabel={`${bodyWeightKg} kg`}
              error={findError(errors, "bodyWeightKg")}
            />

            <Slider
              label={labels.widthFrontLabel}
              min={18}
              max={80}
              step={1}
              value={widthFrontMm}
              onChange={setWidthFrontMm}
              valueLabel={`${widthFrontMm} mm`}
              error={findError(errors, "widthFrontMm")}
            />

            <Slider
              label={labels.widthRearLabel}
              min={18}
              max={80}
              step={1}
              value={widthRearMm}
              onChange={(value) => {
                setHasManualRearWidth(true);
                setManualWidthRearMm(value);
              }}
              valueLabel={`${widthRearMm} mm`}
              error={findError(errors, "widthRearMm")}
            />

            <Field.Root className="space-y-3">
              <Field.Label className="text-sm font-medium text-[color:var(--foreground)]">
                {labels.tubeTypeLabel}
              </Field.Label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {TUBE_OPTIONS.map((option) => (
                  <Selectable
                    key={option}
                    onClick={() => setTubeType(option)}
                    selected={tubeType === option}
                    variant="segment"
                  >
                    {tubeLabels[option]}
                  </Selectable>
                ))}
              </div>
            </Field.Root>

            <Field.Root className="space-y-3">
              <Field.Label className="text-sm font-medium text-[color:var(--foreground)]">
                {labels.surfaceLabel}
              </Field.Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {SURFACE_OPTIONS.map((option) => (
                  <Selectable
                    key={option}
                    onClick={() => setSurface(option)}
                    selected={surface === option}
                    variant="pill"
                    fullWidth={false}
                  >
                    {surfaceLabels[option]}
                  </Selectable>
                ))}
              </div>
            </Field.Root>

            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced((current) => !current)}
                className="flex w-full items-center justify-between px-0 text-left text-sm font-semibold text-[color:var(--foreground)]"
              >
                <span>{labels.advancedOptions}</span>
                <span>{showAdvanced ? "−" : "+"}</span>
              </Button>

              {showAdvanced ? (
                <div className="mt-4 space-y-4">
                  <Field.Root className="space-y-3">
                    <Field.Label className="text-sm font-medium text-[color:var(--foreground)]">
                      {labels.ridingGoalLabel}
                    </Field.Label>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {GOAL_OPTIONS.map((option) => (
                        <Selectable
                          key={option}
                          onClick={() =>
                            setRidingGoal((current) => (current === option ? undefined : option))
                          }
                          selected={ridingGoal === option}
                          variant="segment"
                        >
                          {goalLabels[option]}
                        </Selectable>
                      ))}
                    </div>
                  </Field.Root>

                  <NumberInput
                    label={labels.bikeWeightLabel}
                    min={3}
                    max={20}
                    step={0.1}
                    placeholder="ca. 8"
                    value={bikeWeightKg ?? null}
                    onChange={(value) => setBikeWeightKg(value ?? undefined)}
                    error={findError(errors, "bikeWeightKg")}
                    unit="kg"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {result ? (
            <PressureResultCard result={result} labels={resultLabels} />
          ) : (
            <div className="rounded-[calc(var(--radius-lg)+8px)] border border-dashed border-[color:var(--border)] bg-[color:var(--card)] p-6 text-sm text-[color:var(--muted-foreground)]">
              {labels.resultPlaceholder}
            </div>
          )}

          <div className="rounded-[calc(var(--radius-lg)+8px)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-5 text-sm text-[color:var(--muted-foreground)] shadow-sm">
            <p className="font-semibold text-[color:var(--foreground)]">
              What changes the result most
            </p>
            <ul className="mt-3 space-y-2">
              <li>Weight and tire width shift the baseline fastest.</li>
              <li>Surface and tire type change how low you can safely go.</li>
              <li>Use the output as a starting point, then validate with ride feel.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
