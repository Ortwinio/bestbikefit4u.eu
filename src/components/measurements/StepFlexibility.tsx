"use client";

import { useFormContext, Controller } from "react-hook-form";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Selectable } from "@/components/ui";
import { flexibilityTests } from "@/lib/validations/profile";

export function StepFlexibility() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Hamstring Flexibility Test
        </h3>
        <p className="text-gray-600">
          Your flexibility affects how aggressive your riding position can be.
          Complete this simple test to help us personalize your fit.
        </p>
      </div>

      {/* Test Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">
          How to perform the test:
        </h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
          <li>Sit on the floor with legs straight out in front</li>
          <li>Keep your knees flat on the ground</li>
          <li>Reach forward with both hands toward your toes</li>
          <li>Note how far you can comfortably reach</li>
        </ol>
      </div>

      {/* Score Selection */}
      <Controller
        name="flexibilityScore"
        control={control}
        render={({ field }) => (
          <div className="space-y-3">
            <label
              id={`${field.name}-label`}
              className="block text-sm font-medium text-gray-700"
            >
              Select your result:
            </label>
            <RadioGroup<number>
              aria-labelledby={`${field.name}-label`}
              className="grid gap-3"
              name={field.name}
              value={field.value ?? undefined}
              onValueChange={(next) => field.onChange(next)}
            >
              {flexibilityTests.map((test) => (
                <Selectable
                  key={test.score}
                  mode="radio"
                  value={test.score}
                  variant="card"
                  label={test.label}
                  badge={
                    <span className="rounded-full bg-[color:var(--secondary)] px-2 py-0.5 text-xs text-[color:var(--secondary-foreground)]">
                      {test.testResult}
                    </span>
                  }
                  description={test.description}
                >
                </Selectable>
              ))}
            </RadioGroup>
          </div>
        )}
      />

      {/* Impact Note */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">
          How this affects your fit
        </h4>
        <p className="text-sm text-gray-600">
          Lower flexibility scores will result in a more upright position with
          less handlebar drop. This protects your lower back and reduces strain.
          Higher flexibility allows for a more aggressive, aerodynamic position.
        </p>
      </div>
    </div>
  );
}
