/* @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createPublicCalculatorResultEnvelope } from "@/lib/publicCalculatorLogic";
import { PressureResultCard } from "./PressureResultCard";

describe("PressureResultCard", () => {
  it("renders the shared explanation contract alongside the pressure result", () => {
    render(
      <PressureResultCard
        result={{
          frontBar: 4.8,
          rearBar: 5.1,
          frontPsi: 70,
          rearPsi: 74,
          warnings: ["front_rear_pressure_mismatch"],
          explanation: "Recommended pressure for a 28mm tubeless setup on average asphalt.",
        }}
        labels={{
          front: "Front",
          rear: "Rear",
          bar: "bar",
          psi: "psi",
          explanation: "Pressure recommendation",
          warningsTitle: "Warnings",
          disclaimer: "Always validate on the bike.",
          warningMessages: {
            max_rim_pressure_exceeded: "Max rim pressure exceeded.",
            hookless_limit_exceeded: "Hookless limit exceeded.",
            pressure_too_low_for_setup: "Pressure too low for the setup.",
            front_rear_pressure_mismatch: "Front and rear pressure drift apart.",
            inner_tube_pinch_flat_risk: "Pinch-flat risk is elevated.",
            road_tire_width_unusual: "Road tyre width looks unusual.",
            gravel_tire_width_unusual: "Gravel tyre width looks unusual.",
            mtb_tire_width_unusual: "MTB tyre width looks unusual.",
            hookless_max_pressure_unknown: "Hookless max pressure is unknown.",
          },
          comfortScore: "Comfort",
          gripScore: "Grip",
          efficiencyScore: "Efficiency",
        }}
        isNl={false}
        summary={createPublicCalculatorResultEnvelope({
          calculatorKey: "tire-pressure",
          recommended: { frontBar: 4.8, rearBar: 5.1 },
          confidence: { level: "medium", score: 64, reasons: [] },
          primaryDrivers: ["Rider weight", "Tyre width"],
          secondaryModifiers: ["Riding goal"],
          notCovered: ["Wet weather"],
          nextAction: "Test small 0.1 bar steps.",
        })}
        extraNotes={["Check grip first on the front tyre."]}
      />
    );

    expect(screen.getByText("Pressure recommendation")).toBeTruthy();
    expect(screen.getByText("Why this result changed")).toBeTruthy();
    expect(screen.getByText("Primary drivers")).toBeTruthy();
    expect(screen.getByText("Validation notes")).toBeTruthy();
    expect(screen.getByText("Always validate on the bike.")).toBeTruthy();
  });
});
