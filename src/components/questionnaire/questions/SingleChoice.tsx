"use client";

import { cn } from "@/utils/cn";
import { Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  followUpQuestionIds?: string[];
}

interface SingleChoiceQuestionProps {
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
}

export function SingleChoiceQuestion({
  options,
  value,
  onChange,
}: SingleChoiceQuestionProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
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
            {isSelected && (
              <div className="flex-shrink-0 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
