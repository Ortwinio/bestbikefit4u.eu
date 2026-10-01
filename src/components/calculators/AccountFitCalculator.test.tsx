/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { AccountFitCalculator } from "./AccountFitCalculator";
import { calculatorDefaults } from "@/lib/calculators/accountState";

const fixture = vi.hoisted(() => ({
  saved: null as Record<string, unknown> | null,
  profile: { inseamCm: 83, heightCm: 178 },
  save: vi.fn(), locale: "nl", loading: false,
}));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: fixture.locale }) }));
vi.mock("convex/react", () => ({
  useQuery: (ref: Parameters<typeof getFunctionName>[0]) => {
    const name = getFunctionName(ref);
    if (fixture.loading) return undefined;
    if (name === "users/queries:getCurrentUser") return { _id: "user1" };
    if (name === "profiles/queries:getMyProfile") return fixture.profile;
    if (name === "calculatorStates/queries:get") return fixture.saved;
    throw new Error(name);
  },
  useMutation: () => fixture.save,
}));
beforeEach(() => {
  fixture.saved = null;
  fixture.loading = false;
  fixture.locale = "nl";
  fixture.profile = { inseamCm: 83, heightCm: 178 };
  fixture.save.mockReset().mockImplementation(async ({ state }) => { fixture.saved = { state }; });
});
afterEach(cleanup);

describe("shared public forms in account mode", () => {
  it.each(["saddle-height", "frame-size", "crank-length"] as const)(
    "%s prefills, saves only edits and restores them on the next visit", async (calculator) => {
      const view = render(<AccountFitCalculator calculator={calculator} />);
      const input = screen.getAllByRole("slider").find((field) => field.getAttribute("aria-valuenow") === "83")!;
      expect(input).toBeTruthy();
      expect(screen.getByText("Ingevuld vanuit je profiel", { exact: false })).toBeTruthy();
      expect(fixture.save).not.toHaveBeenCalled();
      if (calculator === "crank-length") {
        expect(screen.getByRole("button", { name: "Start volledige bikefit" }).getAttribute("href")).toBe("/nl/fit");
        expect(screen.getByText("Controleer je maten en pas ze aan waar nodig.")).toBeTruthy();
        expect(screen.queryByText("Maak een account aan en ga verder met een persoonlijke bikefit.")).toBeNull();
      }
      fireEvent.keyDown(input, { key: "ArrowRight" });
      fireEvent.keyUp(input, { key: "ArrowRight" });
      await waitFor(() => expect(fixture.save).toHaveBeenCalledOnce());
      const savedInseam = fixture.save.mock.calls[0][0].state.values.inseamCm;
      expect(savedInseam).toBeGreaterThan(83);
      expect(fixture.profile.inseamCm).toBe(83);
      view.unmount();
      fixture.profile = { inseamCm: 80, heightCm: 175 };
      render(<AccountFitCalculator calculator={calculator} />);
      expect(screen.getAllByRole("slider").some((field) =>
        Number(field.getAttribute("aria-valuenow")) === savedInseam)).toBe(true);
      expect(screen.queryByText("Ingevuld vanuit je profiel", { exact: false })).toBeNull();
      expect(fixture.save).toHaveBeenCalledOnce();
    },
  );
  it("waits for hydration and does not write a refreshed profile into calculator state", () => {
    fixture.loading = true;
    const view = render(<AccountFitCalculator calculator="crank-length" />);
    expect(screen.queryByRole("slider")).toBeNull();
    fixture.loading = false;
    view.rerender(<AccountFitCalculator calculator="crank-length" />);
    expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("83");
    fixture.profile = { inseamCm: 81, heightCm: 175 };
    view.rerender(<AccountFitCalculator calculator="crank-length" />);
    expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("83");
    expect(fixture.save).not.toHaveBeenCalled();
  });
  it("keeps a failed edit, retries it and ignores later profile refreshes", async () => {
    fixture.saved = { state: { calculator: "crank-length", values: {
      ...calculatorDefaults["crank-length"], inseamCm: 89,
    } } };
    fixture.save.mockRejectedValueOnce(new Error("offline"));
    const view = render(<AccountFitCalculator calculator="crank-length" />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    await screen.findByText("Niet opgeslagen");
    const edited = screen.getByRole("slider").getAttribute("aria-valuenow");
    fixture.profile = { inseamCm: 81, heightCm: 175 };
    view.rerender(<AccountFitCalculator calculator="crank-length" />);
    expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe(edited);
    fireEvent.click(screen.getByRole("button", { name: "Opnieuw proberen" }));
    await waitFor(() => expect(fixture.save).toHaveBeenCalledTimes(2));
  });
});
