/* @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SaddleWidthCalculatorForm } from "./SaddleWidthCalculatorForm";

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}));

describe("SaddleWidthCalculatorForm", () => {
  it("renders measured mode by default and computes a result", () => {
    render(<SaddleWidthCalculatorForm isNl={false} />);

    fireEvent.change(screen.getByLabelText("Sit-bone width"), {
      target: { value: "130" },
    });

    expect(screen.getByText("Your saddle-width starting point")).toBeTruthy();
    expect(screen.getByText("Target width")).toBeTruthy();
    expect(screen.getByText("Saddle family")).toBeTruthy();
  });

  it("switches to estimated mode and clears the measured field", () => {
    render(<SaddleWidthCalculatorForm isNl={false} />);

    const measuredInput = screen.getAllByLabelText("Sit-bone width")[0] as HTMLInputElement;
    fireEvent.change(measuredInput, { target: { value: "130" } });
    fireEvent.click(screen.getAllByText("I don't have this measurement")[0]);

    expect(screen.getByLabelText("Height")).toBeTruthy();
    expect(screen.getByLabelText("Hip circumference")).toBeTruthy();
  });
});
