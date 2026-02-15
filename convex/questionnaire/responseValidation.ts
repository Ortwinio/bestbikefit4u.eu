import { v } from "convex/values";
import type { QuestionDefinition } from "./questions";

export type QuestionResponseValue = string | number | string[];

export const questionResponseValueValidator = v.union(
  v.string(),
  v.number(),
  v.array(v.string())
);

function hasChoiceOption(question: QuestionDefinition, value: string): boolean {
  if (!question.options) {
    return true;
  }
  return question.options.some((option) => option.value === value);
}

export function isValidQuestionResponse(
  question: QuestionDefinition,
  response: QuestionResponseValue
): boolean {
  switch (question.responseType) {
    case "single_choice":
      return typeof response === "string" && hasChoiceOption(question, response);

    case "multiple_choice":
      return (
        Array.isArray(response) &&
        response.every((value) => typeof value === "string") &&
        response.every((value) => hasChoiceOption(question, value))
      );

    case "numeric": {
      if (typeof response !== "number" || Number.isNaN(response)) {
        return false;
      }
      const min = question.numericConfig?.min;
      const max = question.numericConfig?.max;
      if (min !== undefined && response < min) {
        return false;
      }
      if (max !== undefined && response > max) {
        return false;
      }
      return true;
    }

    case "scale":
      return (
        typeof response === "number" &&
        Number.isFinite(response) &&
        question.scaleConfig !== undefined &&
        response >= question.scaleConfig.min &&
        response <= question.scaleConfig.max
      );

    case "text":
      return typeof response === "string";

    default:
      return false;
  }
}
