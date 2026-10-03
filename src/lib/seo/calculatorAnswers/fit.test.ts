import { describe, expect, it } from "vitest";
import { answersFit } from "@/i18n/calculators/answersFit";
import {
  runBikeFitCalculation, runCrankLengthCalculation, runFrameSizeCalculation, runSaddleHeightCalculation,
} from "@/lib/public-calculators/fitAdapters";
import { FIT_ANSWER_EXAMPLE, getFitAnswer } from "./fit";

const tools = ["bike-fit", "saddle-height", "frame-size", "crank-length"] as const;
describe("engine-backed fit answers", () => {
  it.each(["nl", "en"] as const)("renders exact engine outputs with %s formatting", locale => {
    const number = (value: number) => new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", {
      maximumFractionDigits: 1,
    }).format(value);
    const mm = (value: number) => `${number(value)} mm`;
    const range = (value: { min: number; max: number }) => `${number(value.min)}–${number(value.max)} mm`;
    const fit = runBikeFitCalculation(FIT_ANSWER_EXAMPLE).fitResult;
    const saddle = runSaddleHeightCalculation(FIT_ANSWER_EXAMPLE);
    const frame = runFrameSizeCalculation(FIT_ANSWER_EXAMPLE);
    expect(getFitAnswer("bike-fit", locale).example.results.map(row => row.value)).toEqual([
      mm(fit.saddleHeightMm), range(fit.saddleHeightRange), mm(fit.saddleToBarReachMm),
      mm(fit.barDropMm), mm(fit.crankLengthMm),
    ]);
    expect(getFitAnswer("saddle-height", locale).example.results.map(row => row.value))
      .toEqual([mm(saddle.height), range(saddle.range)]);
    expect(getFitAnswer("frame-size", locale).example.results.map(row => row.value))
      .toEqual([frame.estimatedFrameSize, mm(frame.estimatedSaddleHeight)]);
    expect(getFitAnswer("crank-length", locale).example.results.map(row => row.value))
      .toEqual([mm(runCrankLengthCalculation(FIT_ANSWER_EXAMPLE))]);
    for (const tool of tools) {
      const answer = getFitAnswer(tool, locale);
      expect(answer.example.inputs).toContainEqual({
        label: answersFit[locale].labels.inseam, value: `${number(FIT_ANSWER_EXAMPLE.inseamCm)} cm`,
      });
      expect(answer.answer.length).toBeGreaterThan(80);
      expect(answer.method.length).toBeGreaterThan(80);
      expect(answer.limits.length).toBeGreaterThan(80);
      expect(answer.mistakes).toHaveLength(3);
    }
    expect(getFitAnswer("bike-fit", locale).example.inputs).toContainEqual({
      label: answersFit[locale].labels.missing, value: answersFit[locale].labels.notProvided,
    });
  });
  it("keeps translated keys aligned and explains the frame table's actual inputs", () => {
    expect(Object.keys(answersFit.nl.labels)).toEqual(Object.keys(answersFit.en.labels));
    expect(Object.keys(answersFit.nl.tools)).toEqual(Object.keys(answersFit.en.tools));
    expect(getFitAnswer("frame-size", "nl").method).toContain("het verandert deze maattabel niet");
    expect(getFitAnswer("frame-size", "en").method).toContain("it does not change this sizing table");
    expect(getFitAnswer("saddle-height", "nl").example.inputs.map(row => row.value)).toContain("84,5 cm");
    expect(getFitAnswer("saddle-height", "en").example.inputs.map(row => row.value)).toContain("84.5 cm");
  });
});
