/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import type { ReactNode } from "react";
import type { ChainPanelController } from "./useCalculatorChain";
import { AccountPerformanceCalculator } from "./AccountPerformanceCalculator";
import { performanceDefaults } from "@/lib/calculators/accountState";
import { ftpSliderStartCopy } from "@/i18n/calculators/ftpSliderStart";
import type { RiderSex } from "../../../shared/riderDemographics";
const fixture = vi.hoisted(() => ({
  profile: { inseamCm: 83, heightCm: 178, weightKg: 68, ftpWatts: 245 as number | undefined,
    sex: "female" as RiderSex | undefined, flexibilityScore: "good", coreStabilityScore: 4 },
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
    sex: "female", flexibilityScore: "good", coreStabilityScore: 4 };
  fixture.saved = null; fixture.locale = "nl"; fixture.loading = false;
  fixture.save.mockReset().mockResolvedValue("state1");
  fixture.apply.mockReset().mockResolvedValue({ status: "saved", fields: ["inseamCm"] });
  fixture.push.mockReset();
});
afterEach(cleanup);
describe("account performance live chain", () => {
  it.each([39, 151, Number.NaN])("does not derive FTP from fallback weight for invalid profile weight %s", (weightKg) => {
    fixture.profile.ftpWatts = undefined;
    fixture.profile.weightKg = weightKg;
    render(<AccountPerformanceCalculator calculator="ftp-wkg" />);
    expect(screen.getByRole("slider", { name: "Lichaamsgewicht" }).getAttribute("aria-valuenow")).toBe("75");
    expect(screen.getByRole("slider", { name: /FTP$/ }).getAttribute("aria-valuenow")).toBe("200");
    expect(screen.queryByText(ftpSliderStartCopy.nl.hint)).toBeNull();
    expect(fixture.save).not.toHaveBeenCalled();
    expect(fixture.apply).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole("slider", { name: "Lichaamsgewicht" }), { key: "ArrowRight" });
    expect(screen.getByRole("slider", { name: /FTP$/ }).getAttribute("aria-valuenow")).toBe("145");
    expect(screen.getByText(ftpSliderStartCopy.nl.pending)).toBeTruthy();
    expect(fixture.save).not.toHaveBeenCalled();
    expect(fixture.apply).not.toHaveBeenCalled();
  });

  it("requires explicit profile saving when confirmed FTP equals the placeholder", async () => {
    fixture.profile.ftpWatts = undefined;
    fixture.profile.sex = "male";
    fixture.profile.weightKg = 90;
    render(<AccountPerformanceCalculator calculator="ftp-wkg" />);
    expect(screen.getByRole("slider", { name: /FTP$/ }).getAttribute("aria-valuenow")).toBe("200");
    expect(screen.getByTestId("pending").textContent).toBe("0");
    expect(fixture.save).not.toHaveBeenCalled();
    expect(fixture.apply).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: ftpSliderStartCopy.nl.confirm }));
    expect(screen.getByTestId("pending").textContent).toBe("1");
    expect(screen.queryByText(ftpSliderStartCopy.nl.pending)).toBeNull();
    expect(fixture.save).not.toHaveBeenCalled();
    expect(fixture.apply).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
    await waitFor(() => expect(fixture.apply).toHaveBeenCalledOnce());
    expect(fixture.apply.mock.calls[0][0].changes).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "ftpWatts", value: 200 }),
    ]));
    expect(fixture.save).not.toHaveBeenCalled();
  });

  it("keeps a real default-valued profile FTP and falls back when sex is absent", () => {
    fixture.profile.ftpWatts = performanceDefaults.values.ftp;
    const view = render(<AccountPerformanceCalculator calculator="ftp-wkg" />);
    expect(screen.getByRole("slider", { name: /FTP$/ }).getAttribute("aria-valuenow")).toBe("200");
    expect(screen.queryByText(ftpSliderStartCopy.nl.hint)).toBeNull();
    view.unmount();
    fixture.profile.ftpWatts = undefined;
    fixture.profile.sex = undefined;
    render(<AccountPerformanceCalculator calculator="ftp-wkg" />);
    expect(screen.getByRole("slider", { name: /FTP$/ }).getAttribute("aria-valuenow")).toBe("200");
    expect(screen.queryByText(ftpSliderStartCopy.nl.hint)).toBeNull();
    expect(fixture.save).not.toHaveBeenCalled();
  });

  it("preserves explicitly accepted trial FTP across a profile rebase", () => {
    fixture.profile.ftpWatts = undefined;
    const view = render(<AccountPerformanceCalculator calculator="ftp-wkg" />);
    fireEvent.click(screen.getByRole("button", { name: ftpSliderStartCopy.nl.confirm }));
    fireEvent.click(screen.getByRole("button", { name: "Trial" }));
    fixture.profile.weightKg = 80;
    view.rerender(<AccountPerformanceCalculator calculator="ftp-wkg" />);
    expect(screen.getByRole("slider", { name: /FTP$/ }).getAttribute("aria-valuenow")).toBe("130");
    expect(screen.queryByText(ftpSliderStartCopy.nl.hint)).toBeNull();
    expect(fixture.save).not.toHaveBeenCalled();
    expect(fixture.apply).not.toHaveBeenCalled();
  });

  it.each(["ftp-wkg", "climb-planner"] as const)("keeps unknown FTP out of storage until confirmed in %s", async (calculator) => {
    fixture.profile.ftpWatts = undefined;
    render(<AccountPerformanceCalculator calculator={calculator} />);
    expect(screen.getByRole("slider", { name: /FTP$/ }).getAttribute("aria-valuenow")).toBe("130");
    expect(screen.getByText(ftpSliderStartCopy.nl.pending)).toBeTruthy();
    expect(screen.getByTestId("pending").textContent).toBe("0");
    expect(fixture.save).not.toHaveBeenCalled();
    expect(fixture.apply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: ftpSliderStartCopy.nl.confirm }));
    expect(screen.queryByText(ftpSliderStartCopy.nl.pending)).toBeNull();
    expect(screen.getByTestId("pending").textContent).toBe("1");
    expect(fixture.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
    await waitFor(() => expect(fixture.apply).toHaveBeenCalledOnce());
    expect(fixture.apply.mock.calls[0][0].changes).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "ftpWatts", value: 130 }),
    ]));
  });

  it("uses live FTP over old saved calculator values and remounts only external rebases", () => {
    fixture.saved = { state: { values: { ...performanceDefaults, values: { ...performanceDefaults.values, ftp: 300 } } } };
    const view = render(<AccountPerformanceCalculator calculator="ftp-wkg" />);
    expect(document.querySelector('a[href="/nl/gearing"]')).toBeNull();
    expect(screen.getByRole("slider", { name: /FTP$/ }).getAttribute("aria-valuenow")).toBe("245");
    fixture.profile.ftpWatts = 270;
    view.rerender(<AccountPerformanceCalculator calculator="ftp-wkg" />);
    expect(screen.getByRole("slider", { name: /FTP$/ }).getAttribute("aria-valuenow")).toBe("270");
    expect(fixture.save).not.toHaveBeenCalled();
  });
  it("asks before saving FTP, while ordinary power scenario preferences still autosave", async () => {
    const view = render(<AccountPerformanceCalculator calculator="ftp-wkg" />);
    fireEvent.keyDown(screen.getByRole("slider", { name: /FTP$/ }), { key: "ArrowRight" });
    expect(screen.getByTestId("pending").textContent).toBe("1");
    expect(fixture.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
    await waitFor(() => expect(fixture.apply).toHaveBeenCalledOnce());
    view.unmount(); fixture.save.mockClear();
    render(<AccountPerformanceCalculator calculator="power-speed" />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Vermogen" }), { key: "ArrowRight" });
    fireEvent.keyUp(screen.getByRole("slider", { name: "Vermogen" }), { key: "ArrowRight" });
    await waitFor(() => expect(fixture.save).toHaveBeenCalledOnce());
  });
  it("does not mount a calculator before authenticated context loads", () => {
    fixture.loading = true;
    render(<AccountPerformanceCalculator calculator="power-speed" />);
    expect(screen.queryByRole("slider")).toBeNull();
  });
});
