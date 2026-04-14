"use client";

import type { QuestionDefinition, QuestionnaireResponseValue } from "./types";
import { SingleChoiceQuestion } from "./questions/SingleChoice";
import { ExperienceLevelSelector } from "./questions/ExperienceLevelSelector";
import { WeeklyHoursSelector } from "./questions/WeeklyHoursSelector";
import { RideDistanceSelector } from "./questions/RideDistanceSelector";
import { PainDiscomfortSelector } from "./questions/PainDiscomfortSelector";
import { PainAreasSelector } from "./questions/PainAreasSelector";
import { MultipleChoiceQuestion } from "./questions/MultipleChoice";
import { SingleChoiceTooltipQuestion } from "./questions/SingleChoiceTooltipQuestion";
import { PositionFeelingSelector } from "./questions/PositionFeelingSelector";
import { ScaleQuestion } from "./questions/ScaleQuestion";
import { NumericQuestion } from "./questions/NumericQuestion";
import { TextQuestion } from "./questions/TextQuestion";
import Image from "next/image";
import { HelpCircle } from "lucide-react";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getLocalizedQuestion } from "./localization";

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
  const localizedQuestion = getLocalizedQuestion(question, messages);
  const isExperienceLevel = question.questionId === "experience_level";
  const isWeeklyHours = question.questionId === "weekly_hours";
  const isRideDistance = question.questionId === "typical_ride_length";
  const isPainDiscomfort = question.questionId === "has_pain";
  const isPainAreas = question.questionId === "pain_areas";
  const questionText = isExperienceLevel
    ? messages.questionnaire.experienceLevel.questionText
    : isWeeklyHours
      ? messages.questionnaire.weeklyHours.questionText
      : isRideDistance
        ? messages.questionnaire.rideDistance.questionText
        : isPainDiscomfort
          ? messages.questionnaire.painDiscomfort.questionText
          : isPainAreas
            ? messages.questionnaire.painAreas.questionText
            : localizedQuestion.questionText;
  const helpText = isExperienceLevel
    ? messages.questionnaire.experienceLevel.helpText
    : isWeeklyHours
      ? messages.questionnaire.weeklyHours.helpText
      : isRideDistance
        ? messages.questionnaire.rideDistance.helpText
        : isPainDiscomfort
          ? messages.questionnaire.painDiscomfort.helpText
          : isPainAreas
            ? messages.questionnaire.painAreas.helpText
            : localizedQuestion.helpText;

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

        {question.questionId === "typical_ride_length" && (
          <RideDistanceSelector
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.questionId === "has_pain" && (
          <PainDiscomfortSelector
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.questionId === "pain_areas" && (
          <PainAreasSelector
            value={(value as string[]) || []}
            onChange={onChange}
          />
        )}

        {question.questionId === "position_priority" && (
          <div className="mb-4 overflow-hidden rounded-[var(--radius-lg)] border border-border">
            <Image
              src="/riding-position.png"
              alt="Riding position illustration"
              width={1024}
              height={1024}
              className="h-auto max-h-56 w-full object-cover"
              priority
            />
          </div>
        )}

        {question.questionId === "road_riding_type" && (
          <div className="mb-4 overflow-hidden rounded-[var(--radius-lg)] border border-border">
            <Image
              src="/type-of-riding.png"
              alt={messages.questionnaire.roadRidingType.imageAlt}
              width={1024}
              height={1024}
              className="h-auto max-h-56 w-full object-cover"
              priority
            />
          </div>
        )}

        {question.questionId === "wants_climbing_profile" && (
          <div className="mb-4 overflow-hidden rounded-[var(--radius-lg)] border border-border">
            <Image
              src="/climbing-cyclist.png"
              alt={messages.questionnaire.climbingProfile.imageAlt}
              width={1024}
              height={1024}
              className="h-auto max-h-56 w-full object-cover"
              priority
            />
          </div>
        )}

        {question.questionId === "mtb_terrain" && (
          <div className="mb-4 overflow-hidden rounded-[var(--radius-lg)] border border-border">
            <Image
              src="/bike-terrain.png"
              alt={messages.questionnaire.mtbTerrain.imageAlt}
              width={1024}
              height={1024}
              className="h-auto max-h-56 w-full object-cover"
              priority
            />
          </div>
        )}

        {question.questionId === "mtb_terrain" && localizedQuestion.options && (
          <SingleChoiceTooltipQuestion
            name={question.questionId}
            options={localizedQuestion.options}
            tooltips={{
              asphalt: messages.questionnaire.mtbTerrain.options.asphalt.tooltip,
              paved: messages.questionnaire.mtbTerrain.options.paved.tooltip,
              xc: messages.questionnaire.mtbTerrain.options.xc.tooltip,
              trail: messages.questionnaire.mtbTerrain.options.trail.tooltip,
              enduro: messages.questionnaire.mtbTerrain.options.enduro.tooltip,
              dh: messages.questionnaire.mtbTerrain.options.dh.tooltip,
            }}
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.questionId === "road_riding_type" && localizedQuestion.options && (
          <SingleChoiceTooltipQuestion
            name={question.questionId}
            options={localizedQuestion.options}
            tooltips={{
              casual: messages.questionnaire.roadRidingType.options.casual.tooltip,
              group: messages.questionnaire.roadRidingType.options.group.tooltip,
              training:
                messages.questionnaire.roadRidingType.options.training.tooltip,
              racing:
                messages.questionnaire.roadRidingType.options.racing.tooltip,
              tt: messages.questionnaire.roadRidingType.options.tt.tooltip,
            }}
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.questionId === "wants_climbing_profile" &&
          localizedQuestion.options && (
          <SingleChoiceTooltipQuestion
            name={question.questionId}
            options={localizedQuestion.options}
            tooltips={{
              yes: messages.questionnaire.climbingProfile.options.yes.tooltip,
              no: messages.questionnaire.climbingProfile.options.no.tooltip,
            }}
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.questionId === "climbing_importance" &&
          localizedQuestion.options && (
          <SingleChoiceTooltipQuestion
            name={question.questionId}
            options={localizedQuestion.options}
            tooltips={{
              rarely:
                messages.questionnaire.climbingImportance.options.rarely.tooltip,
              occasional:
                messages.questionnaire.climbingImportance.options.occasional
                  .tooltip,
              regular:
                messages.questionnaire.climbingImportance.options.regular.tooltip,
              climbing_focused:
                messages.questionnaire.climbingImportance.options
                  .climbing_focused.tooltip,
            }}
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.responseType === "single_choice" &&
          localizedQuestion.options &&
          question.questionId !== "experience_level" &&
          question.questionId !== "weekly_hours" &&
          question.questionId !== "typical_ride_length" &&
          question.questionId !== "has_pain" &&
          question.questionId !== "road_riding_type" &&
          question.questionId !== "mtb_terrain" &&
          question.questionId !== "climbing_importance" &&
          question.questionId !== "wants_climbing_profile" && (
          <SingleChoiceQuestion
            name={question.questionId}
            options={localizedQuestion.options}
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.questionId === "current_position_feeling" &&
          localizedQuestion.options && (
          <PositionFeelingSelector
            options={localizedQuestion.options}
            copy={messages.questionnaire.currentPositionFeeling}
            value={(value as string[]) || []}
            onChange={onChange}
          />
        )}

        {question.responseType === "multiple_choice" &&
          localizedQuestion.options &&
          question.questionId !== "pain_areas" &&
          question.questionId !== "current_position_feeling" && (
          <MultipleChoiceQuestion
            name={question.questionId}
            options={localizedQuestion.options}
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
