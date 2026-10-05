/* @vitest-environment jsdom */
import { useContext } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CalculatorDataProvider } from "./CalculatorDataProvider";
import { CalculatorDataContext } from "./context";
import type { HandoffEntry } from "@/lib/handoff/store";

const mocks = vi.hoisted(() => ({
  auth: { isAuthenticated: false, isLoading: false },
  data: undefined as { userId: string; entries: HandoffEntry[] } | undefined,
  query: vi.fn(), mutate: vi.fn(), session: { ready: true, entries: [] as HandoffEntry[] },
}));
vi.mock("convex/react", () => ({
  useConvexAuth: () => mocks.auth,
  useQuery: (...args: unknown[]) => { mocks.query(...args); return mocks.auth.isAuthenticated ? mocks.data : undefined; },
  useMutation: () => mocks.mutate,
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/nl/calculators/frame-size" }));
vi.mock("@/lib/handoff/usePublicHandoff", () => ({ usePublicHandoff: () => mocks.session }));
vi.mock("@/components/calculators/LeaveDataNotice", () => ({ LeaveDataNotice: () => null }));

const input: HandoffEntry = { field: "heightCm", value: 181, unit: "cm", calculator: "frame-size",
  method: "declared", touchedAt: 1000 };
function Consumer() {
  const data = useContext(CalculatorDataContext)!;
  return <>
    <div data-testid="data">{JSON.stringify({ source: data.source, ready: data.ready, entries: data.entries })}</div>
    <button onClick={() => data.save(input)}>Edit height</button>
    <button onClick={() => data.save({ ...input, field: "inseamCm", value: 92, method: "measured" },
      { inseamConfirmed: true })}>Confirm inseam</button>
    <button onClick={() => data.save({ ...input, field: "powerWatts", value: 200, unit: "W", calculator: "power-speed" })}>
      Edit speed power
    </button>
    <button onClick={() => data.save({ ...input, field: "powerWatts", value: 300, unit: "W", calculator: "climb-planner" })}>
      Edit climb power
    </button>
  </>;
}
const tree = () => <CalculatorDataProvider><Consumer /></CalculatorDataProvider>;
const tick = () => act(async () => { await vi.advanceTimersByTimeAsync(600); });
beforeEach(() => {
  vi.useFakeTimers();
  mocks.auth = { isAuthenticated: false, isLoading: false };
  mocks.data = undefined;
  mocks.session = { ready: true, entries: [] };
  mocks.query.mockClear();
  mocks.mutate.mockReset().mockResolvedValue({ acceptedFields: ["heightCm"], retainedFields: [] });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("CalculatorDataProvider", () => {
  it("skips server queries and writes while signed out", async () => {
    render(tree());
    fireEvent.click(screen.getByText("Edit height"));
    await tick();
    expect(mocks.query.mock.calls.every(call => call[1] === "skip")).toBe(true);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it("loads profile prefills after sign-in without saving defaults", async () => {
    const view = render(tree());
    mocks.auth = { isAuthenticated: true, isLoading: false };
    mocks.data = { userId: "first", entries: [input] };
    view.rerender(tree());
    await tick();
    expect(screen.getByTestId("data").textContent).toContain('"source":"profile"');
    expect(screen.getByTestId("data").textContent).toContain('"value":181');
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it("debounces actual edits with the authenticated user identity", async () => {
    mocks.auth.isAuthenticated = true;
    mocks.data = { userId: "first", entries: [] };
    render(tree());
    fireEvent.click(screen.getByText("Edit height"));
    expect(mocks.mutate).not.toHaveBeenCalled();
    expect(screen.getByTestId("data").textContent).toContain('"value":181');
    await tick();
    expect(mocks.mutate).toHaveBeenCalledExactlyOnceWith({ expectedUserId: "first", calculator: "frame-size",
      entries: [input], removedFields: [] });
  });
  it("sends an explicit inseam confirmation with its measurement", async () => {
    mocks.auth.isAuthenticated = true;
    mocks.data = { userId: "first", entries: [] };
    render(tree());
    fireEvent.click(screen.getByText("Confirm inseam"));
    await tick();
    expect(mocks.mutate).toHaveBeenCalledWith({ expectedUserId: "first", calculator: "frame-size", removedFields: [],
      entries: [{ ...input, field: "inseamCm", value: 92, method: "measured" }], inseamConfirmed: true });
  });
  it("keeps authoritative profile values when the server retains a higher-quality value", async () => {
    mocks.auth.isAuthenticated = true;
    const measured: HandoffEntry = { ...input, method: "measured", value: 178 };
    mocks.data = { userId: "first", entries: [measured] };
    mocks.mutate.mockResolvedValue({ acceptedFields: [], retainedFields: ["heightCm"] });
    render(tree());
    fireEvent.click(screen.getByText("Edit height"));
    await tick();
    expect(screen.getByTestId("data").textContent).toContain('"value":178');
    await tick();
    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Gebruik deze invoer in mijn profiel" }));
    await tick();
    expect(mocks.mutate.mock.calls[1][0]).toMatchObject({ confirmedProfileFields: [
      { field: "heightCm", expectedValue: 178, expectedTouchedAt: 1000 },
    ] });
  });
  it("retains two calculators' queued scenario values independently", async () => {
    mocks.auth.isAuthenticated = true;
    mocks.data = { userId: "first", entries: [] };
    render(tree());
    fireEvent.click(screen.getByText("Edit speed power"));
    fireEvent.click(screen.getByText("Edit climb power"));
    const data = JSON.parse(screen.getByTestId("data").textContent!);
    expect(data.entries.filter((entry: HandoffEntry) => entry.field === "powerWatts")).toHaveLength(2);
    await tick();
    expect(mocks.mutate).toHaveBeenCalledTimes(2);
    expect(mocks.mutate.mock.calls.map(call => [call[0].calculator, call[0].entries[0].value]))
      .toEqual([["power-speed", 200], ["climb-planner", 300]]);
  });
  it("does not replay a consumed profile confirmation on later scenario edits", async () => {
    mocks.auth.isAuthenticated = true;
    mocks.data = { userId: "first", entries: [{ ...input, value: 178, method: "measured", touchedAt: 900 }] };
    mocks.mutate.mockResolvedValueOnce({ acceptedFields: [], retainedFields: ["heightCm"] });
    render(tree());
    fireEvent.click(screen.getByText("Edit height"));
    await tick();
    fireEvent.click(screen.getByRole("button", { name: "Gebruik deze invoer in mijn profiel" }));
    await tick();
    expect(mocks.mutate.mock.calls[1][0].confirmedProfileFields).toHaveLength(1);
    fireEvent.click(screen.getByText("Edit speed power"));
    await tick();
    expect(mocks.mutate.mock.calls.slice(2).every(call => !call[0].confirmedProfileFields)).toBe(true);
  });
  it("drops pending edits when the authenticated account changes", async () => {
    mocks.auth.isAuthenticated = true;
    mocks.data = { userId: "first", entries: [] };
    const view = render(tree());
    fireEvent.click(screen.getByText("Edit height"));
    mocks.data = { userId: "second", entries: [] };
    view.rerender(tree());
    await tick();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it("drops pending edits on sign-out", async () => {
    mocks.auth.isAuthenticated = true;
    mocks.data = { userId: "first", entries: [] };
    const view = render(tree());
    fireEvent.click(screen.getByText("Edit height"));
    mocks.auth.isAuthenticated = false;
    mocks.data = undefined;
    view.rerender(tree());
    await tick();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it("shows a localized failure and retries the same entry", async () => {
    mocks.auth.isAuthenticated = true;
    mocks.data = { userId: "first", entries: [] };
    mocks.mutate.mockRejectedValueOnce(new Error("offline"));
    render(tree());
    fireEvent.click(screen.getByText("Edit height"));
    await tick();
    expect(screen.getByRole("status").textContent).toContain("Niet opgeslagen");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Opnieuw proberen" })); });
    expect(mocks.mutate).toHaveBeenCalledTimes(2);
    expect(mocks.mutate.mock.calls[1][0]).toEqual(mocks.mutate.mock.calls[0][0]);
    expect(screen.getByRole("status").textContent).toContain("Opgeslagen");
  });
});
