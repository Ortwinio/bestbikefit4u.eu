import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { calculateAdvancedPressure } from "@/lib/pressure-engine";
import { withLocalePrefix } from "@/i18n/navigation";
import { PressureResultCard } from "../PressureResultCard";
import type { InlineTireInput, PressureResultLabels } from "../shared";

interface StepResultProps {
  locale: "en" | "nl";
  bikeId: Id<"bikes"> | null;
  tireSetupId: Id<"tireSetups"> | null;
  inlineTireInput: InlineTireInput | null;
  bodyWeightKg: number;
  bikeWeightKg: number | undefined;
  extraLuggageKg: number;
  isWet: boolean;
  ridingGoal: "speed" | "balance" | "comfort";
  surface: "smooth_asphalt" | "average_asphalt" | "rough_asphalt" | "hardpack_gravel" | "loose_gravel" | "trail";
  routeDistanceKm: number | undefined;
  routeElevationM: number | undefined;
  offRoadPercent: number;
  currentFrontBar: number | undefined;
  currentRearBar: number | undefined;
  discipline: "road" | "gravel" | "mtb" | "tt";
  onBack: () => void;
  onReset: () => void;
  resultLabels: PressureResultLabels;
  wizardLabels: {
    back: string;
    saveCalculation: string;
    saveAsPreset: string;
    presetName: string;
    presetUseCase: string;
    presetDefaultName: string;
    selectWheelsetFirst: string;
    calculationSaved: string;
    presetSaved: string;
    newCalculation: string;
    goToMyBikes: string;
    currentPressureSummary: string;
    recommendedPressureSummary: string;
    useCaseRace: string;
    useCaseEndurance: string;
    useCaseWetWeather: string;
    useCaseGravelMixed: string;
    useCaseComfort: string;
    useCaseCustom: string;
  };
}

export function StepResult({
  locale,
  bikeId,
  tireSetupId,
  inlineTireInput,
  bodyWeightKg,
  bikeWeightKg,
  extraLuggageKg,
  isWet,
  ridingGoal,
  surface,
  routeDistanceKm,
  routeElevationM,
  offRoadPercent,
  currentFrontBar,
  currentRearBar,
  discipline,
  onBack,
  onReset,
  resultLabels,
  wizardLabels,
}: StepResultProps) {
  const tireSetup = useQuery(
    api.tireSetups.queries.get,
    tireSetupId ? { tireSetupId } : "skip"
  );
  const saveCalculation = useMutation(api.pressureCalculations.mutations.save);
  const savePreset = useMutation(api.pressureProfiles.mutations.save);

  const [presetName, setPresetName] = useState(wizardLabels.presetDefaultName);
  const [presetUseCase, setPresetUseCase] = useState<
    "race" | "endurance" | "wet_weather" | "gravel_mixed" | "comfort" | "custom"
  >("race");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const calculationInput = useMemo(() => {
    const source = tireSetup
      ? {
          widthFrontMm: tireSetup.widthFrontMm,
          widthRearMm: tireSetup.widthRearMm,
          tubeType: tireSetup.tubeType,
          casingType: tireSetup.casingType,
          maxPressureBar: tireSetup.maxPressureBar,
        }
      : inlineTireInput;

    if (!source) {
      return null;
    }

    return {
      discipline,
      bodyWeightKg,
      bikeWeightKg,
      extraLuggageKg,
      isWet,
      ridingGoal,
      surface,
      routeDistanceKm,
      routeElevationM,
      offRoadPercent,
      currentFrontBar,
      currentRearBar,
      ...source,
    };
  }, [bikeWeightKg, bodyWeightKg, currentFrontBar, currentRearBar, discipline, extraLuggageKg, inlineTireInput, isWet, offRoadPercent, ridingGoal, routeDistanceKm, routeElevationM, surface, tireSetup]);

  const result = calculationInput ? calculateAdvancedPressure(calculationInput) : null;

  const handleSaveCalculation = async () => {
    if (!result || !calculationInput) {
      return;
    }

    await saveCalculation({
      bikeId: bikeId ?? undefined,
      tireSetupId: tireSetupId ?? undefined,
      sourceType: bikeId ? "dashboard_advanced" : "dashboard_basic",
      inputSnapshot: {
        bodyWeightKg,
        bikeWeightKg,
        extraLuggageKg,
        discipline,
        widthFrontMm: calculationInput.widthFrontMm,
        widthRearMm: calculationInput.widthRearMm,
        tubeType: calculationInput.tubeType,
        casingType: calculationInput.casingType,
        rimType: calculationInput.rimType,
        internalRimWidthFrontMm: calculationInput.internalRimWidthFrontMm,
        internalRimWidthRearMm: calculationInput.internalRimWidthRearMm,
        surface,
        ridingGoal,
        isWet,
        routeDistanceKm,
        routeElevationM,
        offRoadPercent,
      },
      recommendedFrontBar: result.frontBar,
      recommendedRearBar: result.rearBar,
      recommendedFrontPsi: result.frontPsi,
      recommendedRearPsi: result.rearPsi,
      currentFrontBar,
      currentRearBar,
      comfortScore: result.comfortScore,
      gripScore: result.gripScore,
      efficiencyScore: result.efficiencyScore,
      warningsJson: JSON.stringify(result.warnings),
      routeContextJson: JSON.stringify({
        routeDistanceKm,
        routeElevationM,
        offRoadPercent,
      }),
    });

    setSaveMessage(wizardLabels.calculationSaved);
  };

  const handleSavePreset = async () => {
    if (!bikeId || !tireSetupId || !result) {
      return;
    }

    await savePreset({
      bikeId,
      tireSetupId,
      name: presetName,
      useCase: presetUseCase,
      targetSurface: surface,
      targetGoal: ridingGoal,
      recommendedFrontBar: result.frontBar,
      recommendedRearBar: result.rearBar,
      lastCalculatedAt: Date.now(),
    });

    setSaveMessage(wizardLabels.presetSaved);
  };

  if (!result) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{wizardLabels.selectWheelsetFirst}</p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {wizardLabels.back}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PressureResultCard result={result} labels={resultLabels} />

      {(currentFrontBar !== undefined || currentRearBar !== undefined) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-700">
            {wizardLabels.currentPressureSummary}: {currentFrontBar ?? "-"} / {currentRearBar ?? "-"} bar
          </p>
          <p className="mt-1 text-sm text-gray-700">
            {wizardLabels.recommendedPressureSummary}: {result.frontBar} / {result.rearBar} bar
          </p>
        </div>
      )}

      {saveMessage ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {saveMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {wizardLabels.back}
        </button>
        <button
          type="button"
          onClick={handleSaveCalculation}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {wizardLabels.saveCalculation}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {wizardLabels.newCalculation}
        </button>
        <Link
          href={withLocalePrefix("/bikes", locale)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {wizardLabels.goToMyBikes}
        </Link>
      </div>

      {bikeId && tireSetupId ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-900">{wizardLabels.saveAsPreset}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-gray-700">{wizardLabels.presetName}</span>
              <input
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">{wizardLabels.presetUseCase}</span>
              <select
                value={presetUseCase}
                onChange={(event) =>
                  setPresetUseCase(
                    event.target.value as
                      | "race"
                      | "endurance"
                      | "wet_weather"
                      | "gravel_mixed"
                      | "comfort"
                      | "custom"
                  )
                }
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
              >
                <option value="race">{wizardLabels.useCaseRace}</option>
                <option value="endurance">{wizardLabels.useCaseEndurance}</option>
                <option value="wet_weather">{wizardLabels.useCaseWetWeather}</option>
                <option value="gravel_mixed">{wizardLabels.useCaseGravelMixed}</option>
                <option value="comfort">{wizardLabels.useCaseComfort}</option>
                <option value="custom">{wizardLabels.useCaseCustom}</option>
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={handleSavePreset}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            {wizardLabels.saveAsPreset}
          </button>
        </div>
      ) : null}
    </div>
  );
}
