/* @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { AccountBikeFitCalculator } from "./AccountBikeFitCalculator";
import { BikeFitCalculatorForm } from "@/app/(public)/calculators/bike-fit/BikeFitCalculatorForm";
import { accountBikeFitCopy } from "@/i18n/account/bikeFitCalculator";
import { bikeFitMessages } from "@/i18n/calculators/bikeFit";

const fixture = vi.hoisted(() => ({
  saved: null as Record<string, unknown> | null,
  profile: { heightCm: 178, inseamCm: 83, flexibilityScore: "good", coreStabilityScore: 4 } as
    { heightCm: number; inseamCm: number; flexibilityScore: string; coreStabilityScore: number } | null,
  loading: false, locale: "nl" as "nl" | "en", save: vi.fn(), push: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: fixture.push }) }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: fixture.locale }) }));
vi.mock("convex/react", () => ({
  useQuery: (reference: Parameters<typeof getFunctionName>[0]) => {
    const name = getFunctionName(reference);
    if (fixture.loading) return undefined;
    if (name === "users/queries:getCurrentUser") return { _id: "user1" };
    if (name === "profiles/queries:getMyProfile") return fixture.profile;
    if (name === "calculatorStates/queries:get") return fixture.saved;
    throw new Error(name);
  },
  useMutation: () => fixture.save,
}));
beforeEach(() => {
  vi.useFakeTimers();
  fixture.locale = "nl";
  fixture.saved = null;
  fixture.loading = false;
  fixture.profile = { heightCm: 178, inseamCm: 83, flexibilityScore: "good", coreStabilityScore: 4 };
  fixture.push.mockReset();
  fixture.save.mockReset().mockImplementation(async ({ state }) => { fixture.saved = { _id: "state1", state }; });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
const settle = async () => { await act(async () => { await vi.advanceTimersByTimeAsync(500); }); };

describe("account bike-fit calculator", () => {
  it.each(["nl", "en"] as const)("prefills, saves and restores only calculator state in %s", async (locale) => {
    fixture.locale = locale;
    const view = render(<AccountBikeFitCalculator />);
    const height = screen.getByRole("slider", { name: bikeFitMessages[locale].height });
    expect(height.getAttribute("aria-valuenow")).toBe("178");
    expect(fixture.save).not.toHaveBeenCalled();
    fireEvent.keyDown(height, { key: "ArrowRight" });
    fireEvent.keyUp(height, { key: "ArrowRight" });
    await settle();
    expect(fixture.save).toHaveBeenCalledExactlyOnceWith({ bikeId: undefined, state: {
      calculator: "bike-fit", values: { heightCm: 179, inseamCm: 83, source: "estimated",
        category: "road", ambition: "balanced", flexibility: 4, core: 4 },
    } });
    expect(fixture.profile?.heightCm).toBe(178);
    view.unmount();
    fixture.profile = { heightCm: 170, inseamCm: 80, flexibilityScore: "average", coreStabilityScore: 3 };
    render(<AccountBikeFitCalculator />);
    expect(screen.getByRole("slider", { name: bikeFitMessages[locale].height }).getAttribute("aria-valuenow"))
      .toBe("179");
    expect(fixture.save).toHaveBeenCalledTimes(1);
  });
  it("persists untouched profile prefill before starting the session flow", async () => {
    render(<AccountBikeFitCalculator />);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: accountBikeFitCopy.nl.start })); });
    expect(fixture.save).toHaveBeenCalledOnce();
    expect(fixture.push).toHaveBeenCalledWith("/nl/fit?calculator=bike-fit");
    expect(fixture.save.mock.calls[0][0].state.values.heightCm).toBe(178);
  });
  it("keeps a failed handoff on the page and lets the user retry", async () => {
    fixture.save.mockRejectedValueOnce(new Error("offline"));
    render(<AccountBikeFitCalculator />);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: accountBikeFitCopy.nl.start })); });
    expect(screen.getByRole("alert").textContent).toBe(accountBikeFitCopy.nl.error);
    expect(fixture.push).not.toHaveBeenCalled();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: accountBikeFitCopy.nl.start })); });
    expect(fixture.push).toHaveBeenCalledOnce();
  });
  it("does not treat defaults as confirmed measurements or hydrate over an open editor", () => {
    fixture.loading = true;
    const view = render(<AccountBikeFitCalculator />);
    expect(screen.queryByRole("slider")).toBeNull();
    fixture.loading = false;
    fixture.profile = null;
    view.rerender(<AccountBikeFitCalculator />);
    expect((screen.getByRole("button", { name: accountBikeFitCopy.nl.start }) as HTMLButtonElement).disabled).toBe(true);
    fixture.profile = { heightCm: 170, inseamCm: 80, flexibilityScore: "average", coreStabilityScore: 3 };
    view.rerender(<AccountBikeFitCalculator />);
    expect(screen.getByRole("slider", { name: bikeFitMessages.nl.height }).getAttribute("aria-valuenow")).toBe("180");
    expect(fixture.save).not.toHaveBeenCalled();
  });
  it("leaves the public defaults and signup CTA unchanged", () => {
    const changed = vi.fn();
    render(<BikeFitCalculatorForm isNl onValuesChange={changed} />);
    expect(screen.getByRole("slider", { name: bikeFitMessages.nl.height }).getAttribute("aria-valuenow")).toBe("180");
    expect(screen.getByRole("link", { name: bikeFitMessages.nl.accountCta }).getAttribute("href")).toBe("/nl/login?src=bike-fit");
    expect(changed).not.toHaveBeenCalled();
    expect(screen.queryByText(accountBikeFitCopy.nl.start)).toBeNull();
  });
});
