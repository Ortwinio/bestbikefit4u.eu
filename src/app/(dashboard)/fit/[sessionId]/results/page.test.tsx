// @vitest-environment jsdom
import { getPdfResponseError } from "@/lib/reports/pdfResponseError";
import { Suspense } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { fitResultsSource } from "./fixture.test-support";

const state = vi.hoisted(() => ({
  locale: "en" as "en" | "nl",
  values: {} as Record<string, unknown>,
  enforced: true,
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
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("@/components/feedback/feedback-activity", () => ({ trackFeedbackSignal: vi.fn() }));
vi.mock("../../../../../../shared/pricing/flags", () => ({ isPaidAccessEnforced: () => state.enforced }));
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
const accessKey = "recommendations/queries:getReportAccess";
const copy = getDashboardMessages("en");

async function mount() {
  const params = Promise.resolve({ sessionId: "session_1" });
  await act(async () => { render(<Suspense fallback="suspending"><ResultsPage params={params} /></Suspense>); });
}

beforeEach(() => {
  state.locale = "en";
  vi.clearAllMocks();
  state.enforced = true;
  state.search = new URLSearchParams();
  sessionStorage.clear();
  state.generate.mockResolvedValue(undefined);
  state.send.mockResolvedValue(undefined);
  state.values = {
    [reportKey]: { ...fitResultsSource, session: { ...fitResultsSource.session, status: "completed" } },
    [userKey]: { email: "rider@example.com", tier: "free" },
    [accessKey]: { fullReport: false, canDownloadPdf: true, canEmailReport: true },
  };
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("results route preserved behavior", () => {
  it("honors server enforcement even when the client flag is off", async () => {
    state.enforced = false;
    state.values[accessKey] = { enforced: true, fullReport: false, canDownloadPdf: true, canEmailReport: true };
    await mount();
    expect(screen.queryByText("Your current setup and target")).toBeNull();
    expect(screen.getByRole("button", { name: "Download PDF (core values)" })).toBeTruthy();
  });
  it("does not trust a Pro tier without matching bike access", async () => {
    state.values[userKey] = { email: "rider@example.com", tier: "pro" };
    state.values[accessKey] = { fullReport: false, canDownloadPdf: false, canEmailReport: false };
    await mount();
    expect(screen.queryByText("Your current setup and target")).toBeNull();
    expect(screen.getByRole("link", { name: "Unlock my adjustment plan" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Download PDF (core values)" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: copy.results.actions.emailReport }));
    expect(state.send).not.toHaveBeenCalled();
    expect(state.toast.info).toHaveBeenCalled();
  });
  it("labels preserved full-access reports explicitly", async () => {
    state.values[accessKey] = {
      fullReport: true, canDownloadPdf: true, canEmailReport: true, legacyFullAccess: true,
    };
    await mount();
    expect(screen.getByText(/This report was created with full access/)).toBeTruthy();
    expect(screen.getByText("Your current setup and target")).toBeTruthy();
  });
  it.each(["nl", "en"])("keeps the unavailable %s PDF explanation outside its compact button", async (locale) => {
    state.locale = locale as "nl" | "en";
    state.values[accessKey] = { fullReport: false, canDownloadPdf: false, canEmailReport: false };
    await mount();
    const explanation = document.getElementById("report-pdf-access-note");
    expect(explanation?.textContent).toContain(locale === "nl" ? "laatste rapport" : "latest report");
    const button = document.querySelector('button[aria-describedby="report-pdf-access-note"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).not.toBe(explanation?.textContent);
    expect(button.textContent).toContain("PDF");
  });
  it("localizes Dutch engine notes and missing bike names without changing stored notes", async () => {
    state.locale = "nl";
    state.values[accessKey] = { fullReport: true, canDownloadPdf: true, canEmailReport: true };
    const notes = ["Saddle height of 748mm is optimized for your 850mm inseam.", "Unmapped English note"];
    state.values[reportKey] = { ...fitResultsSource, bike: null, recommendation: { ...fitResultsSource.recommendation, fitNotes: notes } };
    await mount();
    expect(screen.getAllByText("Fiets zonder naam").length).toBeGreaterThan(0);
    expect(screen.getByText("De zadelhoogte van 748 mm is afgestemd op je binnenbeenlengte van 850 mm.")).toBeTruthy();
    expect(screen.getByText("Unmapped English note")).toBeTruthy();
    expect(notes[1]).toBe("Unmapped English note");
  });
  it("localizes Dutch network failures during PDF download", async () => {
    state.locale = "nl";
    state.values[accessKey] = { fullReport: true, canDownloadPdf: true, canEmailReport: true };
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await mount();
    fireEvent.click(screen.getByRole("button", { name: getDashboardMessages("nl").results.actions.downloadPdf }));
    expect(await screen.findByText(getDashboardMessages("nl").results.errors.pdfGenerateFailed)).toBeTruthy();
    expect(screen.queryByText("Failed to fetch")).toBeNull();
  });
  it("shows core-only latest PDF and a checkout link without paid detail", async () => {
    await mount();
    expect(screen.queryByText("Your current setup and target")).toBeNull();
    expect(screen.getByRole("link", { name: "Unlock my adjustment plan" }).getAttribute("href")).toContain("/en/checkout?product=single");
    expect(screen.getByRole("button", { name: "Download PDF (core values)" })).toBeTruthy();
    expect(screen.getByTestId("case-opt-in").textContent).toBe("session_1");
    expect(screen.queryByRole("button", { name: copy.results.actions.downloadPdf })).toBeNull();
    expect(state.generate).not.toHaveBeenCalled();
  });
  it("preserves full free report access while paid enforcement is off", async () => {
    state.enforced = false;
    await mount();
    expect(screen.getByRole("button", { name: copy.results.actions.downloadPdf })).toBeTruthy();
    expect(screen.queryByTestId("fit-pass")).toBeNull();
  });
  it.each(["single", "annual", "legacy"])("uses authoritative %s report access", async () => {
    state.values[accessKey] = { fullReport: true, canDownloadPdf: true, canEmailReport: true };
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
    state.values[accessKey] = { fullReport: true, canDownloadPdf: true, canEmailReport: true };
    await mount();
    fireEvent.click(screen.getByRole("button", { name: copy.results.actions.emailReport }));
    expect((screen.getByLabelText(copy.results.emailDialog.emailLabel) as HTMLInputElement).value).toBe("rider@example.com");
    expect(screen.getByLabelText(copy.results.emailDialog.emailLabel).classList.contains("min-h-11")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: copy.results.emailDialog.sendCta }));
    await waitFor(() => expect(state.send).toHaveBeenCalledWith({ sessionId: "session_1", recipientEmail: "rider@example.com" }));
  });
  it.each([403, 404, 409, 429])("localizes PDF response %s", async (status) => {
    state.values[accessKey] = { fullReport: true, canDownloadPdf: true, canEmailReport: true };
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status, json: async () => ({ error: "pro_required" }) });
    vi.stubGlobal("fetch", fetchMock);
    await mount();
    fireEvent.click(screen.getByRole("button", { name: copy.results.actions.downloadPdf }));
    expect(await screen.findByText(getPdfResponseError(status, "en"))).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith("/api/reports/session_1/pdf?locale=en", { method: "GET" });
  });
  it("downloads a paid PDF with the original filename and cleans up its object URL", async () => {
    state.values[accessKey] = { fullReport: true, canDownloadPdf: true, canEmailReport: true };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(["pdf"]) }));
    const createUrl = vi.fn().mockReturnValue("blob:test-report");
    const revokeUrl = vi.fn();
    URL.createObjectURL = createUrl;
    URL.revokeObjectURL = revokeUrl;
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("bikefitboost-report-session_1-en.pdf");
    });
    await mount();
    fireEvent.click(screen.getByRole("button", { name: copy.results.actions.downloadPdf }));
    await waitFor(() => expect(revokeUrl).toHaveBeenCalledWith("blob:test-report"));
    expect(click).toHaveBeenCalledOnce();
    click.mockRestore();
  });
  it("keeps the email dialog usable after an action error", async () => {
    state.values[accessKey] = { fullReport: true, canDownloadPdf: true, canEmailReport: true };
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
  it("never claims payment success or unlocks from query parameters", async () => {
    state.search = new URLSearchParams("checkout=success&checkout_session_id=cs_test&keep=1");
    await mount();
    expect(sessionStorage.getItem("fitpass_success_shown_session_1")).toBeNull();
    expect(state.toast.success).not.toHaveBeenCalled();
    expect(screen.queryByText("Your current setup and target")).toBeNull();
  });
});
