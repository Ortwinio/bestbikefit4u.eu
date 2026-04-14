import type { DashboardMessages } from "@/i18n/dashboardMessages";
import type { QuestionDefinition } from "./types";

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
  messages: DashboardMessages
): QuestionDefinition {
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
