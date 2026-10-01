/* @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import type { Doc } from "../../../convex/_generated/dataModel";
import { ProfileAutosaveEditor } from "./ProfileAutosaveEditor";

const state = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("convex/react", () => ({
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) =>
    (value: unknown) => state.save(getFunctionName(reference), value),
}));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({ locale: "nl" }) }));
vi.mock("./ProfileDirectFields", () => ({
  ProfileDirectFields: ({ values, onChange, status }: import("react").ComponentProps<
    typeof import("./ProfileDirectFields").ProfileDirectFields>) => <>
    {(["heightCm", "inseamCm", "weightKg", "coreStabilityScore"] as const).map((key) => <input key={key} aria-label={key}
      value={values[key] ?? ""} onChange={(event) => onChange(key === "coreStabilityScore" ? "core" : "body",
        { [key]: Number(event.target.value) })} />)}
    <button onClick={() => onChange("flexibility", { flexibilityScore: "excellent" })}>flex</button>
    <button onClick={() => onChange("comfort", { painAreaSeverities: { lower_back: 4 } })}>pain</button>
    <button onClick={() => onChange("riding", { experienceLevel: "advanced" })}>riding</button>
    {Object.entries(status ?? {}).map(([key, value]) => <div key={key} data-testid={key}>{value}</div>)}
  </>,
}));
const profile = {
  _id: "profile", heightCm: 178, inseamCm: 83, flexibilityScore: "average", coreStabilityScore: 3,
  experienceLevel: "intermediate", weeklyHours: "3-6", typicalRideLength: "medium", positionPriority: "balanced",
  painAreas: ["lower_back"], painSeverity: 2, hasPain: "yes",
} as Doc<"profiles">;
const change = (name: string, value: number) => fireEvent.change(screen.getByLabelText(name), { target: { value } });
const tick = async (time = 500) => { await act(async () => { await vi.advanceTimersByTimeAsync(time); }); };
beforeEach(() => { vi.useFakeTimers(); state.save.mockReset().mockResolvedValue(undefined); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("profile autosave integration", () => {
  it("does not save on mount; coalesces edits and fades the saved state", async () => {
    render(<ProfileAutosaveEditor profile={profile} onWeightSaved={vi.fn()} />);
    await tick();
    expect(state.save).not.toHaveBeenCalled();
    change("heightCm", 179);
    await tick(499);
    expect(state.save).not.toHaveBeenCalled();
    change("heightCm", 180);
    await tick();
    expect(state.save).toHaveBeenCalledExactlyOnceWith("profiles/mutations:updateMeasurements",
      { heightCm: 180 });
    expect(screen.getByTestId("body").textContent).toBe("Opgeslagen");
    await tick(2000);
    expect(screen.getByTestId("body").textContent).toBe("");
  });
  it("serializes both assessment fields with the latest draft, not stale subscription data", async () => {
    let finish!: () => void;
    state.save.mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
    const view = render(<ProfileAutosaveEditor profile={profile} onWeightSaved={vi.fn()} />);
    fireEvent.click(screen.getByText("flex"));
    await tick();
    change("coreStabilityScore", 5);
    view.rerender(<ProfileAutosaveEditor profile={{ ...profile, coreStabilityScore: 2 }} onWeightSaved={vi.fn()} />);
    await tick();
    expect(state.save).toHaveBeenCalledTimes(1);
    await act(async () => { finish(); });
    expect(state.save).toHaveBeenLastCalledWith("profiles/mutations:updateAssessment",
      { flexibilityScore: "excellent", coreStabilityScore: 5 });
  });
  it("does not let riding preferences overwrite a newer comfort draft", async () => {
    render(<ProfileAutosaveEditor profile={profile} onWeightSaved={vi.fn()} />);
    fireEvent.click(screen.getByText("pain"));
    fireEvent.click(screen.getByText("riding"));
    await tick();
    expect(state.save).toHaveBeenCalledWith("profiles/mutations:updatePreferences", {
      experienceLevel: "advanced",
    });
    expect(state.save).toHaveBeenCalledWith("profiles/mutations:updateComfort", expect.objectContaining({
      painAreaSeverities: { lower_back: 4 }, painSeverity: 4,
    }));
  });
  it("saves one preference without inventing missing values or changing unlocalized pain", async () => {
    render(<ProfileAutosaveEditor profile={{ ...profile, painAreas: [], weeklyHours: undefined }}
      onWeightSaved={vi.fn()} />);
    fireEvent.click(screen.getByText("riding"));
    await tick();
    expect(state.save).toHaveBeenCalledExactlyOnceWith("profiles/mutations:updatePreferences", {
      experienceLevel: "advanced",
    });
    fireEvent.click(screen.getByText("pain"));
    await tick();
    expect(state.save).toHaveBeenLastCalledWith("profiles/mutations:updateComfort", expect.objectContaining({
      painAreaSeverities: { lower_back: 4 }, painSeverity: 4,
    }));
  });
  it("blocks invalid measurements without losing the entered value", async () => {
    render(<ProfileAutosaveEditor profile={profile} onWeightSaved={vi.fn()} />);
    change("heightCm", 999);
    await tick();
    expect(state.save).not.toHaveBeenCalled();
    expect(screen.getByTestId("body").textContent).toBe("Controleer je invoer voordat je verdergaat.");
    expect((screen.getByLabelText("heightCm") as HTMLInputElement).value).toBe("999");
  });
  it("flushes a pending edit on unmount", async () => {
    const view = render(<ProfileAutosaveEditor profile={profile} onWeightSaved={vi.fn()} />);
    change("heightCm", 181);
    view.unmount();
    await act(async () => {});
    expect(state.save).toHaveBeenCalledWith("profiles/mutations:updateMeasurements",
      { heightCm: 181 });
  });
  it("flushes on pagehide and only prompts for pressure recalculation after the weight is saved", async () => {
    const weightSaved = vi.fn();
    render(<ProfileAutosaveEditor profile={profile} onWeightSaved={weightSaved} />);
    change("weightKg", 74);
    expect(weightSaved).not.toHaveBeenCalled();
    await act(async () => { window.dispatchEvent(new Event("pagehide")); });
    expect(weightSaved).toHaveBeenCalledExactlyOnceWith(74);
    change("heightCm", 180);
    await tick();
    expect(weightSaved).toHaveBeenCalledTimes(1);
  });
  it("leaves unedited server-valid legacy measurements alone when saving another field", async () => {
    const view = render(<ProfileAutosaveEditor profile={{ ...profile, heightCm: 220 }} onWeightSaved={vi.fn()} />);
    view.rerender(<ProfileAutosaveEditor profile={{ ...profile, heightCm: 220, inseamCm: 100 }}
      onWeightSaved={vi.fn()} />);
    change("weightKg", 90);
    await tick();
    expect(state.save).toHaveBeenCalledExactlyOnceWith("profiles/mutations:updateMeasurements", { weightKg: 90 });
  });
});
