/* @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BikeFitCalculatorForm } from "./BikeFitCalculatorForm";

describe("BikeFitCalculatorForm", () => {
  it("renders dashboard-style scale sliders for the fit questions", () => {
    render(<BikeFitCalculatorForm isNl={false} />);

    expect(screen.getByRole("radiogroup", { name: "Riding goal" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Flexibility" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Core stability" })).toBeTruthy();
  });

  it("produces a result after valid measurements are entered", () => {
    render(<BikeFitCalculatorForm isNl={false} />);

    const [heightInput, inseamInput] = screen.getAllByRole("spinbutton");

    fireEvent.change(heightInput, {
      target: { value: "178" },
    });
    fireEvent.change(inseamInput, {
      target: { value: "84.5" },
    });
    fireEvent.click(screen.getAllByRole("radio")[4]);
    fireEvent.click(screen.getAllByRole("radio")[9]);

    expect(screen.getAllByText("Your first-pass fit recommendation").length).toBeGreaterThan(0);
    expect(screen.getByText("Saddle Height")).toBeTruthy();
    expect(screen.queryByText("Enter your height and inseam to unlock a first-pass fit estimate.")).toBeNull();
  });
});
