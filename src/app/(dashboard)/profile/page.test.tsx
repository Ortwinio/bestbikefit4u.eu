/* @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import ProfilePage from "./page";
import { getFunctionName } from "convex/server";
import { getProfileProvenanceCopy } from "@/i18n/account/profileProvenance";

const state = vi.hoisted(() => ({
  locale: "nl" as "nl" | "en",
  save: vi.fn(),
  partial: false,
  recalculate: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("convex/react", () => ({
  useQuery: (reference: Parameters<typeof getFunctionName>[0]) => {
    const profile = state.partial ? { _id: "profile", inseamCm: 83 } : ({
    _id: "profile", heightCm: 175, inseamCm: 82, torsoLengthCm: 65,
    flexibilityScore: "good", coreStabilityScore: 4, hasPain: "no", weightKg: 74,
    });
    const name = getFunctionName(reference);
    if (name.endsWith("getMyProvenance")) return { profile, observations: [] };
    if (name.endsWith("getRecalculableBikeCount")) return 1;
    if (name.endsWith("getCurrentUser")) return { _id: "user", displayName: "Rider" };
    return profile;
  },
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) => getFunctionName(reference).endsWith("recalculatePressureForAllBikes") ? state.recalculate : state.save,
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
  state.partial = false;
  state.save.mockReset().mockResolvedValue(undefined);
  state.recalculate.mockReset().mockResolvedValue({ recalculatedCount: 1 });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("direct profile page", () => {
  it.each(["nl", "en"] as const)("shows imported inseam and opens completion with no invented measurements in %s", (locale) => {
    state.locale = locale;
    state.partial = true;
    const copy = getDashboardMessages(locale);
    render(<ProfilePage />);
    fireEvent.click(screen.getByRole("button", { name: getProfileProvenanceCopy(locale).directEdit }));
    expect(screen.getByRole("slider", { name: copy.profile.measurements.inseam }).getAttribute("aria-valuenow")).toBe("83");
    expect(screen.queryByRole("link", { name: copy.profile.status.startFitCta })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: copy.fit.riderProfileWarning.cta }));
    expect(screen.getByRole("slider", { name: copy.profile.measurements.inseam }).getAttribute("aria-valuenow")).toBe("83");
    expect(screen.getByRole("slider", { name: copy.profile.measurements.height }).getAttribute("aria-valuetext")).not.toMatch(/^0\b/);
    expect(state.save).not.toHaveBeenCalled();
  });
  it.each(["nl", "en"] as const)("shows editable measurements without edit/save controls in %s", (locale) => {
    state.locale = locale;
    const { container } = render(<ProfilePage />);
    fireEvent.click(screen.getByRole("button", { name: getProfileProvenanceCopy(locale).directEdit }));
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
    fireEvent.click(screen.getByRole("button", { name: getProfileProvenanceCopy(locale).directEdit }));
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
  it("keeps the weight refresh and pressure recalculation flow after a provenance save", async () => {
    state.locale = "en";
    state.save.mockResolvedValue({ status: "saved", field: "weightKg" });
    const copy = getDashboardMessages("en");
    render(<ProfilePage />);
    fireEvent.click(screen.getByRole("button", { name: "Change: Weight" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Weight (kg)" }), { target: { value: "75" } });
    fireEvent.click(screen.getByRole("combobox", { name: "How was this value determined?" }));
    const option = await screen.findByRole("option", { name: "I measured this" });
    fireEvent.pointerDown(option, { pointerType: "mouse" });
    fireEvent.click(option);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Save detail" })); });
    expect(screen.getByRole("dialog", { name: copy.profile.refresh.title })).toBeTruthy();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: copy.profile.refresh.pressureButton })); });
    expect(state.recalculate).toHaveBeenCalledWith(expect.objectContaining({ newWeightKg: 75 }));
  });
});
