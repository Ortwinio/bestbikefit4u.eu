/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NumberSlider, ReadOnlyNumberSlider } from "./NumberSlider";

afterEach(cleanup);

describe("profile measurement slider", () => {
  it("keeps missing optional measurements unset until the rider interacts", () => {
    const onChange = vi.fn();
    render(<NumberSlider label="Arm length" min={45} max={75} value={undefined} unit="cm" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe("— cm");
  });

  it("marks keyboard edits as manual before forwarding the numeric value", () => {
    const calls: (string | number)[] = [];
    render(<NumberSlider label="Inseam" min={55} max={105} value={81} unit="cm" onUserInteract={() => calls.push("manual")} onChange={(value) => calls.push(value)} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(calls).toEqual(["manual", 82]);
  });

  it("retains fractional steps and associates validation errors", () => {
    const onChange = vi.fn();
    render(<NumberSlider label="Body weight" min={30} max={200} step={0.5} value={68} unit="kg" error="Check weight" onChange={onChange} />);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-invalid")).toBe("true");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(68.5);
    expect(screen.getByText("Check weight")).toBeTruthy();
  });

  it("shows a missing saved measurement without an interactive control", () => {
    render(<ReadOnlyNumberSlider label="Arm length" min={45} max={75} value={null} unit="cm" />);
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.queryByRole("slider")).toBeNull();
  });
});
