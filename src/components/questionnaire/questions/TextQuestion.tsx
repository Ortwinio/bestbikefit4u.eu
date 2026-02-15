"use client";

import { useId } from "react";
import { cn } from "@/utils/cn";
import { FieldLabel } from "@/components/ui";

interface TextQuestionProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function TextQuestion({
  value,
  onChange,
  placeholder = "Type your answer here...",
  maxLength = 500,
}: TextQuestionProps) {
  const textareaId = `question-text-${useId().replace(/:/g, "")}`;
  const currentLength = value?.length || 0;

  return (
    <div className="space-y-2">
      <FieldLabel
        label="Your written answer"
        htmlFor={textareaId}
        tooltip="Write a short, specific answer. Include relevant details like bike type, weekly volume, and any discomfort."
      />
      <textarea
        id={textareaId}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        className={cn(
          "w-full px-4 py-3 rounded-lg border-2 text-base transition-colors resize-none",
          "focus:outline-none focus:ring-0",
          "border-gray-200 focus:border-blue-600"
        )}
      />
      <div className="flex justify-end">
        <span className="text-sm text-gray-400">
          {currentLength} / {maxLength}
        </span>
      </div>
    </div>
  );
}
