/* @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrankLengthCalculatorForm } from "./CrankLengthCalculatorForm";

describe("CrankLengthCalculatorForm", () => {
  it("shows a confidence state and result after valid inseam input", () => {
    render(
      <CrankLengthCalculatorForm
        isNl={false}
        initialCategory="road"
      />
    );

    expect(screen.getAllByText("Lower confidence").length).toBeGreaterThan(0);

    const [inseamInput] = screen.getAllByRole("spinbutton");
    fireEvent.change(inseamInput, {
      target: { value: "84.5" },
    });

    expect(screen.getByText("Recommended crank length")).toBeTruthy();
    expect(screen.getAllByText("Medium confidence").length).toBeGreaterThan(0);
    expect(screen.getByText("Why this result changed")).toBeTruthy();
    expect(screen.getByText("Next best action:")).toBeTruthy();
  });
});
