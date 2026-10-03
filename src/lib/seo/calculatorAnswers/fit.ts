import type { Locale } from "@/i18n/config";
import { answersFit, type FitAnswerTool } from "@/i18n/calculators/answersFit";
import {
  runBikeFitCalculation, runCrankLengthCalculation, runFrameSizeCalculation, runSaddleHeightCalculation,
} from "@/lib/public-calculators/fitAdapters";
import type { CalculatorAnswerContent } from "./types";

/** Fixed illustrative inputs, never browser or account data. Outputs are calculated on the server. */
export const FIT_ANSWER_EXAMPLE = {
  heightCm: 178, inseamCm: 84.5, category: "road", ridingGoal: "balanced",
  flexibility: 3, coreStability: 3, inseamSource: "measured",
} as const;

export function getFitAnswer(tool: FitAnswerTool, locale: Locale): CalculatorAnswerContent {
  const copy = answersFit[locale];
  const labels = copy.labels;
  const input = FIT_ANSWER_EXAMPLE;
  const number = (value: number) => new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    maximumFractionDigits: 1,
  }).format(value);
  const mm = (value: number) => `${number(value)} mm`;
  const range = (value: { min: number; max: number }) => `${number(value.min)}–${number(value.max)} mm`;
  const inputs = [
    ...(tool === "bike-fit" || tool === "frame-size" ? [{ label: labels.height, value: `${number(input.heightCm)} cm` }] : []),
    { label: labels.inseam, value: `${number(input.inseamCm)} cm` },
    { label: labels.category, value: labels.road },
    ...(tool === "bike-fit" || tool === "saddle-height" ? [
      { label: labels.goal, value: labels.balanced },
      { label: labels.flexibility, value: number(input.flexibility) },
      { label: labels.core, value: number(input.coreStability) },
    ] : []),
    ...(tool === "bike-fit" ? [{ label: labels.missing, value: labels.notProvided }] : []),
  ];
  let results: { label: string; value: string }[];
  switch (tool) {
    case "bike-fit": {
      const { fitResult } = runBikeFitCalculation(input);
      results = [
        { label: labels.saddle, value: mm(fitResult.saddleHeightMm) },
        { label: labels.saddleRange, value: range(fitResult.saddleHeightRange) },
        { label: labels.reach, value: mm(fitResult.saddleToBarReachMm) },
        { label: labels.drop, value: mm(fitResult.barDropMm) },
        { label: labels.crank, value: mm(fitResult.crankLengthMm) },
      ];
      break;
    }
    case "saddle-height": {
      const result = runSaddleHeightCalculation(input);
      results = [{ label: labels.saddle, value: mm(result.height) },
        { label: labels.saddleRange, value: range(result.range) }];
      break;
    }
    case "frame-size": {
      const result = runFrameSizeCalculation(input);
      results = [{ label: labels.frame, value: result.estimatedFrameSize },
        { label: labels.quickSaddle, value: mm(result.estimatedSaddleHeight) }];
      break;
    }
    case "crank-length":
      results = [{ label: labels.crank, value: mm(runCrankLengthCalculation(input)) }];
      break;
  }
  return { ...copy.tools[tool], example: { inputs, results } };
}
