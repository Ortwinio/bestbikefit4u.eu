/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SaddleWidthCalculatorForm } from "./SaddleWidthCalculatorForm";
import { reliabilityBodyMessages } from "@/i18n/calculators/reliabilityBody";
import { reliabilityMessages } from "@/i18n/calculators/reliability";
import { readHandoff } from "@/lib/handoff/store";

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });
describe("SaddleWidthCalculatorForm reliability public dispatch", () => {
  it.each(["nl", "en"] as const)("renders two steps, one next action and honest examples in %s", locale => {
    const copy = reliabilityBodyMessages[locale];
    const { container } = render(<SaddleWidthCalculatorForm locale={locale} />);
    expect(screen.getByRole("heading", { level: 1, name: copy.pages["saddle-width"].title })).toBeTruthy();
    expect(container.querySelectorAll("[data-reliability-step]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-reliability-next-step]")).toHaveLength(1);
    expect(screen.getByText(reliabilityMessages[locale].example)).toBeTruthy();
    expect(screen.getByText(reliabilityMessages[locale].omitted)).toBeTruthy();
    expect(screen.getByRole("link", { name: reliabilityMessages[locale].save }).getAttribute("href")).toContain("handoff=1");
    expect(readHandoff().entries).toHaveLength(0);
    expect(screen.queryByRole("slider", { name: /flexibility|lenigheid|rompstabiliteit|core stability/i })).toBeNull();
    const measurement = screen.getByRole("slider", { name: copy.sitBones });
    fireEvent.keyDown(measurement, { key: "ArrowRight" });
    expect(readHandoff().entries).toEqual([expect.objectContaining({
      field: "sitBoneWidthMm", method: "measured",
    })]);
  });
  it("preserves the account calculator instead of replacing its existing controls", () => {
    const { container } = render(<SaddleWidthCalculatorForm locale="en" accountMode initialValues={{ inputMethod: "measured", sitBoneWidthMm: 132 }} />);
    expect(container.querySelector("[data-reliability-calculator]")).toBeNull();
    expect(screen.getAllByRole("slider").length).toBeGreaterThan(0);
    expect(readHandoff().entries).toHaveLength(0);
  });
});
