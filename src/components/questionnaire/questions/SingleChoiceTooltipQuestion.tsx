"use client";

import { RadioGroup } from "@base-ui/react/radio-group";
import { OptionCard } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface SingleChoiceTooltipQuestionProps {
  name: string;
  options: Option[];
  tooltips?: Record<string, string>;
  value: string | null;
  onChange: (value: string) => void;
}

export function SingleChoiceTooltipQuestion({
  name,
  options,
  tooltips,
  value,
  onChange,
}: SingleChoiceTooltipQuestionProps) {
  const { messages } = useDashboardMessages();
  const selected = options.find((o) => o.value === value) ?? null;
  const tooltip = selected
    ? (tooltips?.[selected.value] ?? selected.description ?? null)
    : null;

  return (
    <div className="space-y-4">
      <RadioGroup<string> name={name} aria-label={messages.questionnaire.a11y.singleChoiceLegend} value={value ?? undefined} onValueChange={onChange} className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <OptionCard
              key={option.value}
              mode="radio"
              value={option.value}
              selected={isSelected}
              label={option.label}
              className="min-h-[88px] min-w-0 rounded-[18px] p-4"
            />
          );
        })}
      </RadioGroup>

      {/* Tooltip panel */}
      {tooltip && selected && (
        <div className="rounded-2xl bg-[var(--bbf-petrol-zacht)] p-4" aria-live="polite">
          <p className="text-sm font-semibold text-foreground">{selected.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {tooltip}
          </p>
        </div>
      )}
    </div>
  );
}
