/* @vitest-environment jsdom */
import { Suspense, type ComponentProps } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { getAllQuestions } from "../../../../../../convex/questionnaire/questions";
import type { QuestionnaireContainer } from "@/components/questionnaire";
import type { Locale } from "@/i18n/config";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getFitQuestionnaireCopy } from "@/i18n/account/fitQuestionnaire";
import QuestionnairePage from "./page";

let locale: Locale = "en";
let session: { status: string } | null | undefined;
let responses: { questionId: string; response: unknown }[];
let containerProps: ComponentProps<typeof QuestionnaireContainer>;
const save = vi.fn();
const complete = vi.fn();
const push = vi.fn();
const log = vi.fn();
const queryCalls = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale, messages: getDashboardMessages(locale) }) }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => log }));
vi.mock("convex/react", () => ({
  useQuery: (query: Parameters<typeof getFunctionName>[0], args: unknown) => {
    const name = getFunctionName(query);
    queryCalls(name, args);
    if (name === "sessions/queries:getById") return session;
    if (name === "questionnaire/queries:getQuestions") return getAllQuestions();
    if (name === "questionnaire/queries:getResponses") return responses;
    throw new Error(`Unexpected query: ${name}`);
  },
  useMutation: (mutation: Parameters<typeof getFunctionName>[0]) => {
    const name = getFunctionName(mutation);
    if (name === "questionnaire/mutations:saveResponse") return save;
    if (name === "questionnaire/mutations:completeQuestionnaire") return complete;
    throw new Error(`Unexpected mutation: ${name}`);
  },
}));
vi.mock("@/components/questionnaire", () => ({
  QuestionnaireContainer: (props: ComponentProps<typeof QuestionnaireContainer>) => {
    containerProps = props;
    return <div data-testid="questionnaire" />;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  locale = "en";
  session = { status: "in_progress" };
  responses = [{ questionId: "current_position_feeling", response: ["too_low"] }];
  save.mockResolvedValue(undefined);
  complete.mockResolvedValue(undefined);
});
afterEach(cleanup);

async function renderPage() {
  const params = Promise.resolve({ sessionId: "session-fixture" });
  await act(async () => { render(<Suspense><QuestionnairePage params={params} /></Suspense>); });
}

describe("questionnaire route preservation", () => {
  it.each(["nl", "en"] as const)("preserves query arguments, stored values and results navigation in %s", async (language) => {
    locale = language;
    await renderPage();
    expect(screen.getByRole("heading", { name: getFitQuestionnaireCopy(locale).title })).toBeTruthy();
    expect(queryCalls).toHaveBeenCalledWith("sessions/queries:getById", { sessionId: "session-fixture" });
    expect(queryCalls).toHaveBeenCalledWith("questionnaire/queries:getResponses", { sessionId: "session-fixture" });
    expect(containerProps.questions).toEqual(getAllQuestions());
    expect(containerProps.responses).toEqual({ current_position_feeling: ["too_low"] });
    await containerProps.onSaveResponse("wants_climbing_profile", "yes");
    expect(save).toHaveBeenCalledWith({ sessionId: "session-fixture", questionId: "wants_climbing_profile", response: "yes" });
    await containerProps.onComplete();
    expect(complete).toHaveBeenCalledWith({ sessionId: "session-fixture" });
    expect(push).toHaveBeenCalledWith(`/${locale}/fit/session-fixture/results`);
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ eventType: "funnel_questionnaire_complete", locale, pagePath: `/${locale}/fit/session-fixture/questionnaire` }));
  });

  it("propagates mutation errors without navigating to results", async () => {
    const error = new Error("Completion failed");
    complete.mockRejectedValue(error);
    await renderPage();
    await expect(containerProps.onComplete()).rejects.toBe(error);
    expect(push).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ eventType: "questionnaire_complete_error" }));
  });

  it("keeps loading and missing-session states", async () => {
    session = undefined;
    await renderPage();
    expect(screen.getByText(getDashboardMessages(locale).questionnaire.loading)).toBeTruthy();
    expect(screen.queryByTestId("questionnaire")).toBeNull();
    cleanup();
    session = null;
    await renderPage();
    expect(screen.getByText(getDashboardMessages(locale).questionnaire.sessionNotFound.title)).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/en/fit");
  });
});
