/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { runSaddleHeightCalculation } from "@/lib/public-calculators/fitAdapters";
import { saddleHeightMessages } from "@/i18n/calculators/saddleHeight";
import { SaddleHeightCalculatorForm } from "./SaddleHeightCalculatorForm";
import styles from "./SaddleHeightCalculatorForm.module.css";

afterEach(() => { cleanup(); sessionStorage.clear(); });
const en = saddleHeightMessages.en;

function expected(inseamCm = 84, category: "road" | "city" = "road", flexibility: 1 | 3 = 3) {
  return runSaddleHeightCalculation({
    inseamCm,
    category,
    ridingGoal: "balanced",
    flexibility,
    coreStability: 3,
    inseamSource: "measured",
  });
}
function confirmInseam() {
  fireEvent.click(screen.getByRole("button", { name: `${en.measured} ${en.measuredHint}` }));
}

describe("SaddleHeightCalculatorForm", () => {
  it.each([true, false])("renders the account result and boundary values intact (NL=%s)", (isNl) => {
    const copy = saddleHeightMessages[isNl ? "nl" : "en"];
    render(<SaddleHeightCalculatorForm isNl={isNl} initialValues={{
      inseamCm: 84, source: "measured", category: "road", ambition: "balanced",
      flexibility: 4, core: 3, compare: false, current: 750, currentConfirmed: false,
    }} />);
    const hero = screen.getByRole("region", { name: copy.result });
    expect(hero.classList.contains(styles.resultHero)).toBe(true);
    expect(document.getElementById("saddle-result")?.classList.contains(styles.resultCard)).toBe(true);
    expect(hero.parentElement?.classList.contains(styles.resultGrid)).toBe(true);
    expect(hero.querySelector("dd > span:first-child")?.textContent).toBe("745");
    expect(hero.querySelector("dd > span:nth-child(2)")?.textContent).toBe("mm");
    expect(hero.querySelector("dd")?.classList.contains("font-mono")).toBe(true);
    const inseam = screen.getByRole("slider", { name: copy.inseam });
    for (const [key, inseamCm] of [["Home", 55], ["End", 105]] as const) {
      fireEvent.keyDown(inseam, { key });
      const result = runSaddleHeightCalculation({ inseamCm, category: "road",
        ridingGoal: "balanced", flexibility: 4, coreStability: 3, inseamSource: "measured" });
      expect(hero.querySelector("dd > span:first-child")?.textContent).toBe(String(result.height));
      expect(hero.querySelector("dd > span:nth-child(2)")?.textContent).toBe("mm");
    }
  });

  it("starts with an honest example and accessible sliders, not typed numeric fields", () => {
    render(<SaddleHeightCalculatorForm />);
    expect(screen.getByRole("heading", { level: 1, name: en.title })).toBeTruthy();
    expect(screen.getByText(en.example)).toBeTruthy();
    expect(screen.queryByText(en.confidenceLevels.high)).toBeNull();
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByRole("slider", { name: en.flexibility })).toBeTruthy();
    expect(screen.getByRole("slider", { name: en.core })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: en.category })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: en.goal })).toBeTruthy();
    const region = screen.getByRole("region", { name: en.exampleResult });
    expect(within(region).getByText(String(expected().height))).toBeTruthy();
  });

  it("uses the actual adapter and guardrail range after explicit confirmation and live refinement", () => {
    render(<SaddleHeightCalculatorForm />);
    const inseam = screen.getByRole("slider", { name: en.inseam });
    fireEvent.keyDown(inseam, { key: "ArrowRight" });
    expect(inseam.getAttribute("aria-valuetext")).toBe("84.5 cm");
    expect(screen.getByText(en.example)).toBeTruthy();
    confirmInseam();
    expect(screen.getByText(en.confidenceLevels.high)).toBeTruthy();
    let region = screen.getByRole("region", { name: en.result });
    expect(within(region).getByText(String(expected(84.5).height))).toBeTruthy();
    expect(
      within(region).getByText(`${expected(84.5).range.min}–${expected(84.5).range.max}`),
    ).toBeTruthy();
    const visual = screen.getByRole("img", { name: en.visualAlt });
    const initialHip = visual.querySelector("line")?.getAttribute("y1");
    fireEvent.click(screen.getByRole("radio", { name: en.categories.city }));
    fireEvent.keyDown(screen.getByRole("slider", { name: en.flexibility }), { key: "Home" });
    region = screen.getByRole("region", { name: en.result });
    expect(within(region).getByText(String(expected(84.5, "city", 1).height))).toBeTruthy();
    expect(visual.querySelector("line")?.getAttribute("y1")).not.toBe(initialHip);
  });

  it("keeps the full inseam domain and never rewrites the confirmed current saddle height", () => {
    render(<SaddleHeightCalculatorForm />);
    confirmInseam();
    fireEvent.click(screen.getByRole("button", { name: en.compareToggle }));
    const current = screen.getByRole("slider", { name: en.current });
    fireEvent.change(current, { target: { value: "755" } });
    expect(screen.getByText(en.comparePending)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: en.currentConfirm }));
    const inseam = screen.getByRole("slider", { name: en.inseam });
    expect(inseam.getAttribute("min")).toBe("55");
    expect(inseam.getAttribute("max")).toBe("105");
    expect(inseam.getAttribute("step")).toBe("0.5");
    for (const [key, value] of [
      ["Home", 55],
      ["End", 105],
    ] as const) {
      fireEvent.keyDown(inseam, { key });
      const result = expected(value);
      expect(
        within(screen.getByRole("region", { name: en.result })).getByText(String(result.height)),
      ).toBeTruthy();
      expect((current as HTMLInputElement).value).toBe("755");
      const delta = result.height - 755;
      expect(screen.getByText(`${delta > 0 ? "+" : ""}${delta}`)).toBeTruthy();
    }
    fireEvent.click(screen.getByRole("button", { name: en.compareHide }));
    fireEvent.click(screen.getByRole("button", { name: en.compareToggle }));
    expect((screen.getByRole("slider", { name: en.current }) as HTMLInputElement).value).toBe(
      "755",
    );
  });

  it("uses genuine lower confidence for estimated measurements and localized Dutch values", () => {
    const nl = saddleHeightMessages.nl;
    render(<SaddleHeightCalculatorForm isNl copy={nl} />);
    fireEvent.keyDown(screen.getByRole("slider", { name: nl.inseam }), { key: "ArrowRight" });
    expect(screen.getByRole("slider", { name: nl.inseam }).getAttribute("aria-valuetext")).toBe(
      "84,5 cm",
    );
    fireEvent.click(screen.getByRole("button", { name: `${nl.estimated} ${nl.estimatedHint}` }));
    expect(screen.getByText(nl.confidenceLevels.medium)).toBeTruthy();
    expect(screen.queryByText(en.title)).toBeNull();
    expect(screen.getByRole("link", { name: nl.accountCta }).getAttribute("href")).toBe(
      "/nl/calculators/bike-fit",
    );
    expect(screen.getByRole("link", { name: nl.stickyLink }).getAttribute("href")).toBe(
      "#saddle-result",
    );
  });
});
