/* @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FrameSizeCalculatorForm } from "./FrameSizeCalculatorForm";

describe("FrameSizeCalculatorForm", () => {
  it("shows a confidence state and result after valid measurements are entered", () => {
    render(<FrameSizeCalculatorForm isNl={false} />);

    expect(screen.getAllByText("Lower confidence").length).toBeGreaterThan(0);

    const [heightInput, inseamInput] = screen.getAllByRole("spinbutton");
    fireEvent.change(heightInput, {
      target: { value: "178" },
    });
    fireEvent.change(inseamInput, {
      target: { value: "84.5" },
    });

    expect(screen.getAllByText("Your shortlist baseline").length).toBeGreaterThan(0);
    expect(screen.getByText("Estimated frame size")).toBeTruthy();
    expect(screen.getAllByText("Medium confidence").length).toBeGreaterThan(0);
    expect(screen.getByText("Why this result changed")).toBeTruthy();
    expect(screen.getByText("Not covered here")).toBeTruthy();
  });
});
