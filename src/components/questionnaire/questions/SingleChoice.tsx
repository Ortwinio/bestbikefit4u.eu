"use client";

import { cn } from "@/utils/cn";
import { Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  followUpQuestionIds?: string[];
}

interface SingleChoiceQuestionProps {
  name: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
}

export function SingleChoiceQuestion({
  name,
  options,
  value,
  onChange,
}: SingleChoiceQuestionProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Choose one option</legend>
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <label
            key={option.value}
            htmlFor={`${name}-${option.value}`}
            className={cn(
              "w-full flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 text-left transition-all",
              isSelected
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              className={cn(
                "font-medium",
                isSelected ? "text-blue-900" : "text-gray-700"
              )}
            >
              {option.label}
            </span>
            {isSelected && (
              <div className="flex-shrink-0 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}
