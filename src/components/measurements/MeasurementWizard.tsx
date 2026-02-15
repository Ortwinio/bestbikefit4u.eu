"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { StepBodyMeasurements } from "./StepBodyMeasurements";
import { StepAdvancedMeasurements } from "./StepAdvancedMeasurements";
import { StepFlexibility } from "./StepFlexibility";
import { StepCoreStability } from "./StepCoreStability";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const wizardSchema = z.object({
  // Step 1: Required body measurements
  heightCm: z.number().min(130).max(210),
  inseamCm: z.number().min(55).max(105),

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

  const methods = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      heightCm: defaultValues?.heightCm,
      inseamCm: defaultValues?.inseamCm,
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

  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 1:
        return await trigger(["heightCm", "inseamCm"]);
      case 2:
        return true; // Optional fields
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
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <nav className="mb-8">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => (
              <li key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      currentStep > step.id
                        ? "border-blue-600 bg-blue-600 text-white"
                        : currentStep === step.id
                          ? "border-blue-600 bg-white text-blue-600"
                          : "border-gray-300 bg-white text-gray-400"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        currentStep >= step.id
                          ? "text-gray-900"
                          : "text-gray-400"
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-12 sm:w-24 mx-2 mt-[-24px]",
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                    )}
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Form Card */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={!formState.isValid}
                  >
                    Save Profile
                    <Check className="h-4 w-4 ml-1" />
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
