/**
 * Question types for the questionnaire components
 */

export interface QuestionDefinition {
  questionId: string;
  category: string;
  questionText: string;
  helpText?: string;
  responseType: "single_choice" | "multiple_choice" | "numeric" | "text" | "scale";
  options?: Array<{
    value: string;
    label: string;
    followUpQuestionIds?: string[];
  }>;
  numericConfig?: {
    min?: number;
    max?: number;
    unit?: string;
  };
  scaleConfig?: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
  };
  showCondition?: {
    dependsOnQuestionId: string;
    requiredValues: string[];
  };
  baseOrder: number;
  isRequired: boolean;
}

export interface QuestionResponse {
  questionId: string;
  response: string | number | string[];
  answeredAt: number;
}

export type QuestionnaireResponseValue = string | number | string[];
