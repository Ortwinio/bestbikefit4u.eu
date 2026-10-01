// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { CreateBikeForm } from "./CreateBikeForm";

const state = vi.hoisted(() => ({ locale: "nl" as "nl" | "en" }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("convex/react", () => ({ useMutation: () => vi.fn() }));
vi.mock("@/components/bikes/BikeGeometryLibraryFields", () => ({ BikeGeometryLibraryFields: () => null }));
afterEach(cleanup);

describe("manual bike form language", () => {
  it("renders Dutch gearing labels and road description", () => {
    state.locale = "nl";
    render(<CreateBikeForm />);
    expect(screen.getByRole("heading", { name: "Versnellingen" })).toBeTruthy();
    for (const label of ["Buitenste kettingblad", "Binnenste kettingblad", "Wielomtrek",
      "Grootste tandwiel voor achterderailleur"]) {
      expect(screen.getByRole("textbox", { name: label })).toBeTruthy();
    }
    expect(screen.getByText("Racestuur, geometrie voor lange ritten of wedstrijden")).toBeTruthy();
  });
  it("retains English labels", () => {
    state.locale = "en";
    render(<CreateBikeForm />);
    expect(screen.getByRole("heading", { name: "Gearing" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Front chainring" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Wheel circumference" })).toBeTruthy();
  });
});
