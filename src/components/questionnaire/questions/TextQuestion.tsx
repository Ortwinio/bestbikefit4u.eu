"use client";

import { useId } from "react";
import { Textarea } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface TextQuestionProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function TextQuestion({
  value,
  onChange,
  placeholder,
  maxLength = 500,
}: TextQuestionProps) {
  const { messages } = useDashboardMessages();
  const textareaId = `question-text-${useId().replace(/:/g, "")}`;
  const currentLength = value?.length || 0;
  const resolvedPlaceholder = placeholder ?? messages.questionnaire.text.placeholder;

  return (
    <div className="space-y-2">
      <Textarea
        label={messages.questionnaire.text.label}
        tooltip={messages.questionnaire.text.tooltip}
        id={textareaId}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={resolvedPlaceholder}
        maxLength={maxLength}
        rows={4}
        className="text-base"
      />
      <div className="flex justify-end">
        <span className="text-sm text-[color:var(--muted-foreground)]">
          {currentLength} / {maxLength}
        </span>
      </div>
    </div>
  );
}
