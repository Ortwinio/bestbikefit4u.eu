"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { Button, Card, CardContent, CardHeader, CardTitle, NumberInput, Select } from "@/components/ui";
import { PublicInfoPanel } from "@/components/public";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import {
  calculateSaddleWidth,
  classifySaddleSuitability,
  type SaddleCalculationResult,
  type SaddlePostureCategory,
  type SaddleRidingType,
  type SaddleSymptomFlags,
} from "@/lib/saddle-width-engine";

const RIDING_TYPE_OPTIONS = [
  { value: "road_race", label: "Road race" },
  { value: "endurance_road", label: "Endurance road" },
  { value: "gravel", label: "Gravel" },
  { value: "mtb", label: "MTB" },
  { value: "commuter_leisure", label: "Commuter / leisure" },
  { value: "tt_triathlon", label: "TT / triathlon" },
  { value: "indoor_only", label: "Indoor only" },
];

const POSTURE_OPTIONS = [
  { value: "aggressive", label: "Aggressive" },
  { value: "balanced", label: "Balanced" },
  { value: "upright", label: "Upright" },
];

const INDOOR_OUTDOOR_OPTIONS = [
  { value: "outdoor", label: "Outdoor" },
  { value: "mixed", label: "Mixed" },
  { value: "indoor", label: "Indoor" },
];

const RIDE_LENGTH_OPTIONS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
  { value: "ultra", label: "Ultra" },
];

const SHAPE_OPTIONS = [
  { value: "unknown", label: "Don't know" },
  { value: "flat", label: "Flat" },
  { value: "waved", label: "Waved" },
  { value: "hammock", label: "Hammock" },
  { value: "short_nose", label: "Short-nose" },
];

const TILT_OPTIONS = [
  { value: "unknown", label: "Don't know" },
  { value: "neutral", label: "Neutral" },
  { value: "nose_down", label: "Nose down" },
  { value: "nose_up", label: "Nose up" },
];

const SATISFACTION_OPTIONS = [
  { value: "unsure", label: "Unsure" },
  { value: "too_narrow", label: "Too narrow" },
  { value: "just_right", label: "Just right" },
  { value: "too_wide", label: "Too wide" },
];

const SYMPTOM_FIELDS: Array<{ key: keyof SaddleSymptomFlags; label: string }> = [
  { key: "sisBonePain", label: "Sit-bone pain" },
  { key: "numbness", label: "Perineal or soft tissue numbness" },
  { key: "chafing", label: "Inner thigh / hamstring chafing" },
  { key: "slidingForward", label: "Sliding forward on the saddle" },
  { key: "instability", label: "Feeling unstable side-to-side" },
  { key: "lowerBackPressure", label: "Increased lower-back pressure" },
  { key: "handPressure", label: "Increased hand pressure" },
  { key: "asymmetry", label: "One-sided hot spot or asymmetry" },
];

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

export function mapBikeToRidingTypeFromBike(bike?: {
  bikeType?: string;
  ridingStyle?: string | null;
}) {
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

function translateOptions(
  options: Array<{ value: string; label: string }>,
  locale: "en" | "nl"
) {
  if (locale === "en") return options;
  return options.map((option) => ({
    value: option.value,
    label:
      option.value === "road_race"
        ? "Race"
        : option.value === "endurance_road"
          ? "Endurance"
          : option.value === "commuter_leisure"
            ? "Woon-werk / recreatief"
            : option.value === "tt_triathlon"
              ? "TT / triathlon"
              : option.value === "indoor_only"
                ? "Alleen indoor"
                : option.value === "aggressive"
                  ? "Agressief"
                  : option.value === "balanced"
                    ? "Gebalanceerd"
                    : option.value === "upright"
                      ? "Rechtop"
                      : option.value === "outdoor"
                        ? "Buiten"
                        : option.value === "mixed"
                          ? "Gemengd"
                          : option.value === "indoor"
                            ? "Indoor"
                            : option.value === "short"
                              ? "Kort"
                              : option.value === "medium"
                                ? "Middel"
                                : option.value === "long"
                                  ? "Lang"
                                  : option.value === "ultra"
                                    ? "Ultra"
                                    : option.value === "unknown"
                                      ? "Weet ik niet"
                                      : option.value === "neutral"
                                        ? "Neutraal"
                                        : option.value === "nose_down"
                                          ? "Neus omlaag"
                                          : option.value === "nose_up"
                                            ? "Neus omhoog"
                                            : option.value === "too_narrow"
                                              ? "Te smal"
                                              : option.value === "just_right"
                                                ? "Precies goed"
                                                : option.value === "too_wide"
                                                  ? "Te breed"
                                                  : option.label,
  }));
}

function formatFamily(family: string, isNl: boolean) {
  switch (family) {
    case "short_nose_performance":
      return isNl ? "Performance / short-nose" : "Performance / short-nose";
    case "gravel_mtb_support":
      return isNl ? "Gravel / MTB support" : "Gravel / MTB support";
    case "comfort_upright":
      return isNl ? "Comfort / upright" : "Comfort / upright";
    default:
      return isNl ? "Endurance / all-road" : "Endurance / all-road";
  }
}

export function normalizeProfileSitBoneWidth(value?: number | null) {
  if (value === null || value === undefined) {
    return null;
  }

  if (value < 60 || value > 200) {
    return null;
  }

  return value;
}

export function SaddleSelectorForm() {
  const { locale, messages } = useDashboardMessages();
  const isNl = locale === "nl";
  const profile = useQuery(api.profiles.queries.getMyProfile);
  const bikes = useQuery(api.bikes.queries.list, {});
  const sessions = useQuery(api.saddleWidth.queries.listSaddleWidthSessions, { limit: 5 });
  const searchParams = useSearchParams();
  const bikeIdParam = searchParams.get("bikeId") as Id<"bikes"> | null;
  const saveSession = useMutation(api.saddleWidth.mutations.createDashboardSaddleWidthSession);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const appliedBikeDefaultsRef = useRef<string | null>(null);

  const [inputMode, setInputMode] = useState<"measured" | "estimated">("estimated");
  const [sitBoneWidthMm, setSitBoneWidthMm] = useState<number | null>(null);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [hipCircumferenceCm, setHipCircumferenceCm] = useState<number | null>(null);
  const [flexibilityScore, setFlexibilityScore] = useState<number | null>(null);
  const [coreStabilityScore, setCoreStabilityScore] = useState<number | null>(null);
  const [selectedBikeId, setSelectedBikeId] = useState<string>("");
  const selectedBike = useQuery(
    api.bikes.queries.get,
    selectedBikeId ? { bikeId: selectedBikeId as Id<"bikes"> } : "skip"
  );
  const [ridingType, setRidingType] = useState<SaddleRidingType>("endurance_road");
  const [postureCategory, setPostureCategory] = useState<SaddlePostureCategory>("balanced");
  const [indoorOutdoor, setIndoorOutdoor] = useState<"indoor" | "outdoor" | "mixed">("outdoor");
  const [typicalRideLength, setTypicalRideLength] = useState<"short" | "medium" | "long" | "ultra">("medium");
  const [currentSaddleWidthMm, setCurrentSaddleWidthMm] = useState<number | null>(null);
  const [currentSaddleShape, setCurrentSaddleShape] = useState("unknown");
  const [currentSaddleTilt, setCurrentSaddleTilt] = useState("unknown");
  const [currentSaddleSatisfaction, setCurrentSaddleSatisfaction] = useState("unsure");
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
  const [result, setResult] = useState<SaddleCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    if (!profile) return;
    const normalizedSitBoneWidth = normalizeProfileSitBoneWidth(profile.sitBoneWidthMm);
    setInputMode(normalizedSitBoneWidth ? "measured" : "estimated");
    setSitBoneWidthMm(normalizedSitBoneWidth);
    setHeightCm(profile.heightCm ?? null);
    setWeightKg(profile.weightKg ?? null);
    setHipCircumferenceCm(profile.hipCircumferenceCm ?? null);
    setFlexibilityScore(mapFlexibilityScore(profile.flexibilityScore));
    setCoreStabilityScore(profile.coreStabilityScore ?? null);
  }, [profile]);

  useEffect(() => {
    if (bikeIdParam && !selectedBikeId) {
      setSelectedBikeId(bikeIdParam);
    }
  }, [bikeIdParam, selectedBikeId]);

  useEffect(() => {
    if (selectedBike === undefined) {
      return;
    }

    if (!selectedBike) {
      appliedBikeDefaultsRef.current = null;
      setRidingType("endurance_road");
      setPostureCategory("balanced");
      return;
    }

    const bikeKey = String(selectedBike._id);
    if (appliedBikeDefaultsRef.current === bikeKey) {
      return;
    }

    appliedBikeDefaultsRef.current = bikeKey;
    setRidingType(mapBikeToRidingTypeFromBike(selectedBike));
    setPostureCategory(mapGoalToPosture(selectedBike.primaryGoal));
  }, [selectedBike]);

  const bikeOptions = useMemo(
    () =>
      (bikes ?? []).map((entry: { _id: Id<"bikes">; name: string }) => ({
        value: String(entry._id),
        label: entry.name,
      })),
    [bikes]
  );

  function handleCalculate() {
    setIsCalculating(true);
    setSaveState("idle");
    try {
      const widthInput = {
        inputMethod: inputMode,
        sitBoneWidthMm: sitBoneWidthMm ?? undefined,
        heightCm: heightCm ?? undefined,
        weightKg: weightKg ?? undefined,
        hipCircumferenceCm: hipCircumferenceCm ?? undefined,
        ridingType,
        postureCategory,
        indoorOutdoor,
        currentSaddleWidthMm: currentSaddleWidthMm ?? undefined,
        currentSaddleTilt: currentSaddleTilt as "nose_down" | "neutral" | "nose_up" | "unknown",
        currentSaddleShape: currentSaddleShape as "flat" | "waved" | "hammock" | "short_nose" | "unknown",
        flexibilityScore: flexibilityScore ?? undefined,
        coreStabilityScore: coreStabilityScore ?? undefined,
        typicalRideLength,
        symptoms,
      };
      const width = calculateSaddleWidth(widthInput);
      const suitability = classifySaddleSuitability(widthInput, width);
      setResult({ width, suitability });
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } finally {
      setIsCalculating(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setIsSaving(true);
    try {
      await saveSession({
        bikeId: selectedBike ? (selectedBike._id as Id<"bikes">) : undefined,
        measurementMethod: inputMode,
        sitBoneWidthMm: sitBoneWidthMm ?? undefined,
        heightCm: heightCm ?? undefined,
        weightKg: weightKg ?? undefined,
        hipCircumferenceCm: hipCircumferenceCm ?? undefined,
        flexibilityScore: flexibilityScore ?? undefined,
        coreStabilityScore: coreStabilityScore ?? undefined,
        ridingType,
        postureCategory,
        indoorOutdoor,
        typicalRideLength,
        currentSaddleWidthMm: currentSaddleWidthMm ?? undefined,
        currentSaddleShape,
        currentSaddleTilt,
        currentSaddleSatisfaction,
        symptoms: Object.entries(symptoms)
          .filter(([, enabled]) => enabled)
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
      setSaveState("saved");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>{messages.saddleSelector.anatomy}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={inputMode === "measured" ? "primary" : "outline"}
              onClick={() => setInputMode("measured")}
            >
              {messages.saddleSelector.measuredMode}
            </Button>
            <Button
              type="button"
              variant={inputMode === "estimated" ? "primary" : "outline"}
              onClick={() => setInputMode("estimated")}
            >
              {messages.saddleSelector.estimatedMode}
            </Button>
          </div>

          {inputMode === "measured" ? (
            <NumberInput
              label={messages.saddleSelector.sitBoneWidth}
              value={sitBoneWidthMm}
              onChange={setSitBoneWidthMm}
              min={60}
              max={200}
              unit="mm"
              helperText={
                profile?.sitBoneWidthMm
                  ? messages.saddleSelector.fromProfile
                  : undefined
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <NumberInput
                label={messages.saddleSelector.height}
                value={heightCm}
                onChange={setHeightCm}
                min={140}
                max={220}
                unit="cm"
              />
              <NumberInput
                label={messages.saddleSelector.weight}
                value={weightKg}
                onChange={setWeightKg}
                min={40}
                max={150}
                unit="kg"
              />
              <NumberInput
                label={messages.saddleSelector.hipCircumference}
                value={hipCircumferenceCm}
                onChange={setHipCircumferenceCm}
                min={70}
                max={160}
                unit="cm"
                helperText={
                  profile?.hipCircumferenceCm
                    ? messages.saddleSelector.fromProfile
                    : undefined
                }
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <NumberInput
              label={messages.saddleSelector.flexibility}
              value={flexibilityScore}
              onChange={setFlexibilityScore}
              min={1}
              max={5}
            />
            <NumberInput
              label={messages.saddleSelector.coreStability}
              value={coreStabilityScore}
              onChange={setCoreStabilityScore}
              min={1}
              max={5}
            />
          </div>
        </CardContent>
      </Card>

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>{messages.saddleSelector.ridingProfile}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Select
            label={messages.saddleSelector.bike}
            value={selectedBikeId}
            onChange={(event) => setSelectedBikeId(event.target.value)}
            options={bikeOptions}
            placeholder={messages.saddleSelector.selectBike}
          />
          <Select
            label={messages.saddleSelector.ridingType}
            value={ridingType}
            onChange={(event) => setRidingType(event.target.value as SaddleRidingType)}
            options={translateOptions(RIDING_TYPE_OPTIONS, locale)}
          />
          <Select
            label={messages.saddleSelector.positionStyle}
            value={postureCategory}
            onChange={(event) =>
              setPostureCategory(event.target.value as SaddlePostureCategory)
            }
            options={translateOptions(POSTURE_OPTIONS, locale)}
          />
          <Select
            label={messages.saddleSelector.indoorOutdoor}
            value={indoorOutdoor}
            onChange={(event) =>
              setIndoorOutdoor(event.target.value as "indoor" | "outdoor" | "mixed")
            }
            options={translateOptions(INDOOR_OUTDOOR_OPTIONS, locale)}
          />
          <Select
            label={messages.saddleSelector.typicalRideLength}
            value={typicalRideLength}
            onChange={(event) =>
              setTypicalRideLength(event.target.value as "short" | "medium" | "long" | "ultra")
            }
            options={translateOptions(RIDE_LENGTH_OPTIONS, locale)}
          />
        </CardContent>
      </Card>

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>{messages.saddleSelector.currentSaddle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" variant="outline" onClick={() => setShowCurrentSaddle((value) => !value)}>
            {showCurrentSaddle ? messages.saddleSelector.hideOptional : messages.saddleSelector.showOptional}
          </Button>
          {showCurrentSaddle ? (
            <div className="grid gap-4 md:grid-cols-2">
              <NumberInput
                label={messages.saddleSelector.currentWidth}
                value={currentSaddleWidthMm}
                onChange={setCurrentSaddleWidthMm}
                min={120}
                max={190}
                unit="mm"
              />
              <Select
                label={messages.saddleSelector.currentFeel}
                value={currentSaddleSatisfaction}
                onChange={(event) => setCurrentSaddleSatisfaction(event.target.value)}
                options={translateOptions(SATISFACTION_OPTIONS, locale)}
              />
              <Select
                label={messages.saddleSelector.currentShape}
                value={currentSaddleShape}
                onChange={(event) => setCurrentSaddleShape(event.target.value)}
                options={translateOptions(SHAPE_OPTIONS, locale)}
              />
              <Select
                label={messages.saddleSelector.currentTilt}
                value={currentSaddleTilt}
                onChange={(event) => setCurrentSaddleTilt(event.target.value)}
                options={translateOptions(TILT_OPTIONS, locale)}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>{messages.saddleSelector.symptoms}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" variant="outline" onClick={() => setShowSymptoms((value) => !value)}>
            {showSymptoms ? messages.saddleSelector.hideOptional : messages.saddleSelector.showOptional}
          </Button>
          {showSymptoms ? (
            <div className="grid gap-3 md:grid-cols-2">
              {SYMPTOM_FIELDS.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={symptoms[field.key]}
                    onChange={(event) =>
                      setSymptoms((current) => ({
                        ...current,
                        [field.key]: event.target.checked,
                      }))
                    }
                  />
                  <span>{isNl ? translateOptions([{ value: field.key, label: field.label }], locale)[0].label : field.label}</span>
                </label>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleCalculate} isLoading={isCalculating}>
          {messages.saddleSelector.calculate}
        </Button>
        {saveState === "saved" ? (
          <span className="self-center text-sm text-muted-foreground">
            {messages.saddleSelector.saved}
          </span>
        ) : null}
      </div>

      {result ? (
        <div ref={resultRef} className="space-y-4">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>{messages.saddleSelector.targetWidth}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-semibold text-foreground">
                ~{result.width.finalRecommendedWidthMm} mm
              </p>
              <p className="text-sm text-muted-foreground">
                {messages.saddleSelector.widthRange}: {result.width.widthRangeMinMm}-{result.width.widthRangeMaxMm} mm ({result.width.primaryWidthClass})
              </p>
              <p className="text-sm text-muted-foreground">
                {messages.saddleSelector.confidence}: {result.width.confidenceLevel} ({result.width.confidenceScore}/100)
              </p>
              {result.width.widthMatchAssessment ? (
                <p className="text-sm text-muted-foreground">
                  {messages.saddleSelector.currentComparison}: {result.width.widthMatchAssessment} ({result.width.widthMatchScore}/100)
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>{messages.saddleSelector.saddleFamily}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {formatFamily(result.suitability.saddleFamily, isNl)}
              </p>
              <p>{messages.saddleSelector.noseType}: {result.suitability.noseType}</p>
              <p>{messages.saddleSelector.profileShape}: {result.suitability.profileShape}</p>
              <p>{messages.saddleSelector.cutout}: {result.suitability.cutoutRecommended ? messages.saddleSelector.yes : messages.saddleSelector.no}</p>
              <p>{messages.saddleSelector.padding}: {result.suitability.paddingPreference}</p>
            </CardContent>
          </Card>

          {result.suitability.fitInteractionWarnings.length > 0 ? (
            <PublicInfoPanel
              tone="warning"
              title={messages.saddleSelector.fitInteractionNotes}
            >
              <ul className="space-y-2">
                {result.suitability.fitInteractionWarnings.map((warning) => (
                  <li key={warning.code}>{warning.message}</li>
                ))}
              </ul>
            </PublicInfoPanel>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleSave} isLoading={isSaving}>
              {messages.saddleSelector.save}
            </Button>
          </div>
        </div>
      ) : null}

      {sessions && sessions.length > 0 ? (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>{messages.saddleSelector.previousRecommendations}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {sessions.map((session: { _id: string; createdAt: number; widthRangeMinMm: number; widthRangeMaxMm: number; saddleFamily: string; confidenceLevel: string }) => (
              <div key={String(session._id)} className="rounded-xl border border-border px-4 py-3">
                {new Date(session.createdAt).toLocaleDateString(locale)} · {session.widthRangeMinMm}-{session.widthRangeMaxMm} mm · {formatFamily(session.saddleFamily, isNl)} · {session.confidenceLevel}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
