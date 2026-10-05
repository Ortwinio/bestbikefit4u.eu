/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BikeFitCalculatorForm } from "./BikeFitCalculatorForm";
import { reliabilityBodyMessages } from "@/i18n/calculators/reliabilityBody";
import { reliabilityMessages } from "@/i18n/calculators/reliability";
import { readHandoff } from "@/lib/handoff/store";

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });
describe("BikeFitCalculatorForm reliability public dispatch", () => {
  it.each(["nl", "en"] as const)("renders two steps, one next action and honest examples in %s", locale => {
    const copy = reliabilityBodyMessages[locale];
    const { container } = render(<BikeFitCalculatorForm isNl={locale === "nl"} />);
    expect(screen.getByRole("heading", { level: 1, name: copy.pages["bike-fit"].title })).toBeTruthy();
    expect(container.querySelectorAll("[data-reliability-step]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-reliability-next-step]")).toHaveLength(1);
    expect(screen.getByText(reliabilityMessages[locale].example)).toBeTruthy();
    expect(screen.getByText(reliabilityMessages[locale].omitted)).toBeTruthy();
    expect(screen.getByRole("link", { name: reliabilityMessages[locale].save }).getAttribute("href")).toContain("handoff=1");
    expect(readHandoff().entries).toHaveLength(0);
    expect(screen.queryByRole("slider", { name: /flexibility|lenigheid|rompstabiliteit|core stability/i })).toBeNull();
    const measurement = screen.getByRole("slider", { name: copy.inseam });
    fireEvent.keyDown(measurement, { key: "ArrowRight" });
    expect(readHandoff().entries).toEqual([expect.objectContaining({
      field: "inseamCm", method: "measured",
    })]);
  });
  it("preserves the account calculator instead of replacing its existing controls", () => {
    const { container } = render(<BikeFitCalculatorForm isNl={false} initialValues={{ heightCm: 180, inseamCm: 84, source: "measured", category: "road", ambition: "balanced", flexibility: 3, core: 3 }} />);
    expect(container.querySelector("[data-reliability-calculator]")).toBeNull();
    expect(screen.getAllByRole("slider").length).toBeGreaterThan(0);
    expect(readHandoff().entries).toHaveLength(0);
  });
});
