"use client";

import { cn } from "@/utils/cn";
import { Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  followUpQuestionIds?: string[];
}

interface MultipleChoiceQuestionProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultipleChoiceQuestion({
  options,
  value,
  onChange,
}: MultipleChoiceQuestionProps) {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
      {options.map((option) => {
        const isSelected = value.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleOption(option.value)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left",
              isSelected
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <span
              className={cn(
                "font-medium",
                isSelected ? "text-blue-900" : "text-gray-700"
              )}
            >
              {option.label}
            </span>
            <div
              className={cn(
                "flex-shrink-0 h-6 w-6 rounded border-2 flex items-center justify-center transition-colors",
                isSelected
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-300 bg-white"
              )}
            >
              {isSelected && <Check className="h-4 w-4 text-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
