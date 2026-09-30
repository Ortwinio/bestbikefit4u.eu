/* @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc } from "../../../convex/_generated/dataModel";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import type { Locale } from "@/i18n/config";
import { BikeWithFitHistory } from "./BikeWithFitHistory";

const { removeSession, successToast, errorToast } = vi.hoisted(() => ({
  removeSession: vi.fn(), successToast: vi.fn(), errorToast: vi.fn(),
}));
let locale: Locale = "nl";

vi.mock("convex/react", () => ({ useMutation: () => removeSession }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale, messages: getDashboardMessages(locale) }),
}));
vi.mock("@/components/ui", async () => ({
  ...await vi.importActual<typeof import("@/components/ui")>("@/components/ui"),
  useToast: () => ({ success: successToast, error: errorToast }),
}));
vi.mock("@/components/reports", () => ({
  FitReportActionGroup: ({ sessionId, pagePath }: { sessionId: string; pagePath: string }) => (
    <button data-session={sessionId} data-page={pagePath}>Report actions</button>
  ),
}));

const bike = { _id: "bike-a", name: "Test bike", bikeType: "road" } as Doc<"bikes">;
const session = {
  _id: "session-a", createdAt: Date.UTC(2026, 8, 10), completedAt: Date.UTC(2026, 8, 22),
  ridingStyle: "sportive", status: "completed",
} as Doc<"fitSessions">;
const recommendation = {
  calculatedFit: { saddleHeightMm: 742.5, handlebarDropMm: 55.25 }, confidenceScore: 85.6,
} as Doc<"recommendations">;

beforeEach(() => { locale = "nl"; vi.clearAllMocks(); });
afterEach(cleanup);

describe("bike fit history actions and presentation", () => {
  it.each(["nl", "en"] as const)("preserves locale %s, bike context and report association", (language) => {
    locale = language;
    const { container } = render(<BikeWithFitHistory bike={bike} sessions={[{ session, recommendation }]} />);
    expect(screen.getByRole("link").getAttribute("href")).toBe(`/${locale}/fit?bikeId=bike-a`);
    const report = screen.getByRole("button", { name: "Report actions" });
    expect(report.getAttribute("data-session")).toBe("session-a");
    expect(report.getAttribute("data-page")).toBe(`/${locale}/fit-history`);
    expect(screen.getByText(locale === "nl" ? "742,5" : "742.5")).toBeTruthy();
    expect(screen.getByText(locale === "nl" ? "55,25" : "55.25")).toBeTruthy();
    expect(screen.getByText("86")).toBeTruthy();
    expect(container.querySelector("time")?.dateTime).toBe("2026-09-22T00:00:00.000Z");
    expect(container.querySelectorAll("dl")).toHaveLength(3);
  });

  it.each([
    ["in_progress", "Bezig"], ["questionnaire_complete", "Vragenlijst voltooid"],
    ["processing", "Verwerken"], ["completed", "Voltooid"], ["archived", "Gearchiveerd"],
  ] as const)("labels real %s status without inventing a report", (status, label) => {
    render(<BikeWithFitHistory bike={null} sessions={[{ session: { ...session, status }, recommendation: null }]} />);
    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Geen fiets gekoppeld");
    expect(screen.getByRole("link").getAttribute("href")).toBe("/nl/fit");
    expect(screen.queryByRole("button", { name: "Report actions" })).toBeNull();
    expect(screen.getByText("Nog geen aanbeveling gegenereerd")).toBeTruthy();
  });

  it("keeps deletion confirmation, disables cancellation while pending and deletes the selected session", async () => {
    let complete!: () => void;
    removeSession.mockImplementationOnce(() => new Promise<void>((resolve) => { complete = resolve; }));
    render(<BikeWithFitHistory bike={bike} sessions={[{ session, recommendation }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Fit verwijderen" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Test bike")).toBeTruthy();
    expect(removeSession).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Fit verwijderen" }));
    expect(removeSession).toHaveBeenCalledWith({ sessionId: "session-a" });
    expect(within(dialog).getByRole("button", { name: "Annuleren" })).toHaveProperty("disabled", true);
    await act(async () => complete());
    expect(successToast).toHaveBeenCalledWith({ description: "Bike fitting verwijderd." });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("preserves failure feedback and keeps the dialog available for retry or cancel", async () => {
    removeSession.mockRejectedValueOnce(new Error("Delete failed"));
    render(<BikeWithFitHistory bike={bike} sessions={[{ session, recommendation }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Fit verwijderen" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Fit verwijderen" }));
    await waitFor(() => expect(errorToast).toHaveBeenCalledWith({
      description: "Kon de bike fitting niet verwijderen. Probeer het opnieuw.",
    }));
    expect(successToast).not.toHaveBeenCalled();
    expect(within(dialog).getByRole("button", { name: "Annuleren" })).toHaveProperty("disabled", false);
    fireEvent.click(within(dialog).getByRole("button", { name: "Annuleren" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it.each([[-8, "0"], [109, "100"]] as const)("preserves confidence clamping for %s", (score, expected) => {
    render(<BikeWithFitHistory bike={bike} sessions={[{
      session, recommendation: { ...recommendation, confidenceScore: Number(score) },
    }]} />);
    const metric = screen.getByText("Vertrouwen").closest("dl")!;
    expect(within(metric).getByText(expected)).toBeTruthy();
  });

  it("omits absent measurements and uses creation date when no completion date exists", () => {
    const { container } = render(<BikeWithFitHistory bike={bike} sessions={[{
      session: { ...session, completedAt: undefined },
      recommendation: { ...recommendation, calculatedFit: {} } as Doc<"recommendations">,
    }]} />);
    expect(screen.queryByText("Zadelhoogte")).toBeNull();
    expect(screen.queryByText("Stuurval")).toBeNull();
    expect(container.querySelectorAll("dl")).toHaveLength(1);
    expect(container.querySelector("time")?.dateTime).toBe("2026-09-10T00:00:00.000Z");
  });

  it("cancels without mutating and confirms the selected session among multiple rows", async () => {
    removeSession.mockResolvedValueOnce(undefined);
    render(<BikeWithFitHistory bike={bike} sessions={[
      { session, recommendation },
      { session: { ...session, _id: "session-b" as Doc<"fitSessions">["_id"] }, recommendation: null },
    ]} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Fit verwijderen" })[1]);
    let dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Annuleren" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(removeSession).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "Fit verwijderen" })[1]);
    dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Fit verwijderen" }));
    await waitFor(() => expect(removeSession).toHaveBeenCalledWith({ sessionId: "session-b" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
