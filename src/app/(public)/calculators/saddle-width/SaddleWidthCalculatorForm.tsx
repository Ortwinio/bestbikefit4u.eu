"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  AdjustOrder,
  Button,
  ConfiguratorLayout,
  OptionCard,
  ResultHero,
  ResultTile,
  SegmentedControl,
  SegmentedControlItem,
  SizeScale,
  Slider,
  StatusChip,
  StepCard,
} from "@/components/ui";
import {
  calculateSaddleWidth,
  classifySaddleSuitability,
  type SaddleInputMethod,
  type SaddlePostureCategory,
  type SaddleRidingType,
  type SaddleWidthInput,
} from "@/lib/saddle-width-engine";
import {
  HIP_CIRCUMFERENCE_RANGE,
  SIT_BONE_WIDTH_RANGE,
  SUPPORTED_WIDTH_RANGE,
  WIDTH_BINS,
} from "@/lib/saddle-width-engine/config";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  saddleWidthMessages,
  type SaddleWidthCalculatorCopy,
} from "@/i18n/calculators/saddleWidth";

const RIDES: SaddleRidingType[] = [
  "road_race",
  "endurance_road",
  "gravel",
  "mtb",
  "commuter_leisure",
  "tt_triathlon",
  "indoor_only",
];
const POSTURES: SaddlePostureCategory[] = ["aggressive", "balanced", "upright"];

export function SaddleWidthCalculatorForm({
  isNl = false,
  locale = isNl ? "nl" : "en",
  copy = saddleWidthMessages[locale],
  initialValues,
  onValuesChange,
  accountMode = false,
  statusSlot,
  headerSlot,
}: {
  isNl?: boolean;
  locale?: Locale;
  copy?: SaddleWidthCalculatorCopy;
  initialValues?: Partial<SaddleWidthInput>;
  onValuesChange?: (values: SaddleWidthInput) => void;
  accountMode?: boolean;
  statusSlot?: ReactNode;
  headerSlot?: ReactNode;
}) {
  const [mode, setMode] = useState<SaddleInputMethod>(initialValues?.inputMethod ?? "measured");
  const [sitBone, setSitBone] = useState(initialValues?.sitBoneWidthMm ?? 125);
  const [height, setHeight] = useState(initialValues?.heightCm ?? 180);
  const [weight, setWeight] = useState(initialValues?.weightKg ?? 75);
  const [hip, setHip] = useState(initialValues?.hipCircumferenceCm ?? 100);
  const [confirmedFields, setConfirmedFields] = useState<string[]>([]);
  const [ridingType, setRidingType] = useState<SaddleRidingType>(initialValues?.ridingType ?? "endurance_road");
  const [postureCategory, setPostureCategory] = useState<SaddlePostureCategory>(initialValues?.postureCategory ?? "balanced");
  const [saveFailed, setSaveFailed] = useState(false);
  const saveSession = useMutation(api.saddleWidth.mutations.createPublicSaddleWidthSession);
  const savedSignature = useRef<string | null>(null);
  const fields = mode === "measured" ? ["sitBone"] : ["height", "weight", "hip"];
  const confirmed = accountMode || fields.every((field) => confirmedFields.includes(field));
  function confirmField(field: string) {
    setConfirmedFields((previous) => (previous.includes(field) ? previous : [...previous, field]));
  }
  const input = useMemo<SaddleWidthInput>(
    () => ({
      inputMethod: mode,
      ridingType,
      postureCategory,
      ...(mode === "measured"
        ? { sitBoneWidthMm: sitBone }
        : { heightCm: height, weightKg: weight, hipCircumferenceCm: hip }),
    }),
    [mode, ridingType, postureCategory, sitBone, height, weight, hip],
  );
  const result = useMemo(() => {
    const width = calculateSaddleWidth(input);
    return { width, suitability: classifySaddleSuitability(input, width) };
  }, [input]);
  const previousInput = useRef(JSON.stringify(input));
  useEffect(() => {
    const signature = JSON.stringify(input);
    if (signature === previousInput.current) return;
    previousInput.current = signature;
    onValuesChange?.(input);
  }, [input, onValuesChange]);
  const { width, suitability } = result;
  const outside =
    width.finalRecommendedWidthMm < SUPPORTED_WIDTH_RANGE.min ||
    width.finalRecommendedWidthMm > SUPPORTED_WIDTH_RANGE.max;

  useEffect(() => {
    if (accountMode || !confirmed) return;
    const { inputMethod, ...measurements } = input;
    const payload = {
      ...measurements,
      measurementMethod: inputMethod,
      recommendedWidthMm: width.finalRecommendedWidthMm,
      widthRangeMinMm: width.widthRangeMinMm,
      widthRangeMaxMm: width.widthRangeMaxMm,
      primaryWidthClass: width.primaryWidthClass,
      saddleFamily: suitability.saddleFamily,
      noseType: suitability.noseType,
      profileShape: suitability.profileShape,
      cutoutRecommended: suitability.cutoutRecommended,
      paddingPreference: suitability.paddingPreference,
      confidenceScore: width.confidenceScore,
      confidenceLevel: width.confidenceLevel,
      explanationKey: width.explanationKey,
    };
    const signature = JSON.stringify(payload);
    if (savedSignature.current === signature) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      void Promise.resolve(saveSession(payload))
        .then(() => {
          if (active) {
            savedSignature.current = signature;
            setSaveFailed(false);
          }
        })
        .catch(() => {
          if (active) setSaveFailed(true);
        });
    }, 400);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [accountMode, confirmed, input, saveSession, suitability, width]);

  const label = confirmed ? copy.result : copy.exampleResult;
  const halfWidth = width.finalRecommendedWidthMm * 0.8;
  const halfSitBone = width.resolvedSitBoneWidthMm * 0.8;
  const xLeft = 250 - halfWidth;
  const xRight = 250 + halfWidth;

  return (
    <ConfiguratorLayout
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      navigation={headerSlot}
      inputs={
        <>
          {statusSlot}
          <StepCard number={1} title={copy.measurements}>
            <SegmentedControl
              aria-label={copy.method}
              className="grid w-full min-w-0 grid-cols-2"
              value={mode}
              onValueChange={(value) => setMode(value as SaddleInputMethod)}
            >
              <SegmentedControlItem
                value="measured"
                className="min-w-0 whitespace-normal px-2 text-center"
              >
                {copy.measured}
              </SegmentedControlItem>
              <SegmentedControlItem
                value="estimated"
                className="min-w-0 whitespace-normal px-2 text-center"
              >
                {copy.estimated}
              </SegmentedControlItem>
            </SegmentedControl>
            <p className="text-sm text-muted-foreground">
              {confirmed ? copy.confirmed : copy.example}
            </p>
            {mode === "measured" ? (
              <>
                <Slider
                  label={copy.sitBone}
                  min={SIT_BONE_WIDTH_RANGE.min}
                  max={SIT_BONE_WIDTH_RANGE.max}
                  step={1}
                  value={sitBone}
                  unit="mm"
                  helperText={copy.sitBoneHint}
                  onChange={(value) => {
                    setSitBone(value);
                    confirmField("sitBone");
                  }}
                />
                <details className="rounded-2xl bg-[var(--bbf-petrol-zacht)] p-4 text-[var(--bbf-inkt)]">
                  <summary className="min-h-11 cursor-pointer font-semibold">
                    {copy.measureHelp}
                  </summary>
                  <ol className="list-decimal space-y-2 pl-5 text-sm">
                    {copy.measureSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </details>
              </>
            ) : (
              <>
                <Slider
                  label={copy.height}
                  min={140}
                  max={220}
                  step={1}
                  value={height}
                  unit="cm"
                  helperText={copy.heightHint}
                  onChange={(value) => {
                    setHeight(value);
                    confirmField("height");
                  }}
                />
                <Slider
                  label={copy.weight}
                  min={40}
                  max={150}
                  step={1}
                  value={weight}
                  unit="kg"
                  helperText={copy.weightHint}
                  onChange={(value) => {
                    setWeight(value);
                    confirmField("weight");
                  }}
                />
                <Slider
                  label={copy.hip}
                  min={HIP_CIRCUMFERENCE_RANGE.min}
                  max={HIP_CIRCUMFERENCE_RANGE.max}
                  step={1}
                  value={hip}
                  unit="cm"
                  helperText={copy.hipHint}
                  onChange={(value) => {
                    setHip(value);
                    confirmField("hip");
                  }}
                />
              </>
            )}
            {!confirmed && (
              <Button
                variant="outline"
                onClick={() =>
                  setConfirmedFields((previous) => [...new Set([...previous, ...fields])])
                }
              >
                {copy.confirm}
              </Button>
            )}
          </StepCard>
          <StepCard number={2} title={copy.riding}>
            <div role="group" aria-label={copy.riding} className="grid grid-cols-2 gap-2">
              {RIDES.map((ride) => (
                <OptionCard
                  key={ride}
                  label={copy.rides[ride]}
                  selected={ridingType === ride}
                  onClick={() => setRidingType(ride)}
                />
              ))}
            </div>
          </StepCard>
          <StepCard number={3} title={copy.posture}>
            <SegmentedControl
              aria-label={copy.posture}
              className="grid w-full min-w-0 grid-cols-3"
              value={postureCategory}
              onValueChange={(value) => setPostureCategory(value as SaddlePostureCategory)}
            >
              {POSTURES.map((posture) => (
                <SegmentedControlItem
                  key={posture}
                  value={posture}
                  className="min-w-0 whitespace-normal px-2 text-center"
                >
                  {copy.postures[posture]}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </StepCard>
        </>
      }
      results={
        <>
          <div id="saddle-width-result" aria-live="polite" aria-atomic="true">
            <ResultHero
              label={label}
              value={width.finalRecommendedWidthMm}
              unit="mm"
              subtext={
                <>
                  {copy.range}{" "}
                  <span className="font-mono">
                    {width.widthRangeMinMm}–{width.widthRangeMaxMm} mm
                  </span>
                </>
              }
            >
              <svg
                role="img"
                aria-label={`${copy.diagram}: ${width.finalRecommendedWidthMm} mm`}
                viewBox="0 0 500 260"
                className="w-full"
              >
                <path
                  d={
                    `M${xLeft} 110 C${xLeft} 60 ${xRight} 60 ${xRight} 110 ` +
                    `C${xRight} 150 276 145 275 220 Q250 245 225 220 C224 145 ${xLeft} 150 ${xLeft} 110Z`
                  }
                  fill="var(--bbf-wit)"
                  stroke="var(--bbf-inkt)"
                  strokeWidth="3"
                />
                <path
                  d={`M${xLeft} 43H${xRight} M${xLeft} 35V51 M${xRight} 35V51`}
                  stroke="var(--bbf-inkt)"
                  strokeWidth="2"
                />
                <text
                  x="250"
                  y="30"
                  textAnchor="middle"
                  fill="var(--bbf-inkt)"
                  className="font-mono text-lg"
                >
                  {width.finalRecommendedWidthMm} mm
                </text>
                <circle cx={250 - halfSitBone} cy="108" r="9" fill="var(--bbf-petrol)" />
                <circle cx={250 + halfSitBone} cy="108" r="9" fill="var(--bbf-petrol)" />
                <path
                  d={`M${250 - halfSitBone} 108H${250 + halfSitBone}`}
                  stroke="var(--bbf-petrol)"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
                <text
                  x="250"
                  y="95"
                  textAnchor="middle"
                  fill="var(--bbf-inkt)"
                  className="font-mono text-base"
                >
                  {width.resolvedSitBoneWidthMm} mm
                </text>
              </svg>
              <SizeScale
                label={copy.scale}
                options={WIDTH_BINS.map((bin) => ({ value: bin.label }))}
                recommended={outside ? "" : width.primaryWidthClass}
                recommendedLabel={copy.recommended}
                borderline={outside ? [] : width.alternateWidthClasses}
                borderlineLabel={copy.alternate}
              />
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
                {WIDTH_BINS.map((bin) => (
                  <span key={bin.label}>
                    {bin.label}: {bin.min}–{bin.max} mm
                  </span>
                ))}
              </div>
              {outside && <p className="mt-4 text-sm font-semibold">{copy.outside}</p>}
              <p className="mt-4 text-sm">{copy.diagramNote}</p>
            </ResultHero>
          </div>
          <ResultTile
            label={mode === "measured" ? copy.measuredSource : copy.estimatedSource}
            value={
              width.estimatedSitBoneRange
                ? `${width.estimatedSitBoneRange.min}–${width.estimatedSitBoneRange.max}`
                : width.resolvedSitBoneWidthMm
            }
            unit="mm"
            status={mode === "measured" ? copy.measuredTrust : copy.estimatedTrust}
          />
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold">{copy.confidence}</h2>
            <div className="mt-3">
              <StatusChip status={width.confidenceLevel === "lower" ? "warn" : "ok"}>
                {copy.confidenceLevels[width.confidenceLevel]}
              </StatusChip>
            </div>
            {!confirmed && (
              <p className="mt-3 text-sm text-muted-foreground">{copy.exampleTrust}</p>
            )}
            <h3 className="mt-5 font-display text-xl font-bold">{copy.family}</h3>
            <p className="mt-2">{copy.families[suitability.saddleFamily]}</p>
            <h3 className="mt-5 font-display text-xl font-bold">{copy.shape}</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>{copy.nose[suitability.noseType]}</li>
              <li>{copy.profiles[suitability.profileShape]}</li>
              <li>{suitability.cutoutRecommended ? copy.cutout : copy.fullShell}</li>
              <li>{copy.padding[suitability.paddingPreference]}</li>
            </ul>
          </section>
          <AdjustOrder title={copy.order} steps={copy.steps.map((title) => ({ title }))} />
          {!accountMode && <><Link
            href={withLocalePrefix("/login", locale)}
            className={
              "inline-flex min-h-14 items-center justify-center rounded-full bg-primary " +
              "px-5 py-3 font-bold text-primary-foreground"
            }
          >
            {copy.account}
          </Link>
          <p className="text-sm text-muted-foreground">{copy.accountNote}</p></>}
          {saveFailed && (
            <p role="status" className="text-sm text-muted-foreground">
              {copy.saveFailed}
            </p>
          )}
        </>
      }
      stickyResult={
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-mono text-xl">
              {width.finalRecommendedWidthMm} <span className="text-sm">mm</span>
            </p>
          </div>
          <a
            href="#saddle-width-result"
            className={
              "inline-flex min-h-11 items-center rounded-full bg-primary px-4 " +
              "text-sm font-bold text-primary-foreground"
            }
          >
            {copy.view}
          </a>
        </div>
      }
    />
  );
}
