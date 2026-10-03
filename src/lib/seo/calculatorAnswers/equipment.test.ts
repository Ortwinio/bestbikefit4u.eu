import { describe, expect, it } from "vitest";
import { calculateSaddleWidth } from "@/lib/saddle-width-engine";
import { calculateBasicPressure } from "@/lib/pressure-engine";
import { calculateGearing } from "@/app/(public)/calculators/gearing/gearing-engine";
import { getPressureCalculatorFaqContent } from "@/components/features/pressure/PressureCalculatorFaq";
import { buildFaqPageSchema } from "@/lib/seo/jsonLd";
import { equipmentAnswerMessages } from "@/i18n/calculators/answersEquipment";
import { equipmentExamples, getEquipmentAnswer } from "./equipment";

describe("equipment calculator answers", () => {
  it.each(["nl", "en"] as const)("uses actual engine results and exposes all assumptions in %s", locale => {
    const format = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
    const saddle = calculateSaddleWidth(equipmentExamples.saddle);
    const gearing = calculateGearing(equipmentExamples.gearing, locale === "nl");
    const pressure = calculateBasicPressure(equipmentExamples.pressure);
    expect(getEquipmentAnswer("saddle-width", locale).example.results.map(row => row.value)).toEqual([
      `${format(saddle.finalRecommendedWidthMm)} mm`,
      `${format(saddle.widthRangeMinMm)}–${format(saddle.widthRangeMaxMm)} mm`,
    ]);
    expect(getEquipmentAnswer("gearing", locale).example.results.map(row => row.value)).toEqual([
      format(gearing.easiest.ratio), `${format(gearing.easiest.developmentMeters)} m`,
      `${format(gearing.easiest.speedKmh)} ${locale === "nl" ? "km/u" : "km/h"}`,
    ]);
    expect(getEquipmentAnswer("tire-pressure", locale).example.results.map(row => row.value)).toEqual([
      `${format(pressure.frontBar)} bar`, `${format(pressure.rearBar)} bar`,
    ]);
    for (const tool of ["saddle-width", "gearing", "tire-pressure"] as const) {
      const content = getEquipmentAnswer(tool, locale);
      expect(JSON.stringify(content)).not.toMatch(/\{(?:width|range|ratio|speed|front|rear|chainrings|cassette|cadence)\}/);
      expect(content.mistakes.length).toBeGreaterThanOrEqual(3);
      expect(content.example.inputs.every(row => row.label && row.value)).toBe(true);
    }
    expect(getEquipmentAnswer("tire-pressure", locale).example.inputs).toHaveLength(8);
    expect(getEquipmentAnswer("gearing", locale).example.inputs).toHaveLength(8);
    expect(getEquipmentAnswer("saddle-width", locale).example.inputs).toHaveLength(4);
  });
  it("keeps Dutch explanations Dutch and describes the public model limitations", () => {
    expect(getEquipmentAnswer("saddle-width", "nl").answer).toContain("zitbotbreedte");
    expect(getEquipmentAnswer("gearing", "nl").limits).toContain("geen voorspelling");
    expect(getEquipmentAnswer("tire-pressure", "nl").method).toContain("40%");
    expect(getEquipmentAnswer("tire-pressure", "nl").limits).toContain("velglimiet");
    for (const key of ["saddle", "gearing", "pressure"] as const) {
      expect(Object.keys(equipmentAnswerMessages.nl[key])).toEqual(Object.keys(equipmentAnswerMessages.en[key]));
    }
  });
  it.each(["nl", "en"] as const)("uses the visible pressure FAQ content verbatim in %s schema", locale => {
    const visible = getPressureCalculatorFaqContent(locale).items;
    const schema = buildFaqPageSchema(visible);
    expect(schema.mainEntity).toEqual(visible.map(item => ({
      "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a },
    })));
  });
});
