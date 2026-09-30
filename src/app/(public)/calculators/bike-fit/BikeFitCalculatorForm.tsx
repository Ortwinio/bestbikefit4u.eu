"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AdjustOrder,
  Button,
  ConfiguratorLayout,
  OptionCard,
  RadioGroup,
  ResultTile,
  SegmentedControl,
  SegmentedControlItem,
  Slider,
  StatusChip,
  StepCard,
} from "@/components/ui";
import type { Ambition, BikeCategory } from "../../../../../convex/lib/fitAlgorithm/types";
import {
  createPublicFitBaseline,
  derivePublicCalculatorConfidence,
  PUBLIC_FIT_REQUIREMENTS,
  validatePublicFitBaseline,
  type PublicFitScore,
} from "@/lib/publicCalculatorLogic";
import { runBikeFitCalculation } from "@/lib/public-calculators/fitAdapters";
import { bikeFitMessages, type BikeFitMessages } from "@/i18n/calculators/bikeFit";
import { withLocalePrefix } from "@/i18n/navigation";
import { BikeFitVisual } from "./BikeFitVisual";

const CATEGORIES: BikeCategory[] = ["road", "gravel", "mtb", "city"];
const GOALS: Ambition[] = ["comfort", "balanced", "performance", "aero"];
const SOURCES = ["missing", "measured", "estimated"] as const;

interface Props {
  isNl: boolean;
  copy?: BikeFitMessages;
}

export function BikeFitCalculatorForm({ isNl, copy = bikeFitMessages[isNl ? "nl" : "en"] }: Props) {
  const locale = isNl ? "nl" : "en";
  const number = new Intl.NumberFormat(isNl ? "nl-NL" : "en-GB", { maximumFractionDigits: 1 });
  const [heightCm, setHeightCm] = useState(180);
  const [inseamCm, setInseamCm] = useState(84);
  const [source, setSource] = useState<(typeof SOURCES)[number]>("missing");
  const [category, setCategory] = useState<BikeCategory>("road");
  const [ambition, setAmbition] = useState<Ambition>("balanced");
  const [flexibility, setFlexibility] = useState<PublicFitScore>(3);
  const [core, setCore] = useState<PublicFitScore>(3);
  const example = source === "missing";
  const baseline = useMemo(
    () =>
      createPublicFitBaseline({
        heightCm: example ? undefined : heightCm,
        inseamCm: example ? undefined : inseamCm,
        inseamSource: source,
        bikeCategory: category,
        ridingGoal: ambition,
        flexibilityScore: flexibility,
        coreStabilityScore: core,
      }),
    [example, heightCm, inseamCm, source, category, ambition, flexibility, core],
  );
  const issues = useMemo(
    () => validatePublicFitBaseline(baseline, PUBLIC_FIT_REQUIREMENTS.bikeFit, isNl),
    [baseline, isNl],
  );
  const confidence = useMemo(
    () =>
      derivePublicCalculatorConfidence({
        baseline,
        issues,
        requirements: PUBLIC_FIT_REQUIREMENTS.bikeFit,
        isNl,
      }),
    [baseline, issues, isNl],
  );
  // All slider combinations stay inside the real adapter's accepted hard bounds.
  const { fitResult: fit, quickEstimate } = useMemo(
    () =>
      runBikeFitCalculation({
        heightCm,
        inseamCm,
        category,
        ridingGoal: ambition,
        flexibility,
        coreStability: core,
        inseamSource: source,
      }),
    [heightCm, inseamCm, category, ambition, flexibility, core, source],
  );
  const warningTypes = [...new Set(fit.warnings.map((warning) => warning.type))];
  const band = (min: number, max: number) => `${number.format(min)}–${number.format(max)}`;
  const dropHint =
    fit.barDropMm < 0 ? copy.barsAbove : fit.barDropMm > 0 ? copy.barsBelow : copy.barsLevel;
  const adjustedAero = ambition === "aero" && (category === "mtb" || category === "city");

  return (
    <ConfiguratorLayout
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      inputs={
        <>
          <StepCard number={1} title={copy.bodyTitle}>
            <Link
              href={withLocalePrefix("/measurement-guide", locale)}
              className="flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
            >
              {copy.measureLink}
            </Link>
            <Slider
              label={copy.height}
              value={heightCm}
              valueLabel={number.format(heightCm)}
              unit="cm"
              min={130}
              max={210}
              step={1}
              onChange={setHeightCm}
              helperText={copy.heightHint}
              ticks={[{ value: 130 }, { value: 170 }, { value: 210 }]}
            />
            <Slider
              label={copy.inseam}
              value={inseamCm}
              valueLabel={number.format(inseamCm)}
              unit="cm"
              min={55}
              max={105}
              step={0.5}
              onChange={setInseamCm}
              helperText={copy.inseamHint}
              ticks={[{ value: 55 }, { value: 80 }, { value: 105 }]}
            />
            <SegmentedControl
              aria-label={copy.source}
              value={source}
              onValueChange={(value) => setSource(value as typeof source)}
              className="grid w-full grid-cols-3"
            >
              {SOURCES.map((value) => (
                <SegmentedControlItem value={value} key={value} className="min-w-0 px-2">
                  {copy.sources[value]}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
            <p className="text-sm text-muted-foreground">
              {example
                ? copy.exampleNote
                : source === "measured"
                  ? copy.measuredNote
                  : copy.estimatedNote}
            </p>
          </StepCard>
          <StepCard number={2} title={copy.ridingTitle}>
            <div>
              <p id="bike-category-label" className="mb-2 font-semibold">
                {copy.category}
              </p>
              <SegmentedControl
                aria-labelledby="bike-category-label"
                value={category}
                onValueChange={(value) => setCategory(value as BikeCategory)}
                className="grid w-full grid-cols-2 sm:grid-cols-4"
              >
                {CATEGORIES.map((value) => (
                  <SegmentedControlItem value={value} key={value} className="min-w-0 px-2">
                    {copy.categories[value]}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            </div>
            <div>
              <p id="bike-goal-label" className="mb-2 font-semibold">
                {copy.goal}
              </p>
              <RadioGroup
                aria-labelledby="bike-goal-label"
                value={ambition}
                onValueChange={(value) => setAmbition(value as Ambition)}
                className="grid-cols-2"
              >
                {GOALS.map((value) => (
                  <OptionCard
                    key={value}
                    mode="radio"
                    showCheck={false}
                    value={value}
                    label={copy.goals[value]}
                    description={copy.goalHints[value]}
                    className="min-w-0 p-3"
                  />
                ))}
              </RadioGroup>
              {adjustedAero && (
                <p className="mt-3 text-sm text-muted-foreground">{copy.aeroAdjusted}</p>
              )}
            </div>
            <Slider
              label={copy.flexibility}
              value={flexibility}
              min={1}
              max={5}
              step={1}
              valueLabel={copy.flexibilityLevels[flexibility - 1]}
              aria-valuetext={`${flexibility}: ${copy.flexibilityLevels[flexibility - 1]}`}
              onChange={(value) => setFlexibility(value as PublicFitScore)}
              helperText={copy.flexibilityHint}
            />
            <Slider
              label={copy.core}
              value={core}
              min={1}
              max={5}
              step={1}
              valueLabel={copy.coreLevels[core - 1]}
              aria-valuetext={`${core}: ${copy.coreLevels[core - 1]}`}
              onChange={(value) => setCore(value as PublicFitScore)}
              helperText={copy.coreHint}
            />
          </StepCard>
        </>
      }
      results={
        <>
          <div id="bike-fit-result" tabIndex={-1} className="scroll-mt-28 focus-visible:focus-ring">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold">{copy.confidenceLabel}</p>
              <StatusChip status={example || confidence.level !== "high" ? "warn" : "ok"}>
                {example ? copy.example : copy.confidence[confidence.level]}
              </StatusChip>
            </div>
            <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
              {example ? copy.example : copy.saddle}: {number.format(fit.saddleHeightMm)} mm
            </p>
            <BikeFitVisual fit={fit} copy={copy} />
          </div>
          <section aria-label={copy.resultsLabel} className="grid min-w-0 grid-cols-2 gap-3">
            <ResultTile
              label={copy.saddle}
              value={number.format(fit.saddleHeightMm)}
              unit="mm"
              status={
                <>
                  <p>{copy.saddleReference}</p>
                  <p className="mt-2">
                    {copy.saddleBand}:{" "}
                    <span className="font-mono">
                      {band(fit.saddleHeightRange.min, fit.saddleHeightRange.max)} mm
                    </span>
                  </p>
                </>
              }
            />
            <ResultTile
              label={copy.reach}
              value={number.format(fit.saddleToBarReachMm)}
              unit="mm"
              status={
                <>
                  <p>{copy.reachReference}</p>
                  <p className="mt-2">
                    {copy.reachBand}:{" "}
                    <span className="font-mono">
                      {band(fit.reachRange.min, fit.reachRange.max)} mm
                    </span>
                  </p>
                </>
              }
            />
            <ResultTile
              label={copy.drop}
              value={number.format(fit.barDropMm)}
              unit="mm"
              status={dropHint}
            />
            <ResultTile
              label={copy.frameSize}
              value={quickEstimate.estimatedFrameSize.replace(/ cm$/, "")}
              unit={quickEstimate.estimatedFrameSize.endsWith(" cm") ? "cm" : undefined}
              status={copy.frameHint}
            />
          </section>
          {!example && warningTypes.length > 0 && (
            <section className="rounded-3xl border border-border bg-card p-5">
              <h2 className="font-display text-xl font-bold">{copy.warningsTitle}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {warningTypes.map((type) => (
                  <li key={type}>{copy.warnings[type]}</li>
                ))}
              </ul>
            </section>
          )}
          <AdjustOrder
            title={copy.orderTitle}
            steps={[
              { title: copy.orderHeight, description: copy.orderHeightHint },
              {
                title: (
                  <>
                    {copy.orderSetback}:{" "}
                    <span className="font-mono">{number.format(fit.saddleSetbackMm)} mm</span>
                  </>
                ),
                description: copy.orderSetbackHint,
              },
              { title: copy.orderBars, description: copy.orderBarsHint },
            ]}
          />
          <section aria-label={copy.frameTargets} className="grid grid-cols-2 gap-3">
            <ResultTile
              label={copy.stack}
              value={number.format(fit.frameStackTargetMm)}
              unit="mm"
            />
            <ResultTile
              label={copy.frameReach}
              value={number.format(fit.frameReachTargetMm)}
              unit="mm"
            />
            <p className="col-span-2 px-1 text-sm text-muted-foreground">{copy.targetsHint}</p>
          </section>
          <section className="rounded-3xl bg-[var(--bbf-inkt)] p-6 text-[var(--bbf-wit)]">
            <h2 className="font-display text-2xl font-bold text-inherit">{copy.limitsTitle}</h2>
            <p className="mt-3 text-sm text-[var(--bbf-op-donker)]">{copy.limits}</p>
            <Button
              role="link"
              className="mt-5 w-full whitespace-normal"
              render={<Link href={withLocalePrefix("/login", locale)} />}
            >
              {copy.accountCta}
            </Button>
            <p className="mt-3 text-sm text-[var(--bbf-op-donker)]">{copy.accountHint}</p>
          </section>
        </>
      }
      stickyResult={
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{example ? copy.example : copy.saddle}</p>
            <p className="font-mono text-2xl">
              {number.format(fit.saddleHeightMm)} <span className="text-sm">mm</span>
            </p>
          </div>
          <a
            href="#bike-fit-result"
            className="flex min-h-11 items-center rounded-full bg-primary px-4 font-bold text-primary-foreground"
          >
            {copy.stickyLink}
          </a>
        </div>
      }
    />
  );
}
