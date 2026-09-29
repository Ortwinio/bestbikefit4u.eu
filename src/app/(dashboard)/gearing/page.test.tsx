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

    expect(screen.getByText("Can you climb it?")).toBeTruthy();
    expect(screen.getByText("Choose your bike and adjust the numbers to match your ride.")).toBeTruthy();
    expect(screen.getByText("Dashboard gearing form")).toBeTruthy();
  });

  it("renders the dashboard gearing shell in Dutch", () => {
    locale = "nl";
    render(<DashboardGearingPage />);

    expect(screen.getByText("Kom jij die klim op?")).toBeTruthy();
    expect(screen.getByText("Kies je fiets en pas de waarden aan je rit aan.")).toBeTruthy();
    expect(screen.getByText("Dashboard gearing form")).toBeTruthy();
  });
});
