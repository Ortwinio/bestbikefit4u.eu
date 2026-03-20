"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
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

  useEffect(() => {
    setSelectedBikeId((initialBikeId as Id<"bikes"> | undefined) ?? null);
    setSelectedWheelsetId(null);
    setSelectedTireSetupId(null);
    setInlineTireInput(null);
    setCurrentStep(1);
  }, [initialBikeId]);

  return (
    <div className="space-y-6">
      {profile !== undefined && !profile?.weightKg ? (
        <div className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {messages.pressure.wizard.profileWeightMissing}{" "}
          <a href={`/${locale}/profile`} className="font-semibold underline">
            {messages.pressure.wizard.profileWeightCta}
          </a>
        </div>
      ) : null}

      <div>
        <p className="text-sm font-medium text-gray-600">
          {messages.pressure.wizard.stepOf
            .replace("{current}", String(currentStep))
            .replace("{total}", "5")}
        </p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`rounded-full px-3 py-2 text-center text-xs font-semibold ${
                index + 1 <= currentStep
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {label}
            </div>
          ))}
        </div>
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
          onNext={() => setCurrentStep(2)}
          labels={{
            selectBike: messages.pressure.wizard.selectBike,
            noBikes: messages.pressure.wizard.noBikes,
            addBikeLink: messages.pressure.wizard.addBikeLink,
            continueWithoutBike: messages.pressure.wizard.continueWithoutBike,
            next: messages.pressure.wizard.next,
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
          onBack={() => setCurrentStep(1)}
          onNext={() => setCurrentStep(3)}
          labels={{
            title: messages.pressure.wizard.selectWheelset,
            manualInput: messages.pressure.wizard.manualInput,
            next: messages.pressure.wizard.next,
            back: messages.pressure.wizard.back,
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
          onBack={() => setCurrentStep(2)}
          onNext={() => setCurrentStep(4)}
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
            next: messages.pressure.wizard.next,
            back: messages.pressure.wizard.back,
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
          onBack={() => setCurrentStep(3)}
          onNext={() => setCurrentStep(5)}
          labels={{
            title: messages.pressure.wizard.stepLabels.route,
            surfaceLabel: messages.pressure.wizard.surfaceLabel,
            distanceLabel: messages.pressure.wizard.distanceLabel,
            elevationLabel: messages.pressure.wizard.elevationLabel,
            offRoadLabel: messages.pressure.wizard.offRoadLabel,
            next: messages.pressure.wizard.next,
            back: messages.pressure.wizard.back,
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
    </div>
  );
}
