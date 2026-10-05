/* @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "@/i18n/config";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getFitStartCopy } from "@/i18n/account/fitStart";
import { accountBikeFitCopy } from "@/i18n/account/bikeFitCalculator";

const state = vi.hoisted(() => ({
  locale: "en" as Locale,
  search: new URLSearchParams(),
  values: {} as Record<string, unknown>,
  query: vi.fn(),
  create: vi.fn(),
  push: vi.fn(),
  log: vi.fn(),
  success: vi.fn(),
  reportError: vi.fn(() => "Could not start. Please retry."),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: state.push }),
  useSearchParams: () => state.search,
}));
vi.mock("convex/react", () => ({ useQuery: state.query, useMutation: () => state.create }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("@/components/ui", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/components/ui")>(),
  useToast: () => ({ success: state.success }),
}));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => state.log }));
vi.mock("@/hooks/useResolvedImageUrl", () => ({ useResolvedImageUrl: (source?: string) => source }));
vi.mock("@/lib/telemetry", () => ({ reportClientError: state.reportError }));
import NewFitSessionPage from "./page";

const completeProfile = {
  heightCm: 180, inseamCm: 84, flexibilityScore: "average", coreStabilityScore: 3,
  experienceLevel: "intermediate", weeklyHours: "3-6", typicalRideLength: "medium",
  hasPain: "no", positionPriority: "balanced", painAreas: [],
};
const roadBike = { _id: "road-bike", name: "My road bike", bikeType: "road", ridingStyle: "touring", primaryGoal: "comfort", photoUrl: "/real-bike-photo.webp" };
const gravelBike = { _id: "gravel-bike", name: "My gravel bike", bikeType: "gravel", ridingStyle: "sportive", primaryGoal: "balanced" };

function startButton() {
  return screen.getByRole("button", { name: getFitStartCopy(state.locale).continue }) as HTMLButtonElement;
}

beforeEach(() => {
  vi.clearAllMocks();
  state.locale = "en";
  state.search = new URLSearchParams();
  state.values = {
    "profiles/queries:getMyProfile": completeProfile,
    "bikes/queries:listByUser": [roadBike, gravelBike],
  };
  state.query.mockImplementation((reference) => state.values[getFunctionName(reference)]);
  state.create.mockReset().mockResolvedValue("created-session");
});
afterEach(cleanup);

describe("fit start presentation and preserved session flow", () => {
  it.each(["nl", "en"] as const)("carries saved calculator inputs into the new %s session only", async (locale) => {
    state.locale = locale;
    state.search = new URLSearchParams("calculator=bike-fit");
    state.values["calculatorStates/queries:get"] = { _id: "calculator1", state: {
      calculator: "bike-fit", values: { heightCm: 186, inseamCm: 88.5, source: "measured",
        flexibility: 4, core: 5, category: "road", ambition: "performance" },
    } };
    render(<NewFitSessionPage />);
    expect(screen.getByRole("heading", { name: accountBikeFitCopy[locale].sessionTitle })).toBeTruthy();
    expect(screen.getByText("186 cm")).toBeTruthy();
    expect(screen.getByText(locale === "nl" ? "88,5 cm" : "88.5 cm")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: roadBike.name }));
    fireEvent.click(startButton());
    await waitFor(() => expect(state.create).toHaveBeenCalledWith({ bikeType: "road", bikeId: "road-bike",
      ridingStyle: "touring", primaryGoal: "performance", calculatorStateId: "calculator1", calculatorTrial: false }));
    expect(state.values["profiles/queries:getMyProfile"]).toBe(completeProfile);
  });
  it("passes an explicit trial and loads only the owned bike's calculator state", async () => {
    state.search = new URLSearchParams("calculator=bike-fit&bikeId=road-bike&trial=1");
    state.values["calculatorStates/queries:get"] = { _id: "calculator1", state: {
      calculator: "bike-fit", values: { heightCm: 186, inseamCm: 88.5, source: "estimated",
        flexibility: 4, core: 5, category: "road", ambition: "performance" },
    } };
    render(<NewFitSessionPage />);
    expect(screen.getByText("Trial calculation · not saved to profile or bike")).toBeTruthy();
    expect(state.query.mock.calls.some(([reference, args]) =>
      getFunctionName(reference) === "calculatorStates/queries:get"
      && args?.bikeId === "road-bike")).toBe(true);
    fireEvent.click(startButton());
    await waitFor(() => expect(state.create).toHaveBeenCalledWith(expect.objectContaining({
      calculatorTrial: true, calculatorStateId: "calculator1", bikeId: "road-bike",
    })));
    expect(state.values["profiles/queries:getMyProfile"]).toBe(completeProfile);
  });
  it("does not silently start a normal profile fit when the calculator handoff is missing", () => {
    state.search = new URLSearchParams("calculator=bike-fit");
    state.values["calculatorStates/queries:get"] = null;
    render(<NewFitSessionPage />);
    fireEvent.click(screen.getByRole("button", { name: roadBike.name }));
    expect(startButton().disabled).toBe(true);
    expect(screen.getAllByText(accountBikeFitCopy.en.missing).length).toBeGreaterThan(0);
    expect(state.create).not.toHaveBeenCalled();
  });
  it("blocks a selected bike whose category differs from the calculator", () => {
    state.search = new URLSearchParams("calculator=bike-fit");
    state.values["calculatorStates/queries:get"] = { _id: "calculator1", state: {
      calculator: "bike-fit", values: { heightCm: 186, inseamCm: 88, source: "measured",
        flexibility: 4, core: 5, category: "gravel", ambition: "performance" },
    } };
    render(<NewFitSessionPage />);
    fireEvent.click(screen.getByRole("button", { name: roadBike.name }));
    expect(startButton().disabled).toBe(true);
    expect(screen.getAllByText(accountBikeFitCopy.en.mismatch).length).toBeGreaterThan(0);
    expect(state.create).not.toHaveBeenCalled();
  });
  it.each(["nl", "en"] as const)("renders the approved %s structure without review or example UI", (locale) => {
    state.locale = locale;
    render(<NewFitSessionPage />);
    const copy = getFitStartCopy(locale);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(copy.title);
    expect(screen.getByRole("region", { name: copy.selectionTitle })).toBeTruthy();
    expect(screen.getByRole("link", { name: copy.back }).getAttribute("href")).toBe(`/${locale}/dashboard`);
    expect(screen.getByRole("link", { name: copy.method }).getAttribute("href")).toBe(`/${locale}/fit/how-it-works`);
    expect(startButton().disabled).toBe(true);
    expect(document.body.textContent).not.toMatch(/Voorbeeldgegevens|Ontwerpstaat|Canyon Endurace|Sanne/);
  });

  it("retains profile loading without showing an empty garage", () => {
    state.values["profiles/queries:getMyProfile"] = undefined;
    render(<NewFitSessionPage />);
    expect(screen.getByText(getDashboardMessages("en").fit.loading)).toBeTruthy();
    expect(screen.queryByText(getDashboardMessages("en").fit.savedBikes.noBikes)).toBeNull();
    expect(screen.queryByRole("button", { name: getFitStartCopy("en").continue })).toBeNull();
  });

  it("keeps bike loading distinct from an empty garage", () => {
    state.values["bikes/queries:listByUser"] = undefined;
    const view = render(<NewFitSessionPage />);
    expect(screen.getByText(getDashboardMessages("en").fit.savedBikes.loading)).toBeTruthy();
    expect(startButton().disabled).toBe(true);
    state.values["bikes/queries:listByUser"] = [];
    view.rerender(<NewFitSessionPage />);
    expect(screen.getByText(getDashboardMessages("en").fit.savedBikes.noBikes)).toBeTruthy();
    expect(screen.getByRole("link", { name: getDashboardMessages("en").fit.savedBikes.addFirstBike }).getAttribute("href")).toBe("/en/bikes/new");
  });

  it("selects a real bike, exposes pressed state and renders its saved context", () => {
    render(<NewFitSessionPage />);
    const option = screen.getByRole("button", { name: roadBike.name });
    fireEvent.click(option);
    expect(option.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: gravelBike.name }).getAttribute("aria-pressed")).toBe("false");
    const summary = within(screen.getByRole("region", { name: roadBike.name }));
    expect(summary.getByText(getDashboardMessages("en").sessions.ridingStyle.touring)).toBeTruthy();
    expect(summary.getByText(getDashboardMessages("en").fit.goals.comfort.label)).toBeTruthy();
    expect(document.querySelector('img[src="/real-bike-photo.webp"]')).toBeTruthy();
    expect(startButton().disabled).toBe(false);
  });

  it("preselects only a bike in the fetched garage and respects later manual selection", () => {
    state.search = new URLSearchParams("bikeId=road-bike");
    const view = render(<NewFitSessionPage />);
    expect(screen.getByRole("button", { name: roadBike.name }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: gravelBike.name }));
    view.rerender(<NewFitSessionPage />);
    expect(screen.getByRole("button", { name: gravelBike.name }).getAttribute("aria-pressed")).toBe("true");
  });

  it("ignores an unknown requested bike and waits for asynchronously loaded bikes", () => {
    state.search = new URLSearchParams("bikeId=unknown");
    const view = render(<NewFitSessionPage />);
    expect(startButton().disabled).toBe(true);
    state.search = new URLSearchParams("bikeId=road-bike");
    state.values["bikes/queries:listByUser"] = undefined;
    view.rerender(<NewFitSessionPage />);
    expect(startButton().disabled).toBe(true);
    state.values["bikes/queries:listByUser"] = [roadBike];
    view.rerender(<NewFitSessionPage />);
    expect(startButton().disabled).toBe(false);
  });

  it.each([
    ["missing", null],
    ["incomplete", { ...completeProfile, weeklyHours: undefined }],
    ["pain without areas", { ...completeProfile, hasPain: "yes", painAreas: [] }],
  ])("blocks creation for a %s rider profile", (_name, profile) => {
    state.values["profiles/queries:getMyProfile"] = profile;
    state.search = new URLSearchParams("bikeId=road-bike");
    render(<NewFitSessionPage />);
    expect(startButton().disabled).toBe(true);
    fireEvent.click(startButton());
    expect(state.create).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: profile ? getDashboardMessages("en").fit.riderProfileWarning.cta : getDashboardMessages("en").fit.profileWarning.cta }).getAttribute("href")).toBe("/en/profile");
  });

  it("preserves missing-attribute eligibility and its edit destination", () => {
    state.values["bikes/queries:listByUser"] = [{ ...roadBike, bikeType: "mountain", discipline: "mtb", ridingStyle: undefined, primaryGoal: undefined }];
    state.search = new URLSearchParams("bikeId=road-bike");
    render(<NewFitSessionPage />);
    expect(startButton().disabled).toBe(true);
    expect(screen.getByText(getDashboardMessages("en").fit.savedBikes.missingBikeAttribute)).toBeTruthy();
    expect(screen.getByRole("link", { name: getDashboardMessages("en").fit.savedBikes.completeBikeSetup }).getAttribute("href")).toBe("/en/bikes/road-bike/edit");
  });

  it("keeps the aero restriction and explains the blocked action", () => {
    state.values["bikes/queries:listByUser"] = [{ ...gravelBike, primaryGoal: "aerodynamics" }];
    state.search = new URLSearchParams("bikeId=gravel-bike");
    render(<NewFitSessionPage />);
    expect(startButton().disabled).toBe(true);
    expect(screen.getByText(getFitStartCopy("en").aeroWarning)).toBeTruthy();
  });

  it("retains role-bias defaults when saved riding attributes are absent", async () => {
    state.values["bikes/queries:listByUser"] = [{ ...gravelBike, ridingStyle: undefined, primaryGoal: undefined }];
    state.search = new URLSearchParams("bikeId=gravel-bike");
    render(<NewFitSessionPage />);
    fireEvent.click(startButton());
    await waitFor(() => expect(state.create).toHaveBeenCalledWith({ bikeId: "gravel-bike", bikeType: "gravel", ridingStyle: "sportive", primaryGoal: "balanced" }));
  });

  it.each(["nl", "en"] as const)("preserves the exact create payload, toast and %s questionnaire route", async (locale) => {
    state.locale = locale;
    state.search = new URLSearchParams("bikeId=road-bike");
    render(<NewFitSessionPage />);
    fireEvent.click(startButton());
    await waitFor(() => expect(state.push).toHaveBeenCalledWith(`/${locale}/fit/created-session/questionnaire`));
    expect(state.create).toHaveBeenCalledExactlyOnceWith({ bikeType: "road", ridingStyle: "touring", primaryGoal: "comfort", bikeId: "road-bike" });
    expect(state.success).toHaveBeenCalledWith({ description: getDashboardMessages(locale).common.toasts.fitSessionStarted });
    expect(state.log).not.toHaveBeenCalledWith(expect.objectContaining({ eventType: "free_fit_started_during_campaign" }));
  });

  it("prevents a second create while the request is pending", async () => {
    let resolveCreate!: (id: string) => void;
    state.create.mockImplementation(() => new Promise<string>((resolve) => { resolveCreate = resolve; }));
    state.search = new URLSearchParams("bikeId=road-bike");
    render(<NewFitSessionPage />);
    fireEvent.click(startButton());
    const pending = screen.getByRole("button", { name: getFitStartCopy("en").creating }) as HTMLButtonElement;
    expect(pending.disabled).toBe(true);
    fireEvent.click(pending);
    expect(state.create).toHaveBeenCalledTimes(1);
    await act(async () => resolveCreate("created-session"));
  });

  it("shows the reported create error and allows retry without navigating", async () => {
    const error = new Error("mutation failed");
    state.create.mockRejectedValueOnce(error);
    state.search = new URLSearchParams("bikeId=road-bike");
    render(<NewFitSessionPage />);
    fireEvent.click(startButton());
    expect((await screen.findByRole("alert")).textContent).toContain("Could not start. Please retry.");
    expect(state.reportError).toHaveBeenCalledWith(error, expect.objectContaining({ area: "fit", action: "createSession", operationType: "mutation", metadata: { bikeType: "road", ridingStyle: "touring", primaryGoal: "comfort", hasBikeId: true } }));
    expect(state.push).not.toHaveBeenCalled();
    expect(startButton().disabled).toBe(false);
    fireEvent.click(startButton());
    await waitFor(() => expect(state.push).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("tracks one fit view without expired campaign attribution", async () => {
    state.search = new URLSearchParams("bikeId=road-bike");
    const view = render(<NewFitSessionPage />);
    view.rerender(<NewFitSessionPage />);
    expect(state.log).toHaveBeenCalledExactlyOnceWith({ eventType: "funnel_fit_view", locale: "en", pagePath: "/en/fit", section: "fit_start_page" });
    expect(screen.queryByText(/Alpe|Donate/)).toBeNull();
    fireEvent.click(startButton());
    await waitFor(() => expect(state.push).toHaveBeenCalledTimes(1));
    expect(state.log).not.toHaveBeenCalledWith(expect.objectContaining({ eventType: "free_fit_started_during_campaign" }));
  });
});
