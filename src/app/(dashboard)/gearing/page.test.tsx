/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardGearingPage from "./page";

let locale: "en" | "nl" = "en";

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({
    locale,
    messages: {},
  }),
}));

vi.mock("./GearingCalculatorForm", () => ({
  GearingCalculatorForm: () => <div>Dashboard gearing form</div>,
}));

beforeEach(() => {
  locale = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("dashboard gearing page", () => {
  it("renders the dashboard gearing shell in English", () => {
    render(<DashboardGearingPage />);

    expect(screen.getByText("Gearing Calculator")).toBeTruthy();
    expect(
      screen.getByText(
        "See what your current or planned gearing means for a real climb, with bike prefill and a clear recommendation for the next step."
      )
    ).toBeTruthy();
    expect(screen.getByText("Dashboard gearing form")).toBeTruthy();
  });

  it("renders the dashboard gearing shell in Dutch", () => {
    locale = "nl";
    render(<DashboardGearingPage />);

    expect(screen.getByText("Versnellingscalculator")).toBeTruthy();
    expect(
      screen.getByText(
        "Bekijk wat je huidige of geplande gearing betekent voor een echte klim, met bike-prefill en een duidelijk advies voor de volgende stap."
      )
    ).toBeTruthy();
    expect(screen.getByText("Dashboard gearing form")).toBeTruthy();
  });
});
