/* @vitest-environment jsdom */
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PaidBoundary } from "./PaidBoundary";
import { paidPrice, type PaidBoundaryKind } from "@/i18n/account/usabilityPaid";

afterEach(cleanup);
describe("natural paid boundaries", () => {
  it.each(["nl", "en"] as const)("renders all real boundaries with current prices in %s", locale => {
    for (const boundary of ["second-bike", "profile-score", "step-plan", "compare", "report", "history"] as PaidBoundaryKind[]) {
      const { container, unmount } = render(<PaidBoundary locale={locale} boundary={boundary} bikeId="bike-1" />);
      const annual = ["second-bike", "compare", "history"].includes(boundary);
      expect(screen.getByText(paidPrice(locale, annual ? "annual" : "single"), { exact: true, normalizer: text => text })).toBeTruthy();
      const link = screen.getAllByRole("link")[0];
      const url = new URL(link.getAttribute("href")!, "https://bikefitboost.com");
      expect(url.pathname).toBe(`/${locale}/checkout`);
      expect(url.searchParams.get("product")).toBe(annual ? "annual" : "single");
      expect(url.searchParams.get("bikeId")).toBe(annual ? null : "bike-1");
      expect(container.querySelector(`[data-boundary="${boundary}"]`)).toBeTruthy();
      expect(container.querySelector('[role="dialog"]')).toBeNull();
      unmount();
    }
  });
  it("uses distinct visual forms without inventing example fit values", () => {
    const { container } = render(<><PaidBoundary locale="nl" boundary="step-plan" />
      <PaidBoundary locale="nl" boundary="compare" /></>);
    expect(container.querySelector('[data-presentation="ladder"]')).toBeTruthy();
    expect(container.querySelector('[data-presentation="compare-strip"]')).toBeTruthy();
    expect(container.textContent).not.toMatch(/754|±13|±49/);
  });
});

it("gives the actual report step preview its own boundary and current price", () => {
  const { container } = render(<PaidBoundary locale="en" boundary="report" />);
  const plan = container.querySelector('[data-boundary="step-plan"]');
  expect(plan?.textContent).toContain("adjustment order");
  expect(plan?.textContent).toContain(paidPrice("en", "single"));
  expect(plan?.querySelector("ol")?.children).toHaveLength(3);
});
