/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DashboardProfileStrength } from "./DashboardProfileStrength";

const mocks = vi.hoisted(() => ({ query: vi.fn(), authenticated: true }));
vi.mock("convex/react", () => ({ useQuery: (...args: unknown[]) => mocks.query(...args),
  useConvexAuth: () => ({ isAuthenticated: mocks.authenticated }) }));
afterEach(cleanup);
beforeEach(() => { mocks.authenticated = true; mocks.query.mockReturnValue({ profile: null, observations: [] }); });

it.each(["nl", "en"] as const)("renders real empty scores and localized next-step links in %s", locale => {
  render(<DashboardProfileStrength locale={locale} />);
  expect(screen.getAllByRole("meter").map(meter => meter.getAttribute("aria-valuenow"))).toEqual(["0", "0"]);
  expect(screen.getByText(locale === "nl" ? "Binnenbeenlengte" : "Inseam")).toBeTruthy();
  expect(screen.getByRole("link", { name: locale === "nl" ? "Bekijk alle gegevens" : "View all details" })
    .getAttribute("href")).toBe(`/${locale}/profile`);
});

it("updates when conservative provenance changes without replacing existing profile scores", () => {
  mocks.query.mockReturnValue({ profile: { inseamCm: 81 }, observations: [{ field: "inseamCm", value: 81, kind: "derived" }] });
  const view = render(<DashboardProfileStrength locale="nl" />);
  expect(screen.getAllByRole("meter").map(meter => meter.getAttribute("aria-valuenow"))).toEqual(["20", "6"]);
  mocks.query.mockReturnValue({ profile: { inseamCm: 81 }, observations: [{ field: "inseamCm", value: 81, kind: "measured" }] });
  view.rerender(<DashboardProfileStrength locale="nl" />);
  expect(screen.getAllByRole("meter")[1].getAttribute("aria-valuenow")).toBe("17");
});

it("does not display zero while loading or query private data while logged out", () => {
  mocks.query.mockReturnValue(undefined);
  const view = render(<DashboardProfileStrength locale="nl" />);
  expect(screen.queryByRole("meter")).toBeNull();
  expect(screen.getByRole("status").textContent).toContain("laden");
  mocks.authenticated = false;
  view.rerender(<DashboardProfileStrength locale="nl" />);
  expect(view.container.textContent).toBe("");
  expect(mocks.query.mock.lastCall?.[1]).toBe("skip");
});
