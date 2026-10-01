/* @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import ProfilePage from "./page";

const state = vi.hoisted(() => ({
  locale: "nl" as "nl" | "en",
  save: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("convex/react", () => ({
  useQuery: () => ({
    _id: "profile", heightCm: 175, inseamCm: 82, torsoLengthCm: 65,
    flexibilityScore: "good", coreStabilityScore: 4, hasPain: "no",
  }),
  useMutation: () => state.save,
}));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => vi.fn() }));
vi.mock("@/components/profile/ProfilePhotoUpload", () => ({ ProfilePhotoUpload: () => null }));
vi.mock("@/components/ui", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/components/ui")>(),
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}));
beforeEach(() => {
  state.locale = "nl";
  state.save.mockReset().mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("direct profile page", () => {
  it.each(["nl", "en"] as const)("shows editable measurements without edit/save controls in %s", (locale) => {
    state.locale = locale;
    const { container } = render(<ProfilePage />);
    expect(screen.queryByRole("button", { name: /Bewerken|^Opslaan$|^Edit$|^Save$/ })).toBeNull();
    expect(screen.getByRole("slider", { name: getDashboardMessages(locale).profile.measurements.height })).toBeTruthy();
    if (locale === "nl") {
      expect(screen.getByText("Extra lichaamsmaten")).toBeTruthy();
      expect(container.textContent).not.toMatch(/Advanced measurements|Very Limited|Plank hold|Can reach/);
    }
    expect(state.save).not.toHaveBeenCalled();
  });
  it.each(["nl", "en"] as const)("keeps the draft and offers a localized retry in %s", async (locale) => {
    vi.useFakeTimers();
    state.locale = locale;
    state.save.mockRejectedValueOnce(new Error("Not authenticated"));
    render(<ProfilePage />);
    const height = screen.getByRole("slider", { name: getDashboardMessages(locale).profile.measurements.height });
    fireEvent.keyDown(height, { key: "ArrowRight" });
    fireEvent.keyUp(height, { key: "ArrowRight" });
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    const retry = screen.getByRole("button", { name: locale === "nl" ? "Opnieuw proberen" : "Try again" });
    expect(height.getAttribute("aria-valuenow")).toBe("176");
    expect(screen.queryByText("Not authenticated")).toBeNull();
    await act(async () => { fireEvent.click(retry); await vi.advanceTimersByTimeAsync(0); });
    expect(screen.getByText(locale === "nl" ? "Opgeslagen" : "Saved")).toBeTruthy();
    expect(state.save).toHaveBeenCalledTimes(2);
    expect(state.save).toHaveBeenLastCalledWith({ heightCm: 176 });
  });
});
