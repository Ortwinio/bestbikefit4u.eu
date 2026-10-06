// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PressureDisplay } from "./PressureDisplay";

describe("PressureDisplay CSP integration", () => {
  it("renders repeated pressure pairs without adding unnonced style elements", () => {
    const { container } = render(<>
      <PressureDisplay frontBar={5.2} rearBar={5.6} locale="nl" />
      <PressureDisplay frontBar={4.9} rearBar={5.2} locale="en" compact />
    </>);
    expect(container.querySelectorAll("style")).toHaveLength(0);
    expect(container.querySelectorAll('[data-component="PressureDisplay"]')).toHaveLength(2);
    expect(container.querySelectorAll(".pressure-wheel-front")).toHaveLength(2);
    expect(container.querySelectorAll(".pressure-wheel-rear")).toHaveLength(2);
    expect(container.textContent).toContain("5,2");
    expect(container.textContent).toContain("psi");
  });
});
