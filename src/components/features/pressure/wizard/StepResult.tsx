import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button, Card, CardContent, InfoBox, Input, Select, StatRow } from "@/components/ui";
import { calculateAdvancedPressure } from "@/lib/pressure-engine";
import { createPublicCalculatorResultEnvelope } from "@/lib/publicCalculatorLogic";
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
  const pressureSummary = useMemo(() => {
    if (!result) {
      return null;
    }

    return createPublicCalculatorResultEnvelope({
      calculatorKey: "tire-pressure",
      recommended: {
        frontBar: result.frontBar,
        rearBar: result.rearBar,
      },
      confidence: {
        level: result.warnings.length > 1 ? "medium" : "high",
        score: result.warnings.length > 1 ? 68 : 84,
        reasons: [],
      },
      primaryDrivers:
        locale === "nl"
          ? ["Rijdersgewicht", "Bandbreedte", "Ondergrond", "Bandtype"]
          : ["Rider weight", "Tyre width", "Surface", "Tyre type"],
      secondaryModifiers:
        locale === "nl"
          ? ["Rijdoel", "Fietsgewicht", "Weers- en routecontext"]
          : ["Riding goal", "Bike weight", "Weather and route context"],
      notCovered:
        locale === "nl"
          ? ["Persoonlijke voorkeur en verfijning na meerdere ritten"]
          : ["Personal preference and refinement after multiple rides"],
      nextAction:
        locale === "nl"
          ? "Valideer dit met kleine stappen van 0,1 bar op je volgende rit."
          : "Validate this in 0.1 bar steps on your next ride.",
    });
  }, [locale, result]);
  const extraNotes =
    locale === "nl"
      ? [
          "Controleer eerst grip vooraan en stabiliteit achteraan.",
          "Gebruik nat weer en bagage alleen als verfijners, niet als basis.",
        ]
      : [
          "Check front grip first and rear stability second.",
          "Treat wet weather and luggage as refinements, not the baseline.",
        ];

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
        <p className="text-sm text-[color:var(--muted-foreground)]">{wizardLabels.selectWheelsetFirst}</p>
        <Button variant="outline" onClick={onBack}>
          {wizardLabels.back}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PressureResultCard
        result={result}
        labels={resultLabels}
        isNl={locale === "nl"}
        summary={pressureSummary!}
        extraNotes={extraNotes}
      />

      {(currentFrontBar !== undefined || currentRearBar !== undefined) && (
        <Card variant="bordered">
          <CardContent className="p-4">
            <dl className="divide-y divide-[color:var(--border)]">
              <StatRow
                label={wizardLabels.currentPressureSummary}
                value={`${currentFrontBar ?? "-"} / ${currentRearBar ?? "-"} bar`}
              />
              <StatRow
                label={wizardLabels.recommendedPressureSummary}
                value={`${result.frontBar} / ${result.rearBar} bar`}
              />
            </dl>
          </CardContent>
        </Card>
      )}

      {saveMessage ? (
        <InfoBox
          variant="success"
          icon={<CheckCircle className="h-4 w-4 text-[color:var(--success)]" />}
        >
          {saveMessage}
        </InfoBox>
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
        <Card variant="bordered">
          <CardContent className="space-y-4 p-4">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">{wizardLabels.saveAsPreset}</p>
            <div className="grid gap-4 sm:grid-cols-2">
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
            <Button type="button" onClick={handleSavePreset}>
              {wizardLabels.saveAsPreset}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
