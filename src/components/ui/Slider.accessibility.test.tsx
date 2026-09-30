// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Slider } from "./Slider";

afterEach(cleanup);

describe("Slider accessibility", () => {
  it("keeps custom value text on the native range input rather than the group wrapper", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider
        label="Inseam"
        value={84}
        min={55}
        max={105}
        required
        aria-valuetext="84 centimetres"
        onChange={onChange}
      />,
    );
    const input = screen.getByRole("slider", { name: "Inseam" });
    const group = container.querySelector('[data-slot="slider"]');
    expect(input.getAttribute("aria-valuetext")).toBe("84 centimetres");
    expect(group?.hasAttribute("aria-valuetext")).toBe(false);
    expect(container.querySelector("[aria-required]")).toBeNull();
    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(85);
  });
});
