"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AdjustOrder,
  Button,
  ConfiguratorLayout,
  OptionCard,
  ResultHero,
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
import { runSaddleHeightCalculation } from "@/lib/public-calculators/fitAdapters";
import { saddleHeightMessages, type SaddleHeightMessages } from "@/i18n/calculators/saddleHeight";
import { withLocalePrefix } from "@/i18n/navigation";

const CATEGORIES: BikeCategory[] = ["road", "gravel", "mtb", "city"];
const GOALS: Ambition[] = ["comfort", "balanced", "performance", "aero"];
// Comparison-only UI bounds span all saddle guardrails for the supported 55–105 cm inseam.
// This measurement never changes engine inputs, and is never clamped to a new recommendation.
const CURRENT_HEIGHT_RANGE = { min: 400, max: 1100, step: 1 };

function PedalIllustration({ height, copy }: { height: number; copy: SaddleHeightMessages }) {
  // Schematic geometry responds to the real height. It is not biomechanical angle estimation.
  const fraction = Math.max(0, Math.min(1, (height - 473) / (956 - 473)));
  const hipY = 108 - fraction * 55;
  const kneeX = 150 + fraction * 24;
  const kneeY = 195 - fraction * 28;
  return (
    <figure className="flex min-w-0 flex-col items-center rounded-3xl bg-[var(--bbf-lime)] p-4 text-[var(--bbf-inkt)]">
      <figcaption className="text-center text-sm font-bold">{copy.visualTitle}</figcaption>
      <svg
        viewBox="0 0 240 330"
        role="img"
        aria-label={copy.visualAlt}
        className="h-[270px] w-full max-w-[240px]"
        fill="none"
      >
        <path
          d={`M70 ${hipY + 10} L120 277 L182 277`}
          stroke="var(--bbf-petrol)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={`M49 ${hipY} Q73 ${hipY - 12} 106 ${hipY - 4}`}
          stroke="var(--bbf-petrol)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <line
          x1="82"
          y1={hipY - 6}
          x2={kneeX}
          y2={kneeY}
          stroke="var(--bbf-inkt)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <line
          x1={kneeX}
          y1={kneeY}
          x2="120"
          y2="300"
          stroke="var(--bbf-inkt)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path d="M112 304h56" stroke="var(--bbf-inkt)" strokeWidth="10" strokeLinecap="round" />
        <circle
          cx={kneeX}
          cy={kneeY}
          r="9"
          fill="var(--bbf-wit)"
          stroke="var(--bbf-inkt)"
          strokeWidth="4"
        />
        <path
          d={`M82 ${hipY} L82 305`}
          stroke="var(--bbf-inkt)"
          strokeOpacity="0.3"
          strokeWidth="2"
          strokeDasharray="4 5"
        />
      </svg>
      <p className="text-center text-xs leading-relaxed">{copy.visualDisclaimer}</p>
    </figure>
  );
}

export function SaddleHeightCalculatorForm({
  isNl = false,
  copy = saddleHeightMessages[isNl ? "nl" : "en"],
}: {
  isNl?: boolean;
  copy?: SaddleHeightMessages;
}) {
  const locale = isNl ? "nl" : "en";
  const number = new Intl.NumberFormat(isNl ? "nl-NL" : "en-GB", { maximumFractionDigits: 1 });
  const [inseamCm, setInseamCm] = useState(84);
  const [source, setSource] = useState<"missing" | "measured" | "estimated">("missing");
  const [category, setCategory] = useState<BikeCategory>("road");
  const [ambition, setAmbition] = useState<Ambition>("balanced");
  const [flexibility, setFlexibility] = useState<PublicFitScore>(3);
  const [core, setCore] = useState<PublicFitScore>(3);
  const [compare, setCompare] = useState(false);
  const [current, setCurrent] = useState(750);
  const [currentConfirmed, setCurrentConfirmed] = useState(false);
  const example = source === "missing";
  const baseline = useMemo(
    () =>
      createPublicFitBaseline({
        inseamCm: example ? undefined : inseamCm,
        inseamSource: source,
        bikeCategory: category,
        ridingGoal: ambition,
        flexibilityScore: flexibility,
        coreStabilityScore: core,
      }),
    [example, inseamCm, source, category, ambition, flexibility, core],
  );
  const issues = useMemo(
    () => validatePublicFitBaseline(baseline, PUBLIC_FIT_REQUIREMENTS.saddleHeight, isNl),
    [baseline, isNl],
  );
  const confidence = useMemo(
    () =>
      derivePublicCalculatorConfidence({
        baseline,
        issues,
        requirements: PUBLIC_FIT_REQUIREMENTS.saddleHeight,
        isNl,
      }),
    [baseline, issues, isNl],
  );
  const result = useMemo(
    () =>
      runSaddleHeightCalculation({
        inseamCm,
        category,
        ridingGoal: ambition,
        flexibility,
        coreStability: core,
        inseamSource: source,
      }),
    [inseamCm, category, ambition, flexibility, core, source],
  );
  const delta = result.height - current;
  const currentStatus =
    current < result.range.min ? "below" : current > result.range.max ? "above" : "inside";
  const ctaHref = withLocalePrefix("/calculators/bike-fit", locale);

  return (
    <ConfiguratorLayout
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      inputs={
        <>
          <StepCard number={1} title={copy.bodyTitle}>
            <div className="space-y-5">
              <Slider
                label={copy.inseam}
                min={55}
                max={105}
                step={0.5}
                value={inseamCm}
                valueLabel={number.format(inseamCm)}
                unit="cm"
                onChange={setInseamCm}
                helperText={copy.inseamHint}
                ticks={[{ value: 55 }, { value: 75 }, { value: 90 }, { value: 105 }]}
              />
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">{copy.sourceLabel}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <OptionCard
                    label={copy.measured}
                    description={copy.measuredHint}
                    selected={source === "measured"}
                    onClick={() => setSource("measured")}
                  />
                  <OptionCard
                    label={copy.estimated}
                    description={copy.estimatedHint}
                    selected={source === "estimated"}
                    onClick={() => setSource("estimated")}
                  />
                </div>
              </fieldset>
              {example ? (
                <p className="text-sm text-muted-foreground">{copy.exampleHint}</p>
              ) : (
                <StatusChip status={source === "measured" ? "ok" : "warn"}>
                  {source === "measured" ? copy.measuredStatus : copy.estimatedStatus}
                </StatusChip>
              )}
            </div>
          </StepCard>
          <StepCard number={2} title={copy.contextTitle}>
            <div className="space-y-6">
              <div>
                <p id="saddle-category-label" className="mb-2 font-semibold">
                  {copy.category}
                </p>
                <SegmentedControl
                  aria-labelledby="saddle-category-label"
                  value={category}
                  onValueChange={(value) => setCategory(value as BikeCategory)}
                  className="grid w-full grid-cols-2 sm:grid-cols-4"
                >
                  {CATEGORIES.map((value) => (
                    <SegmentedControlItem key={value} value={value} className="min-w-0 px-2">
                      {copy.categories[value]}
                    </SegmentedControlItem>
                  ))}
                </SegmentedControl>
              </div>
              <div>
                <p id="saddle-goal-label" className="mb-2 font-semibold">
                  {copy.goal}
                </p>
                <SegmentedControl
                  aria-labelledby="saddle-goal-label"
                  value={ambition}
                  onValueChange={(value) => setAmbition(value as Ambition)}
                  className="grid w-full grid-cols-2 sm:grid-cols-4"
                >
                  {GOALS.map((value) => (
                    <SegmentedControlItem key={value} value={value} className="min-w-0 px-2">
                      {copy.goals[value]}
                    </SegmentedControlItem>
                  ))}
                </SegmentedControl>
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
            </div>
          </StepCard>
          <AdjustOrder
            title={copy.measuringTitle}
            steps={copy.measuringSteps.map((title) => ({ title }))}
            className="bg-secondary"
          />
        </>
      }
      results={
        <>
          <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {example ? copy.exampleResult : copy.result}: {number.format(result.height)} mm
          </p>
          <div
            id="saddle-result"
            tabIndex={-1}
            className="rounded-[2rem] bg-[var(--bbf-inkt)] p-5 text-[var(--bbf-wit)] focus-visible:focus-ring sm:p-7"
          >
            <div className="mb-5">
              <StatusChip status={example || source === "estimated" ? "warn" : "ok"}>
                {example ? copy.example : copy.confidenceLevels[confidence.level]}
              </StatusChip>
            </div>
            <div
              className={
                "grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.8fr)] " +
                "xl:grid-cols-[minmax(0,1fr)_minmax(160px,0.8fr)]"
              }
            >
              <ResultHero
                label={example ? copy.exampleResult : copy.result}
                value={number.format(result.height)}
                unit="mm"
                variant="ink"
                subtext={copy.reference}
                className="rounded-none p-0 sm:p-0"
              >
                <div className="border-t border-[var(--bbf-gedempt)] pt-5">
                  <p className="text-sm text-[var(--bbf-op-donker)]">{copy.band}</p>
                  <p className="mt-2 font-mono text-2xl">
                    {number.format(result.range.min)}–{number.format(result.range.max)}{" "}
                    <span className="text-sm text-[var(--bbf-op-donker)]">mm</span>
                  </p>
                </div>
              </ResultHero>
              <PedalIllustration height={result.height} copy={copy} />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-[var(--bbf-op-donker)]">
              {copy.bandHint}
            </p>
          </div>
          <section
            aria-label={copy.compareTitle}
            className="rounded-3xl border border-border bg-card p-5 sm:p-6"
          >
            <h2 className="font-display text-2xl font-bold">{copy.compareTitle}</h2>
            <Button
              className="mt-4 w-full whitespace-normal"
              variant="outline"
              aria-expanded={compare}
              aria-controls="saddle-comparison"
              onClick={() => setCompare(!compare)}
            >
              {compare ? copy.compareHide : copy.compareToggle}
            </Button>
            {compare && (
              <div id="saddle-comparison" className="mt-5 space-y-4">
                <Slider
                  label={copy.current}
                  {...CURRENT_HEIGHT_RANGE}
                  value={current}
                  unit="mm"
                  onChange={setCurrent}
                  helperText={copy.currentHint}
                />
                {!currentConfirmed ? (
                  <>
                    <p className="text-sm text-muted-foreground">{copy.currentExample}</p>
                    <Button
                      variant="secondary"
                      className="w-full whitespace-normal"
                      onClick={() => setCurrentConfirmed(true)}
                    >
                      {copy.currentConfirm}
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{copy.currentConfirmed}</p>
                )}
                {!example && currentConfirmed ? (
                  <>
                    <StatusChip status={currentStatus === "inside" ? "ok" : "deviation"}>
                      {copy[currentStatus]}
                    </StatusChip>
                    <ResultTile
                      label={copy.delta}
                      value={`${delta > 0 ? "+" : ""}${number.format(delta)}`}
                      unit="mm"
                      status={delta > 0 ? copy.raise : delta < 0 ? copy.lower : copy.equal}
                    />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{copy.comparePending}</p>
                )}
              </div>
            )}
          </section>
          <AdjustOrder title={copy.orderTitle} steps={copy.orderSteps} />
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <h2 className="font-display text-xl font-bold">{copy.limitsTitle}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{copy.drivers}</p>
            <p className="mt-2 text-sm text-muted-foreground">{copy.limits}</p>
            {!example && (
              <p className="mt-2 text-sm text-muted-foreground">{copy.confidenceHint}</p>
            )}
            <Button
              role="link"
              className="mt-5 w-full whitespace-normal"
              render={<Link href={ctaHref} />}
            >
              {copy.accountCta}
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">{copy.accountHint}</p>
          </section>
        </>
      }
      stickyResult={
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {example ? copy.exampleResult : copy.result}
            </p>
            <p className="font-mono text-2xl">
              {number.format(result.height)}{" "}
              <span className="text-sm text-muted-foreground">mm</span>
            </p>
          </div>
          <a
            href="#saddle-result"
            className={
              "flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold " +
              "text-primary-foreground focus-visible:focus-ring"
            }
          >
            {copy.stickyLink}
          </a>
        </div>
      }
    />
  );
}
