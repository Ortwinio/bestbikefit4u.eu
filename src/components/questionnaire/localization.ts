import type { DashboardMessages } from "@/i18n/dashboardMessages";
import type { QuestionDefinition } from "./types";
import type { Locale } from "@/i18n/config";
import { fitExperienceDescriptionsNl, legacyFitQuestions } from "@/i18n/account/fitAudit";

function localizeOptions(
  question: QuestionDefinition,
  optionLabels: Record<string, { label: string; description?: string }>
): QuestionDefinition["options"] {
  return question.options?.map((option) => ({
    ...option,
    label: optionLabels[option.value]?.label ?? option.label,
    description: optionLabels[option.value]?.description ?? option.description,
  }));
}

export function getLocalizedQuestion(
  question: QuestionDefinition,
  messages: DashboardMessages,
  locale?: Locale
): QuestionDefinition {
  if (locale === "nl") {
    const legacy = legacyFitQuestions[question.questionId as keyof typeof legacyFitQuestions];
    if (legacy) {
      return {
        ...question,
        questionText: legacy.questionText,
        options: "options" in legacy
          ? localizeOptions(question, Object.fromEntries(Object.entries(legacy.options).map(([value, label]) => [value, { label }])))
          : question.options,
        scaleConfig: "minLabel" in legacy && question.scaleConfig
          ? { ...question.scaleConfig, minLabel: legacy.minLabel, maxLabel: legacy.maxLabel }
          : question.scaleConfig,
      };
    }
    const profileCopy = {
      experience_level: messages.questionnaire.experienceLevel,
      weekly_hours: messages.questionnaire.weeklyHours,
      typical_ride_length: messages.questionnaire.rideDistance,
      has_pain: messages.questionnaire.painDiscomfort,
      pain_areas: messages.questionnaire.painAreas,
    }[question.questionId];
    if (profileCopy) {
      const options = "levels" in profileCopy
        ? Object.fromEntries(Object.entries(profileCopy.levels).map(([value, option]) => [value, {
            label: option.label,
            description: fitExperienceDescriptionsNl[value],
          }]))
        : "areas" in profileCopy
          ? profileCopy.areas
          : profileCopy.options;
      return {
        ...question,
        questionText: profileCopy.questionText,
        helpText: profileCopy.helpText,
        options: localizeOptions(question, options),
      };
    }
  }
  switch (question.questionId) {
    case "current_position_feeling":
      return {
        ...question,
        questionText: messages.questionnaire.currentPositionFeeling.questionText,
        helpText: messages.questionnaire.currentPositionFeeling.helpText,
        options: localizeOptions(
          question,
          messages.questionnaire.currentPositionFeeling.options
        ),
      };
    case "wants_climbing_profile":
      return {
        ...question,
        questionText: messages.questionnaire.climbingProfile.questionText,
        helpText: messages.questionnaire.climbingProfile.helpText,
        options: localizeOptions(
          question,
          messages.questionnaire.climbingProfile.options
        ),
      };
    case "climbing_importance":
      return {
        ...question,
        questionText: messages.questionnaire.climbingImportance.questionText,
        helpText: messages.questionnaire.climbingImportance.helpText,
        options: localizeOptions(
          question,
          messages.questionnaire.climbingImportance.options
        ),
      };
    case "road_riding_type":
      return {
        ...question,
        questionText: messages.questionnaire.roadRidingType.questionText,
        helpText: messages.questionnaire.roadRidingType.helpText,
        options: localizeOptions(
          question,
          messages.questionnaire.roadRidingType.options
        ),
      };
    case "mtb_terrain":
      return {
        ...question,
        questionText: messages.questionnaire.mtbTerrain.questionText,
        helpText: messages.questionnaire.mtbTerrain.helpText,
        options: localizeOptions(question, messages.questionnaire.mtbTerrain.options),
      };
    default:
      return question;
  }
}
