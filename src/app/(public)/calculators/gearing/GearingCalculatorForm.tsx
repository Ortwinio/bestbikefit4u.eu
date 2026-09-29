"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import { PublicCalculatorResultSummary } from "@/components/public";
import { ConfiguratorLayout, OptionCard, ResultHero, ResultTile, Slider, StepCard } from "@/components/ui";
import { gearingMessages } from "@/i18n/calculators/gearing";
import { withLocalePrefix } from "@/i18n/navigation";
import { calculateGearingAnalysis } from "@/lib/gearing-engine";
import {
  calculateGearing,
  DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE,
  type GearingBikeType,
  type GearingClimbBand,
  type GearingDrivetrainType,
  type GearingCalculationResult,
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
};

export function GearingCalculatorForm({ isNl }: Props) {
  const locale = isNl ? "nl" : "en";
  const copy = gearingMessages[locale];
  const [edited, setEdited] = useState(false);
  const format = (value: number, digits = 2) =>
    new Intl.NumberFormat(locale, {
      maximumFractionDigits: digits,
    }).format(value);
  const saveSession = useMutation(api.gearing.mutations.createPublicGearingSession);
  const savedSignatureRef = useRef<string | null>(null);
  const [drivetrainType, setDrivetrainType] = useState<GearingDrivetrainType>("2x");
  const [bikeType, setBikeType] = useState<GearingBikeType>("road");
  const [climbBand, setClimbBand] = useState<GearingClimbBand>("medium");
  const [outerChainringTeeth, setOuterChainringTeeth] = useState<number | undefined>(50);
  const [innerChainringTeeth, setInnerChainringTeeth] = useState<number | undefined>(34);
  const [cassettePreset, setCassettePreset] = useState<string>("road_11_34");
  const [cassetteSmallestCogTeeth, setCassetteSmallestCogTeeth] = useState<number | undefined>(11);
  const [cassetteLargestCogTeeth, setCassetteLargestCogTeeth] = useState<number | undefined>(34);
  const [wheelPreset, setWheelPreset] = useState<string>("road");
  const [wheelCircumferenceMm, setWheelCircumferenceMm] = useState<number | undefined>(
    DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE.road,
  );
  const [cadenceRpm, setCadenceRpm] = useState<number | undefined>(80);
  const [gradientPct, setGradientPct] = useState<number | undefined>(8);

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

  useEffect(() => {
    if (!result) {
      return;
    }

    const signature = JSON.stringify({
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
      easiest: result.easiest.ratio,
      hardest: result.hardest.ratio,
      verdict: result.recommendation.label,
    });

    if (savedSignatureRef.current === signature) {
      return;
    }
    savedSignatureRef.current = signature;

    void saveSession({
      input: (() => {
        const chainrings =
          drivetrainType === "2x"
            ? [outerChainringTeeth, innerChainringTeeth].filter(
                (value): value is number => typeof value === "number",
              )
            : [outerChainringTeeth].filter((value): value is number => typeof value === "number");
        const cassetteTeeth = [cassetteSmallestCogTeeth, cassetteLargestCogTeeth].filter(
          (value): value is number => typeof value === "number",
        );
        const input = {
          drivetrainType,
          chainrings,
          cassetteTeeth,
          wheelCircumferenceMm: wheelCircumferenceMm ?? DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE.road,
          cadenceRpm: cadenceRpm ?? 80,
          bikeType: bikeType === "mtb" ? "mountain" : bikeType === "commuter" ? "city" : bikeType,
          climbGradientPct: gradientPct,
          climbLengthBand: climbBand,
        } as const;
        return input;
      })(),
      math: (() => {
        const input = {
          drivetrainType,
          chainrings:
            drivetrainType === "2x"
              ? [outerChainringTeeth, innerChainringTeeth].filter(
                  (value): value is number => typeof value === "number",
                )
              : [outerChainringTeeth].filter((value): value is number => typeof value === "number"),
          cassetteTeeth: [cassetteSmallestCogTeeth, cassetteLargestCogTeeth].filter(
            (value): value is number => typeof value === "number",
          ),
          wheelCircumferenceMm: wheelCircumferenceMm ?? DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE.road,
          cadenceRpm: cadenceRpm ?? 80,
          bikeType: bikeType === "mtb" ? "mountain" : bikeType === "commuter" ? "city" : bikeType,
          climbGradientPct: gradientPct,
          climbLengthBand: climbBand,
        } as const;
        return calculateGearingAnalysis(input).math;
      })(),
      suitability: (() => {
        const input = {
          drivetrainType,
          chainrings:
            drivetrainType === "2x"
              ? [outerChainringTeeth, innerChainringTeeth].filter(
                  (value): value is number => typeof value === "number",
                )
              : [outerChainringTeeth].filter((value): value is number => typeof value === "number"),
          cassetteTeeth: [cassetteSmallestCogTeeth, cassetteLargestCogTeeth].filter(
            (value): value is number => typeof value === "number",
          ),
          wheelCircumferenceMm: wheelCircumferenceMm ?? DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE.road,
          cadenceRpm: cadenceRpm ?? 80,
          bikeType: bikeType === "mtb" ? "mountain" : bikeType === "commuter" ? "city" : bikeType,
          climbGradientPct: gradientPct,
          climbLengthBand: climbBand,
        } as const;
        return calculateGearingAnalysis(input).suitability;
      })(),
    });
  }, [
    result,
    saveSession,
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
  ]);

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
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.intro}
      inputs={
        <>
          <StepCard number={1} title={copy.drivetrain}>
            {choices(copy.drivetrain, { "1x": "1×", "2x": "2×" }, drivetrainType, setDrivetrainType)}
            {slider(copy.outer, outerChainringTeeth, setOuterChainringTeeth, 20, 70, "T")}
            {drivetrainType === "2x" &&
              slider(copy.inner, innerChainringTeeth, setInnerChainringTeeth, 20, 70, "T")}
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
                label={edited ? copy.ratio : `${copy.example} · ${copy.ratio}`}
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
              href={withLocalePrefix("/calculators/climb-planner", locale)}
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-bold text-white"
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
