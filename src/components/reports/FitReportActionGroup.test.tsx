// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Id } from "../../../convex/_generated/dataModel";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getPdfResponseError } from "@/lib/reports/pdfResponseError";

const state = vi.hoisted(() => ({ locale: "nl" as "nl" | "en", error: vi.fn() }));
vi.mock("convex/react", () => ({ useQuery: () => ({ tier: "free" }), useAction: () => vi.fn() }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("@/components/ui", async (original) => ({
  ...await original<object>(), useToast: () => ({ error: state.error }),
}));
import { FitReportActionGroup } from "./FitReportActionGroup";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("dashboard PDF actions", () => {
  it.each([403, 404, 409, 429])("shows response %s in the viewer instead of an error iframe", async (status) => {
    state.locale = "nl";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status }));
    render(<FitReportActionGroup sessionId={"session_1" as Id<"fitSessions">} pagePath="/dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: getDashboardMessages("nl").fitHistory.viewReport }));
    expect(await screen.findByText(getPdfResponseError(status, "nl"))).toBeTruthy();
    expect(document.querySelector("iframe")).toBeNull();
  });
  it("views a successful PDF through its checked blob URL", async () => {
    state.locale = "en";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, arrayBuffer: async () => new TextEncoder().encode("%PDF-1.4").buffer,
    }));
    vi.stubGlobal("URL", { createObjectURL: () => "blob:checked-report", revokeObjectURL: vi.fn() });
    render(<FitReportActionGroup sessionId={"session_1" as Id<"fitSessions">} pagePath="/dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: getDashboardMessages("en").fitHistory.viewReport }));
    const frame = await screen.findByTitle(getDashboardMessages("en").results.viewer.iframeTitle);
    expect(frame.getAttribute("src")).toContain("blob:checked-report");
  });
  it("shows the Pro message in the download toast", async () => {
    state.locale = "en";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    render(<FitReportActionGroup sessionId={"session_1" as Id<"fitSessions">} pagePath="/dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: getDashboardMessages("en").results.actions.downloadPdf }));
    await vi.waitFor(() => expect(state.error).toHaveBeenCalledWith({ description: getPdfResponseError(403, "en") }));
  });
});
