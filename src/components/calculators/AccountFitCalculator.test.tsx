/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import type { ReactNode } from "react";
import type { ChainPanelController } from "./useCalculatorChain";
import { AccountFitCalculator } from "./AccountFitCalculator";
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
describe("account fit calculator chain", () => {
  it.each(["saddle-height", "frame-size", "crank-length"] as const)(
    "%s waits for a choice on rider edits without persisting profile overrides", async (calculator) => {
      render(<AccountFitCalculator calculator={calculator} />);
      const input = screen.getByRole("slider", { name: "Binnenbeenlengte" });
      expect(input.getAttribute("aria-valuenow")).toBe("83");
      expect(screen.queryByRole("button", { name: "Start volledige bikefit" })).toBeNull();
      expect(document.querySelector('a[href="/nl/login"]')).toBeNull();
      expect(document.querySelector('a[href="/nl/calculators/bike-fit"]')).toBeNull();
      expect(screen.queryByText("Hoge betrouwbaarheid")).toBeNull();
      expect(screen.queryByText("Gemiddelde betrouwbaarheid")).toBeNull();
      fireEvent.keyDown(input, { key: "ArrowRight" });
      fireEvent.keyUp(input, { key: "ArrowRight" });
      expect(screen.getByTestId("pending").textContent).toBe("1");
      expect(fixture.save).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
      await waitFor(() => expect(fixture.apply).toHaveBeenCalledOnce());
      expect(fixture.apply.mock.calls[0][0].changes[0]).toMatchObject({ field: "inseamCm", expectedCurrentValue: 83 });
    },
  );
  it("updates the mounted public form when the live profile changes", () => {
    const view = render(<AccountFitCalculator calculator="crank-length" />);
    fixture.profile.inseamCm = 81;
    view.rerender(<AccountFitCalculator calculator="crank-length" />);
    expect(screen.getByRole("slider", { name: "Binnenbeenlengte" }).getAttribute("aria-valuenow")).toBe("81");
    expect(fixture.save).not.toHaveBeenCalled();
  });
  it("keeps a trial local without profile writes", () => {
    render(<AccountFitCalculator calculator="crank-length" />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Binnenbeenlengte" }), { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: "Trial" }));
    expect(screen.getByTestId("pending").textContent).toBe("0");
    expect(fixture.apply).not.toHaveBeenCalled();
    expect(fixture.save).not.toHaveBeenCalled();
  });
});
