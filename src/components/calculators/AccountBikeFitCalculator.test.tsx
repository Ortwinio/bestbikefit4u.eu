/* @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import type { ReactNode } from "react";
import type { ChainPanelController } from "./useCalculatorChain";
import { AccountBikeFitCalculator } from "./AccountBikeFitCalculator";
import { accountBikeFitCopy } from "@/i18n/account/bikeFitCalculator";
const fixture = vi.hoisted(() => ({
  profile: { inseamCm: 83, heightCm: 178, weightKg: 68, ftpWatts: 245, flexibilityScore: "good", coreStabilityScore: 4 },
  saved: null as Record<string, unknown> | null, loading: false, locale: "nl" as "nl" | "en",
  save: vi.fn(), apply: vi.fn(), push: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: fixture.push }),
  useSearchParams: () => new URLSearchParams() }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: fixture.locale }) }));
vi.mock("./CalculatorChainPanel", () => ({ CalculatorChainLayout: ({ children, chain }: {
  children: ReactNode; chain: ChainPanelController;
}) => <>{children}<p data-testid="pending">{chain.pendingChanges.length}</p>
  <button onClick={() => { void chain.saveToProfile(); }}>Save profile</button>
  <button onClick={chain.useForThisCalculation}>Trial</button>
  <p>{chain.status}</p></> }));
vi.mock("convex/react", () => ({
  useQuery: (ref: Parameters<typeof getFunctionName>[0]) => {
    if (fixture.loading) return undefined;
    const name = getFunctionName(ref);
    if (name === "users/queries:getCurrentUser") return { _id: "user1" };
    if (name === "bikes/queries:list") return [];
    if (name === "calculatorChain/queries:getContext") return { profile: fixture.profile,
      observations: [], bikeObservations: [], bikes: [], recentCalculators: [], advice: [] };
    if (name === "calculatorStates/queries:get") return fixture.saved;
    throw new Error(name);
  },
  useMutation: (ref: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(ref) === "calculatorChain/mutations:applyChanges" ? fixture.apply : fixture.save,
}));
beforeEach(() => {
  fixture.profile = { inseamCm: 83, heightCm: 178, weightKg: 68, ftpWatts: 245,
    flexibilityScore: "good", coreStabilityScore: 4 };
  fixture.saved = null; fixture.locale = "nl"; fixture.loading = false;
  fixture.save.mockReset().mockResolvedValue("state1");
  fixture.apply.mockReset().mockResolvedValue({ status: "saved", fields: ["inseamCm"] });
  fixture.push.mockReset();
});
afterEach(cleanup);
describe("account bike fit live chain", () => {
  it.each(["nl", "en"] as const)("keeps %s measured edits pending until an explicit choice", async (locale) => {
    fixture.locale = locale;
    render(<AccountBikeFitCalculator />);
    const input = screen.getByRole("slider", { name: locale === "nl" ? "Lichaamslengte" : "Height" });
    expect(input.getAttribute("aria-valuenow")).toBe("178");
    expect(screen.queryByText("High confidence")).toBeNull();
    expect(screen.queryByText("Hoge betrouwbaarheid")).toBeNull();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(screen.getByTestId("pending").textContent).toBe("1");
    expect(fixture.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
    await waitFor(() => expect(fixture.apply).toHaveBeenCalledOnce());
    expect(fixture.apply.mock.calls[0][0].changes[0]).toMatchObject({ field: "heightCm", value: 179 });
  });
  it("rebases to live external measurements and keeps the start path value-free", async () => {
    const view = render(<AccountBikeFitCalculator />);
    fixture.profile.heightCm = 175;
    view.rerender(<AccountBikeFitCalculator />);
    expect(screen.getByRole("slider", { name: "Lichaamslengte" }).getAttribute("aria-valuenow")).toBe("175");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: accountBikeFitCopy.nl.start })); });
    expect(fixture.push).toHaveBeenCalledWith("/nl/fit?calculator=bike-fit");
    expect(fixture.save.mock.calls[0][0].state.values.heightCm).toBe(175);
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
});
