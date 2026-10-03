// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { CreateBikeForm } from "./CreateBikeForm";

const state = vi.hoisted(() => ({ locale: "nl" as "nl" | "en", save: vi.fn().mockResolvedValue("bike1") }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));
vi.mock("convex/react", () => ({ useMutation: () => state.save }));
vi.mock("@/components/bikes/BikeGeometryLibraryFields", () => ({ BikeGeometryLibraryFields: () => null }));
afterEach(() => { cleanup(); state.save.mockClear(); });

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


it.each(["nl", "en"] as const)("creates a bike without invented optional values in %s", async locale => {
  state.locale=locale;
  render(<CreateBikeForm />);
  const messages=getDashboardMessages(locale);
  fireEvent.change(screen.getByRole("textbox",{name:messages.bikeForm.fields.name.label}),{target:{value:"My bike"}});
  // The required bike type is explicitly selected; optional defaults remain unset.
  fireEvent.click(screen.getByText(locale==="nl"?"Racefiets":"Road Bike",{exact:true}));
  fireEvent.click(screen.getByRole("button",{name:messages.bikeForm.actions.save}));
  await waitFor(()=>expect(state.save).toHaveBeenCalledOnce());
  const args=state.save.mock.calls[0][0];
  expect(args.bikeType).toBe("road");
  for(const field of ["gearing","ridingStyle","primaryGoal","saddleModel","saddleWidthMm","currentSetup"])
    expect(args[field]).toBeUndefined();
});
