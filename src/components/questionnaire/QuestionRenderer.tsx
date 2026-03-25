"use client";

import type { QuestionDefinition, QuestionnaireResponseValue } from "./types";
import { SingleChoiceQuestion } from "./questions/SingleChoice";
import { ExperienceLevelSelector } from "./questions/ExperienceLevelSelector";
import { WeeklyHoursSelector } from "./questions/WeeklyHoursSelector";
import { MultipleChoiceQuestion } from "./questions/MultipleChoice";
import { ScaleQuestion } from "./questions/ScaleQuestion";
import { NumericQuestion } from "./questions/NumericQuestion";
import { TextQuestion } from "./questions/TextQuestion";
import { HelpCircle } from "lucide-react";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

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
  const { messages } = useDashboardMessages();
  const isExperienceLevel = question.questionId === "experience_level";
  const isWeeklyHours = question.questionId === "weekly_hours";
  const questionText = isExperienceLevel
    ? messages.questionnaire.experienceLevel.questionText
    : isWeeklyHours
      ? messages.questionnaire.weeklyHours.questionText
      : question.questionText;
  const helpText = isExperienceLevel
    ? messages.questionnaire.experienceLevel.helpText
    : isWeeklyHours
      ? messages.questionnaire.weeklyHours.helpText
      : question.helpText;

  return (
    <div className="space-y-4">
      <div>
        <h2
          id={headingId}
          tabIndex={-1}
          className="text-xl font-semibold text-foreground focus-visible:focus-ring"
        >
          {questionText}
          {question.isRequired && <span className="ml-1 text-destructive">*</span>}
        </h2>
        {helpText && (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-border bg-muted p-3">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">{helpText}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        {question.questionId === "experience_level" && (
          <ExperienceLevelSelector
            value={(value as "beginner" | "intermediate" | "advanced" | null) ?? null}
            onChange={onChange}
          />
        )}

        {question.questionId === "weekly_hours" && (
          <WeeklyHoursSelector
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.responseType === "single_choice" &&
          question.options &&
          question.questionId !== "experience_level" &&
          question.questionId !== "weekly_hours" && (
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
