// @vitest-environment jsdom
import { useEffect } from "react";
import type { BikeGeometryFallbackState } from "./bikeFormGeometry";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { BikeForm } from "./BikeForm";

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: "en", messages: getDashboardMessages("en") }),
}));
const geometry = vi.hoisted(() => ({ hydrate: false }));
vi.mock("./BikeGeometryLibraryFields", () => ({
  BikeGeometryLibraryFields: ({ onChange }: {
    onChange: (update: (state: BikeGeometryFallbackState) => BikeGeometryFallbackState) => void;
  }) => {
    useEffect(() => {
      if (geometry.hydrate) onChange((state) => ({ ...state, standardBrand: "Resolved brand",
        standardModel: "Resolved model", geometrySizeLabel: "56" }));
    }, [onChange]);
    return null;
  },
}));
vi.mock("./BikeFormControls", () => ({
  BikeNumberField: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number | null;
    onChange: (value: number | null) => void;
  }) => (
    <input
      aria-label={label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
    />
  ),
  BikeChoiceField: () => null,
  BikeCassetteField: () => null,
}));
const initial = {
  name: "Bike",
  bikeType: "road" as const,
  currentGeometry: { stackMm: 950, reachMm: 385 },
  currentSetup: { saddleHeightMm: 740, stemLengthMm: 90 },
};
const tick = async (ms = 800) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};
beforeEach(() => { vi.useFakeTimers(); geometry.hydrate = false; });
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
function form(save: (value: unknown) => Promise<void>, data = initial) {
  return (
    <BikeForm
      title="Settings"
      description="Autosave"
      submitLabel="Save"
      initialData={data}
      onAutosave={save}
    />
  );
}

describe("bike autosave integration", () => {
  it("does not write hydration/defaults; debounces a scoped change and ignores subscription echoes", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const view = render(form(save));
    await tick();
    expect(save).not.toHaveBeenCalled();
    const name = screen.getByRole("textbox", { name: /Bike name/i });
    fireEvent.change(name, { target: { value: "New bike" } });
    view.rerender(form(save, { ...initial, name: "Old server echo" }));
    expect((name as HTMLInputElement).value).toBe("New bike");
    await tick(799);
    expect(save).not.toHaveBeenCalled();
    await tick(1);
    expect(save).toHaveBeenCalledWith({ name: "New bike", clearFields: [] });
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });
  it("does not save canonical library identity or a missing frame size during link hydration", async () => {
    geometry.hydrate = true;
    const save = vi.fn().mockResolvedValue(undefined);
    render(<BikeForm title="Settings" description="Autosave" submitLabel="Save" onAutosave={save}
      initialData={{ ...initial, geometryRecordId: "record", brand: "Saved brand", model: "Saved model" }} />);
    await tick();
    expect(save).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox", { name: /Bike name/i }), { target: { value: "Renamed" } });
    await tick();
    expect(save).toHaveBeenCalledWith({ name: "Renamed", clearFields: [] });
  });
  it("serializes edits and sends the newest name after an in-flight save", async () => {
    let finish!: () => void;
    const save = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValue(undefined);
    render(form(save));
    const name = screen.getByRole("textbox", { name: /Bike name/i });
    fireEvent.change(name, { target: { value: "First" } });
    await tick();
    fireEvent.change(name, { target: { value: "Latest" } });
    await tick();
    expect(save).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish();
    });
    expect(save).toHaveBeenLastCalledWith({ name: "Latest", clearFields: [] });
  });
  it("clears a measurement without losing other geometry or replacing unrelated bike data", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    render(form(save));
    fireEvent.click(screen.getByRole("radio", { name: "Measurements" }));
    fireEvent.change(screen.getByRole("textbox", { name: /Stack/i }), { target: { value: "" } });
    await tick();
    const payload = save.mock.calls[0][0];
    expect(payload.currentGeometry).toMatchObject({ stackMm: undefined, reachMm: 385 });
    expect(payload.currentSetup).toBeUndefined();
    expect(payload.name).toBeUndefined();
  });
  it("keeps failed input, retries it and blocks invalid values", async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    render(form(save));
    const name = screen.getByRole("textbox", { name: /Bike name/i });
    fireEvent.change(name, { target: { value: "Keep me" } });
    await tick();
    expect((name as HTMLInputElement).value).toBe("Keep me");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await tick(0);
    expect(save).toHaveBeenCalledTimes(2);
    fireEvent.change(name, { target: { value: "" } });
    await tick();
    expect(save).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status").textContent).toContain("Enter a name");
  });
  it("flushes the pending value on blur and on unmount", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const view = render(form(save));
    const name = screen.getByRole("textbox", { name: /Bike name/i });
    fireEvent.change(name, { target: { value: "Blur" } });
    fireEvent.blur(name);
    await tick(0);
    expect(save).toHaveBeenCalledWith({ name: "Blur", clearFields: [] });
    fireEvent.change(name, { target: { value: "Leaving" } });
    view.unmount();
    await tick(0);
    expect(save).toHaveBeenLastCalledWith({ name: "Leaving", clearFields: [] });
  });
});
