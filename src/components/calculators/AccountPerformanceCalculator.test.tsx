/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { AccountPerformanceCalculator } from "./AccountPerformanceCalculator";
const fixture = vi.hoisted(() => ({
  saved: null as Record<string, unknown> | null,
  profile: { weightKg: 68, ftpWatts: 245 },
  save: vi.fn(),
  locale: "nl",
  loading: false,
}));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: fixture.locale }) }));
vi.mock("convex/react", () => ({
  useQuery: (ref: Parameters<typeof getFunctionName>[0]) => {
    const name = getFunctionName(ref);
    if (fixture.loading) return undefined;
    if (name === "users/queries:getCurrentUser") return { _id: "rider" };
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
  fixture.profile = { weightKg: 68, ftpWatts: 245 };
  fixture.save.mockReset().mockImplementation(async ({ state }) => {
    fixture.saved = { state };
  });
});
afterEach(cleanup);
describe("performance account form", () => {
  it.each(["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"] as const)(
    "%s saves actual edits, restores them and leaves profile untouched",
    async (calculator) => {
      const view = render(<AccountPerformanceCalculator calculator={calculator} />);
      expect(fixture.save).not.toHaveBeenCalled();
      const slider = screen.getAllByRole("slider")[0];
      const before = slider.getAttribute("aria-valuenow");
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      fireEvent.keyUp(slider, { key: "ArrowRight" });
      await waitFor(() => expect(fixture.save).toHaveBeenCalledOnce());
      const edited = slider.getAttribute("aria-valuenow");
      expect(edited).not.toBe(before);
      expect(fixture.save.mock.calls[0][0].state.calculator).toBe(calculator);
      expect(fixture.profile).toEqual({ weightKg: 68, ftpWatts: 245 });
      expect(
        screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/nl/tools/"))
          .length,
      ).toBe(4);
      view.unmount();
      fixture.profile = { weightKg: 90, ftpWatts: 300 };
      render(<AccountPerformanceCalculator calculator={calculator} />);
      expect(screen.getAllByRole("slider")[0].getAttribute("aria-valuenow")).toBe(edited);
      expect(fixture.save).toHaveBeenCalledOnce();
    },
  );
  it("keeps a failed edit through profile refresh and exposes Dutch retry", async () => {
    fixture.save.mockRejectedValueOnce(new Error("offline"));
    const view = render(<AccountPerformanceCalculator calculator="power-speed" />);
    const slider = screen.getByRole("slider", { name: "Vermogen" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    await screen.findByText("Niet opgeslagen");
    const edited = slider.getAttribute("aria-valuenow");
    fixture.profile = { weightKg: 90, ftpWatts: 300 };
    view.rerender(<AccountPerformanceCalculator calculator="power-speed" />);
    expect(slider.getAttribute("aria-valuenow")).toBe(edited);
    fireEvent.click(screen.getByRole("button", { name: "Opnieuw proberen" }));
    await waitFor(() => expect(fixture.save).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Opgeslagen")).toBeTruthy();
  });
  it("does not mount a form before authenticated data loads", () => {
    fixture.loading = true;
    render(<AccountPerformanceCalculator calculator="power-speed" />);
    expect(screen.queryByRole("slider")).toBeNull();
    expect(screen.getByText("Je waarden laden…")).toBeTruthy();
  });
});
