"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Button } from "@/components/ui";
import { QuestionnaireProgressBar } from "@/components/questionnaire/QuestionnaireProgressBar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepBikeSelect } from "./wizard/StepBikeSelect";
import { StepWheelsetTires } from "./wizard/StepWheelsetTires";
import { StepWeightGoal } from "./wizard/StepWeightGoal";
import { StepRoute } from "./wizard/StepRoute";
import { StepResult } from "./wizard/StepResult";
import type { InlineTireInput } from "./shared";

interface PressureWizardProps {
  initialBikeId?: string;
}

export function PressureWizard({ initialBikeId }: PressureWizardProps) {
  return <PressureWizardContent key={initialBikeId ?? "no-bike"} initialBikeId={initialBikeId} />;
}

function PressureWizardContent({ initialBikeId }: PressureWizardProps) {
  const { locale, messages } = useDashboardMessages();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedBikeId, setSelectedBikeId] = useState<Id<"bikes"> | null>(
    (initialBikeId as Id<"bikes"> | undefined) ?? null
  );
  const [selectedDiscipline, setSelectedDiscipline] = useState<
    "road" | "gravel" | "mtb" | "tt"
  >("road");
  const [selectedWheelsetId, setSelectedWheelsetId] = useState<Id<"wheelsets"> | null>(null);
  const [selectedTireSetupId, setSelectedTireSetupId] = useState<Id<"tireSetups"> | null>(null);
  const [inlineTireInput, setInlineTireInput] = useState<InlineTireInput | null>(null);
  const [manualBodyWeightKg, setManualBodyWeightKg] = useState<number | undefined>(undefined);
  const [manualBikeWeightKg, setManualBikeWeightKg] = useState<number | undefined>(undefined);
  const [extraLuggageKg, setExtraLuggageKg] = useState<number>(0);
  const [isWet, setIsWet] = useState(false);
  const [ridingGoal, setRidingGoal] = useState<"speed" | "balance" | "comfort">("balance");
  const [currentFrontBar, setCurrentFrontBar] = useState<number | undefined>(undefined);
  const [currentRearBar, setCurrentRearBar] = useState<number | undefined>(undefined);
  const [surface, setSurface] = useState<
    "smooth_asphalt" | "average_asphalt" | "rough_asphalt" | "hardpack_gravel" | "loose_gravel" | "trail"
  >("average_asphalt");
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | undefined>(undefined);
  const [routeElevationM, setRouteElevationM] = useState<number | undefined>(undefined);
  const [offRoadPercent, setOffRoadPercent] = useState(0);

  const bikes = useQuery(api.bikes.queries.list);
  const profile = useQuery(api.profiles.queries.getMyProfile);
  const selectedBike = bikes?.find((bike) => bike._id === selectedBikeId) ?? null;
  const wheelsets = useQuery(
    api.wheelsets.queries.listForBike,
    selectedBikeId ? { bikeId: selectedBikeId } : "skip"
  );
  const tireSetups = useQuery(
    api.tireSetups.queries.listForWheelset,
    selectedWheelsetId ? { wheelsetId: selectedWheelsetId } : "skip"
  );

  const discipline = selectedBike?.discipline ?? selectedDiscipline;
  const bodyWeightKg = manualBodyWeightKg ?? profile?.weightKg ?? 75;
  const bikeWeightKg = manualBikeWeightKg ?? selectedBike?.bikeWeightKg;

  const steps = [
    messages.pressure.wizard.stepLabels.bike,
    messages.pressure.wizard.stepLabels.wheelsetTires,
    messages.pressure.wizard.stepLabels.weightGoal,
    messages.pressure.wizard.stepLabels.route,
    messages.pressure.wizard.stepLabels.result,
  ];
  const totalSteps = steps.length;
  const estimatedMinutesRemaining = Math.max(1, totalSteps - currentStep + 1);
  const percentComplete = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);
  const currentStepLabel = steps[currentStep - 1] ?? "";

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((current) => (current - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((current) => (current + 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  return (
    <div className="space-y-6">
      {profile !== undefined && !profile?.weightKg ? (
        <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_10%,var(--card)_90%)] px-4 py-3 text-sm text-[color:var(--warning-foreground)]">
          {messages.pressure.wizard.profileWeightMissing}{" "}
          <a href={`/${locale}/profile`} className="font-semibold underline underline-offset-4">
            {messages.pressure.wizard.profileWeightCta}
          </a>
        </div>
      ) : null}

      <div className="space-y-3">
        <QuestionnaireProgressBar
          estimatedMinutes={estimatedMinutesRemaining}
          percentComplete={percentComplete}
        />
        <p className="text-center text-sm text-[color:var(--muted-foreground)]">
          {messages.pressure.wizard.stepOf
            .replace("{current}", String(currentStep))
            .replace("{total}", String(totalSteps))}
          <span className="ml-1">·</span>
          <span className="ml-1">{currentStepLabel}</span>
        </p>
      </div>

      {currentStep === 1 ? (
        <StepBikeSelect
          locale={locale}
          bikes={bikes}
          selectedBikeId={selectedBikeId}
          selectedDiscipline={selectedDiscipline}
          onSelectBike={(bikeId) => {
            setSelectedBikeId(bikeId);
            setSelectedWheelsetId(null);
            setSelectedTireSetupId(null);
          }}
          onSelectDiscipline={setSelectedDiscipline}
          onContinueWithoutBike={() => setSelectedBikeId(null)}
          labels={{
            selectBike: messages.pressure.wizard.selectBike,
            noBikes: messages.pressure.wizard.noBikes,
            addBikeLink: messages.pressure.wizard.addBikeLink,
            continueWithoutBike: messages.pressure.wizard.continueWithoutBike,
          }}
        />
      ) : null}

      {currentStep === 2 ? (
        <StepWheelsetTires
          locale={locale}
          bikeSelected={selectedBikeId !== null}
          wheelsets={wheelsets?.map((wheelset) => ({
            _id: wheelset._id,
            name: wheelset.name,
          }))}
          tireSetups={tireSetups?.map((tireSetup) => ({
            _id: tireSetup._id,
            name: tireSetup.name,
            widthFrontMm: tireSetup.widthFrontMm,
            widthRearMm: tireSetup.widthRearMm,
            tubeType: tireSetup.tubeType,
          }))}
          selectedWheelsetId={selectedWheelsetId}
          selectedTireSetupId={selectedTireSetupId}
          inlineTireInput={inlineTireInput}
          onSelectWheelset={(wheelsetId) => {
            setSelectedWheelsetId(wheelsetId);
            setSelectedTireSetupId(null);
          }}
          onSelectTireSetup={setSelectedTireSetupId}
          onInlineInputChange={setInlineTireInput}
          labels={{
            title: messages.pressure.wizard.selectWheelset,
            manualInput: messages.pressure.wizard.manualInput,
            widthFront: messages.pressure.wizard.widthFront,
            widthRear: messages.pressure.wizard.widthRear,
            maxPressure: messages.pressure.wizard.maxPressure,
            rimType: messages.pressure.wizard.rimType,
            rimWidthFront: messages.pressure.wizard.rimWidthFront,
            rimWidthRear: messages.pressure.wizard.rimWidthRear,
          }}
        />
      ) : null}

      {currentStep === 3 ? (
        <StepWeightGoal
          bodyWeightKg={bodyWeightKg}
          bikeWeightKg={bikeWeightKg}
          extraLuggageKg={extraLuggageKg}
          isWet={isWet}
          ridingGoal={ridingGoal}
          currentFrontBar={currentFrontBar}
          currentRearBar={currentRearBar}
          onUpdate={(updates) => {
            if (updates.bodyWeightKg !== undefined) setManualBodyWeightKg(updates.bodyWeightKg);
            if ("bikeWeightKg" in updates) setManualBikeWeightKg(updates.bikeWeightKg);
            if (updates.extraLuggageKg !== undefined) setExtraLuggageKg(updates.extraLuggageKg);
            if (updates.isWet !== undefined) setIsWet(updates.isWet);
            if (updates.ridingGoal !== undefined) setRidingGoal(updates.ridingGoal);
            if ("currentFrontBar" in updates) setCurrentFrontBar(updates.currentFrontBar);
            if ("currentRearBar" in updates) setCurrentRearBar(updates.currentRearBar);
          }}
          labels={{
            title: messages.pressure.wizard.stepLabels.weightGoal,
            bodyWeightLabel: messages.pressure.form.bodyWeightLabel,
            bikeWeightLabel: messages.pressure.form.bikeWeightLabel,
            extraLuggageLabel: messages.pressure.wizard.extraLuggageLabel,
            currentFrontLabel: messages.pressure.wizard.currentFrontLabel,
            currentRearLabel: messages.pressure.wizard.currentRearLabel,
            wetLabel: messages.pressure.wizard.wetLabel,
            wet: messages.pressure.wizard.wet,
            dry: messages.pressure.wizard.dry,
            goalTitle: messages.pressure.form.ridingGoalLabel,
            goalSpeed: messages.pressure.form.ridingGoalSpeed,
            goalBalance: messages.pressure.form.ridingGoalBalance,
            goalComfort: messages.pressure.form.ridingGoalComfort,
          }}
        />
      ) : null}

      {currentStep === 4 ? (
        <StepRoute
          locale={locale}
          surface={surface}
          routeDistanceKm={routeDistanceKm}
          routeElevationM={routeElevationM}
          offRoadPercent={offRoadPercent}
          onUpdate={(updates) => {
            if (updates.surface !== undefined) setSurface(updates.surface);
            if ("routeDistanceKm" in updates) setRouteDistanceKm(updates.routeDistanceKm);
            if ("routeElevationM" in updates) setRouteElevationM(updates.routeElevationM);
            if (updates.offRoadPercent !== undefined) setOffRoadPercent(updates.offRoadPercent);
          }}
          labels={{
            title: messages.pressure.wizard.stepLabels.route,
            surfaceLabel: messages.pressure.wizard.surfaceLabel,
            distanceLabel: messages.pressure.wizard.distanceLabel,
            elevationLabel: messages.pressure.wizard.elevationLabel,
            offRoadLabel: messages.pressure.wizard.offRoadLabel,
          }}
        />
      ) : null}

      {currentStep === 5 ? (
        <StepResult
          locale={locale}
          bikeId={selectedBikeId}
          tireSetupId={selectedTireSetupId}
          inlineTireInput={inlineTireInput}
          bodyWeightKg={bodyWeightKg}
          bikeWeightKg={bikeWeightKg}
          extraLuggageKg={extraLuggageKg}
          isWet={isWet}
          ridingGoal={ridingGoal}
          surface={surface}
          routeDistanceKm={routeDistanceKm}
          routeElevationM={routeElevationM}
          offRoadPercent={offRoadPercent}
          currentFrontBar={currentFrontBar}
          currentRearBar={currentRearBar}
          discipline={discipline}
          onBack={() => setCurrentStep(4)}
          onReset={() => {
            setCurrentStep(1);
            setSelectedWheelsetId(null);
            setSelectedTireSetupId(null);
            setInlineTireInput(null);
          }}
          resultLabels={messages.pressure.result}
          wizardLabels={{
            back: messages.pressure.wizard.back,
            saveCalculation: messages.pressure.wizard.saveCalculation,
            saveAsPreset: messages.pressure.wizard.saveAsPreset,
            presetName: messages.pressure.wizard.presetName,
            presetUseCase: messages.pressure.wizard.presetUseCase,
            presetDefaultName: messages.pressure.wizard.presetDefaultName,
            selectWheelsetFirst: messages.pressure.wizard.selectWheelsetFirst,
            calculationSaved: messages.pressure.wizard.calculationSaved,
            presetSaved: messages.pressure.wizard.presetSaved,
            newCalculation: messages.pressure.wizard.newCalculation,
            goToMyBikes: messages.pressure.wizard.goToMyBikes,
            currentPressureSummary: messages.pressure.wizard.currentPressureSummary,
            recommendedPressureSummary:
              messages.pressure.wizard.recommendedPressureSummary,
            useCaseRace: messages.pressure.wizard.useCaseRace,
            useCaseEndurance: messages.pressure.wizard.useCaseEndurance,
            useCaseWetWeather: messages.pressure.wizard.useCaseWetWeather,
            useCaseGravelMixed: messages.pressure.wizard.useCaseGravelMixed,
            useCaseComfort: messages.pressure.wizard.useCaseComfort,
            useCaseCustom: messages.pressure.wizard.useCaseCustom,
          }}
        />
      ) : null}

      {currentStep < 5 ? (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {messages.questionnaire.actions.previous}
          </Button>
          <Button onClick={handleNext}>
            {messages.questionnaire.actions.next}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
