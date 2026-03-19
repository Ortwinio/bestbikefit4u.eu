"use client";

import { Selectable } from "@/components/ui";
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
          <Selectable
            key={option.value}
            onClick={() => toggleOption(option.value)}
            selected={isSelected}
            label={option.label}
            variant="card"
          />
        );
      })}
    </fieldset>
  );
}
