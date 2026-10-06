/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { MarketingAccountLink } from "./MarketingNavigation";

const auth = vi.hoisted(() => ({ authenticated: false, signOut: vi.fn(), push: vi.fn() }));

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: auth.authenticated }),
  useMutation: () => vi.fn(),
}));
vi.mock("@convex-dev/auth/react", () => ({ useAuthActions: () => ({ signOut: auth.signOut }) }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/nl/calculators/saddle-height",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: auth.push }),
}));
vi.mock("./MarketingLogo", () => ({ MarketingLogo: () => <a href="/nl">BikeFitBoost</a> }));

const labels = {
  howItWorks: "Zo werkt het", tools: "Calculators", pricing: "Prijzen", login: "Inloggen",
  getStarted: "Start", dashboard: "Dashboard", newFitSession: "Nieuwe meting",
  bikeFitting: "Metingen", myBikes: "Mijn fietsen", profile: "Profiel", signOut: "Uitloggen",
};

beforeEach(() => {
  auth.authenticated = false;
  auth.signOut.mockReset().mockResolvedValue(undefined);
  auth.push.mockReset();
});
afterEach(cleanup);

describe("mobile header navigation", () => {
  it.each(["nl", "en"] as const)("opens all eleven calculators in two routes and closes after navigation (%s)", async (locale) => {
    render(<HeaderMobileMenu locale={locale} labels={labels} />);
    const trigger = document.querySelector('[data-usability="menu-trigger"]') as HTMLButtonElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.className).toContain("size-11");
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    const position = within(dialog).getByRole("region", { name: locale === "nl" ? "Mijn houding" : "My position" });
    const ride = within(dialog).getByRole("region", { name: locale === "nl" ? "Mijn rit" : "My ride" });
    expect(within(position).getAllByRole("link")).toHaveLength(5);
    expect(within(ride).getAllByRole("link")).toHaveLength(6);
    expect(within(ride).getAllByRole("link")[0].getAttribute("href")).toBe(
      locale === "nl" ? "/nl/bandenspanning-calculator" : "/en/tire-pressure-calculator"
    );
    expect(within(dialog).getByRole("link", { name: locale === "nl" ? "Engels" : "English" })).toBeTruthy();
    fireEvent.click(within(position).getAllByRole("link")[0]);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });

  it("keeps the login target visible and exposes dashboard access for authenticated riders", () => {
    const { rerender } = render(<MarketingAccountLink locale="nl" loginLabel="Inloggen" dashboardLabel="Dashboard" />);
    expect(screen.getByRole("link", { name: "Inloggen" }).getAttribute("href")).toBe("/nl/login");
    expect(screen.getByRole("link", { name: "Inloggen" }).className).toContain("min-h-11");
    auth.authenticated = true;
    rerender(<MarketingAccountLink locale="nl" loginLabel="Inloggen" dashboardLabel="Dashboard" />);
    expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/nl/dashboard");
  });
});
