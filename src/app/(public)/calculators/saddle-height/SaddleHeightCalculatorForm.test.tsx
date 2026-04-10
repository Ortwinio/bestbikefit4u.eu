/* @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SaddleHeightCalculatorForm } from "./SaddleHeightCalculatorForm";

describe("SaddleHeightCalculatorForm", () => {
  it("renders dashboard-style scale sliders for riding goal, flexibility, and core", () => {
    render(<SaddleHeightCalculatorForm isNl={false} />);

    expect(screen.getByRole("radiogroup", { name: "Riding goal" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Flexibility" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Core stability" })).toBeTruthy();
  });

  it("shows a baseline recommendation after valid inseam input", () => {
    render(<SaddleHeightCalculatorForm isNl={false} />);

    const [inseamInput] = screen.getAllByRole("spinbutton");

    fireEvent.change(inseamInput, {
      target: { value: "84.5" },
    });
    fireEvent.click(screen.getAllByRole("radio")[4]);
    fireEvent.click(screen.getAllByRole("radio")[9]);

    expect(screen.getAllByText("Your baseline").length).toBeGreaterThan(0);
    expect(screen.getByText("Recommended saddle height")).toBeTruthy();
    expect(screen.getAllByText("High confidence").length).toBeGreaterThan(0);
    expect(screen.getByText("Why this result changed")).toBeTruthy();
    expect(screen.getByText("Secondary modifiers")).toBeTruthy();
  });
});
