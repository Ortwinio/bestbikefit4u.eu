"use client";

import type { QuestionDefinition, QuestionnaireResponseValue } from "./types";
import { SingleChoiceQuestion } from "./questions/SingleChoice";
import { MultipleChoiceQuestion } from "./questions/MultipleChoice";
import { ScaleQuestion } from "./questions/ScaleQuestion";
import { NumericQuestion } from "./questions/NumericQuestion";
import { TextQuestion } from "./questions/TextQuestion";
import { HelpCircle } from "lucide-react";

interface QuestionRendererProps {
  question: QuestionDefinition;
  value: QuestionnaireResponseValue | null;
  onChange: (value: QuestionnaireResponseValue | null) => void;
  headingId?: string;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  headingId,
}: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      {/* Question text */}
      <div>
        <h2
          id={headingId}
          tabIndex={-1}
          className="text-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {question.questionText}
          {question.isRequired && <span className="text-red-500 ml-1">*</span>}
        </h2>
        {question.helpText && (
          <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 rounded-lg">
            <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">{question.helpText}</p>
          </div>
        )}
      </div>

      {/* Question input based on type */}
      <div className="mt-6">
        {question.responseType === "single_choice" && question.options && (
          <SingleChoiceQuestion
            name={question.questionId}
            options={question.options}
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.responseType === "multiple_choice" && question.options && (
          <MultipleChoiceQuestion
            name={question.questionId}
            options={question.options}
            value={(value as string[]) || []}
            onChange={onChange}
          />
        )}

        {question.responseType === "scale" && question.scaleConfig && (
          <ScaleQuestion
            config={question.scaleConfig}
            value={value as number | null}
            onChange={onChange}
          />
        )}

        {question.responseType === "numeric" && (
          <NumericQuestion
            config={question.numericConfig}
            value={value as number | null}
            onChange={onChange}
          />
        )}

        {question.responseType === "text" && (
          <TextQuestion
            value={value as string | null}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}
