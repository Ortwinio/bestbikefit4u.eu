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
            : question.questionText;
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
              alt="Type of riding illustration"
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
              alt="Climbing cyclist illustration"
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
              alt="Bike terrain illustration"
              width={1024}
              height={1024}
              className="h-auto max-h-56 w-full object-cover"
              priority
            />
          </div>
        )}

        {question.questionId === "mtb_terrain" && question.options && (
          <SingleChoiceTooltipQuestion
            name={question.questionId}
            options={question.options}
            tooltips={{
              asphalt:
                "Smooth roads allow for an efficient and aerodynamic riding position. We optimize your setup for speed, power transfer, and reduced air resistance.",
              paved:
                "Mixed surfaces require a balance between comfort and efficiency. We slightly increase stability while maintaining a fast, efficient position.",
              xc: "Climbing and light trails require efficient power transfer and control. We balance stability with a position suited for sustained effort.",
              trail:
                "Uneven and technical terrain demands more control and flexibility. We adjust your position to improve handling and stability on descents.",
              enduro:
                "Steep descents and rough terrain require a stable and confident position. We prioritize control and shock absorption over aerodynamics.",
              dh: "High-speed descents and jumps require maximum control and safety. We optimize your setup for stability, impact absorption, and handling.",
            }}
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.questionId === "road_riding_type" && question.options && (
          <SingleChoiceTooltipQuestion
            name={question.questionId}
            options={question.options}
            tooltips={{
              casual:
                "Focused on comfort and enjoyment. We prioritize a more relaxed position with reduced strain on your back, neck, and hands.",
              group:
                "A mix of endurance and pace. We balance comfort and efficiency to support longer rides with moderate intensity.",
              training:
                "Regular training with specific goals. We optimize your position for efficiency and power transfer while maintaining sustainability.",
              racing:
                "High intensity and performance-focused. We create a more aggressive position to improve speed, aerodynamics, and responsiveness.",
              tt: "Maximum aerodynamic efficiency. We position you lower and more forward to minimize air resistance and maximize sustained speed.",
            }}
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.questionId === "wants_climbing_profile" && question.options && (
          <SingleChoiceTooltipQuestion
            name={question.questionId}
            options={question.options}
            tooltips={{
              yes: "We'll calculate a second set of measurements optimised for seated climbing — adjusted saddle height, setback, and handlebar position to improve efficiency on climbs.",
              no: "We'll provide a single all-round fit profile based on your measurements and riding preferences.",
            }}
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.questionId === "climbing_importance" && question.options && (
          <SingleChoiceTooltipQuestion
            name={question.questionId}
            options={question.options}
            tooltips={{
              rarely:
                "On flat terrain, we can optimize your position for aerodynamics and speed with a lower and more stretched setup.",
              occasional:
                "A balanced position helps you stay efficient on flats while remaining comfortable on short climbs.",
              regular:
                "Climbing requires efficient power transfer and comfort in a more upright position. We adjust your setup to reduce strain during sustained efforts.",
              climbing_focused:
                "Long climbs demand an open hip angle and stable posture. We optimize your position for seated climbing efficiency and reduced fatigue.",
            }}
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.responseType === "single_choice" &&
          question.options &&
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
            options={question.options}
            value={value as string | null}
            onChange={onChange}
          />
        )}

        {question.questionId === "current_position_feeling" &&
          question.options && (
          <PositionFeelingSelector
            options={question.options}
            value={(value as string[]) || []}
            onChange={onChange}
          />
        )}

        {question.responseType === "multiple_choice" &&
          question.options &&
          question.questionId !== "pain_areas" &&
          question.questionId !== "current_position_feeling" && (
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
