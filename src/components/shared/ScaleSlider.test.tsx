/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReadOnlyScaleSlider, ScaleSliderQuestion } from "./ScaleSlider";

const OPTIONS = [
  { key: "1", label: "Very Limited" },
  { key: "2", label: "Limited" },
  { key: "3", label: "Average" },
  { key: "4", label: "Good" },
  { key: "5", label: "Excellent" },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ScaleSliderQuestion", () => {
  it("renders the question, description, and selected badge", () => {
    render(
      <ScaleSliderQuestion
        label="Flexibility"
        description="Choose the option you can sustain."
        options={OPTIONS}
        value="3"
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Flexibility")).toBeTruthy();
    expect(screen.getByText("Choose the option you can sustain.")).toBeTruthy();
    expect(screen.getAllByText("Average").length).toBeGreaterThan(0);
    expect(screen.getByRole("radiogroup", { name: "Flexibility" })).toBeTruthy();
  });

  it("updates when a point is clicked", () => {
    const onChange = vi.fn();

    render(
      <ScaleSliderQuestion
        label="Core stability"
        options={OPTIONS}
        value="2"
        onChange={onChange}
      />
    );

    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[3]);

    expect(onChange).toHaveBeenCalledWith("4");
  });

  it("updates when a label is clicked", () => {
    const onChange = vi.fn();

    render(
      <ScaleSliderQuestion
        label="Riding goal"
        options={OPTIONS}
        value="2"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByText("Excellent"));

    expect(onChange).toHaveBeenCalledWith("5");
  });
});

describe("ReadOnlyScaleSlider", () => {
  it("renders the selected value in read-only mode", () => {
    render(<ReadOnlyScaleSlider label="Flexibility" options={OPTIONS} value="4" />);

    expect(screen.getByText("Flexibility")).toBeTruthy();
    expect(screen.getAllByText("Good").length).toBeGreaterThan(0);
  });
});
