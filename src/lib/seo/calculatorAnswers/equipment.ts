import type { Locale } from "@/i18n/config";
import { equipmentAnswerMessages } from "@/i18n/calculators/answersEquipment";
import { calculateSaddleWidth, type SaddleWidthInput } from "@/lib/saddle-width-engine";
import { calculateBasicPressure, type BasicPressureInput } from "@/lib/pressure-engine";
import { calculateGearing, type GearingCalculatorInput } from "@/app/(public)/calculators/gearing/gearing-engine";
import type { CalculatorAnswerContent } from "./types";

export const equipmentExamples = {
  saddle: { inputMethod: "measured", sitBoneWidthMm: 125,
    ridingType: "endurance_road", postureCategory: "balanced" } satisfies SaddleWidthInput,
  gearing: { drivetrainType: "2x", outerChainringTeeth: 50, innerChainringTeeth: 34,
    cassetteSmallestCogTeeth: 11, cassetteLargestCogTeeth: 34, wheelCircumferenceMm: 2105,
    cadenceRpm: 80, gradientPct: 8, bikeType: "road", climbBand: "medium" } satisfies GearingCalculatorInput,
  pressure: { discipline: "road", bodyWeightKg: 75, bikeWeightKg: 8, widthFrontMm: 28, widthRearMm: 28,
    tubeType: "tubeless", surface: "average_asphalt", ridingGoal: "balance" } satisfies BasicPressureInput,
};
export type EquipmentAnswerTool = "saddle-width" | "gearing" | "tire-pressure";
export function getEquipmentAnswer(tool: EquipmentAnswerTool, locale: Locale): CalculatorAnswerContent {
  const copy = equipmentAnswerMessages[locale];
  const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  const rows = (labels: string[], values: string[]) => values.map((value, index) => ({ label: labels[index], value }));
  if (tool === "saddle-width") {
    const input = equipmentExamples.saddle;
    const result = calculateSaddleWidth(input);
    const text = copy.saddle;
    const width = number(result.finalRecommendedWidthMm);
    const range = `${number(result.widthRangeMinMm)}–${number(result.widthRangeMaxMm)}`;
    return { ...text, answer: text.answer.replace("{width}", width).replace("{range}", range), example: {
      inputs: rows(text.labels, [text.values[0], `${input.sitBoneWidthMm} mm`, text.values[1], text.values[2]]),
      results: rows(text.labels.slice(4), [`${width} mm`, `${range} mm`]),
    } };
  }
  if (tool === "gearing") {
    const input = equipmentExamples.gearing;
    const result = calculateGearing(input, locale === "nl");
    const text = copy.gearing;
    const ratio = number(result.easiest.ratio);
    const speed = number(result.easiest.speedKmh);
    return { ...text, answer: text.answer.replace("{ratio}", ratio).replace("{speed}", speed)
      .replace("{chainrings}", `${input.outerChainringTeeth}/${input.innerChainringTeeth}`)
      .replace("{cassette}", `${input.cassetteSmallestCogTeeth}–${input.cassetteLargestCogTeeth}`)
      .replace("{cadence}", number(input.cadenceRpm)), example: {
      inputs: rows(text.labels, [input.drivetrainType, `${input.outerChainringTeeth}/${input.innerChainringTeeth}`,
        `${input.cassetteSmallestCogTeeth}–${input.cassetteLargestCogTeeth}`, `${input.wheelCircumferenceMm} mm`,
        `${input.cadenceRpm} rpm`, text.values[0], `${input.gradientPct}%`, text.values[1]]),
      results: rows(text.labels.slice(8), [ratio, `${number(result.easiest.developmentMeters)} m`,
        `${speed} ${locale === "nl" ? "km/u" : "km/h"}`]),
    } };
  }
  const input = equipmentExamples.pressure;
  const result = calculateBasicPressure(input);
  const text = copy.pressure;
  const front = number(result.frontBar);
  const rear = number(result.rearBar);
  return { ...text, answer: text.answer.replace("{front}", front).replace("{rear}", rear), example: {
    inputs: rows(text.labels, [`${input.bodyWeightKg} kg`, `${input.bikeWeightKg} kg`,
      `${input.widthFrontMm} / ${input.widthRearMm} mm`, ...text.values]),
    results: rows(text.labels.slice(8), [`${front} bar`, `${rear} bar`]),
  } };
}
