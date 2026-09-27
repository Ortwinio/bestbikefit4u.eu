"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wizardSchema, type WizardFormData } from "@/lib/validations/measurementWizard";
export type { WizardFormData } from "@/lib/validations/measurementWizard";
import {
  Button,
  Card,
  CardContent,
} from "@/components/ui";
import { StepBodyMeasurements } from "./StepBodyMeasurements";
import { StepAdvancedMeasurements } from "./StepAdvancedMeasurements";
import { StepFlexibility } from "./StepFlexibility";
import { StepCoreStability } from "./StepCoreStability";
import { StepComfort } from "./StepComfort";
import { StepRidingStyle } from "./StepRidingStyle";
import { ListChecks, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { toPercentBucket } from "@/lib/uiPercent";


const steps = [
  {
    id: 1,
    title: "Body Measurements",
    description: "Height and inseam",
    category: "Rider Profile · Step 1 of 6",
  },
  {
    id: 2,
    title: "Advanced Measurements",
    description: "Torso, arms, shoulders",
    category: "Rider Profile · Step 2 of 6",
  },
  {
    id: 3,
    title: "Flexibility",
    description: "Hamstring mobility test",
    category: "Rider Profile · Step 3 of 6",
  },
  {
    id: 4,
    title: "Core Stability",
    description: "Plank hold test",
    category: "Rider Profile · Step 4 of 6",
  },
  {
    id: 5,
    title: "Comfort",
    description: "Current riding comfort",
    category: "Rider Profile · Step 5 of 6",
  },
  {
    id: 6,
    title: "Riding Style",
    description: "Experience and goals",
    category: "Rider Profile · Step 6 of 6",
  },
];

interface MeasurementWizardProps {
  onComplete: (data: WizardFormData) => void;
  defaultValues?: Partial<WizardFormData>;
}

export function MeasurementWizard({
  onComplete,
  defaultValues,
}: MeasurementWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { locale, messages } = useDashboardMessages();

  const methods = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      heightCm: defaultValues?.heightCm,
      inseamCm: defaultValues?.inseamCm,
      weightKg: defaultValues?.weightKg,
      torsoLengthCm: defaultValues?.torsoLengthCm,
      armLengthCm: defaultValues?.armLengthCm,
      femurLengthCm: defaultValues?.femurLengthCm,
      shoulderWidthCm: defaultValues?.shoulderWidthCm,
      flexibilityScore: defaultValues?.flexibilityScore || "average",
      coreStabilityScore: defaultValues?.coreStabilityScore || 3,
      comfortScore: defaultValues?.comfortScore || 5,
      painAreas: defaultValues?.painAreas ?? [],
      experienceLevel: defaultValues?.experienceLevel,
      weeklyHours: defaultValues?.weeklyHours,
      typicalRideLength: defaultValues?.typicalRideLength,
      positionPriority: defaultValues?.positionPriority,
    },
    mode: "onChange",
  });

  const { handleSubmit, trigger } = methods;
  const activeStep = steps[currentStep - 1];
  const percentComplete = Math.round((currentStep / steps.length) * 100);
  const percentBucket = toPercentBucket(percentComplete);

  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 1:
        return await trigger(["heightCm", "inseamCm"]);
      case 2:
        return true; // optional measurements
      case 5:
        return await trigger(["comfortScore", "painAreas"]);
      case 6:
        return await trigger(["experienceLevel", "weeklyHours", "typicalRideLength", "positionPriority"]);
      case 3:
        return await trigger(["flexibilityScore"]);
      case 4:
        return await trigger(["coreStabilityScore"]);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push(withLocalePrefix("/profile", locale));
    }
  };

  const onSubmit = async (data: WizardFormData) => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepBodyMeasurements />;
      case 2: return <StepAdvancedMeasurements />;
      case 3: return <StepFlexibility />;
      case 4: return <StepCoreStability />;
      case 5: return <StepComfort />;
      case 6: return <StepRidingStyle />;
      default: return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-2xl">

        {/* Progress bar — outside the card */}
        <div className="mb-6 flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-muted/50 px-4 py-3">
          <ListChecks className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-border">·</span>
          <div className="flex flex-1 items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="csp-fill-width h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                data-fill-pct={percentBucket}
              />
            </div>
            <span className="shrink-0 text-sm text-muted-foreground">
              {percentComplete}%
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Card — title inside CardContent */}
          <Card variant="bordered" className="mb-6">
            <CardContent className="pt-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {activeStep.category}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">
                  {activeStep.title}
                </h2>
              </div>

              {renderStep()}
            </CardContent>
          </Card>

          {/* Navigation buttons — outside the card */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {messages.questionnaire.actions.previous}
            </Button>

            {currentStep < steps.length ? (
              <Button key="next" type="button" onClick={handleNext}>
                {messages.questionnaire.actions.next}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                key="save"
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {messages.common.save}
                <Check className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>

      </div>
    </FormProvider>
  );
}
