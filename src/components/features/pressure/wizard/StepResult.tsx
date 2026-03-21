import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button, Input, Select } from "@/components/ui";
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

function linkButtonProps(href: string) {
  return {
    render: <Link href={href} />,
    nativeButton: false as const,
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
        <Button variant="outline" onClick={onBack}>
          {wizardLabels.back}
        </Button>
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
        <Button variant="outline" onClick={onBack}>
          {wizardLabels.back}
        </Button>
        <Button onClick={handleSaveCalculation}>
          {wizardLabels.saveCalculation}
        </Button>
        <Button variant="outline" onClick={onReset}>
          {wizardLabels.newCalculation}
        </Button>
        <Button variant="outline" {...linkButtonProps(withLocalePrefix("/bikes", locale))}>
          {wizardLabels.goToMyBikes}
        </Button>
      </div>

      {bikeId && tireSetupId ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-900">{wizardLabels.saveAsPreset}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Input
              label={wizardLabels.presetName}
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
            />
            <Select
              label={wizardLabels.presetUseCase}
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
              options={[
                { value: "race", label: wizardLabels.useCaseRace },
                { value: "endurance", label: wizardLabels.useCaseEndurance },
                { value: "wet_weather", label: wizardLabels.useCaseWetWeather },
                { value: "gravel_mixed", label: wizardLabels.useCaseGravelMixed },
                { value: "comfort", label: wizardLabels.useCaseComfort },
                { value: "custom", label: wizardLabels.useCaseCustom },
              ]}
            />
          </div>
          <Button type="button" onClick={handleSavePreset} className="mt-4">
            {wizardLabels.saveAsPreset}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
