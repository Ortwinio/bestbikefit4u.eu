"use client";

import { useId } from "react";
import { CheckboxGroup } from "@base-ui/react/checkbox-group";
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
  const legendId = useId();

  return (
    <fieldset className="space-y-3">
      <legend id={legendId} className="mb-4 text-sm text-gray-500">
        {messages.questionnaire.multiChoice.legend}
      </legend>
      <CheckboxGroup
        aria-labelledby={legendId}
        className="grid gap-3"
        value={value}
        onValueChange={(next) => onChange(next)}
      >
        {options.map((option) => (
          <Selectable
            key={option.value}
            mode="checkbox"
            name={name}
            value={option.value}
            label={option.label}
            variant="card"
          />
        ))}
      </CheckboxGroup>
    </fieldset>
  );
}
