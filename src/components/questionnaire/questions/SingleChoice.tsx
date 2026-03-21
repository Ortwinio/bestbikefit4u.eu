"use client";

import { useId } from "react";
import { RadioGroup } from "@base-ui/react/radio-group";
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
  name,
  options,
  value,
  onChange,
}: SingleChoiceQuestionProps) {
  const { messages } = useDashboardMessages();
  const legendId = useId();

  return (
    <fieldset className="space-y-3">
      <legend id={legendId} className="sr-only">
        {messages.questionnaire.a11y.singleChoiceLegend}
      </legend>
      <RadioGroup<string>
        aria-labelledby={legendId}
        className="grid gap-3"
        name={name}
        value={value ?? undefined}
        onValueChange={(next) => onChange(next)}
      >
        {options.map((option) => (
          <Selectable
            key={option.value}
            mode="radio"
            value={option.value}
            label={option.label}
            variant="card"
          />
        ))}
      </RadioGroup>
    </fieldset>
  );
}
