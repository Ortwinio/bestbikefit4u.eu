"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { StepBodyMeasurements } from "./StepBodyMeasurements";
import { StepAdvancedMeasurements } from "./StepAdvancedMeasurements";
import { StepFlexibility } from "./StepFlexibility";
import { StepCoreStability } from "./StepCoreStability";
import { ListChecks, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";

const wizardSchema = z.object({
  // Step 1: Required body measurements
  heightCm: z.number().min(130).max(210),
  inseamCm: z.number().min(55).max(105),
  weightKg: z.number().min(30).max(200).optional(),

  // Step 2: Optional advanced measurements
  torsoLengthCm: z.number().min(45).max(75).optional(),
  armLengthCm: z.number().min(45).max(75).optional(),
  femurLengthCm: z.number().min(35).max(60).optional(),
  shoulderWidthCm: z.number().min(30).max(55).optional(),

  // Step 3: Flexibility
  flexibilityScore: z.enum([
    "very_limited",
    "limited",
    "average",
    "good",
    "excellent",
  ]),

  // Step 4: Core stability
  coreStabilityScore: z.number().min(1).max(5),
});

export type WizardFormData = z.infer<typeof wizardSchema>;

const steps = [
  {
    id: 1,
    title: "Body Measurements",
    description: "Height and inseam",
    category: "Rider Profile · Step 1 of 4",
  },
  {
    id: 2,
    title: "Advanced Measurements",
    description: "Torso, arms, shoulders",
    category: "Rider Profile · Step 2 of 4",
  },
  {
    id: 3,
    title: "Flexibility",
    description: "Hamstring mobility test",
    category: "Rider Profile · Step 3 of 4",
  },
  {
    id: 4,
    title: "Core Stability",
    description: "Plank hold test",
    category: "Rider Profile · Step 4 of 4",
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
    },
    mode: "onChange",
  });

  const { handleSubmit, trigger, formState } = methods;
  const activeStep = steps[currentStep - 1];

  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 1:
        return await trigger(["heightCm", "inseamCm"]);
      case 2:
        return true;
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
      case 1:
        return <StepBodyMeasurements />;
      case 2:
        return <StepAdvancedMeasurements />;
      case 3:
        return <StepFlexibility />;
      case 4:
        return <StepCoreStability />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-2xl">
        <Card variant="bordered" className="overflow-hidden">
          <CardHeader className="border-b border-[color:var(--border)] px-6 py-5">
            <div className="mb-4 flex items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--muted)]/50 px-4 py-3">
              <ListChecks className="h-4 w-4 shrink-0 text-[color:var(--primary)]" />
              <span className="text-sm text-[color:var(--muted-foreground)]">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-[color:var(--border)]">·</span>
              <div className="flex flex-1 items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--border)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--primary)] transition-[width] duration-500 ease-out"
                    style={{ width: `${Math.round((currentStep / steps.length) * 100)}%` }}
                  />
                </div>
                <span className="shrink-0 text-sm text-[color:var(--muted-foreground)]">
                  {Math.round((currentStep / steps.length) * 100)}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">
                {activeStep.category}
              </p>
              <CardTitle className="mt-1 text-xl text-[color:var(--foreground)]">
                {activeStep.title}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStep()}

              <div className="mt-8 flex items-center justify-between">
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
                  <Button type="button" onClick={handleNext}>
                    {messages.questionnaire.actions.next}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={!formState.isValid}
                  >
                    {messages.common.save}
                    <Check className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
