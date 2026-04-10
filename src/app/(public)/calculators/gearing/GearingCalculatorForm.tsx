"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ArrowUpDown, Gauge, ShieldCheck } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import {
  PublicCalculatorResultSummary,
  PublicInfoPanel,
  PublicMetricPanel,
  PublicNumberField,
  PublicSelectField,
  PublicSurfaceCard,
} from "@/components/public";
import { getConfidenceLabel } from "@/lib/publicCalculatorLogic";
import { calculateGearingAnalysis } from "@/lib/gearing-engine";
import {
  calculateGearing,
  DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE,
  formatGearRatio,
  formatGearSpan,
  formatSpeedKmh,
  type GearingBikeType,
  type GearingClimbBand,
  type GearingDrivetrainType,
  type GearingCalculationResult,
  validateGearingInputs,
} from "./gearing-engine";

const DRIVETRAIN_OPTIONS = [
  { value: "2x", label: "2x" },
  { value: "1x", label: "1x" },
];

const BIKE_TYPE_OPTIONS = [
  { value: "road", label: "Road" },
  { value: "gravel", label: "Gravel" },
  { value: "mtb", label: "MTB" },
  { value: "commuter", label: "Commuter" },
];

const CLIMB_BAND_OPTIONS = [
  { value: "short", label: "Short < 3 km" },
  { value: "medium", label: "Medium 3-8 km" },
  { value: "long", label: "Long 8-20 km" },
  { value: "alpine", label: "Alpine 20 km+" },
];

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

function formatClimbBandLabel(climbBand: GearingClimbBand, isNl: boolean) {
  switch (climbBand) {
    case "short":
      return isNl ? "Kort < 3 km" : "Short < 3 km";
    case "medium":
      return isNl ? "Middel 3-8 km" : "Medium 3-8 km";
    case "long":
      return isNl ? "Lang 8-20 km" : "Long 8-20 km";
    case "alpine":
      return isNl ? "Alpine 20 km+" : "Alpine 20 km+";
  }
}

function formatBikeTypeLabel(bikeType: GearingBikeType, isNl: boolean) {
  switch (bikeType) {
    case "road":
      return isNl ? "Race" : "Road";
    case "gravel":
      return "Gravel";
    case "mtb":
      return "MTB";
    case "commuter":
      return isNl ? "Woon-werk / stadsfiets" : "Commuter";
  }
}

function buildPresetValueMap() {
  return new Map(
    WHEEL_PRESET_OPTIONS.map((option) => [
      option.value,
      DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE[option.value as GearingBikeType],
    ])
  );
}

const WHEEL_PRESET_VALUES = buildPresetValueMap();

type Props = {
  isNl: boolean;
};

export function GearingCalculatorForm({ isNl }: Props) {
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
    DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE.road
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
        isNl
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
    ]
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
      isNl
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
  const confidenceLabel = result
    ? getConfidenceLabel(result.confidence.level, isNl)
    : isNl
      ? "Lagere betrouwbaarheid"
      : "Lower confidence";
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
                (value): value is number => typeof value === "number"
              )
            : [outerChainringTeeth].filter((value): value is number => typeof value === "number");
        const cassetteTeeth = [cassetteSmallestCogTeeth, cassetteLargestCogTeeth].filter(
          (value): value is number => typeof value === "number"
        );
        const input = {
          drivetrainType,
          chainrings,
          cassetteTeeth,
          wheelCircumferenceMm:
            wheelCircumferenceMm ?? DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE.road,
          cadenceRpm: cadenceRpm ?? 80,
          bikeType:
            bikeType === "mtb"
              ? "mountain"
              : bikeType === "commuter"
                ? "city"
                : bikeType,
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
                  (value): value is number => typeof value === "number"
                )
              : [outerChainringTeeth].filter((value): value is number => typeof value === "number"),
          cassetteTeeth: [cassetteSmallestCogTeeth, cassetteLargestCogTeeth].filter(
            (value): value is number => typeof value === "number"
          ),
          wheelCircumferenceMm:
            wheelCircumferenceMm ?? DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE.road,
          cadenceRpm: cadenceRpm ?? 80,
          bikeType:
            bikeType === "mtb"
              ? "mountain"
              : bikeType === "commuter"
                ? "city"
                : bikeType,
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
                  (value): value is number => typeof value === "number"
                )
              : [outerChainringTeeth].filter((value): value is number => typeof value === "number"),
          cassetteTeeth: [cassetteSmallestCogTeeth, cassetteLargestCogTeeth].filter(
            (value): value is number => typeof value === "number"
          ),
          wheelCircumferenceMm:
            wheelCircumferenceMm ?? DEFAULT_WHEEL_CIRCUMFERENCE_MM_BY_BIKE_TYPE.road,
          cadenceRpm: cadenceRpm ?? 80,
          bikeType:
            bikeType === "mtb"
              ? "mountain"
              : bikeType === "commuter"
                ? "city"
                : bikeType,
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

  const cassettePresetOptions = isNl
    ? CASSETTE_PRESET_OPTIONS.map((option) => ({
        value: option.value,
        label:
          option.value === "custom"
            ? "Aangepast"
            : option.label,
      }))
    : CASSETTE_PRESET_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      }));

  const wheelPresetOptions = isNl
    ? WHEEL_PRESET_OPTIONS.map((option) => ({
        value: option.value,
        label:
          option.value === "road"
            ? "Weg 700 x 25 / 28"
            : option.value === "gravel"
              ? "Gravel 700 x 38 / 40"
              : option.value === "mtb"
                ? "MTB 29 x 2.3"
                : "Woon-werk / hybride",
      }))
    : WHEEL_PRESET_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      }));

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <PublicSurfaceCard
        title={isNl ? "Bouw je setup" : "Build your setup"}
        description={
          isNl
            ? "Gebruik de kettingring, cassette en wielomtrek van je echte fiets. De tool geeft exacte verzetmath en een eenvoudige kliminschatting."
            : "Use the chainring, cassette, and wheel circumference from your real bike. The tool gives exact gearing math and a simple climb-readiness readout."
        }
        className="public-calculator-card rounded-[1.75rem]"
      >
        <div className="space-y-6">
          <PublicInfoPanel
            tone="primary"
            icon={<ShieldCheck className="h-4 w-4" />}
            title={isNl ? "Exacte math, eenvoudige uitleg" : "Exact math, simple explanation"}
          >
            {isNl
              ? "De gear ratio en snelheid worden exact berekend. De klimbeoordeling blijft een praktische vuistregel op basis van helling, band en fietstype."
              : "Gear ratio and speed are calculated exactly. The climb verdict is a practical ruleset based on gradient, band, and bike type."}
          </PublicInfoPanel>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {confidenceLabel}
            </span>
            <p className="text-sm text-muted-foreground">
              {isNl
                ? "De standaardwaarden geven direct een bruikbaar startpunt. Wijzig ze naar je eigen setup voor een preciezere vergelijking."
                : "The defaults give you a useful starting point right away. Change them to your own setup for a more precise comparison."}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <PublicSelectField
              label={isNl ? "Drivetrain" : "Drivetrain"}
              description={isNl ? "Kies 1x of 2x." : "Choose 1x or 2x."}
              options={DRIVETRAIN_OPTIONS}
              value={drivetrainType}
              onChange={(value) => setDrivetrainType(value as GearingDrivetrainType)}
            />
            <PublicSelectField
              label={isNl ? "Fietstype" : "Bike type"}
              description={
                isNl
                  ? "Dit verfijnt de climbevaluatie."
                  : "This refines the climb-readiness verdict."
              }
              options={BIKE_TYPE_OPTIONS.map((option) => ({
                value: option.value,
                label: formatBikeTypeLabel(option.value as GearingBikeType, isNl),
              }))}
              value={bikeType}
              onChange={(value) => setBikeType(value as GearingBikeType)}
            />
            <PublicSelectField
              label={isNl ? "Klimlengte" : "Climb length"}
              description={
                isNl
                  ? "Gebruik de band die het dichtst bij je route ligt."
                  : "Pick the band closest to your route."
              }
              options={CLIMB_BAND_OPTIONS.map((option) => ({
                value: option.value,
                label: isNl
                  ? formatClimbBandLabel(option.value as GearingClimbBand, true)
                  : option.label,
              }))}
              value={climbBand}
              onChange={(value) => setClimbBand(value as GearingClimbBand)}
            />
            <PublicSelectField
              label={isNl ? "Wielmaat preset" : "Wheel preset"}
              description={
                isNl
                  ? "Kies een snelle omtrekinschatting of pas daarna handmatig aan."
                  : "Choose a quick circumference estimate, then tweak it manually if needed."
              }
              options={wheelPresetOptions}
              value={wheelPreset}
              onChange={(value) => {
                setWheelPreset(value);
                const circumference = WHEEL_PRESET_VALUES.get(value as GearingBikeType);
                if (circumference !== undefined) {
                  setWheelCircumferenceMm(circumference);
                }
              }}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <PublicNumberField
              label={isNl ? "Kettingring buiten" : "Outer chainring"}
              description={
                isNl
                  ? "Voor 1x gebruik je hier je enige kettingring."
                  : "For 1x, this is your only chainring."
              }
              min={20}
              max={70}
              step={1}
              unit="T"
              value={outerChainringTeeth}
              onChange={setOuterChainringTeeth}
              placeholder={isNl ? "Bijv. 50" : "e.g. 50"}
            />
            {drivetrainType === "2x" ? (
              <PublicNumberField
                label={isNl ? "Kettingring binnen" : "Inner chainring"}
                description={
                  isNl
                    ? "De kleinere ring bepaalt je lichtste versnelling."
                    : "The smaller ring determines your easiest gear."
                }
                min={20}
                max={70}
                step={1}
                unit="T"
                value={innerChainringTeeth}
                onChange={setInnerChainringTeeth}
                placeholder={isNl ? "Bijv. 34" : "e.g. 34"}
              />
            ) : (
              <PublicInfoPanel
                tone="secondary"
                icon={<ArrowUpDown className="h-4 w-4" />}
                title={isNl ? "1x setup" : "1x setup"}
              >
                {isNl
                  ? "Je hoeft hier maar één kettingring te beheren. De grootste krans in de cassette is je lichtste versnelling."
                  : "You only need one chainring here. The largest cassette cog becomes your easiest gear."}
              </PublicInfoPanel>
            )}
            <PublicSelectField
              label={isNl ? "Cassette preset" : "Cassette preset"}
              description={
                isNl
                  ? "Start snel met een bekende cassette en verfijn dan de kransmaten."
                  : "Start with a known cassette, then fine-tune the cog sizes."
              }
              options={cassettePresetOptions}
              value={cassettePreset}
              onChange={(value) => {
                setCassettePreset(value);
                const preset = CASSETTE_PRESET_OPTIONS.find((option) => option.value === value);
                if (preset) {
                  setCassetteSmallestCogTeeth(preset.smallest);
                  setCassetteLargestCogTeeth(preset.largest);
                }
              }}
            />
            <PublicNumberField
              label={isNl ? "Kleinste krans" : "Smallest cog"}
              description={
                isNl
                  ? "Gebruik het kleinste tandwiel van je cassette."
                  : "Use the smallest cog on your cassette."
              }
              min={9}
              max={54}
              step={1}
              unit="T"
              value={cassetteSmallestCogTeeth}
              onChange={setCassetteSmallestCogTeeth}
              placeholder={isNl ? "Bijv. 11" : "e.g. 11"}
            />
            <PublicNumberField
              label={isNl ? "Grootste krans" : "Largest cog"}
              description={
                isNl
                  ? "Dit is je lichtste versnelling voor klimmen."
                  : "This is your easiest gear for climbing."
              }
              min={9}
              max={54}
              step={1}
              unit="T"
              value={cassetteLargestCogTeeth}
              onChange={setCassetteLargestCogTeeth}
              placeholder={isNl ? "Bijv. 34" : "e.g. 34"}
            />
            <PublicNumberField
              label={isNl ? "Wielomtrek" : "Wheel circumference"}
              description={
                isNl
                  ? "Pas deze aan als je je exacte omtrek kent."
                  : "Adjust this if you know your exact circumference."
              }
              min={1800}
              max={2600}
              step={1}
              unit="mm"
              value={wheelCircumferenceMm}
              onChange={setWheelCircumferenceMm}
              placeholder={isNl ? "Bijv. 2148" : "e.g. 2148"}
            />
            <PublicNumberField
              label={isNl ? "Trapfrequentie" : "Cadence"}
              description={
                isNl
                  ? "Gebruik je normale klimpas."
                  : "Use your usual climbing cadence."
              }
              min={40}
              max={130}
              step={1}
              unit="rpm"
              value={cadenceRpm}
              onChange={setCadenceRpm}
              placeholder="80"
            />
            <PublicNumberField
              label={isNl ? "Klimhelling" : "Climb gradient"}
              description={
                isNl
                  ? "De tool gebruikt dit om de lichte versnelling te beoordelen."
                  : "The tool uses this to judge the easy gear against the climb."
              }
              min={0}
              max={25}
              step={0.1}
              unit="%"
              value={gradientPct}
              onChange={setGradientPct}
              placeholder={isNl ? "Bijv. 8" : "e.g. 8"}
            />
          </div>

          {errorMessages.length > 0 ? (
            <PublicInfoPanel tone="warning" role="alert" title={isNl ? "Controleer de invoer" : "Check the input"}>
              <ul className="space-y-1">
                {errorMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </PublicInfoPanel>
          ) : null}
        </div>
      </PublicSurfaceCard>

      <PublicSurfaceCard
        title={isNl ? "Resultaat" : "Result"}
        description={
          isNl
            ? "De lichtste en zwaarste versnelling, plus een snelle kliminschatting."
            : "Your easiest and hardest gears, plus a quick climb-readiness readout."
        }
        className="public-calculator-card rounded-[1.75rem]"
      >
        <div className="space-y-5">
          {result ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <PublicMetricPanel
                  label={isNl ? "Lichtste versnelling" : "Easiest gear"}
                  value={`${result.easiest.chainringTeeth} x ${result.easiest.cogTeeth}`}
                  description={
                    isNl
                      ? `${formatGearRatio(result.easiest.ratio)} ratio · ${result.easiest.gearInches.toFixed(1)} gear inches`
                      : `${formatGearRatio(result.easiest.ratio)} ratio · ${result.easiest.gearInches.toFixed(1)} gear inches`
                  }
                  icon={<ArrowUpDown className="h-4 w-4" />}
                />
                <PublicMetricPanel
                  label={isNl ? "Zwaarste versnelling" : "Hardest gear"}
                  value={`${result.hardest.chainringTeeth} x ${result.hardest.cogTeeth}`}
                  description={
                    isNl
                      ? `${formatGearRatio(result.hardest.ratio)} ratio · ${result.hardest.gearInches.toFixed(1)} gear inches`
                      : `${formatGearRatio(result.hardest.ratio)} ratio · ${result.hardest.gearInches.toFixed(1)} gear inches`
                  }
                  icon={<Gauge className="h-4 w-4" />}
                  accent="success"
                />
                <PublicMetricPanel
                  label={isNl ? "Snelheid in lichtste versnelling" : "Speed in easiest gear"}
                  value={formatSpeedKmh(result.easiest.speedKmh)}
                  description={
                    isNl
                      ? `Bij ${cadenceRpm?.toFixed(0)} rpm op een ${gradientPct?.toFixed(1)}% klim.`
                      : `At ${cadenceRpm?.toFixed(0)} rpm on a ${gradientPct?.toFixed(1)}% climb.`
                  }
                />
                <PublicMetricPanel
                  label={isNl ? "Snelheid in zwaarste versnelling" : "Speed in hardest gear"}
                  value={formatSpeedKmh(result.hardest.speedKmh)}
                  description={
                    isNl
                      ? `Handig om je top-end bereik te zien op vlak terrein.`
                      : `Useful for seeing your top-end range on flatter roads.`
                  }
                  accent="warning"
                />
              </div>

              <PublicMetricPanel
                label={isNl ? "Versnellingsbereik" : "Gear span"}
                value={formatGearSpan(result.gearSpan)}
                description={
                  isNl
                    ? "Hoe groter dit getal, hoe ruimer je bereik tussen lichtste en zwaarste versnelling."
                    : "The larger this is, the wider your spread from easiest to hardest gear."
                }
                icon={<ShieldCheck className="h-4 w-4" />}
              />

              <div className="rounded-2xl border border-border/70 bg-card px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {isNl ? "Kliminschatting" : "Climb verdict"}
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {result.recommendation.label === "suitable"
                    ? isNl
                      ? "Geschikt"
                      : "Suitable"
                    : result.recommendation.label === "challenging"
                      ? isNl
                        ? "Uitdagend"
                        : "Challenging"
                      : isNl
                        ? "Waarschijnlijk te zwaar"
                        : "Likely overgeared"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {result.recommendation.text}
                </p>
              </div>

              <PublicCalculatorResultSummary
                result={resultModel ?? result.resultEnvelope}
                isNl={isNl}
              />
            </>
          ) : (
            <PublicInfoPanel tone="warning" title={isNl ? "Nog geen resultaat" : "No result yet"}>
              {isNl
                ? "Vul de vereiste verzetgegevens in om de lichtste en zwaarste versnelling te zien."
                : "Fill in the required gearing inputs to see your easiest and hardest gear."}
            </PublicInfoPanel>
          )}
        </div>
      </PublicSurfaceCard>
    </section>
  );
}
