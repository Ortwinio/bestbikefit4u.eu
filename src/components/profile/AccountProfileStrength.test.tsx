/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AccountProfileStrength } from "./AccountProfileStrength";

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("convex/react", () => ({ useQuery: query }));
afterEach(() => { cleanup(); query.mockReset(); });

it("does not present a fake zero while the live query loads", () => {
  render(<AccountProfileStrength locale="nl" placement="mobile" />);
  expect(screen.getByRole("status").textContent).toBe("Profielscore laden…");
  expect(screen.queryByRole("meter")).toBeNull();
});

it.each(["nl", "en"] as const)("links %s scores to the localized profile", locale => {
  query.mockReturnValue({ profile: { inseamCm: 81 }, observations: [] });
  render(<AccountProfileStrength locale={locale} placement="sidebar" />);
  expect(screen.getAllByRole("meter").map(meter => meter.getAttribute("aria-valuenow"))).toEqual(["20", "17"]);
  expect(screen.getByRole("link").getAttribute("href")).toBe(`/${locale}/profile`);
});

it("updates when saved observations change without navigation", () => {
  query.mockReturnValue({ profile: { inseamCm: 81 }, observations: [] });
  const view = render(<AccountProfileStrength locale="nl" placement="mobile" />);
  query.mockReturnValue({ profile: { inseamCm: 81, heightCm: 180 }, observations: [] });
  view.rerender(<AccountProfileStrength locale="nl" placement="mobile" />);
  expect(screen.getAllByRole("meter")[0].getAttribute("aria-valuenow")).toBe("30");
});

it("renders a genuine empty profile as zero after loading", () => {
  query.mockReturnValue({ profile: null, observations: [] });
  render(<AccountProfileStrength locale="en" placement="mobile" />);
  expect(screen.getAllByRole("meter").map(meter => meter.getAttribute("aria-valuenow"))).toEqual(["0", "0"]);
});
