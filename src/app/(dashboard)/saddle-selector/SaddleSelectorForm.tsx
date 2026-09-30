"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import {
  AdjustOrder,
  Button,
  LoadingState,
  OptionCard,
  ResultHero,
  ResultTile,
  SizeScale,
  Slider,
  StatusChip,
  StepCard,
} from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { toolsSaddleMessages, type ToolsSaddleCopy } from "@/i18n/account/toolsSaddle";
import {
  calculateSaddleWidth,
  classifySaddleSuitability,
  type SaddlePostureCategory,
  type SaddleRidingType,
  type SaddleSymptomFlags,
  type SaddleWidthInput,
} from "@/lib/saddle-width-engine";
import { WIDTH_BINS, SUPPORTED_WIDTH_RANGE } from "@/lib/saddle-width-engine/config";

function Choices<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="space-y-3">
      <p className="text-sm font-semibold">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(options) as T[]).map((key) => (
          <OptionCard key={key} label={options[key]} selected={key === value} onClick={() => onChange(key)} />
        ))}
      </div>
    </div>
  );
}

function ValueSlider({
  label,
  value,
  onChange,
  min,
  max,
  example,
  unit,
  copy,
}: {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  min: number;
  max: number;
  example: number;
  unit?: string;
  copy: ToolsSaddleCopy;
}) {
  return (
    <div className="space-y-2">
      <Slider
        label={label}
        value={value ?? example}
        onChange={onChange}
        min={min}
        max={max}
        step={1}
        unit={unit}
        helperText={value === null ? copy.notSet : undefined}
      />
      {value === null && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(example)}
          aria-label={`${copy.useValue}: ${label}`}
        >
          {copy.useValue}
        </Button>
      )}
    </div>
  );
}
function mapFlexibilityScore(value?: string) {
  switch (value) {
    case "very_limited":
      return 1;
    case "limited":
      return 2;
    case "good":
      return 4;
    case "excellent":
      return 5;
    default:
      return 3;
  }
}

function mapBikeToRidingType(bikeType?: string): SaddleRidingType {
  switch (bikeType) {
    case "road":
      return "endurance_road";
    case "gravel":
    case "cyclocross":
      return "gravel";
    case "mountain":
      return "mtb";
    case "tt_triathlon":
      return "tt_triathlon";
    case "city":
    case "hybrid":
    case "touring":
      return "commuter_leisure";
    default:
      return "endurance_road";
  }
}

export function mapBikeToRidingTypeFromBike(bike?: { bikeType?: string; ridingStyle?: string | null }) {
  switch (bike?.ridingStyle) {
    case "racing":
      return "road_race";
    case "sportive":
    case "fitness":
      return "endurance_road";
    case "recreational":
    case "commuting":
    case "touring":
      return "commuter_leisure";
    default:
      return mapBikeToRidingType(bike?.bikeType);
  }
}

export function mapGoalToPosture(goal?: string): SaddlePostureCategory {
  switch (goal) {
    case "aerodynamics":
    case "performance":
      return "aggressive";
    case "comfort":
      return "upright";
    default:
      return "balanced";
  }
}

export function normalizeProfileSitBoneWidth(value?: number | null) {
  if (value === null || value === undefined) {
    return null;
  }

  if (!Number.isFinite(value) || value < 60 || value > 200) {
    return null;
  }

  return value;
}

export function SaddleSelectorForm() {
  const { locale } = useDashboardMessages();
  const copy = toolsSaddleMessages[locale];
  const profile = useQuery(api.profiles.queries.getMyProfile);
  const bikes = useQuery(api.bikes.queries.list, {});
  const sessions = useQuery(api.saddleWidth.queries.listSaddleWidthSessions, { limit: 5 });
  const searchParams = useSearchParams();
  const bikeIdParam = searchParams.get("bikeId") as Id<"bikes"> | null;
  const saveSession = useMutation(api.saddleWidth.mutations.createDashboardSaddleWidthSession);
  const appliedBikeDefaultsRef = useRef<string | null>(null);
  const [inputMode, setInputMode] = useState<"measured" | "estimated">("estimated");
  const [sitBoneWidthMm, setSitBoneWidthMm] = useState<number | null>(null);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [hipCircumferenceCm, setHipCircumferenceCm] = useState<number | null>(null);
  const [flexibilityScore, setFlexibilityScore] = useState<number | null>(null);
  const [coreStabilityScore, setCoreStabilityScore] = useState<number | null>(null);
  const [selectedBikeId, setSelectedBikeId] = useState("");
  const selectedBike = useQuery(
    api.bikes.queries.get,
    selectedBikeId ? { bikeId: selectedBikeId as Id<"bikes"> } : "skip",
  );
  const [ridingType, setRidingType] = useState<SaddleRidingType>("endurance_road");
  const [postureCategory, setPostureCategory] = useState<SaddlePostureCategory>("balanced");
  const [indoorOutdoor, setIndoorOutdoor] = useState<"indoor" | "outdoor" | "mixed">("outdoor");
  const [typicalRideLength, setTypicalRideLength] = useState<"short" | "medium" | "long" | "ultra">("medium");
  const [currentSaddleWidthMm, setCurrentSaddleWidthMm] = useState<number | null>(null);
  const [currentSaddleShape, setCurrentSaddleShape] =
    useState<NonNullable<SaddleWidthInput["currentSaddleShape"]>>("unknown");
  const [currentSaddleTilt, setCurrentSaddleTilt] =
    useState<NonNullable<SaddleWidthInput["currentSaddleTilt"]>>("unknown");
  const [currentSaddleSatisfaction, setCurrentSaddleSatisfaction] =
    useState<keyof ToolsSaddleCopy["feelings"]>("unsure");
  const [showCurrentSaddle, setShowCurrentSaddle] = useState(false);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [symptoms, setSymptoms] = useState<SaddleSymptomFlags>({
    sisBonePain: false,
    numbness: false,
    chafing: false,
    slidingForward: false,
    instability: false,
    lowerBackPressure: false,
    handPressure: false,
    asymmetry: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  const hydratedProfileRef = useRef<string | null>(null);
  const hydratedBikeParam = useRef<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    // Hydrate once per profile, without overwriting local edits on a live-query refresh.
    const profileKey = String(profile._id);
    if (hydratedProfileRef.current === profileKey) return;
    hydratedProfileRef.current = profileKey;
    const sbw = normalizeProfileSitBoneWidth(profile.sitBoneWidthMm);
    setInputMode(sbw ? "measured" : "estimated");
    setSitBoneWidthMm(sbw);
    setHeightCm(profile.heightCm ?? null);
    setWeightKg(profile.weightKg ?? null);
    setHipCircumferenceCm(profile.hipCircumferenceCm ?? null);
    setFlexibilityScore(profile.flexibilityScore ? mapFlexibilityScore(profile.flexibilityScore) : null);
    setCoreStabilityScore(profile.coreStabilityScore ?? null);
  }, [profile]);
  useEffect(() => {
    if (bikeIdParam && hydratedBikeParam.current !== bikeIdParam) {
      hydratedBikeParam.current = bikeIdParam;
      setSelectedBikeId(bikeIdParam);
    }
  }, [bikeIdParam]);
  useEffect(() => {
    if (selectedBike === undefined) return;
    if (!selectedBike) {
      appliedBikeDefaultsRef.current = null;
      setRidingType("endurance_road");
      setPostureCategory("balanced");
      return;
    }
    const key = String(selectedBike._id);
    if (appliedBikeDefaultsRef.current === key) return;
    appliedBikeDefaultsRef.current = key;
    setRidingType(mapBikeToRidingTypeFromBike(selectedBike));
    setPostureCategory(mapGoalToPosture(selectedBike.primaryGoal));
  }, [selectedBike]);

  const input = useMemo<SaddleWidthInput>(
    () => ({
      inputMethod: inputMode,
      ...(inputMode === "measured"
        ? { sitBoneWidthMm: sitBoneWidthMm ?? undefined }
        : {
            heightCm: heightCm ?? undefined,
            weightKg: weightKg ?? undefined,
            hipCircumferenceCm: hipCircumferenceCm ?? undefined,
          }),
      ridingType,
      postureCategory,
      indoorOutdoor,
      typicalRideLength,
      currentSaddleWidthMm: currentSaddleWidthMm ?? undefined,
      currentSaddleShape,
      currentSaddleTilt,
      flexibilityScore: flexibilityScore ?? undefined,
      coreStabilityScore: coreStabilityScore ?? undefined,
      symptoms,
    }),
    [
      inputMode,
      sitBoneWidthMm,
      heightCm,
      weightKg,
      hipCircumferenceCm,
      ridingType,
      postureCategory,
      indoorOutdoor,
      typicalRideLength,
      currentSaddleWidthMm,
      currentSaddleShape,
      currentSaddleTilt,
      flexibilityScore,
      coreStabilityScore,
      symptoms,
    ],
  );
  const result = useMemo(() => {
    try {
      const width = calculateSaddleWidth(input);
      return { width, suitability: classifySaddleSuitability(input, width) };
    } catch {
      return null;
    }
  }, [input]);
  const signature = JSON.stringify({ input, selectedBikeId, currentSaddleSatisfaction });
  const bikePending = Boolean(selectedBikeId) && selectedBike === undefined;
  const bikeMissing = Boolean(selectedBikeId) && selectedBike === null;
  const outside =
    result &&
    (result.width.finalRecommendedWidthMm < SUPPORTED_WIDTH_RANGE.min ||
      result.width.finalRecommendedWidthMm > SUPPORTED_WIDTH_RANGE.max);
  async function handleSave() {
    if (!result || bikePending || bikeMissing || isSaving) return;
    setIsSaving(true);
    setSaveError(false);
    const { inputMethod, symptoms: flags, ...fields } = input;
    try {
      await saveSession({
        ...fields,
        bikeId: selectedBike ? (selectedBike._id as Id<"bikes">) : undefined,
        measurementMethod: inputMethod,
        currentSaddleSatisfaction,
        symptoms: Object.entries(flags ?? {})
          .filter(([, value]) => value)
          .map(([key]) => key),
        recommendedWidthMm: result.width.finalRecommendedWidthMm,
        widthRangeMinMm: result.width.widthRangeMinMm,
        widthRangeMaxMm: result.width.widthRangeMaxMm,
        primaryWidthClass: result.width.primaryWidthClass,
        saddleFamily: result.suitability.saddleFamily,
        noseType: result.suitability.noseType,
        profileShape: result.suitability.profileShape,
        cutoutRecommended: result.suitability.cutoutRecommended,
        paddingPreference: result.suitability.paddingPreference,
        confidenceScore: result.width.confidenceScore,
        confidenceLevel: result.width.confidenceLevel,
        widthMatchScore: result.width.widthMatchScore,
        fitInteractionWarnings: result.suitability.fitInteractionWarnings.map((warning) => warning.message),
        explanationKey: result.width.explanationKey,
      });
      setSavedSignature(signature);
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  }
  if (profile === undefined || bikes === undefined) return <LoadingState label={copy.loading} />;

  return (
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-5">
        <StepCard number={1} title={copy.chooseBike}>
          <div role="group" aria-label={copy.chooseBike} className="grid gap-2 sm:grid-cols-2">
            <OptionCard label={copy.noBike} selected={!selectedBikeId} onClick={() => setSelectedBikeId("")} />
            {bikes.map((bike) => (
              <OptionCard
                key={bike._id}
                label={bike.name}
                selected={selectedBikeId === String(bike._id)}
                onClick={() => setSelectedBikeId(String(bike._id))}
              />
            ))}
          </div>
          {bikes.length === 0 && <p className="text-sm text-muted-foreground">{copy.noBikes}</p>}
          {bikePending && <p role="status">{copy.bikeLoading}</p>}
          {bikeMissing && <p role="alert">{copy.bikeMissing}</p>}
        </StepCard>
        <StepCard number={2} title={copy.measurements} description={copy.fromProfile}>
          <Choices
            label={copy.method}
            value={inputMode}
            options={{ measured: copy.measured, estimated: copy.estimated }}
            onChange={setInputMode}
          />
          {inputMode === "measured" ? (
            <ValueSlider
              label={copy.sitBone}
              value={sitBoneWidthMm}
              onChange={setSitBoneWidthMm}
              min={60}
              max={200}
              example={125}
              unit="mm"
              copy={copy}
            />
          ) : (
            <>
              <ValueSlider
                label={copy.height}
                value={heightCm}
                onChange={setHeightCm}
                min={140}
                max={220}
                example={180}
                unit="cm"
                copy={copy}
              />
              <ValueSlider
                label={copy.weight}
                value={weightKg}
                onChange={setWeightKg}
                min={40}
                max={150}
                example={75}
                unit="kg"
                copy={copy}
              />
              <ValueSlider
                label={copy.hip}
                value={hipCircumferenceCm}
                onChange={setHipCircumferenceCm}
                min={70}
                max={160}
                example={100}
                unit="cm"
                copy={copy}
              />
            </>
          )}
          <details className="rounded-2xl bg-muted p-4">
            <summary className="min-h-11 cursor-pointer font-semibold">{copy.refine}</summary>
            <div className="space-y-5 pt-3">
              <ValueSlider
                label={copy.flexibility}
                value={flexibilityScore}
                onChange={setFlexibilityScore}
                min={1}
                max={5}
                example={3}
                unit={copy.unitScore}
                copy={copy}
              />
              <ValueSlider
                label={copy.core}
                value={coreStabilityScore}
                onChange={setCoreStabilityScore}
                min={1}
                max={5}
                example={3}
                unit={copy.unitScore}
                copy={copy}
              />
            </div>
          </details>
        </StepCard>
        <StepCard number={3} title={copy.riding}>
          <Choices label={copy.riding} options={copy.rides} value={ridingType} onChange={setRidingType} />
          <Choices
            label={copy.posture}
            options={copy.postures}
            value={postureCategory}
            onChange={setPostureCategory}
          />
          <Choices
            label={copy.environment}
            options={copy.environments}
            value={indoorOutdoor}
            onChange={setIndoorOutdoor}
          />
          <Choices
            label={copy.duration}
            options={copy.durations}
            value={typicalRideLength}
            onChange={setTypicalRideLength}
          />
        </StepCard>
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-2xl font-bold">{copy.current}</h2>
          <Button
            variant="outline"
            className="mt-4"
            aria-expanded={showCurrentSaddle}
            aria-controls="current-saddle-options"
            onClick={() => setShowCurrentSaddle((value) => !value)}
          >
            {showCurrentSaddle ? copy.hideCurrent : copy.showCurrent}
          </Button>
          {showCurrentSaddle && (
            <div id="current-saddle-options" className="mt-5 space-y-5">
              <ValueSlider
                label={copy.currentWidth}
                value={currentSaddleWidthMm}
                onChange={setCurrentSaddleWidthMm}
                min={120}
                max={190}
                example={145}
                unit="mm"
                copy={copy}
              />
              <Choices
                label={copy.currentFeel}
                options={copy.feelings}
                value={currentSaddleSatisfaction}
                onChange={setCurrentSaddleSatisfaction}
              />
              <Choices
                label={copy.currentShape}
                options={copy.shapes}
                value={currentSaddleShape}
                onChange={setCurrentSaddleShape}
              />
              <Choices
                label={copy.currentTilt}
                options={copy.tilts}
                value={currentSaddleTilt}
                onChange={setCurrentSaddleTilt}
              />
            </div>
          )}
        </section>
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-2xl font-bold">{copy.symptomsTitle}</h2>
          <Button
            variant="outline"
            className="mt-4"
            aria-expanded={showSymptoms}
            aria-controls="saddle-symptoms"
            onClick={() => setShowSymptoms((value) => !value)}
          >
            {showSymptoms ? copy.hideSymptoms : copy.showSymptoms}
          </Button>
          {showSymptoms && (
            <div
              id="saddle-symptoms"
              role="group"
              aria-label={copy.symptomsLabel}
              className="mt-5 grid gap-2 sm:grid-cols-2"
            >
              {(Object.keys(symptoms) as (keyof SaddleSymptomFlags)[]).map((key) => (
                <OptionCard
                  key={key}
                  label={copy.symptoms[key]}
                  selected={symptoms[key]}
                  onClick={() => setSymptoms((previous) => ({ ...previous, [key]: !previous[key] }))}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      <div className="min-w-0 space-y-5">
        {result ? (
          <>
            <div aria-live="polite" aria-atomic="true">
              <ResultHero
                label={copy.result}
                value={result.width.finalRecommendedWidthMm}
                unit="mm"
                subtext={
                  <>
                    {copy.range}:{" "}
                    <span className="font-mono">
                      {result.width.widthRangeMinMm}–{result.width.widthRangeMaxMm} mm
                    </span>
                  </>
                }
              >
                <svg viewBox="0 0 500 230" role="img" aria-label={copy.diagram} className="w-full">
                  <path
                    d={
                      `M${250 - result.width.finalRecommendedWidthMm * 0.8} 95 ` +
                      `C${250 - result.width.finalRecommendedWidthMm * 0.8} 40 ` +
                      `${250 + result.width.finalRecommendedWidthMm * 0.8} ` +
                      `40 ${250 + result.width.finalRecommendedWidthMm * 0.8} 95 C420 140 276 140 275 200 ` +
                      `Q250 225 225 200 C224 140 80 140 ${250 - result.width.finalRecommendedWidthMm * 0.8} 95Z`
                    }
                    fill="var(--bbf-wit)"
                    stroke="var(--bbf-inkt)"
                    strokeWidth="3"
                  />
                  <circle
                    cx={250 - result.width.resolvedSitBoneWidthMm * 0.8}
                    cy="95"
                    r="8"
                    fill="var(--bbf-petrol)"
                  />
                  <circle
                    cx={250 + result.width.resolvedSitBoneWidthMm * 0.8}
                    cy="95"
                    r="8"
                    fill="var(--bbf-petrol)"
                  />
                  <text x="250" y="95" textAnchor="middle" className="font-mono" fill="var(--bbf-inkt)">
                    {result.width.resolvedSitBoneWidthMm} mm
                  </text>
                </svg>
                <SizeScale
                  label={copy.scale}
                  options={WIDTH_BINS.map((bin) => ({ value: bin.label }))}
                  recommended={outside ? "" : result.width.primaryWidthClass}
                  recommendedLabel={copy.recommended}
                  borderline={outside ? [] : result.width.alternateWidthClasses}
                  borderlineLabel={copy.alternate}
                />
                <p className="mt-4 text-sm">{outside ? copy.outside : copy.diagramNote}</p>
              </ResultHero>
            </div>
            <ResultTile
              label={inputMode === "measured" ? copy.measuredSource : copy.estimatedSource}
              value={
                result.width.estimatedSitBoneRange
                  ? `${result.width.estimatedSitBoneRange.min}–${result.width.estimatedSitBoneRange.max}`
                  : result.width.resolvedSitBoneWidthMm
              }
              unit="mm"
              status={copy.resultLimit}
            />
            <section className="space-y-4 rounded-3xl border border-border bg-card p-6">
              <StatusChip status={result.width.confidenceLevel === "lower" ? "warn" : "ok"}>
                {copy.confidenceLevels[result.width.confidenceLevel]}
              </StatusChip>
              <h2 className="font-display text-2xl font-bold">{copy.shape}</h2>
              <p className="font-semibold">{copy.families[result.suitability.saddleFamily]}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{copy.nose[result.suitability.noseType]}</li>
                <li>{copy.profiles[result.suitability.profileShape]}</li>
                <li>{result.suitability.cutoutRecommended ? copy.cutout : copy.fullShell}</li>
                <li>{copy.padding[result.suitability.paddingPreference]}</li>
              </ul>
              {result.width.widthMatchAssessment && <p>{copy.comparisons[result.width.widthMatchAssessment]}</p>}
            </section>
            {result.suitability.fitInteractionWarnings.length > 0 && (
              <section role="status" className="rounded-3xl bg-[var(--bbf-warning)] p-6 text-[var(--bbf-inkt)]">
                <h2 className="font-display text-2xl font-bold text-[var(--bbf-inkt)]">{copy.warningsTitle}</h2>
                <ul className="mt-4 space-y-3">
                  {result.suitability.fitInteractionWarnings.map((warning) => (
                    <li key={warning.code}>
                      {copy.warnings[warning.code as keyof typeof copy.warnings] ?? warning.message}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <AdjustOrder title={copy.order} steps={copy.steps.map((title) => ({ title }))} />
            <Button
              className="w-full"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={bikePending || bikeMissing}
            >
              {isSaving ? copy.saving : copy.save}
            </Button>
            {savedSignature === signature && (
              <p role="status" className="text-sm text-primary">
                {copy.saved}
              </p>
            )}
            {saveError && <p role="alert">{copy.error}</p>}
          </>
        ) : (
          <section className="rounded-3xl border border-dashed border-border bg-card p-8">
            <p role="status">{copy.missing}</p>
          </section>
        )}
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-bold">{copy.history}</h2>
          {sessions === undefined ? (
            <p className="mt-4" role="status">
              {copy.historyLoading}
            </p>
          ) : sessions.length === 0 ? (
            <p className="mt-4 text-muted-foreground">{copy.historyEmpty}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {sessions.map((session) => (
                <li key={session._id} className="rounded-2xl border border-border p-4">
                  <p className="font-mono text-sm">
                    {new Date(session.createdAt).toLocaleDateString(locale)} · {session.widthRangeMinMm}–
                    {session.widthRangeMaxMm} mm
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {copy.families[session.saddleFamily as keyof typeof copy.families] ?? session.saddleFamily}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
