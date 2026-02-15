import { describe, expect, it } from "vitest";
import { getQuestionById } from "../questions";
import { isValidQuestionResponse } from "../responseValidation";

describe("questionnaire response validation", () => {
  it("accepts valid single-choice responses", () => {
    const question = getQuestionById("experience_level");
    expect(question).toBeDefined();

    expect(isValidQuestionResponse(question!, "beginner")).toBe(true);
    expect(isValidQuestionResponse(question!, "invalid_option")).toBe(false);
  });

  it("accepts valid multiple-choice arrays and rejects invalid values", () => {
    const question = getQuestionById("pain_areas");
    expect(question).toBeDefined();

    expect(
      isValidQuestionResponse(question!, ["knee_front", "lower_back"])
    ).toBe(true);
    expect(isValidQuestionResponse(question!, ["knee_front", "unknown"])).toBe(
      false
    );
  });

  it("enforces scale ranges", () => {
    const question = getQuestionById("pain_severity");
    expect(question).toBeDefined();

    expect(isValidQuestionResponse(question!, 3)).toBe(true);
    expect(isValidQuestionResponse(question!, 7)).toBe(false);
  });

  it("accepts text responses for text questions", () => {
    const question = {
      questionId: "free_text",
      category: "health",
      questionText: "Describe your concerns",
      responseType: "text",
      baseOrder: 999,
      isRequired: false,
    } as const;

    expect(isValidQuestionResponse(question, "Neck tightness after climbs")).toBe(
      true
    );
    expect(isValidQuestionResponse(question, 123)).toBe(false);
  });
});
