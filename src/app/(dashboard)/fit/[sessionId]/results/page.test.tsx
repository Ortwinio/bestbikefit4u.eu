// @vitest-environment jsdom
import { getPdfResponseError } from "@/lib/reports/pdfResponseError";
import { Suspense } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { fitResultsSource } from "./fixture.test-support";

const state = vi.hoisted(() => ({
  values: {} as Record<string, unknown>,
  campaign: false,
  billingPaused: false,
  generate: vi.fn(),
  send: vi.fn(),
  log: vi.fn(),
  replace: vi.fn(),
  search: new URLSearchParams(),
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));
vi.mock("convex/react", () => ({
  useQuery: (reference: Parameters<typeof getFunctionName>[0]) => state.values[getFunctionName(reference)],
  useMutation: () => state.generate,
  useAction: () => state.send,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: state.replace }),
  useSearchParams: () => state.search,
  usePathname: () => "/en/fit/session_1/results",
}));
vi.mock("@/components/ui", async (original) => ({
  ...await original<object>(),
  useToast: () => state.toast,
}));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => state.log }));
vi.mock("@/components/feedback/feedback-activity", () => ({ trackFeedbackSignal: vi.fn() }));
vi.mock("@/config/commercial", () => ({ isReportAccessOpen: () => state.campaign || state.billingPaused }));
vi.mock("@/lib/telemetry", () => ({ reportClientError: (error: Error) => error.message }));
vi.mock("@/components/features/casestudy/CaseStudyOptIn", () => ({
  CaseStudyOptIn: ({ sessionId }: { sessionId: string }) => <div data-testid="case-opt-in">{sessionId}</div>,
}));
vi.mock("@/components/features/fitpass/FitPassPaywall", () => ({
  FitPassPaywall: ({ sessionId }: { sessionId: string }) => <div data-testid="fit-pass">{sessionId}</div>,
}));

import ResultsPage from "./page";

const reportKey = "recommendations/queries:getReportV2";
const userKey = "users/queries:getCurrentUser";
const accessKey = "fitPass/queries:getSessionAccess";
const copy = getDashboardMessages("en");

async function mount() {
  const params = Promise.resolve({ sessionId: "session_1" });
  await act(async () => { render(<Suspense fallback="suspending"><ResultsPage params={params} /></Suspense>); });
}

beforeEach(() => {
  vi.clearAllMocks();
  state.campaign = false;
  state.billingPaused = false;
  state.search = new URLSearchParams();
  sessionStorage.clear();
  state.generate.mockResolvedValue(undefined);
  state.send.mockResolvedValue(undefined);
  state.values = {
    [reportKey]: { ...fitResultsSource, session: { ...fitResultsSource.session, status: "completed" } },
    [userKey]: { email: "rider@example.com", tier: "free" },
    [accessKey]: { hasAccess: false },
  };
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("results route preserved behavior", () => {
  it("keeps free exports gated and passes the real session to opt-in and fit pass", async () => {
    await mount();
    expect(screen.queryByText("Your current setup and target")).toBeNull();
    expect(screen.getByTestId("fit-pass").textContent).toBe("session_1");
    expect(screen.getByTestId("case-opt-in").textContent).toBe("session_1");
    expect(screen.queryByRole("button", { name: copy.results.actions.downloadPdf })).toBeNull();
    expect(state.generate).not.toHaveBeenCalled();
  });
  it("opens free PDF access without a paywall while billing is paused", async () => {
    state.billingPaused = true;
    await mount();
    expect(screen.getByRole("button", { name: copy.results.actions.downloadPdf })).toBeTruthy();
    expect(screen.queryByTestId("fit-pass")).toBeNull();
  });
  it.each(["session", "pro", "premium", "campaign"])("preserves %s paid access", async (access) => {
    state.values[accessKey] = { hasAccess: access === "session" };
    state.values[userKey] = { email: "rider@example.com", tier: access };
    state.campaign = access === "campaign";
    await mount();
    expect(screen.getByRole("button", { name: copy.results.actions.downloadPdf })).toBeTruthy();
    expect(Boolean(screen.queryByTestId("fit-pass"))).toBe(false);
  });
  it("switches the diagram to actual climbing values without mutating the source", async () => {
    const source = {
      ...fitResultsSource,
      recommendation: { ...fitResultsSource.recommendation, climbingCalculatedFit: { ...fitResultsSource.recommendation.calculatedFit, saddleHeightMm: 752, handlebarDropMm: 50 } },
    };
    state.values[reportKey] = source;
    await mount();
    expect(screen.getByRole("img", { name: /Schematic bicycle/ }).textContent).toContain("748 mm");
    fireEvent.click(screen.getByRole("button", { name: copy.results.climbingProfileTab }));
    expect(screen.getByRole("img", { name: /Schematic bicycle/ }).textContent).toContain("752 mm");
    expect(source.recommendation.calculatedFit.saddleHeightMm).toBe(748);
    fireEvent.click(screen.getByRole("button", { name: copy.results.mainProfileTab }));
    expect(screen.getByRole("img", { name: /Schematic bicycle/ }).textContent).toContain("748 mm");
  });
  it.each(["questionnaire_complete", "processing"])("generates once for %s", async (status) => {
    state.values[reportKey] = { ...fitResultsSource, session: { ...fitResultsSource.session, status }, recommendation: null };
    await mount();
    await waitFor(() => expect(state.generate).toHaveBeenCalledExactlyOnceWith({ sessionId: "session_1" }));
  });
  it("allows retry after generation failure", async () => {
    state.generate.mockRejectedValueOnce(new Error("Generation unavailable"));
    state.values[reportKey] = { ...fitResultsSource, session: { ...fitResultsSource.session, status: "processing" }, recommendation: null };
    await mount();
    fireEvent.click(await screen.findByRole("button", { name: copy.results.processing.retryCta }));
    await waitFor(() => expect(state.generate).toHaveBeenCalledTimes(2));
  });
  it("keeps incomplete sessions on the questionnaire route", async () => {
    state.values[reportKey] = { ...fitResultsSource, session: { ...fitResultsSource.session, status: "in_progress" }, recommendation: null };
    await mount();
    expect(screen.getByRole("link", { name: copy.results.questionnaireIncomplete.cta }).getAttribute("href")).toBe("/en/fit/session_1/questionnaire");
    expect(state.generate).not.toHaveBeenCalled();
  });
  it("sends the paid report to the prefilled email using the unchanged action payload", async () => {
    state.values[accessKey] = { hasAccess: true };
    await mount();
    fireEvent.click(screen.getByRole("button", { name: copy.results.actions.emailReport }));
    expect((screen.getByLabelText(copy.results.emailDialog.emailLabel) as HTMLInputElement).value).toBe("rider@example.com");
    expect(screen.getByLabelText(copy.results.emailDialog.emailLabel).classList.contains("min-h-11")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: copy.results.emailDialog.sendCta }));
    await waitFor(() => expect(state.send).toHaveBeenCalledWith({ sessionId: "session_1", recipientEmail: "rider@example.com" }));
  });
  it.each([403, 404, 409, 429])("localizes PDF response %s", async (status) => {
    state.values[accessKey] = { hasAccess: true };
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status, json: async () => ({ error: "pro_required" }) });
    vi.stubGlobal("fetch", fetchMock);
    await mount();
    fireEvent.click(screen.getByRole("button", { name: copy.results.actions.downloadPdf }));
    expect(await screen.findByText(getPdfResponseError(status, "en"))).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith("/api/reports/session_1/pdf?locale=en", { method: "GET" });
  });
  it("downloads a paid PDF with the original filename and cleans up its object URL", async () => {
    state.values[accessKey] = { hasAccess: true };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(["pdf"]) }));
    const createUrl = vi.fn().mockReturnValue("blob:test-report");
    const revokeUrl = vi.fn();
    URL.createObjectURL = createUrl;
    URL.revokeObjectURL = revokeUrl;
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("bestbikefit4u-report-session_1-en.pdf");
    });
    await mount();
    fireEvent.click(screen.getByRole("button", { name: copy.results.actions.downloadPdf }));
    await waitFor(() => expect(revokeUrl).toHaveBeenCalledWith("blob:test-report"));
    expect(click).toHaveBeenCalledOnce();
    click.mockRestore();
  });
  it("keeps the email dialog usable after an action error", async () => {
    state.values[accessKey] = { hasAccess: true };
    state.send.mockRejectedValueOnce(new Error("Email unavailable"));
    await mount();
    fireEvent.click(screen.getByRole("button", { name: copy.results.actions.emailReport }));
    fireEvent.click(screen.getByRole("button", { name: copy.results.emailDialog.sendCta }));
    expect(await screen.findByText("Email unavailable")).toBeTruthy();
    expect(screen.getByRole("button", { name: copy.results.emailDialog.sendCta }).hasAttribute("disabled")).toBe(false);
  });
  it("preserves loading and missing-session states", async () => {
    state.values[reportKey] = undefined;
    await mount();
    expect(screen.getByText(copy.results.loading)).toBeTruthy();
    cleanup();
    state.values[reportKey] = null;
    await mount();
    expect(screen.getByText(copy.results.sessionNotFound.title)).toBeTruthy();
    expect(screen.getByRole("link", { name: copy.results.sessionNotFound.cta }).getAttribute("href")).toBe("/en/dashboard");
  });
  it("acknowledges checkout once and removes only checkout parameters", async () => {
    state.search = new URLSearchParams("checkout=success&checkout_session_id=cs_test&keep=1");
    await mount();
    expect(sessionStorage.getItem("fitpass_success_shown_session_1")).toBe("1");
    expect(state.replace).toHaveBeenCalledWith("/?keep=1");
    expect(state.toast.success).toHaveBeenCalledTimes(1);
  });
});
