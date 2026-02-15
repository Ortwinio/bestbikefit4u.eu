"use client";

import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/utils/cn";
import { flexibilityTests } from "@/lib/validations/profile";
import { Check } from "lucide-react";

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
            <label className="block text-sm font-medium text-gray-700">
              Select your result:
            </label>
            <div className="grid gap-3">
              {flexibilityTests.map((test) => (
                <button
                  key={test.score}
                  type="button"
                  onClick={() => field.onChange(test.score)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left",
                    field.value === test.score
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium",
                          field.value === test.score
                            ? "text-blue-900"
                            : "text-gray-900"
                        )}
                      >
                        {test.label}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          field.value === test.score
                            ? "bg-blue-200 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {test.testResult}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm mt-1",
                        field.value === test.score
                          ? "text-blue-700"
                          : "text-gray-500"
                      )}
                    >
                      {test.description}
                    </p>
                  </div>
                  {field.value === test.score && (
                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
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
