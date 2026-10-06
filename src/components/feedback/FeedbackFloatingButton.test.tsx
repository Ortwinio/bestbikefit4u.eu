/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FeedbackFloatingButton } from "./FeedbackFloatingButton";
import { FeedbackPanelProvider } from "./FeedbackPanelProvider";

const route = vi.hoisted(() => ({ pathname: "/nl/bandenspanning" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("./feedback-activity", () => ({
  trackFeedbackPanelOpen: vi.fn(),
  trackFeedbackRouteVisit: vi.fn(),
}));

afterEach(cleanup);

it.each(["Geef feedback", "Give feedback"])("keeps public mobile feedback accessible without an overlay: %s", label => {
  const onClick = vi.fn();
  render(<FeedbackFloatingButton flowOnMobile label={label} onClick={onClick} />);
  const button = screen.getByRole("button", { name: label });
  expect(button.classList.contains("relative")).toBe(true);
  expect(button.classList.contains("fixed")).toBe(false);
  expect(button.classList.contains("md:fixed")).toBe(true);
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledOnce();
});

it("preserves the existing account floating placement", () => {
  render(<FeedbackFloatingButton label="Give feedback" onClick={vi.fn()} className="bottom-24" />);
  const button = screen.getByRole("button", { name: "Give feedback" });
  expect(button.classList.contains("fixed")).toBe(true);
  expect(button.classList.contains("bottom-24")).toBe(true);
  expect(button.classList.contains("relative")).toBe(false);
});

it.each(["/nl/bandenspanning", "/en/tire-pressure-calculator"])(
  "keeps the public launcher in document flow at desktop and mobile widths: %s",
  pathname => {
    route.pathname = pathname;
    render(<FeedbackPanelProvider><main>Calculation</main></FeedbackPanelProvider>);
    const button = screen.getByRole("button");
    expect(button.classList.contains("relative")).toBe(true);
    expect(button.classList.contains("md:static")).toBe(true);
    expect(button.classList.contains("md:fixed")).toBe(false);
    expect(button.classList.contains("fixed")).toBe(false);
  }
);

it("retains the account mobile-tab clearance and desktop placement", () => {
  route.pathname = "/nl/bikes";
  render(<FeedbackPanelProvider><main>Bikes</main></FeedbackPanelProvider>);
  const button = screen.getByRole("button");
  expect(button.classList.contains("mb-[calc(92px+env(safe-area-inset-bottom))]")).toBe(true);
  expect(button.classList.contains("md:static")).toBe(true);
});
