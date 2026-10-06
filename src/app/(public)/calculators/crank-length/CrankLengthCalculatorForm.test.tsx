/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CrankLengthCalculatorForm } from "./CrankLengthCalculatorForm";
import { reliabilityBodyMessages } from "@/i18n/calculators/reliabilityBody";
import { journeyMessages } from "@/i18n/calculators/journey";
import { reliabilityMessages } from "@/i18n/calculators/reliability";
import { readHandoff } from "@/lib/handoff/store";
import { crankLengthMessages } from "@/i18n/calculators/crankLength";
afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });
describe("CrankLengthCalculatorForm reliability public dispatch", () => {
  it.each(["nl", "en"] as const)("renders two steps, one next action and honest examples in %s", locale => {
    const copy = reliabilityBodyMessages[locale];
    const { container } = render(<CrankLengthCalculatorForm locale={locale} copy={crankLengthMessages[locale]} initialCategory="road" />);
    expect(screen.getByRole("heading", { level: 1, name: copy.pages["crank-length"].title })).toBeTruthy();
    expect(container.querySelectorAll("[data-reliability-step]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-reliability-next-step]")).toHaveLength(1);
    expect(container.querySelector('[data-usability="example"]')?.textContent).toMatch(locale === "nl" ? /Voorbeeld/ : /Example/);
    expect(screen.getByText(reliabilityMessages[locale].omitted)).toBeTruthy();
    expect(screen.getByRole("link", { name: journeyMessages[locale].reasons["crank-length"].cta }).getAttribute("href")).toContain("handoff=1");
    expect(readHandoff().entries).toHaveLength(0);
    expect(screen.queryByRole("slider", { name: /flexibility|lenigheid|rompstabiliteit|core stability/i })).toBeNull();
    const measurement = screen.getByRole("slider", { name: copy.inseam });
    fireEvent.keyDown(measurement, { key: "ArrowRight" });
    expect(readHandoff().entries).toEqual([expect.objectContaining({
      field: "inseamCm", method: "measured",
    })]);
  });
  it("preserves the account calculator instead of replacing its existing controls", () => {
    const { container } = render(<CrankLengthCalculatorForm locale="en" copy={crankLengthMessages.en} initialCategory="road" initialValues={{ inseamCm: 84, category: "road", confirmed: true }} />);
    expect(container.querySelector("[data-reliability-calculator]")).toBeNull();
    expect(screen.getAllByRole("slider").length).toBeGreaterThan(0);
    expect(readHandoff().entries).toHaveLength(0);
  });
});
