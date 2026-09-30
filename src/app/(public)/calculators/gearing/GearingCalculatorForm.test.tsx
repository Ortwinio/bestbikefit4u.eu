// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GearingCalculatorForm } from "./GearingCalculatorForm";
const save = vi.hoisted(() => vi.fn().mockResolvedValue(null));
vi.mock("convex/react", () => ({ useMutation: () => save }));
afterEach(() => {
  cleanup();
  save.mockClear();
});

describe("gearing sliders and live result", () => {
  it("uses the real public gear calculation and native keyboard limits", () => {
    render(<GearingCalculatorForm isNl />);
    expect(screen.getByRole("region", { name: "Voorbeeldfiets · Lichtste verhouding" })).toBeTruthy();
    const ring = screen.getByRole("slider", { name: "Buitenblad" });
    fireEvent.keyDown(ring, { key: "End" });
    expect(ring.getAttribute("aria-valuetext")).toBe("70 T");
    fireEvent.click(screen.getByRole("button", { name: "1×" }));
    expect(screen.queryByRole("slider", { name: "Binnenblad" })).toBeNull();
    expect(screen.getByTestId("gearing-chainring").getAttribute("r")).toBe("70");
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(save).toHaveBeenCalled();
  });
  it("exposes impossible ordering as an error instead of presenting stale results", () => {
    render(<GearingCalculatorForm isNl={false} />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Inner chainring" }), { key: "End" });
    expect(screen.getByRole("alert").textContent).toContain("Check your input");
    expect(screen.getByText("Choose valid sizes to compare your gearing.")).toBeTruthy();
    expect(screen.queryByTestId("gearing-chainring")).toBeNull();
  });
  it("updates cassette and circumference presets, marking manual edits as custom", () => {
    render(<GearingCalculatorForm isNl />);
    fireEvent.click(screen.getByRole("button", { name: "10-51" }));
    expect(screen.getByRole("slider", { name: "Grootste krans" }).getAttribute("aria-valuetext")).toBe(
      "51 T",
    );
    fireEvent.keyDown(screen.getByRole("slider", { name: "Grootste krans" }), { key: "ArrowLeft" });
    expect(screen.getAllByRole("button", { name: "Eigen maten" })[0].getAttribute("aria-pressed")).toBe(
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "MTB 29 × 2,3" }));
    expect(screen.getByRole("slider", { name: "Wielomtrek" }).getAttribute("aria-valuetext")).toBe(
      "2.282 mm",
    );
  });
});
