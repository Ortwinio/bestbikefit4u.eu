/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { calculateSaddleHeight } from "../../../convex/lib/fitAlgorithm/calculations";
import { homeMarketing } from "@/i18n/marketing/home";
import { SaddleHeightTeaser, saddleTeaserEstimate } from "./SaddleHeightTeaser";

afterEach(cleanup);

describe("home saddle-height teaser", () => {
  it("matches the actual road/balanced calculation for every allowed slider value", () => {
    for (let inseam = 55; inseam <= 105; inseam += 0.5) {
      const actual = calculateSaddleHeight({
        inputs: { category: "road", ambition: "balanced", heightMm: 1800, inseamMm: inseam * 10, flexibilityScore: 5, coreScore: 5 },
        flexIndex: 0,
        coreIndex: 0,
      });
      expect(saddleTeaserEstimate(inseam)).toEqual({ height: actual.height, min: actual.range.min, max: actual.range.max });
    }
  });

  it("updates the estimate and preserves a localized refinement link", () => {
    render(<SaddleHeightTeaser locale="nl" />);
    const slider = screen.getByRole("slider", { name: "Binnenbeenlengte" });
    expect(screen.getByRole("status", { name: "Startpunt voor je zadel" }).textContent).toBe("742 mm");
    fireEvent.change(slider, { target: { value: "90.5" } });
    expect(screen.getByRole("status", { name: "Startpunt voor je zadel" }).textContent).toBe("799 mm");
    expect(slider.getAttribute("aria-valuetext")).toBe("90,5 cm");
    expect(screen.getByRole("link").getAttribute("href")).toBe("/nl/calculators/saddle-height");
  });

  it("renders the English labels and identical dictionary structure", () => {
    render(<SaddleHeightTeaser locale="en" />);
    expect(screen.getByRole("slider", { name: "Inseam" })).toBeTruthy();
    expect(Object.keys(homeMarketing.en)).toEqual(Object.keys(homeMarketing.nl));
    expect(homeMarketing.en.tools).toHaveLength(homeMarketing.nl.tools.length);
    expect(screen.getByRole("link").getAttribute("href")).toBe("/en/calculators/saddle-height");
  });
});
