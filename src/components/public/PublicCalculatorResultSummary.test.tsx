/* @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPublicCalculatorResultEnvelope } from "@/lib/publicCalculatorLogic";
import { PublicCalculatorResultSummary } from "./PublicCalculatorResultSummary";

describe("PublicCalculatorResultSummary", () => {
  it("renders the standardized result explanation sections", () => {
    const result = createPublicCalculatorResultEnvelope({
      calculatorKey: "saddle-height",
      recommended: { saddleHeightMm: 745 },
      confidence: {
        level: "medium",
        score: 64,
        reasons: ["measured inseam", "bike category selected"],
      },
      issues: [
        {
          code: "inseam_height_ratio_low",
          field: "baseline",
          severity: "warning",
          message: "Recheck the measurement.",
        },
      ],
      primaryDrivers: ["Inseam and category"],
      secondaryModifiers: ["Riding goal and flexibility shift the safe band."],
      notCovered: ["Cleat stack and asymmetry."],
      nextAction: "Validate this over two rides.",
    });

    render(
      <PublicCalculatorResultSummary
        result={result}
        extraNotes={["Keep changes small at first."]}
      />
    );

    expect(screen.getByText("Why this result changed")).toBeTruthy();
    expect(screen.getByText("Primary drivers")).toBeTruthy();
    expect(screen.getByText("Secondary modifiers")).toBeTruthy();
    expect(screen.getByText("Not covered here")).toBeTruthy();
    expect(screen.getByText("Validate next")).toBeTruthy();
    expect(screen.getByText("Validation notes")).toBeTruthy();
    expect(screen.getByText("Validate this over two rides.")).toBeTruthy();
    expect(screen.getByText("Keep changes small at first.")).toBeTruthy();
  });
});
