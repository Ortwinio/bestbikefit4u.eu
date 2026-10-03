import type { Locale } from "@/i18n/config";
import { performanceAnswerMessages } from "@/i18n/calculators/answersPerformance";
import { bikeDefaults, climbPlan, ftpEstimate, fuelHydration, speedAtPower } from "@/lib/public-calculators/performance";
import type { CalculatorAnswerContent } from "./types";

export type PerformanceAnswerTool = "power-speed" | "climb-planner" | "ftp-wkg" | "fuel-hydration";
export const performanceExamples = {
  speed: { riderMassKg: 75, bikeMassKg: 8.5, bike: "road", surface: "road", gradientPct: 0, power: 200 },
  climb: { distanceKm: 5, gradientPct: 7, ftpWatts: 200, riderMassKg: 75, bike: "road" },
  ftp: { method: "twentyMinute", watts: 250, riderMassKg: 75 },
  fuel: { durationHours: 2, temperatureC: 20, sweat: "medium", bottleSizeMl: 750 },
} as const;

export function getPerformanceAnswer(tool: PerformanceAnswerTool, locale: Locale): CalculatorAnswerContent {
  const copy = performanceAnswerMessages[locale];
  const label = copy.labels;
  const number = (value: number) => new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    maximumFractionDigits: 2,
  }).format(value);
  const row = (name: string, value: number, unit: string) => ({ label: name, value: `${number(value)} ${unit}` });
  let example: CalculatorAnswerContent["example"];
  if (tool === "power-speed") {
    const input = performanceExamples.speed;
    const result = speedAtPower(input, input.power);
    example = {
      inputs: [row(label.rider, input.riderMassKg, "kg"), row(label.bikeMass, input.bikeMassKg, "kg"),
        { label: label.bike, value: label.road }, row(label.gradient, input.gradientPct, "%"),
        row(label.power, input.power, "W")],
      results: [row(label.speed, result.speedKmh, "km/h")],
    };
  } else if (tool === "climb-planner") {
    const input = performanceExamples.climb;
    const result = climbPlan(input);
    example = {
      inputs: [row(label.rider, input.riderMassKg, "kg"),
        row(label.bikeMass, bikeDefaults(input.bike).bikeMassKg, "kg"), { label: label.bike, value: label.road },
        row(label.distance, input.distanceKm, "km"), row(label.gradient, input.gradientPct, "%"),
        row(label.ftp, input.ftpWatts, "W")],
      results: [row(label.power, result.targetPowerWatts, "W"), row(label.speed, result.speedKmh, "km/h"),
        ...(result.minutes === null ? [] : [row(label.time, result.minutes, label.minute)])],
    };
  } else if (tool === "ftp-wkg") {
    const input = performanceExamples.ftp;
    const result = ftpEstimate(input.method, input.watts, input.riderMassKg);
    example = {
      inputs: [{ label: label.method, value: label.twentyMinute }, row(label.testPower, input.watts, "W"),
        row(label.rider, input.riderMassKg, "kg")],
      results: [row(label.ftp, result.ftpWatts, "W"), row(label.wattsPerKg, result.wattsPerKg, "W/kg")],
    };
  } else {
    const input = performanceExamples.fuel;
    const result = fuelHydration(input);
    const range = (name: string, value: { min: number; max: number }, unit: string) => ({
      label: name, value: `${number(value.min)}–${number(value.max)} ${unit}`,
    });
    example = {
      inputs: [row(label.duration, input.durationHours, label.hour), row(label.temperature, input.temperatureC, "°C"),
        { label: label.sweat, value: label.medium }, row(label.bottle, input.bottleSizeMl, "ml")],
      results: [
        ...(result.carbohydrate.gramsPerHour === null ? [] : [row(label.carbs, result.carbohydrate.gramsPerHour, "g/h")]),
        range(label.fluid, result.fluidLitresPerHour, "L/h"), range(label.totalFluid, result.totalFluidLitres, "L"),
        ...(result.sodiumMgPerLitre ? [range(label.sodium, result.sodiumMgPerLitre, "mg/L")] : []),
      ],
    };
  }
  return { ...copy[tool], example };
}
