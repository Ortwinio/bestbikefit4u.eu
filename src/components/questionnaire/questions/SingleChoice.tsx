"use client";

import { Selectable } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

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
  name: _name,
  options,
  value,
  onChange,
}: SingleChoiceQuestionProps) {
  const { messages } = useDashboardMessages();

  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">
        {messages.questionnaire.a11y.singleChoiceLegend}
      </legend>
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <Selectable
            key={option.value}
            onClick={() => onChange(option.value)}
            selected={isSelected}
            label={option.label}
            variant="card"
          />
        );
      })}
    </fieldset>
  );
}
