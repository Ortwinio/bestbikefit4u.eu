/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import DashboardGearingPage from "./page";

vi.mock("./GearingCalculatorForm", () => ({
  GearingCalculatorForm: () => <h1>Shared gearing form</h1>,
}));
afterEach(cleanup);
it("renders one shared form without a duplicate page header", () => {
  render(<DashboardGearingPage />);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByText("Shared gearing form")).toBeTruthy();
});
