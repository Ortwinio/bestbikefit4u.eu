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
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from "@/components/ui";
import { StepBodyMeasurements } from "./StepBodyMeasurements";
import { StepAdvancedMeasurements } from "./StepAdvancedMeasurements";
import { StepFlexibility } from "./StepFlexibility";
import { StepCoreStability } from "./StepCoreStability";
import { cn } from "@/utils/cn";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
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
  { id: 1, title: "Body Measurements", description: "Height and inseam" },
  { id: 2, title: "Advanced (Optional)", description: "Torso, arms, shoulders" },
  { id: 3, title: "Flexibility", description: "Hamstring mobility" },
  { id: 4, title: "Core Stability", description: "Plank test" },
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
          <CardHeader className="border-b border-[color:var(--border)] bg-[color:var(--secondary)]/30 px-6 py-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Step {currentStep} of {steps.length}
                </p>
                <CardTitle className="text-lg text-[color:var(--foreground)]">
                  {activeStep.title}
                </CardTitle>
              </div>
              <CardDescription className="max-w-xs text-right">
                {activeStep.description}
              </CardDescription>
            </div>
            <Progress
              value={currentStep - 1}
              max={steps.length - 1}
              label="Measurement wizard progress"
            />
          </CardHeader>

          <CardContent className="px-6 py-6">
            <nav className="mb-8" aria-label="Measurement steps">
              <ol className="flex items-center justify-between gap-2">
                {steps.map((step, index) => (
                  <li key={step.id} className="flex min-w-0 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                          currentStep > step.id
                            ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                            : currentStep === step.id
                              ? "border-[color:var(--primary)] bg-[color:var(--card)] text-[color:var(--primary)]"
                              : "border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]"
                        )}
                      >
                        {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                      </div>
                      <div className="mt-2 text-center">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            currentStep >= step.id
                              ? "text-[color:var(--foreground)]"
                              : "text-[color:var(--muted-foreground)]"
                          )}
                        >
                          {step.title}
                        </p>
                        <p className="hidden text-xs text-[color:var(--muted-foreground)] sm:block">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "mx-2 mt-[-24px] h-0.5 w-12 sm:w-24",
                          currentStep > step.id
                            ? "bg-[color:var(--primary)]"
                            : "bg-[color:var(--border)]"
                        )}
                      />
                    )}
                  </li>
                ))}
              </ol>
            </nav>

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
