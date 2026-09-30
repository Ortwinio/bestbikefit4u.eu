/* @vitest-environment jsdom */
import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAllQuestions } from "../../../convex/questionnaire/questions";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getFitQuestionnaireCopy } from "@/i18n/account/fitQuestionnaire";
import type { Locale } from "@/i18n/config";
import type { QuestionDefinition, QuestionnaireResponseValue } from "./types";
import { QuestionnaireContainer } from "./QuestionnaireContainer";

let locale: Locale = "en";
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale, messages: getDashboardMessages(locale) }),
}));
vi.mock("@/lib/telemetry", () => ({
  getErrorMessage: (error: Error) => error.message,
  reportClientError: (error: Error) => error.message,
}));

beforeEach(() => {
  locale = "en";
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

function Harness({ initialResponses = {}, questions = getAllQuestions(), save = async () => {}, complete = async () => {} }: {
  initialResponses?: Record<string, QuestionnaireResponseValue>;
  questions?: QuestionDefinition[];
  save?: (questionId: string, response: QuestionnaireResponseValue) => Promise<void>;
  complete?: () => Promise<void>;
}) {
  const [responses, setResponses] = useState(initialResponses);
  return <QuestionnaireContainer questions={questions} responses={responses} onSaveResponse={async (questionId, response) => {
    await save(questionId, response);
    setResponses((current) => ({ ...current, [questionId]: response }));
  }} onComplete={complete} />;
}

function action(kind: "next" | "previous" | "skip" | "complete") {
  return screen.getByRole("button", { name: getDashboardMessages(locale).questionnaire.actions[kind] });
}

describe("fit questionnaire presentation and behavior", () => {
  it.each(["nl", "en"] as const)("shows the %s intro and localized routes without example data", (language) => {
    locale = language;
    const copy = getFitQuestionnaireCopy(locale);
    render(<Harness />);
    expect(screen.getByRole("heading", { name: copy.introTitle })).toBeTruthy();
    expect(screen.getByRole("link", { name: copy.method }).getAttribute("href")).toBe(`/${locale}/fit/how-it-works`);
    expect(screen.queryByText(/Sanne|Voorbeeldgegevens|Ontwerpstaat/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: copy.introStart }));
    expect(screen.getByRole("heading", { name: getDashboardMessages(locale).questionnaire.currentPositionFeeling.questionText })).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
    expect(screen.getByRole("link", { name: copy.profile }).getAttribute("href")).toBe(`/${locale}/profile`);
    expect(within(screen.getByRole("complementary")).getAllByRole("listitem")).toHaveLength(4);
  });

  it("preserves multi-select and mutually exclusive stored keys", async () => {
    const save = vi.fn(async () => {});
    render(<Harness initialResponses={{ current_position_feeling: ["good"] }} save={save} />);
    const options = getDashboardMessages(locale).questionnaire.currentPositionFeeling.options;
    fireEvent.click(screen.getByRole("button", { name: options.too_stretched.label }));
    fireEvent.click(screen.getByRole("button", { name: options.saddle_too_low.label }));
    fireEvent.click(screen.getByRole("button", { name: options.no_bike.label }));
    expect(screen.getByRole("button", { name: options.too_stretched.label }).getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(action("next"));
    await waitFor(() => expect(save).toHaveBeenCalledWith("current_position_feeling", ["no_bike"]));
    expect(await screen.findByRole("heading", { name: getDashboardMessages(locale).questionnaire.roadRidingType.questionText })).toBeTruthy();
    fireEvent.click(action("previous"));
    expect(screen.getByRole("button", { name: options.no_bike.label }).getAttribute("aria-pressed")).toBe("true");
  });

  it.each(["yes", "no"] as const)("keeps backend order and the climbing %s branch", async (choice) => {
    const save = vi.fn(async () => {});
    const complete = vi.fn(async () => {});
    render(<Harness initialResponses={{ current_position_feeling: ["too_stretched"] }} save={save} complete={complete} />);
    fireEvent.click(action("skip"));
    expect(screen.getByRole("heading", { name: getDashboardMessages(locale).questionnaire.roadRidingType.questionText })).toBeTruthy();
    fireEvent.click(action("skip"));
    expect(screen.getByRole("heading", { name: getDashboardMessages(locale).questionnaire.mtbTerrain.questionText })).toBeTruthy();
    fireEvent.click(action("skip"));
    fireEvent.click(screen.getByRole("radio", { name: getDashboardMessages(locale).questionnaire.climbingProfile.options[choice].label }));
    fireEvent.click(action("complete"));
    await waitFor(() => expect(save).toHaveBeenCalledWith("wants_climbing_profile", choice));
    if (choice === "yes") {
      expect(await screen.findByRole("heading", { name: getDashboardMessages(locale).questionnaire.climbingImportance.questionText })).toBeTruthy();
      expect(complete).not.toHaveBeenCalled();
      expect(within(screen.getByRole("complementary")).getAllByRole("listitem")).toHaveLength(5);
      fireEvent.click(screen.getByRole("radio", { name: getDashboardMessages(locale).questionnaire.climbingImportance.options.regular.label }));
      fireEvent.click(action("complete"));
      await waitFor(() => expect(save).toHaveBeenLastCalledWith("climbing_importance", "regular"));
    }
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(1));
    expect(save).not.toHaveBeenCalledWith("road_riding_type", expect.anything());
  });

  it("retains the selection and current question on save failure and allows retry", async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error("Save failed")).mockResolvedValue(undefined);
    render(<Harness initialResponses={{ current_position_feeling: ["too_low"] }} save={save} />);
    fireEvent.click(action("next"));
    expect(await screen.findByText("Save failed")).toBeTruthy();
    expect(screen.getByRole("button", { name: getDashboardMessages(locale).questionnaire.currentPositionFeeling.options.too_low.label }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(action("next"));
    expect(await screen.findByRole("heading", { name: getDashboardMessages(locale).questionnaire.roadRidingType.questionText })).toBeTruthy();
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("keeps required validation and server missing-answer navigation", async () => {
    const questions = getAllQuestions().slice(0, 2).map((question) => ({ ...question, isRequired: true }));
    const complete = vi.fn().mockRejectedValue(new Error("Missing required responses: current_position_feeling"));
    render(<Harness questions={questions} initialResponses={{ current_position_feeling: ["good"] }} complete={complete} />);
    fireEvent.click(action("next"));
    await screen.findByRole("heading", { name: /What type of road riding/ });
    expect(action("complete").hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: getDashboardMessages(locale).questionnaire.roadRidingType.options.group.label }));
    fireEvent.click(action("complete"));
    await waitFor(() => expect(document.activeElement?.id).toBe("question-heading-current_position_feeling"));
    expect(screen.getAllByText(getDashboardMessages(locale).questionnaire.missingRequired.header).length).toBeGreaterThan(0);
  });

  it("renders the actual empty and loading states", () => {
    const props = { questions: [], responses: {}, onSaveResponse: vi.fn(), onComplete: vi.fn() };
    const { rerender } = render(<QuestionnaireContainer {...props} />);
    expect(screen.getByText(getDashboardMessages(locale).questionnaire.emptyTitle)).toBeTruthy();
    rerender(<QuestionnaireContainer {...props} isLoading />);
    expect(screen.getByText(getDashboardMessages(locale).questionnaire.loading)).toBeTruthy();
  });
});
