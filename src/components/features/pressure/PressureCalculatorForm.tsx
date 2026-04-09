"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import {
  PublicInfoPanel,
  PublicNumberField,
  PublicScaleField,
  PublicSelectField,
  PublicSurfaceCard,
} from "@/components/public";
import {
  calculateBasicPressure,
  type PressureOutput,
  type RidingGoal,
  type Surface,
  type ValidationError,
  validatePressureInput,
} from "@/lib/pressure-engine";
import { PressureResultCard } from "./PressureResultCard";
import type { PressureResultLabels } from "./shared";

interface PressureCalculatorFormProps {
  locale: "en" | "nl";
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
  locale,
  defaultDiscipline,
  labels,
  resultLabels,
}: PressureCalculatorFormProps) {
  const isNl = locale === "nl";
  const [discipline, setDiscipline] = useState<"road" | "gravel" | "mtb">(
    defaultDiscipline ?? "road"
  );
  const [bodyWeightKg, setBodyWeightKg] = useState<number>(75);
  const [widthFrontMm, setWidthFrontMm] = useState<number>(28);
  const [manualWidthRearMm, setManualWidthRearMm] = useState<number>(28);
  const [tubeType, setTubeType] = useState<"inner_tube" | "latex_tube" | "tubeless">("tubeless");
  const [surface, setSurface] = useState<Surface>("average_asphalt");
  const [ridingGoal, setRidingGoal] = useState<RidingGoal | undefined>(undefined);
  const [bikeWeightKg, setBikeWeightKg] = useState<number>(8);
  const [hasManualRearWidth, setHasManualRearWidth] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const widthRearMm = hasManualRearWidth ? manualWidthRearMm : widthFrontMm;

  const effectiveBikeWeightKg = showAdvanced ? bikeWeightKg : undefined;

  const errors: ValidationError[] = useMemo(
    () =>
      validatePressureInput({
        bodyWeightKg,
        widthFrontMm,
        widthRearMm,
        discipline,
        tubeType,
        surface,
        bikeWeightKg: effectiveBikeWeightKg,
        ridingGoal,
      }),
    [
      effectiveBikeWeightKg,
      bodyWeightKg,
      discipline,
      ridingGoal,
      surface,
      tubeType,
      widthFrontMm,
      widthRearMm,
    ]
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
      bikeWeightKg: effectiveBikeWeightKg,
    });
  }, [
    effectiveBikeWeightKg,
    bodyWeightKg,
    discipline,
    errors,
    ridingGoal,
    surface,
    tubeType,
    widthFrontMm,
    widthRearMm,
  ]);

  const disciplineOptions = [
    { value: "road", label: labels.disciplineRoad },
    { value: "gravel", label: labels.disciplineGravel },
    { value: "mtb", label: labels.disciplineMtb },
  ];

  const surfaceOptions = SURFACE_OPTIONS.map((option) => ({
    value: option,
    label:
      {
        smooth_asphalt: labels.surfaceSmoothAsphalt,
        average_asphalt: labels.surfaceAverageAsphalt,
        rough_asphalt: labels.surfaceRoughAsphalt,
        hardpack_gravel: labels.surfaceHardpackGravel,
        loose_gravel: labels.surfaceLooseGravel,
        trail: labels.surfaceTrail,
      }[option],
  }));

  const tubeOptions = TUBE_OPTIONS.map((option) => ({
    value: option,
    label:
      {
        inner_tube: labels.tubeTypeInnerTube,
        latex_tube: labels.tubeTypeLatex,
        tubeless: labels.tubeTypeTubeless,
      }[option],
  }));

  const goalOptions = GOAL_OPTIONS.map((option) => ({
    value: option,
    label:
      {
        speed: labels.ridingGoalSpeed,
        balance: labels.ridingGoalBalance,
        comfort: labels.ridingGoalComfort,
      }[option],
  }));

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <PublicSurfaceCard
        title={isNl ? "Bouw je drukbasis" : "Build your pressure baseline"}
        description={
          isNl
            ? "Begin met de grootste invloeden eerst. Geavanceerde opties zijn er wanneer je verder wilt verfijnen."
            : "Start with the essentials first. Advanced options are there when you want to refine the recommendation further."
        }
        className="public-calculator-card rounded-[1.75rem]"
      >
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {isNl ? "Invoer" : "Inputs"}
          </p>

          <PublicInfoPanel
            tone="secondary"
            title={isNl ? "Wat het resultaat het meest verandert" : "What changes the result most"}
            icon={<ShieldCheck />}
          >
            {isNl
              ? "Gewicht, bandbreedte, ondergrond en bandtype veroorzaken de grootste verschuivingen. Gebruik rijdoel en fietsgewicht alleen als je fijner wilt afstellen."
              : "Rider weight, tyre width, surface, and tyre type drive the biggest changes. Use riding goal and bike weight only when you want a finer adjustment."}
          </PublicInfoPanel>

          <div className="grid gap-5 md:grid-cols-2">
            <PublicSelectField
              label={labels.disciplineLabel}
              options={disciplineOptions}
              value={discipline}
              onChange={(value) => setDiscipline(value as "road" | "gravel" | "mtb")}
            />
            <PublicNumberField
              label={labels.bodyWeightLabel}
              min={35}
              max={160}
              step={1}
              unit="kg"
              value={bodyWeightKg}
              onChange={(value) => setBodyWeightKg(value ?? 35)}
            />
            <PublicNumberField
              label={labels.widthFrontLabel}
              min={18}
              max={80}
              step={1}
              unit="mm"
              value={widthFrontMm}
              onChange={(value) => setWidthFrontMm(value ?? 18)}
            />
            <PublicNumberField
              label={labels.widthRearLabel}
              min={18}
              max={80}
              step={1}
              unit="mm"
              value={widthRearMm}
              onChange={(value) => {
                setHasManualRearWidth(true);
                setManualWidthRearMm(value ?? 18);
              }}
            />
            <PublicSelectField
              label={labels.tubeTypeLabel}
              options={tubeOptions}
              value={tubeType}
              onChange={(value) => setTubeType(value as "inner_tube" | "latex_tube" | "tubeless")}
            />
            <PublicScaleField
              label={labels.surfaceLabel}
              description={
                isNl
                  ? "Schuif van glad naar losser naarmate je ondergrond meer grip en demping vraagt."
                  : "Move from smoother to looser surfaces as the terrain asks for more grip and compliance."
              }
              options={surfaceOptions}
              value={surface}
              onChange={(value) => setSurface(value as Surface)}
            />
          </div>

          {(findError(errors, "bodyWeightKg") ||
            findError(errors, "widthFrontMm") ||
            findError(errors, "widthRearMm")) && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive-soft px-4 py-3 text-sm text-destructive">
              {findError(errors, "bodyWeightKg") ||
                findError(errors, "widthFrontMm") ||
                findError(errors, "widthRearMm")}
            </div>
          )}

          <div className="public-calculator-card-subtle rounded-2xl border p-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced((current) => !current)}
              className="flex w-full items-center justify-between px-0 text-left text-sm font-semibold text-[color:var(--foreground)]"
            >
              <span>{labels.advancedOptions}</span>
              <span>{showAdvanced ? "-" : "+"}</span>
            </Button>

            {showAdvanced ? (
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <PublicScaleField
                  label={labels.ridingGoalLabel}
                  description={
                    isNl
                      ? "Meer comfort vraagt meestal om wat extra marge."
                      : "More comfort usually asks for a bit more margin."
                  }
                  options={goalOptions}
                  value={ridingGoal ?? "balance"}
                  onChange={(value) => setRidingGoal(value as RidingGoal)}
                />
                <PublicNumberField
                  label={labels.bikeWeightLabel}
                  min={3}
                  max={20}
                  step={0.1}
                  unit="kg"
                  value={bikeWeightKg}
                  onChange={(value) => setBikeWeightKg(value ?? 3)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </PublicSurfaceCard>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {result ? (
          <PressureResultCard result={result} labels={resultLabels} />
        ) : (
          <div className="public-calculator-card-subtle rounded-[1.75rem] border border-dashed p-6 text-sm text-[color:var(--muted-foreground)]">
            {labels.resultPlaceholder}
          </div>
        )}

        <PublicInfoPanel
          tone="secondary"
          title={isNl ? "Wat het resultaat het meest verandert" : "What changes the result most"}
          icon={<ShieldCheck />}
        >
          <ul className="space-y-2">
            {isNl ? (
              <>
                <li>Gewicht en bandbreedte verschuiven de basis het snelst.</li>
                <li>Ondergrond en bandtype bepalen hoe laag je veilig kunt gaan.</li>
                <li>Gebruik de uitkomst als startpunt en valideer daarna op rijgevoel.</li>
              </>
            ) : (
              <>
                <li>Weight and tyre width shift the baseline fastest.</li>
                <li>Surface and tyre type change how low you can safely go.</li>
                <li>Use the output as a starting point, then validate with ride feel.</li>
              </>
            )}
          </ul>
        </PublicInfoPanel>
      </div>
    </section>
  );
}
