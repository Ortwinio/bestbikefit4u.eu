/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FrameSizeCalculatorForm } from "./FrameSizeCalculatorForm";
import { reliabilityBodyMessages } from "@/i18n/calculators/reliabilityBody";
import { reliabilityMessages } from "@/i18n/calculators/reliability";
import { readHandoff } from "@/lib/handoff/store";

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });
describe("FrameSizeCalculatorForm reliability public dispatch", () => {
  it.each(["nl", "en"] as const)("renders two steps, one next action and honest examples in %s", locale => {
    const copy = reliabilityBodyMessages[locale];
    const { container } = render(<FrameSizeCalculatorForm locale={locale} />);
    expect(screen.getByRole("heading", { level: 1, name: copy.pages["frame-size"].title })).toBeTruthy();
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
    const { container } = render(<FrameSizeCalculatorForm locale="en" initialValues={{ heightCm: 180, inseamCm: 84, category: "road", heightConfirmed: true, inseamConfirmed: true }} />);
    expect(container.querySelector("[data-reliability-calculator]")).toBeNull();
    expect(screen.getAllByRole("slider").length).toBeGreaterThan(0);
    expect(readHandoff().entries).toHaveLength(0);
  });
});
