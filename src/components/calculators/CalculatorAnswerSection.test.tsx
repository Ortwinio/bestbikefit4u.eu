/* @vitest-environment jsdom */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CalculatorAnswerSection, ShortAnswer } from "./CalculatorAnswerSection";
import { getFitAnswer } from "@/lib/seo/calculatorAnswers/fit";
import { getEquipmentAnswer } from "@/lib/seo/calculatorAnswers/equipment";
import { getPerformanceAnswer } from "@/lib/seo/calculatorAnswers/performance";

describe("server-rendered calculator explanations", () => {
  it.each(["nl", "en"] as const)("keeps all eleven calculators' text in closed HTML in %s", locale => {
    const answers = [
      ...(["bike-fit", "saddle-height", "frame-size", "crank-length"] as const).map(id => ({ id, content: getFitAnswer(id, locale) })),
      ...(["saddle-width", "gearing", "tire-pressure"] as const).map(id => ({ id, content: getEquipmentAnswer(id, locale) })),
      ...(["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"] as const).map(id => ({ id, content: getPerformanceAnswer(id, locale) })),
    ];
    for (const { id, content } of answers) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<CalculatorAnswerSection id={id} locale={locale} content={content} />);
      expect(root.querySelector("details[open]")).toBeNull();
      expect(Array.from(root.querySelectorAll("details")).some(details => details.textContent?.includes(content.method))).toBe(true);
      expect(root.textContent).toContain(content.limits);
      for (const mistake of content.mistakes) expect(root.textContent).toContain(mistake);
      for (const row of [...content.example.inputs, ...content.example.results]) expect(root.textContent).toContain(row.value);
      const answer = root.querySelector('[data-usability="short-answer"]');
      expect(answer?.closest("details")).toBeNull();
      expect(Array.from(new Intl.Segmenter(locale, { granularity: "sentence" }).segment(answer!.textContent!)).length).toBeLessThanOrEqual(2);
      if (["saddle-height", "tire-pressure", "fuel-hydration"].includes(id)) {
        const safety = root.querySelector('[data-usability="safety"]');
        expect(safety?.textContent).toContain(content.limits);
        expect(safety?.closest("details")).toBeNull();
      }
    }
  });

  it("preserves additional sentences outside the short-answer marker", () => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<ShortAnswer locale="en" text="First answer. Second answer. Extra context." />);
    expect(root.querySelector('[data-usability="short-answer"]')?.textContent).toBe("First answer. Second answer. ");
    expect(root.querySelector("details:not([open])")?.textContent).toContain("Extra context.");
  });
});
