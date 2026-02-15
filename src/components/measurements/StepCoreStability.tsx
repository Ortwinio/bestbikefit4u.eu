"use client";

import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/utils/cn";
import { coreStabilityTests } from "@/lib/validations/profile";
import { Check, Timer } from "lucide-react";

export function StepCoreStability() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Core Stability Test
        </h3>
        <p className="text-gray-600">
          Your core strength determines how long you can maintain an aggressive
          position without fatigue. This helps us set appropriate reach and drop
          limits.
        </p>
      </div>

      {/* Test Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Timer className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              Front Plank Hold Test
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Get into a front plank position on forearms and toes</li>
              <li>Keep a straight line from head to heels</li>
              <li>No sagging or piking (raising hips)</li>
              <li>Time how long you can hold with proper form</li>
              <li>Stop when form breaks down</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Score Selection */}
      <Controller
        name="coreStabilityScore"
        control={control}
        render={({ field }) => (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              How long can you hold a plank?
            </label>
            <div className="grid gap-3">
              {coreStabilityTests.map((test) => (
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
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold",
                        field.value === test.score
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {test.score}
                    </div>
                    <div>
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
                      <p
                        className={cn(
                          "text-sm",
                          field.value === test.score
                            ? "text-blue-700"
                            : "text-gray-500"
                        )}
                      >
                        {test.description}
                      </p>
                    </div>
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
          Lower core stability means we&apos;ll limit how far you reach and how low
          your handlebars can be. This prevents fatigue and shoulder/neck pain.
          Stronger core allows for a more stretched-out, performance-oriented
          position.
        </p>
      </div>
    </div>
  );
}
