"use client";

import { cn } from "@/utils/cn";
import { Check } from "lucide-react";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface Option {
  value: string;
  label: string;
  followUpQuestionIds?: string[];
}

interface MultipleChoiceQuestionProps {
  name: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultipleChoiceQuestion({
  name,
  options,
  value,
  onChange,
}: MultipleChoiceQuestionProps) {
  const { messages } = useDashboardMessages();

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <fieldset className="space-y-3">
      <legend className="mb-4 text-sm text-gray-500">
        {messages.questionnaire.multiChoice.legend}
      </legend>
      {options.map((option) => {
        const isSelected = value.includes(option.value);

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
              type="checkbox"
              value={option.value}
              checked={isSelected}
              onChange={() => toggleOption(option.value)}
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
          </label>
        );
      })}
    </fieldset>
  );
}
