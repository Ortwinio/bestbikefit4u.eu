"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useCalculatorValuesChange } from "@/components/calculators/useCalculatorValuesChange";
import { PublicCalculatorResultSummary } from "@/components/public";
import { ConfiguratorLayout, OptionCard, ResultHero, ResultTile, Slider, StepCard } from "@/components/ui";
import { gearingMessages } from "@/i18n/calculators/gearing";
import { withLocalePrefix } from "@/i18n/navigation";
import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";
import { PersonalizeAdviceBlock } from "@/components/calculators/PersonalizeAdviceBlock";
import { HandoffPrefillNotice } from "@/components/calculators/HandoffPrefillNotice";
import type { HandoffField } from "@/lib/handoff/store";
import {
  calculateGearing,
  DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE,
  type GearingBikeType,
  type GearingClimbBand,
  type GearingDrivetrainType,
  type GearingCalculationResult,
  type GearingCalculatorInput,
  validateGearingInputs,
} from "./gearing-engine";

const WHEEL_PRESET_OPTIONS = [
  { value: "road", label: "Road 700 x 25 / 28" },
  { value: "gravel", label: "Gravel 700 x 38 / 40" },
  { value: "mtb", label: "MTB 29 x 2.3" },
  { value: "commuter", label: "Commuter / hybrid" },
] as const;

const CASSETTE_PRESET_OPTIONS = [
  { value: "road_11_30", label: "11-30", smallest: 11, largest: 30 },
  { value: "road_11_34", label: "11-34", smallest: 11, largest: 34 },
  { value: "road_11_36", label: "11-36", smallest: 11, largest: 36 },
  { value: "gravel_10_44", label: "10-44", smallest: 10, largest: 44 },
  { value: "mtb_10_51", label: "10-51", smallest: 10, largest: 51 },
  { value: "custom", label: "Custom", smallest: 11, largest: 34 },
] as const;

function buildPresetValueMap() {
  return new Map<string, number>(
    WHEEL_PRESET_OPTIONS.map((option) => [
      option.value,
      DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE[option.value as GearingBikeType],
    ]),
  );
}

const WHEEL_PRESET_VALUES = buildPresetValueMap();

type Props = {
  isNl: boolean;
  initialValues?: Partial<GearingCalculatorInput>;
  onValuesChange?: (values: GearingCalculatorInput) => void;
  accountMode?: boolean;
  headerSlot?: ReactNode;
  statusSlot?: ReactNode;
  description?: string;
};

export function GearingCalculatorForm({
  isNl, initialValues, onValuesChange, accountMode = false, headerSlot, statusSlot, description,
}: Props) {
  const locale = isNl ? "nl" : "en";
  const copy = gearingMessages[locale];
  const [edited, setEdited] = useState(false);
  const format = (value: number, digits = 2) =>
    new Intl.NumberFormat(locale, {
      maximumFractionDigits: digits,
    }).format(value);
  const handoff = usePublicHandoff("gearing", !accountMode);
  const prefilled = useRef(false);
  const [prefilledFields, setPrefilledFields] = useState<HandoffField[]>([]);
  const [drivetrainType, setDrivetrainType] = useState<GearingDrivetrainType>(initialValues?.drivetrainType ?? "2x");
  const [bikeType, setBikeType] = useState<GearingBikeType>(initialValues?.bikeType ?? "road");
  const [climbBand, setClimbBand] = useState<GearingClimbBand>(initialValues?.climbBand ?? "medium");
  const [outerChainringTeeth, setOuterChainringTeeth] = useState<number | undefined>(
    initialValues?.outerChainringTeeth ?? 50,
  );
  const [innerChainringTeeth, setInnerChainringTeeth] = useState<number | undefined>(
    initialValues?.innerChainringTeeth ?? 34,
  );
  const [cassettePreset, setCassettePreset] = useState<string>(() =>
    CASSETTE_PRESET_OPTIONS.find((option) => option.smallest === (initialValues?.cassetteSmallestCogTeeth ?? 11)
      && option.largest === (initialValues?.cassetteLargestCogTeeth ?? 34))?.value ?? "custom");
  const [cassetteSmallestCogTeeth, setCassetteSmallestCogTeeth] = useState<number | undefined>(
    initialValues?.cassetteSmallestCogTeeth ?? 11,
  );
  const [cassetteLargestCogTeeth, setCassetteLargestCogTeeth] = useState<number | undefined>(
    initialValues?.cassetteLargestCogTeeth ?? 34,
  );
  const [wheelPreset, setWheelPreset] = useState<string>(() =>
    [...WHEEL_PRESET_VALUES].find(([, value]) => value === (initialValues?.wheelCircumferenceMm ?? 2105))?.[0] ?? "custom");
  const [wheelCircumferenceMm, setWheelCircumferenceMm] = useState<number | undefined>(
    initialValues?.wheelCircumferenceMm ?? DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE.road,
  );
  const [cadenceRpm, setCadenceRpm] = useState<number | undefined>(initialValues?.cadenceRpm ?? 80);
  const [gradientPct, setGradientPct] = useState<number | undefined>(initialValues?.gradientPct ?? 8);

  useCalculatorValuesChange({ drivetrainType, bikeType, climbBand, outerChainringTeeth, innerChainringTeeth,
    cassetteSmallestCogTeeth, cassetteLargestCogTeeth, wheelCircumferenceMm, cadenceRpm, gradientPct },
  edited ? onValuesChange : undefined);

  const validationIssues = useMemo(
    () =>
      validateGearingInputs(
        {
          drivetrainType,
          outerChainringTeeth,
          innerChainringTeeth,
          cassetteSmallestCogTeeth,
          cassetteLargestCogTeeth,
          wheelCircumferenceMm,
          cadenceRpm,
          gradientPct,
          bikeType,
          climbBand,
        },
        isNl,
      ),
    [
      drivetrainType,
      outerChainringTeeth,
      innerChainringTeeth,
      cassetteSmallestCogTeeth,
      cassetteLargestCogTeeth,
      wheelCircumferenceMm,
      cadenceRpm,
      gradientPct,
      bikeType,
      climbBand,
      isNl,
    ],
  );

  const result: GearingCalculationResult | null = useMemo(() => {
    if (validationIssues.some((issue) => issue.severity === "error")) {
      return null;
    }

    return calculateGearing(
      {
        drivetrainType,
        outerChainringTeeth,
        innerChainringTeeth,
        cassetteSmallestCogTeeth,
        cassetteLargestCogTeeth,
        wheelCircumferenceMm,
        cadenceRpm,
        gradientPct,
        bikeType,
        climbBand,
      },
      isNl,
    );
  }, [
    validationIssues,
    drivetrainType,
    outerChainringTeeth,
    innerChainringTeeth,
    cassetteSmallestCogTeeth,
    cassetteLargestCogTeeth,
    wheelCircumferenceMm,
    cadenceRpm,
    gradientPct,
    bikeType,
    climbBand,
    isNl,
  ]);

  const resultModel = result?.resultEnvelope ?? null;
  const errorMessages = validationIssues
    .filter((issue) => issue.severity === "error")
    .map((issue) => issue.message);

  /* eslint-disable react-hooks/set-state-in-effect -- Hydrate the once-only client session snapshot. */
  useEffect(() => {
    if (!handoff.ready || prefilled.current || accountMode) return;
    prefilled.current = true;
    const fields: HandoffField[] = [];
    const mappings = [
      ["outerChainringTeeth", setOuterChainringTeeth, 20, 70],
      ["innerChainringTeeth", setInnerChainringTeeth, 20, 70],
      ["cassetteSmallestCogTeeth", setCassetteSmallestCogTeeth, 9, 54],
      ["cassetteLargestCogTeeth", setCassetteLargestCogTeeth, 9, 54],
    ] as const;
    for (const [field, setter, min, max] of mappings) {
      const entry = handoff.getPrefill(field);
      if (typeof entry?.value !== "number" || entry.value < min || entry.value > max) continue;
      setter(entry.value);
      if (field.startsWith("cassette")) setCassettePreset("custom");
      fields.push(field);
    }
    setPrefilledFields(fields);
    if (fields.length) setEdited(true);
  }, [handoff, accountMode]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function slider(
    label: string,
    value: number | undefined,
    onChange: (value: number) => void,
    min: number,
    max: number,
    unit: string,
    step = 1,
  ) {
    return (
      <Slider
        label={label}
        value={value ?? min}
        onChange={(next) => {
          onChange(next);
          setEdited(true);
        }}
        min={min}
        max={max}
        step={step}
        valueLabel={format(value ?? min)}
        unit={unit}
        aria-valuetext={`${format(value ?? min)} ${unit}`}
      />
    );
  }
  function choices<T extends string>(
    label: string,
    options: Record<T, string>,
    value: T,
    onChange: (value: T) => void,
  ) {
    return (
      <fieldset className="min-w-0">
        <legend className="mb-3 font-semibold">{label}</legend>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(options) as [T, string][]).map(([key, label]) => (
            <OptionCard
              key={key}
              label={label}
              selected={value === key}
              showCheck={false}
              className="min-w-0 px-3 text-sm"
              onClick={() => {
                onChange(key);
                setEdited(true);
              }}
            />
          ))}
        </div>
      </fieldset>
    );
  }
  return (
    <ConfiguratorLayout
      notice={!accountMode && <HandoffPrefillNotice calculator="gearing" locale={locale} fields={prefilledFields} />}
      afterResults={!accountMode && <PersonalizeAdviceBlock calculator="gearing" locale={locale} />}
      navigation={headerSlot}
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={description ?? copy.intro}
      inputs={
        <>
          {statusSlot}
          <StepCard number={1} title={copy.drivetrain}>
            {choices(copy.drivetrain, { "1x": "1×", "2x": "2×" }, drivetrainType, (value) => {
              setDrivetrainType(value);
              if (value === "1x") handoff.remove("innerChainringTeeth");
            })}
            {slider(copy.outer, outerChainringTeeth, (value) => {
              setOuterChainringTeeth(value);
              handoff.touch("outerChainringTeeth", value, "teeth", "bike");
            }, 20, 70, "T")}
            {drivetrainType === "2x" &&
              slider(copy.inner, innerChainringTeeth, (value) => {
                setInnerChainringTeeth(value);
                handoff.touch("innerChainringTeeth", value, "teeth", "bike");
              }, 20, 70, "T")}
            {choices(
              copy.cassette,
              Object.fromEntries(
                CASSETTE_PRESET_OPTIONS.map((option) => [
                  option.value,
                  option.value === "custom" ? copy.custom : option.label,
                ]),
              ),
              cassettePreset,
              (value) => {
                setCassettePreset(value);
                const preset = CASSETTE_PRESET_OPTIONS.find((option) => option.value === value);
                if (preset && value !== "custom") {
                  setCassetteSmallestCogTeeth(preset.smallest);
                  handoff.touch("cassetteSmallestCogTeeth", preset.smallest, "teeth", "bike");
                  handoff.touch("cassetteLargestCogTeeth", preset.largest, "teeth", "bike");
                  setCassetteLargestCogTeeth(preset.largest);
                }
              },
            )}
            {slider(
              copy.small,
              cassetteSmallestCogTeeth,
              (value) => {
                setCassettePreset("custom");
                setCassetteSmallestCogTeeth(value);
                handoff.touch("cassetteSmallestCogTeeth", value, "teeth", "bike");
              },
              9,
              54,
              "T",
            )}
            {slider(
              copy.large,
              cassetteLargestCogTeeth,
              (value) => {
                setCassettePreset("custom");
                setCassetteLargestCogTeeth(value);
                handoff.touch("cassetteLargestCogTeeth", value, "teeth", "bike");
              },
              9,
              54,
              "T",
            )}
          </StepCard>
          <StepCard number={2} title={copy.wheels}>
            {choices(copy.wheelPreset, { ...copy.wheelLabels, custom: copy.custom }, wheelPreset, (value) => {
              setWheelPreset(value);
              const circumference = WHEEL_PRESET_VALUES.get(value);
              if (circumference !== undefined) setWheelCircumferenceMm(circumference);
            })}
            {slider(
              copy.circumference,
              wheelCircumferenceMm,
              (value) => {
                setWheelPreset("custom");
                setWheelCircumferenceMm(value);
              },
              1800,
              2600,
              "mm",
            )}
            {slider(copy.cadence, cadenceRpm, setCadenceRpm, 40, 130, "rpm")}
          </StepCard>
          <StepCard number={3} title={copy.context}>
            {choices(copy.bike, copy.bikes, bikeType, setBikeType)}
            {choices(copy.climb, copy.bands, climbBand, setClimbBand)}
            {slider(copy.gradient, gradientPct, setGradientPct, 0, 25, "%", 0.1)}
          </StepCard>
          {errorMessages.length > 0 && (
            <section role="alert" className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-bold">{copy.check}</h2>
              <ul className="mt-3 list-inside list-disc">
                {errorMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      }
      results={
        <>
          <div id="gearing-result" className="scroll-mt-8">
            {result ? (
              <ResultHero
                label={edited || accountMode ? copy.ratio : `${copy.example} · ${copy.ratio}`}
                value={format(result.easiest.ratio)}
                subtext={copy.limits}
              >
                <svg viewBox="0 0 500 200" className="w-full" role="img" aria-label={copy.diagram}>
                  <path
                    d={`M130 ${100 - result.easiest.chainringTeeth}L370 ${100 - result.easiest.cogTeeth}
              M130 ${100 + result.easiest.chainringTeeth}L370 ${100 + result.easiest.cogTeeth}`}
                    stroke="var(--bbf-inkt)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="130"
                    cy="100"
                    r={result.easiest.chainringTeeth}
                    data-testid="gearing-chainring"
                    fill="var(--bbf-papier)"
                    stroke="var(--bbf-inkt)"
                    strokeWidth="5"
                    strokeDasharray="4 3"
                  />
                  <circle
                    cx="370"
                    cy="100"
                    r={result.easiest.cogTeeth}
                    fill="var(--bbf-papier)"
                    stroke="var(--bbf-inkt)"
                    strokeWidth="5"
                    strokeDasharray="4 3"
                  />
                </svg>
              </ResultHero>
            ) : (
              <p role="status" className="rounded-3xl border border-border bg-card p-6">
                {copy.noResult}
              </p>
            )}
          </div>
          {result && (
            <>
              <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {copy.ratio}: {format(result.easiest.ratio)}. {copy.verdicts[result.recommendation.label]}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <ResultTile
                  label={copy.easiest}
                  value={`${result.easiest.chainringTeeth} × ${result.easiest.cogTeeth}`}
                />
                <ResultTile
                  label={copy.hardest}
                  value={`${result.hardest.chainringTeeth} × ${result.hardest.cogTeeth}`}
                />
                <ResultTile
                  label={copy.development}
                  value={format(result.easiest.developmentMeters)}
                  unit="m"
                />
                <ResultTile label={copy.speed} value={format(result.easiest.speedKmh)} unit={copy.kmh} />
                <ResultTile label={copy.span} value={format(result.gearSpan)} unit="×" />
                <ResultTile label={copy.hardest} value={format(result.hardest.speedKmh)} unit={copy.kmh} />
              </div>
              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="font-display text-2xl font-bold">{copy.verdict}</h2>
                <p className="my-3 font-semibold">{copy.verdicts[result.recommendation.label]}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{result.recommendation.text}</p>
              </section>
              <PublicCalculatorResultSummary result={resultModel ?? result.resultEnvelope} isNl={isNl} />
            </>
          )}
          <section className="rounded-3xl bg-[var(--bbf-inkt)] p-6 text-[var(--bbf-wit)]">
            <h2 className="font-display text-2xl font-bold text-[var(--bbf-wit)]">{copy.next}</h2>
            <p className="my-4 text-[var(--bbf-op-donker)]">{copy.nextBody}</p>
            <Link
              href={withLocalePrefix(accountMode ? "/tools/climb-planner" : "/calculators/climb-planner", locale)}
              className={
                  "inline-flex min-h-11 items-center rounded-full bg-primary px-5 " +
                  "font-bold text-primary-foreground"
                }
            >
              {copy.nextLink}
            </Link>
          </section>
        </>
      }
      stickyResult={
        <a href="#gearing-result" className="flex min-h-11 items-center justify-between gap-3">
          <span className="text-sm font-bold">{copy.resultLink}</span>
          <span className="font-mono text-2xl">{result ? format(result.easiest.ratio) : "—"}</span>
        </a>
      }
    />
  );
}
