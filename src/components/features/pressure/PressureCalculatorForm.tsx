"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";
import { PersonalizeAdviceBlock } from "@/components/calculators/PersonalizeAdviceBlock";
import { HandoffPrefillNotice } from "@/components/calculators/HandoffPrefillNotice";
import { pressureHandoffMessages } from "@/i18n/calculators/pressureHandoff";
import type { HandoffField } from "@/lib/handoff/store";
import {
  AdjustOrder,
  Button,
  ConfiguratorLayout,
  Gauge,
  OptionCard,
  ResultHero,
  Slider,
  StepCard,
} from "@/components/ui";
import {
  calculateBasicPressure,
  validatePressureInput,
  type Surface,
  type RidingGoal,
  type TubeType,
} from "@/lib/pressure-engine";
import { tirePressureMessages, type TirePressureCopy } from "@/i18n/calculators/tirePressure";
import type { PressureResultLabels } from "./shared";

export type PressureCalculatorValues = {
  discipline: "road" | "gravel" | "mtb";
  bodyWeightKg: number;
  widthFrontMm: number;
  widthRearMm: number;
  tubeType: TubeType;
  surface: Surface;
  ridingGoal?: RidingGoal;
  bikeWeightKg?: number;
};

export interface PressureCalculatorFormProps {
  locale: "en" | "nl";
  copy?: TirePressureCopy;
  defaultDiscipline?: "road" | "gravel" | "mtb";
  initialValues?: Partial<PressureCalculatorValues>;
  onValuesChange?: (values: PressureCalculatorValues) => void;
  onValuesCommit?: (values: PressureCalculatorValues) => void;
  accountMode?: boolean;
  headerSlot?: ReactNode;
  statusSlot?: ReactNode;
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

const SURFACES: Surface[] = [
  "smooth_asphalt",
  "average_asphalt",
  "rough_asphalt",
  "hardpack_gravel",
  "loose_gravel",
  "trail",
];
const GOALS: RidingGoal[] = ["speed", "balance", "comfort"];
const TUBES: TubeType[] = ["inner_tube", "latex_tube", "tubeless"];
// Display domains mirror the unchanged discipline clamps in pressure-engine.ts.
const DOMAINS = { road: [4, 9], gravel: [1.5, 5], mtb: [0.8, 3.5] } as const;

function Choices<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="space-y-3">
      <p className="font-semibold">{label}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            showCheck={false}
            className="px-3 text-sm"
          />
        ))}
      </div>
    </div>
  );
}

export function PressureCalculatorForm({
  locale,
  defaultDiscipline,
  labels,
  resultLabels,
  copy = tirePressureMessages[locale],
  initialValues,
  onValuesChange,
  onValuesCommit,
  accountMode = false,
  headerSlot,
  statusSlot,
}: PressureCalculatorFormProps) {
  const [discipline, setDiscipline] = useState<PressureCalculatorValues["discipline"]>(
    initialValues?.discipline ?? defaultDiscipline ?? "road",
  );
  const [bodyWeightKg, setBodyWeightKg] = useState(initialValues?.bodyWeightKg ?? 75);
  const [widthFrontMm, setWidthFrontMm] = useState(initialValues?.widthFrontMm ?? 28);
  const [manualWidthRearMm, setManualWidthRearMm] = useState(initialValues?.widthRearMm ?? initialValues?.widthFrontMm ?? 28);
  const [linked, setLinked] = useState(widthFrontMm === manualWidthRearMm);
  const [tubeType, setTubeType] = useState<TubeType>(initialValues?.tubeType ?? "tubeless");
  const [surface, setSurface] = useState<Surface>(initialValues?.surface ?? "average_asphalt");
  const [ridingGoal, setRidingGoal] = useState<RidingGoal | undefined>(initialValues?.ridingGoal);
  const [bikeWeightKg, setBikeWeightKg] = useState(initialValues?.bikeWeightKg ?? 8);
  const [advanced, setAdvanced] = useState(initialValues?.bikeWeightKg !== undefined);
  const [edited, setEdited] = useState(false);
  const handoff = usePublicHandoff("tire-pressure", !accountMode);
  const rimCopy = pressureHandoffMessages[locale];
  const [rimType, setRimType] = useState<"hooked" | "hookless" | "">("");
  const prefilled = useRef(false);
  const [prefilledFields, setPrefilledFields] = useState<HandoffField[]>([]);
  /* eslint-disable react-hooks/set-state-in-effect -- Hydrate the once-only client session snapshot. */
  useEffect(() => {
    if (!handoff.ready || prefilled.current || accountMode) return;
    prefilled.current = true;
    const fields: HandoffField[] = [];
    const weight = handoff.getPrefill("weightKg");
    if (typeof weight?.value === "number" && weight.value >= 35 && weight.value <= 160) {
      setBodyWeightKg(weight.value);
      fields.push("weightKg");
    }
    const front = handoff.getPrefill("tireWidthFrontMm");
    const rear = handoff.getPrefill("tireWidthRearMm");
    if (typeof front?.value === "number" && front.value >= 18 && front.value <= 80) {
      setWidthFrontMm(front.value);
      setLinked(false);
      fields.push("tireWidthFrontMm");
    }
    if (typeof rear?.value === "number" && rear.value >= 18 && rear.value <= 80) {
      setManualWidthRearMm(rear.value);
      setLinked(false);
      fields.push("tireWidthRearMm");
    }
    const storedSurface = handoff.getPrefill("surface");
    if (SURFACES.includes(storedSurface?.value as Surface)) {
      setSurface(storedSurface!.value as Surface);
      fields.push("surface");
    }
    const rim = handoff.getPrefill("rimType");
    if (rim?.value === "hooked" || rim?.value === "hookless") {
      setRimType(rim.value);
      fields.push("rimType");
    }
    setPrefilledFields(fields);
    if (fields.length) setEdited(true);
  }, [handoff, accountMode]);
  /* eslint-enable react-hooks/set-state-in-effect */
  const widthRearMm = linked ? widthFrontMm : manualWidthRearMm;
  const input: PressureCalculatorValues = {
    discipline,
    bodyWeightKg,
    widthFrontMm,
    widthRearMm,
    tubeType,
    surface,
    ridingGoal,
    bikeWeightKg: advanced ? bikeWeightKg : undefined,
  };
  const latestValues = useRef(input);
  const errors = validatePressureInput(input);
  const result = errors.length ? null : calculateBasicPressure(input);
  const number = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
  const weightNumber = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  function notifyChange(changes: Partial<PressureCalculatorValues>) {
    const nextValues = { ...latestValues.current, ...changes };
    latestValues.current = nextValues;
    onValuesChange?.(nextValues);
  }
  function commitValues() {
    onValuesCommit?.(latestValues.current);
  }
  function update<Key extends keyof PressureCalculatorValues>(
    key: Key,
    setter: (value: NonNullable<PressureCalculatorValues[Key]>) => void,
  ) {
    return (value: NonNullable<PressureCalculatorValues[Key]>) => {
      setter(value);
      if (key === "bodyWeightKg") handoff.touch("weightKg", value, "kg");
      if (key === "surface") handoff.touch("surface", value, "none", "bike");
      setEdited(true);
      notifyChange({ [key]: value });
    };
  }
  const surfaceLabels = [
    labels.surfaceSmoothAsphalt,
    labels.surfaceAverageAsphalt,
    labels.surfaceRoughAsphalt,
    labels.surfaceHardpackGravel,
    labels.surfaceLooseGravel,
    labels.surfaceTrail,
  ];
  const tubeLabels = [labels.tubeTypeInnerTube, labels.tubeTypeLatex, labels.tubeTypeTubeless];
  const goalLabels = [labels.ridingGoalSpeed, labels.ridingGoalBalance, labels.ridingGoalComfort];
  const resultTitle = accountMode || edited ? copy.result : copy.example;
  return (
    <ConfiguratorLayout
      notice={!accountMode && <HandoffPrefillNotice
        calculator="tire-pressure" locale={locale} fields={prefilledFields}
      />}
      afterResults={!accountMode && <PersonalizeAdviceBlock calculator="tire-pressure" locale={locale} />}
      eyebrow={copy.eyebrow}
      title={defaultDiscipline ? copy.preset[defaultDiscipline] : copy.title}
      description={copy.intro}
      navigation={headerSlot}
      inputs={
        <>
          {statusSlot}
          <StepCard number={1} title={copy.body}>
            <div className="space-y-6">
              <Choices
                label={labels.disciplineLabel}
                value={discipline}
                onChange={update("discipline", setDiscipline)}
                options={[
                  { value: "road", label: labels.disciplineRoad },
                  { value: "gravel", label: labels.disciplineGravel },
                  { value: "mtb", label: labels.disciplineMtb },
                ]}
              />
              <Slider
                label={labels.bodyWeightLabel}
                value={bodyWeightKg}
                onChange={update("bodyWeightKg", setBodyWeightKg)}
                onPointerUp={commitValues}
                onKeyUp={commitValues}
                min={35}
                max={160}
                step={1}
                unit="kg"
                valueLabel={weightNumber.format(bodyWeightKg)}
                ticks={[{ value: 35 }, { value: 160 }]}
              />
            </div>
          </StepCard>
          <StepCard number={2} title={copy.tires}>
            <div className="space-y-6">
              <Slider
                label={labels.widthFrontLabel}
                value={widthFrontMm}
                onChange={(value) => {
                  setWidthFrontMm(value);
                  handoff.touch("tireWidthFrontMm", value, "mm", "bike");
                  if (linked) handoff.touch("tireWidthRearMm", value, "mm", "bike");
                  setEdited(true);
                  notifyChange({ widthFrontMm: value, ...(linked ? { widthRearMm: value } : {}) });
                }}
                onPointerUp={commitValues}
                onKeyUp={commitValues}
                min={18}
                max={80}
                step={1}
                unit="mm"
              />
              <Button
                variant="outline"
                aria-pressed={linked}
                onClick={() => {
                  if (linked) setManualWidthRearMm(widthFrontMm);
                  setLinked(!linked);
                  if (!linked) {
                    handoff.touch("tireWidthRearMm", widthFrontMm, "mm", "bike");
                    setEdited(true);
                    notifyChange({ widthRearMm: widthFrontMm });
                  }
                }}
                className="w-full whitespace-normal"
              >
                {copy.linked}
              </Button>
              <Slider
                label={labels.widthRearLabel}
                value={widthRearMm}
                onChange={(value) => {
                  setLinked(false);
                  setManualWidthRearMm(value);
                  handoff.touch("tireWidthRearMm", value, "mm", "bike");
                  setEdited(true);
                  notifyChange({ widthRearMm: value });
                }}
                onPointerUp={commitValues}
                onKeyUp={commitValues}
                min={18}
                max={80}
                step={1}
                unit="mm"
              />
              {!accountMode && (
                <div className="space-y-2">
                  <Choices
                    label={rimCopy.rim}
                    value={rimType}
                    options={[{ value: "hooked", label: rimCopy.hooked }, { value: "hookless", label: rimCopy.hookless }]}
                    onChange={(value) => {
                      if (value !== "hooked" && value !== "hookless") return;
                      setRimType(value);
                      handoff.touch("rimType", value, "none", "bike");
                    }}
                  />
                  <p className="text-sm text-muted-foreground">{rimCopy.hint}</p>
                </div>
              )}
              <Choices
                label={labels.tubeTypeLabel}
                options={TUBES.map((value, index) => ({ value, label: tubeLabels[index] }))}
                value={tubeType}
                onChange={update("tubeType", setTubeType)}
              />
            </div>
          </StepCard>
          <StepCard number={3} title={copy.route}>
            <Choices
              label={labels.surfaceLabel}
              options={SURFACES.map((value, index) => ({ value, label: surfaceLabels[index] }))}
              value={surface}
              onChange={update("surface", setSurface)}
            />
            <Button
              variant="ghost"
              className="mt-5 h-auto min-h-11 w-full whitespace-normal text-left"
              aria-expanded={advanced}
              aria-controls="pressure-advanced"
              onClick={() => {
                setAdvanced(!advanced);
                notifyChange({ bikeWeightKg: advanced ? undefined : bikeWeightKg });
              }}
            >
              {copy.advanced}
              <span aria-hidden="true">{advanced ? "−" : "+"}</span>
            </Button>
            {advanced && (
              <div id="pressure-advanced" className="mt-5 space-y-6">
                <Choices
                  label={labels.ridingGoalLabel}
                  options={[
                    { value: "unset", label: copy.unset },
                    ...GOALS.map((value, index) => ({ value, label: goalLabels[index] })),
                  ]}
                  value={ridingGoal ?? "unset"}
                  onChange={(value) => {
                    setRidingGoal(value === "unset" ? undefined : (value as RidingGoal));
                    setEdited(true);
                    notifyChange({ ridingGoal: value === "unset" ? undefined : (value as RidingGoal) });
                  }}
                />
                <Slider
                  label={labels.bikeWeightLabel}
                  value={bikeWeightKg}
                  valueLabel={weightNumber.format(bikeWeightKg)}
                  onChange={update("bikeWeightKg", setBikeWeightKg)}
                  onPointerUp={commitValues}
                  onKeyUp={commitValues}
                  min={3}
                  max={20}
                  step={0.1}
                  unit="kg"
                />
              </div>
            )}
          </StepCard>
        </>
      }
      results={
        <>
          {result ? (
            <section
              id="pressure-result"
              aria-label={resultTitle}
              className="rounded-[2rem] bg-[var(--bbf-lime)] p-5 text-[var(--bbf-inkt)] sm:p-7"
            >
              <h2 className="font-display text-2xl font-bold text-[var(--bbf-inkt)]">{resultTitle}</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { label: resultLabels.front, bar: result.frontBar, psi: result.frontPsi },
                  { label: resultLabels.rear, bar: result.rearBar, psi: result.rearPsi },
                ].map((wheel) => (
                  <div key={wheel.label} className="min-w-0">
                    <ResultHero
                      label={wheel.label}
                      value={number.format(wheel.bar)}
                      unit={resultLabels.bar}
                      className="p-0 sm:p-0 [&_dd]:text-[clamp(2.5rem,5vw,4.5rem)]"
                    />
                    <p className="mt-2 font-mono text-sm">
                      {wheel.psi} {resultLabels.psi}
                    </p>
                    <Gauge
                      label={`${wheel.label}: ${copy.gauge}`}
                      value={wheel.bar}
                      min={DOMAINS[discipline][0]}
                      max={DOMAINS[discipline][1]}
                      unit="bar"
                      locale={locale}
                      className="mt-3 [--gauge-accent:var(--bbf-petrol)]"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed">{copy.scale}</p>
              <p role="status" aria-label={copy.summary} className="sr-only">
                {resultLabels.front}: {number.format(result.frontBar)} bar; {resultLabels.rear}:{" "}
                {number.format(result.rearBar)} bar
              </p>
            </section>
          ) : (
            <p role="alert">{copy.error}</p>
          )}
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold">{resultLabels.warningsTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.limit}</p>
            {result && result.warnings.length > 0 && (
              <ul aria-label={copy.warning} className="mt-4 space-y-2">
                {result.warnings.map((warning) => (
                  <li
                    key={warning}
                    className="rounded-xl bg-[var(--bbf-warning)] p-3 text-sm text-[var(--bbf-inkt)]"
                  >
                    {resultLabels.warningMessages[warning]}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold">{copy.scope}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.excluded}</p>
          </section>
          <AdjustOrder title={copy.adjustment} steps={copy.steps.map((title) => ({ title }))} />
        </>
      }
      stickyResult={
        result && (
          <a href="#pressure-result" className="flex min-h-11 flex-wrap items-center justify-between gap-2">
            <span className="text-xs">{resultTitle}</span>
            <span className="font-mono text-xl">
              {number.format(result.frontBar)} / {number.format(result.rearBar)}{" "}
              <span className="text-sm">bar</span>
            </span>
            <span className="sr-only">
              {resultLabels.front} / {resultLabels.rear}
            </span>
          </a>
        )
      }
    />
  );
}
